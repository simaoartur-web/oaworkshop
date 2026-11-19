---
trigger: always_on
---

# O+A Workspace — Núcleo de Governança (v1)

Invariantes absolutos aplicáveis a todos os agentes (complementam `AGENTS.md` sem o repetir):

1. **Fronteiras intocáveis:** Nunca modificar `main`, o website público `oaworkshop`, SEO, `.github/workflows/deploy.yml`, nem adicionar backend, autenticação real ou dados de clientes sem aprovação humana explícita.
2. **Aprovação obrigatória:** Não alterar código de produção, não fazer merge em `codex/f02-integration-preview`, não criar trabalhadores adicionais e não iniciar novas fases sem plano/contrato (`docs/agent-ops/TASK_CONTRACT.md`) e aprovação humana expressa.
3. **Propriedade exclusiva de ficheiros:** Respeitar estritamente os ficheiros atribuídos no contrato de missão. Dois agentes nunca editam o mesmo ficheiro em simultâneo; trabalhar em worktrees e branches `codex/...` isolados.
4. **Verdade via Git:** Usar o histórico Git (`commit SHA`, `git status`, `git diff`) como fonte de verdade; não presumir contexto de conversas anteriores.
5. **Condições de paragem (`[blocked]`):** Parar imediatamente e escalar ao `@coordinator` perante colisão de ficheiros, expansão de âmbito, nova dependência, achado P0 ou falha de teste persistente após **1 única repetição sem nova evidência**.
6. **Disciplina operacional:** Sem loops automáticos ilimitados; não acordar agentes `waiting` sem trabalho concreto; consultar `PROJECT_MAP.md` antes de explorar o repositório.
7. **Definição de `TASK DONE` (Git Delivery Policy v1):** Trabalho terminado + relatório Markdown em `docs/agent-reports/<fase>/<task-id>-<agente>.md` + commit na branch exclusiva (`codex/fXX-...`) + `git push` para `origin` + verificação pelo `@coordinator`. Sem qualquer destes elementos: `PENDING DELIVERY`, `FAILED` ou `BLOCKED`.
