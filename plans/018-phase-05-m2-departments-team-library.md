# Plano 018 · Fase 05 / Módulo 2 — Departamentos, Equipa e Biblioteca Técnica

- **Branch de planeamento:** `codex/docs-f05-m2-plan`
- **Commit base (Módulo 1 validado):** `d07fc72314e26fc478bbf3814dd02734ccabfb62` (`origin/codex/f05-m1-integration-candidate`)
- **Estado do Preview (`origin/codex/f02-integration-preview`):** `7d9f61db7d36f3ac9a879886e45776371a65badd` *(Nota: o Módulo 1 foi aprovado funcionalmente pelo responsável humano e validado a 100% PASS em `05-QA-01` @ `faf433d`, mas o merge Git de `d07fc72` em `codex/f02-integration-preview` aguarda ainda o fecho do PR no GitHub.)*
- **Estado de `main` / Website Público:** `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)*
- **Aprovação humana:** `AGUARDA APROVAÇÃO` — **nenhum código funcional será alterado antes da aprovação expressa deste Plano 018 e da confirmação do encerramento Git do Módulo 1 no preview.**
- **Fase 06:** Não iniciada e estritamente fora de âmbito.

---

## 1. Objectivo Principal

Transformar as três rotas ainda planeadas da **Fase 05** em módulos operacionais, interligados e derivados das fontes canónicas existentes, encerrando a estrutura organizacional e técnica do atelier no **O+A Workspace**:

- **`/workspace/departments`** (Prancha `05` — Departamentos)
- **`/workspace/team`** (Prancha `06` — Equipa)
- **`/workspace/library`** (Prancha `07` — Biblioteca Técnica)

Nenhum dos três módulos pode ser uma página estática desconectada: todos derivam indicadores reais de `projectLibraryRepository`, `tasksRepository`, `DEPARTMENTS` e `DEMO_USERS`, oferecem navegação cruzada bidireccional e preservam integralmente a arquitectura demonstrativa local (zero backend, zero armazenamento remoto, zero credenciais).

---

## 2. Especificação Funcional e Técnica por Módulo

### 2.1 Departamentos (`/workspace/departments`)
- **Fonte canónica obrigatória:** `DEPARTMENTS` em `src/data/fixtures.ts` (`9` departamentos: `DIR`, `ARQ`, `URB`, `INT`, `INV`, `GPR`, `COM`, `ADM`, `RHU`).
- **Funcionalidades:**
  1. **Directório de departamentos** com código (`DIR`..`RHU`), nome PT/EN, foco editorial e contadores **estritamente derivados** em tempo real (colaboradores vinculados em `DEMO_USERS`, projectos activos/arquivados em `projectLibraryRepository`, tarefas pendentes/em curso/concluídas em `tasksRepository`).
  2. **Ficha contextual do departamento** (seleccionável por clique/teclado e via deep link `/workspace/departments?dept=<departmentId>`), listando:
     - Colaboradores vinculados (`DEMO_USERS.filter(u => u.departmentId === dept.id)`), com link directo para `/workspace/team?member=<userId>`;
     - Projectos associados (`project.departmentId === dept.id`), com link directo para `/workspace/projects/:id`;
     - Tarefas relacionadas (`task.departmentId === dept.id`), com link directo para `/workspace/tasks?task=<taskId>`;
     - Referências da Biblioteca Técnica vinculadas ao departamento (`/workspace/library?dept=<deptId>`).
  3. **Transparência absoluta de dados:** Departamentos sem colaboradores ou sem projectos/tarefas atribuídos no conjunto demonstrativo (ex.: `INT`, `ADM`, `RHU`) exibem explicitamente `0` e estado vazio honesto — **nunca** inventar métricas, horas ou atribuições fictícias.

### 2.2 Equipa (`/workspace/team`)
- **Fonte canónica obrigatória:** `DEMO_USERS` em `src/data/fixtures.ts` (`6` perfis demonstrativos: `DIR-01`, `ARQ-02`, `GPR-03`, `URB-04`, `COM-05`, `INV-06`), cruzado com `DEPARTMENTS`, `projectLibraryRepository` e `tasksRepository`.
- **Funcionalidades:**
  1. **Directório dos 6 perfis demonstrativos** com código, iniciais, nome `(Demo)`, cargo PT/EN, departamento e base de estúdio (`Maputo` / `Milão`).
  2. **Filtros combináveis:** por função (`Role`), por departamento (`DepartmentId`), por base (`Maputo` / `Milão`) e pesquisa instantânea; suporte a deep links `?member=<userId>` e `?dept=<departmentId>`.
  3. **Perfil contextual do colaborador:**
     - Âmbito (`scopeSummary`), departamento (link para `/workspace/departments?dept=<departmentId>`), fuso da base (`CAT` / `CET`/`CEST` reutilizando `timeGreeting.ts`);
     - **Projectos associados** (onde o colaborador é `leadUserId`, consta em `contributorUserIds`, ou pertence a `assignedRoles`), com distinção clara de papel e link directo para `/workspace/projects/:id`;
     - **Tarefas atribuídas** (`task.assigneeUserId === user.id`), agrupadas/indicadas por estado (`pending`/`in_progress`/`completed`) com link directo para `/workspace/tasks?task=<taskId>`.
  4. **Fronteira de demonstração preservada:** Aviso explícito de directório demonstrativo local (não é gestão de contas, permissões reais nem autenticação), sem expor chaves de acesso (`demoAccessKey`) nem permitir edição de credenciais.

### 2.3 Biblioteca Técnica (`/workspace/library`)
- **Independência estrita:** Módulo autónomo e claramente separado da **Biblioteca de Projectos** (`/workspace/projects`).
- **Categorias técnicas:**
  1. `material` — **Materiais** (ex.: betão aparente com inertes locais, madeira certificada Umbila/Chacate, alvenaria de bloco térmico, pedra natural);
  2. `constructive_system` — **Sistemas Construtivos** (ex.: cobertura ventilada de duplo plano, brise-soleil cerâmico/metálico, estrutura mista madeira-aço);
  3. `technical_study` — **Referências e Estudos Técnicos** (ex.: ventilação cruzada em clima tropical costeiro Maputo, conforto higrotérmico mediterrânico Milão, pormenorização de juntas acústicas).
- **Estrutura de ficha técnica (PT/EN):** `id`, `code` (ex.: `MAT-001`, `SYS-001`, `EST-001`), `category`, `title: LocalizedText`, `summary: LocalizedText`, `technicalSpecs: LocalizedText`, `originRegion: LocalizedText`, `standardsTag` (norma/referência), `departmentId`, `relatedProjectIds: string[]`, `referenceCitation: LocalizedText`, `origin: 'seed-fixture' | 'local-created'`, `updatedAt`.
- **Pesquisa, filtros e ligação a projectos:** Pesquisa instantânea pré-normalizada, filtros por categoria, departamento (`?dept=`), projecto associado (`?project=`) e ficha em destaque (`?ref=<id>`); associação contextual directa aos dossiers existentes (`/workspace/projects/:id`).
- **Avaliação sobre registo local de referências (Decisão Recomendada):**
  - **Recomendação: SIM, permitir registo local de referências apenas com metadados** em `oa_workspace_technical_library_v1` (repositório canónico imutável com `MAX_LOCAL_TECH_REFS = 100`, `assertWithinMaxLength`, escrita atómica sob `QuotaExceededError` → `[role="alert"]`, sync `StorageEvent` cross-tab, limpeza em `resetAllDemoData()` e rótulo honesto `Guardado neste navegador (demo)`).
  - **Proibição mantida:** **Zero** uploads de ficheiros binários, PDFs, imagens ou armazenamento remoto; apenas metadados textuais estruturados e associações a `projectId` válidos.

---

## 3. Contratos Partilhados e Integrações Obrigatórias

Reutilização directa sem duplicação de dados:
- `projectLibraryRepository` (`useProjectLibrary`), `tasksRepository` (`useStudioOperations`), `DEPARTMENTS` e `DEMO_USERS` permanecem como únicas fontes de verdade.

**Alterações mínimas identificadas em contratos/ficheiros partilhados (explicitadas antes de distribuir tarefas):**
1. **`src/app/WorkspaceSessionContext.tsx` (`@agent-a`):** Adicionar `'oa_workspace_technical_library_v1'` a `AUXILIARY_DEMO_STORAGE_KEYS` e disparar `oa:technical-library-updated` em `resetAllDemoData()` — **0 novos imports estáticos** (manter `index-*.js` em `~74 kB`).
2. **`src/features/workspace-shell/globalSearchIndex.ts` (`@agent-a`):** Indexar fichas da Biblioteca Técnica (`/workspace/library?ref=<id>`), os 9 departamentos (`/workspace/departments?dept=<id>`) e os 6 colaboradores (`/workspace/team?member=<id>`) com chave de cache `(libraryVersion, tasksVersion, techLibraryVersion, language)`, mantendo **`0` leituras de `localStorage` e `0` `JSON.parse` por tecla**.
3. **`src/features/workspace-shell/shellNavigation.ts`, `src/app/App.tsx`, `src/app/routePreload.ts` (`@agent-b`):** Promover `departments`, `team` e `library` de `planned` para `active-shell` e registar `DepartmentsPage`, `TeamPage` e `TechnicalLibraryPage` via `createRetryableLazy` (preservando `0 B` de `vendor-three`/`vendor-r3f`/`vendor-motion` no entry).

---

## 4. Registo Formal no Backlog — Integração Futura com Google Calendar

Registado formalmente na **Secção 4 de `docs/INTEGRATION_FUTURE.md`** (nesta mesma branch documental), sem qualquer implementação actual, sem dependências Google, sem tokens/APIs externas e sem UI que prometa sincronização inexistente:
- Autorização OAuth 2.0 (Authorization Code + PKCE mediada por backend futuro, nunca tokens em `localStorage`).
- Selecção explícita de calendário de destino por utilizador/estúdio.
- Sincronização controlada de eventos com mapeamento rigoroso de fusos IANA `Africa/Maputo` (`CAT`) e `Europe/Rome` (`CET`/`CEST`).
- Consentimento explícito, revogação de acesso e protecção de credenciais em cofre servidor.
- Gestão de conflitos e duplicações via `externalEventId`, `etag`, janela de idempotência e política determinística de resolução.

---

## 5. Fluxos de Utilização End-to-End

1. **Departamento → Equipa → Projecto / Tarefa:** Utilizador abre `/workspace/departments` → selecciona `Arquitectura (ARQ)` → verifica contagens reais de membros, projectos e tarefas → clica em `Mateo Conti (Demo)` → abre `/workspace/team?member=usr-arq-02` → salta para o dossier `/workspace/projects/sd-proj-oa-26-101` ou tarefa `/workspace/tasks?task=<id>`.
2. **Equipa → Filtros → Carga Operacional:** Utilizador abre `/workspace/team` → filtra por `Milão` ou por função `architect` → inspecciona projectos e tarefas atribuídas sem dados inventados → navega para o departamento ou dossier.
3. **Biblioteca Técnica → Registo Local → Pesquisa Global → Projecto:** Utilizador abre `/workspace/library` → filtra por `Materiais` ou `Sistemas Construtivos` → consulta ficha PT/EN e navega para o projecto associado → opcionalmente regista uma nova referência técnica (só metadados) → pesquisa pelo código em `Ctrl+K` → abre `/workspace/library?ref=<id>` → «Repor dados demo» em `/workspace/settings` limpa `oa_workspace_technical_library_v1`.

---

## 6. Ficheiros a Criar/Modificar, Divisão Exclusiva A/B & Model Governance v1.1

*(Sob `Model Governance & Adaptive Reasoning Policy v1.1` — classificação `T0–T3` prévia; preferir `Claude Opus` / GPT proprietário se quota reposta, fallback autorizado `Gemini 4 Neon (Medium)`, **nunca Argon**, **nunca Extra/xhigh/max**):*

| Tarefa | Agente | Classe / Risco / Modelo & Esforço | Propriedade Exclusiva de Ficheiros (0 Colisões) |
|---|---|---|---|
| **`05-M2-DATA-01`** | **`@agent-a`** | **`T2` (Complexa)** · Risco Médio (integridade, sync, cache) · `Claude Opus` *(se disponível)* ou `Gemini 4 Neon (Medium)` · Fallback: nunca Argon | **Novos:** `src/data/studioStructureTypes.ts`, `src/data/studioStructureSelectors.ts`, `src/data/technicalLibraryRepository.ts`, `src/features/studio-structure/useStudioStructure.ts`, `src/test/studioStructure.test.tsx`<br>**Modificados:** `src/features/workspace-shell/globalSearchIndex.ts`, `src/app/WorkspaceSessionContext.tsx`<br>**Relatório:** `docs/agent-reports/phase-05/05-M2-DATA-01-agent-a.md` |
| **`05-M2-FE-01`** | **`@agent-b`** | **`T2` (Complexa)** · Risco Médio (3 páginas, WCAG 2.2 AA, lazy routes) · `Claude Opus` *(se disponível)* ou `Gemini 4 Neon (Medium)` · Fallback: nunca Argon | **Novos:** `src/features/studio-structure/i18n.ts`, `src/features/studio-structure/DepartmentsPage.tsx`, `src/features/studio-structure/TeamPage.tsx`, `src/features/studio-structure/TechnicalLibraryPage.tsx`, `src/features/studio-structure/TechnicalReferenceDialog.tsx`, `src/test/studioStructureExperience.test.tsx`<br>**Modificados:** `src/features/workspace-shell/shellNavigation.ts`, `src/app/App.tsx`, `src/app/routePreload.ts`, `src/test/workspaceShell.test.tsx` *(apenas se necessário)*<br>**Relatório:** `docs/agent-reports/phase-05/05-M2-FE-01-agent-b.md` |
| **`05-M2-QA-01`** | **`@agent-d`** *(Reservado — Verify)* | **`T2` (Complexa)** · Risco Médio · GPT proprietário / `Claude Opus` *(se disponível)* ou `Gemini 4 Neon (Medium)` · Fallback: nunca Argon | **Read-only em código**; grava exclusivamente `docs/agent-reports/phase-05/05-M2-QA-01-agent-d.md`. Executa 1 único Quality Gate consolidado (`lint`, `test`, `build`, `test:e2e`, fluxos cruzados, WCAG, PT/EN, `375px`/`768px`/`1440px`, quota e reset). |
| **`@agent-c`** | *(Condicional)* | Só activado se `build` mostrar regressão no entry (`> 76 kB`) ou chunk lazy inesperado | **Zero auditoria redundante** se `05-M2-QA-01` confirmar `index-*.js` estável e `0 B` de 3D/motion no entry. |

> `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md` e o fecho documental são actualizados exclusivamente pelo `@coordinator` na integração.

---

## 7. Critérios de Aceitação

- [ ] `/workspace/departments`, `/workspace/team` e `/workspace/library` activos no `ArchitecturalRail` (grupo **Disponível agora**), carregados via `React.lazy` dentro do `WorkspaceShell` persistente.
- [ ] Todos os 9 departamentos (`DEPARTMENTS`) e 6 perfis (`DEMO_USERS`) exibem apenas contagens e ligações reais derivadas de `projectLibraryRepository` e `tasksRepository` (0 métricas inventadas).
- [ ] Biblioteca Técnica independente da Biblioteca de Projectos, com 3 categorias, fichas PT/EN, pesquisa, filtros, ligação a dossiers reais e (se aprovado) registo local de metadados com `QuotaExceededError` → `[role="alert"]`, sem uploads binários.
- [ ] Pesquisa Global (`Ctrl+K`) indexa departamentos, equipa e biblioteca técnica com `0` leituras de `localStorage` por tecla; «Repor dados demo» limpa `oa_workspace_technical_library_v1`.
- [ ] Paridade PT/EN completa, WCAG 2.2 AA (`≥ 4,5:1`, `#CE826D` para micro-texto, `inert` focus trap em diálogos, teclado integral) e `0` overflow horizontal em `375px`, `768px` e `1440px`.
- [ ] `npm run lint`, `npm run test`, `npm run build` (`0 B` 3D/motion no entry, `0` ciclos) e `npm run test:e2e` 100% verdes (local e PR no GitHub Actions).
- [ ] Zero alterações em `main`, no website público `oaworkshop`, sem dependências Google e sem iniciar a Fase 06.

