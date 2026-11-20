# Plano 016 · Model Governance & Adaptive Reasoning Policy (`v1` → `v1.1`)

- **Branch:** `codex/docs-model-governance-v1`
- **Base inicial:** `origin/codex/f02-integration-preview` (`290da337ce4c54d385a5cde30db05c5fbbc88419`) · **Actualização v1.1 sobre:** `2f0bae771227613cec5375f9eee94182c92f3969`
- **Worktree isolado:** `D:/projects/O+A Architecture and Planners/Main/oaworkspace-model-governance-v1`
- **Estado:** v1.1 gravada e publicada na branch documental própria; aguarda aprovação humana para integração em `codex/f02-integration-preview`. Zero alterações a código de produção, `main` ou `oaworkshop`.

---

## 1. Objectivo

Formalizar de modo permanente a **Model Governance & Adaptive Reasoning Policy v1.1** nas regras nativas do Antigravity (`.agents/rules/`), em `AGENTS.md` e na documentação operacional (`docs/agent-ops/`):
- Hierarquia autorizada: **1.º Claude Opus** → **2.º Modelos GPT proprietários da OpenAI** (sem confundir `GPT-OSS`) → **3.º Modelos Gemini (excepto Argon)** apenas se Opus e GPT proprietários não estiverem disponíveis (`Hydrogen` Low/Medium para T0/T1; `Neon` Medium/High para T1–T3; `Orchestrator (Neon/Carbon)` de esforço fixo apenas em missões T3 longas justificadas).
- Classificação obrigatória **T0–T3** pelo Coordenador antes de atribuir modelo/esforço.
- **Proibição explícita e absoluta** de Argon (`Gemini 4 Argon`, `Orchestrator (Argon)`, encaminhamento desconhecido ou fallback por quota), de níveis `Extra`/`Extra High`/`xhigh`/`max` e de esforços fictícios em modelos de configuração fixa.
- Obrigação de confirmar alterações no Swarm Board, registar classe/modelo/esforço/fallback em cada relatório de missão e classificar como `BLOCKED` caso nenhum modelo autorizado esteja disponível.

---

## 2. Ficheiros Alterados (v1 + v1.1)

- `.agents/rules/50-model-governance.md` *(`trigger: model_decision`, actualizado para v1.1)*
- `.agents/rules/00-governance-core.md` *(invariante #8 alinhado com v1.1)*
- `AGENTS.md` *(Secção 5)*
- `docs/agent-ops/OPERATING_MODEL.md` *(Secção 10 actualizada para v1.1)*
- `docs/agent-ops/TASK_CONTRACT.md` *(campos de complexidade `T0–T3`, modelo, esforço, justificação e fallback)*
- `PROJECT_MAP.md` *(registo dos novos ficheiros)*
- `plans/016-model-governance-v1.md` *(este plano)*
- `docs/agent-reports/governance/016-GOV-02-coordinator.md` *(relatório de entrega v1.1)*
