# O+A Workspace — Auditoria Pós-Integração de Desempenho e Arquitetura (Fase 04)

- **Agente:** Gemini C (Performance, Arquitetura & Eficiência Técnica · Equipa 2)
- **Branch de auditoria:** `codex/f04c-postmerge-performance`
- **Branch integrada auditada:** `codex/f02-integration-preview` (`ac13ee14dad89c446546e65966b1a96983f6a44a`)
- **Baseline comparativo (Pré-Integração F03):** `codex/f04-performance-audit` (`c318a7580ca851158fcd1f3258fea5e0b2071867`, `docs/audits/phase04-performance.md`)
- **Data da recolha empírica:** `2026-11-15T20:46:51Z`
- **Estado:** Auditoria pós-integração concluída (**sem alterações de código produtivo nem otimizações aplicadas nesta etapa**, em conformidade estrita com as regras da missão)

---

## Sumário Executivo

A integração do motor de modelos 3D (`src/features/model-engine/*`, `src/data/modelAssetRepository.ts`) e do visualizador WebGL (`src/features/model-viewer/*` sobre `three@^0.187.0`, `@react-three/fiber@^9.8.2` e `@react-three/drei@^10.7.9`) cumpre o **isolamento da biblioteca 3D pesada nas rotas iniciais**: `three`, `@react-three/fiber`, `@react-three/drei`, `three-stdlib` e `glbInspector.ts` não entram no bundle inicial (`index-*.js`) e registam **`0` bytes transferidos** durante todo o percurso `/login` -> `/welcome` -> `/workspace` -> `/workspace/projects` -> `/workspace/projects/:id`. Adicionalmente, o visualizador opera de forma comprovada em **`frameloop="demand"` com `0` chamadas de renderização em repouso (`3,000 ms`)** e liberta **100% dos `WebGLBuffer`** (`1,030 / 1,030`).

Contudo, a medição pós-integração expôs **dois problemas críticos (`P0`) introduzidos na integração 3D**, **regressões de peso no bundle inicial**, e a **persistência integral dos estrangulamentos síncronos herdados da Fase 03**:

1. **Tempestade de contextos WebGL (`70` em 10 ciclos) e fuga linear de DOM/Heap no ciclo de vida 3D (`P0`):**
   - Trocar entre `.glb` e `.gltf` dentro do visualizador define `status = 'loading'` (`ArchitecturalModelViewer.tsx:266`) e desmonta `<LazyModelViewerStage>` (`linha 744`), destruindo e recriando o `<Canvas>` WebGL inteiro em cada troca.
   - Em paralelo, `detectWebGLSupport()` (`glbInspector.ts:15-38`) cria um `<canvas>` + contexto WebGL2 temporário **sem invocar `WEBGL_lose_context.loseContext()`** e é chamado **duas vezes por montagem do palco** (`ArchitecturalModelViewer.tsx:139` e `ModelViewerStage.tsx:231`).
   - Resultado medido em **10 ciclos** (`abrir /model -> trocar para .gltf -> voltar para .glb -> Voltar ao Dossier` com `HeapProfiler.collectGarbage` forçado via CDP): **`70` criações de contexto WebGL2** (`40` contextos descartáveis sem `loseContext()` + `30` `<Canvas>` R3F), retenção contínua de handles WebGL internos pós-saída (`120` texturas, `60` programas shader e `90` framebuffers), fuga estritamente linear de **`+8,739` nós DOM detached retidos em Blink** (`1,518 -> 10,257`, `~971` nós/ciclo), **`+414` listeners retidos** (`269 -> 683`, `+46`/ciclo), e crescimento do JS Heap pós-GC de `8.87 MB` (Ciclo 1) para **`11.94 MB` (`+34.6%` / `+3.07 MB`; `+6.73 MB` sobre a baseline pré-3D de `5.21 MB`)**.
2. **`preserveDrawingBuffer: true` ativo + `dpr={[1, 2]}` sem teto adaptativo `1.5` (`P0`):**
   - Inspeção direta de `gl.getContextAttributes()` confirma **`preserveDrawingBuffer: true`** e `powerPreference: "high-performance"` ativos no `<Canvas>` (`ModelViewerStage.tsx:326-330`). Isto impede *swap-chain page flipping* e força retenção/cópia extra do framebuffer no compositor em cada frame.
   - Com `dpr={[1, 2]}`, um ecrã `2x`/`3x` aloca superfície WebGL de `1273 × 936 px` (`1,191,528` px) vs `636 × 468 px` a `1x` (`4×` fill-rate); reduzir o teto para `1.5` pouparia **`43.75%`** de pixels e largura de banda de memória GPU sem perda visual relevante em maquetes arquitetónicas.
3. **Chunk inicial cresceu `+31.80 kB` (`842.34 kB` raw) e `modelAssetRepository.ts` vaza para o entry (`P1`):**
   - `ProjectDossierShellPage.tsx:9` importa `modelAssetRepository.ts` (`29.08 KiB` rendered) de forma estática; como `App.tsx` só aplica `React.lazy()` a `ProjectModelEnginePage`, todas as restantes 8 rotas e o repositório de modelos entraram no chunk inicial `index-*.js` (`842.34 kB` raw / `231.53 KiB` gzip). O chunk lazy `ProjectModelEnginePage-*.js` atinge `890.08 kB` raw (`222.24 KiB` gzip) por falta de `manualChunks` em `vite.config.ts`.
4. **Degradação linear na escala (`200` projetos) e amplificação síncrona agravada (`P1`):**
   - Permanecem sem alteração as **`11` leituras e `11` `JSON.parse`** em 10 teclas da Pesquisa Global (`86.15 ms/tecla` a 200 projetos com envelope `localStorage` de `1.23 MB`), a dupla leitura em `useProjectLibrary.ts` (**agora também herdada por `useProjectModelEngine.ts`, somando `43` `JSON.parse` ao abrir `/model`**), `32` `JSON.parse` no Dossier, **`7` leituras `getItem` por gravação de metadados** (`+1` face às `6` da F03) e ausência de cache em `timeGreeting.ts`.
   - O tempo total de `npm run test` (Vitest) duplicou de `38.99 s` (F03) para **`77.04 s`** isolado, atingindo timeouts (`20 s` / `45 s`) quando executado sob contenção de CPU.

---

## 1. Condições, Ferramentas e Metodologia de Medição

