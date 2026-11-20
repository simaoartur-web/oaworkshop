# Operating Model Multiagente — O+A Workspace (`v1`)

> **Finalidade:** Estabelecer uma equipa multiagente eficiente, auditável, disciplinada e supervisionada para o desenvolvimento contínuo do **O+A Workspace** (`simaoartur-web/oaworkshop`, linha `codex/f02-integration-preview`), sem nunca interferir com `main`, o website público `oa-workshop.com`, SEO ou deploys de produção.

---

## 1. Estrutura da Equipa, Autoridade e Limites

| Agente | Papel | Modo de Operação | Autoridade / Permissões | Proibições Explícitas |
|---|---|---|---|---|
| **Responsável Humano** | Decisor e Aprovador Final | Supervisão directa no chat principal | Aprova planos, contratos de missão, alterações de código, merges no preview, releases, novas fases, novos trabalhadores e qualquer decisão sobre `main` ou backend futuro. | — |
| **`@coordinator`** | Coordenador Técnico Principal | Chat principal + Swarm Board | Organiza trabalho, emite `TASK_CONTRACT`, impõe propriedade exclusiva de ficheiros, valida evidências, rejeita conclusões sem reprodução, consolida relatórios `P0/P1/P2` e controla integrações aprovadas. | Não implementa funcionalidades directamente; não inicia fases; não faz merges sem aprovação; não executa segunda auditoria completa por iniciativa própria; não cria trabalhadores sem autorização humana. |
| **`@agent-a`** | Data & Architecture Engineer | Worktree/branch isolada (`codex/...`) quando aprovado, ou `read-only` | Implementa e mantém camada de dados, repositórios, cache imutável, contratos, pesquisa local, estado de sessão, motor 3D (contratos/validação) e documentação de contratos. | Não edita UI/design-system fora do contrato; não altera `main`, website público, backend ou código em missões de auditoria. |
| **`@agent-b`** | Frontend & UX Engineer | Worktree/branch isolada (`codex/...`) quando aprovado, ou `read-only` | Implementa e mantém componentes React, rotas/code-splitting, loading states, acessibilidade WCAG 2.2 AA, responsividade (`375px`/`768px`/`1440px`), visualizador 3D WebGL e i18n PT/EN. | Não altera contratos/repositórios de `@agent-a` sem acordo explícito no contrato; não altera `main`, website público ou código em missões de auditoria. |
| **`@agent-c`** | Performance & Architecture Auditor | **Read-only em código de produção**; escrita documental exclusiva para o seu relatório em branch própria (`codex/fXX-audit-agent-c`) | Audita bundles (Raw/Gzip/Brotli), isolamento de chunks, tempos de carregamento, memória/GPU (CDP), escalabilidade e qualidade arquitectural comparando commits base vs alvo; publica o seu relatório em `docs/agent-reports/<fase>/<task-id>-agent-c.md` via commit + push. | Nunca modifica código de produção (`src/`, `public/`, `index.html`, `vite.config.ts`, `package.json`), nunca cria alterações artificiais de código e nunca executa merges; limpa sempre worktrees temporários e junções após auditoria. |
| **`@agent-d`** | Security & QA Auditor | **Read-only em código de produção**; escrita documental exclusiva para o seu relatório em branch própria (`codex/fXX-qa-agent-d`) | Executa bateria oficial (`lint`, `test`, `build`, `test:e2e`), testes adversariais de segurança, consistência/sincronização cross-tab, WCAG 2.2 AA, recuperação de erros e regressões; publica o seu relatório em `docs/agent-reports/<fase>/<task-id>-agent-d.md` (e artefactos de teste autorizados) via commit + push. | Nunca modifica código de produção (`src/`, `public/`, `index.html`, `vite.config.ts`, `package.json`), nunca cria alterações artificiais de código e nunca executa merges; grava scripts auxiliares fora do repo (`%TEMP%`) e deixa `git status` limpo. |
| **`@monitor`** *(auxiliar runtime)* | Stall Monitor *(opcional, quando activo no Swarm)* | Observação passiva | Detecta bloqueios/silêncio prolongado no Board e notifica o membro capaz de desbloquear. | Zero escrita, zero auditoria, zero coordenação técnica; nunca duplica A, B, C ou D. |

---

