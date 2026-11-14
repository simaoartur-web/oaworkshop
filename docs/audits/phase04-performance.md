# O+A Workspace — Auditoria de Desempenho e Arquitetura (Fase 04)

- **Agente:** Gemini C (Performance, Arquitetura & Eficiência Técnica)
- **Branch de auditoria:** `codex/f04-performance-audit`
- **Branch base / Referência:** `codex/f02-integration-preview` (`b91b056ddcb278234e2378f595bc4255f3ee77d0`)
- **Data da recolha empírica:** `2026-11-14T10:51:03Z`
- **Estado:** Concluído (Auditoria e Preparação — sem alteração prematura de código de produção enquanto os Agentes A e B trabalham)

---

## Sumário Executivo

A aplicação **O+A Workspace** apresenta, no fecho da Fase 03 (`b91b056`), uma base funcional sólida (`61/61` testes Vitest aprovados e `0` erros de lint), mas opera atualmente sob uma **arquitetura de bundle monolítico (`810.54 kB` raw / `227.25 kB` gzip num único ficheiro JS)** e **persistência síncrona sem cache em memória sobre `localStorage`**.

As medições empíricas realizadas em Chromium (via `playwright-core` e Chrome DevTools Protocol) revelaram quatro estrangulamentos estruturais que têm de ser corrigidos na integração da Fase 04:

1. **Ausência total de Code-Splitting (`P0` para a chegada do Three.js):** Embora `src/app/App.tsx` envolva as rotas em `<Suspense>`, todas as 9 páginas da aplicação são importadas estaticamente no topo do ficheiro e `vite.config.ts` não define `manualChunks`. Além disso, `src/app/WorkspaceSessionContext.tsx` importa estaticamente a camada de repositórios e fixtures (`~82 kB`) e ambos os dicionários de idioma. Se o motor Three.js da Fase 04 for integrado sem isolamento assíncrono (`React.lazy`), o bundle inicial em `/login` subirá para **`1.45 MB – 1.95 MB` raw (`385 kB – 535 kB` gzip)**.
2. **Amplificação de Leituras/Parsing de `localStorage` e Degradação Linear na Pesquisa Global (`P1`):**
   - `GlobalSearchDialog.tsx` invoca `searchWorkspaceDemo(query, language)` a cada tecla premida, reconstruindo todo o índice e relendo/validando `oa_workspace_project_library_v1` a partir do `localStorage` **em cada tecla** (`11` leituras e `11` `JSON.parse` em 10 teclas). Com 50 projetos no `localStorage` (`282.83 kB`), o tempo médio por tecla sobe de `33.69 ms` para **`105.92 ms`** (ultrapassando o limiar RAIL de `100 ms`).
   - `useProjectLibrary.ts` executa `listProjects()` **duas vezes** no arranque e em cada atualização (`projects` + `studioDeskProjects`). Em `ProjectDossierShellPage.tsx`, `getProject(id)` é chamado diretamente no corpo de renderização (sem `useMemo`), provocando uma **3.ª leitura completa** do `localStorage` e `27 a 30` chamadas a `JSON.parse` (devido a `cloneRecord` com `JSON.parse(JSON.stringify(...))`). Com 200 projetos (`1.17 MB`), abrir um único dossier demora **`455.41 ms`** (`3.6×` mais lento que o baseline de `127.05 ms`).
   - Guardar uma edição de ficha técnica (`updateProjectMetadata`) provoca **`6` leituras síncronas** de `oa_workspace_project_library_v1` para `1` escrita.
3. **Trabalho Síncrono Redundante na Main Thread durante Renderizações React (`P1`):**
   - `src/utils/timeGreeting.ts` instancia `4 a 8` novos objetos `Intl.DateTimeFormat` em cada renderização do `ContextualHeader`, `WelcomePage`, `LoginPage` e `StudioOpening`. Num micro-benchmark V8 em Chromium (`500` iterações), reutilizar instâncias `Intl.DateTimeFormat` em cache ao nível do módulo reduz o custo de `287.40 ms` (`0.575 ms/render`) para **`13.30 ms` (`0.0266 ms/render`) — um ganho de `21.6×`**.
   - Na Mesa de Trabalho (`/workspace`), `FeaturedProjectPlate.tsx` e `ProjectOverviewPanel.tsx` forçam `loading="eager" decoding="sync"` em **5 de 6 imagens `.webp`** (`1376×768` e `1200×670`), bloqueando a thread principal com decodificação síncrona de bitmaps.
4. **Riscos Críticos de GPU, VRAM e `localStorage` na Chegada do Motor 3D (`P0`):**
   - Recursos WebGL (`BufferGeometry`, `Material`, `Texture`, `WebGLRenderTarget`, `DRACOLoader` workers) não são geridos pelo Garbage Collector do JavaScript. Sem um contrato estrito de `dispose()` recursivo ao desmontar `/workspace/projects/:id/model` e sem renderização sob procura (*render-on-demand*), dispositivos modestos sofrerão exaustão de VRAM, drenagem de bateria e perda de contexto (`webglcontextlost`, cujo limite no Chromium é de 16 contextos ativos).

---

## 1. Baseline de Desempenho

### 1.1 Condições, Ferramentas e Metodologia de Medição

| Parâmetro | Valor / Especificação Registada |
|---|---|
| **Sistema Operativo / Arquitetura** | Windows (`win32-x64`) |
| **Runtime Node.js** | `v24.13.0` |
| **Toolchain de Build & Testes** | TypeScript `5.9.3`, Vite `7.3.7`, Vitest `3.2.7`, Tailwind CSS `4.2.1` |
| **Motor de Browser para Runtime** | Chromium Headless via `playwright-core` `1.58.2` + protocolo CDP (`Performance.getMetrics`, `HeapProfiler.collectGarbage`) |
| **Viewport de Teste** | `1440 × 900 px` (`deviceScaleFactor: 1`) |
| **Compressão Medida** | `zlib.gzipSync` (nível 9) + `zlib.brotliCompressSync` (qualidade máxima predefinida) + gzip reportado pelo Vite |
| **Instrumentação de Runtime** | Interceção determinística via `context.addInitScript` sobre `Storage.prototype.getItem`, `Storage.prototype.setItem`, `JSON.parse` e `Intl.DateTimeFormat` |

#### Limitações explícitas das medições
1. **Rede Loopback (`127.0.0.1:4197`):** As medições de runtime foram executadas contra `vite preview` local sem *throttling* artificial de rede móvel para isolar com precisão o tempo de CPU, layout, DOM e armazenamento síncrono.
2. **Latência externa de fontes no arranque a frio:** No carregamento inicial de `/login` com `waitUntil: 'networkidle'`, o pedido externo a `fonts.googleapis.com` demorou `1,047.40 ms` e a negociação local inicial (`TTFB`) registou `2,001.00 ms`, elevando o `FCP` a frio para `3,520.00 ms`. As transições subsequentes SPA (`140 ms – 246 ms`) e as durações de `ScriptDuration` / `LayoutDuration` via CDP refletem o desempenho intrínseco da aplicação sem interferência de rede externa.
3. **Projeções do Motor 3D:** Cumprindo a regra de não instalar nem atualizar dependências gráficas nesta etapa, os valores de impacto do Three.js / WebGL baseiam-se nas dimensões oficiais de distribuição do `three` (`r170+`) e no cálculo exato de ocupação de buffers em VRAM.

---

### 1.2 Baseline de Compilação, Qualidade e Bundle de Produção (`dist/`)

- **`npm run lint`:** `0` erros, `0` avisos.
- **`npm run test`:** `7` ficheiros de teste (`61` testes aprovados) em `38.99 s` de relógio (`transform 3.52 s`, `setup 11.42 s`, `collect 41.36 s`, `tests 62.59 s`, `environment 54.37 s`).
- **`npm run build`:** concluído em `14.54 s` (`2,205` módulos transformados pelo Vite). Emite aviso de chunk acima de `500 kB`.

#### Artefactos gerados em `dist/`