| Parâmetro | Especificação Verificada |
|---|---|
| **Sistema Operativo / Node.js** | Windows (`win32-x64`) · Node.js `v24.13.0` |
| **Toolchain & Dependências 3D** | Vite `7.3.7`, TypeScript `5.9.3`, Vitest `3.2.7`, React `19.2.0`, `three@^0.187.0`, `@react-three/fiber@^9.8.2`, `@react-three/drei@^10.7.9` |
| **Browser e Backend GPU** | Chromium/Edge Headless (`playwright-core` `1.58.2`) · **GPU real D3D11**: `ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A1) Direct3D11 vs_5_0 ps_5_0, D3D11)` · WebGL `2.0 (OpenGL ES 3.0 Chromium)` (`MAX_TEXTURE_SIZE = 16384`, `MAX_SAMPLES = 8`) |
| **Viewports & DPR testados** | `1440 × 900` em `deviceScaleFactor` `1`, `2` e `3`; suite E2E adicional em `1440×900`, `1440×680`, `768×1024`, `720×450` e `375×812` |
| **Instrumentação de Runtime** | Hook programático `vite preview --port 4198`, CDP (`Performance.getMetrics`, `HeapProfiler.collectGarbage`, `Memory.getDOMCounters`), interceção determinística de `Storage.prototype`, `JSON.parse`, `Intl.DateTimeFormat`, `HTMLCanvasElement.prototype.getContext`, `WebGL2RenderingContext.prototype` (`create/deleteBuffer`, `Texture`, `Program`, `Shader`, `VertexArray`, `Framebuffer`, `Renderbuffer`, `drawElements`, `drawArrays`, `clear`, `WEBGL_lose_context`), `URL.createObjectURL/revokeObjectURL` e `window.requestAnimationFrame` |

#### Limitações explícitas
1. **Loopback local (`127.0.0.1:4198`):** Tal como na auditoria F03, os tempos de navegação SPA refletem exclusivamente CPU/DOM/storage/GPU local sem simulação artificial de rede lenta; no arranque a frio de `/login`, a folha de estilos externa `fonts.googleapis.com` mantém latência de rede real (`coldLoadWallMs = 7,821.90 ms`, `TTFB = 2,134.50 ms`, `FCP = 5,512.00 ms`).
2. **Modelos demonstrativos leves:** As duas malhas `.glb` demonstrativas pesam `24,116 B` (`192` triângulos) e `13,000 B` (`96` triângulos), e o `.gltf` embutido pesa alguns quilobytes. Em modelos arquitetónicos reais de `5–50 MB`, os custos observados de clonagem `buffer.slice(0)` e triplo parsing JSON serão amplificados em ordens de grandeza.
3. **Execução Vitest sob contenção vs isolada:** Numa execução paralela simultânea à atividade do sistema, `npm run test` falhou `5/73` testes (`TEST_EXIT=1`) por timeouts (`20 s`/`45 s`) e corrida de digitação; repetido isoladamente sem carga externa (`task-399`), passou **`73/73` (`9/9` ficheiros) em `77.04 s`**. Ambas as execuções são reportadas na secção 7.

---

## 2. Prioridade 1 — Bundle Atual e Isolamento do Three.js

### 2.1 Inventário completo de `dist/` (`vite build`, `2,784` módulos em `1m 19s`)

| Ficheiro (`dist/`) | Papel | Raw (Bytes) | Raw (kB / KiB) | Gzip Nível 9 (KiB) | Brotli (KiB) | Delta vs F03 (`c318a75`) |
|---|---|---:|---:|---:|---:|---|
| `assets/ProjectModelEnginePage-Bo8YDzEY.js` | Chunk lazy rota 3D (`/model`) | `890,082` | `890.08 kB` (`869.22 KiB`) | `222.24 KiB` (`228.37 kB` Vite) | `181.75 KiB` | **Novo** (`> 500 kB` warning) |
| `assets/index-BMnI1E7_.js` | Chunk entry (Shell + 8 rotas) | `842,343` | `842.34 kB` (`822.60 KiB`) | `231.53 KiB` (`237.76 kB` Vite) | `190.79 KiB` | **`+31.80 kB` raw (`+10.28 KiB` gzip)** |
| `assets/ModelViewerStage-Cv_ISDTv.js` | Chunk lazy palco WebGL (R3F/drei) | `199,006` | `199.01 kB` (`194.34 KiB`) | `61.10 KiB` (`62.67 kB` Vite) | `53.71 KiB` | **Novo** |
| `assets/index-Bjc_dptG.css` | CSS global + Tailwind v4 | `62,138` | `62.14 kB` (`60.68 KiB`) | `10.69 KiB` (`11.05 kB` Vite) | `8.67 KiB` | `+2.89 kB` raw |
| `assets/models/oa-ponta-vermelha-pavilion-demo.glb` | Modelo demo `.glb` (`192` triângulos) | `24,116` | `24.12 kB` (`23.55 KiB`) | `2.88 KiB` | `2.24 KiB` | **Novo** |
| `assets/models/oa-costa-terraces-massing-demo.glb` | Modelo demo `.glb` (`96` triângulos) | `13,000` | `13.00 kB` (`12.70 KiB`) | `2.13 KiB` | `1.74 KiB` | **Novo** |
| `assets/models/README.md` | Nota técnica em `public/assets/models/` | `1,709` | `1.71 kB` (`1.67 KiB`) | `0.94 KiB` | `0.86 KiB` | **Novo** (artefacto Markdown estático copiado) |
| Imagens `.webp`, `logo.png`, `favicon.png`, `index.html` | Activos herdados F03 | `481,905` | `481.91 kB` (`470.61 KiB`) | `468.99 KiB` | `468.46 KiB` | Inalterado |
| **Total JS (3 chunks)** | **`assets/*.js`** | **`1,931,431`** | **`1,931.43 kB` (`1,886.16 KiB`)** | **`514.87 KiB`** | **`426.25 KiB`** | **`+1,120.89 kB` raw (+138.3%)** |
| **Total `dist/`** | **Todos os artefactos** | **`2,514,299`** | **`2,514.30 kB` (`2,455.37 KiB`)** | **`1,000.50 KiB`** | **`908.20 KiB`** | **`+1,162.60 kB` raw** |

### 2.2 Grafo de módulos Rollup por chunk (`452` módulos, `4,653.20 KiB` pré-minificação)

| Chunk Rollup | Entrada | Importações Estáticas / Dinâmicas | Módulos | Principais Grupos de Código (`renderedLength` pré-minificação) |
|---|---|---|---:|---|
| **`index-*.js`** | Entry | `dynamicImports: [ProjectModelEnginePage-*.js]` | `401` | `react+react-dom+scheduler` (`670.25 KiB`, `34.46%`), `framer-motion` (`378.42 KiB`, `19.46%`), `project-experience` (`199.67 KiB`), `studio-desk` (`143.95 KiB`), **`src/data` (`126.70 KiB`, incl. `modelAssetRepository.ts` `29.08 KiB`)**, `react-router` (`86.61 KiB`), `i18n+locales` (`85.32 KiB`), `workspace-shell` (`78.04 KiB`), `features/model-engine` (`10.48 KiB`) |
| **`ProjectModelEnginePage-*.js`** | Dynamic | `imports: [index-*.js]` · `dynamicImports: [ModelViewerStage-*.js]` | `30` | **`vendor:three` (`2,065.09 KiB`, `88.08%`)**, **`vendor:three-examples` / `GLTFLoader` (`118.83 KiB`, `5.07%`)**, `features/model-viewer` (`97.22 KiB`, incl. `glbInspector.ts` `17.82 KiB`), `features/model-engine` (`55.23 KiB`), `lucide-react` (`8.12 KiB`) |
| **`ModelViewerStage-*.js`** | Dynamic | `imports: [index-*.js, ProjectModelEnginePage-*.js]` | `21` | **`@react-three/fiber` (`301.16 KiB`, `82.74%`)**, `three-stdlib` (`33.80 KiB`, `9.28%`), **`@react-three/drei` + ecossistema (`11.63 KiB`, `3.20%`)**, `ModelViewerStage.tsx` (`11.09 KiB`), `vendor:other` (`6.21 KiB`) |