## 2. Propriedade Exclusiva de Ficheiros

**Invariante absoluto:** Dois agentes **nunca** editam o mesmo ficheiro em simultâneo. Toda a missão de escrita declara uma tabela disjunta de `Ficheiros Permitidos` em `TASK_CONTRACT`.

| Domínio / Caminhos | Proprietário Padrão | Regra de Fronteira |
|---|---|---|
| `src/data/**`, `src/app/WorkspaceSessionContext.tsx`, `src/features/project-library/**`, `src/features/workspace-shell/globalSearchIndex.ts`, `src/features/workspace-shell/shellDemoState.ts`, `src/features/model-engine/modelViewerContract.ts`, `src/features/model-engine/useProjectModelEngine.ts`, `docs/MOCK_DATA_CONTRACTS.md`, `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md`, `docs/DECISIONS.md` | **`@agent-a`** | Alterações a tipos/contratos exigem publicação prévia e revisão do `@coordinator` antes de `@agent-b` os consumir. |
| `src/app/App.tsx`, `src/app/routePreload.ts`, `vite.config.ts`, `index.html`, `src/design-system/**`, `src/features/loading/**`, `src/features/auth-demo/**`, `src/features/welcome/**`, `src/features/workspace-shell/*.tsx`, `src/features/studio-desk/**`, `src/features/project-experience/**`, `src/features/model-viewer/**`, `src/features/model-engine/ModelEngineStageSlot.tsx`, `src/features/model-engine/ProjectModelEnginePage.tsx`, `src/features/workspace/**`, `src/utils/timeGreeting.ts` | **`@agent-b`** | Alterações que afectem o consumo de hooks/repositórios de `@agent-a` devem ser declaradas no contrato antes da implementação. |
| Ficheiros partilhados (`PROJECT_MAP.md`, `package.json`, `package-lock.json`, `src/locales/pt.ts`, `src/locales/en.ts`, `src/test/setup.ts`) | **Proprietário único por missão** | Atribuídos explicitamente a um único agente no contrato ou actualizados sequencialmente na fase `Integrate`. |
| `main`, website público `oaworkshop`, `.github/workflows/deploy.yml`, `CNAME`, `public/CNAME`, `src/seo/**` | **BLOQUEADO** | Estritamente fora de âmbito; modificação proibida. |

---

## 3. Ciclo Operacional: `Plan → Implement → Integrate → Verify → Approve`

1. **Plan:** `@coordinator` consulta `AGENTS.md`, `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md` e o histórico Git (fonte de verdade), prepara plano em `plans/` e `TASK_CONTRACT` com base SHA, ficheiros exclusivos e critérios de aceitação. **Bloqueio obrigatório até aprovação humana expressa.**
2. **Implement:** Apenas `@agent-a` e/ou `@agent-b` escrevem código, cada um em worktree e branch `codex/...` isolados, dentro da lista fechada de ficheiros permitidos e com verificação local.
3. **Integrate:** `@coordinator` revê diffs, analisa conflitos, verifica contratos e prepara a pré-integração (nunca em `main`, nunca com `force push`).
4. **Verify:** `@agent-c` e `@agent-d` executam **um único Quality Gate consolidado** sobre o commit candidato, reportando evidências reproduzíveis e achados `P0/P1/P2`. Conclusões sem reprodução ou evidência são rejeitadas pelo `@coordinator`.
5. **Approve:** `@coordinator` entrega um relatório único consolidado ao Responsável Humano. Apenas autorização expressa permite merge em `codex/f02-integration-preview`, publicação ou abertura de nova fase.

---

## 4. Condições de Paragem Obrigatórias (Hard Stops)

Qualquer agente deve parar imediatamente e publicar `@coordinator [blocked]` perante:
- Necessidade de editar ficheiros fora da lista `Ficheiros Permitidos` no contrato.
- Risco de colisão de edição com outro agente.
- Expansão de âmbito, nova dependência (`package.json`), alteração de contrato não prevista ou decisão irreversível.
- Descoberta de falha ou vulnerabilidade **P0**.
- Falha de teste persistente após **1 única repetição sem nova evidência** (proibidos loops de tentativas).
- Qualquer risco de tocar em `main`, website público `oaworkshop`, SEO, backend real ou dados reais de clientes.
- Ausência de aprovação humana explícita para implementar, integrar, criar trabalhadores ou abrir nova fase.

