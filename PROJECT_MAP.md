# Mapa do Projecto — O+A Workspace (`PROJECT_MAP.md`)

> **Finalidade:** localizar responsabilidades sem explorar repetidamente o repositório.
> **Regra:** actualizar este mapa sempre que um ficheiro for criado, movido ou mudar de responsabilidade.

## Entrada rápida por tarefa

| Tarefa | Começar por | Consultar também |
|---|---|---|
| Alterar direcção de arte, tokens ou tipografia | `src/design-system/tokens.css` | `docs/DESIGN_BRIEF.md`, `docs/DESIGN_SYSTEM.md` |
| Alterar ecrã de Login (`/login`) | `src/features/auth-demo/LoginPage.tsx` | `src/design-system/ArchitecturalSectionDrawing.tsx`, `src/design-system/DemoNoticeDialog.tsx` |
| Alterar ecrã de Boas-vindas (`/welcome`) | `src/features/welcome/WelcomePage.tsx` | `src/data/fixtures.ts`, `src/utils/timeGreeting.ts` |
| Alterar Workspace Shell, Rail, Header, Search ou Notifications | `src/features/workspace-shell/WorkspaceShell.tsx` | `src/features/workspace-shell/shellNavigation.ts`, `src/features/workspace-shell/GlobalSearchDialog.tsx` |
| Alterar Mesa de Trabalho (`/workspace`) | `src/features/studio-desk/StudioDeskPage.tsx` | `src/features/studio-desk/FeaturedProjectPlate.tsx`, `src/features/studio-desk/ProjectDossierDialog.tsx` |
| Alterar definições locais ou pranchas de módulos planeados | `src/features/workspace/WorkspaceSettingsPage.tsx` | `src/features/workspace/PlannedModuleView.tsx` |
| Alterar focus trap / acessibilidade de modais e drawers | `src/design-system/useDialogFocusTrap.ts` | `src/features/studio-desk/useStudioDeskDialogFocusTrap.ts`, `src/design-system/DemoNoticeDialog.tsx` |
| Alterar sessão demo, papéis, projectos ou `localStorage` | `src/data/sessionRepository.ts` | `src/data/studioDeskFixtures.ts`, `src/app/WorkspaceSessionContext.tsx` |
| Alterar textos bilingues PT / EN | `src/locales/pt.ts`, `src/locales/en.ts` | `src/features/studio-desk/i18n.ts`, `src/locales/index.ts` |
| Executar ou ampliar testes | `src/test/integrationPreview.test.tsx`, `src/test/studioDesk.test.tsx` | `src/test/workspaceShell.test.tsx`, `scripts/e2e-verify-entry.mjs` |

## Raiz e Configuração

| Caminho | Responsabilidade |
|---|---|
| `AGENTS.md` | regras obrigatórias do repositório autónomo `oaworkspace` |
| `PROJECT_MAP.md` | este índice estrutural |
| `README.md` | instruções de instalação, execução, portabilidade E2E e fronteiras do projecto |
| `package.json` | scripts (`dev`, `build`, `lint`, `test`, `test:e2e`) e dependências frontend |
| `vite.config.ts` | configuração Vite 7 + Vitest (`jsdom` com timeout calibrado) |
| `postcss.config.js` | pipeline Tailwind CSS v4 + Autoprefixer |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | configuração TypeScript estrita |
| `eslint.config.js` | análise estática ESLint 9 + TypeScript + React Hooks |
| `index.html` | entrada HTML (`noindex, nofollow`, fontes `Outfit` e `Playfair Display`) |

## Código-fonte (`src/`)

