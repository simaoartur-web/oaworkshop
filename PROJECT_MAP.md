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
| `vite.config.ts` | configuração Vite 7 (`manualChunks` isolando React, Router, Icons, Motion, R3F e Three.js) + Vitest (`jsdom`, `maxWorkers: 4`) |
| `postcss.config.js` | pipeline Tailwind CSS v4 + Autoprefixer |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | configuração TypeScript estrita |
| `eslint.config.js` | análise estática ESLint 9 + TypeScript + React Hooks |
| `index.html` | entrada HTML (`noindex, nofollow`, fontes `Outfit` e `Playfair Display`) |

## Código-fonte (`src/`)

| Caminho | Responsabilidade |
|---|---|
| `src/main.tsx` | montagem React e carregamento de `tokens.css` |
| `src/vite-env.d.ts` | declarações de tipos de cliente Vite (recursos estáticos e CSS) |
| `src/app/App.tsx` | rotas lazy com `WorkspaceShell` persistente, `<Suspense key={pathname}>`, `RouteChunkErrorBoundary` e redireccionamentos |
| `src/app/routePreload.ts` | pré-carregamento seguro de chunks de rota (`preloadRouteKey`, `preloadMatchedWorkspaceChild`, `preloadWorkspaceEntry`, `preloadInitialBrowserRoute`) sem rejeições não tratadas e `createRetryableLazy` |
| `src/app/WorkspaceSessionContext.tsx` | provider central reactivo de sessão demo, papel activo, idioma, `reduceMotionOverride`, época de reset e limpeza integral |
| `src/features/loading/RouteLoadingStates.tsx` | estados de carregamento editoriais (`EditorialEntryLoadingFallback`, `WorkspaceContentLoadingState`) e `RouteChunkErrorBoundary` com recuperação *in-place* e recarregamento |
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
| `src/features/workspace-shell/globalSearchIndex.ts` | motor de pesquisa local client-side com cache versionado `(libraryVersion, language)` e normalização NFD pré-computada (`0` leituras de storage por tecla) |
| `src/features/workspace-shell/shellUiContext.tsx` | contexto opcional do Shell para sincronização da prancha lateral com `/workspace/settings` |
| `src/features/workspace-shell/ArchitecturalRail.tsx` | navegação lateral desktop (expandida 264px / compacta 72px) e drawer acessível mobile/tablet |
| `src/features/workspace-shell/ContextualHeader.tsx` | cabeçalho contextual com identidade O+A, migalha, relógios Maputo/Milão, pesquisa, notificações, `PT/EN`, menu e logout directo |
| `src/features/workspace-shell/GlobalSearchDialog.tsx` | modal de pesquisa demonstrativa local com navegação por setas, Enter, Escape e estado vazio honesto |
| `src/features/workspace-shell/NotificationsPopover.tsx` | central de notificações demo com indicador de não lidas e acções para Studio Desk e pranchas planeadas |
| `src/features/workspace-shell/WorkspaceShell.tsx` | contentor editorial reutilizável que enquadra `<Outlet />` / `children` nas rotas `/workspace/*` |
| `src/features/studio-desk/StudioDeskPage.tsx` | mesa de trabalho operacional sincronizada com a Biblioteca canónica (`useProjectLibrary`), filtros, deep links `?project=` e estado extremo sem destaques arquivados |
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
| `src/features/workspace/PlannedModuleView.tsx` | prancha honesta para rotas futuras das Fases 04–06 com catálogo de projectos e atalhos para a mesa |
| `src/features/project-library/useProjectLibrary.ts` | hook reactivo do motor canónico de projectos (`listProjects`, criação, edição, arquivo/restauro, revisões, ficheiros) |
| `src/features/project-library/projectExperienceContract.ts` | adaptadores explícitos bidireccionais entre `CanonicalProjectRecord` e `project-experience` DTOs |
| `src/features/project-library/ProjectLibraryCatalogPage.tsx` | rota `/workspace/projects` ligando `ProjectGalleryView` ao motor canónico e pesquisa global |
| `src/features/project-library/ProjectCreateEnginePage.tsx` | rota `/workspace/projects/new` ligando `ProjectCreationWizard` à criação local persistente |
| `src/features/project-library/ProjectDossierShellPage.tsx` | rota `/workspace/projects/:id` ligando `ProjectDossierView` a documentos, histórico, edição, arquivo e faixa de estado 3D |
| `src/features/project-library/i18n.ts` | dicionário bilingue PT/EN dos estados de erro, not-found e títulos da biblioteca |
| `src/features/model-engine/modelViewerContract.ts` | contrato tipado Fase 04 (`ModelSource`, `ModelContext`, `ModelLoadState`, `ModelViewerCallbacks`) e adaptadores entre o motor A e o visualizador WebGL B |
| `src/features/model-engine/useProjectModelEngine.ts` | hook reactivo que resolve estado 3D do projecto, valida ficheiros `.glb`/`.gltf` locais, gere `ObjectURL` de sessão e sincroniza `loadState` real com `GLTFLoader` |
| `src/features/model-engine/ModelEngineStageSlot.tsx` | câmara técnica de pré-visualização 3D integrando `ArchitecturalModelViewer` com a fonte única de estado do motor |
| `src/features/model-engine/ProjectModelEnginePage.tsx` | rota `/workspace/projects/:id/model` (lazy-loaded) com palco 3D WebGL real e distinção das 3 categorias (referência documental, modelo demo fictício e ficheiro de sessão) |
| `src/features/model-engine/i18n.ts`, `index.ts` | dicionário bilingue PT/EN e exportações públicas do motor de modelos 3D |
| `src/features/model-viewer/ArchitecturalModelViewer.tsx` | visualizador 3D arquitectónico interactivo (`GLTFLoader`, estados `empty`/`loading`/`loaded`/erros/`webgl_unavailable`, câmaras, grelha/eixos/malha e ficha técnica) |
| `src/features/model-viewer/ModelViewerStage.tsx`, `ModelViewerErrorBoundary.tsx` | palco WebGL R3F preservado em trocas de modelo (`frameloop="demand"`, `dpr` até `1.5` ou perfil económico `1`, `powerPreference: 'default'`, `preserveDrawingBuffer: false`, `ErrorBoundary`, `OrbitControls`) |
| `src/features/model-viewer/ModelViewerControls.tsx` | barra de controlos de câmara (isométrica, superior, frontal, lateral, recentrar, repor vista, zoom, grelha, eixos, malha e ajuda) |
| `src/features/model-viewer/ModelInformationPanel.tsx` | ficha técnica lateral com telemetria real (`meshes`, `triangles`, `vertices`, dimensões, unidades verificadas vs não verificadas e nota `.skp`) |
| `src/features/model-viewer/ModelViewerFallback.tsx` | estados acessíveis de carregamento, modelo vazio, erro de formato/corrupção/tamanho e WebGL indisponível |
| `src/features/model-viewer/glbInspector.ts` | detecção WebGL em cache com `loseContext()`, inspecção `.glb`/`.gltf` com allowlist estrita de `data:` URIs, bloqueio de dependências externas no `LoadingManager`, `parseGlbSceneAndTelemetry` e `disposeThreeObjectResources` |
| `src/features/model-viewer/demoModels.ts`, `contracts.ts`, `i18n.ts`, `index.ts` | catálogo demo `.glb`, contratos tipados e dicionário bilingue PT/EN do visualizador 3D |
| `src/features/project-experience/ProjectGalleryView.tsx` | vista editorial em Galeria & Lista Técnica com filtros por estado, âmbito individual/função e pesquisa |
| `src/features/project-experience/ProjectDossierView.tsx` | dossier vivo em 6 secções (Identidade, Equipa, Desenvolvimento, Documentação, Histórico, Visibilidade) |
| `src/features/project-experience/ProjectCreationWizard.tsx` | assistente guiado de 4 passos com validação de datas/códigos, tratamento de erros de gravação e continuidade |
| `src/features/project-experience/contracts.ts`, `helpers.ts`, `i18n.ts` | contratos tipados, utilitários sincronizados e dicionário PT/EN da experiência editorial de projectos |
| `src/data/types.ts` | tipos estritos de domínio (`Role`, `DemoUser`, `DemoSession`, `UserPreferences`, etc.) |
| `src/data/fixtures.ts` | 6 perfis demonstrativos fictícios, 9 departamentos e projecto de estudo `OA-26-014` |
| `src/data/projectLibraryTypes.ts`, `projectLibraryAdapter.ts`, `projectLibraryRepository.ts` | camada canónica de projectos com snapshot imutável em cache (`deepFreezeValue`, `lookupMap` encapsulado `ReadonlyMap`), persistência atómica `oa_workspace_project_library_v1` e invalidação cross-tab |
| `src/data/modelAssetTypes.ts`, `modelAssetRepository.ts` | tipos e repositório da Fase 04A (3 categorias de modelos 3D, catálogo demo `.glb`/`.gltf`, validação binária/manifesto até 50 MB e ciclo `ObjectURL` em memória) |
| `src/data/studioDeskTypes.ts` | tipos de domínio da Mesa de Trabalho (`StudioDeskProject`, `DeskPriorityItem`, `DeskActivityItem`, etc.) |
| `src/data/studioDeskFixtures.ts` | dados demonstrativos fictícios da Mesa de Trabalho (`STUDIO_DESK_PROJECTS`, `STUDIO_DESK_TASKS`, `ROLE_DESK_CONFIGS`) |
| `src/data/sessionRepository.ts` | persistência local sanitizada (zero passwords em storage, limpeza automática de sessões corrompidas) |
| `src/locales/pt.ts`, `src/locales/en.ts`, `src/locales/index.ts` | dicionários bilingues com paridade de chaves garantida por TypeScript e testes |
| `src/utils/timeGreeting.ts` | saudação determinística pela zona horária da `studioBase`, cache de `Intl.DateTimeFormat`, data editorial e relógios dinâmicos `CAT` / `CET` / `CEST` |
| `src/test/setup.ts` | configuração base Vitest (`jsdom`, mock de `matchMedia` e reposição de caches da biblioteca e pesquisa) |
| `src/test/entryExperience.test.tsx` | suite de aceitação Fase 01, guardas de rota e invariante zero-password |
| `src/test/hardeningAndTime.test.tsx` | testes de acessibilidade do modal (`inert`, `Tab`, `Shift+Tab`, `Escape`) e regras `CET`/`CEST` por `studioBase` |
| `src/test/workspaceShell.test.tsx` | testes de integração do `WorkspaceShell` (rail, drawer mobile, pesquisa, notificações, definições) |
| `src/test/studioDesk.test.tsx` | suite unitária e de integração da Mesa de Trabalho do Argon B |
| `src/test/projectLibrary.test.tsx` | suite de integração Fase 03 (motor canónico, UI integrada, códigos únicos, datas, falhas storage e continuidade) |
| `src/test/projectExperience.test.tsx` | suite unitária/acessibilidade da experiência editorial B (galeria, dossier 6 secções e assistente 4 passos) |
| `src/test/modelEngine.test.tsx` | suite integrada da Fase 04 (motor + visualizador WebGL real, 3 categorias, P0.1–P0.4, P1 50 MB / comprimento GLB / `ObjectURL`, 6 perfis e PT/EN) |
| `src/test/modelEngineSecurity.test.tsx` | suite adversarial da Fase 04 Hardening A (allowlist MIME `data:`, inspecção JSON de `.glb`, bloqueio antes do `GLTFLoader` e limpeza de sessão no logout) |
| `src/test/modelViewer.test.tsx` | suite unitária da Fase 04B (`GLTFLoader` real, telemetria, vistas ortogonais/isométrica, grelha/eixos/malha, ficheiro local sem escala inventada, erros e dispose GPU) |
| `src/test/projectLibrarySecurity.test.tsx` | suite de integridade documental e quotas da Fase 04 Hardening A (nomes de ficheiro seguros, correspondência extensão/tipo, limites de caracteres/registos e `QuotaExceededError`) |
| `src/test/projectLibraryConsistency.test.tsx` | suite da Fase 04.5A + P2 (cache imutável, encapsulamento `lookupMap`, 0 leituras/parses na pesquisa, sincronização Studio Desk, estado extremo todos arquivados e escala 200 projectos) |
| `src/test/loadingPerformance.test.tsx` | suite da Fase 04.5B + P1 (Shell persistente em rotas lazy, cache `Intl`, estados de loading, imagens, `preloadMatchedWorkspaceChild` seguro e recuperação de falha de chunk em `RouteChunkErrorBoundary`) |
| `src/test/integrationPreview.test.tsx` | suite do Quality Gate de integração (câmara única, 6 papéis, pesquisa integrada, reset e bilinguismo) |

