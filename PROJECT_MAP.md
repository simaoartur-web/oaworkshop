# Mapa do Projecto — O+A Workspace (`PROJECT_MAP.md`)

> **Finalidade:** localizar responsabilidades sem explorar repetidamente o repositório.
> **Regra:** actualizar este mapa sempre que um ficheiro for criado, movido ou mudar de responsabilidade.

## Entrada rápida por tarefa

| Tarefa | Começar por | Consultar também |
|---|---|---|
| Alterar direcção de arte, tokens ou tipografia | `src/design-system/tokens.css` | `docs/DESIGN_BRIEF.md`, `docs/DESIGN_SYSTEM.md` |
| Alterar ecrã de Login (`/login`) | `src/features/auth-demo/LoginPage.tsx` | `src/design-system/ArchitecturalSectionDrawing.tsx`, `src/design-system/DemoNoticeDialog.tsx` |
| Alterar ecrã de Boas-vindas (`/welcome`) | `src/features/welcome/WelcomePage.tsx` | `src/data/fixtures.ts`, `src/utils/timeGreeting.ts` |
| Alterar fecho de percurso `/workspace` (Fase 01) | `src/features/workspace/WorkspaceEntryGatePage.tsx` | `src/app/App.tsx`, `docs/PRODUCT_SPEC.md` |
| Alterar sessão demo, papéis ou `localStorage` | `src/data/sessionRepository.ts` | `src/app/WorkspaceSessionContext.tsx`, `docs/MOCK_DATA_CONTRACTS.md` |
| Alterar textos bilingues PT / EN | `src/locales/pt.ts`, `src/locales/en.ts` | `src/locales/index.ts` |
| Executar ou ampliar testes | `src/test/entryExperience.test.tsx` | `scripts/e2e-verify-entry.mjs` |

## Raiz e Configuração

| Caminho | Responsabilidade |
|---|---|
| `AGENTS.md` | regras obrigatórias do repositório autónomo `oaworkspace` |
| `PROJECT_MAP.md` | este índice estrutural |
| `README.md` | instruções de instalação, execução, testes e fronteiras do projecto |
| `package.json` | scripts (`dev`, `build`, `lint`, `test`, `test:e2e`) e dependências frontend |
| `vite.config.ts` | configuração Vite 7 + Vitest (`jsdom`) |
| `postcss.config.js` | pipeline Tailwind CSS v4 + Autoprefixer |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | configuração TypeScript estrita |
| `eslint.config.js` | análise estática ESLint 9 + TypeScript + React Hooks |
| `index.html` | entrada HTML (`noindex, nofollow`, fontes `Outfit` e `Playfair Display`) |

## Código-fonte (`src/`)

| Caminho | Responsabilidade |
|---|---|
| `src/main.tsx` | montagem React e carregamento de `tokens.css` |
| `src/vite-env.d.ts` | declarações de tipos de cliente Vite (recursos estáticos e CSS) |
| `src/app/App.tsx` | rotas (`/login`, `/welcome`, `/workspace/*`), lazy-loading e redireccionamentos |
| `src/app/WorkspaceSessionContext.tsx` | provider central reactivo de sessão demo, papel activo, idioma e preferências |
| `src/design-system/tokens.css` | paleta canónica O+A, grelha técnica, foco acessível WCAG 2.2 AA e reduced-motion |
| `src/design-system/OABrandMark.tsx` | monograma oficial O+A adaptado para superfícies escuras com fallback tipográfico |
| `src/design-system/LanguageToggle.tsx` | alternador acessível `PT / EN` com alvo mínimo de 44×44 px |
| `src/design-system/ArchitecturalSectionDrawing.tsx` | corte ortogonal técnico 1:100 em SVG vectorial para `/login` |
| `src/design-system/DemoNoticeDialog.tsx` | diálogo modal acessível (`aria-modal`, `Escape`, restauro de foco) |
| `src/features/auth-demo/LoginPage.tsx` | câmara de entrada assimétrica 58/42, validação, 6 perfis demo e corte técnico |
| `src/features/welcome/WelcomePage.tsx` | caderno editorial pós-login com saudação horária, estudo em foco e prioridades |
| `src/features/workspace/WorkspaceEntryGatePage.tsx` | destino autenticado da Fase 01 para validação do percurso e controlo de sessão |
| `src/data/types.ts` | tipos estritos de domínio (`Role`, `DemoUser`, `DemoSession`, `UserPreferences`, etc.) |
| `src/data/fixtures.ts` | perfis demonstrativos fictícios, departamentos e projecto de estudo `OA-26-014` |
| `src/data/sessionRepository.ts` | persistência local sanitizada (zero passwords em storage) e reset |
| `src/locales/pt.ts`, `src/locales/en.ts`, `src/locales/index.ts` | dicionários bilingues com paridade de chaves garantida por TypeScript |
| `src/utils/timeGreeting.ts` | cálculo de saudação por período do dia, datas editoriais e relógios Maputo/Milão |
| `src/test/setup.ts`, `src/test/entryExperience.test.tsx` | suite de testes unitários e de integração dos fluxos da Fase 01 |

## Recursos Públicos e Documentação

| Caminho | Responsabilidade |
|---|---|
| `public/logo.png`, `public/favicon.png` | activos oficiais de marca O+A |
| `public/assets/studies/login-spatial-study.webp` | estudo espacial demonstrativo (pátio de betão cofrado e taipa terracota) |
| `public/assets/studies/welcome-maquette-study.webp` | estudo de maquete demonstrativa 1:200 para `/welcome` |
| `docs/DESIGN_BRIEF.md` | tese visual Fase 00 e comparação das duas composições de entrada |
| `docs/DESIGN_SYSTEM.md` | tokens, tipografia, contraste WCAG 2.2 AA e movimento |
| `docs/PRODUCT_SPEC.md` | fases 00–07, rotas e papéis demonstrativos |
| `docs/MOCK_DATA_CONTRACTS.md` | contratos de dados, `localStorage` e invariante zero-password |
| `docs/INTEGRATION_FUTURE.md` | contrato documental de publicação futura para `oa-workshop.com` |
| `docs/DECISIONS.md` | registo de decisões arquitecturais (ADR-001 a ADR-005) |
| `plans/001-phase-00-01-foundation-and-entry.md` | plano activo da Fase 00 e Fase 01 |
| `scripts/e2e-verify-entry.mjs` | verificação E2E real em Chromium nas larguras 1440px, 768px e 375px |