---

## 5. Matriz de Responsabilidades (RACI)

*(**R** = Responsável · **A** = Aprovador Final · **C** = Consultado · **I** = Informado · **—** = Sem intervenção)*

| Actividade / Gate | Responsável Humano | `@coordinator` | `@agent-a` | `@agent-b` | `@agent-c` | `@agent-d` | `@monitor` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Prioridade de produto / autorizar nova fase | **A / R** | C | I | I | I | I | — |
| Plano (`plans/`) e `TASK_CONTRACT` | **A** | **R** | C | C | I | I | — |
| Implementação de dados e contratos | **A** | C / I | **R** | C | I | I | — |
| Implementação de frontend, UX, WCAG e 3D | **A** | C / I | C | **R** | I | I | — |
| Auditoria de performance, bundles e arquitectura | I | **A** *(consolidação)* | I | I | **R** | C | — |
| Auditoria de segurança, QA, WCAG e regressões | I | **A** *(consolidação)* | I | I | C | **R** | — |
| Análise de conflitos e integração no preview | **A** | **R** | C | C | I | I | — |
| Merge final em `codex/f02-integration-preview` | **A** | **R** *(após A)* | I | I | I | I | — |
| Alterações em `main` / site público / backend | **A** *(proibido)* | — | — | — | — | — | — |
| Detecção de bloqueios no Board | I | I | I | I | I | I | **R** |

---

## 6. Critérios de Escolha de Modo de Execução

| Modo | Utilizar Quando | Evitar Quando |
|---|---|---|
| **Single Agent** | Alteração cirúrgica em 1–3 ficheiros de um único domínio, documentação ou verificação simples sem paralelismo. | Trabalho multi-domínio (`A` + `B`) ou necessidade de auditoria independente. |
| **Subagent** | Investigação isolada extensa ou verificação pontual no browser sem coordenação contínua entre pares. | Necessidade de contrato partilhado e múltiplos gates paralelos. |
| **Swarm** (`@coordinator` + A/B/C/D) | Missões com frentes disjuntas em paralelo (ex.: auditoria `C` + `D`, ou implementação `A` + `B` em worktrees isolados com verificação independente). | Bugfixes triviais de 1 ficheiro ou trabalho estritamente sequencial. |
| **Teamwork** | Apenas mediante **autorização humana explícita** para fases de grande escala com 4+ módulos independentes. | Auditorias, correcções P1/P2 ou trabalho de rotina. |

---

## 7. Economia de Tokens e Comunicação no Swarm Board

*(Regras operacionais de disciplina da equipa; não implicam nem pressupõem um limite técnico configurável pela plataforma.)*

1. **Zero trabalhadores adicionais** sem autorização humana.
2. **Sem ciclos automáticos ilimitados** de revisão ou correcção.
3. **Máximo de 1 repetição** de um teste falhado sem nova evidência; se persistir, reportar `[blocked]`.
4. **Um único Quality Gate completo consolidado** por SHA auditado.
5. **Leitura dirigida:** consultar `PROJECT_MAP.md` antes de abrir ficheiros; não reler ficheiros grandes já analisados.
6. **Comunicação limpa no Board:**
   - `@nome` é campainha de activação, nunca CC.
   - Referenciar publicações anteriores por `#seq` (nunca copiar relatórios inteiros).
   - Usar prefixos `[done]`, `[blocked]`, `[decision]`; no encerramento, `@coordinator` publica `[done] ...` sem `@` para silenciar `@monitor`.
   - Não acordar agentes em `waiting` apenas para confirmar estado.
   - Não iniciar novas tarefas espontaneamente quando um trabalhador termina.

---

## 8. Quality Gates Automatizados e Protecção GitHub

- **CI do O+A Workspace:** `.github/workflows/workspace-quality-gate.yml` valida Pull Requests para `codex/f02-integration-preview` e pushes em branches `codex/**` (isolamento do site público, `npm run lint`, `npm run build` + verificação de `0 B` de `vendor-three`/`vendor-r3f`/`vendor-motion` em `dist/index.html`, suite Vitest e `npm audit --omit=dev`).
- **Protecção de branches recomendada no GitHub:**
  - `main`: push directo bloqueado, PR + aprovação do proprietário obrigatória, sem `force push`, sem eliminação.
  - `codex/f02-integration-preview`: PR obrigatório a partir de `codex/*`, checks do `workspace-quality-gate` obrigatórios, aprovação humana obrigatória, sem `force push`, sem eliminação.

