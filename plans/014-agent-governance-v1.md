# Plano 014 · Agent Governance v1 — Formalização da Equipa Multiagente

- **Branch:** `codex/docs-agent-governance-v1`
- **Base:** `origin/codex/f02-integration-preview` (`4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`)
- **Worktree isolado:** `D:/projects/O+A Architecture and Planners/Main/oaworkspace-governance-v1`
- **Aprovação humana:** Aprovado pelo responsável sobre a proposta `agent_governance_v1_proposal.md` e adenda `git_delivery_policy_v1_amendment.md`
- **Estado:** Etapa 2 + adenda Git Delivery Policy v1 gravadas e verificadas em `codex/docs-agent-governance-v1`; aguarda aprovação humana para integração em `codex/f02-integration-preview` e eventual arranque da Etapa 3 (Missão-Piloto).

---

## 1. Objectivo e Fronteiras

Formalizar a governança permanente da equipa multiagente do **O+A Workspace** (`@coordinator`, `@agent-a`, `@agent-b`, `@agent-c`, `@agent-d` e auxiliar passivo `@monitor`) recorrendo aos mecanismos nativos do Antigravity (`.agents/rules/` com frontmatter válido) sem substituir regras existentes, sem modificar código de produção (`src/`), sem tocar em `main`, website público `oaworkshop` ou `.github/workflows/deploy.yml`, sem iniciar a Fase 05 e sem executar merges.

---

## 2. Entregáveis Gravados

| Caminho | Tipo / Trigger | Finalidade |
|---|---|---|
| `docs/agent-ops/OPERATING_MODEL.md` | Documentação operacional | Modelo operacional completo (papéis, autoridade, propriedade exclusiva, ciclo `Plan → Implement → Integrate → Verify → Approve`, hard stops, RACI, escolha de modo, economia de tokens, comunicação no Board e protecção GitHub). |
| `docs/agent-ops/TASK_CONTRACT.md` | Modelo reutilizável | Contrato padrão de missão (ID, fase, SHA base, branch/worktree, ficheiros exclusivos, limites, testes e formato de entrega em 7 secções). |
| `.agents/rules/00-governance-core.md` | `trigger: always_on` | Núcleo mínimo de invariantes absolutos (`< 2 KB`, zero repetição de `AGENTS.md`). |
| `.agents/rules/10-data-architecture.md` | `trigger: glob` | Regras de domínio de dados, cache imutável, persistência atómica, quotas e segurança 3D (`@agent-a`). |
| `.agents/rules/20-frontend-ux-webgl.md` | `trigger: glob` | Regras de frontend, identidade O+A, WCAG 2.2 AA (`#CE826D`/branco), chunking/Shell, WebGL e PT/EN (`@agent-b`). |
| `.agents/rules/30-audit-qa-security.md` | `trigger: model_decision` | Protocolo read-only, evidência reproduzível, isolamento de worktrees/portas e classificação P0/P1/P2 (`@agent-c` e `@agent-d`). |
| `.agents/rules/40-swarm-coordination-and-releases.md` | `trigger: model_decision` | Protocolo de coordenação, comunicação no Board sem duplicação, escolha de modo e porta de aprovação de merges/releases (`@coordinator`). |
| `.github/workflows/workspace-quality-gate.yml` | CI GitHub Actions | Quality Gate automatizado exclusivo da linha `codex/f02-integration-preview` e `codex/**` (isolamento, `lint`, `build`, `0 B` 3D/motion no entry, Vitest e `npm audit --omit=dev`). |
| `AGENTS.md` | Adição mínima (+8 linhas) | Secção 5 ligando `OPERATING_MODEL.md`, `TASK_CONTRACT.md` e `.agents/rules/`, preservando intactas as 29 linhas originais. |
| `PROJECT_MAP.md` | Índice estrutural | Registo dos novos ficheiros em `docs/agent-ops/`, `.agents/rules/`, `.github/workflows/` e `plans/014-agent-governance-v1.md`. |

---

## 3. Verificações Executadas

- Frontmatter YAML válido em todos os 5 ficheiros `.agents/rules/*.md` (`always_on`, `glob` com string única separada por vírgulas e prefixo `**/`, `model_decision` com `description`).
- Orçamento de contexto `always_on`: `AGENTS.md` + `00-governance-core.md` `< 5 KB` totais (bem abaixo do limite de `24 KB` por ficheiro e `20 000` tokens agregados).
- Isolamento confirmado: `git diff 4197c2e..HEAD -- src/ package.json package-lock.json index.html vite.config.ts public/` 100% vazio; `main` e `oaworkshop` intocados.

---

## 4. Próxima Etapa (Aguarda Aprovação Humana)

- **Etapa 3 (Missão-Piloto):** Validar a governança em execução controlada com `TASK_CONTRACT` formal (sugestão: correcção cirúrgica de **P1-3** contraste WCAG + **P1-4** estabilização `npm run test` por `@agent-b` em propriedade exclusiva, verificada por `@agent-d`), seguida de revisão humana antes de qualquer merge em `codex/f02-integration-preview`.
