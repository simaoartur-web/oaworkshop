# Relatório Técnico — Fase 04.5 · Auditoria Independente de Performance & Arquitectura (`045-PERF-01`)

- **Identificador da tarefa:** `045-PERF-01`
- **Agente:** `@agent-c` (Performance & Architecture Auditor)
- **Origem das evidências:** Publicação directa do relatório empírico concluído no Swarm Board (`#10`, `2026-11-19 19:04:29`) sem re-execução de benchmarks
- **Objectivo e âmbito:** Auditoria empírica e arquitectural independente do commit integrado `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` comparado directamente com a base `37265d5914f161bd9a45f688b8f85f48fffdd7b0`, com investigação dedicada a `/welcome`, Studio Desk (`/workspace`) e visualizador 3D (`/model`), memória CDP e qualidade arquitectural.
- **Branch da tarefa:** `codex/f045-audit-agent-c`
- **Commit base:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` (`origin/codex/f02-integration-preview`, comparado contra `37265d5914f161bd9a45f688b8f85f48fffdd7b0`)
- **Estado:** `PASSED` *(auditoria concluída com evidências reproduzíveis e worktrees temporários limpos; 0 P0, 3 P1 de performance/arquitectura, 5 P2)*

---

## 1. Ficheiros Modificados

- `docs/agent-reports/phase-045/045-PERF-01-agent-c.md` *(apenas este relatório; zero alterações em código de produção)*

### Ficheiros Auditados (Somente Leitura)
- Documentação e Planos: `AGENTS.md`, `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md`, `plans/011-phase-045a-data-consistency.md`, `plans/012-phase-045b-loading-performance.md`, `plans/013-phase-045-integration.md`.
- Código auditado: `vite.config.ts`, `index.html`, `package.json`, `src/app/{App,routePreload,WorkspaceSessionContext}.*`, `src/data/{projectLibraryRepository,projectLibraryAdapter}.ts`, `src/features/workspace-shell/{WorkspaceShell,ArchitecturalRail,ContextualHeader,GlobalSearchDialog,globalSearchIndex,shellNavigation}.*`, `src/features/studio-desk/{StudioDeskPage,StudioOpening,FeaturedProjectPlate,ProjectOverviewPanel,ProjectDossierDialog}.tsx`, `src/features/welcome/WelcomePage.tsx`, `src/features/auth-demo/LoginPage.tsx`, `src/features/loading/RouteLoadingStates.tsx`, `src/features/model-engine/ProjectModelEnginePage.tsx`, `src/features/model-viewer/{ArchitecturalModelViewer,ModelViewerStage}.tsx`, `src/features/project-library/useProjectLibrary.ts`, `src/utils/timeGreeting.ts`, `src/design-system/tokens.css`.

---

## 2. Trabalho Executado e Evidências Medias (`37265d5` vs `4197c2e`)

### 2.1 Bundles, Chunking & Isolamento (`npm run build` independente)

| Métrica / Artefacto | Base `37265d5` | Final `4197c2e` | Delta / Estado |
|---|---:|---:|---|
| **Entry inicial efectivo (`/login`)** | `850.09 kB` (`830.16 KiB` raw / `233.48` gz / `192.66` br · 1 chunk) | **`438.21 kB` (`427.94 KiB` raw / `134.21` gz / `116.02` br · 4 chunks)** | **`-48.5%` raw / `-42.5%` gz / `-39.8%` br** |
| `index-*.js` (entry app) | `850.09 kB` (`830.16 KiB`) | `160.11 kB` (`156.36 KiB` / `47.30` gz / `40.54` br) | Inclui ainda 4 repos via `WorkspaceSessionContext` (P1) |
| `vendor-react` + `vendor-router` + `vendor-icons` | Embutidos em `index` | `223.06` + `39.20` + `15.85 kB` (`modulepreload` em `dist/index.html`) | Cache independente de vendors |
| `WelcomePage-*.js` | Embutido em `index` | `14.06 kB` (`13.73 KiB` / `3.60` gz / `3.20` br) | Lazy apenas em `/welcome` |
| `WorkspaceShell-*.js` + `StudioDeskPage-*.js` | Embutidos em `index` | `34.64` + `89.52 kB` (`8.83` + `19.40 KiB` gz) | Lazy em `/workspace` |
| `vendor-motion-*.js` | Embutido em `index` | `122.74 kB` (`119.87 KiB` / `39.06` gz / `34.99` br) | **Isolado** (único importer: `StudioDeskPage`) |
| `ProjectModelEnginePage` + `ModelViewerStage` | `894.34` + `200.66 kB` | `91.31` + `8.36 kB` | Lazy apenas em `/model` |
| `vendor-three-*.js` | Embutido em `ProjectModelEnginePage` | `798.92 kB` (`780.20 KiB` / `200.59` gz / `163.13` br) | **Isolado** (importers: `ProjectModelEnginePage`, `ModelViewerStage`, `vendor-r3f`) |
| `vendor-r3f-*.js` | Embutido em `ModelViewerStage` | `192.65 kB` (`188.13 KiB` / `59.14` gz / `52.05` br) | **Isolado** (único importer: `ModelViewerStage`) |
| `index-*.css` | `62.86 kB` (`61.38 KiB` / `10.73` gz / `8.70` br) | `63.70 kB` (`62.20 KiB` / `10.84` gz / `8.76` br) | `+0.84 kB` |
| **Total JS em `dist/` (3 → 23 chunks)** | `1 945.09 kB` (`1 899.50 KiB` / `518.69` gz / `429.84` br) | `1 963.18 kB` (`1 917.16 KiB` / `532.98` gz / `453.52` br) | **0 dependências circulares** (DFS no grafo ES) |
| **`dist/index.html` `modulepreload`** | Nenhum | `vendor-react`, `vendor-icons`, `vendor-router` | **0 B** de `three`/`r3f`/`motion` no entry |

### 2.2 Tempos por Rota em Chromium Headless (`vite preview`, `1440×900`, `0` erros de página)

| Rota | JS Raw (`KiB`) Base → Final | Reqs JS Base → Final | Frio (`ms`) Base → Final | Mediana (`ms`) Base → Final | P95 (`ms`) Base → Final | FCP Mediana (`ms`) Base → Final | DOM Nodes (Final) | `getItemLib` Base → Final | 3D / Motion (Final) |
|---|---:|:---:|---:|---:|---:|---:|---:|:---:|:---:|
| `/login` (fonts online, 5×) | `830.16` → **`427.94`** | `1 → 4` | `1 366.4` → **`1 237.5`** | `1 285.9` → **`1 162.8`** | `1 366.4` → `1 440.9` | `1 168` → **`1 004`** | `183` | `0 → 0` | Não / Não |
| `/welcome` (**fonts online**, 7×) | `830.16` → **`441.67`** | `1 → 5` | `1 410.1` → `1 439.7` | `1 194.4` → `1 439.7` | `1 410.1` → `1 552.8` | `1 076` → **`944`** | `181` | `0 → 0` | Não / Não |
| `/welcome` (**fonts bloqueadas**, 7×) | `830.16` → **`441.67`** | `1 → 5` | `497.3` → `770.8` | `689.6` → `710.5` | `903.9` → **`770.8`** | `592` → **`336`** (`-43%`) | `181` | `0 → 0` | Não / Não |
| `/workspace` (**5 proj.**, 5×) | `830.16` → **`675.20`** | `1 → 10` | `842.3` → **`829.9`** | `595.9` → `829.9` | `842.3` → `1 100.4` | `504` → **`268`** (`-47%`) | `738` | `0* → 1` | Não / **Sim** |
| `/workspace` (**50 proj.**, 5×) | `830.16` → **`675.20`** | `1 → 10` | `862.9` → `1 026.7` | `907.1` → `1 025.3` | `1 284.7` → **`1 197.9`** | `764` → **`392`** (`-49%`) | `2 043` | `0* → 1` | Não / **Sim** |
| `/workspace` (**200 proj.**, 5×) | `830.16` → **`675.20`** | `1 → 10` | `875.3` → `1 060.4` | `335.5` → `1 198.4` | `875.3` → `1 429.1` | `280` → `416` | **`6 393`** | `0* → 1` | Não / **Sim** |
| `/workspace/projects` (5×) | `830.16` → **`527.66`** | `1 → 10` | `332.9` → `895.2` | `324.7` → `833.8` | `792.5` → `980.5` | `252` → `332` | `528` | `2 → 1` | Não / Não |
| `/workspace/projects/:id` (5×) | `830.16` → **`565.22`** | `1 → 12` | `317.2` → `982.8` | `465.3` → `857.5` | `755.5` → `982.8` | `424` → **`412`** | `370` | `3 → 1` | Não / Não |
| `/workspace/settings` (5×) | `830.16` → **`474.71`** | `1 → 8` | `404.0` → `810.8` | `404.0` → `810.8` | `907.7` → `1 163.6` | `504` → **`384`** | `321` | `0 → 0` | Não / Não |
| `/workspace/projects/:id/model` (5×) | `1 899.50` → **`1 542.87`** | `3 → 13` | `1 469.8` → **`1 144.0`** | `1 523.5` → **`1 275.6`** | `1 690.4` → **`1 345.1`** | `464` → **`268`** (`-42%`) | `672` | `3 → 1` | **Sim** / Não |

*\*Nota Studio Desk:* Na base `37265d5`, `StudioDeskPage` ignorava os projectos locais (lia apenas fixture estática de 5 projectos, `domNodes = 729` mesmo com 50/200 em storage). Em `4197c2e`, renderiza os dados canónicos reais com `1` única leitura de `localStorage`.

### 2.3 Decomposição Crítica (`PerformanceResourceTiming` em `4197c2e`)
- **`/welcome` online vs offline:** `fonts.googleapis.com` bloqueia (`22.1 → 650.3 ms`, `628.2 ms`), adiando a execução de `index.js` e `preloadInitialBrowserRoute()` até **`745.3 ms`** (`WelcomePage-*.js` carrega em `30.3 ms`; `welcome-maquette-study.webp` em `22.8 ms`). Sem fontes externas bloqueantes, mediana cai **`1 439.7 → 710.5 ms` (`-50.7%`)** e FCP **`944 → 336 ms` (`-64.4%`)**.
- **Studio Desk (`/workspace`, 5 proj.):** Entry (`19.8 → 79.5 ms`) → `preloadInitialBrowserRoute()` dispara 6 chunks em paralelo (`116.5 → 168.8 ms`) → `featured-atelier-maquette.webp` (`loading="eager"`, `fetchPriority="high"`) carrega aos `261 → 278 ms`, enquanto cartões `loading="lazy"` ficam diferidos até `740 ms`.
- **Visualizador 3D (`/model`):** 4 etapas sequenciais: (1) Entry (`23 → 81.6 ms`); (2) `WorkspaceShell` + `ProjectModelEnginePage` + `vendor-three` (`116.7 → 319.3 ms`); (3) `fetch` `.glb` `24 KiB` (`581.5 → 602.8 ms`) + `GLTFLoader`; (4) só aos **`624.9 ms`** (após `loadedScene` pronto em `ArchitecturalModelViewer.tsx:913`) é que `ModelViewerStage` (`8 KiB`) + `vendor-r3f` (`188 KiB`, `49.6 ms`) iniciam download (`624.9 → 675.0 ms`), seguido da inicialização WebGL até `~1 144 ms`.

### 2.4 Pesquisa Global (10 teclas, 5× por escala) & `timeGreeting.ts`

| Escala | `openGetItemLib` Base → Final | `keys10GetItemLib` Base → Final | `keys10JsonParse` Base → Final | `syncInput10Keys` Med/P95 (`ms`) Base → Final | `typing10Keys` Med/P95 (`ms`) Base → Final |
|---|:---:|:---:|:---:|---:|---:|
| **5 proj.** | `1 → 0` | **`10 → 0`** | `0 → 0` | `28.5 / 42.3` → **`16.5 / 20.8`** (`-42%`) | `287.9 / 359.3` → `278.1 / 303.0` |
| **50 proj.** | `1 → 0` | **`10 → 0`** | **`10 → 0`** | `37.5 / 53.8` → **`13.0 / 21.4`** (`-65%`) | `328.2 / 337.0` → **`139.4 / 208.4`** (`-58%`) |
| **200 proj.** | `1 → 0` | **`10 → 0`** | **`10 → 0`** | `95.5 / 145.2` → **`17.1 / 33.6`** (`-82%`) | `259.8 / 305.7` → `235.9 / 259.3` |

- **`timeGreeting.ts` (2 000 iterações Node 24, DST `CET`/`CEST` + `CAT` confirmado):** `formatStudioClocks` `2 108.38 ms → 1.58 ms` (**1 334×**; 10 min rotativos **1 654×**); `formatEditorialDate` `357.32 ms → 31.67 ms` (**11.3×**); `formatGreetingForTime` `386.62 ms → 230.40 ms` (1.7×).

### 2.5 Memória, Recursos & Ciclo de Vida (CDP + `HeapProfiler.collectGarbage`)
- **Navegação multi-rota (3 ciclos):** `WorkspaceShell` 100% preservado (`sameHeader: true`, `sameNav: true` em 3/3 ciclos). Heap pós-GC estabiliza (`3.97 → 4.98 → 5.35 → 5.47 MiB`, `Nodes 1160`, `Listeners 249`), sem fuga.
- **Visualizador 3D (3 ciclos completos mount → GLTF → GLB → troca projecto → unmount):** `canvasCount` oscila exactamente `1 → 0` em 3/3 ciclos; `Nodes` (`956`/`1 422`) e `JSEventListeners` (`239`/`249`) absolutamente planos; heap pós-GC `5.29 → C1 9.08/8.85 → C2 9.60/9.37 → C3 9.79/9.56 MiB` (sem fuga GPU/DOM/listeners).

---

## 3. Testes Realizados e Resultados

1. `npm run build` independente em dois worktrees temporários detached (`%TEMP%\oa-audit-c\base-37265d5` e `target-4197c2e`, junções `node_modules` removidas com `cmd /c rmdir` e worktrees removidos com `git worktree remove --force`).
2. `audit-bundles.mjs`: Raw/Gzip-9/Brotli-11, `dist/index.html`, DFS circularidade (`0`), isolamento de vendors.
3. `audit-runtime.mjs` (Chromium headless / `playwright-core`, portas `4175`/`4176`, `1440×900`): `58` execuções frias por commit + `15` execuções Pesquisa Global + `3` ciclos multi-rota CDP + `3` ciclos 3D CDP com GC forçado.
4. `bench-time.mjs` (Node 24): `2 000` iterações por função de `timeGreeting.ts` + validação DST.

---

## 4. Problemas Classificados (`P0` / `P1` / `P2`)

- **P0:** Nenhum identificado.
- **P1:**
  1. **Folha externa bloqueante `fonts.googleapis.com` em `index.html:10-13`:** atrasa `index.js` e `preloadInitialBrowserRoute()` em `~600–730 ms` (mediana `/welcome`: `1 439.7 ms` online vs `710.5 ms` sem bloqueio; FCP `944` vs `336 ms`) e solicita 6 pesos de `Outfit`.
  2. **`WorkspaceSessionContext.tsx:22-32` puxa estaticamente `~160 kB` de repositórios para `index-*.js` (`160.11 kB` raw / `40.54 KiB` br):** `modelAssetRepository`, `projectLibraryRepository`+adapter, `studioDeskFixtures` e `shellDemoState` (usados apenas em `signOut()`/`resetAllDemoData()`) são pagos em `/login` e `/welcome`.
  3. **Waterfall sequencial de 4 degraus no carregamento frio 3D (`ArchitecturalModelViewer.tsx:913`):** `<LazyModelViewerStage>` (`ModelViewerStage` + `vendor-r3f`, `196 KiB`) só começa a descarregar aos `624.9 ms`, após `vendor-three` + `fetch` `.glb` + `GLTFLoader`.
- **P2:**
  1. `vendor-motion` (`122.74 kB` raw / `34.99 KiB` br) existe apenas para 2 fades simples (`StudioDeskPage.tsx:1060`, `StudioOpening.tsx:63`).
  2. Escalabilidade DOM em `ProjectOverviewPanel` (`738` nós em 5 proj. → `2 043` em 50 → `6 393` em 200; seguro no limite actual de 50).
  3. Preloads parciais (`WelcomePage` fast-track, `ArchitecturalRail` hover/focus, `preloadInitialBrowserRoute` apenas valida existência de string em storage, remount de `<Suspense key={pathname}>`).
  4. Reconstrução integral de `studioDeskAll` em `buildLibrarySnapshot` e ausência de cache por minuto em `formatGreetingForTime`.
  5. Aviso Rollup `vendor-three` (`798.92 kB` > `500 kB`) aceitável por isolamento estrito a `/model`, manter sob vigilância em CI.

---

## 5. Limitações e Pendências

- Medições executadas em `localhost` HTTP/1.1 (`vite preview`), onde a abertura fria de múltiplos chunks ES apresenta overhead relativo maior do que sob HTTP/2/3 em rede real. Nenhuma alteração de código executada.

---

## 6. Recomendações (por ROI)

1. **(P1)** Tornar carregamento de fontes não-bloqueante ou auto-hospedar WOFF2 locais (`Outfit` 300/400/500/600 + `Playfair Display` 400/italic) com `font-display: swap`.
2. **(P1)** Desacoplar `signOut()`/`resetAllDemoData()` em `WorkspaceSessionContext.tsx` via remoção directa das chaves + `CustomEvent` (ou `import()` dinâmico no clique), reduzindo `index-*.js` em ~50%.
3. **(P1)** Pré-aquecer `import('./ModelViewerStage')` em paralelo assim que `ArchitecturalModelViewer` iniciar o carregamento de um modelo com `webglSupported`.
4. **(P2)** Substituir os 2 `<motion.*>` em `StudioDeskPage`/`StudioOpening` por CSS puro e remover `framer-motion` (`-120 KiB` raw no Studio Desk).
5. **(P2)** Ligar `handleIntentPreloadWorkspace` ao botão *fast-track* do Welcome e adicionar preload hover/focus no `ArchitecturalRail` para rotas não-3D.
