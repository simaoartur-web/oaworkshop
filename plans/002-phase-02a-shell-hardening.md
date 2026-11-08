# Plano 002 — Fase 02A · System Architecture, Hardening & Workspace Shell

- **Agente:** Argon A
- **Worktree exclusivo:** `oaworkspace-f02-shell`
- **Branch exclusiva:** `codex/f02-shell-hardening`
- **Commit base:** `2b7b6a9818bb70b17d3364a01f193e4b32386ff7` (`codex/feat-phase-00-01-entry-experience`)
- **Estado:** Concluído na branch exclusiva (`codex/f02-shell-hardening`), pronto para revisão e integração com Argon B (sem merge nesta entrega)
- **Fronteira de isolamento:** Não alterar `oaworkshop` (`main`), não tocar nos ficheiros reservados ao Argon B (`src/features/studio-desk/**`, `src/data/studioDeskTypes.ts`, `src/data/studioDeskFixtures.ts`, `src/test/studioDesk.test.tsx`), não importar `StudioDeskPage` durante o desenvolvimento paralelo e não avançar para a Fase 03.

## 1. Objectivos Verificáveis

1. **Correcções da Fase 01 (Hardening):**
   - **Modal acessível (`src/design-system/DemoNoticeDialog.tsx` + `src/design-system/useDialogFocusTrap.ts`):** confinamento real de foco (`Tab`, `Shift+Tab`, `Escape`), neutralização (`inert` + `aria-hidden`) de todo o DOM exterior ao portal do diálogo enquanto aberto, prevenção contra fuga de foco e re-renders do pai, e restauro garantido do foco para o botão de origem após fechar.
   - **Portabilidade E2E (`scripts/e2e-verify-entry.mjs` + `README.md`):** remoção de caminhos pessoais absolutos; directório relativo configurável por omissão (`test-results/e2e-screenshots`, ignorado em `.gitignore`); detecção multiplataforma de Chrome/Edge/Chromium Playwright e documentação explícita; cobertura a `1440×900`, `768×1024` e `375×812`.
   - **Horários e saudação por base de estúdio (`src/utils/timeGreeting.ts` + `src/features/welcome/WelcomePage.tsx`):** cálculo dinâmico de `CET` vs `CEST` para `Europe/Rome` conforme horário de verão; cálculo de `CAT` para `Africa/Maputo`; regra explícita em que a saudação e a data editorial seguem a zona horária da `studioBase` do colaborador activo em vez do relógio arbitrário do dispositivo.
   - **Revisão do acesso demo:** validação de redireccionamentos (`/`, `/login`, `/welcome`, `/workspace`, `/workspace/*`), persistência após refresh, limpeza integral no logout/reset e garantia estrita de zero palavras-passe em `localStorage`.

2. **Workspace Shell Arquitectónico (`src/features/workspace-shell/**`):**
   - **Architectural Navigation Rail (`ArchitecturalRail.tsx`):** estética de prancha técnica (`#0A0A0A`, linhas `1px`, numeração `01`–`11`, barra terracota `#A65D4A`), estado expandido (`264px`) e compacto (`72px`) com persistência local, organização em 3 grupos (`Atelier`, `Estrutura`, `Controlo`) e drawer acessível dedicado para mobile/tablet (`< 1024px`).
   - **Contextual Header (`ContextualHeader.tsx`):** monograma O+A, migalha contextual + código de departamento activo, relógio operacional Maputo/Milão (`2xl:`), gatilho de pesquisa global (`Ctrl+K` / botão), central de notificações, alternador `PT/EN` acessível, menu do utilizador/preferências e logout imediato.
   - **Global Search Demo (`GlobalSearchDialog.tsx` + `globalSearchIndex.ts`):** modal com focus trap, pesquisa client-side normalizada (sem acentos obrigatórios) sobre rotas do workspace, 6 perfis demo, 9 departamentos e o estudo em foco `OA-26-014`; navegação completa por teclado (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) e estado vazio honesto.
   - **Notifications Demo (`NotificationsPopover.tsx` + `shellDemoState.ts`):** painel acessível com contador de não lidas, marcação individual ou global como lida em estado local demonstrativo, navegação contextual e transparência total.
   - **Layout Reutilizável (`WorkspaceShell.tsx`) & Contrato Argon B (`src/app/App.tsx`, `WorkspaceEntryGatePage.tsx`, `WorkspaceSettingsPage.tsx`, `PlannedModuleView.tsx`):** estrutura editorial que envolve `/workspace/*` via `<Outlet />` (ou `children`), mantendo `/workspace` com placeholder local honesto pronto para substituição directa por `StudioDeskPage` na integração.

## 2. Decisões e Calibrações Registadas

- **Focus trap + `inert` fora de re-renders (`useDialogFocusTrap` + Portal):** sincronização de `onCloseRef` por `useEffect` (compatível com ESLint/React Compiler), captura do elemento originador apenas na transição para aberto e remoção de `inert` antes de devolver foco ao botão originador.
- **Calibração responsiva do `ContextualHeader` + `OABrandMark` (`hideDetailsOnMobile`):** detectada na inspecção visual E2E inicial sobreposição entre os grupos esquerdo e direito do cabeçalho em `375px`, `768px` e `1440px` com prancha expandida; resolvida com ocultação do subtítulo do monograma abaixo de `sm`, escalonamento progressivo dos detalhes secundários (`xl:` para texto `Pesquisar`/migalha/nome de perfil, `2xl:` para relógio duplo e atalho `⌘K`/`Ctrl+K`), encurtamento da etiqueta de recolha da prancha (`Recolher prancha` / `Collapse rail`) e asserção automática `checkHeaderNoClusterOverlap` no script E2E.
- **Estado derivado sem `setState` síncrono em efeitos:** `WorkspaceShell` deriva abertura do drawer mobile via `mobileDrawerPath === location.pathname` e `GlobalSearchDialog` reinicia estado local ao desmontar o conteúdo quando fechado.

## 3. Verificações Executadas

- `npm run lint` (`eslint .`) — **passou** (0 erros, 0 avisos).
- `npm run test` (`vitest run`) — **passou** (3 ficheiros, **19/19 testes** aprovados: `entryExperience.test.tsx`, `hardeningAndTime.test.tsx`, `workspaceShell.test.tsx`).
- `npm run build` (`tsc -b && vite build`) — **passou** limpo.
- `npm run test:e2e` (`node scripts/e2e-verify-entry.mjs`) — **passou** em Chromium headless a `1440×900`, `768×1024` e `375×812` com zero `console.error`, zero `pageerror`, zero pedidos externos, zero scroll horizontal e zero sobreposição entre clusters do cabeçalho; capturas visualmente inspeccionadas.
