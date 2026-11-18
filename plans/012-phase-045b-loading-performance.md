# Plano 012 — Fase 04.5B · Bundle Optimization & Loading Performance

- **Agente:** B (Arquitectura de Carregamento, Performance Visual & Experiência Responsiva)
- **Branch:** `codex/f045b-loading-performance`
- **Base:** `codex/f02-integration-preview` (`37265d5914f161bd9a45f688b8f85f48fffdd7b0`)
- **Estado:** Concluído e verificado
- **Auditorias consultadas:**
  - `docs/audits/phase04-performance-postmerge.md` (`codex/f04c-postmerge-performance`)
  - `docs/audits/phase04-final-memory-verification.md` (`codex/f04c-memory-verification`)

---

## 1. Baseline Medida Antes de Alterações (`37265d5`)

Medições obtidas localmente com `vite build`, compressão `gzip -9` / `Brotli` e execução a frio em headless Chromium (`deviceScaleFactor = 1`, `networkidle` via `vite preview`):

| Artefacto / Rota | Raw (`kB` Vite / `KiB`) | Gzip (`KiB`) | Brotli (`KiB`) | Reqs JS | Tempo a frio (ms) |
|---|---:|---:|---:|---:|---:|
| `index-*.js` (entry único inicial) | `850.09 kB` (`830.16 KiB`) | `233.48` | `192.66` | 1 | — |
| `ProjectModelEnginePage-*.js` (lazy 3D) | `894.34 kB` (`873.38 KiB`) | `223.54` | `182.93` | — | — |
| `ModelViewerStage-*.js` (lazy stage R3F) | `200.66 kB` (`195.96 KiB`) | `61.67` | `54.25` | — | — |
| `index-*.css` | `62.86 kB` (`61.38 KiB`) | `10.73` | `8.70` | — | — |
| `/login` (cold) | `830.16 KiB` | — | — | 1 | `6 723` |
| `/welcome` (cold) | `830.16 KiB` | — | — | 1 | `2 328` |
| `/workspace` (cold) | `830.16 KiB` | — | — | 1 | `4 340` |
| `/workspace/projects` (cold) | `830.16 KiB` | — | — | 1 | `3 588` |
| `/workspace/projects/:id` (cold) | `830.16 KiB` | — | — | 1 | `4 732` |
| `/workspace/settings` (cold) | `830.16 KiB` | — | — | 1 | `4 308` |
| `/workspace/projects/:id/model` (cold + WebGL loaded) | `1 899.50 KiB` | — | — | 3 | `13 518` |

> **Nota sobre unidades:** O Vite imprime em `kB` decimais (`bytes / 1000`); as medições detalhadas por script usam `KiB` binários (`bytes / 1024`). Ambas as colunas são apresentadas explicitamente para total rastreabilidade.

---

## 2. Estratégia Escolhida e Comparação Automático vs `manualChunks`

### 2.1 Code-Splitting das Rotas & Preservação do Shell (`src/app/App.tsx`)
1. Conversão das 8 rotas indicadas para `React.lazy` com helper tipado `lazyNamed`:
   - `WelcomePage`
   - `WorkspaceShell`
   - `StudioDeskPage`
   - `ProjectLibraryCatalogPage`
   - `ProjectCreateEnginePage`
   - `ProjectDossierShellPage`
   - `WorkspaceSettingsPage`
   - `PlannedModuleView`
2. Preservação de `ProjectModelEnginePage` em `React.lazy` e manutenção de `LoginPage` no entry inicial (zero latência extra na entrada `/login`).
3. **Preservação do Shell e ausência de cascata:**
   - `WorkspaceShellLayout` envolve `<WorkspaceShell>` com `<Suspense fallback={<EditorialEntryLoadingFallback />}>` apenas para a primeira entrada no workspace, e coloca um **segundo `<Suspense fallback={<WorkspaceContentLoadingState />}>` em torno de `<Outlet />` dentro de `<WorkspaceShell>`**.
   - Assim, navegar entre `/workspace`, `/settings`, `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/model` e módulos planeados **nunca desmonta** o `ArchitecturalRail`, `ContextualHeader`, estado de pesquisa/notificações, filtros ou contentor de scroll nem provoca flashes brancos.
   - Um pré-carregador por rota (`preloadMatchedWorkspaceChild(pathname)`) dispara o chunk filho exacto em paralelo com `WorkspaceShell` ao entrar numa rota autenticada sem puxar outros módulos nem bibliotecas 3D.
   - Em `WelcomePage.tsx`, os botões de entrada (`Entrar no Workspace`) pré-aquecem `WorkspaceShell` e `StudioDeskPage` em `onPointerEnter` e `onFocus`.

