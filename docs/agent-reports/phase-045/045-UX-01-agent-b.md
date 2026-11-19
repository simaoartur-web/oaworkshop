# Relatório Técnico — Fase 04.5 · Revisão Estática de Frontend, UX & WebGL (`045-UX-01`)

- **Identificador da tarefa:** `045-UX-01`
- **Agente:** `@agent-b` (Frontend & UX Engineer)
- **Origem das evidências:** Publicação directa do relatório concluído no Swarm Board (`#6`, `2026-11-19 18:48:59`) sem re-execução de investigação
- **Objectivo e âmbito:** Leitura e revisão estática dos contratos e módulos de UI, chunk loading, estados de carregamento, acessibilidade WCAG 2.2 AA e palco 3D WebGL no commit integrado `4197c2e`, em modo estritamente read-only.
- **Branch da tarefa:** `codex/f045-task-agent-b`
- **Commit base:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` (`origin/codex/f02-integration-preview`)
- **Estado:** `PASSED` *(revisão estática concluída sem alterações de código; 0 P0, 2 P1 e 4 P2 sinalizados para validação dinâmica e eventual correcção pós-aprovação)*

---

## 1. Ficheiros Modificados

- `docs/agent-reports/phase-045/045-UX-01-agent-b.md` *(apenas este relatório; zero alterações em código de produção)*

### Ficheiros Auditados (Somente Leitura)
- Documentação e Planos: `AGENTS.md`, `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md`, `docs/DESIGN_SYSTEM.md`, `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md`, `plans/011-phase-045a-data-consistency.md`, `plans/012-phase-045b-loading-performance.md`, `plans/013-phase-045-integration.md`.
- Código sob propriedade de `@agent-b`: `vite.config.ts`, `index.html`, `src/app/App.tsx`, `src/app/routePreload.ts`, `src/features/loading/RouteLoadingStates.tsx`, `src/features/welcome/WelcomePage.tsx`, `src/features/auth-demo/LoginPage.tsx`, `src/features/studio-desk/StudioDeskPage.tsx`, `src/features/workspace-shell/{WorkspaceShell,ArchitecturalRail,ContextualHeader,GlobalSearchDialog,NotificationsPopover}.tsx`, `src/features/model-viewer/{ArchitecturalModelViewer,ModelViewerStage,ModelViewerControls,ModelViewerFallback,glbInspector}.*`, `src/features/model-engine/{ProjectModelEnginePage,ModelEngineStageSlot}.tsx`, `src/design-system/{tokens.css,useDialogFocusTrap.ts}`, `src/utils/timeGreeting.ts`.

---

## 2. Trabalho Executado e Evidências

- **Code-splitting & Shell persistente (`App.tsx`, `routePreload.ts`, `vite.config.ts`):** `LoginPage` permanece no entry inicial; 9 rotas/shell autenticadas usam `createRetryableLazy`. `WorkspaceShellLayout` isola `<WorkspaceShell>` no `RouteChunkErrorBoundary` externo (`fullscreen`) e `<Outlet />` no boundary interno (`shell-content`, `resetKey={pathname}`) com `<Suspense key={pathname} fallback={<WorkspaceContentLoadingState />}>`, preservando Rail/Header/scroll container entre sub-rotas e garantindo reset determinístico de scroll (`WorkspaceShell.tsx` `useLayoutEffect` + `scrollHistoryRef` em `POP`). `vite.config.ts` fixa `vite/preload-helper` e `commonjsHelpers` em `vendor-react`, mantendo `vendor-three` e `vendor-r3f` isolados a `/model`. `preloadRouteKey` absorve rejeições (`0` `unhandledrejection`), regista conclusão apenas em `.then()` e limpa `inFlight` em `.finally()`.
- **Estados de carregamento & recuperação (`RouteLoadingStates.tsx`):** `EditorialEntryLoadingFallback` mantém `#050505` (zero flash branco), `role="status"`, `aria-live="polite"`, PT/EN e sem animações contínuas; `WorkspaceContentLoadingState` renderiza dentro de `<main>`; `RouteChunkErrorBoundary` usa `role="alert"`, retry *in-place* e salvaguarda de reload.
- **Palco WebGL & ciclo de memória (`ArchitecturalModelViewer.tsx`, `ModelViewerStage.tsx`, `glbInspector.ts`):** `LazyModelViewerStage` usa `frameloop="demand"`, `dpr` até `1.5` (ou `1` no perfil económico), `powerPreference: 'default'`, `preserveDrawingBuffer: false`, `enableDamping={false}`, `ModelViewerErrorBoundary` estável (`stageResetKey`), limpeza `gl.renderLists?.dispose()` + `THREE.Cache.clear()` e preservação do `<Canvas>` em trocas de modelo (`keepStageMounted` + `inert`). `ArchitecturalModelViewer` chama `disposeThreeObjectResources` e revoga `ObjectURL` em trocas, erros, cancelamento e unmount.
- **Studio Desk & fusos (`StudioDeskPage.tsx`, `timeGreeting.ts`):** `StudioDeskPage` lê `useProjectLibrary().studioDeskProjects`, exclui arquivados de `activeDeskProjects`/`featuredProject`/`attentionProject` (com fallback `featured-all-archived-empty`) e preserva `?project=` e filtro `Arquivado`. `timeGreeting.ts` faz cache limitado (64 entradas) de `Intl.DateTimeFormat` e buckets de minuto (`Africa/Maputo` CAT, `Europe/Rome` CET/CEST).