### 2.3 Verificação empírica de isolamento por rota (Chromium Network)

O registo completo de respostas HTTP (`isolationAudit`) desde o carregamento inicial até à abertura de um dossier e entrada posterior na rota 3D comprova:

| Rota / Etapa de Navegação | Novos Chunks 3D / `.glb` Descarregados | Verificação |
|---|---|---|
| 1. `/login` (Cold Load) | `0` bytes (`index-*.js`, `index-*.css`, Google Fonts, `/logo.png`, `login-spatial-study.webp`, `/favicon.png`) | ✅ **Three.js, R3F e Drei isolados** |
| 2. `/welcome` | `0` bytes JS/3D (`welcome-maquette-study.webp`) | ✅ **Isolado** |
| 3. `/workspace` (Studio Desk) | `0` bytes JS/3D (`3` imagens `.webp` de projetos) | ✅ **Isolado** |
| 4. `/workspace/projects` (Catálogo) | `0` bytes JS/3D | ✅ **Isolado** |
| 5. `/workspace/projects/sd-proj-oa-26-101` (Dossier) | `0` bytes JS/3D | ✅ **Isolado** |
| 6. `/workspace/projects/sd-proj-oa-26-101/model` | **`ProjectModelEnginePage-*.js` (`890,082 B`) + `ModelViewerStage-*.js` (`199,006 B`) + `oa-ponta-vermelha-pavilion-demo.glb` (`24,116 B`)** | ✅ **Carregamento estritamente sob procura** |

**Resíduo de acoplamento detetado (`PERF-NEW-03`):** Embora `three`, `@react-three/fiber` e `@react-three/drei` estejam corretamente isolados, **`src/data/modelAssetRepository.ts` (`29,782 B` rendered / `40,506 B` originais = `29.08 KiB`)** e `modelAssetTypes` + `modelViewerContract` (`10.48 KiB`) entram no chunk inicial `index-*.js` porque `ProjectDossierShellPage.tsx:9` (estaticamente importado em `App.tsx:16`) importa `resolveProjectModelState`. A própria rota `/model` agrupa `three` junto com a UI da página num único chunk de `890.08 kB` (`> 500 kB`), e não há cache de chunk `vendor-three` nem divisão de rotas restantes (`App.tsx:10-18`).

---

## 3. Prioridade 2 — Navegação, Pesquisa Global e Escala (`5` / `50` / `200` Projetos)

### 3.1 Fluxo completo de navegação e primeira entrada 3D (`5` projetos)

| Transição / Ação Medida | Duração Post-Merge (`ms`) | Duração F03 (`ms`) | `getItem` (`localStorage`) | `setItem` | `JSON.parse` | `new Intl.DateTimeFormat` | Heap Pós-Etapa (`MB`) | Nós CDP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Cold Load `/login` (`networkidle`) | `7,821.90` | `4,387.18` | `2` | `0` | `0` | `3` | `3.02` | `291` |
| `/login` -> `/welcome` | `287.98` | `200.35` | `0` | `1` | `2` | **`8`** | `4.90` | `543` |
| `/welcome` -> `/workspace` | `618.69` | `1,193.92` | `3` | `0` | `25` | **`5`** | `6.37` | `1,644` |
| `/workspace` -> `/workspace/projects` | `140.70` | `167.96` | `2` | `0` | `27` | `3` | `6.18` | `2,118` |
| `/workspace/projects` -> Dossier | `180.17` | `182.28` | `3` | `0` | **`29`** (`+2`) | `3` | `7.09` | `2,354` |
| Guardar metadados no Dossier | `217.82` | `211.26` | **`7`** (`+1`) | `1` | `3` | `0` | `7.33` | `2,531` |
| **Dossier -> `/model` (1.ª abertura 3D)** | **`897.14`** | *(N/A)* | `3` | `0` | **`70`** | **`6`** | **`11.59`** (`+4.26 MB`) | **`3,223`** |

> **Observação:** A primeira abertura de `/workspace/projects/:id/model` demorou `897.14 ms` no loopback local (`ScriptDuration` acumulou **`+319.31 ms` de CPU** para avaliar os `1.09 MB` de Three/R3F/Drei + `GLTFLoader` + `.glb`) e acrescentou **`+4.26 MB`** ao JS Heap (`7.33 -> 11.59 MB`). Nas aberturas subsequentes em cache de código (secção 3.2), o tempo estabiliza em `144–163 ms`, mas repete **`43` chamadas a `JSON.parse`**.

### 3.2 Comparação de escala com `5`, `50` e `200` projetos no `localStorage`

Envelopes JSON canónicos injetados em `oa_workspace_project_library_v1`: `52 B` (`5` seed), `282,831 B` (`50` projetos) e `1,225,431 B` (`200` projetos).

| Métrica de Escala | `5` Projetos (F04 \| F03) | `50` Projetos (F04 \| F03) | `200` Projetos (F04 \| F03) | Fator `200` vs `5` (F04) |
|---|---:|---:|---:|---:|
| **Montagem Catálogo (`ms`)** | `147.29` \| `140.69` | `202.59` \| `698.85` | **`484.11`** \| `688.69` | **`3.29×`** |
| **Nós DOM no Catálogo (CDP)** | `4,522` \| `5,029` | `7,908` \| `10,481` | **`18,775`** \| `20,830` | **`4.15×`** |
| **`getItem` / `JSON.parse` (Catálogo)** | `2` / `29` \| `2` / `29` | `2` / `29` \| `2` / `29` | `2` / `29` \| `2` / `29` | Constante (sem cache) |
| **Pesquisa Global (`10` teclas, total `ms`)** | `497.80` \| `336.85` | `403.91` \| `1,059.20` | **`861.45`** \| `923.50` | **`1.73×`** |
| **Pesquisa Global (média `ms/tecla`)** | `49.78` \| `33.69` | `40.39` \| `105.92` | **`86.15`** \| `92.35` | **`11×` leituras de `1.23 MB`** |
| **`getItem` / `JSON.parse` (Pesquisa `10` teclas)** | `11` / `11` \| `11` / `11` | `11` / `11` \| `11` / `11` | **`11` / `11`** \| `11` / `11` | `13.48 MB` re-lidos em 10 teclas |
| **Abertura Dossier (`ms`)** | `110.80` \| `127.05` | `117.22` \| `305.13` | **`211.17`** \| `455.41` | **`1.91×`** |
| **`getItem` / `JSON.parse` (Dossier)** | `3` / **`32`** \| `3` / `30` | `3` / **`32`** \| `3` / `30` | `3` / **`32`** \| `3` / `30` | `3.68 MB` re-lidos ao abrir |
| **Abertura Visualizador 3D `/model` (`ms`, em cache JS)** | `163.06` \| *(N/A)* | `144.01` \| *(N/A)* | **`156.46`** \| *(N/A)* | **`3` `getItem` / `43` `JSON.parse`** |