| Caminho | Responsabilidade |
|---|---|
| `src/main.tsx` | montagem React e carregamento de `tokens.css` |
| `src/vite-env.d.ts` | declarações de tipos de cliente Vite (recursos estáticos e CSS) |
| `src/app/App.tsx` | rotas (`/login`, `/welcome`, `/workspace/*` protegidas por `RequireDemoSession` dentro de `WorkspaceShell`), navegação e redireccionamentos |
| `src/app/WorkspaceSessionContext.tsx` | provider central reactivo de sessão demo, papel activo, idioma, `reduceMotionOverride`, época de reset e limpeza integral |
| `src/design-system/tokens.css` | paleta canónica O+A, grelha técnica, foco acessível WCAG 2.2 AA e reduced-motion |
| `src/design-system/useDialogFocusTrap.ts` | hook WCAG 2.2 AA com portal, neutralização `inert`/`aria-hidden` de fundo, ciclo `Tab`/`Shift+Tab`, `Escape` e restauro de foco |
| `src/design-system/OABrandMark.tsx` | monograma oficial O+A adaptado para superfícies escuras com fallback tipográfico |
| `src/design-system/LanguageToggle.tsx` | alternador acessível `PT / EN` com alvo mínimo de 44×44 px |
| `src/design-system/ArchitecturalSectionDrawing.tsx` | corte ortogonal técnico 1:100 em SVG vectorial para `/login` |
| `src/design-system/DemoNoticeDialog.tsx` | diálogo modal acessível via portal com focus trap real e restauro garantido de foco |
| `src/features/auth-demo/LoginPage.tsx` | câmara de entrada assimétrica 58/42, validação, 6 perfis demo e corte técnico |
| `src/features/welcome/WelcomePage.tsx` | caderno editorial pós-login com saudação por base de estúdio, estudo em foco e prioridades |
| `src/features/workspace-shell/shellNavigation.ts` | definição tipada dos 3 grupos e 11 pranchas de navegação do Workspace Shell |
| `src/features/workspace-shell/shellDemoState.ts` | notificações fictícias harmonizadas com Studio Desk, preferência rail compacto/expandido e reset |
| `src/features/workspace-shell/globalSearchIndex.ts` | motor de pesquisa local client-side sobre rotas, 6 perfis, projectos Studio Desk (`OA-26-101` a `124`) e departamentos |
| `src/features/workspace-shell/shellUiContext.tsx` | contexto opcional do Shell para sincronização da prancha lateral com `/workspace/settings` |
| `src/features/workspace-shell/ArchitecturalRail.tsx` | navegação lateral desktop (expandida 264px / compacta 72px) e drawer acessível mobile/tablet |
| `src/features/workspace-shell/ContextualHeader.tsx` | cabeçalho contextual com identidade O+A, migalha, relógios Maputo/Milão, pesquisa, notificações, `PT/EN`, menu e logout directo |
| `src/features/workspace-shell/GlobalSearchDialog.tsx` | modal de pesquisa demonstrativa local com navegação por setas, Enter, Escape e estado vazio honesto |
| `src/features/workspace-shell/NotificationsPopover.tsx` | central de notificações demo com indicador de não lidas e acções para Studio Desk e pranchas planeadas |
| `src/features/workspace-shell/WorkspaceShell.tsx` | contentor editorial reutilizável que enquadra `<Outlet />` / `children` nas rotas `/workspace/*` |
| `src/features/studio-desk/StudioDeskPage.tsx` | mesa de trabalho operacional (Mesa de Trabalho / Studio Desk) integrada em `/workspace` |
| `src/features/studio-desk/FeaturedProjectPlate.tsx` | prancha editorial do projecto em destaque com sobreposição de grelha de cota e dossier |
| `src/features/studio-desk/PrioritiesPanel.tsx` | painel de prioridades com contadores derivados e marcação local de tarefas |
| `src/features/studio-desk/ProjectOverviewPanel.tsx` | catálogo de projectos activos com filtros por estado e ordenação |
| `src/features/studio-desk/ProjectDossierDialog.tsx` | diálogo modal acessível de dossier de projecto com focus trap |
| `src/features/studio-desk/QuickActionsBar.tsx` | barra de acções rápidas com filtros de foco, modo editorial/técnico e reposição local da mesa |
| `src/features/studio-desk/StudioActivityPanel.tsx` | registo cronológico de actividades do atelier |
| `src/features/studio-desk/StudioOpening.tsx` | abertura editorial da folha com saudação, relógios de estúdio e lente do papel activo |
| `src/features/studio-desk/useStudioDeskDialogFocusTrap.ts` | hook de focus trap isolado para dossiers de projecto |
| `src/features/studio-desk/i18n.ts` | dicionário bilingue PT/EN dedicado da Mesa de Trabalho |
| `src/features/workspace/WorkspaceSettingsPage.tsx` | folha operacional `/workspace/settings` (idioma, skip-welcome, movimento reduzido, rail, papéis e diagnóstico storage) |
| `src/features/workspace/PlannedModuleView.tsx` | prancha honesta para rotas futuras das Fases 03–06 com catálogo de projectos e atalhos para a mesa |
| `src/data/types.ts` | tipos estritos de domínio (`Role`, `DemoUser`, `DemoSession`, `UserPreferences`, etc.) |
| `src/data/fixtures.ts` | 6 perfis demonstrativos fictícios, 9 departamentos e projecto de estudo `OA-26-014` |
| `src/data/studioDeskTypes.ts` | tipos de domínio da Mesa de Trabalho (`StudioDeskProject`, `DeskPriorityItem`, `DeskActivityItem`, etc.) |
| `src/data/studioDeskFixtures.ts` | dados demonstrativos fictícios da Mesa de Trabalho (`STUDIO_DESK_PROJECTS`, `STUDIO_DESK_TASKS`, `ROLE_DESK_CONFIGS`) |
| `src/data/sessionRepository.ts` | persistência local sanitizada (zero passwords em storage, limpeza automática de sessões corrompidas) |
| `src/locales/pt.ts`, `src/locales/en.ts`, `src/locales/index.ts` | dicionários bilingues com paridade de chaves garantida por TypeScript e testes |
| `src/utils/timeGreeting.ts` | saudação determinística pela zona horária da `studioBase`, data editorial e relógios dinâmicos `CAT` / `CET` / `CEST` |
| `src/test/setup.ts` | configuração base Vitest (`jsdom` + mock de `matchMedia`) |
| `src/test/entryExperience.test.tsx` | suite de aceitação Fase 01, guardas de rota e invariante zero-password |
| `src/test/hardeningAndTime.test.tsx` | testes de acessibilidade do modal (`inert`, `Tab`, `Shift+Tab`, `Escape`) e regras `CET`/`CEST` por `studioBase` |
| `src/test/workspaceShell.test.tsx` | testes de integração do `WorkspaceShell` (rail, drawer mobile, pesquisa, notificações, definições) |
| `src/test/studioDesk.test.tsx` | suite unitária e de integração da Mesa de Trabalho do Argon B |
| `src/test/integrationPreview.test.tsx` | suite do Quality Gate de integração (câmara única, 6 papéis, pesquisa integrada, reset e bilinguismo) |