---

## 8. Dependências, Riscos e Limitações

- **Dependências com o Módulo 1:**
  1. Encerramento Git do PR do Módulo 1 (`d07fc72` → `codex/f02-integration-preview`) com checks GitHub Actions verdes.
  2. Consumo directo de `tasksRepository.ts` / `useStudioOperations` (criado no Módulo 1) para contadores e listas de tarefas por departamento e colaborador.
- **Riscos e Mitigações:**
  1. *Departamentos sem dados seed (`INT`, `ADM`, `RHU`):* Tratar com estados vazios editoriais honestos (`0` projectos / `0` tarefas) e atalho para registar tarefa/referência, nunca com números sintéticos.
  2. *Inflação do bundle inicial (`index-*.js`):* Manter `technicalLibraryRepository.ts` fora de imports estáticos de `WorkspaceSessionContext.tsx` (usar remoção directa da chave + `CustomEvent`, tal como em `oa_workspace_tasks_v1`).
  3. *Duplicação de testes ou colisões:* `@agent-a` entrega primeiro a camada canónica + contratos (`Etapa 1`), `@agent-b` empilha sobre o SHA verificado de A (`Etapa 2`), e `@agent-d` corre 1 único Quality Gate (`Etapa 3`).
- **Limitações assumidas:** Sem backend, sem autenticação real, sem upload de ficheiros binários na Biblioteca Técnica e sem integração activa com Google Calendar.