**Diagnóstico de escala:** Embora o aquecimento JIT tenha reduzido alguns tempos médios em loopback face à leitura fria da F03, **a complexidade algorítmica e de E/S síncrona piorou ligeiramente**:
- A entrada no Dossier passou de `30` para `32` `JSON.parse` e a abertura da rota `/model` executa **`3` `getItem` e `43` `JSON.parse`** (porque `useProjectModelEngine.ts:51` usa `useProjectLibrary()` com dupla chamada a `listProjects()`, somado a `getProject(projectId)` no corpo de `useMemo`).
- O catálogo a `200` projetos injeta **`18,775` nós CDP** de uma só vez (`484.11 ms`) sem `content-visibility: auto`, paginação nem normalização NFD pré-indexada.

---

## 4. Prioridade 3 — Stress Test de 10 Ciclos 3D: Heap e Recursos Gráficos

Executado em contexto isolado (`1440 × 900`, `deviceScaleFactor = 1`), com `HeapProfiler.collectGarbage` forçado via CDP na baseline (no Dossier, antes da 1.ª abertura 3D) e após saída nos ciclos `1`, `5` e `10`. Cada ciclo realizou via navegação SPA: **Abrir `/workspace/projects/sd-proj-oa-26-101/model` (`.glb`) -> Trocar para `MOD-OA-101-GLTF` (`.gltf`) -> Voltar para `MOD-OA-101-V3` (`.glb`) -> Clicar `Voltar ao Dossier`**.

### 4.1 Evolução medida ciclo a ciclo (após saída para o Dossier)

| Marco do Teste | GC Forçado | `JSHeapUsed` (`MB`) | `JSHeapTotal` (`MB`) | Nós DOM (`CDP`) | `JSEventListeners` | Contextos WebGL Criados | Contextos `detect` (sem `loseContext`) | `<Canvas>` + `loseContext` | `liveBuffers` | `liveTextures` | `livePrograms` | `liveFramebuffers` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Baseline Dossier** (pré-3D) | Sim | `5.21` | `5.88` | `545` | `223` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **Ciclo 1** (saída -> Dossier) | Sim | `8.87` | `9.63` | `1,518` | `269` | `7` | `4` | `3` / `3` | `0` (`103/103`) | `12` (`15/3`) | `6` (`6/0`) | `9` |
| **Ciclo 2** (saída -> Dossier) | Não | `13.21` | `20.88` | `2,718` | `655` | `14` | `8` | `6` / `6` | `0` (`206/206`) | `24` (`30/6`) | `12` (`12/0`) | `18` |
| **Ciclo 5** (saída -> Dossier) | Sim | `10.88` | `12.13` | `5,402` | `453` | `35` | `20` | `15` / `15` | `0` (`515/515`) | `60` (`75/15`) | `30` (`30/0`) | `45` |
| **Ciclo 8** (saída -> Dossier) | Não | `18.71` | `29.27` | `8,560` | `1,077` | `56` | `32` | `24` / `24` | `0` (`824/824`) | `96` (`120/24`) | `48` (`48/0`) | `72` |
| **Ciclo 10** (saída -> Dossier) | **Sim** | **`11.94`** | `13.27` | **`10,257`** | **`683`** | **`70`** | **`40`** | `30` / `30` | **`0`** (`1030/1030`) | **`120`** (`150/30`) | **`60`** (`60/0`) | **`90`** |
| **Delta Ciclo 10 vs Ciclo 1** (pós-GC) | — | **`+3.07 MB` (`+34.6%`)** | `+3.64 MB` | **`+8,739`** (`+971`/ciclo) | **`+414`** (`+46`/ciclo) | **`+63`** (`+7`/ciclo) | **`+36`** (`+4`/ciclo) | `+27` (`+3`/ciclo) | **`0`** | **`+108`** | **`+54`** | **`+81`** |

- **`console.error` / `pageerror` / `webglcontextlost` inesperados:** `0` erros fatais e **`0` perdas de contexto involuntárias** (`contextsLostEvents === explicitLoseContextCalls === 30`), porém foram emitidos **`30` avisos `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`** (1 por criação de renderer R3F).
- **`ObjectURL`s (`blob:`):** `0` criados e `0` ativos nos fluxos de modelos demonstrativos (que usam `fetch()` + `embeddedGltfJson`).

### 4.2 Verificação independente da fuga de nós DOM e listeners (`check-node-leak.mjs`)

Para isolar qualquer efeito da instrumentação WebGL e confirmar se os `10,257` nós eram DOM ativo ou nós *detached* retidos em memória após GC, repetiu-se um teste limpo (sem hooks WebGL, com **duplo** `HeapProfiler.collectGarbage` e `Memory.getDOMCounters()` do protocolo CDP) em `5` ciclos simples (`Dossier -> Abrir /model -> Voltar ao Dossier`, **sem** trocar de modelo):

| Ponto (pós duplo-GC) | Nós Vivos no `document` | `Memory.getDOMCounters().nodes` | `jsEventListeners` | `JSHeapUsed` (`MB`) |
|---|---:|---:|---:|---:|
| Baseline Dossier | `359` | `545` | `223` | `5.01` |
| Após Ciclo 1 (`-> /model -> Dossier`) | `361` | `782` | `240` | `6.96` |
| Após Ciclo 5 (`-> /model -> Dossier`) | **`361`** (constante) | **`2,382`** (`+400` detached/ciclo) | **`334`** (`+23.5`/ciclo) | **`9.42`** (`+0.615 MB`/ciclo) |

### 4.3 Causa raiz exata das anomalias nos 10 ciclos (`PERF-NEW-01`)