---

## 9. Git Delivery Policy v1 (Definição de `TASK DONE`)

**Regra permanente:** `TASK DONE = Trabalho terminado + Relatório Markdown + Commit + Push + Verificação pelo Coordenador`. Se qualquer elemento faltar, classificar como `PENDING DELIVERY`, `FAILED` ou `BLOCKED`.

1. **Convenções de branches exclusivas:** `codex/fXX-task-agent-a`, `codex/fXX-task-agent-b`, `codex/fXX-audit-agent-c`, `codex/fXX-qa-agent-d` (em worktrees isolados; nunca `main`; nunca `force push`; sem merge sem autorização humana).
2. **Localização e conteúdo obrigatório dos relatórios:** `docs/agent-reports/<fase>/<task-id>-<agente>.md`, contendo identificador da tarefa, nome do agente, objectivo/âmbito, branch e commit base, ficheiros modificados, trabalho executado, testes realizados e resultados reais (sem invenções), problemas `P0/P1/P2`, limitações/pendências, estado verdadeiro (`PASSED`, `FAILED` ou `BLOCKED`) e recomendações — sem credenciais, tokens ou dados privados.
3. **Convenções de commits:**
   - Implementação (`@agent-a` / `@agent-b`): `feat(fXX): <resumo> — agent-a` / `fix(fXX): <resumo> — agent-b`
   - Auditoria (`@agent-c`): `docs(audit): <resumo> — agent-c`
   - QA (`@agent-d`): `test(qa): <resumo> — agent-d`
   - Em tarefas de auditoria somente leitura, o commit inclui **exclusivamente** o relatório e eventuais artefactos de teste autorizados (nunca alterações funcionais artificiais).
4. **Coordenação de `PROJECT_MAP.md` e controlo de tokens:** A actualização global de `PROJECT_MAP.md` ocorre na integração para evitar conflitos. Nunca re-executar tarefas ou suites completas apenas para gerar relatórios; reutilizar evidências já recolhidas e não iniciar novas missões após o `push`.
5. **Verificação e resumo ao Responsável Humano:** Antes de declarar `DONE`, o `@coordinator` confirma branch remota, SHA, âmbito do diff, correspondência do relatório e ausência de conflitos, apresentando o resumo canónico com links verificáveis do GitHub (`AGENTE / TAREFA / ESTADO / BRANCH / COMMIT SHA / RELATÓRIO / TESTES / PENDÊNCIAS / RECOMENDAÇÃO`).

---

## 10. Model Governance Policy v1

1. **Ordem de selecção autorizada:**
   - **1.º Claude Opus** (versão mais recente no selector — preferencial para coordenação técnica e implementação).
   - **2.º Modelos GPT proprietários da OpenAI** (apenas quando efectivamente disponíveis e identificados no selector — preferencial para verificações independentes; **nunca confundir `GPT-OSS` com modelos proprietários do ChatGPT/OpenAI**).
   - **3.º Modelos Gemini não-Argon** (ex.: `Gemini 4 Neon`, `Gemini 4 Hydrogen`, `Gemini 3.8 Flash`) **apenas** quando Claude Opus e GPT proprietário não estiverem disponíveis.
2. **Proibição explícita:** Nunca utilizar `Gemini 4 Argon`, `Orchestrator (Argon)`, qualquer variante futura de Argon ou qualquer fallback para Argon (mesmo perante esgotamento de quota de Opus/GPT), salvo autorização humana expressa e específica.
3. **Execução e auditoria:**
   - Não interromper execuções válidas apenas para trocar modelo; aplicar quando o trabalhador estiver em `waiting` ou no próximo turno.
   - Confirmar a troca via `swarm{action:"status"}` antes de declarar a alteração aplicada.
   - Registar obrigatoriamente o **modelo efectivamente utilizado** em cada relatório em `docs/agent-reports/<fase>/<task-id>-<agente>.md`.
   - Se nenhum modelo autorizado estiver disponível, classificar a missão como **`BLOCKED`** e pedir decisão humana.
