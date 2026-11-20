# Relatório Técnico — Model Governance & Adaptive Reasoning Policy v1.1 (`016-GOV-02`)

- **Identificador da tarefa:** `016-GOV-02`
- **Agente:** `@coordinator` (Coordenador Principal)
- **Classe de complexidade & risco:** `T0` (actualização documental/regras sem código funcional)
- **Modelo e esforço seleccionados / efectivamente utilizados:** `Gemini 4 Neon (Medium)` *(fallback autorizado Tier 3; `Claude Opus 5.5` a `0%` até `2026-11-26T18:55:38Z`, sem GPT proprietário no selector; zero Argon; sem Extra/xhigh/max)*
- **Objectivo e âmbito:** Actualizar directamente a branch `codex/docs-model-governance-v1` (base `2f0bae7`) com a política adaptativa de selecção de modelos e raciocínio `v1.1` (matriz `T0–T3`, roteamento Gemini não-Argon, proibição de `Extra High`/`xhigh`/`max` e de Argon/encaminhamento desconhecido, protocolo em `OPERATING_MODEL.md` e campos de contrato em `TASK_CONTRACT.md`).
- **Branch da tarefa:** `codex/docs-model-governance-v1`
- **Commit base:** `2f0bae771227613cec5375f9eee94182c92f3969`
- **Estado:** `PASSED`

---

## 1. Ficheiros Modificados

- `.agents/rules/50-model-governance.md` (política v1.1 completa com invariantes, matriz T0–T3, roteamento Gemini fallback, recomendações por função e prestação de contas)
- `.agents/rules/00-governance-core.md` (invariante #8 actualizado para v1.1, incluindo proibição de `Extra`/`xhigh`/`max` e classificação `T0–T3`)
- `docs/agent-ops/OPERATING_MODEL.md` (Secção 10 actualizada de forma enxuta sem duplicação)
- `docs/agent-ops/TASK_CONTRACT.md` (campos de complexidade `T0–T3`, modelo escolhido, nível de esforço ou fixo, justificação, fallback permitido e registo no relatório)
- `plans/016-model-governance-v1.md` (registo da revisão v1.1)
- `docs/agent-reports/governance/016-GOV-02-coordinator.md` *(este relatório)*

---

## 2. Trabalho Executado e Verificações

1. Validados todos os 6 ficheiros em `.agents/rules/*.md` (frontmatter YAML, triggers válidos, limite individual `< 24 KB`, orçamento total `always_on` + `AGENTS.md` dentro do limite).
2. Confirmado `git diff 2f0bae7 -- src/ scripts/ package.json package-lock.json index.html vite.config.ts public/` 100% vazio (zero alterações funcionais).
3. Confirmado que `main`, `codex/f02-integration-preview` e o website público `oaworkshop` não foram alterados, nenhum merge foi executado e nenhuma nova fase foi iniciada.

---

## 3. Problemas `P0` / `P1` / `P2`

- **P0:** Nenhum.
- **P1:** Nenhum.
- **P2:** Nenhum.

---

## 4. Limitações e Recomendações

- A branch `codex/docs-model-governance-v1` permanece isolada no remoto (`origin`) a aguardar autorização humana explícita para merge em `codex/f02-integration-preview`.
- Nenhuma credencial, token ou dado privado incluído.