| Ficheiro (`dist/`) | Tipo | Raw (Bytes) | Raw (kB / KiB) | Gzip Nível 9 (KiB) | Brotli (KiB) | Notas |
|---|---|---:|---:|---:|---:|---|
| `assets/index-D-jY1y0Z.js` | JS (Monolítico) | `810,539` | `810.54 kB` (`791.54 KiB`) | `221.25 KiB` (`227.25 kB` Vite) | `183.09 KiB` | **100% do JS da app num único chunk** (`> 500 kB` warning) |
| `assets/index-BqJR3YWo.css` | CSS | `59,253` | `59.25 kB` (`57.86 KiB`) | `10.11 KiB` (`10.45 kB` Vite) | `8.32 KiB` | Tokens O+A + utilitários Tailwind v4 |
| `index.html` | HTML | `1,004` | `1.00 kB` (`0.98 KiB`) | `0.54 KiB` | `0.37 KiB` | Inclui stylesheet bloqueante do Google Fonts |
| `assets/studio-desk/materials-climate-study.webp` | Imagem (`1200×670`) | `148,224` | `148.22 kB` (`144.75 KiB`) | `144.82 KiB` | `144.75 KiB` | Estudo de materiais (Studio Desk / Biblioteca) |
| `assets/studies/login-spatial-study.webp` | Imagem (`896×1200`) | `92,304` | `92.30 kB` (`90.14 KiB`) | `90.19 KiB` | `90.15 KiB` | Estudo espacial (`/login` + card de projeto) |
| `assets/studio-desk/featured-atelier-maquette.webp` | Imagem (`1376×768`) | `80,582` | `80.58 kB` (`78.69 KiB`) | `78.74 KiB` | `78.70 KiB` | Maquete principal (`/workspace` + Biblioteca) |
| `assets/studio-desk/urban-waterfront-study.webp` | Imagem (`1200×670`) | `80,282` | `80.28 kB` (`78.40 KiB`) | `78.43 KiB` | `78.41 KiB` | Estudo frente ribeirinha |
| `assets/studies/welcome-maquette-study.webp` | Imagem (`1200×750`) | `51,814` | `51.81 kB` (`50.60 KiB`) | `50.64 KiB` | `50.60 KiB` | Maquete da folha `/welcome` |
| `logo.png` | Imagem (`692×511`) | `23,126` | `23.13 kB` (`22.58 KiB`) | `21.42 KiB` | `21.30 KiB` | Monograma O+A (`692×511` renderizado a `28–36 px`) |
| `favicon.png` | Imagem | `4,569` | `4.57 kB` (`4.46 KiB`) | `4.21 KiB` | `4.19 KiB` | Ícone de separador |
| **Total `dist/`** | **Todos** | **`1,351,697`** | **`1,351.70 kB` (`1,320.00 KiB`)** | **`700.35 KiB`** | **`659.88 KiB`** | — |

---

### 1.3 Decomposição do Bundle por Domínio (Análise do Grafo Rollup)

A inspeção programática do hook `generateBundle` do Rollup contabilizou **`396` módulos empacotados**, somando **`1,944,588` bytes (`1,899.01 KiB`) de código renderizado pré-minificação final**, distribuídos da seguinte forma:

| Domínio / Categoria | Módulos | Tamanho Renderizado Rollup (Bytes) | Tamanho Renderizado (KiB) | Quota do Bundle (%) |
|---|---:|---:|---:|---:|
| `vendor:react+react-dom+scheduler` | 24 | `686,268` | `670.18 KiB` | **35.29%** |
| `vendor:framer-motion` (`framer-motion` + `motion-dom` + `motion-utils`) | 259 | `387,500` | `378.42 KiB` | **19.93%** |
| `app:features/project-experience` (Dossier, Wizard, Galeria, Helpers) | 4 | `204,467` | `199.67 KiB` | **10.51%** |
| `app:features/studio-desk` (Mesa de Trabalho + Dossier Modal) | 9 | `147,400` | `143.95 KiB` | **7.58%** |
| `app:src/data` (Repositórios + Fixtures + Adaptadores) | 5 | `99,861` | `97.52 KiB` | **5.14%** |
| `vendor:react-router` (`react-router` + `react-router-dom`) | 1 | `88,685` | `86.61 KiB` | **4.56%** |
| `app:i18n+locales` (4 sistemas de dicionários PT+EN) | 6 | `87,363` | `85.32 KiB` | **4.49%** |
| `app:features/workspace-shell` (Shell, Rail, Header, Search, Notifications) | 9 | `79,911` | `78.04 KiB` | **4.11%** |
| `app:core+design-system+utils` (`App`, `Context`, `DesignSystem`, `timeGreeting`) | 10 | `34,099` | `33.30 KiB` | **1.75%** |
| `app:features/welcome` (`WelcomePage.tsx`) | 1 | `30,338` | `29.63 KiB` | **1.56%** |
| `app:features/workspace` (`PlannedModuleView`, `WorkspaceSettingsPage`) | 2 | `29,675` | `28.98 KiB` | **1.53%** |
| `vendor:lucide-react` (58 ícones SVG individuais) | 58 | `26,947` | `26.32 KiB` | **1.39%** |
| `app:features/auth-demo` (`LoginPage.tsx`) | 1 | `26,445` | `25.83 KiB` | **1.36%** |
| `app:features/project-library` (Páginas Shell, Hook e Contrato) | 5 | `14,461` | `14.12 KiB` | **0.74%** |
| `other` (Helpers Vite/Rollup) | 2 | `1,168` | `1.14 KiB` | **0.06%** |
| **Total** | **396** | **`1,944,588`** | **`1,899.01 KiB`** | **100.00%** |

#### Top 15 Maiores Módulos da Aplicação (`src/`) no Bundle Atual

| # | Módulo (`src/`) | Bytes Renderizados | KiB Renderizados | Bytes Originais |
|---:|---|---:|---:|---:|
| 1 | `src/features/project-experience/ProjectDossierView.tsx` | `93,435` | `91.25 KiB` | `77,204` |
| 2 | `src/features/project-experience/ProjectCreationWizard.tsx` | `65,881` | `64.34 KiB` | `54,720` |
| 3 | `src/data/studioDeskFixtures.ts` | `41,181` | `40.22 KiB` | `43,690` |
| 4 | `src/features/project-experience/ProjectGalleryView.tsx` | `40,022` | `39.08 KiB` | `34,814` |
| 5 | `src/data/projectLibraryRepository.ts` | `33,799` | `33.01 KiB` | `40,758` |
| 6 | `src/features/studio-desk/StudioDeskPage.tsx` | `32,117` | `31.36 KiB` | `34,260` |
| 7 | `src/features/project-experience/i18n.ts` | `30,979` | `30.25 KiB` | `32,818` |
| 8 | `src/features/welcome/WelcomePage.tsx` | `30,338` | `29.63 KiB` | `24,269` |
| 9 | `src/features/studio-desk/ProjectOverviewPanel.tsx` | `28,106` | `27.45 KiB` | `25,280` |
| 10 | `src/features/auth-demo/LoginPage.tsx` | `26,445` | `25.83 KiB` | `21,977` |
| 11 | `src/features/studio-desk/ProjectDossierDialog.tsx` | `23,981` | `23.42 KiB` | `20,429` |
| 12 | `src/features/studio-desk/i18n.ts` | `17,469` | `17.06 KiB` | `18,780` |
| 13 | `src/features/workspace-shell/ArchitecturalRail.tsx` | `16,076` | `15.70 KiB` | `17,205` |
| 14 | `src/features/studio-desk/PrioritiesPanel.tsx` | `15,643` | `15.28 KiB` | `15,233` |
| 15 | `src/features/workspace/PlannedModuleView.tsx` | `15,186` | `14.83 KiB` | `12,916` |

---

### 1.4 Baseline de Runtime, Memória e Operações Síncronas (Chromium + CDP)

Medições reais recolhidas ao percorrer o fluxo completo da aplicação em Chromium (`1440×900`) com 5 projetos canónicos base:

| Etapa / Transição Medida | Duração (`ms`) | JS Heap Usado (`MB`) | Nós DOM (`Nodes`) | Event Listeners | `localStorage.getItem` | `localStorage.setItem` | Chamadas `JSON.parse` | Chamadas `new Intl.DateTimeFormat` |Layout / Style Recalc (Acum.) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **1. Cold Load `/login`** (`networkidle`) | `4,387.18` *(FCP `3,520.0`, DCL `3,147.6`, Script `82.43`)* | `3.01 MB` | `291` | `175` | `2` | `0` | `0` | `3` | `6` / `11` |
| **2. `/login` → `/welcome`** (Submit) | `200.35 ms` | `5.04 MB` | `543` | `222` | `0` | `1` | `2` | `8` | `9` / `22` |
| **3. `/welcome` → `/workspace`** (Studio Desk) | `1,193.92 ms` | `6.56 MB` | `1,644` | `307` | `3` | `0` | `25` | `5` | `16` / `65` |
| **4. `/workspace` → `/workspace/projects`** (Biblioteca) | `167.96 ms` | `6.42 MB` | `2,118` | `364` | **`2`** | `0` | **`27`** | `3` | `22` / `80` |
| **5. `/workspace/projects` → `/workspace/projects/:id`** (Dossier) | `182.28 ms` | `6.42 MB` | `2,323` | `404` | **`3`** | `0` | **`27`** | `3` | `23` / `93` |
| **6. Editar e Guardar Ficha Técnica no Dossier** | `211.26 ms` | `7.22 MB` | `2,498` | `461` | **`6`** | `1` | `3` | `0` | `27` / `113` |
| **7. Dossier → Biblioteca → `/workspace/projects/new`** | `246.70 ms` | `7.45 MB` | `3,149` | `555` | **`4`** | `0` | **`58`** | `6` | `29` / `130` |
| **8. Pesquisa Global (`Ctrl+K`) — 10 teclas (`"c"`..`"casa patio"`)** | `687.51 ms` | `10.23 MB` | `3,731` | `807` | **`11`** | `0` | **`11`** | `6` | `58` / `170` |