1. **Destruição e recriação desnecessária do `<Canvas>` ao trocar de modelo:** Em `ArchitecturalModelViewer.tsx:266`, iniciar o carregamento de um modelo alternado chama `setStatus('loading')`. Como a linha `744` condiciona a montagem do estágio a `{status === 'loaded' && activeSource && loadedScene && telemetry ? <LazyModelViewerStage ... /> : <ModelViewerFallback ... />}`, **cada troca `.glb <-> .gltf` desmonta o `<Canvas>` inteiro, força a perda do contexto WebGL anterior e monta um novo `<Canvas>`**, multiplicando por **`3×`** as inicializações WebGL por visita.
2. **Dupla deteção WebGL sem libertação explícita de contexto:** `detectWebGLSupport()` (`glbInspector.ts:15-38`) cria um `<canvas>` desconectado e chama `canvas.getContext('webgl2')` sem invocar `gl.getExtension('WEBGL_lose_context')?.loseContext()` e sem cache de resultado. É invocada **2×** por abertura (`ArchitecturalModelViewer.tsx:139` + `ModelViewerStage.tsx:231`) e novamente em cada remontagem após troca de modelo — gerando **`40` contextos `webgl2` órfãos** nos 10 ciclos.
3. **Retenção progressiva pós-desmontagem de `<Canvas>` + `disposeThreeObjectResources()` parcial apenas sobre a árvore da cena:** `disposeThreeObjectResources()` (`glbInspector.ts:624-669`) liberta bem geometrias e materiais da cena (`liveBuffers = 0`), mas as texturas/programas/framebuffers internos alocados pelo próprio `WebGLRenderer` do R3F (`+12` texturas, `+6` programas e `+9` framebuffers por ciclo) não recebem `gl.delete*` explícito antes da chamada `forceContextLoss()`, enquanto cada ciclo de montagem/desmontagem da rota `/model` retém `~400` nós DOM *detached* (`~971` com 2 trocas de modelo) e `~23.5–46` listeners mesmo após duplo GC.

---

## 5. Prioridade 4 — DPR, Renderização sob Demanda, `preserveDrawingBuffer` e GPU

Medições obtidas em contexto Chromium real sobre GPU dedicada/integrada **Intel Iris Xe D3D11**, na rota `/workspace/projects/sd-proj-oa-26-101/model` (`Canvas` com dimensão CSS medida `637 × 468 px`):

| `deviceScaleFactor` Simulado | Dimensão Backing Store (`px`) | `effectiveDPR` | Pixeis Totais | Estimativa Mínima Color+Depth (`RGB8+D24S8`, 1 buffer) | `gl.getContextAttributes()` Verificado |
|---:|---:|---:|---:|---:|---|
| **`1`** | `636 × 468` | `0.999` | `297,648` | `2.27 MB` | `antialias: true`, **`preserveDrawingBuffer: true`**, **`powerPreference: "high-performance"`**, `depth: true`, `stencil: false`, `alpha: true` |
| **`2`** | `1273 × 936` | **`2.000`** | `1,191,528` (`4.00×`) | `9.09 MB` (sem MSAA `4x`/compositor copy) | Idem (`maxSamples = 8`) |
| **`3`** (Ecrãs HiDPI móveis) | `1273 × 936` | **`2.000`** *(capped por `dpr={[1, 2]}`)* | `1,191,528` | `9.09 MB` | Idem |

### 5.1 Verificação empírica de `frameloop="demand"` (Câmara em repouso vs Interação)

Medido em `deviceScaleFactor = 2` após estabilização inicial da cena:

- **Janela de `3,000 ms` de repouso absoluto (zero interação):**
  - `requestAnimationFrame` invocados: **`0`**
  - `drawElements` + `drawArrays`: **`0`**
  - `gl.clear`: **`0`**
  - **Resultado:** ✅ **100% conformidade** — `frameloop="demand"` (`ModelViewerStage.tsx:318`) com `<OrbitControls enableDamping={false} onChange={() => invalidate()} />` (`linhas 199-209`) consome **`0%` GPU em idle**.
- **Janela de interação ativa (arrasto Orbit + clique `Vista superior` + clique `Contorno / malha` + `300 ms`):**
  - `requestAnimationFrame`: **`4`** ciclos
  - `drawCalls`: **`34`** (`32` `drawElementsCalls` + `2` `drawArraysCalls`)
  - `clearCalls`: **`2`**

### 5.2 Gaps críticos de GPU e VRAM identificados (`PERF-NEW-02`)

1. **`preserveDrawingBuffer: true` (`ModelViewerStage.tsx:329`):** Confirmado no driver D3D11 (`actualAttrs.preserveDrawingBuffer: true`). Não existe atualmente qualquer funcionalidade de captura/exportação de imagem do canvas; esta flag impede a otimização de troca rápida de *backbuffers* do browser/compositor e obriga à preservação/cópia de memória gráfica extra a cada frame (`9.09 MB` por superfície em `DPR 2`, multiplicado com MSAA e double/triple buffering).
2. **`dpr={[1, 2]}` acima do orçamento (`1.5`) recomendado na F04 (`ModelViewerStage.tsx:319`):** Limitar a `1.5` reduz a área de renderização de `1,191,528 px` para `~670,235 px` (**`-43.75%` de fill-rate e VRAM de framebuffer**), mantendo nitidez elevada em linhas arquitetónicas. Dispositivos modestos ou preferências de movimento/bateria beneficiariam ainda de queda automática para `dpr={1}`.
3. **`powerPreference: 'high-performance'` rígido (`ModelViewerStage.tsx:328`):** Em portáteis híbridos (iGPU + dGPU), força o despertar da GPU discreta para maquetes leves de `96–192` triângulos.

---

## 6. Prioridade 5 — Trabalho Síncrono Desnecessário e Importações Estáticas

### 6.1 Novos focos na camada 3D (`PERF-NEW-04`)

1. **Duplo `scene.traverse` de `wireframe` no mesmo estado (`ModelViewerStage.tsx:85-100` e `235-249`):** Tanto `ModelViewerStage` como o filho `StageSceneController` mantêm um `useEffect([scene, settings.wireframe])` idêntico que percorre todo o grafo `THREE.Group` e define `mat.needsUpdate = true` em duplicado em cada montagem e cada alternância de arame.
2. **Reconstrução de helpers R3F por `args` inline (`ModelViewerStage.tsx:186-195`):** `<gridHelper args={[gridSize, ...]} />` e `<axesHelper args={[axesSize]} />` recebem novos arrays literais a cada render de `StageSceneController` (ex.: mudar preset de câmara, zoom, wireframe), obrigando o reconciliador `@react-three/fiber` a destruir e recriar as geometrias/materiais auxiliares.
3. **Instabilidade referencial de props em cascata (`ProjectModelEnginePage.tsx:213-224` -> `ModelEngineStageSlot.tsx:249-274` -> `ArchitecturalModelViewer.tsx`):** `ProjectModelEnginePage` passa um literal `callbacks={{ ... }}` novo a cada renderização; `ModelEngineStageSlot` recria inline `onModelLoaded`, `onModelError`, `onSelectModelSource`. Embora `ArchitecturalModelViewer` use `useRef` para evitar reiniciar o ciclo de carga em alguns desses callbacks, todos os filhos (ex.: toolbar `ModelViewerControls`, linhas `724-741` com setState inline e objetos `errorDetail`) re-renderizam sem memorização.
4. **Parsing JSON triplicado e clonagem síncrona de buffers (`glbInspector.ts` + `modelAssetRepository.ts`):**
   - Ao validar um `.gltf` local (`modelAssetRepository.ts:386`), todo o JSON é submetido a `JSON.parse()`; ao carregar no motor (`glbInspector.ts:334`), é descodificado e submetido a **2.º `JSON.parse()`**, re-serializado com `JSON.stringify(normalizedJson)` (`linha 438`) ao empacotar `.glb` em memória, e submetido a **3.º parsing interno** no `GLTFLoader`.
   - Para `.glb` (`glbInspector.ts:411`), `buffer.slice(0)` duplica toda a pegada de memória do `ArrayBuffer` na main thread antes de invocar `GLTFLoader.parse`.
   - Adicionalmente, existem **dois catálogos estáticos duplicados** para os modelos demo (`src/data/modelAssetRepository.ts` e `src/features/model-viewer/demoModels.ts`).
