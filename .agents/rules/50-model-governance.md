---
trigger: model_decision
description: "Apply when selecting, switching, verifying, or reporting AI models for the Coordinator or Swarm agents in O+A Workspace."
---

# O+A Workspace — Model Governance Policy (`v1`)

Política permanente de selecção de modelos para `@coordinator`, `@agent-a`, `@agent-b`, `@agent-c`, `@agent-d` e `@monitor`:

1. **Hierarquia de modelos autorizados:**
   - **Prioridade 1 — Claude Opus:** utilizar a versão mais recente disponível no selector do Antigravity (preferencial para coordenação técnica e implementação).
   - **Prioridade 2 — Modelos GPT proprietários da OpenAI:** apenas quando estiverem efectivamente disponíveis e identificados no selector (preferencial para verificações independentes quando disponível). **Nunca confundir `GPT-OSS` com modelos proprietários do ChatGPT/OpenAI.**
   - **Prioridade 3 — Modelos Gemini (EXCEPTO Argon):** utilizar apenas quando Claude Opus e modelos GPT proprietários não estiverem disponíveis ou estiverem sem quota (ex.: `Gemini 4 Neon`, `Gemini 4 Hydrogen`, `Gemini 3.8 Flash`).
2. **Proibição absoluta de Argon:**
   - **NUNCA utilizar:** `Gemini 4 Argon` (qualquer nível), `Orchestrator (Argon)`, qualquer variante futura de Argon ou qualquer fallback para Argon.
   - Argon só pode ser utilizado mediante **autorização humana expressa e específica**.
   - **Indisponibilidade ou esgotamento de quota de Opus/GPT NÃO autoriza fallback para Argon.**
3. **Condição de paragem (`BLOCKED`):** Se nenhum modelo autorizado (Prioridades 1, 2 ou 3 não-Argon) estiver disponível, colocar a missão em estado **`BLOCKED`** e solicitar decisão humana.
4. **Regras operacionais no Swarm:**
   - Não interromper execuções válidas apenas para trocar o modelo; aplicar no próximo turno ou quando o trabalhador estiver em estado `waiting`.
   - Confirmar sempre a alteração no Swarm Board (`swarm{action:"status"}`) antes de declarar a mudança aplicada.
   - Registar o modelo efectivamente utilizado em todos os relatórios de missão (`docs/agent-reports/<fase>/<task-id>-<agente>.md`).
   - Se a plataforma não permitir impor uma regra tecnicamente (ex.: selector principal do utilizador), comunicar a limitação e solicitar configuração manual no selector.