---

## 2. Investigação Técnica nos 8 Eixos da Missão

### 2.1 Bundle JavaScript Inicial e Oportunidades de Code-Splitting

1. **Monólito de `810.54 kB` (`221.25 KiB` gzip):**
   Um visitante que acede apenas a `/login` descarrega, analisa e compila `810.54 kB` de JavaScript, incluindo `ProjectDossierView.tsx` (`91.25 KiB`), `ProjectCreationWizard.tsx` (`64.34 KiB`), `ProjectGalleryView.tsx` (`39.08 KiB`), `StudioDeskPage.tsx` (`31.36 KiB`), `studioDeskFixtures.ts` (`40.22 KiB`), `projectLibraryRepository.ts` (`33.01 KiB`) e 4 ficheiros de dicionários bilingues (`85.32 KiB`).
2. **Simulação Empírica de `manualChunks` (Medida em Memória no Vite):**
   Executámos uma build programática com separação explícita de chunks de fornecedores (`vendorSplitSimulation`), obtendo os seguintes tamanhos reais:

   | Chunk Simulado (`manualChunks`) | Conteúdo | Raw (KiB) | Gzip Nível 9 (KiB) | Brotli (KiB) |
   |---|---|---:|---:|---:|
   | `vendor-react` | `react`, `react-dom`, `scheduler` | `216.52 KiB` | `67.21 KiB` | `58.06 KiB` |
   | `vendor-motion` | `framer-motion`, `motion-dom`, `motion-utils` | `119.87 KiB` | `39.06 KiB` | `35.03 KiB` |
   | `vendor-router` | `react-router`, `react-router-dom` | `38.28 KiB` | `13.78 KiB` | `12.40 KiB` |
   | `vendor-icons` | `lucide-react` | `11.19 KiB` | `4.12 KiB` | `3.54 KiB` |
   | `index` (Código da App sem route-splitting) | Restante código `src/` | `404.75 KiB` | `97.07 KiB` | `75.35 KiB` |

3. **Acoplamento Estático em `src/app/WorkspaceSessionContext.tsx`:**
   Nas linhas 13–24 de `WorkspaceSessionContext.tsx`, o contexto raiz importa estaticamente:
   - `clearProjectLibraryLocalState` de `../data/projectLibraryRepository` (que por sua vez importa `projectLibraryAdapter.ts` e `studioDeskFixtures.ts`);
   - `clearStudioDeskLocalState` de `../data/studioDeskFixtures`;
   - `resetShellLocalState` de `../features/workspace-shell/shellDemoState`.
   Como `WorkspaceSessionProvider` envolve toda a aplicação (incluindo `/login`), estas importações estáticas puxam **`~82 KiB` de dados e repositórios de projetos** para o chunk de entrada, mesmo que as rotas sejam convertidas para `React.lazy()`.
   - **Solução:** Mover as funções de limpeza de chaves de `localStorage` (`oa_workspace_project_library_v1`, `oa_workspace_studio_desk_v1`, `oa_workspace_shell_rail_v1`, `oa_workspace_demo_notifications_v1`) diretamente para `src/data/sessionRepository.ts` (que já detém `resetDemoWorkspaceState()`) ou carregá-las dinamicamente apenas quando `resetAllDemoData()` for invocado.

---

### 2.2 Lazy Loading das Rotas e Módulos Pesados

1. **`src/app/App.tsx` tem `<Suspense>` inoperante:**
   As linhas 7–15 de `src/app/App.tsx` importam todas as páginas com `import { ... } from ...` estático, tornando o `<Suspense fallback={<RouteLoadingFallback />}>` da linha 60 ineficaz em produção (`0` chamadas `React.lazy` em todo o repositório).
2. **Mapa de Divisão Assíncrona de Rotas e Modais Recomendado:**
   - **Chunk Inicial (`/login` + Core):** `App.tsx`, `WorkspaceSessionContext.tsx` (desacoplado de fixtures de projetos), `sessionRepository.ts`, `LoginPage.tsx` (ou `React.lazy` por rota).
   - **Chunk `/welcome`:** `React.lazy(() => import('../features/welcome/WelcomePage'))`.
   - **Chunk `/workspace` (Shell + Studio Desk):** `WorkspaceShell`, `StudioDeskPage`.
   - **Chunk `/workspace/projects` (Catálogo):** `ProjectLibraryCatalogPage` + `ProjectGalleryView`.
   - **Chunk `/workspace/projects/new` (Wizard):** `ProjectCreateEnginePage` + `ProjectCreationWizard` (`64.34 KiB` poupados até o utilizador clicar em "Novo projecto").
   - **Chunk `/workspace/projects/:id` (Dossier):** `ProjectDossierShellPage` + `ProjectDossierView` (`91.25 KiB` carregados apenas ao abrir um dossier).
   - **Chunk `/workspace/projects/:id/model` (Motor 3D — Fase 04):** **Obrigatório `React.lazy`** isolando `three`, loaders (`GLTFLoader`, `DRACOLoader`), controlos e o canvas WebGL.
   - **Modais secundários:** `ProjectDossierDialog.tsx` (`23.42 KiB`, aberto apenas por ação em `StudioDeskPage`) e `GlobalSearchDialog.tsx` (`12.69 KiB` + `globalSearchIndex.ts` `5.98 KiB`, aberto apenas via `Ctrl+K` / botão de pesquisa) devem ser carregados via `React.lazy` quando `open === true`.
3. **Otimização de `framer-motion` (`119.87 KiB` minificado / `39.06 KiB` gzip):**
   - Em `src/features/studio-desk/StudioDeskPage.tsx` (linha 1), `motion` é importado de `'framer-motion'` mas **nunca é referenciado no JSX** (apenas `useReducedMotion` é usado nesse ficheiro).
   - Apenas 3 componentes usam animações simples de entrada (`opacity` e `y`): `LoginPage.tsx`, `WelcomePage.tsx` e `StudioOpening.tsx`. Nenhum usa *layout projection* ou *drag gestures* — porém, `motion-dom/dist/es/projection/node/create-projection-node.mjs` (`70.36 KiB` renderizados) e `VisualElementDragControls.mjs` (`23.45 KiB` renderizados) estão incluídos no bundle porque é usado `<motion.*>` completo em vez de `<LazyMotion features={domAnimation}>` com `<m.*>`.

---

### 2.3 Renderizações React Desnecessárias e Trabalho na Main Thread

1. **Instanciação de `Intl.DateTimeFormat` em cada renderização (`src/utils/timeGreeting.ts`):**
   - `getZonedDateTimeParts()` (linhas 19–25), `formatStudioClocks()` (linhas 68–80) e `formatEditorialDate()` (linhas 99–107) executam `new Intl.DateTimeFormat(...)` a cada chamada.
   - `ContextualHeader.tsx` (linha 87) chama `formatStudioClocks()` diretamente no corpo do componente; `WelcomePage.tsx` (linhas 56–58) e `StudioOpening.tsx` (linhas 40–42) chamam as três funções (`8` instâncias `Intl.DateTimeFormat` criadas numa única transição para `/welcome`).
   - **Medição empírica V8 (Chromium):** `500` ciclos de renderização sem cache demoram **`287.40 ms` (`0.575 ms/render`)**; com instâncias `Intl.DateTimeFormat` guardadas num `Map` ao nível do módulo, o custo cai para **`13.30 ms` (`0.0266 ms/render`) — `21.6×` mais rápido**.
2. **Re-renderização Global via `WorkspaceSessionContext.tsx`:**
   - O valor do contexto (`useMemo` nas linhas 175–196) combina estado de sessão, perfil, idioma, preferências (`skipWelcomeOnLogin`, `reduceMotionOverride`), `demoResetEpoch` e ações. Qualquer alteração de preferência em `/workspace/settings` ou troca de perfil força a re-renderização de toda a árvore `WorkspaceShell` (`ContextualHeader`, `ArchitecturalRail` e página ativa).
