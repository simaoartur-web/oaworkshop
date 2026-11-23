# Relatório de Auditoria Dirigida — `06-QA-01` (`@agent-d`)

| Campo | Valor |
| --- | --- |
| **Task ID** | `06-QA-01` |
| **Agente** | `@agent-d` (Security & QA Auditor) |
| **Classe de tarefa** | `T1` (Moderada) |
| **Modelo / esforço utilizado** | `Gemini 4 Neon (Medium)` |
| **Estado final** | **PASSED** (`0` P0 · `0` P1 · `0` P2) |
| **Worktree de auditoria** | `D:/projects/O+A Architecture and Planners/Main/oaworkspace-f06-qa` |
| **Branch de entrega QA** | `codex/f06-qa-agent-d` |
| **Intervalo auditado** | `fea794b..8d56f73dea63b576cd01e867d704b19c28e710b0` (`25` ficheiros, Fase 06) |
| **Plano de referência** | `plans/019-phase-06-publications-activity-reports.md` |

---

## 1. Resumo Executivo

A auditoria dirigida ao diff exclusivo da Fase 06 (`fea794b..8d56f73`) concluiu com **100% de conformidade (`PASSED`)**, sem achados P0, P1 ou P2. Todos os invariantes de privacidade por omissão, transparência de dados, sincronização de filtros URL em página montada, acessibilidade (WCAG 2.2 AA), segurança estática e gestão de memória foram verificados directamente no código e cruzados com a cobertura de testes da Fase 06 (`src/test/editorialControl.test.tsx` e `src/test/editorialControlExperience.test.tsx`, integrados na bateria de `19/19` suites / `133/133` testes, `lint`, `build`, `npm audit = 0` e `test:e2e` confirmados pelo Coordenador no candidato `8d56f73`).

---

## 2. Evidências da Checklist Dirigida (Somente Fase 06)

### 2.1 Privacidade por Omissão & Isolamento — **PASS**

- **Independência de `publicationStatus` vs. `projectStatus`:** Em `src/data/projectLibraryRepository.ts` (`updateProjectPublicationStatus`, linhas 1620–1656), a transição actualiza apenas `publication.publicationStatus` e `metadata.updatedAtIso`/`updatedByUserId`, sem tocar em `lifecycle.projectStatus` nem em `metadata.isArchived`. Projectos criados localmente continuam a nascer em `'private'`.
- **Atomicidade e rollback:** Em `src/data/publicationsRepository.ts` (`transitionProjectPublication`, linhas 475–595), o grafo de transições permitidas é validado antes de qualquer escrita, são impostos `MAX_LOCAL_PUBLICATION_EVENTS = 150` e `assertWithinMaxLength`, e se `saveEnvelope()` falhar (ex.: `QuotaExceededError`), o estado `publicationStatus` no `projectLibraryRepository` é revertido automaticamente para manter ambos os repositórios consistentes.
- **Aviso explícito de demonstração local & zero impacto público:** `PublicationsPage.tsx` (linhas 217–223), `PublicationPreviewDialog.tsx` (`role="note"`, linhas 117–122) e `ReportsPage.tsx` (linhas 73–75) declaram explicitamente fronteira local/demonstrativa; `serializeReportSnapshotJson()` (`reportsSelector.ts`, linhas 276–291) inclui `mode: 'local-demo'` e disclaimer bilingue PT/EN. Zero alterações em `main` ou no website público `oaworkshop`.
- **Limpeza em `resetAllDemoData()` sem poluir o entry bundle:** `src/app/WorkspaceSessionContext.tsx` (linhas 40, 46, 164) remove `oa_workspace_publications_v1` e despacha `CustomEvent('oa:publications-updated')` sem imports estáticos da Fase 06. `App.tsx` e `routePreload.ts` mantêm `PublicationsPage`, `ActivityPage` e `ReportsPage` em *retryable lazy chunks*.

### 2.2 Transparência de Dados (`0` Métricas/Eventos Inventados) — **PASS**