5. **Dupla leitura em `useProjectModelEngine.ts`:** A linha `51` invoca `useProjectLibrary()`, herdando as `2×` chamadas a `listProjects()`, e executa adicionalmente `getProject(projectId)` num `useMemo`, originando **`3` `getItem` e `43` `JSON.parse`** em `/workspace/projects/:id/model`.

### 6.2 Foco síncrono e estático herdado da Fase 03 (`c318a75`) que persiste intacto

- `src/app/App.tsx:10-18`: 8 de 9 páginas/shells importadas estaticamente (`LoginPage`, `WelcomePage`, `WorkspaceShell`, `StudioDeskPage`, `WorkspaceSettingsPage`, `ProjectLibraryCatalogPage`, `ProjectCreateEnginePage`, `ProjectDossierShellPage`, `PlannedModuleView`).
- `src/app/WorkspaceSessionContext.tsx`: continua a importar estaticamente `projectLibraryRepository`, `studioDeskFixtures`, `shellDemoState` e dicionários PT+EN.
- `vite.config.ts`: continua sem `build.rollupOptions.output.manualChunks` (mantendo `index-*.js` com `842.34 kB` e `ProjectModelEnginePage-*.js` com `890.08 kB`).
- `src/features/workspace-shell/GlobalSearchDialog.tsx:50-53` + `globalSearchIndex.ts`: reconstrói todo o índice e relê `localStorage` a cada tecla (`11` `getItem` / `11` `JSON.parse` em 10 teclas).
- `src/features/project-library/useProjectLibrary.ts` e `projectLibraryRepository.ts`: dupla chamada a `listProjects()`, `cloneRecord` via `JSON.parse(JSON.stringify(...))`, `32` `JSON.parse` no Dossier e **`7` `getItem` para `1` escrita** em `updateProjectMetadata`.
- `src/utils/timeGreeting.ts`: sem cache de `Intl.DateTimeFormat` (`8` chamadas em `/welcome`, `5` em `/workspace`, `6` em `/model`).
- `src/features/studio-desk/FeaturedProjectPlate.tsx:76-77` e `ProjectOverviewPanel.tsx:252-253`: mantêm `loading="eager" decoding="sync"`; `ProjectGalleryView.tsx:472` sem `decoding="async"`, paginação ou pré-normalização NFD.
- `src/features/studio-desk/StudioDeskPage.tsx:1`: mantém import não utilizado de `motion` e import estático de `ProjectDossierDialog`; `index.html:10-13` mantém carregamento síncrono de Google Fonts; `WorkspaceShell.tsx:15` importa `GlobalSearchDialog` estaticamente.

---

## 7. Comparação F03 (`c318a75`) vs Pós-Integração F04 (`ac13ee1`) & Estado dos Quality Gates

### 7.1 Resultado dos comandos de verificação na branch pós-integração (`ac13ee1`)

| Gate Executado | Estado | Resultado Exato Observado |
|---|---|---|
| `npm run lint` | ✅ **Passou** | `0` erros, `0` avisos (`LINT_EXIT=0`) |
| `npm run build` | ✅ **Passou** | `2,784` módulos em `1m 19s` (`BUILD_EXIT=0`); 2 chunks `> 500 kB` + 1 aviso CSS `.pl-[var(--tracking-*)]` |
| `npm run test:e2e` | ✅ **Passou** | Playwright/Chromium `1440×900`, `1440×680`, `768×1024`, `720×450` e `375×812` incl. WebGL real (`192` e `96` triângulos, trocas `.gltf`/`.glb`) concluído sem erros (`exit 0`) |
| `npm run test` *(execução isolada)* | ✅ **Passou** | `9/9` ficheiros, **`73/73` testes** em **`77.04 s`** (vs `38.99 s` na F03 = **`+97.6%`**); emite `DeprecationWarning: require("three")` no jsdom |
| `npm run test` *(sob contenção de CPU)* | ⚠️ **Instável (`5` falhas)** | Sob concorrência no sistema, falhou `5/73` testes em `3` ficheiros (`modelEngine.test.tsx`, `projectExperience.test.tsx`, `projectLibrary.test.tsx`) por timeout (`20 s`/`45 s`) e intercalação de teclas `userEvent` (`"oAjreqcutiov..."`) — margem curta do teste único de `30.78 s` para limite de `45 s` |

### 7.2 Tabela comparativa de problemas (Corrigidos · Persistentes · Novos)

