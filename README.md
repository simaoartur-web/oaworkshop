# O+A Workspace — Internal Studio Operating Space

Aplicação interna demonstrativa (*Architectural Operating Space*) concebida para o atelier **O+A Arquitectos e Planeadores** (Milão · Maputo), construída como projecto **autónomo e isolado** do website público `oa-workshop.com`.

## Estado da Entrega Actual

- **Fase 00 — Direcção de Arte e Arquitectura:** Concluída (`docs/DESIGN_BRIEF.md`, `docs/DESIGN_SYSTEM.md`, `docs/PRODUCT_SPEC.md`, `docs/MOCK_DATA_CONTRACTS.md`, `docs/INTEGRATION_FUTURE.md`, `docs/DECISIONS.md`).
- **Fase 01 — Experiência de Entrada (`/login`, `/welcome` e percurso até `/workspace`):** Implementada e verificada em desktop (`1440px`), tablet (`768px`) e mobile (`375px`).
- **Próximas Fases (02 a 07):** Aguardam avaliação explícita da experiência de entrada pelo utilizador.

## Fronteiras e Honestidade Operacional

- **100% Frontend + Mock Data Local:** sem backend, base de dados real, envios de e-mail, OAuth ou armazenamento na nuvem nesta fase.
- **Zero Passwords Armazenadas:** `localStorage` guarda apenas o identificador fictício de sessão demo (`oa_workspace_demo_session_v1`) e preferências visuais (`oa_workspace_user_prefs_v1`).
- **Isolamento Total:** nenhuma alteração é efectuada sobre o repositório público `oaworkshop`.

## Comandos Principais

```bash
npm install
npm run dev       # Servidor local de desenvolvimento
npm run lint      # Verificação estática ESLint + TypeScript
npm run test      # Testes unitários e de integração (Vitest + Testing Library)
npm run build     # Compilação TypeScript estrita + bundle de produção Vite
npm run test:e2e  # Verificação E2E real em browser Chromium (1440px, 768px, 375px)
```