### 2.2 Comparação: Vite Automático vs `manualChunks` Explícito (`vite.config.ts`)

| Critério | Experiência 1 (Vite Automático + 8 Lazy) | Experiência 2 (`manualChunks` Explícito + Fix `preload-helper`) | Decisão |
|---|---:|---:|---|
| `index-*.js` (código da app) | `421.06 kB` (`131.80 kB` gzip) | **`154.98 kB` (`46.78 kB` gzip / `39.06 KiB` Brotli)** | **Exp. 2** |
| Entry total carregado em `/login` | `421.06 kB` (`131.80 kB` gzip) | **`433.08 kB` (`422.93 KiB` / `132.58 KiB` gzip)** (`index` + `react` + `router` + `icons`) | **Exp. 2** |
| Micro-chunks de ícones Lucide | `18` chunks de `0.13–0.43 kB` | **`1` chunk único `vendor-icons` (`15.85 kB`)** | **Exp. 2** |
| Cache independente de vendors | React/Router misturados no `index` | `vendor-react`, `vendor-router`, `vendor-icons`, `vendor-motion`, `vendor-r3f`, `vendor-three` | **Exp. 2** |
| `ProjectModelEnginePage-*.js` | `895.21 kB` | **`91.31 kB`** (+ `vendor-three` e `vendor-r3f` apenas em `/model`) | **Exp. 2** |
| `StudioDeskPage-*.js` | `210.98 kB` | **`86.93 kB`** (+ `vendor-motion` `122.74 kB` isolado) | **Exp. 2** |
| Dependências circulares Rollup | 0 | **0** | Igual |

**Descoberta crítica evitada na Experiência 2:** Na primeira tentativa de `manualChunks`, o Rollup moveu o helper interno `vite/preload-helper` para dentro de `vendor-r3f`, fazendo `dist/index.html` injectar `modulepreload` para `vendor-r3f` e `vendor-three` em `/login`. Ao mapear explicitamente `vite/preload-helper` e `commonjsHelpers` para `vendor-react`, o entry voltou a ter **0 bytes** de `three`, `r3f` ou `framer-motion` nas rotas iniciais.

---

## 3. Tamanho Final dos Bundles e Tráfego por Rota (Depois)