## Recursos Públicos e Documentação

| Caminho | Responsabilidade |
|---|---|
| `public/logo.png`, `public/favicon.png` | activos oficiais de marca O+A |
| `public/assets/studies/login-spatial-study.webp` | estudo espacial demonstrativo |
| `public/assets/studies/welcome-maquette-study.webp` | estudo de maquete demonstrativa 1:200 |
| `docs/DESIGN_BRIEF.md` | tese visual Fase 00 e comparação das composições de entrada |
| `docs/DESIGN_SYSTEM.md` | tokens, tipografia, contraste WCAG 2.2 AA e movimento |
| `docs/PRODUCT_SPEC.md` | fases 00–07, rotas e papéis demonstrativos |
| `docs/MOCK_DATA_CONTRACTS.md` | contratos de dados, `localStorage` e invariante zero-password |
| `docs/INTEGRATION_FUTURE.md` | contrato documental de publicação futura para `oa-workshop.com` |
| `docs/DECISIONS.md` | registo de decisões arquitecturais (ADR-001 a ADR-009) |
| `plans/001-phase-00-01-foundation-and-entry.md` | plano da Fase 00 e Fase 01 |
| `plans/002-phase-02a-shell-hardening.md` | plano da Fase 02A (`codex/f02-shell-hardening`) |
| `plans/003-phase-02-integration.md` | plano de integração técnica e Quality Gate da Fase 02 |
| `plans/004-phase-021a-shell-ux.md` | plano da Fase 02.1A (`codex/f021-shell-ux`) — scroll, navegação e legibilidade do Shell |
| `plans/005-phase-021-integration.md` | plano e registo da integração sequencial Fase 02.1 (`codex/f02-integration-preview`) |
| `scripts/e2e-verify-entry.mjs` | verificação E2E portátil em Chromium/Edge nas larguras 1440px, 680px altura, 768px, 720px (zoom) e 375px |