| ID | Prioridade | Estado vs F03 (`c318a75`) | Área | Problema & Evidência Empírica Pós-Integração (`ac13ee1`) |
|---|---|---|---|---|
| **`PERF-P0-01`** | **P1** *(era P0)* | 🟡 **Parcialmente Corrigido** | Bundle & Rotas | **Corrigido no motor 3D:** `ProjectModelEnginePage-*.js` (`890.08 kB`) e `ModelViewerStage-*.js` (`199.01 kB`) são lazy (`0` bytes carregados antes de `/model`). **Persistente:** 8 rotas não-3D continuam estáticas em `App.tsx`, `vite.config.ts` sem `manualChunks` e `index-*.js` cresceu para **`842.34 kB`**. |
| **`PERF-P0-02`** | **P1** *(era P0)* | 🟡 **Parcialmente Corrigido** | Motor 3D / GPU | **Corrigido em idle e buffers:** `frameloop="demand"` tem **`0` draws/`0` rAF** em `3 s` idle; `disposeThreeObjectResources()` liberta **100%** dos `WebGLBuffer` (`1,030 / 1,030`) e `dpr` tem teto `[1, 2]`. **Persistente:** Fugas de nós/listeners/handles WebGL e ausência de teto `1.5`. |
| **`PERF-NEW-01`** | **P0** | 🆕 **Novo (Fase 04)** | Ciclo de Vida WebGL / Memória | Remontagem completa do `<Canvas>` em cada troca de modelo (`setStatus('loading')` -> desmonta `LazyModelViewerStage`) + **`40` contextos `detectWebGLSupport()` sem `loseContext()`** (`70` contextos criados em 10 ciclos) + fuga linear de **`~971` nós DOM detached/ciclo** (`545 -> 10,257`), `+46` listeners/ciclo (`223 -> 683`), `+120` texturas / `+60` programas / `+90` framebuffers vivos pós-saída e **`+3.07 MB` heap pós-GC (`+34.6%`)**. |
| **`PERF-NEW-02`** | **P0** | 🆕 **Novo (Fase 04)** | GPU / VRAM / Compositor | `preserveDrawingBuffer: true` ativo sem funcionalidade de screenshot (`ModelViewerStage.tsx:329`), `dpr={[1, 2]}` consome `4×` pixels em ecrãs HiDPI (`1,191,528` px vs `~670k` em `1.5`), e `powerPreference: 'high-performance'` rígido sem modo económico. |
| **`PERF-NEW-03`** | **P1** | 🆕 **Novo (Fase 04)** | Acoplamento Bundle | `ProjectDossierShellPage.tsx:9` importa `modelAssetRepository.ts` (`29.08 KiB` pre-minify), vazando metadados 3D para `index-*.js` (`+31.80 kB` raw no entry). |
| **`PERF-NEW-04`** | **P1** | 🆕 **Novo (Fase 04)** | Re-renders R3F & Buffers | Duplo `scene.traverse` wireframe (`ModelViewerStage.tsx:85` + `235`), `args={[...]}` inline em `<gridHelper>`/`<axesHelper>`, props `callbacks` inline, triplo `JSON.parse` em `.gltf` local e `buffer.slice(0)` em `.glb`. |
| **`PERF-P1-01`** | **P1** | 🔴 **Persistente** | Pesquisa Global | `11` leituras `localStorage` + `11` `JSON.parse` em 10 teclas; `86.15 ms/tecla` a 200 projetos (`13.48 MB` lidos em 10 teclas). |
| **`PERF-P1-02`** | **P1** | 🔴 **Persistente (+Agravado)** | Repositório & `/model` | Dupla leitura em `useProjectLibrary` (herdada agora por `useProjectModelEngine`: **`43` `JSON.parse`** ao abrir `/model`); `32` `JSON.parse` no Dossier (`+2`); **`7` leituras por gravação** em `updateProjectMetadata` (`+1`). |
| **`PERF-P1-03`** | **P1** | 🔴 **Persistente** | Main Thread / I18n | `timeGreeting.ts` cria `3–8` `new Intl.DateTimeFormat(...)` por renderização (`/welcome` `8`, `/model` `6`, `/workspace` `5`). |
| **`PERF-P1-04`** | **P1** | 🔴 **Persistente** | Entry Context | `WorkspaceSessionContext.tsx` mantém imports estáticos de repositórios, fixtures e PT+EN. |
| **`PERF-P1-05`** | **P1** | 🔴 **Persistente** | Imagens Studio Desk | `FeaturedProjectPlate.tsx` e `ProjectOverviewPanel.tsx` mantêm `loading="eager" decoding="sync"`. |
| **`PERF-P1-06`** | **P1** | 🔴 **Persistente** | Escala Catálogo | A `200` projetos gera `18,775` nós CDP em `484.11 ms` sem `content-visibility: auto`, paginação ou pré-normalização NFD. |
| **`PERF-P2-01`..`04`** | **P2** | 🔴 **Persistentes** | Motion / Fonts / Clones | `framer-motion` sem `LazyMotion` e `StudioDeskPage` import não usado; arrays não memoizados no Dossier; `cloneRecord` via `JSON.parse(JSON.stringify(...))`; Google Fonts bloqueante; hooks focus-trap duplicados. |
| **`PERF-NEW-05`** | **P2** | 🆕 **Novo (Fase 04)** | Toolchain & DX | Duração Vitest duplicou (`38.99 s -> 77.04 s` com risco de timeout paralelo); `30` warnings `THREE.Clock`; `THREE_CJS_DEPRECATED` no teste; aviso CSS `--tracking-*`; `models/README.md` em `dist/`. |

---

## 8. Proposta de Correções Incrementais (Roadmap por Lotes)

Cada lote foi desenhado para aplicação segura e verificável com `npm run lint`, `npm run test`, `npm run build` e `npm run test:e2e`, sem alterar requisitos funcionais de UX.

### Lote 1 (`P0` · GPU, VRAM e Estabilidade de Contextos WebGL) — *Maior impacto técnico imediato*

1. **Preservar `<Canvas>` vivo durante troca de modelo (`ArchitecturalModelViewer.tsx`):**
   - Manter `LazyModelViewerStage` montado enquanto existir uma `loadedScene` válida ou `status === 'loading'` durante troca de fonte, mostrando o indicador de carregamento como **overlay transparente sobre o stage** em vez de desmontar o `<Canvas>`.
   - **Impacto esperado:** Reduz criações de contexto WebGL de `3` para `1` por visita ao visualizador (**`-66%` de inicializações de shader/renderer** e elimina piscar negro).
2. **Cache e libertação segura em `detectWebGLSupport()` (`glbInspector.ts:15-38`):**
   - Guardar em cache ao nível do módulo quando `override === undefined` e, no probe inicial, invocar `gl.getExtension('WEBGL_lose_context')?.loseContext()` antes de descartar o `<canvas>` auxiliar. Remover a segunda chamada redundante em `ModelViewerStage.tsx:231` (receber via prop ou usar cache).
   - **Impacto esperado:** Elimina os **`40` contextos WebGL órfãos** medidos nos 10 ciclos.
3. **Remover `preserveDrawingBuffer: true` e ajustar `dpr` / `powerPreference` (`ModelViewerStage.tsx:317-330`):**
   - Definir `preserveDrawingBuffer: false` (só ativar temporariamente ou fazer `invalidate()` + `toDataURL()` síncrono se futura funcionalidade de captura for criada).
   - Ajustar `dpr={[1, 1.5]}` (ou `1` quando `navigator.hardwareConcurrency <= 4` ou GPU software/SwiftShader) e `powerPreference: 'default'` (ou configurável).
   - **Impacto esperado:** **`-43.75%`** pixeis renderizados e fill-rate em HiDPI (`1.19M -> ~670k`), menos pressão térmica e sem bloqueio de page-flipping no compositor.
4. **Rastrear e eliminar a fuga de nós DOM *detached* pós-unmount (`ModelViewerStage.tsx` / `ArchitecturalModelViewer.tsx`):**
   - No cleanup de `useEffect` de desmontagem de `ModelViewerStage` / R3F root, validar `gl.renderLists.dispose()` + `gl.dispose()` explícito antes da desmontagem, garantir remoção de todos os listeners (`resize`/`pointer`) e validar via CDP que `Memory.getDOMCounters().nodes` retorna estável entre Ciclo 1 e Ciclo 10 (`delta <= 50` nós, delta heap `< 0.5 MB`).

### Lote 2 (`P1` · Desacoplamento de Bundle e Eliminação de Redundâncias R3F/GLTF)

1. **Extrair `resolveProjectModelState` leve para fora de `modelAssetRepository.ts`:**
   - Mover apenas a resolução leve necessária ao `ProjectDossierShellPage` (ou lazy-load do detalhe de catálogo/modelos) e deduplicar `demoModels.ts` vs `modelAssetRepository.ts`.
   - **Impacto esperado:** Remove `~39.5 KiB` pre-minify do chunk `index-*.js`.
