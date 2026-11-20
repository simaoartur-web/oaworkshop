# Plano 016 · Model Governance Policy v1 — Política de Selecção de Modelos

- **Branch:** `codex/docs-model-governance-v1`
- **Base:** `origin/codex/f02-integration-preview` (`290da337ce4c54d385a5cde30db05c5fbbc88419`)
- **Worktree isolado:** `D:/projects/O+A Architecture and Planners/Main/oaworkspace-model-governance-v1`
- **Estado:** Gravado e publicado na branch documental própria; aguarda aprovação humana para integração em `codex/f02-integration-preview`. Zero alterações a código de produção, `main` ou `oaworkshop`.

---

## 1. Objectivo

Formalizar de modo permanente a **Model Governance Policy v1** nas regras nativas do Antigravity (`.agents/rules/`), em `AGENTS.md` e na documentação operacional (`docs/agent-ops/`):
- Hierarquia autorizada: **1.º Claude Opus** → **2.º Modelos GPT proprietários da OpenAI** (sem confundir `GPT-OSS`) → **3.º Modelos Gemini (excepto Argon)** apenas se Opus e GPT proprietários não estiverem disponíveis.
- **Proibição explícita e absoluta de Argon** (`Gemini 4 Argon`, `Orchestrator (Argon)`, variantes futuras ou fallback por quota), salvo autorização humana expressa e específica.
- Obrigação de confirmar alterações no Swarm Board, registar o modelo efectivamente utilizado em cada relatório de missão e classificar como `BLOCKED` caso nenhum modelo autorizado esteja disponível.

---

## 2. Ficheiros Alterados

- `.agents/rules/50-model-governance.md` *(novo, `trigger: model_decision`)*
- `.agents/rules/00-governance-core.md` *(+1 invariante compacto #8)*
- `AGENTS.md` *(+1 linha na Secção 5)*
- `docs/agent-ops/OPERATING_MODEL.md` *(Secção 10)*
- `docs/agent-ops/TASK_CONTRACT.md` *(campo obrigatório de modelo utilizado)*
- `PROJECT_MAP.md` *(registo dos novos ficheiros)*
- `plans/016-model-governance-v1.md` *(este plano)*