| Chunk (`dist/assets/`) | Raw (`kB` Vite / `KiB`) | Gzip (`KiB`) | Brotli (`KiB`) | Quando carrega |
|---|---:|---:|---:|---|
| `index-D1SXQ2h2.js` | `154.98 kB` (`151.35 KiB`) | `45.64` | `39.09` | Sempre (`/login`) |
| `vendor-react-DKYJPgbL.js` | `223.06 kB` (`217.83 KiB`) | `67.80` | `58.44` | Sempre (`/login`) |
| `vendor-router-eyayML-_.js` | `39.20 kB` (`38.28 KiB`) | `13.79` | `12.41` | Sempre (`/login`) |
| `vendor-icons-DPvBwa1c.js` | `15.85 kB` (`15.48 KiB`) | `5.33` | `4.57` | Sempre (`/login`) |
| `WelcomePage-TWnNMxAN.js` | `14.63 kB` (`14.29 KiB`) | `3.81` | `3.41` | `/welcome` |
| `WorkspaceShell-D2Fq4iXh.js` + helpers shell | `39.10 kB` (`38.06 KiB`) | `10.33` | `9.11` | Entrada em `/workspace/*` |
| `StudioDeskPage-DR3nSpnf.js` | `86.93 kB` (`84.89 KiB`) | `18.78` | `15.96` | `/workspace` |
| `vendor-motion-PjuJ3f1y.js` | `122.74 kB` (`119.87 KiB`) | `39.06` | `35.05` | Apenas ao montar `StudioDeskPage` |
| `ProjectLibraryCatalogPage-CGzfYowX.js` | `19.90 kB` (`19.44 KiB`) | `4.36` | `3.88` | `/workspace/projects` |
| `ProjectDossierShellPage-h_8O0wC7.js` | `46.06 kB` (`44.98 KiB`) | `8.99` | `7.86` | `/workspace/projects/:id` |
| `ProjectCreateEnginePage-B7L7VLrg.js` | `29.25 kB` (`28.56 KiB`) | `6.38` | `5.63` | `/workspace/projects/new` |
| `WorkspaceSettingsPage-CKy7GXyp.js` | `8.34 kB` (`8.14 KiB`) | `2.00` | `1.75` | `/workspace/settings` |
| `PlannedModuleView-BGbRno7p.js` | `9.34 kB` (`9.12 KiB`) | `2.27` | `2.00` | Rotas planeadas |
| `ProjectModelEnginePage-CL3uacTJ.js` | `91.31 kB` (`89.17 KiB`) | `21.72` | `19.12` | Apenas `/model` |
| `ModelViewerStage-B_LZAwMi.js` | `8.36 kB` (`8.16 KiB`) | `3.05` | `2.72` | Apenas `/model` |
| `vendor-r3f-3YxyLKa9.js` | `192.65 kB` (`188.13 KiB`) | `59.14` | `51.98` | Apenas `/model` |
| `vendor-three-C7nzwtxH.js` | `798.92 kB` (`780.20 KiB`) | `200.59` | `163.13` | Apenas `/model` |

### Custo Medido por Rota em Chromium (Antes vs Depois)

| Rota (Cold) | JS Antes (`KiB`) | JS Depois (`KiB`) | Reqs JS Antes -> Depois | Tempo Antes -> Depois (`ms`) | 3D Carregado? |
|---|---:|---:|:---:|---:|:---:|
| `/login` | `830.16` | **`422.93`** (`-49.1%`) | `1 -> 4` (modulepreload paralelo) | `6 723 -> 4 363` (`-35.1%`) | **Não** |
| `/welcome` | `830.16` | **`437.22`** (`-47.3%`) | `1 -> 5` | `2 328 -> 3 566` | **Não** |
| `/workspace` | `830.16` | **`665.76`** (`-19.8%`) | `1 -> 9` | `4 340 -> 3 446` (`-20.6%`) | **Não** |
| `/workspace/projects` | `830.16` | **`522.13`** (`-37.1%`) | `1 -> 10` | `3 588 -> 2 343` (`-34.7%`) | **Não** |
| `/workspace/projects/:id` | `830.16` | **`559.65`** (`-32.6%`) | `1 -> 12` | `4 732 -> 2 825` (`-40.3%`) | **Não** |
| `/workspace/settings` | `830.16` | **`469.14`** (`-43.5%`) | `1 -> 8` | `4 308 -> 2 279` (`-47.1%`) | **Não** |
| `/workspace/projects/:id/model` | `1 899.50` | **`1 537.34`** (`-19.1%`) | `3 -> 13` | `13 518 -> 2 642` (`-80.5%`) | **Sim (só aqui)** |

---

## 4. Alterações Funcionais Implementadas