2. **Code-splitting de rotas + `manualChunks` (`src/app/App.tsx`, `vite.config.ts`):**
   - Converter `WelcomePage`, `StudioDeskPage`, `ProjectLibraryCatalogPage`, `ProjectCreateEnginePage`, `ProjectDossierShellPage`, `WorkspaceSettingsPage` e `PlannedModuleView` para `React.lazy()`.
   - Configurar `manualChunks` separando `vendor-react`, `vendor-router`, `vendor-motion`, `vendor-three` (`three` + `three-stdlib` + `three/examples`) e `vendor-r3f` (`@react-three/*`).
   - **Impacto esperado:** Entry inicial em `/login` cai de `842.34 kB` (`231.53 KiB` gzip) para `< 300 kB` raw (`~90–110 KiB` gzip), e permite cache de longo prazo independente da app vs `vendor-three`.
3. **Limpeza R3F e pipeline glTF (`ModelViewerStage.tsx`, `ProjectModelEnginePage.tsx`, `glbInspector.ts`):**
   - Remover o `useEffect` duplicado de wireframe em `ModelViewerStage.tsx:235-249` (mantendo apenas o de `StageSceneController` com `invalidate()`).
   - Memoizar `gridArgs` e `axesArgs` em `useMemo` em `StageSceneController`.
   - Memoizar `callbacks` com `useMemo`/`useCallback` em `ProjectModelEnginePage.tsx` e `ModelEngineStageSlot.tsx`.
   - Eliminar `JSON.parse` triplicado em `.gltf` (reaproveitar `rawText`/header validado) e evitar `buffer.slice(0)` quando o buffer pertence ao loader local sem reutilização posterior.

### Lote 3 (`P1` · Cache em Memória do Repositório, Pesquisa Global e Main Thread)

1. **Cache em memória em `src/data/projectLibraryRepository.ts`:** Manter `cachedEnvelope` / `cachedList` invalidada apenas em escritas e evento `storage`, reduzindo leituras e `JSON.parse` por navegação de `32–43` para `<= 1`, e reduzindo escrita de metadados de `7` `getItem` para `0–1`.
2. **Eliminar leitura dupla em `useProjectLibrary.ts` e `getProject` no render de `ProjectDossierShellPage.tsx`:** Derivar `studioDeskProjects` com `useMemo`; `useProjectModelEngine.ts` passa a consumir apenas o projeto alvo sem desencadear dupla leitura global.
3. **Pré-indexação na Pesquisa Global (`globalSearchIndex.ts`, `GlobalSearchDialog.tsx`):** Construir e normalizar NFD uma só vez ao abrir o diálogo (ou por mudança no repositório), reduzindo `10` teclas com `200` projetos de `11` leituras (`86.15 ms/tecla`) para `0` leituras (`< 5 ms/tecla`).
4. **Singleton cache em `timeGreeting.ts` (`Map<string, Intl.DateTimeFormat>`):** Ganho comprovado de **`21.6×`** no custo de formatação.
5. **`loading="lazy" decoding="async"` e escala de catálogo:** Atualizar `FeaturedProjectPlate.tsx`, `ProjectOverviewPanel.tsx` e `ProjectGalleryView.tsx`, adicionando `content-visibility: auto` e pré-computação NFD nos cartões do catálogo.

### Lote 4 (`P2` · Polimento Final, Assets e Robustez da Suíte Vitest)

- Mover `README.md` de `public/assets/models/` para `docs/` (não servir Markdown em `dist/`); corrigir origem CSS `--tracking-*`; avaliar `LazyMotion` e remover import morto `motion` em `StudioDeskPage.tsx:1`; transformar `ProjectDossierDialog` e `GlobalSearchDialog` em lazy; tornar `fonts.googleapis.com` não-bloqueante em `index.html`; e configurar `poolOptions` / timeouts e mock de recursos pesados nos testes Vitest para estabilizar a duração abaixo de `45 s` sem falhas sob carga.

---

## 9. Resumo de Ficheiros Alvo para Correções Futuras

| Ficheiro | Lote / Prioridade | Ação Proposta |
|---|---|---|
| `src/features/model-viewer/ModelViewerStage.tsx` | Lote 1 (`P0`) / Lote 2 | `preserveDrawingBuffer: false`, `dpr={[1, 1.5]}`, `powerPreference: 'default'`, remover 2.º `detectWebGLSupport()`, memoizar `gridArgs`/`axesArgs`, remover `useEffect` wireframe duplicado, cleanup explícito de renderer. |
| `src/features/model-viewer/ArchitecturalModelViewer.tsx` | Lote 1 (`P0`) | Não desmontar `LazyModelViewerStage` durante troca de modelos (usar loading overlay); estabilizar listeners e cleanup de desmontagem. |
| `src/features/model-viewer/glbInspector.ts` | Lote 1 (`P0`) / Lote 2 | Cachear `detectWebGLSupport()` e chamar `WEBGL_lose_context.loseContext()` no canvas temporário; evitar triplo parsing `.gltf` e `buffer.slice(0)` desnecessário. |
| `src/features/model-engine/ProjectModelEnginePage.tsx` & `ModelEngineStageSlot.tsx` | Lote 2 (`P1`) | Memoizar `callbacks` e props passadas ao visualizador; extrair helpers leves usados fora de `/model`. |
| `src/features/model-engine/useProjectModelEngine.ts` | Lote 3 (`P1`) | Eliminar a cascata de `useProjectLibrary()` + `getProject()` (`43` `JSON.parse` -> `<= 1`). |
| `src/data/modelAssetRepository.ts` & `src/features/model-viewer/demoModels.ts` | Lote 2 (`P1`) | Desacoplar resolução leve do Dossier para sair do chunk inicial e consolidar definições demo duplicadas. |
| `src/app/App.tsx`, `WorkspaceSessionContext.tsx`, `vite.config.ts` | Lote 2 (`P1`) | `React.lazy()` nas 8 rotas restantes + `manualChunks` (`vendor-three`, `vendor-r3f`, `vendor-react`, `vendor-motion`) + desacoplar imports estáticos do Context. |
| `src/data/projectLibraryRepository.ts`, `useProjectLibrary.ts`, `ProjectDossierShellPage.tsx` | Lote 3 (`P1`) | Cache em memória com invalidação por escrita/`storage`, `structuredClone` seletivo, memoização de `deskProject`/`documents`/`revisions`. |
| `src/features/workspace-shell/globalSearchIndex.ts` & `GlobalSearchDialog.tsx` | Lote 3 (`P1`) | Índice pré-normalizado em memória + lazy import do conteúdo modal. |
| `src/utils/timeGreeting.ts`, `FeaturedProjectPlate.tsx`, `ProjectOverviewPanel.tsx`, `ProjectGalleryView.tsx` | Lote 3 (`P1`) | Cache `Intl.DateTimeFormat`, `decoding="async"` / `loading="lazy"`, `content-visibility: auto`. |
| `index.html`, `StudioDeskPage.tsx`, `public/assets/models/README.md` | Lote 4 (`P2`) | Carregamento não-bloqueante de fontes, remover `motion` não usado + lazy `ProjectDossierDialog`, mover `README.md` para `docs/`. |