---

## 3. Testes Realizados e Resultados

- Revisão estática de contratos, código e conformidade WCAG 2.2 AA em `4197c2e` (`read-only`, sem execução de builds ou testes concorrentes com `@agent-c` e `@agent-d`, conforme brief `#2`).

---

## 4. Problemas Classificados (`P0` / `P1` / `P2`)

- **P0:** Nenhum identificado em revisão estática.
- **P1:**
  1. **Recuperação de chunk rejeitado ao navegar para fora sem clicar «Tentar novamente» (`src/features/loading/RouteLoadingStates.tsx:158-162`, `src/app/routePreload.ts:184-200`):** Quando um chunk lazy falha, o `React.lazy` interno guarda a rejeição em cache. Ao navegar para outra rota, `RouteChunkErrorBoundary.componentDidUpdate` limpa `hasError` via `resetKey`, mas não faz `reset()` do handle `createRetryableLazy` da rota falhada; ao regressar depois com rede restabelecida, o `LazyImpl` rejeitado volta a lançar o erro em cache. *(Confirmado empiricamente em Chromium por `@agent-d` em `045-QA-01`.)*
  2. **Contraste WCAG 2.2 AA insuficiente (`< 4,5:1`) em micro-texto `11px` com `#A65D4A` (`src/features/welcome/WelcomePage.tsx:148,201,399,493`, `src/features/auth-demo/LoginPage.tsx:264,472`):** `--oa-accent` (`#A65D4A`) tem rácio `3,69:1`–`4,16:1` sobre `#050505`–`#161616`, abaixo de `4,5:1`; `docs/DESIGN_SYSTEM.md` define `--oa-accent-text` (`#CE826D`, `≥ 5,9:1`) para micro-texto sobre fundos escuros. *(Confirmado e alargado por `@agent-d` em `045-QA-01`.)*
- **P2:**
  1. **`reduceMotionOverride` não propagado para o palco WebGL 3D (`src/features/model-engine/ModelEngineStageSlot.tsx:243-278`, `ProjectModelEnginePage.tsx:20`):** Não passa `reduceMotion` a `ArchitecturalModelViewer`.
  2. **Paragem de foco invisível (`sr-only`) no input de ficheiro em `ModelEngineStageSlot.tsx:283-297`:** Falta `tabIndex={-1}` e `aria-hidden="true"` (ao contrário de `ArchitecturalModelViewer.tsx:748-749`).
  3. **ARIA `combobox` em estado vazio (`src/features/workspace-shell/GlobalSearchDialog.tsx:167-169,205-295`):** Quando `results.length === 0`, `<ul id={listboxId} role="listbox">` não monta, mas o input mantém `aria-expanded="true"` e `aria-controls={listboxId}`.
  4. **Oportunidades menores de performance/consistência:** botão *fast-track* em `WelcomePage.tsx:100-114` sem `preloadWorkspaceEntry` em hover/focus e `prefersReducedMotion` sem listener `change`; `StudioDeskPage.tsx:1,1060-1078` é o único consumidor restante de `framer-motion` (`vendor-motion`, `122.74 kB` raw); micro-badges `10px` e botões secundários `36–38px`.

---

## 5. Limitações e Pendências

- Missão exclusivamente read-only; nenhuma alteração efectuada em código de produção. Correcções dos P1/P2 aguardam plano e `TASK_CONTRACT` aprovados.

---

## 6. Recomendações

- Priorizar a correcção cirúrgica dos 2 P1 (`RouteChunkErrorBoundary` com reset do handle `createRetryableLazy` em mudança de `resetKey`, e correcção de contraste `#A65D4A` → `#CE826D` / `text-white`), seguida dos P2 aprovados (`reduceMotion` no palco 3D, `tabIndex={-1}` no file input, ARIA `combobox`, preload no fast-track do Welcome e eventual remoção de `framer-motion`).
