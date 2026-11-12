# Plano 005 — Fase 02.1 · Integração Sequencial e Quality Gate (A + B)

- **Responsável de integração:** Argon A
- **Worktree exclusivo de integração:** `oaworkspace-f02-preview`
- **Branch de destino:** `codex/f02-integration-preview`
- **Base anterior da preview:** `3b9881dbbe59a3c507e7306030ba405d4e3f4570`
- **Estado:** Integrado e validado em preview (sem tocar em `main`, site público ou branches SEO)

---

## 1. Sequência Exacta de Integração

| Ordem | Branch / Origem | SHA | Resultado do Merge |
|---|---|---|---|
| Base | `codex/f02-integration-preview` | `3b9881dbbe59a3c507e7306030ba405d4e3f4570` | Commit inicial da preview Fase 02 |
| 1 | `codex/f021-shell-ux` (Argon A · Fase 02.1A) | `a7a819fb76444cf8a6c47bde49bd7be8262cb7d2` | Merge `8defee8ba7238757b733208bd518c4b978d69ee3` limpo sem conflitos (`ort`) |
| 2 | `origin/codex/f021-desk-ux` (Argon B · Fase 02.1B) | `7d1e9a34c7014a33eba4d05d440cf939956cb3c9` | Merge `d6617a04f0876205724dca9e7eff44f9bd332e6c` sequencial limpo sem conflitos (`ort`) |

- **Ajuste de integração no preview:** `scripts/e2e-verify-entry.mjs` actualizado para reconhecer a etiqueta `Abrir dossier do projecto` introduzida pela Fase 02.1B ao validar abertura e fecho por `Escape` do modal de dossier sobre a página já percorrida verticalmente.
- **Compatibilidade funcional confirmada entre A e B:**
  - Deep-links `/workspace?project=<id>` originados em `GlobalSearchDialog` e `NotificationsPopover` articulam-se com o banner de projecto em destaque (`StudioOpening`) e limpeza `replace` do `StudioDeskPage`, com reposição limpa do scroll em `#workspace-main-scroll` em navegações `PUSH` e preservação do foco e restauro `POP`.
  - Sidebar (`264px` expandida e `72px` compacta), header contextual e camadas de modais/portais mantêm-se íntegros e sem sobreposição em cima da Mesa de Trabalho refinada pelo Argon B.

---

## 2. Quality Gate Pós-Integração (`codex/f02-integration-preview`)

- `npm run lint` (`eslint .`) -> aprovado sem avisos nem erros.
- `npm run test` (`vitest run`) -> `5` ficheiros de teste (`hardeningAndTime`, `integrationPreview`, `entryExperience`, `workspaceShell`, `studioDesk`), `45/45` testes aprovados (incluindo destaque `?project=` via Pesquisa Global e fluxo não destrutivo `O meu trabalho` / `Abrir próxima prioridade`).
- `npm run build` (`tsc -b && vite build`) -> build de produção limpo (`dist/assets/index-*.js`).
- `npm run test:e2e` (`node scripts/e2e-verify-entry.mjs`) -> aprovado (`0` erros de consola/página, `0` pedidos de rede inesperados, validação desktop `1440×900` topo/meio/fundo, compact tooltip scrolled, `1440×680`, reflow zoom `200%` a `720×450`, tablet `768px`, mobile `375px`, pesquisa global `?project=` e `Back`/`Forward` com scroll e query params).