3. **Props Não Memoizadas e Leitura Síncrona no Render de `ProjectDossierShellPage.tsx`:**
   - Na linha 42 de `src/features/project-library/ProjectDossierShellPage.tsx`, `const record = getProject(id)` é invocado **diretamente no corpo do render** (fora de `useMemo` e sem usar a coleção já carregada por `useProjectLibrary()`).
   - Nas linhas 92–94, `deskProject = canonicalToStudioDeskProject(record)`, `documents = canonicalToExperienceDocuments(record)` e `revisions = canonicalToExperienceRevisions(record)` são recalculados em **todas** as renderizações, gerando novas referências de arrays/objetos e invalidando `useMemo` internos de `ProjectDossierView.tsx` (`resolvedDocuments` na linha 159 e `resolvedRevisions` na linha 168).
4. **Decodificação Síncrona de Imagens na Mesa de Trabalho (`/workspace`):**
   - A auditoria ao DOM em `/workspace` (`studioDeskImages`) confirmou que **5 de 6 elementos `<img>`** têm `loading="eager"` e **`decoding="sync"`** (`FeaturedProjectPlate.tsx` linhas 76–77 e `ProjectOverviewPanel.tsx` linhas 252–253).
   - Adicionalmente, a mesma imagem `/assets/studio-desk/featured-atelier-maquette.webp` (`1376×768`) é decodificada de forma síncrona duas vezes na mesma página (no `FeaturedProjectPlate` e no primeiro cartão de `ProjectOverviewPanel`).
   - Todas as imagens de cartões abaixo da dobra ou em grelha devem usar `loading="lazy" decoding="async"`, e a imagem de destaque acima da dobra deve usar `loading="eager" decoding="async"`.

---

### 2.4 Consumo de Memória e Possíveis Fugas

1. **Estabilidade de Memória no Fluxo 2D Atual (Teste Empírico de 10 Ciclos Completos com GC Forçado):**
   - Forçando `HeapProfiler.collectGarbage` via CDP antes e depois de 10 ciclos completos (`/workspace` → `/workspace/projects` → `/workspace/projects/:id` → `GlobalSearchDialog` → `/workspace`):
     - **JS Heap Usado:** `6.60 MB` (`6,916,396 B`) → `7.61 MB` (`7,982,564 B`), variação líquida de **`+1.01 MB`** (`~101 kB` por ciclo de 4 navegações + abertura de modal).
     - **Nós DOM (`Nodes`):** `3,196` → `5,646` (`+2,450` nós acumulados antes de recolha completa de árvores DOM desmontadas).
     - **Event Listeners:** `558` → `768` (`+210` listeners).
   - **Causas identificadas para a pressão de alocação (GC churn):**
     - `cloneRecord` em `src/data/projectLibraryRepository.ts` (linha 44) utiliza `JSON.parse(JSON.stringify(record))` em cada projeto retornado por `listProjects()` e `getSeedCanonicalProjects()`, executando `25 a 58` chamadas `JSON.parse` por transição de rota.
     - `scrollHistoryRef.current` em `src/features/workspace-shell/WorkspaceShell.tsx` (linha 48) guarda posições de scroll por `location.key` num objeto sem limite de entradas (cresce indefinidamente com o número de navegações na sessão).
2. **Duplicação de Hooks de Focus Trap e `getComputedStyle` em Eventos de Teclado:**
   - Existem dois hooks quase idênticos no bundle: `src/design-system/useDialogFocusTrap.ts` (`5.23 KiB`) e `src/features/studio-desk/useStudioDeskDialogFocusTrap.ts` (`5.36 KiB`).
   - Ambos invocam `getFocusableElements()` em cada evento `keydown` (`Tab`) e `focusin`, executando `window.getComputedStyle(element)` em todos os elementos interativos do modal, forçando cálculo de estilos na thread principal. Consolidar num único hook (`useDialogFocusTrap.ts`) e verificar `element.offsetParent !== null` antes de `getComputedStyle` reduz código duplicado e custo de layout.

---

### 2.5 Performance da Biblioteca, dos Dossiers e da Pesquisa Global

#### Diagnóstico de Amplificação de Armazenamento (`localStorage`)

