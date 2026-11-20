# Relatório de Entrega — `0451-PERF-01` (`@agent-c`)

- **Identificador da tarefa:** `0451-PERF-01`
- **Agente:** `@agent-c` (Performance & Architecture Auditor)
- **Fase / Ciclo:** Fase 04.5.1 · Onda 3 (Verificação Independente Dirigida de Performance vs `4197c2e` — `APROVADO: plans/015-phase-0451-closure.md`)
- **Branch de trabalho:** `codex/f0451-audit-agent-c`
- **Commit candidato auditado:** `df6bd439a658a6161d9d07879a68909ffc5df211` (`origin/codex/f0451-integration-candidate`)
- **Commit base de comparação:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` (baseline da Fase 04.5 e referência original `37265d5914f161bd9a45f688b8f85f48fffdd7b0`)
- **Estado:** `PASSED`

---

## 1. Objectivo e Âmbito

Verificar de forma independente, económica e reproduzível no candidato integrado `df6bd439a658a6161d9d07879a68909ffc5df211` (`oaworkspace-f0451-perf`, porta dedicada `vite preview` `4176`) o efeito real das três optimizações P1 de performance e arquitectura da Fase 04.5.1 face à baseline `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`:

1. **`F0451-P1-7` (`src/app/WorkspaceSessionContext.tsx`):** Confirmar a extracção dos repositórios de domínio (`projectLibraryRepository`, `modelAssetRepository`, `studioDeskFixtures`, `shellDemoState`) do bundle inicial `index-*.js`, medir Raw (`kB`/`KiB`), Gzip-9 e Brotli-11, validar `0` dependências circulares no grafo ES estático e `0 B` de `vendor-three`, `vendor-r3f`, `ModelViewerStage`, `vendor-motion`, `projectLibraryRepository` e `modelAssetRepository` no entry (`dist/index.html` `modulepreload` + fecho transitivo).
2. **`F0451-P1-6` (`index.html`):** Confirmar em Chromium Headless (`5×` por cenário) que o carregamento não-bloqueante de `fonts.googleapis.com` (`preload` + `media="print" onload="this.media='all'"` + pesos `Outfit` `300;400;500;600`) elimina o bloqueio de `~600–730 ms` sobre a execução de `index-*.js` e `preloadInitialBrowserRoute()` em `/login` e `/welcome`.
3. **`F0451-P1-8` (`src/features/model-viewer/ArchitecturalModelViewer.tsx`):** Confirmar em `PerformanceResourceTiming` (`5×` frio em `/workspace/projects/sd-proj-oa-26-101/model`) que `ModelViewerStage-*.js` + `vendor-r3f-*.js` iniciam download **em paralelo** com o `.glb` (antes de `status === 'loaded'`), medir o ganho frio/mediana/P95 e confirmar `0 B` de 3D fora de `/model`.

**Fronteiras respeitadas:** zero alterações em código de produção (`src/`, `index.html`, `vite.config.ts`, `package.json`, `PROJECT_MAP.md`), `main` ou website público `oaworkshop`; scripts temporários executados exclusivamente em `%TEMP%\oa-audit-c-f0451\` e removidos antes do commit.

---

## 2. Ficheiros Modificados

- `docs/agent-reports/phase-0451/0451-PERF-01-agent-c.md` *(exclusivamente este relatório)*

---

## 3. Trabalho Executado

1. **Build de produção independente (`npm run build` em `oaworkspace-f0451-perf`):** `tsc -b && vite build` concluído com `2 787` módulos transformados, `0` erros e `0` avisos de dependências circulares.
2. **Auditoria de Bundles, Grafo Estático e Sondagem Binária (`verify-f0451.mjs`):**
   - Medição exacta em bytes, `kB` decimal, `KiB` binário, Gzip (`level: 9`) e Brotli (`quality: 11`) sobre todos os 26 artefactos em `dist/assets/` (`25` JS + `1` CSS).
   - Construção do grafo estático de imports ES e verificação DFS de ciclos (`circularStaticDependencies: []`).
   - Sondagem de conteúdo sobre `index-CoiNU48b.js` confirmando ausência total de código de `projectLibraryRepository`, `studioDeskFixtures`, `modelAssetRepository`, `shellDemoState`, `globalSearchIndex`, `three` e `framer-motion`.
3. **Benchmarks Dirigidos Multi-Execução em Chromium Headless (`playwright-core`, `vite preview --port 4176`, `1440×900`, `deviceScaleFactor=1`, `5×` por cenário):**
   - `/login` (Google Fonts online, `5×` frio)
   - `/welcome` (Google Fonts online, `5×` frio)
   - `/welcome` (Google Fonts bloqueadas, `5×` frio)
   - `/workspace/projects/sd-proj-oa-26-101/model` (WebGL 3D real, `5×` frio)

---

## 4. Testes Realizados e Resultados Reais (`4197c2e` vs `df6bd43`)

### 4.1 Delta de Bundles e Isolamento no Entry (`F0451-P1-7`)

| Artefacto / Métrica | Fase 04.5 (`4197c2e`) | Fase 04.5.1 (`df6bd43`) | Delta (`df6bd43` vs `4197c2e`) | Delta Acumulado vs `37265d5` |
|---|---:|---:|---:|---:|
| **`index-*.js` (entry app)** | `160.11 kB` (`156.36 KiB` raw / `47.30` gz / `40.54` br) | **`73.75 kB` (`72.02 KiB` raw / `23.20` gz / `20.09` br)** | **`-86.36 kB` (`-53.94%` raw / `-50.95%` gz / `-50.44%` br)** | `-91.32%` raw (`830.16 → 72.02 KiB`) |
| **Entry total em `/login` (`index` + `vendor-react` + `vendor-router` + `vendor-icons`)** | `438.21 kB` (`427.94 KiB` raw / `134.21` gz / `116.02` br) | **`351.86 kB` (`343.61 KiB` raw / `110.11` gz / `95.57` br)** | **`-86.35 kB` (`-19.71%` raw / `-17.96%` gz / `-17.63%` br)** | **`-58.61%` raw / `-52.84%` gz / `-50.39%` br** |
| **JS total em `/welcome` (Entry + `WelcomePage`)** | `452.27 kB` (`441.67 KiB` raw / `137.81` gz / `119.22` br) | **`365.92 kB` (`357.34 KiB` raw / `113.71` gz / `98.77` br)** | **`-86.35 kB` (`-19.09%` raw / `-17.49%` gz / `-17.15%` br)** | **`-56.96%` raw** |
| `projectLibraryRepository-*.js` (novo chunk lazy) | Embutido em `index-*.js` | `62.70 kB` (`61.23 KiB` raw / `18.26` gz / `16.00` br) | **`0 B` em `/login` e `/welcome`** | Carrega só em `/workspace/*` |
| `modelAssetRepository-*.js` (novo chunk lazy) | Embutido em `index-*.js` | `21.56 kB` (`21.06 KiB` raw / `7.31` gz / `6.49` br) | **`0 B` em `/login`, `/welcome` e `/workspace`** | Carrega só em Dossier / `/model` / logout |
| `vendor-three-*.js` + `vendor-r3f-*.js` + `ModelViewerStage-*.js` | `780.20` + `188.13` + `8.16 KiB` | `780.20` + `188.13` + `8.25 KiB` | **`0 B` fora de `/model`** | 100% isolados em `/model` |
| `vendor-motion-*.js` | `122.74 kB` (`119.87 KiB` raw / `39.06` gz / `34.99` br) | `122.74 kB` (`119.87 KiB` raw / `39.06` gz / `34.99` br) | **`0 B` fora de `/workspace`** | Único importer: `StudioDeskPage` |
| **Dependências circulares estáticas (DFS)** | `0` | **`0`** | Intacto (`0` ciclos em `25` chunks JS) | Intacto |

**Sondagem binária de `index-CoiNU48b.js` (`indexContentProbes`):**
- `hasProjectLibraryRepositoryCode: false` (era `true` em `4197c2e`)
- `hasStudioDeskFixturesCode: false` (era `true` em `4197c2e`)
- `hasModelAssetRepositoryCode: false` (era `true` em `4197c2e`)
- `hasShellDemoStateCode: false` (era `true` em `4197c2e`)
- `hasGlobalSearchCode: false` · `hasThreeLiteral: false` · `hasFramerMotionLiteral: false`
- `dist/index.html` `modulepreload`: exclusivamente `vendor-react-Bhi6XC7t.js`, `vendor-icons-IyKiPRs-.js` e `vendor-router-DtzEAF4P.js`.

---

### 4.2 Delta de Tempo por Rota e FCP em Chromium Headless (`F0451-P1-6`, `F0451-P1-7`, `F0451-P1-8`)

| Cenário (`1440×900`, `vite preview --port 4176`) | JS Raw (`KiB`) `4197c2e` → `df6bd43` | Frio (`ms`) `4197c2e` → `df6bd43` | Mediana (`ms`) `4197c2e` → `df6bd43` | P95 (`ms`) `4197c2e` → `df6bd43` | FCP Mediana (`ms`) `4197c2e` → `df6bd43` | 3D Carregado? | Erros |
|---|---:|---:|---:|---:|---:|:---:|:---:|
| **`/login` (fonts online, 5×)** | `427.94` → **`343.61`** (`-19.7%`) | `1 237.54` → **`175.25`** (`-85.8%`) | `1 162.83` → **`162.78`** (`-86.0%`) | `1 440.90` → **`175.25`** (`-87.8%`) | `1 004` → **`132`** (`-86.9%`) | **Não (`0 B`)** | `0` |
| **`/welcome` (fonts online, 5×)** | `441.67` → **`357.34`** (`-19.1%`) | `1 439.68` → **`436.64`** (`-69.7%`) | `1 439.68` → **`446.85`** (`-69.0%`) | `1 552.77` → **`470.65`** (`-69.7%`) | `944` → **`100`** (`-89.4%`) | **Não (`0 B`)** | `0` |
| **`/welcome` (fonts bloqueadas, 5×)** | `441.67` → **`357.34`** (`-19.1%`) | `770.82` → **`472.77`** (`-38.7%`) | `710.45` → **`472.77`** (`-33.5%`) | `770.82` → **`475.41`** (`-38.3%`) | `336` → **`116`** (`-65.5%`) | **Não (`0 B`)** | `0` |
| **`/workspace/projects/:id/model` (3D WebGL, 5× frio)** | `1 542.87` → `1 544.97` | `1 143.99` → **`962.57`** (`-15.9%`) | `1 275.62` → **`987.29`** (`-22.6%`) | `1 345.12` → **`994.53`** (`-26.1%`) | `268` → **`112`** (`-58.2%`) | **Sim (só aqui)** | `0` |

---

### 4.3 Prova em `PerformanceResourceTiming` — Eliminação dos Dois Gargalos de Waterfall

#### A. `/welcome` com Google Fonts Online (`F0451-P1-6` + `F0451-P1-7`)
- **Antes (`4197c2e`):** `fonts.googleapis.com` (`22.1 → 650.3 ms`, `rel="stylesheet"` bloqueante) retinha a avaliação de `<script type="module" src="/assets/index-*.js">`; apesar de os 4 chunks iniciais terminarem aos `105.2 ms`, `WelcomePage-*.js` só iniciava download aos **`745.3 ms`** (`+640 ms` de espera ociosa) e `welcome-maquette-study.webp` terminava aos `1 012.7 ms`.
- **Agora (`df6bd43`):**
  - `fonts.googleapis.com` carrega em background (`9.5 → 567.3 ms`, `8.1 KiB`, `media="print" onload="this.media='all'"`) **sem bloquear** o parser nem os módulos ES.
  - `index-CoiNU48b.js` (`72.0 KiB`) + `vendor-react` + `vendor-router` + `vendor-icons` + CSS iniciam aos `9.7 ms` e terminam aos **`31.8 ms`**.
  - `preloadInitialBrowserRoute()` dispara imediatamente e **`WelcomePage-D-BMuDNg.js` (`13.7 KiB`) inicia aos `46.6 ms` e termina aos `50.7 ms`** (**`698.7 ms` mais cedo** que em `4197c2e`!).
  - `welcome-maquette-study.webp` (`50.6 KiB`) termina aos **`93.4 ms`** (vs `1 012.7 ms` em `4197c2e`), com FCP aos **`100 ms`** e rota interactiva aos **`446.85 ms`** (mediana online equivalente à mediana offline `472.77 ms`).

#### B. Visualizador 3D `/workspace/projects/sd-proj-oa-26-101/model` (`F0451-P1-8`)
- **Antes (`4197c2e`):** Waterfall sequencial em que `oa-ponta-vermelha-pavilion-demo.glb` era descarregado (`581.5 → 602.8 ms`) e parseado pelo `GLTFLoader`, e só aos **`624.9 ms`** (após `status === 'loaded'`) `ModelViewerStage` (`624.9 → 646.6 ms`) e `vendor-r3f` (`625.4 → 675.0 ms`) iniciavam download.
- **Agora (`df6bd43`):**
  - Etapa 1 (`15.1 → 45.6 ms`): Entry 4 chunks + CSS (`343.61 KiB`).
  - Etapa 2 (`60.0 → 128.0 ms`): `preloadInitialBrowserRoute()` descarrega em paralelo `WorkspaceShell`, `ProjectModelEnginePage`, `projectLibraryRepository`, `modelAssetRepository` e `vendor-three` (`780.20 KiB` em `67.5 ms`).
  - Etapa 3 (`429.5 → 446.5 ms`, **100% paralelo**):
    - `/assets/ModelViewerStage-B1d05ThL.js` (`8.25 KiB`): **`startTime: 429.5 ms` → `responseEnd: 438.6 ms` (`9.1 ms`)**
    - `/assets/vendor-r3f-DFAmaKRO.js` (`188.13 KiB`): **`startTime: 429.6 ms` → `responseEnd: 446.5 ms` (`16.9 ms`)**
    - `/assets/models/oa-ponta-vermelha-pavilion-demo.glb` (`23.55 KiB`): **`startTime: 430.0 ms` → `responseEnd: 439.5 ms` (`9.5 ms`)**
  - `ModelViewerStage` e `vendor-r3f` iniciam `0.5 ms` **antes** do `fetch` do `.glb`, sobrepondo totalmente a transferência e compilação de R3F ao carregamento e parsing do modelo 3D, trazendo o cold load WebGL completo para **`< 1 segundo`** (`962.57 ms` frio · `987.29 ms` mediana · `994.53 ms` P95).

---

## 5. Problemas `P0` / `P1` / `P2`

- **P0 (Críticos / Bloqueantes):** Nenhum identificado.
- **P1 (Alto impacto):** Nenhum remanescente (`F0451-P1-6`, `F0451-P1-7` e `F0451-P1-8` integralmente resolvidos e comprovados com evidência empírica).
- **P2 (Backlog não-bloqueante para fases seguintes, inalterado conforme âmbito aprovado):**
  - `vendor-motion` (`122.74 kB` raw / `34.99 KiB` Brotli) permanece isolado a `/workspace` (`StudioDeskPage`) por respeito à restrição de manter `package.json` intocado nesta sub-fase.
  - Paginação/virtualização futura em `ProjectOverviewPanel` apenas se o limite `MAX_LOCAL_PROJECTS = 50` vier a ser expandido.

---

## 6. Limitações e Pendências

- Nenhuma pendência de performance ou arquitectura para o fecho da Fase 04.5.1.
- Todos os artefactos temporários em `%TEMP%\oa-audit-c-f0451*` foram limpos e `git status --short` contém exclusivamente este relatório.

---

## 7. Recomendações

- Aprovar o candidato `df6bd439a658a6161d9d07879a68909ffc5df211` (`codex/f0451-integration-candidate`) no critério de Performance & Arquitectura para integração final em `codex/f02-integration-preview` após validação conjunta com o Quality Gate de `@agent-d` (`0451-QA-01`).