## Recursos Públicos e Documentação

| Caminho | Responsabilidade |
|---|---|
| `public/logo.png`, `public/favicon.png` | activos oficiais de marca O+A |
| `public/assets/studies/login-spatial-study.webp` | estudo espacial demonstrativo |
| `public/assets/studies/welcome-maquette-study.webp` | estudo de maquete demonstrativa 1:200 |
| `public/assets/models/oa-ponta-vermelha-pavilion-demo.glb` | modelo binário glTF 2.0 demonstrativo (`OA-26-101`, 16 malhas, 192 triângulos, escala `1:100`, unidade `m`) |
| `public/assets/models/oa-costa-terraces-massing-demo.glb` | modelo binário glTF 2.0 demonstrativo (`OA-26-108`, 8 malhas, 96 triângulos, escala `1:250`, unidade `m`) |
| `docs/DESIGN_BRIEF.md` | tese visual Fase 00 e comparação das composições de entrada |
| `docs/DESIGN_SYSTEM.md` | tokens, tipografia, contraste WCAG 2.2 AA e movimento |
| `docs/PRODUCT_SPEC.md` | fases 00–07, rotas e papéis demonstrativos |
| `docs/MOCK_DATA_CONTRACTS.md` | contratos de dados, `localStorage` e invariante zero-password |
| `docs/INTEGRATION_FUTURE.md` | contrato documental de publicação futura para `oa-workshop.com` |
| `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md` | contrato de integração Fase 04 entre o motor de modelos 3D (Agente A) e o visualizador WebGL (Agente B) |
| `docs/DECISIONS.md` | registo de decisões arquitecturais (ADR-001 a ADR-010) |
| `docs/audits/phase045-performance-final.md` | auditoria independente de performance da Fase 04.5 (Agente C — A/B Base `37265d5` vs Preview `4197c2e`, fontes/CPU/rede controladas, escala 50/200 e classificação P0/P1/P2) |
| `plans/001-phase-00-01-foundation-and-entry.md` | plano da Fase 00 e Fase 01 |
| `plans/002-phase-02a-shell-hardening.md` | plano da Fase 02A (`codex/f02-shell-hardening`) |
| `plans/003-phase-02-integration.md` | plano de integração técnica e Quality Gate da Fase 02 |
| `plans/004-phase-021a-shell-ux.md` | plano da Fase 02.1A (`codex/f021-shell-ux`) — scroll, navegação e legibilidade do Shell |
| `plans/005-phase-021-integration.md` | plano e registo da integração sequencial Fase 02.1 (`codex/f02-integration-preview`) |
| `plans/007-phase-03-integration.md` | plano e registo de integração Fase 03 A+B, correcções P0/P1 e Quality Gate |
| `plans/006-phase-03a-project-platform.md` | plano da Fase 03A (`codex/f03-project-platform`) — domínio canónico, catálogo e motor do dossier |
| `plans/008-phase-04a-model-engine.md` | plano da Fase 04A (`codex/f04-model-engine`) — motor de modelos 3D, validação `.glb`/`.gltf`/`.skp` e rota `/workspace/projects/:id/model` |
| `plans/009-phase-04-integration.md` | plano e registo da integração Fase 04 Equipa 1 (Agentes A+B), correcções P0/P1 e Quality Gate WebGL |
| `plans/010-phase-04a-security-hardening.md` | plano da Fase 04 Hardening — Agente A (`codex/f04a-security-hardening`): allowlist `data:` URI, inspecção GLB, limpeza logout, nomes documentais e quotas |
| `plans/011-phase-045a-data-consistency.md` | plano da Fase 04.5A (`codex/f045a-data-consistency`) — cache canónica, pesquisa pré-normalizada e sincronização Studio Desk |
| `plans/012-phase-045b-loading-performance.md` | plano da Fase 04.5B (`codex/f045b-loading-performance`) — code-splitting, `manualChunks`, loading states, cache `Intl` e imagens |
| `plans/013-phase-045-integration.md` | plano e relatório da integração Fase 04.5 A+B (`codex/f02-integration-preview`), correcções P1/P2, benchmarks multi-execução e Quality Gate |
| `plans/014-agent-governance-v1.md` | plano e registo da Governança Multiagente v1 (`codex/docs-agent-governance-v1`) |
| `plans/015-phase-0451-closure.md` | plano técnico da Fase 04.5.1 (reconciliação documental, fecho P1 obrigatórios + performance e Quality Gate) |
| `plans/016-model-governance-v1.md` | plano e registo da Model Governance Policy v1 (`codex/docs-model-governance-v1`) |
| `plans/017-phase-05-tasks-calendar.md` | plano e registo da Fase 05 · Módulo 1: Tarefas (`/workspace/tasks`) e Calendário (`/workspace/calendar`) |
| `plans/018-phase-05-m2-departments-team-library.md` | plano técnico e funcional da Fase 05 · Módulo 2: Departamentos (`/workspace/departments`), Equipa (`/workspace/team`), Biblioteca Técnica (`/workspace/library`) e backlog Google Calendar |
| `docs/agent-reports/phase-05/` | relatórios técnicos publicados da Fase 05 (`05-DATA-01`, `05-FE-01`, `05-QA-01`, `05-M2-PLAN-01`, `05-M2-DATA-01`, `05-M2-FE-01`, `05-M2-QA-01`) |
| `src/data/operationsTypes.ts`, `tasksRepository.ts`, `calendarSelector.ts` | camada canónica da Fase 05 · Módulo 1 (tarefas locais `oa_workspace_tasks_v1` com snapshot imutável/sync cross-tab e selector derivado de calendário) |
| `src/features/operations/` | módulo UI da Fase 05 · Módulo 1 (`useStudioOperations.ts`, `TasksPage.tsx`, `TaskBoardView.tsx`, `TaskEditorDialog.tsx`, `CalendarPage.tsx`, `i18n.ts`) |
| `src/data/studioStructureTypes.ts`, `studioStructureSelectors.ts`, `technicalLibraryRepository.ts` | camada canónica da Fase 05 · Módulo 2 (selectors derivados de 9 departamentos e 6 perfis sem credenciais, e repositório local de biblioteca técnica `oa_workspace_technical_library_v1` apenas metadados) |
| `src/features/studio-structure/` | módulo UI da Fase 05 · Módulo 2 (`useStudioStructure.ts`, `DepartmentsPage.tsx`, `TeamPage.tsx`, `TechnicalLibraryPage.tsx`, `TechnicalReferenceDialog.tsx`, `i18n.ts`) |
| `src/data/editorialReportsTypes.ts`, `publicationsRepository.ts`, `activitySelector.ts`, `reportsSelector.ts` | camada canónica da Fase 06 (fila editorial local `oa_workspace_publications_v1` sincronizada com projectos, selector cronológico unificado de actividade e selector derivado de relatórios com serialização JSON local) |
| `src/features/editorial-control/` | módulo UI da Fase 06 (`useEditorialControl.ts`, `PublicationsPage.tsx`, `PublicationPreviewDialog.tsx`, `ActivityPage.tsx`, `ReportsPage.tsx`, `i18n.ts`) |
| `src/test/studioOperations.test.tsx`, `operationsExperience.test.tsx`, `studioStructure.test.tsx`, `studioStructureExperience.test.tsx` | suites de testes da Fase 05 (Módulo 1 e Módulo 2: dados canónicos, quota, cross-tab, UI, navegação cruzada e PT/EN) |
| `src/test/editorialControl.test.tsx`, `editorialControlExperience.test.tsx` | suites de testes da Fase 06 (fila editorial, transições, quota, cross-tab, preview modal acessível, sincronização URL em montagem, actividade e relatórios/exportação JSON) |
| `plans/019-phase-06-publications-activity-reports.md` | plano técnico e funcional da Fase 06: Publicações (`/workspace/publications`), Actividade (`/workspace/activity`) e Relatórios (`/workspace/reports`) |
| `docs/agent-reports/phase-06/` | relatórios técnicos publicados da Fase 06 (`06-DATA-01`, `06-FE-01`, `06-QA-01`) |
| `docs/audits/phase045-security-qa-final.md` | auditoria independente de segurança e QA da Fase 04.5 (Gemini D · `codex/f045-security-qa-final`) |
| `docs/agent-reports/phase-045/` | relatórios técnicos publicados da Missão 1 Swarm (`045-ARCH-01-agent-a.md`, `045-UX-01-agent-b.md`, `045-PERF-01-agent-c.md`, `045-QA-01-agent-d.md`) |
| `docs/agent-reports/phase-0451/` | relatórios técnicos publicados da Fase 04.5.1 (`0451-DATA-01-agent-a.md`, `0451-FE-01-agent-b.md`, `0451-PERF-01-agent-c.md`, `0451-QA-01-agent-d.md`) |
| `docs/agent-ops/OPERATING_MODEL.md` | modelo operacional da equipa multiagente (`@coordinator`, `@agent-a`–`@agent-d`, RACI, ciclo `Plan → Implement → Integrate → Verify → Approve`, Git Delivery Policy v1, economia de tokens e Board) |
| `docs/agent-ops/TASK_CONTRACT.md` | modelo reutilizável de contrato de missão (base SHA, worktree/branch, propriedade exclusiva de ficheiros, limites e critérios de aceitação) |
| `.agents/rules/00-governance-core.md` | regra nativa Antigravity (`trigger: always_on`) com invariantes mínimos de isolamento, aprovação e paragem |
| `.agents/rules/10-data-architecture.md` | regra nativa Antigravity (`trigger: glob`) para o domínio de dados e arquitectura (`@agent-a`) |
| `.agents/rules/20-frontend-ux-webgl.md` | regra nativa Antigravity (`trigger: glob`) para o domínio de frontend, WCAG 2.2 AA, chunking e WebGL (`@agent-b`) |
| `.agents/rules/30-audit-qa-security.md` | regra nativa Antigravity (`trigger: model_decision`) para auditorias independentes e Quality Gates (`@agent-c`, `@agent-d`) |
| `.agents/rules/40-swarm-coordination-and-releases.md` | regra nativa Antigravity (`trigger: model_decision`) para coordenação multiagente, Board e aprovações de release (`@coordinator`) |
| `.agents/rules/50-model-governance.md` | regra nativa Antigravity (`trigger: model_decision`) com a Model Governance Policy v1 (hierarquia Opus → GPT → Gemini não-Argon e proibição absoluta de Argon) |
| `.github/workflows/workspace-quality-gate.yml` | Quality Gate automatizado GitHub Actions exclusivo da linha O+A Workspace (`codex/f02-integration-preview` e `codex/**`, incluindo E2E visual em PR) |
| `scripts/e2e-verify-entry.mjs` | verificação E2E portátil em Chromium/Edge nas larguras 1440px, 680px altura, 768px, 720px (zoom) e 375px |