- **`src/data/activitySelector.ts` (`buildUnifiedActivityEvents`, linhas 39–206):** Agrega exclusivamente registos existentes dos 4 repositórios canónicos (`projectLibraryRepository`, `tasksRepository`, `technicalLibraryRepository`, `publicationsRepository`), deduplicados por `id` e ordenados deterministicamente (mais recente primeiro + tie-break por `id`).
- **`src/data/reportsSelector.ts` (`buildStudioReportSnapshot`, linhas 56–270):** Deriva todos os totais, distribuições por `ProjectStatus`, `PublicationStatus`, `studioBase` (`Maputo`/`Milão`) e linhas por departamento exclusivamente dos 4 repositórios canónicos, `DEPARTMENTS` (`CANONICAL_DEPARTMENT_ORDER` — todos os `9` departamentos) e `DEMO_USERS` (`6` perfis). Departamentos sem registos apresentam `0` honesto e percentagens protegidas contra divisão por zero (`computePercentage`).

### 2.3 Sincronização de Filtros URL em Página Montada — **PASS**

- **`src/features/editorial-control/PublicationsPage.tsx` (linhas 42–58, 72–102):** Deriva `statusFilter` (`?status=`), `departmentFilter` (`?dept=`) e `projectFilter` (`?project=`) directamente de `useSearchParams()` com validação em `VALID_PUB_STATUSES` e `VALID_DEPARTMENTS`; `updateQueryParam` e `handleResetFilters` sincronizam com `{ replace: true }`.
- **`src/features/editorial-control/ActivityPage.tsx` (linhas 35–55, 62–101):** Deriva `domainFilter` (`?domain=`), `departmentFilter` (`?dept=`), `memberFilter` (`?member=`) e `projectFilter` (`?project=`) directamente de `useSearchParams()` com validação em `VALID_DOMAINS` e `VALID_DEPARTMENTS`; `updateQueryParam` e `handleResetFilters` sincronizam com `{ replace: true }`.
- **Cobertura de testes confirmada:** `src/test/editorialControlExperience.test.tsx` valida explicitamente a sincronização montada em `PublicationsPage` (linha 200) e `ActivityPage` (linha 235).

### 2.4 Acessibilidade, Segurança e Memória — **PASS**

- **Modal de pré-visualização (`PublicationPreviewDialog.tsx`, linhas 33–114):** Renderizado via `createPortal(..., document.body)`, com `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `useDialogFocusTrap` (`inert`, `Escape`, ciclo de teclado e restauro de foco) e alternância `PT`/`EN` acessível (`role="group"`, `aria-pressed`).
- **Tratamento de `QuotaExceededError`:** `PublicationsPage.tsx` (linhas 156–184, 227–241) captura excepções de armazenamento local e exibe alerta acessível `role="alert"` (`data-testid="publications-action-error"`), validado em `editorialControlExperience.test.tsx` (linha 171) e `editorialControl.test.tsx` (linha 176).
- **Gestão de memória (`URL.revokeObjectURL`):** `ReportsPage.tsx` (`handleExportJson`, linhas 20–35) revoga imediatamente o `ObjectURL` num bloco `finally`, validado em `editorialControlExperience.test.tsx` (linha 284).
- **Pesquisa Global (`globalSearchIndex.ts`, linhas 54–107):** Cache invalidada por subscrição (`subscribePublications`), garantindo `0` leituras de `localStorage` por tecla (validado em `editorialControl.test.tsx`, linha 349).
- **Segurança estática e dependências:** `git diff fea794b..8d56f73` apresenta `0` alterações em `package.json`/`package-lock.json` (`0` dependências novas), `0` ocorrências de `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `Function(`, segredos/tokens ou exposição de `oa-demo`/`demoAccessKey`.

---

## 3. Achados (`P0` / `P1` / `P2`)

- **P0:** Nenhum (`0`).
- **P1:** Nenhum (`0`).
- **P2:** Nenhum (`0`).

---

## 4. Parecer Final

O candidato da Fase 06 (`8d56f73dea63b576cd01e867d704b19c28e710b0`) está **APROVADO (`PASSED`)** no Quality Gate `06-QA-01` e apto para integração/aprovação final humana.
