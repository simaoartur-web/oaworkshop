# Plano 003 — Fase 02 · Integração Técnica e Quality Gate

- **Agente de Integração:** Argon A
- **Worktree exclusivo:** `oaworkspace-f02-preview`
- **Branch exclusiva:** `codex/f02-integration-preview`
- **Commit base comum:** `2b7b6a9818bb70b17d3364a01f193e4b32386ff7` (`codex/feat-phase-00-01-entry-experience`)
- **Commits integrados:**
  - Argon A (`codex/f02-shell-hardening`): `310556a1c380e315d20ff79525fb214a75730270`
  - Argon B (`codex/f02-studio-desk` inicial): `b44beaa472c51e692e3b2b447df85db07abce0df`
  - Argon B (`codex/f02-studio-desk` hardening): `9b3f746590e663d5ba80cc68224b1dabb1f96632`
- **Estado:** Concluído, aprovado no Quality Gate (41/41 testes Vitest, ESLint limpo, Build de produção limpo, E2E portátil aprovado em 1440px, 768px e 375px).

## 1. Objectivos da Integração

1. **Fusão com Preservação de Histórico:** integrar os desenvolvimentos de A e B com `git merge --no-ff`, garantindo rastreabilidade atómica e zero perda de código.
2. **Ligação Directa da Mesa de Trabalho:** substituir o placeholder provisório `WorkspaceEntryGatePage.tsx` da Fase 02A pela implementação completa de `StudioDeskPage` do Argon B em `/workspace`.
3. **Câmara Única (Single Chrome Guarantee):** assegurar um único cabeçalho contextual (`ContextualHeader`), uma única prancha técnica lateral (`ArchitecturalRail`) e um único contentor principal (`WorkspaceShell`).
4. **Harmonização do Reset Global:** assegurar que o reset em `/workspace/settings` limpa as 5 chaves de `localStorage` (`oa_workspace_demo_session_v1`, `oa_workspace_demo_prefs_v1`, `oa_workspace_demo_notifications_v1`, `oa_workspace_shell_rail_v1`, `oa_workspace_studio_desk_v1`) e re-inicializa o Shell via `demoResetEpoch` sem exigir refresh.
5. **Pesquisa Global Unificada:** indexar os 5 projectos demonstrativos do Studio Desk (`OA-26-101`, `OA-26-108`, `OA-26-112`, `OA-26-119`, `OA-26-124`), códigos de autor e metadados com filtros por categoria e badges de rotas planeadas.
6. **Harmonização de Notificações:** sincronizar itens fictícios da central de notificações com os códigos reais dos projectos e associar acções contextuais bilingues para o Studio Desk e pranchas planeadas.
7. **Quality Gate Estrito:** validação de TypeScript estrito, linting, testes unitários, testes de integração e verificação E2E no Chromium em desktop, tablet e mobile.

## 2. Decisões Técnicas Registadas

- **Imports Directos Estáticos para Rotas Principais (`src/app/App.tsx`):** substituição de carregamento assíncrono preguiçoso nas rotas nucleares por importações estáticas, eliminando intermitências de loading fallback e assegurando renderização instantânea da mesa e navegação imediata.
- **Hierarquia de Resultados na Pesquisa Global (`globalSearchIndex.ts`):** ordenação dos resultados em rotas primárias, perfis de colaboradores, projectos e departamentos, permitindo que a pesquisa por nome active de imediato o colaborador relevante sem ambiguidades.
- **Suporte a Múltiplas Instâncias de Identificadores:** calibração das asserções de acessibilidade para elementos repetidos com propósito legítimo (ex.: código do colaborador no cabeçalho e na folha da mesa; título do projecto na prancha de destaque e no catálogo geral).
- **Timeout de Teste Adequado em Vitest (`vite.config.ts`):** calibração de `testTimeout: 20000` para acomodar com segurança os percursos completos de integração com montagem integral de componentes e simulação de eventos de utilizador em ambiente jsdom.

## 3. Verificações Executadas

- `npm run lint` (`eslint .`) — **0 erros, 0 avisos**.
- `npm run test` (`vitest run`) — **5 ficheiros, 41/41 testes aprovados**:
  - `src/test/hardeningAndTime.test.tsx` (4 testes)
  - `src/test/integrationPreview.test.tsx` (6 testes)
  - `src/test/entryExperience.test.tsx` (9 testes)
  - `src/test/workspaceShell.test.tsx` (6 testes)
  - `src/test/studioDesk.test.tsx` (16 testes)
- `npm run build` (`tsc -b && vite build`) — **sucesso** (bundle compilado em 34.64s).
- `npm run test:e2e` (`node scripts/e2e-verify-entry.mjs`) — **sucesso** em Chromium headless a 1440×900, 768×1024 e 375×812:
  - 0 erros de consola, 0 erros de página, 0 pedidos externos
  - 0 transbordamentos horizontais (overflow)
  - 0 colisões entre blocos de cabeçalho
  - 16 capturas de ecrã geradas e copiadas para o directório de artefactos.
