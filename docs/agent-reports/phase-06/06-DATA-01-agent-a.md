# Relatório de Entrega — `06-DATA-01` (`@agent-a`)

- **Identificador da tarefa:** `06-DATA-01`
- **Agente:** `@agent-a` (Data & Architecture Engineer)
- **Fase / Ciclo:** Fase 06 — Publicações, Actividade e Relatórios (Camada Canónica de Dados, Selectores Puros & Testes)
- **Classificação Model Governance v1.1:** Classe `T2 (Complexa)` · Modelo/Esforço efectivamente utilizado: **`Gemini 4 Neon (Medium)`**
- **Branch de trabalho:** `codex/f06-task-agent-a`
- **Commit base:** `05ec431`
- **Aprovação:** `APROVADO: plans/019-phase-06-publications-activity-reports.md`
- **Estado:** `PASSED`

---

## 1. Objectivo e Âmbito

Implementar a camada canónica de dados, o repositório imutável de publicações locais, os selectores puros de actividade unificada e relatórios derivados, o hook reactivo `useEditorialControl`, a limpeza sincronizada em `resetAllDemoData()` (sem novos imports estáticos no entry) e a indexação de publicações em `globalSearchIndex.ts`.

**Fronteiras respeitadas:** zero alterações em `shellNavigation.ts`, `App.tsx`, `routePreload.ts`, páginas React de UI, `PROJECT_MAP.md`, `package.json`, `main` ou repositório público `oaworkshop`.

---

## 2. Ficheiros Criados / Modificados

- `src/data/editorialReportsTypes.ts` *(novo)*
- `src/data/publicationsRepository.ts` *(novo)*
- `src/data/activitySelector.ts` *(novo)*
- `src/data/reportsSelector.ts` *(novo)*
- `src/features/editorial-control/useEditorialControl.ts` *(novo)*
- `src/data/projectLibraryRepository.ts` *(modificado — adicionado `updateProjectPublicationStatus` e persistência de transições editoriais em projectos locais após reload)*
- `src/app/WorkspaceSessionContext.tsx` *(modificado — `'oa_workspace_publications_v1'` + `'oa:publications-updated'` em `resetAllDemoData()`, `0` novos imports estáticos)*
- `src/features/workspace-shell/globalSearchIndex.ts` *(modificado — indexação de itens activos da fila editorial com cache `(libraryVersion, tasksVersion, techLibraryVersion, publicationsVersion, language)` e `0` leituras de storage por tecla)*
- `src/test/editorialControl.test.tsx` *(novo)*
- `docs/agent-reports/phase-06/06-DATA-01-agent-a.md` *(este relatório)*

---

## 3. Contratos e Exportações Públicas para `agent-b`

- **`src/data/editorialReportsTypes.ts`:** `PublicationAuditEntry`, `PublicationQueueItem`, `PublicationActionResult`, `PublicationsSnapshot`, `ActivityDomain`, `ActivityEvent`, `ActivityFilter`, `DepartmentOperationalRow`, `LifecycleBreakdownRow`, `StudioBaseSummary`, `EditorialFunnelRow`, `StudioReportSnapshot`.
- **`src/data/publicationsRepository.ts`:** `PUBLICATIONS_STORAGE_KEY`, `PUBLICATIONS_UPDATED_EVENT`, `PUBLICATIONS_LIMITS` (`MAX_LOCAL_PUBLICATION_EVENTS = 150`, `MAX_NOTE_LENGTH = 600`), `ALLOWED_PUBLICATION_TRANSITIONS`, `SEED_PUBLICATION_AUDIT_ENTRIES`, `getAllowedNextPublicationStatuses()`, `isPublicationTransitionAllowed()`, `getPublicationAuditSnapshot()`, `getPublicationsVersion()`, `subscribePublications()`, `invalidatePublicationsCache()`, `transitionProjectPublication(projectId, nextStatus, actorUserId, notePt?, noteEn?)`, `clearLocalPublicationsStorage()`.
- **`src/data/projectLibraryRepository.ts`:** `updateProjectPublicationStatus(projectId, nextStatus, actorUserId)` (preservando independência estrita face a `lifecycle.projectStatus` e `metadata.isArchived`).
- **`src/data/activitySelector.ts`:** `buildUnifiedActivityEvents(projects, tasks, techRefs, publicationEntries)`, `filterActivityEvents(events, filter)`, `groupActivityEventsByDate(events)`.
- **`src/data/reportsSelector.ts`:** `buildStudioReportSnapshot(projects, tasks, techRefs, publicationEntries, generatedAtIso?)`, `serializeReportSnapshotJson(snapshot, language)` (`schema: 'oa-workspace-report-v1'`, `mode: 'local-demo'`).
- **`src/features/editorial-control/useEditorialControl.ts`:** `useEditorialControl()` → `{ queueItems, auditEntries, activityEvents, reportSnapshot, transitionPublication, clearPublicationsHistory }`.

---

## 4. Testes Realizados e Resultados Reais

| Verificação | Comando | Resultado | Evidência |
|---|---|---|---|
| **Lint** | `npm run lint` | **PASS** | `0` erros, `0` avisos (`eslint .`) |
| **Build & Bundle** | `npm run build` (`tsc -b && vite build`) | **PASS** | `2 804` módulos em `10.08s`, `0` erros, `0` ciclos |
| **Vitest (suite completa)** | `npm run test` | **PASS** | **`18/18` ficheiros · `128/128` testes** em `47.62s` (incluindo `editorialControl.test.tsx` `4/4`) |

### Evidência do Entry Bundle (`dist/assets/` e `dist/index.html`)
- `dist/assets/index-C1YBcQRz.js`: **`75.42 kB` raw / `24.27 kB` gzip**.
- `dist/index.html` `modulepreload`: apenas `vendor-react`, `vendor-icons`, `vendor-router` — **`0 B`** de `vendor-three`, `vendor-r3f`, `vendor-motion` ou repositórios da Fase 06.

---

## 5. Problemas `P0` / `P1` / `P2`

- **P0:** Nenhum.
- **P1:** Nenhum.
- **P2:** Nenhum no âmbito de `06-DATA-01`.

---

## 6. Recomendações

- Branch `codex/f06-task-agent-a` pronta para empilhamento na Etapa 2 (`06-FE-01` · `agent-b`) consumindo `useEditorialControl()`, `filterActivityEvents`, `groupActivityEventsByDate`, `serializeReportSnapshotJson` e `editorialReportsTypes.ts`.