---

## 9. Proposta de Execução em Etapas Curtas (Após Aprovação)

1. **Etapa 0 (Pré-condição):** Confirmar merge do PR do Módulo 1 (`d07fc72`) em `codex/f02-integration-preview` + integrar este Plano 018 (`codex/docs-f05-m2-plan`).
2. **Etapa 1 — Dados & Contratos (`@agent-a`, `codex/f05-m2-task-agent-a`):** Implementar selectors de Departamentos/Equipa, `technicalLibraryRepository.ts`, `useStudioStructure.ts`, Pesquisa Global, limpeza no reset e testes unitários (`studioStructure.test.tsx`).
3. **Etapa 2 — UI Editorial & Rotas (`@agent-b`, `codex/f05-m2-task-agent-b` sobre o SHA de A):** Implementar `/workspace/departments`, `/workspace/team`, `/workspace/library`, diálogo de referência (se aprovado), `shellNavigation.ts`, `App.tsx`/`routePreload.ts` e testes (`studioStructureExperience.test.tsx`).
4. **Etapa 3 — Pré-Integração & Quality Gate Único (`@coordinator` + `@agent-d`, `codex/f05-m2-qa-agent-d`):** Criar branch candidata, actualizar `PROJECT_MAP.md` e `docs/PRODUCT_SPEC.md`, executar 1 único Quality Gate (`lint`, `test`, `build`, `test:e2e`, verificação Chromium) e abrir PR para `codex/f02-integration-preview` para aprovação humana final.
