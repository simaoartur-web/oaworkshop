# O+A Workspace — Internal Studio Operating Space

Aplicação interna demonstrativa (*Architectural Operating Space*) concebida para o atelier **O+A Arquitectos e Planeadores** (Milão · Maputo), construída como projecto **autónomo e isolado** do website público `oa-workshop.com`.

## Estado da Entrega Actual

- **Fase 00 — Direcção de Arte e Arquitectura:** Concluída (`docs/DESIGN_BRIEF.md`, `docs/DESIGN_SYSTEM.md`, `docs/PRODUCT_SPEC.md`, `docs/MOCK_DATA_CONTRACTS.md`, `docs/INTEGRATION_FUTURE.md`, `docs/DECISIONS.md`).
- **Fase 01 — Experiência de Entrada (`/login`, `/welcome`, `/workspace`):** Implementada, avaliada e endurecida na Fase 02A.
- **Fase 02A — Hardening & Workspace Shell (`codex/f02-shell-hardening`):**
  - Modal acessível com `inert` no fundo exterior, confinamento `Tab`/`Shift+Tab`, `Escape` e restauro garantido do foco (`src/design-system/useDialogFocusTrap.ts`).
  - Fusos Maputo (`CAT`) e Milão (`CET`/`CEST` dinâmico) e regra de saudação pela base de estúdio do colaborador (`src/utils/timeGreeting.ts`).
  - `WorkspaceShell` reutilizável com `ArchitecturalRail` (expandido/compacto + drawer mobile/tablet), `ContextualHeader`, `GlobalSearchDialog` local, `NotificationsPopover` local e folha `/workspace/settings`.
  - Slot em `/workspace` preparado por contrato para integração directa de `StudioDeskPage` (Agente Argon B).

## Fronteiras e Honestidade Operacional

- **100% Frontend + Mock Data Local:** sem backend, base de dados real, envios de e-mail, OAuth ou armazenamento na nuvem nesta fase.
- **Zero Passwords Armazenadas:** `localStorage` guarda apenas identificadores demonstrativos (`oa_workspace_demo_session_v1`), preferências (`oa_workspace_user_prefs_v1`), estado local da prancha lateral (`oa_workspace_shell_rail_v1`) e estado de leitura das notificações fictícias (`oa_workspace_demo_notifications_v1`).
- **Isolamento Total:** nenhuma alteração é efectuada sobre o repositório público `oaworkshop` nem sobre os ficheiros do Agente B.

## Comandos Principais

```bash
npm install
npm run dev       # Servidor local de desenvolvimento
npm run lint      # Verificação estática ESLint + TypeScript
npm run test      # Testes unitários e de integração (Vitest + Testing Library)
npm run build     # Compilação TypeScript estrita + bundle de produção Vite
npm run test:e2e  # Verificação E2E real em Chromium/Edge (1440px, 768px, 375px)
```

## Requisitos e Portabilidade do E2E (`npm run test:e2e`)

O script [`scripts/e2e-verify-entry.mjs`](scripts/e2e-verify-entry.mjs) é portátil e configurável por variáveis de ambiente:

- **Directório de capturas (`OA_SCREENSHOT_DIR`):** por omissão grava em caminho relativo ignorado pelo Git (`test-results/e2e-screenshots`). Defina `OA_SCREENSHOT_DIR=./meu-dir` para outro destino.
- **Detecção de browser (`OA_E2E_BROWSER` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`):**
  1. Utiliza explicitamente `OA_E2E_BROWSER` ou `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` se definidos.
  2. Tenta o Chromium gerido pelo Playwright (`npx playwright install chromium`).
  3. Procura caminhos padrão de Chrome/Chromium/Edge no sistema operativo actual (Windows, macOS ou Linux).
- **Pré-requisito se não tiver Chrome/Edge local instalado:**
  ```bash
  npx playwright install chromium
  ```
- **Porta do servidor de preview (`OA_E2E_PORT`):** por omissão `4179`.