| Operação do Utilizador | Ficheiros Envolvidos | Leituras `localStorage.getItem` Medidas | Chamadas `JSON.parse` Medidas | Causa Raiz |
|---|---|---:|---:|---|
| **Abrir Biblioteca (`/workspace/projects`)** | `ProjectLibraryCatalogPage.tsx` → `useProjectLibrary.ts` | **`2`** | **`27–29`** | `useProjectLibrary` chama `listProjects()` para `projects` e `listStudioDeskCompatibleProjects()` (que chama `listProjects()` de novo) para `studioDeskProjects`. |
| **Abrir Dossier (`/workspace/projects/:id`)** | `ProjectDossierShellPage.tsx` → `useProjectLibrary.ts` | **`3`** | **`27–30`** | `useProjectLibrary()` faz 2 leituras + `getProject(id)` chamado no render faz uma 3.ª chamada completa a `listProjects()`. |
| **Guardar Metadados no Dossier** | `ProjectDossierShellPage.tsx` → `projectLibraryRepository.ts` | **`6`** | **`3`+** | `updateProjectMetadata` chama `getProjectById` (#1) → `persistMutatedRecord` chama `loadEnvelope` (#2) → `saveEnvelope` faz leitura de verificação (#3) → evento `PROJECT_LIBRARY_UPDATED_EVENT` dispara `refresh()` (#4 e #5) → re-render chama `getProject(id)` (#6). |
| **Pesquisa Global (`Ctrl+K`, 10 teclas)** | `GlobalSearchDialog.tsx` → `globalSearchIndex.ts` | **`11`** | **`11`** | `useMemo(() => searchWorkspaceDemo(query, language), [query, language])` reconstrói todas as entradas (`buildWorkspaceSearchEntries` → `listProjects()`) em cada tecla premida. |

#### Benchmarks Empíricos de Escala (`5` vs. `50` vs. `200` Projetos em `localStorage`)

Injetámos envelopes canónicos válidos (`oa_workspace_project_library_v1`) com `5`, `50` e `200` projetos completos no Chromium e medimos o comportamento real:

| Métrica Medida | Baseline: 5 Projetos | Escala Média: 50 Projetos | Escala Alta: 200 Projetos | Impacto / Diagnóstico |
|---|---:|---:|---:|---|
| **Tamanho de `oa_workspace_project_library_v1`** | `52 B` *(sem overrides)* | `282,831 B` (`276.20 KiB`) | `1,225,431 B` (`1.17 MiB`) | A 200 projetos, o JSON ocupa ~23% da quota de `5 MB` do `localStorage`. |
| **Montagem do Catálogo (`/workspace/projects`)** | `140.69 ms` | **`698.85 ms`** (`5.0×`) | **`688.69 ms`** (`4.9×`) | Dupla leitura/validação do JSON + renderização não virtualizada de todos os cartões. |
| **Nós DOM no Catálogo (`Nodes`)** | `5,029` | **`10,481`** | **`20,830`** | Cada cartão de projeto adiciona `~105` nós DOM; a 200 projetos ultrapassa `20,000` nós DOM. |
| **Pesquisa Global — 10 Teclas (Total)** | `336.85 ms` | **`1,059.20 ms`** (`3.1×`) | **`923.50 ms`** (`2.7×`) | Re-parse de `localStorage` + normalização NFD de todos os projetos a cada tecla. |
| **Pesquisa Global — Média por Tecla** | `33.69 ms/tecla` | **`105.92 ms/tecla`** | **`92.35 ms/tecla`** | **Excede/toca o limite de `100 ms` de input lag**, bloqueando o cursor durante a digitação. |
| **Montagem de 1 Dossier (`/workspace/projects/:id`)** | `127.05 ms` | **`305.13 ms`** (`2.4×`) | **`455.41 ms`** (`3.6×`) | Abrir **1 único projeto** degrada `3.6×` porque analisa e valida todos os 200 projetos **3 vezes**. |

#### Outras ineficiências na Biblioteca e Mesa de Trabalho
- **Normalização NFD repetida na Galeria (`ProjectGalleryView.tsx` linhas 128–165):** durante a filtragem por texto (`searchQuery`), `normalizeSearchQuery(haystack)` (que executa `.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` e `resolveDepartmentName`) corre para cada projeto em cada tecla, em vez de pré-computar o *haystack* normalizado num `useMemo` dependente apenas de `[projects, language]`.
- **Desconexão de `StudioDeskPage.tsx` face ao repositório canónico:** `StudioDeskPage.tsx` (linha 18) importa `STUDIO_DESK_PROJECTS` estático diretamente de `studioDeskFixtures.ts`, enquanto `GlobalSearchDialog` e `ProjectLibraryCatalogPage` leem `projectLibraryRepository.ts`. Quando `StudioDeskPage` passar a consumir o repositório canónico, a existência de uma **cache em memória no `projectLibraryRepository.ts`** será indispensável para evitar novas leituras redundantes de `localStorage`.

---

### 2.6 Impacto Previsto do Three.js no Carregamento (Fase 04)

#### Estimativa de Peso dos Módulos 3D

| Stack 3D Candidata | Tamanho Minificado Estimado | Tamanho Gzip Estimado | Tamanho Brotli Estimado | Recursos Adicionais sob Procura |
|---|---:|---:|---:|---|
| **Opção A — `three` modular nativo** (`WebGLRenderer`, `Scene`, `PerspectiveCamera`, `OrthographicCamera`, `GLTFLoader`, `DRACOLoader`, `OrbitControls`, `Box3`, `Plane`) | `~620 – 680 kB` | `~155 – 175 KiB` | `~130 – 145 KiB` | `draco_decoder.wasm` (`~280 kB` raw / `~95 KiB` gzip) em Web Worker |
| **Opção B — `three` + `@react-three/fiber` + `@react-three/drei` (`three-stdlib`)** | `~950 – 1,150 kB` | `~260 – 310 KiB` | `~215 – 255 KiB` | `draco_decoder.wasm` + eventual `ktx2` transcoder |

#### Comparação de Cenários de Integração

| Cenário de Arquitetura na Fase 04 | JS Inicial Carregado em `/login` e `/workspace` (Gzip) | JS Adicional ao Abrir `/workspace/projects/:id/model` (Gzip) | Impacto nas Rotas 2D (`/login`, `/welcome`, `/workspace`, `/workspace/projects`) |
|---|---:|---:|---|
| **Cenário 1 — Sem Code-Splitting (Atual + Three.js estático)** | **`380 – 530 KiB` gzip** (`1.45 – 1.95 MB` raw) | `0 KiB` (já pago à cabeça) | **Crítico (`P0`):** Aumento de `+70% a +140%` no tempo de download, parse e compilação JS em todas as páginas 2D. |
| **Cenário 2 — Com Route Code-Splitting + Isolamento Assíncrono do Motor 3D (Recomendado)** | **`~105 – 125 KiB` gzip** (`~340 – 400 kB` raw) | **`~165 – 280 KiB` gzip** (chunk `model-viewer` + `vendor-three`) | **Zero bytes de Three.js nas rotas 2D** e redução de `~45%` face ao baseline atual da Fase 03 (`221.25 KiB` → `~115 KiB` gzip). |

#### Regras de Isolamento de Carregamento para a Integração A + B
1. **Proibição de `import * as THREE from 'three'` fora do módulo 3D:** Nenhum ficheiro de `src/data/`, `src/features/project-library/`, `src/features/project-experience/` (exceto o subcomponente lazy do visualizador) ou `src/features/workspace-shell/` pode importar `three`. Contratos partilhados (como `ModelCameraPreset`, `SectionAxis`, `Model3DMetadata`, `BoundingBoxTuple`) devem ser tipos TypeScript puros (`import type`), que têm custo `0 bytes` em runtime.
2. **Poster Técnico 2D antes do Canvas WebGL no Dossier (`ProjectDossierView.tsx`):** Quando o utilizador abre `/workspace/projects/:id` (secção Identidade ou Desenvolvimento), o Dossier **não deve inicializar imediatamente o `THREE.WebGLRenderer`**. Deve apresentar a prancha técnica 2D do modelo (nome do ficheiro `.glb`, estado, cota, dimensões) com o botão **"Abrir Visualizador 3D"** (que navega para `/workspace/projects/:id/model` ou monta o `<Suspense><LazyModelCanvas /></Suspense>` sob clique explícito). Deste modo, consultar um Dossier para ler documentos ou editar a ficha técnica consome `0 MB` de VRAM e `0 kB` de Three.js.
3. **Prefetch Inteligente por Intenção:** No botão `Abrir modelo 3D (Fase 04)` em `ProjectDossierView.tsx` (linha 488), acionar `onMouseEnter` / `onFocus` para pré-carregar o chunk do visualizador (`void import('../model-viewer/ModelViewerPage')`) `150–300 ms` antes do clique.

---

### 2.7 Estratégias para Limitar o Custo de GPU e Memória em Dispositivos Modestos

Para garantir que portáteis de atelier sem GPU dedicada (Intel Iris Xe / UHD, Apple M1 base, tablets e ecrãs externos 4K ligados a integradas) operam sem aquecimento, *frame drops* ou *crashes* de tab:

#### 1. Renderização sob Procura (*Render-on-Demand* — Proibição de Loop `rAF` Contínuo)
- Modelos arquitetónicos são cenas estáticas durante 95% do tempo de inspeção. Um loop `requestAnimationFrame` contínuo a 60 FPS consome `16.6 ms/frame` de GPU incessantemente mesmo quando o utilizador está apenas a ler cotas.
- **Regra:** O motor de Agente A deve expor um método `requestRender()` (ou `frameloop="demand"` se R3F). O frame só é desenhado quando:
  - `OrbitControls` emite o evento `'change'`;
  - `ResizeObserver` deteta alteração de dimensões do contentor;
  - O utilizador altera planos de corte (`clippingPlanes`), visibilidade de camadas, modo de apresentação (Maquete Argila / Técnico / Wireframe) ou exposição solar;
  - Uma transição de câmara está em curso (terminando o loop assim que a convergência `< 0.001` é atingida).

#### 2. Clamping de `devicePixelRatio` (DPR) e Escala Dinâmica durante Interação
- Num ecrã 4K ou Retina (`window.devicePixelRatio = 2` ou `3`), renderizar à resolução nativa multiplica o número de fragmentos processados por **`4×` a `9×`**.
- **Regra:**
  - Aplicar `const maxDpr = isLowEndDevice ? 1.0 : 1.5; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));`
  - Detetar dispositivos modestos via `(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4)`.
  - **Resolução Adaptativa em Órbita:** Durante o arrasto contínuo da câmara (`OrbitControls` `'start'` → `'end'`), se a média móvel dos últimos 5 frames exceder `22 ms` (`< 45 FPS`), reduzir temporariamente `pixelRatio` para `1.0` (ou `0.85`) e restaurar `Math.min(dpr, 1.5)` no evento `'end'` para um frame final nítido.

#### 3. Pipeline de Shaders, Sombras e Iluminação Económico
- **Sem Sombras Dinâmicas por Frame:** Desativar `renderer.shadowMap.enabled` durante a navegação ou atualizar o `shadowMap` apenas uma vez quando a geometria/luz muda (`renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true`). Preferir iluminação hemisférica + direcional fixa + plano de solo com sombra de contacto simples.
- **Anti-aliasing seletivo:** Ativar `antialias: true` apenas quando `effectiveDpr <= 1.25`, ou permitir desativá-lo no modo "Desempenho / Dispositivo Modesto".
- **Proibição de Pós-Processamento Pesado:** Não incluir passes de `SSAO`, `SSR` ou `Bloom` em tempo real, que duplicam ou triplicam os *render targets* full-screen em VRAM.

#### 4. Contrato Determinístico de Libertação de VRAM (`dispose`)
O JavaScript GC **não liberta recursos da GPU**. Cada montagem/desmontagem de `/workspace/projects/:id/model` ou troca de ficheiro `.glb` tem de executar:
```ts
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        for (const value of Object.values(mat)) {
          if (value && typeof (value as THREE.Texture).dispose === 'function') {
            (value as THREE.Texture).dispose();
          }
        }
        mat.dispose();
      }
    }
  });
}
```
Seguido de `dracoLoader?.dispose()`, `renderer.renderLists.dispose()`, `renderer.dispose()` e `URL.revokeObjectURL(objectUrl)` para modelos locais.

#### 5. Limites de Segurança para Modelos `.glb` e Ficheiros Locais
- **Armazenamento:** Ficheiros `.glb` / `.gltf` carregados pelo utilizador **nunca** podem ser serializados em `localStorage` (limite total de `5 MB`). Devem ser lidos em sessão via `URL.createObjectURL(file)` ou `ArrayBuffer` transferível, guardando em `localStorage` apenas os metadados (`ProjectFileReference` em `oa_workspace_project_library_v1`).
- **Guardas de Geometria e Ficheiro:**
  - Até `25 MB` / `300,000` triângulos: carregamento normal.
  - Entre `25 MB` e `60 MB` (ou `300,000 – 800,000` triângulos): exibir aviso técnico não bloqueante e ativar automaticamente o perfil de economia de GPU (`DPR = 1.0`, sombras desligadas).
  - Acima de `75 MB`: rejeitar preventivamente antes de alocar buffers WebGL com mensagem honesta indicando o limite seguro do navegador.
- **Tratamento de `webglcontextlost` / `webglcontextrestored`:** Registar listeners no `<canvas>` para intercetar `webglcontextlost` (`event.preventDefault()`), cancelar qualquer frame pendente e apresentar um painel de recuperação editorial O+A sem quebrar a árvore React (`ErrorBoundary` dedicado ao viewport 3D).

---

### 2.8 Regressões de Performance que Devem Ser Detetadas Automaticamente

Para evitar que futuras alterações degradem silenciosamente a aplicação após a integração das Fases 04–06, propomos três mecanismos automáticos:

1. **Verificador Automático de Orçamento de Bundle (`scripts/check-perf-budget.mjs` no `npm run build`):**
   Script Node.js zero-dependências que inspeciona `dist/assets/` após `vite build` e falha com `exit(1)` se:
   - O chunk JS de entrada (`index-*.js`) exceder **`180 KiB` gzip** (ou **`140 KiB` gzip** após route-splitting completo);
   - Qualquer código de `three` / `WebGLRenderer` estiver presente no chunk de entrada `index-*.js` (garantindo isolamento 100% assíncrono do motor 3D);
   - O chunk assíncrono do motor 3D exceder **`220 KiB` gzip** (nativo) / **`320 KiB` gzip** (R3F);
   - O CSS total exceder **`15 KiB` gzip**.
2. **Testes Automatizados de Eficiência de Repositório e Pesquisa em Vitest (`src/test/performanceRegression.test.ts`):**
   - Espiar `Storage.prototype.getItem` e `JSON.parse`:
     - Montar `ProjectLibraryCatalogPage` ou `ProjectDossierShellPage` deve realizar **`<= 1` leitura** a `oa_workspace_project_library_v1` (com cache fria) e **`0` leituras** com cache quente.
     - Executar `searchWorkspaceDemo` ao longo de 10 teclas consecutivas (`"c"` a `"casa patio"`) deve realizar **`0` leituras** a `localStorage` após a primeira construção do índice em cache.
     - Em cenário sintético de `200` projetos, 10 chamadas a `searchWorkspaceDemo` têm de concluir em **`< 25 ms` totais** (`< 2.5 ms/tecla`).
3. **Verificação Automatizada de Libertação WebGL e Estabilidade de Heap:**
   - Teste unitário do motor 3D verificando que, após `mount` → `loadModel` → `unmount`, o contador `renderer.info.memory.geometries` e `renderer.info.memory.textures` regressa a `0` e `renderer.dispose` foi chamado `1` vez.
   - Verificação E2E Playwright (`scripts/e2e-verify-entry.mjs` ou script dedicado) validando que 5 ciclos de entrada e saída de `/workspace/projects/:id/model` não disparam `webglcontextlost` nem acumulam mais de `+5 MB` de `JSHeapUsedSize` após `HeapProfiler.collectGarbage()`.

---

## 3. Problemas Identificados e Classificados (`P0` / `P1` / `P2`)

### Resumo de Classificação

| ID | Severidade | Domínio | Título Curto | Evidência Empírica / Impacto |
|---|:---:|---|---|---|
| **PERF-P0-01** | **P0** | Bundle & Rotas | Ausência total de `React.lazy()` em `App.tsx` e de `manualChunks` em `vite.config.ts` | Bundle único de `810.54 kB` (`221.25 KiB` gzip); com Three.js subiria para `1.45–1.95 MB` raw (`385–535 KiB` gzip) no `/login`. |
| **PERF-P0-02** | **P0** | Motor 3D / GPU | Risco de fuga de VRAM, exaustão dos 16 contextos WebGL e loop `rAF` contínuo na Fase 04 | Geometrias/texturas `.glb` não sofrem GC automático; render contínuo a 60 FPS esgota GPU/bateria em portáteis sem gráfica dedicada. |
| **PERF-P1-01** | **P1** | Pesquisa Global | `searchWorkspaceDemo` reconstrói o índice e relê/valida `localStorage` em cada tecla | `11` leituras `localStorage` em 10 teclas; a 50 projetos atinge `105.92 ms/tecla` (`> 100 ms` RAIL input budget). |
| **PERF-P1-02** | **P1** | Biblioteca & Dossier | Dupla leitura em `useProjectLibrary`, 3.ª leitura no render de `ProjectDossierShellPage` e 6 leituras por escrita | Abrir 1 dossier faz `3` `getItem` e `30` `JSON.parse`; a 200 projetos demora `455.41 ms` (`3.6×` mais lento). Guardar metadados faz `6` `getItem`. |
| **PERF-P1-03** | **P1** | Main Thread / I18n | `timeGreeting.ts` instancia `4 a 8` `new Intl.DateTimeFormat` por renderização sem cache | `287.40 ms` vs `13.30 ms` em 500 ciclos (`21.6×` mais lento que singletons cacheados). |
| **PERF-P1-04** | **P1** | Bundle Inicial | `WorkspaceSessionContext.tsx` importa estaticamente repositórios, fixtures (`~82 KiB`) e ambos os idiomas | Impede que `/login` seja leve mesmo após `React.lazy` nas rotas. |
| **PERF-P1-05** | **P1** | Imagens / Main Thread | `FeaturedProjectPlate.tsx` e `ProjectOverviewPanel.tsx` forçam `loading="eager" decoding="sync"` | 5 de 6 imagens em `/workspace` bloqueiam a main thread com decode síncrono (`1376×768` duplicada + `1200×670`). |
| **PERF-P1-06** | **P1** | DOM & Escala | `ProjectGalleryView.tsx` sem paginação/content-visibility e sem pré-indexação de pesquisa NFD | A 200 projetos monta `20,830` nós DOM (`688.69 ms`) e repete `.normalize('NFD')` por cartão a cada tecla. |
| **PERF-P2-01** | **P2** | Bundle / Motion | `framer-motion` representa `19.93%` do código Rollup (`378.42 KiB` rendered) e é importado sem uso em `StudioDeskPage.tsx` | `motion` importado na linha 1 de `StudioDeskPage.tsx` sem uso; ausência de `LazyMotion` inclui drag e layout projection (`93.8 KiB`). |
| **PERF-P2-02** | **P2** | Re-renders React | `ProjectDossierShellPage.tsx` não memoiza `deskProject`, `documents` nem `revisions` | Novas referências de arrays a cada render invalidam `useMemo` internos de `ProjectDossierView.tsx` (`1,821` linhas). |
| **PERF-P2-03** | **P2** | Memória / GC Churn | `cloneRecord` em `projectLibraryRepository.ts` usa `JSON.parse(JSON.stringify(record))` em vez de `structuredClone` ou imutabilidade seletiva | Gera `27 a 58` chamadas `JSON.parse` por navegação e `+1.01 MB` de heap retido após 10 ciclos. |
| **PERF-P2-04** | **P2** | HTML / Fontes & Assets | Google Fonts bloqueante no `<head>`, `logo.png` (`692×511` para `32 px`) e hooks de Focus Trap duplicados | Pedido externo de fontes demora `1,047.4 ms` no cold load; 2 hooks de focus trap duplicam `10.6 KiB` e chamam `getComputedStyle` no `Tab`. |

---

## 4. Recomendações com Impacto Esperado

| # | Recomendação Técnica | Problemas Resolvidos | Impacto Esperado (Quantificado) |
|---:|---|---|---|
| **R1** | **Code-Splitting de Rotas e Modais (`React.lazy`) + `manualChunks` em `vite.config.ts`:** Converter todas as rotas de `src/app/App.tsx` (exceto `/login` ou todas com fallback leve), `ProjectDossierDialog`, `GlobalSearchDialog` e a futura rota `/workspace/projects/:id/model` para `React.lazy()`. Configurar `manualChunks` (`vendor-react`, `vendor-router`, `vendor-motion`, `vendor-icons`, `vendor-three`). | `PERF-P0-01` | Reduz o JS inicial descarregado em `/login` de **`221.25 KiB` gzip para `~95–115 KiB` gzip (`-50%`)** e garante **`0 KiB` de Three.js** em todas as rotas 2D. |
| **R2** | **Cache em Memória com Invalidação por Versão/Evento em `projectLibraryRepository.ts` + Unificação em `useProjectLibrary.ts`:** Manter em memória `cachedCanonicalProjects` e `cachedEnvelopeRaw` (invalidados apenas em `saveEnvelope`, `clearProjectLibraryLocalState` ou evento `storage` cross-tab). Em `useProjectLibrary.ts`, chamar `listProjects()` uma única vez e derivar `studioDeskProjects = useMemo(() => projects.map(canonicalToStudioDeskProject), [projects])`. Em `ProjectDossierShellPage.tsx`, obter o projeto a partir de `projects.find(p => p.identity.id === id)` (ou `useMemo`) e memoizar `deskProject`, `documents` e `revisions`. | `PERF-P1-02`, `PERF-P2-02`, `PERF-P2-03` | Reduz leituras de `localStorage` ao abrir Dossier de **`3` para `0` (cache quente) ou `1` (cache fria)**; reduz chamadas `JSON.parse` de **`30` para `0–1`**; reduz o tempo de abertura do Dossier com 200 projetos de **`455.41 ms` para `< 40 ms` (`> 10×` mais rápido)** e elimina 5 das 6 leituras ao guardar metadados. |
| **R3** | **Pré-Indexação Memoizada da Pesquisa Global (`globalSearchIndex.ts` + `GlobalSearchDialog.tsx`):** Separar `buildWorkspaceSearchEntries(language)` (com campos `normalizedTitle`, `normalizedCode` e `normalizedKeywords` já normalizados em NFD) de `filterWorkspaceSearchEntries(entries, query)`. Em `GlobalSearchDialog.tsx`, memoizar `const entries = useMemo(() => buildWorkspaceSearchEntries(language), [language])` uma única vez ao abrir o modal, e executar apenas `filterWorkspaceSearchEntries(entries, query)` a cada tecla. | `PERF-P1-01` | Reduz leituras de `localStorage` durante 10 teclas de **`11` para `0`** (com cache do repositório) e reduz a latência por tecla com 50–200 projetos de **`92–106 ms` para `< 2 ms/tecla` (`~50×` mais rápido)**. |
| **R4** | **Cache de Singletons `Intl.DateTimeFormat` em `src/utils/timeGreeting.ts`:** Criar um `const formatterCache = new Map<string, Intl.DateTimeFormat>()` ao nível do módulo para reutilizar os formatadores de Maputo (`Africa/Maputo`) e Milão (`Europe/Rome`). | `PERF-P1-03` | Reduz o tempo de formatação de relógios/datas em 500 renders de **`287.40 ms` para `13.30 ms` (`21.6×` mais rápido)** e elimina `100%` das alocações de `Intl.DateTimeFormat` após o primeiro render. |
| **R5** | **Desacoplar `WorkspaceSessionContext.tsx` dos Repositórios de Projetos e Otimizar `framer-motion`:** Mover as limpezas de chaves `localStorage` para `sessionRepository.ts`, remover o import `motion` não utilizado em `StudioDeskPage.tsx` (linha 1) e migrar para `LazyMotion` (`domAnimation`). | `PERF-P1-04`, `PERF-P2-01` | Retira **`~82 KiB` de fixtures/repositórios** do caminho crítico de `/login` e reduz o peso de animações em **`~55–70 KiB` raw (`~18–22 KiB` gzip)**. |
| **R6** | **Higiene de Imagens (`decoding="async"`, `loading="lazy"`) e `content-visibility: auto` nas Grelhas:** Em `FeaturedProjectPlate.tsx`, alterar `decoding="sync"` para `decoding="async"`. Em `ProjectOverviewPanel.tsx` e `ProjectGalleryView.tsx`, usar `loading="lazy" decoding="async"` e aplicar `content-visibility: auto; contain-intrinsic-size: 0 460px;` aos cartões de projeto fora do viewport inicial (ou paginação a 24 cartões). | `PERF-P1-05`, `PERF-P1-06` | Elimina o bloqueio síncrono de decode de bitmaps em `/workspace` e reduz o custo de layout/paint em catálogos grandes (`50–200` projetos) em **`~60–75%`**. |
| **R7** | **Arquitetura de Eficiência GPU & Memória no Motor 3D (Fase 04):** Implementar *render-on-demand*, clamping `DPR <= 1.5` (com queda automática para `1.0` em dispositivos modestos ou `< 45 FPS`), `disposeObject3D` recursivo no `unmount`, listener `webglcontextlost`/`restored`, e Poster Técnico 2D antes da ativação do WebGL no Dossier. | `PERF-P0-02` | Reduz consumo de GPU em repouso para **`0%`**, poupa **`44% a 75%` de carga de fragment shader** em ecrãs Retina/4K (`DPR 1.5` vs `2.0/3.0`) e garante **`0` fugas de VRAM** em navegações repetidas. |

---

## 5. Plano de Testes Pós-Integração (Agentes A + B + C)

Quando as branches `codex/f04-model-engine` (Agente A) e `codex/f04-viewer-experience` (Agente B) estiverem prontas para integração, a revisão de performance seguirá este protocolo verificável em 5 fases:

### Fase 1 — Auditoria Estática e de Grafo de Build
1. Executar `npm run lint` e `npm run build`.
2. Inspecionar os chunks gerados em `dist/assets/`:
   - Confirmar que `three` (e eventuais wrappers WebGL) reside num chunk assíncrono separado e **não** é importado pelo chunk de entrada `index-*.js`.
   - Confirmar que nenhum aviso `(!) Some chunks are larger than 500 kB` é emitido pelo Vite para os chunks da aplicação 2D.
3. Verificar que a importação de tipos entre `project-library`, `project-experience` e o novo módulo 3D utiliza estritamente `import type` nos limites de módulo.

### Fase 2 — Verificação Funcional e de Isolamento de Rede por Rota (Playwright)
1. Iniciar `vite preview` e abrir `/login` → `/welcome` → `/workspace` → `/workspace/projects` → `/workspace/projects/sd-proj-oa-26-101` monitorizando `page.on('request')`:
   - **Critério de aceitação:** Nenhuma destas rotas pode descarregar o chunk `vendor-three-*.js` nem ficheiros `.glb` / `.wasm` enquanto o utilizador não acionar explicitamente a rota `/workspace/projects/:id/model` (ou o botão de ativação do modelo 3D).
2. Navegar para `/workspace/projects/sd-proj-oa-26-101/model`:
   - Verificar carregamento assíncrono com estado de loading editorial O+A, transição suave e renderização correta do modelo.

### Fase 3 — Testes de Stress de Memória, GPU e Contexto WebGL (Playwright + CDP)
1. **Teste de Ciclo de Vida (10 Navegações 2D ↔ 3D):**
   - Alternar 10 vezes entre `/workspace/projects/sd-proj-oa-26-101` e `/workspace/projects/sd-proj-oa-26-101/model`.
   - Forçar `HeapProfiler.collectGarbage()` via CDP antes do 1.º ciclo e após o 10.º ciclo.
   - **Critério de aceitação:** `JSHeapUsedSize` não pode crescer mais de `+5.0 MB` após 10 ciclos; `renderer.info.memory.geometries` e `textures` têm de ser limpos no `unmount`; zero erros `WEBGL_lose_context` / `Context Lost` na consola.
2. **Teste de Render-on-Demand (Idle GPU/CPU):**
   - Com `/workspace/projects/sd-proj-oa-26-101/model` aberto e estático durante `3 segundos`, medir o número de chamadas `requestAnimationFrame` / `renderer.info.render.frame`.
   - **Critério de aceitação:** Após a estabilização inicial da câmara, o contador `renderer.info.render.frame` deve permanecer constante (`0` frames desenhados em repouso).
3. **Teste de Simulação de Perda de Contexto (`webglcontextlost`) e Dispositivo Modesto:**
   - Disparar `canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()` via Playwright e confirmar que a UI apresenta o estado de recuperação sem lançar exceção não tratada (`pageerror`).
   - Emular `prefers-reduced-motion: reduce` e verificar que as transições de câmara entre vistas (Perspetiva / Topo / Alçado / Corte) são instantâneas, sem amortecimento contínuo.

### Fase 4 — Benchmarks de Escala de Dados (`5` / `50` / `200` Projetos)
1. Reexecutar a suite de escala com 50 e 200 projetos em `localStorage`:
   - **Critério de aceitação:** Latência média da Pesquisa Global (`Ctrl+K`) `< 10 ms/tecla` (média em 10 teclas) mesmo com 200 projetos; montagem de `/workspace/projects/:id` `< 100 ms` com `<= 1` leitura de `localStorage`.

### Fase 5 — Suite de Regressão Completa
1. Executar `npm run test` (incluindo os novos testes de orçamento de leituras `localStorage` e limpeza 3D) e `npm run test:e2e` nas 5 larguras canónicas (`1440px`, `1440×680`, `768px`, `720px`, `375px`).

---

## 6. Proposta de Orçamento de Desempenho (Performance Budget)

| Categoria | Métrica | Baseline Atual (Fase 03) | Orçamento Alvo (Fase 04 Integrada) | Limite Máximo (Hard Fail CI) |
|---|---|---:|---:|---:|
| **Bundle & Rede** | JS Inicial Carregado em `/login` (Gzip) | `221.25 KiB` | **`<= 115 KiB`** | `150 KiB` |
| **Bundle & Rede** | Maior Chunk JS 2D Individual (Gzip) | `221.25 KiB` | **`<= 85 KiB`** | `120 KiB` |
| **Bundle & Rede** | Chunk Motor 3D + Viewer (Gzip, Lazy) | N/A | **`<= 190 KiB`** (nativo) / **`280 KiB`** (R3F) | `320 KiB` |
| **Bundle & Rede** | Código Three.js nas Rotas 2D | `0 KiB` | **`0 KiB`** | `0 KiB` |
| **Bundle & Rede** | CSS Global Total (Gzip) | `10.11 KiB` | **`<= 12 KiB`** | `16 KiB` |
| **Tempo & Interação** | Transição de Rota 2D (`/workspace/projects`, Dossier) | `168 – 182 ms` (5 proj.) / `455 ms` (200 proj.) | **`<= 80 ms`** (até 200 proj.) | `150 ms` |
| **Tempo & Interação** | Latência por Tecla na Pesquisa Global (200 projetos) | `92.35 – 105.92 ms/tecla` | **`<= 5 ms/tecla`** | `16 ms/tecla` |
| **Dados & Storage** | Leituras `localStorage.getItem` por Navegação de Rota | `2 – 4` leituras | **`0` (cache quente) / `1` (fria)** | `1` leitura |
| **Dados & Storage** | Leituras `localStorage.getItem` durante 10 Teclas de Pesquisa | `11` leituras | **`0` leituras** | `1` leitura |
| **Dados & Storage** | Instanciações `new Intl.DateTimeFormat` após Warmup | `3 – 8` por render | **`0` por render** | `0` por render |
| **Motor 3D & GPU** | FPS em Órbita (Modelo de Referência `<= 150k` triângulos) | N/A | **`>= 55 FPS`** (`<= 18 ms/frame`) | `30 FPS` (`33 ms`) |
| **Motor 3D & GPU** | Frames Renderizados em Repouso (Câmara Estática 3s) | N/A | **`0 frames/s`** (*render-on-demand*) | `1 frame/s` |
| **Motor 3D & GPU** | `devicePixelRatio` Máximo no Canvas WebGL | N/A | **`1.5`** (`1.0` em low-end) | `2.0` |
| **Motor 3D & GPU** | Contextos WebGL Ativos Simultâneos | `0` | **`1`** (apenas na rota/aba 3D ativa) | `1` |
| **Memória** | Crescimento Líquido de JS Heap após 10 Ciclos (com GC) | `+1.01 MB` (2D) | **`<= +1.0 MB` (2D) / `<= +5.0 MB` (3D)** | `+10.0 MB` |

---

## 7. Ficheiros que Precisarão de Alterações (Fase de Otimização Pós-Integração)

| Caminho do Ficheiro | Prioridade | Alterações Técnicas Necessárias |
|---|:---:|---|
| `vite.config.ts` | **P0** | Configurar `build.rollupOptions.output.manualChunks` para separar `vendor-react`, `vendor-router`, `vendor-motion`, `vendor-icons` e `vendor-three`. |
| `src/app/App.tsx` | **P0** | Substituir as importações estáticas das páginas (`WelcomePage`, `StudioDeskPage`, `WorkspaceSettingsPage`, `ProjectLibraryCatalogPage`, `ProjectCreateEnginePage`, `ProjectDossierShellPage`, `PlannedModuleView` e a nova rota `/workspace/projects/:id/model`) por `React.lazy(() => import(...))`. |
| `src/app/WorkspaceSessionContext.tsx` | **P1** | Remover as importações estáticas de `projectLibraryRepository.ts`, `studioDeskFixtures.ts` e `shellDemoState.ts`, delegando a limpeza de chaves `localStorage` a `src/data/sessionRepository.ts`; separar ou memoizar sub-contextos para evitar re-renders globais. |
| `src/data/sessionRepository.ts` | **P1** | Centralizar a limpeza das chaves `oa_workspace_project_library_v1`, `oa_workspace_studio_desk_v1`, `oa_workspace_shell_rail_v1` e `oa_workspace_demo_notifications_v1` em `resetDemoWorkspaceState()` sem importar fixtures pesados. |
| `src/data/projectLibraryRepository.ts` | **P1** | Introduzir cache em memória (`cachedEnvelope`, `cachedCanonicalList`, `cachedSeedProjects`) invalidada apenas em mutações (`saveEnvelope`, `clearProjectLibraryLocalState`) e eventos `storage`; substituir `JSON.parse(JSON.stringify(record))` por `structuredClone` ou clonagem superficial controlada; eliminar as 4 leituras redundantes no caminho de escrita (`updateProjectMetadata`, `addProjectRevision`, `addProjectFileReference`). |
| `src/features/project-library/useProjectLibrary.ts` | **P1** | Eliminar a dupla chamada a `listProjects()` + `listStudioDeskCompatibleProjects()`, mantendo apenas `projects` em `useState` e derivando `studioDeskProjects` via `useMemo(() => projects.map(canonicalToStudioDeskProject), [projects])`. |
| `src/features/project-library/ProjectDossierShellPage.tsx` | **P1** | Substituir `const record = getProject(id)` no corpo do render por seleção memoizada a partir do estado de `useProjectLibrary()`, e envolver `deskProject`, `documents` e `revisions` em `useMemo`. |
| `src/features/workspace-shell/globalSearchIndex.ts` | **P1** | Separar a construção e normalização NFD do índice (`buildWorkspaceSearchEntries`) da filtragem por query (`filterWorkspaceSearchEntries`), pré-computando `normalizedTitle` e `normalizedCode` em cada entrada e invalidando a cache do índice apenas quando `oa:project-library-updated` ou `language` mudarem. |
| `src/features/workspace-shell/GlobalSearchDialog.tsx` | **P1** | Memoizar o índice base por `[language]` ao abrir o modal e filtrar em memória a cada tecla; carregar `GlobalSearchModalContent` via `React.lazy` em `WorkspaceShell.tsx`. |
| `src/utils/timeGreeting.ts` | **P1** | Implementar cache de instâncias `Intl.DateTimeFormat` (`Map<string, Intl.DateTimeFormat>`) ao nível do módulo para `getZonedDateTimeParts`, `formatStudioClocks` e `formatEditorialDate`. |
| `src/features/studio-desk/FeaturedProjectPlate.tsx` | **P1** | Alterar `decoding="sync"` para `decoding="async"` na imagem principal da maquete (linha 77). |
| `src/features/studio-desk/ProjectOverviewPanel.tsx` | **P1** | Alterar `loading="eager" decoding="sync"` para `loading="lazy" decoding="async"` nos cartões da grelha (linhas 252–253). |
| `src/features/project-experience/ProjectGalleryView.tsx` | **P1** | Adicionar `decoding="async"` às imagens dos cartões (linha 472), pré-computar o *haystack* normalizado NFD por projeto num `useMemo([projects, language])` e aplicar `content-visibility: auto` aos cartões da galeria. |
| `src/features/studio-desk/StudioDeskPage.tsx` | **P2** | Remover o import `motion` não utilizado na linha 1; carregar `ProjectDossierDialog` via `React.lazy` quando um projeto for selecionado para inspeção em modal. |
| `src/features/studio-desk/useStudioDeskDialogFocusTrap.ts` | **P2** | Consolidar com `src/design-system/useDialogFocusTrap.ts` e evitar chamadas desnecessárias a `window.getComputedStyle` em elementos com `offsetParent === null`. |
| `index.html` | **P2** | Otimizar o carregamento das fontes `Outfit` e `Playfair Display` (preload / não bloqueante) para reduzir o impacto de `1,047 ms` no FCP a frio. |
| **Módulos da Fase 04 (Agentes A e B):** `src/features/model-engine/*` / `src/features/model-viewer/*` / `ProjectDossierView.tsx` | **P0** | Garantir exportação compatível com `React.lazy`, *render-on-demand*, clamping de `DPR <= 1.5`, função `disposeObject3D()` no `useEffect` de limpeza, tratamento de `webglcontextlost`, e Poster Técnico 2D antes da inicialização do contexto WebGL. |
| `scripts/check-perf-budget.mjs` & `src/test/performanceRegression.test.ts` | **P1** | Novos ficheiros de verificação automática pós-build e testes Vitest de regressão de leituras `localStorage`, latência de pesquisa e libertação de memória 3D. |
