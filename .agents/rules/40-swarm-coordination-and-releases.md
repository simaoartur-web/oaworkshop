---
trigger: model_decision
description: "Apply when coordinating multi-agent tasks, Swarm Boards, task contracts, branch integration, or release and merge approvals in O+A Workspace."
---

# Regras de Coordenação Multiagente, Board & Aprovação de Releases (`@coordinator`)

1. **Papel do Coordenador:** Organizar missões via `docs/agent-ops/TASK_CONTRACT.md`, atribuir propriedade exclusiva de ficheiros, validar evidências, rejeitar conclusões não reproduzidas, consolidar relatórios `P0/P1/P2` e apresentar decisões ao Responsável Humano. Não implementar funcionalidades nem duplicar auditorias completas por iniciativa própria.
2. **Escolha do modo de execução:**
   - **Single agent:** correcções pontuais em 1–3 ficheiros de um único domínio ou docs simples.
   - **Subagent:** pesquisa ou verificação isolada sem colaboração contínua entre pares.
   - **Swarm (`A/B/C/D`):** frentes paralelas disjuntas ou auditoria independente (`C` + `D`).
   - **Teamwork:** apenas mediante autorização humana expressa para fases largas.
3. **Comunicação no Swarm Board sem duplicação:**
   - `@nome` acorda o agente e consome turno: usar apenas para quem age a seguir, nunca como CC.
   - Referenciar resultados por `#seq`; nunca colar relatórios de um agente na mensagem para outro.
   - Não acordar agentes `waiting` apenas para confirmar informações; não interromper trabalho válido nem redistribuir tarefas já concluídas.
   - Manter `@monitor` estritamente limitado à detecção de bloqueios; no fecho de missão, publicar `[done] <resumo>` sem `@` para o silenciar.
4. **Política económica de execução:** Zero trabalhadores adicionais sem autorização humana; zero loops automáticos ilimitados; máximo de 1 repetição de teste falhado sem nova evidência; um único Quality Gate consolidado por SHA auditado; não iniciar trabalho novo só porque um agente ficou livre.
5. **Verificação Obrigatória Antes de Declarar `DONE` (Git Delivery Policy v1):**
   - Confirmar que a branch exclusiva existe no remoto (`origin`) e o commit foi publicado.
   - Validar o relatório em `docs/agent-reports/<fase>/<task-id>-<agente>.md` (correspondência à tarefa, ausência de segredos ou testes inventados, estado verdadeiro `PASSED`/`FAILED`/`BLOCKED`).
   - Conferir SHA e `git show --stat` (zero alterações fora do âmbito; em auditorias read-only, apenas relatório/artefactos autorizados) e identificar conflitos com outros agentes.
   - Rejeitar entregas incompletas (`PENDING DELIVERY`, `FAILED` ou `BLOCKED`), consolidar sem repetir auditorias concluídas e coordenar a actualização global de `PROJECT_MAP.md` na fase `Integrate`.
   - Apresentar ao Responsável Humano o bloco canónico (`AGENTE / TAREFA / ESTADO / BRANCH / COMMIT SHA / RELATÓRIO / TESTES / PENDÊNCIAS / RECOMENDAÇÃO`) com links verificáveis do GitHub.
6. **Porta de Aprovação de Merges e Releases:**
   - Antes de propor merge em `codex/f02-integration-preview`, exigir: (a) plano/contrato aprovado, (b) análise de conflitos, (c) 0 problemas P0 em aberto, (d) evidências independentes de `@agent-c` e `@agent-d` conforme âmbito, e (e) confirmação de que `main` e o website público `oaworkshop` permanecem intocados.
   - Nunca executar merge em `codex/f02-integration-preview`, alteração em `main` ou início de nova fase sem autorização humana explícita.
