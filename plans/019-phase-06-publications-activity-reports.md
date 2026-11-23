# Plano 019 · Fase 06 — Publicações, Actividade e Relatórios (Conclusão da Versão Demonstrativa)

- **Estado:** **CONCLUÍDA** *(integrada em `codex/f02-integration-preview` via PR `#2` · `9533d38` a partir do candidato `e6d2711`, com `06-QA-01` PASSED `0` P0/P1/P2 e GitHub Actions `quality-gate` + `e2e-visual` 100% PASS em `2026-11-23`; `11/11` rotas operacionais)*
- **Branch de planeamento:** `codex/docs-f06-plan-019`
- **Base canónica (`origin/codex/f02-integration-preview`):** `fea794ba24af58061dd86435dc6a2dd71725ab47` (`fea794b`, contendo Fase 05 concluída via PR `#1` · `b384928`)
- **Estado de `main` / Website Público:** `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)*
- **Governança:** Model Governance v1.1 (`T2` implementação A/B, `T1` QA dirigida D; proibido Argon e Extra High; zero agentes redundantes)

---

## 1. Objectivo Principal

Activar as **últimas três pranchas planeadas** do **O+A Workspace**, concluindo integralmente as **11 rotas operacionais** (`01`..`11`) da versão demonstrativa frontend:

- **`/workspace/publications`** (Prancha `08` — Publicações)
- **`/workspace/activity`** (Prancha `09` — Actividade)
- **`/workspace/reports`** (Prancha `10` — Relatórios)

Todos os dados e métricas devem ser **estritamente derivados** das fontes canónicas locais já existentes (`projectLibraryRepository`, `tasksRepository`, `technicalLibraryRepository`, `DEPARTMENTS`, `DEMO_USERS`) e de um único novo repositório editorial local (`publicationsRepository`), preservando:

- Zero back-end, zero APIs externas, zero credenciais, zero publicação real no website `oaworkshop`.
- Privacidade por omissão (`publicationStatus: 'private'` independente de `projectStatus`).
- Isolamento total face a `main` e ao website público.

---

## 2. Especificação Funcional e Técnica por Módulo

### 2.1 Publicações (`/workspace/publications` — Prancha `08`)

- **Fonte canónica:** `projectLibraryRepository` (`publication.publicationStatus: PublicationStatus`) + novo `publicationsRepository.ts` (`oa_workspace_publications_v1`) que guarda apenas metadados editoriais locais (decisões de fila, notas PT/EN, autor demonstrativo, timestamp ISO) sem duplicar o registo do projecto.
- **Fluxo editorial demonstrativo (estados existentes em `src/data/types.ts`):**
  - `private` → `requested` (Pedido de revisão editorial)
  - `requested` → `approved` | `rejected`
  - `approved` → `published-demo` (Publicação demonstrativa local) | `unpublished`
  - `published-demo` → `unpublished` | `private`
  - `rejected` / `unpublished` → `requested` | `private`
- **Funcionalidades:**
  1. **Fila editorial por estado** com filtros por `PublicationStatus`, departamento (`?dept=`), projecto (`?project=`) e pesquisa instantânea; sincronização de filtros com parâmetros URL mesmo com a página montada.
  2. **Acções editoriais honestas por papel demonstrativo:** indicação clara dos papéis típicos (`communications`, `director` para aprovação/publicação demo; `architect`, `project_manager`, `department_lead` para submissão de pedido), com aviso visível de que os controlos são demonstrativos locais e **nunca** alteram o website público real.
  3. **Pré-visualização local do website (PT/EN):** diálogo acessível (`useDialogFocusTrap`, `inert`, `Esc`, restauro de foco) que renderiza a ficha editorial do projecto tal como apareceria no portfólio público O+A (título, subtítulo, disciplina, base Maputo/Milão, escala, área, cota, imagem de maquete, nota editorial PT/EN), 100% em memória, com marca clara `Pré-visualização local (demo)`.
  4. **Sincronização com o Dossier:** alterar o estado editorial na fila reflecte-se no estado `publicationStatus` do projecto em `projectLibraryRepository` (através de método dedicado `updateProjectPublicationStatus`) e regista entrada auditável em `publicationsRepository`.
  5. **Robustez de storage:** snapshot imutável, `MAX_LOCAL_PUBLICATION_EVENTS = 150`, `assertWithinMaxLength`, escrita atómica sob `QuotaExceededError` → `[role="alert"]`, sincronização `StorageEvent` cross-tab e limpeza em `resetAllDemoData()` (sem imports estáticos pesados no entry).

### 2.2 Actividade (`/workspace/activity` — Prancha `09`)

- **Fonte canónica (100% derivada, zero eventos fictícios inventados):**
  - Novo selector puro `activitySelector.ts` que agrega e ordena cronologicamente (mais recente primeiro) eventos reais dos quatro domínios locais:
    1. **Projectos** (`projectLibraryRepository`: revisões `revisions[]`, criações locais e arquivamentos);
    2. **Tarefas** (`tasksRepository`: criações e actualizações de estado/entregáveis);
    3. **Biblioteca Técnica** (`technicalLibraryRepository`: registos técnicos de referência);
    4. **Publicações** (`publicationsRepository`: pedidos, aprovações, rejeições e publicações demo).
- **Funcionalidades:**
  1. **Linha cronológica editorial** agrupada por data/período, exibindo domínio, código de referência, resumo PT/EN, autor demonstrativo, departamento e carimbo temporal.
  2. **Filtros combináveis com sincronização URL em página montada:** domínio (`?domain=`), departamento (`?dept=`), colaborador (`?member=`), projecto (`?project=`) e pesquisa instantânea pré-normalizada.
  3. **Navegação cruzada directa:** cada entrada liga ao seu alvo canónico (`/workspace/projects/:id`, `/workspace/tasks?task=`, `/workspace/library?ref=`, `/workspace/publications?project=`, `/workspace/departments?dept=`, `/workspace/team?member=`).
  4. **Transparência total:** contadores derivados dos eventos filtrados e estado vazio honesto quando um filtro não tem resultados.

### 2.3 Relatórios (`/workspace/reports` — Prancha `10`)

- **Fonte canónica (100% derivada, zero KPIs ou horas inventadas):**
  - Novo selector puro `reportsSelector.ts` que calcula sínteses determinísticas a partir de `projectLibraryRepository`, `tasksRepository`, `technicalLibraryRepository`, `publicationsRepository`, `DEPARTMENTS` e `DEMO_USERS`:
    1. **Portfólio por Estado e Base (`Maputo` / `Milão`):** distribuição por `ProjectStatus`, activos vs. arquivados e progresso de marcos (`milestonesCompleted / milestonesTotal`).
    2. **Carga Operacional por Departamento (`9` departamentos):** projectos, tarefas (`pending`, `in_progress`, `completed`), referências técnicas e estado editorial por departamento — exibindo `0` honesto onde não existem dados.
    3. **Funil Editorial de Publicações:** contagem por `PublicationStatus` (`private`, `requested`, `approved`, `published-demo`, `rejected`, `unpublished`) e taxa de dossiers prontos para revisão.
    4. **Exportação local honesta (sem back-end):**
       - Descarga de síntese estruturada em `.json` gerada no cliente (`Blob` + `URL.createObjectURL` com `revokeObjectURL` imediato) marcada com `mode: "local-demo"`;
       - Acção de impressão editorial (`window.print()`) com folha limpa `@media print`.
- **Navegação cruzada:** cada bloco/linha de departamento ou estado liga directamente à vista filtrada correspondente (`/workspace/projects`, `/workspace/tasks`, `/workspace/departments?dept=`, `/workspace/publications?status=`).

---

## 3. Integrações e Contratos Partilhados

- **Reutilização obrigatória (sem duplicação):**
  - `projectLibraryRepository` (adicionando apenas o método controlado `updateProjectPublicationStatus(projectId, nextStatus, actorUserId)` com persistência atómica e notificação de subscritores);
  - `tasksRepository`, `technicalLibraryRepository`, `DEPARTMENTS`, `DEMO_USERS`;
  - `WorkspaceSessionContext.tsx` (`resetAllDemoData()` limpa também `oa_workspace_publications_v1` por chave literal/callback leve, sem imports estáticos de código da Fase 06 no bundle inicial);
  - `globalSearchIndex.ts` (indexar fila de publicações e secções de actividade/relatórios com `0` leituras de storage por tecla);
  - `shellNavigation.ts` (promover `publications`, `activity` e `reports` de `planned` para `active-shell` com `targetPhase: Fase 06`);
  - `App.tsx` e `routePreload.ts` (lazy-loading retryable das 3 novas páginas, preservando `0 B` de `vendor-three`, `vendor-r3f` e `vendor-motion` no preload inicial).

---

## 4. Ficheiros a Criar e Modificar

### Criar (`@agent-a` — Camada Canónica de Dados e Selectores)
- `src/data/editorialReportsTypes.ts` — contratos TypeScript explícitos para fila editorial, eventos de actividade unificados e snapshots de relatórios.
- `src/data/publicationsRepository.ts` — repositório imutável `oa_workspace_publications_v1` (`QuotaExceededError`, `StorageEvent`, `MAX_LOCAL_PUBLICATION_EVENTS = 150`).
- `src/data/activitySelector.ts` — agregador cronológico puro (projectos + tarefas + biblioteca técnica + publicações).
- `src/data/reportsSelector.ts` — calculador puro de sínteses operacionais/editoriais e gerador de payload JSON demonstrativo.
- `src/features/editorial-control/useEditorialControl.ts` — hook reactivo unificado que subscreve os repositórios canónicos.
- `src/test/editorialControl.test.tsx` — testes unitários e de integração da camada de dados, sincronização `projectLibraryRepository`, `QuotaExceededError`, reset e derivação determinística.

### Criar (`@agent-b` — Interface Editorial, Rotas e Acessibilidade)
- `src/features/editorial-control/i18n.ts` — traduções completas PT/EN para Publicações, Actividade e Relatórios.
- `src/features/editorial-control/PublicationsPage.tsx` — fila editorial, transições de estado, filtros com sync URL em página montada e aviso demonstrativo.
- `src/features/editorial-control/PublicationPreviewDialog.tsx` — pré-visualização local PT/EN acessível (`useDialogFocusTrap`, `inert`, `Esc`).
- `src/features/editorial-control/ActivityPage.tsx` — linha cronológica derivada, filtros combináveis com sync URL e navegação cruzada.
- `src/features/editorial-control/ReportsPage.tsx` — sínteses derivadas por estado/base/departamento/editorial, exportação JSON local e suporte `@media print`.
- `src/test/editorialControlExperience.test.tsx` — testes de UI, PT/EN, acessibilidade de diálogo, sincronização de query params em página montada, exportação local e navegação cruzada.

### Modificar (Fronteira Clara A / B)
- **Agente A:** `src/data/projectLibraryRepository.ts` (`updateProjectPublicationStatus`), `src/app/WorkspaceSessionContext.tsx` (limpeza `oa_workspace_publications_v1` em `resetAllDemoData()`), `src/features/workspace-shell/globalSearchIndex.ts` (indexação sem leituras por tecla).
- **Agente B:** `src/features/workspace-shell/shellNavigation.ts` (promover `08`, `09`, `10` para `active-shell`), `src/app/routePreload.ts`, `src/app/App.tsx`, `src/test/workspaceShell.test.tsx` (actualização de contagem de rotas activas `11/11`), `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md`.

---

## 5. Divisão de Responsabilidades e Execução em Etapas Curtas

| Etapa | Tarefa | Responsável | Classe | Branch Dedicada | Entregável |
|---|---|---|---|---|---|
| **1** | `06-DATA-01` | `@agent-a` | `T2` | `codex/f06-task-agent-a` | Contratos, `publicationsRepository`, `activitySelector`, `reportsSelector`, `useEditorialControl`, `updateProjectPublicationStatus`, reset e `editorialControl.test.tsx` |
| **2** | `06-FE-01` | `@agent-b` | `T2` | `codex/f06-task-agent-b` | `PublicationsPage`, `PublicationPreviewDialog`, `ActivityPage`, `ReportsPage`, `i18n.ts`, rotas lazy, navegação `11/11`, `PROJECT_MAP.md` e `editorialControlExperience.test.tsx` |
| **3** | Integração | `@coordinator` | `T1` | `codex/f06-integration-candidate` | Merge ordenado A + B, `lint`, `build`, chunk check (`0 B` 3D/motion), Vitest e E2E local |
| **4** | `06-QA-01` | `@agent-d` | `T1` | `codex/f06-qa-agent-d` | Auditoria dirigida (WCAG 2.2 AA, PT/EN, sync URL em página montada, privacidade por omissão, isolamento `main`, sem auditorias redundantes de módulos já fechados) |
| **5** | PR & CI | `@coordinator` | `T1` | PR → `codex/f02-integration-preview` | Pull Request com `quality-gate` + `e2e-visual` verdes e pedido de autorização final de merge |

---

## 6. Critérios de Aceitação

1. Todas as **11 rotas** do Workspace (`01`..`11`) operacionais em PT e EN, sem páginas estáticas desconectadas.
2. Privacidade por omissão preservada: nenhum projecto muda para `published-demo` automaticamente; zero alterações ou chamadas ao website público `oaworkshop`.
3. Alterações editoriais em `/workspace/publications` sincronizam em tempo real com `/workspace/projects/:id`, `/workspace/activity`, `/workspace/reports` e `StudioDeskPage`, persistindo após reload e limpando completamente no `resetAllDemoData()`.
4. Filtros por parâmetros URL (`?dept=`, `?project=`, `?member=`, `?domain=`, `?status=`) actualizam correctamente mesmo quando a página permanece montada.
5. `0` métricas inventadas: todos os números em `/workspace/reports` e `/workspace/activity` são 100% reproduzíveis a partir dos repositórios canónicos.
6. Responsividade validada em `375px`, `768px` e `1440px` sem overflow horizontal nem sobreposição no cabeçalho; foco visível, navegação por teclado e `prefers-reduced-motion` respeitados.
7. `npm run lint`, `npm run build`, chunk check (`0 B` de `vendor-three`/`vendor-r3f`/`vendor-motion` no entry), Vitest (`100%` PASS), `npm audit --omit=dev --audit-level=high` e `npm run test:e2e` verdes localmente e no GitHub Actions.

---

## 7. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Confusão entre `published-demo` e publicação real no site `oaworkshop` | Rótulos explícitos `Publicação demo (local)` e `Pré-visualização local`, aviso de fronteira demonstrativa e guard CI contra ficheiros do site público. |
| Crescimento do bundle inicial com 3 novas páginas | Lazy-loading obrigatório em `App.tsx` + `routePreload.ts`; limpeza em `WorkspaceSessionContext.tsx` por chave literal sem imports estáticos da Fase 06. |
| Dessincronização entre `projectLibraryRepository` e `publicationsRepository` | Fonte única de verdade para `publicationStatus` em `projectLibraryRepository`, com `publicationsRepository` a registar apenas o histórico de decisões editoriais ligado por `projectId`. |
| Desfasamento de filtros URL em navegações intra-página | Efeito controlado de sincronização com `useSearchParams` e testes dedicados de regressão em `editorialControlExperience.test.tsx`. |

---

> **Próxima acção necessária:** Aprovação expressa do responsável humano (`APROVADO: plans/019-phase-06-publications-activity-reports.md`) antes de iniciar a Etapa 1 (`06-DATA-01`).