1. **Estados de carregamento dedicados:** [src/features/loading/RouteLoadingStates.tsx](../src/features/loading/RouteLoadingStates.tsx) (`EditorialEntryLoadingFallback` em `#050505` e `WorkspaceContentLoadingState` para o `<main>` interno do Shell, PT/EN, `role="status"`, `aria-live="polite"`, sem animações contínuas nem flashes brancos).
2. **Router & Chunking:** [src/app/App.tsx](../src/app/App.tsx) e [vite.config.ts](../vite.config.ts) (8 rotas lazy, `WorkspaceShell` persistente entre sub-rotas, preloader sem cascata e `maxWorkers: 4` no Vitest para eliminar contenção em paralelo).
3. **Cache de formatadores & redução de main-thread work:** [src/utils/timeGreeting.ts](../src/utils/timeGreeting.ts) com cache de `Intl.DateTimeFormat` por `(locale, opções, timeZone)` e memoização limitada ao minuto para `formatStudioClocks` e `formatEditorialDate`, preservando rigorosamente `Africa/Maputo`, `Europe/Rome`, `CET`/`CEST`, mudanças de dia e transições DST.
4. **Performance de animação:** [src/features/auth-demo/LoginPage.tsx](../src/features/auth-demo/LoginPage.tsx) e [src/features/welcome/WelcomePage.tsx](../src/features/welcome/WelcomePage.tsx) substituem o runtime de `framer-motion` por transições CSS subtis respeitando `prefers-reduced-motion` e `reduceMotionOverride`, retirando `122.74 kB` de `vendor-motion` das rotas `/login` e `/welcome`.
5. **Estratégia de imagens:**
   - [FeaturedProjectPlate.tsx](../src/features/studio-desk/FeaturedProjectPlate.tsx) (`loading="eager"`, `decoding="async"`, `fetchPriority="high"`).
   - [ProjectOverviewPanel.tsx](../src/features/studio-desk/ProjectOverviewPanel.tsx) (`loading="lazy"`, `decoding="async"` nos cartões).
   - [ProjectGalleryView.tsx](../src/features/project-experience/ProjectGalleryView.tsx) (`decoding="async"` + `loading="lazy"`), [ProjectDossierView.tsx](../src/features/project-experience/ProjectDossierView.tsx) (`loading="eager"`, `decoding="async"`, `fetchPriority="high"`), `LoginPage.tsx` e `WelcomePage.tsx` (`fetchPriority="high"`).

---

## 5. Testes e Verificações Executadas

- `npm run lint`: **PASS** (`0` erros).
- `npm run test` (`vitest run`, `maxWorkers: 4`): **PASS — 12 ficheiros · 90/90 testes** em `44.60s`, incluindo os novos testes em [src/test/loadingPerformance.test.tsx](../src/test/loadingPerformance.test.tsx).
- `npm run build` (`tsc -b && vite build`): **PASS** (`19.15s`, `0` dependências circulares).
- `npm run test:e2e`: **PASS** (`E2E Verification PASSED cleanly`).
- **Validação Chromium (`verify_phase045b_full.mjs`):** Login, Welcome, `/workspace`, `/workspace/projects`, `/workspace/projects/new`, Dossier, `/model` WebGL real, `/workspace/settings`, `/workspace/tasks`, Back/Forward, preservação estrita dos nós DOM `<header>` e `<nav>` do Shell (`sameHeader: true`, `sameNav: true`), 6 perfis demo, PT/EN, `0` erros de página/chunks, `has3DBeforeModel: false` e inspeção visual sem overflow nas larguras `1440 px`, `768 px` e `375 px`.

---

## 6. Limitações Conhecidas e Fronteiras

1. **Dependência estática em `WorkspaceSessionContext.tsx` e `StudioDeskPage.tsx`:** Por respeito estrito às fronteiras de código definidas na Secção 9 (sem alterar ficheiros do Agente A nem `StudioDeskPage.tsx` ou `PROJECT_MAP.md`), `StudioDeskPage.tsx` continua a importar `framer-motion` (carregado de forma isolada em `vendor-motion` ao entrar no Studio Desk) e `WorkspaceSessionContext.tsx` mantém referências estáticas aos repositórios locais para `signOut` e `resetAllDemoData`.
2. **`vendor-three` acima de `500 kB`:** A biblioteca `three@0.187.0` produz `798.92 kB` raw (`200.59 KiB` gzip / `163.13 KiB` Brotli), mas está **100% isolada** no chunk `vendor-three` e só é transferida ao aceder a `/workspace/projects/:id/model`.
