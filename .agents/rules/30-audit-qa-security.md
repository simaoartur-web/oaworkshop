---
trigger: model_decision
description: "Apply when conducting independent performance, architecture, security, accessibility, regression audits, or Quality Gate verification in O+A Workspace."
---

# Regras de Auditoria Independente, QA & Segurança (`@agent-c` e `@agent-d`)

1. **Read-Only em Código de Produção; Escrita Documental Exclusiva:** Auditores nunca modificam código de produção (`src/`, `public/`, `index.html`, `vite.config.ts`, `package.json`), nunca alteram `PROJECT_MAP.md` e nunca executam merges. Para cumprir a Git Delivery Policy v1, o commit na branch exclusiva da auditoria (`codex/fXX-audit-agent-c`, `codex/fXX-qa-agent-d`) deve conter **exclusivamente** o relatório em `docs/agent-reports/<fase>/<task-id>-<agente>.md` e eventuais artefactos de teste explicitamente autorizados no `TASK_CONTRACT`; são proibidas modificações funcionais artificiais apenas para produzir um commit.
2. **Isolamento de ambiente e portas:**
   - Nunca alterar `oaworkshop`, `main` ou worktrees de outros agentes.
   - Guardar scripts e artefactos temporários exclusivamente em `%TEMP%\oa-audit-<agente>\`.
   - Usar worktrees temporários detached (`%TEMP%`) para comparações multi-commit e portas dedicadas (`@agent-d`: `4174`; `@agent-c`: `4175`/`4176`).
   - Remover junções (`cmd /c rmdir`, nunca remoção recursiva) e worktrees temporários no fecho, confirmando `git status --short` e `git worktree list` limpos.
3. **Evidência reproduzível obrigatória:**
   - Rejeitar ou não reportar conclusões sem comandos, ficheiros/linhas, passos de reprodução ou medições reais (frio/mediana/P95, Raw/Gzip/Brotli, CDP heap/DOM ou resultado adversarial exacto).
   - Comparar explicitamente contra o commit base indicado no `TASK_CONTRACT`.
4. **Classificação objectiva:** Separar achados em **P0** (bloqueante de segurança/integridade/regressão crítica), **P1** (alto impacto funcional, WCAG, testes ou performance) e **P2** (endurecimento ou dívida técnica).
5. **Controlo de consumo:** Executar no máximo **1 repetição** de um teste falhado sem nova evidência antes de reportar `[blocked]` ou o achado. Produzir **1 único Quality Gate completo consolidado** por commit SHA auditado.
6. **Entrega obrigatória (Git Delivery Policy v1):** Guardar o relatório completo em `docs/agent-reports/<fase>/<task-id>-<agente>.md` (Identificador, Agente, Objectivo/âmbito, Branch e base SHA, Ficheiros modificados, Trabalho executado, Testes realizados e resultados reais sem invenções, Problemas `P0/P1/P2`, Limitações/pendências, Estado `PASSED`/`FAILED`/`BLOCKED`, Recomendações, zero segredos), fazer commit (`docs(audit): ... — agent-c` ou `test(qa): ... — agent-d`) + `git push` para `origin`, e publicar `@coordinator [done]` com SHA, branch e resumo verificável. Tarefas falhadas ou bloqueadas exigem relatório com estado verdadeiro, sem declarar sucesso.
