# Relatório de Entrega — `05-DATA-01` (`@agent-a`)

- **Identificador da tarefa:** `05-DATA-01`
- **Agente:** `@agent-a` (Data & Architecture Engineer)
- **Fase / Ciclo:** Fase 05 · Módulo 1 — Tarefas & Calendário (Camada Canónica de Dados, Contratos, Sync Cross-Tab & Pesquisa)
- **Classificação Model Governance v1.1:** Classe `T2 (Complexa)` · Risco Médio · Modelo/Esforço efectivamente utilizado: **`Gemini 4 Neon (Medium)`** (Opus 0%, sem GPT proprietário, zero Argon)
- **Branch de trabalho:** `codex/f05-task-agent-a`
- **Commit base:** `d65689ab3fcd7051058d83526d09ba2f11fdf87b`
- **Aprovação:** `APROVADO: phase_05_tasks_calendar_plan.md`
- **Estado:** `PASSED`

---

## 1. Objectivo e Âmbito

Implementar a camada canónica imutável de tarefas operacionais (`tasksRepository.ts`), o selector puro derivado de eventos de calendário (`calendarSelector.ts`), o hook reactivo unificado (`useStudioOperations.ts`), a integração pré-normalizada de tarefas na Pesquisa Global (`globalSearchIndex.ts`) e a limpeza sincronizada em `resetAllDemoData()` (`WorkspaceSessionContext.tsx`), sem adicionar imports estáticos pesados no entry bundle (`index-*.js` preservado em `~73.8 kB`).

**Fronteiras respeitadas:** zero alterações em ficheiros UI, `StudioDeskPage.tsx`, `App.tsx`, `shellNavigation.ts`, `PROJECT_MAP.md`, `package.json`, `main` ou repositório público `oaworkshop`.

---

## 2. Ficheiros Modificados / Criados

- `src/data/operationsTypes.ts` *(novo)*
- `src/data/tasksRepository.ts` *(novo)*
- `src/data/calendarSelector.ts` *(novo)*
- `src/features/operations/useStudioOperations.ts` *(novo)*
- `src/features/workspace-shell/globalSearchIndex.ts` *(modificado)*
- `src/app/WorkspaceSessionContext.tsx` *(modificado)*
- `src/test/studioOperations.test.tsx` *(novo)*
- `docs/agent-reports/phase-05/05-DATA-01-agent-a.md` *(este relatório)*

---

## 3. Trabalho Executado e Contratos Exportados para `@agent-b`

### 3.1 `src/data/operationsTypes.ts`
- `TaskOrigin = 'seed-fixture' | 'local-created'`
- `CanonicalTaskRecord extends StudioDeskTask`: `{ ...StudioDeskTask, origin: TaskOrigin, createdAt: string, updatedAt: string, archived?: boolean }`
- `CreateTaskInput`: `{ titlePt, titleEn?, detailPt, detailEn?, projectId, departmentId?, primaryRoles?, priority, status?, dueDateIso, assigneeUserId, referenceTagPt?, referenceTagEn? }`
- `UpdateTaskInput`: `{ title?, detail?, projectId?, departmentId?, primaryRoles?, priority?, status?, dueDateIso?, assigneeUserId?, referenceTag?, archived? }`
- `TaskStatusTransition`: `{ taskId: string, fromStatus: DeskTaskStatus, toStatus: DeskTaskStatus, transitionedAt: string }`
- `TasksRepositorySnapshot`: `{ version: number, allTasks: readonly CanonicalTaskRecord[], activeTasks: readonly CanonicalTaskRecord[], lookupMap: ReadonlyMap<string, CanonicalTaskRecord> }`
- `CalendarEventKind = 'project_milestone' | 'task_deadline' | 'studio_review'`
- `CalendarStudioBase = ProjectStudioBase | 'Ambos'`
- `StudioCalendarEvent`: `{ id, kind, dateIso, title, subtitle, projectId?, projectCode?, taskId?, departmentId, studioBase, priority?, status?, targetRoute }`
- `CalendarEventFilter`: `{ kinds?, departmentId?, studioBase?, projectId?, status?, fromDateIso?, toDateIso? }`
- `CalendarMonthCell`: `{ dateIso: string, dayOfMonth: number, inCurrentMonth: boolean, isWeekend: boolean }`

### 3.2 `src/data/tasksRepository.ts`
- Constantes: `TASKS_STORAGE_KEY = 'oa_workspace_tasks_v1'`, `TASKS_UPDATED_EVENT = 'oa:tasks-updated'`, `TASKS_LIMITS = { MAX_LOCAL_TASKS: 150, MAX_TITLE_LENGTH: 160, MAX_DETAIL_LENGTH: 2000, MAX_TAG_LENGTH: 80 }`.
- Seed derivada de `STUDIO_DESK_TASKS` sem duplicação nem impacto em `StudioDeskPage.tsx`.
- Snapshot imutável (`deepFreezeValue` + `createImmutableLookupMap` sem `set`/`delete`/`clear`), escrita atómica em `localStorage` com propagação intacta de `QuotaExceededError`, recuperação resiliente de JSON corrompido, validação de `dueDateIso` (`YYYY-MM-DD`), `projectId` e `assigneeUserId`, e invalidação cross-tab (`StorageEvent` + `TASKS_UPDATED_EVENT` + `PROJECT_LIBRARY_UPDATED_EVENT`).
- Operações exportadas:
  - `getTasksSnapshot(): TasksRepositorySnapshot`
  - `getTasksVersion(): number`
  - `listTasks(options?: { includeArchived?: boolean }): CanonicalTaskRecord[]`
  - `getTaskById(idOrCode: string | undefined | null): CanonicalTaskRecord | null`
  - `subscribeTasksChanges(listener: () => void): () => void`
  - `invalidateTasksCache(): void`
  - `createLocalTask(input: CreateTaskInput): CanonicalTaskRecord`
  - `updateLocalTask(id: string, patch: UpdateTaskInput): CanonicalTaskRecord | null`
  - `transitionTaskStatus(id: string, nextStatus: DeskTaskStatus): { task: CanonicalTaskRecord; transition: TaskStatusTransition } | null`
  - `resetTasksLocalState(): CanonicalTaskRecord[]`

### 3.3 `src/data/calendarSelector.ts`
- `DEMO_STUDIO_REVIEWS: readonly StudioCalendarEvent[]` (5 revisões/coordenações demonstrativas honestas Maputo/Milão em Nov 2026).
- `buildStudioCalendarEvents(projects, tasks, studioReviews?): StudioCalendarEvent[]` — consolida sem duplicação marcos de projectos activos (`/workspace/projects/:id`), prazos de tarefas activas (`/workspace/tasks?task=:id`) e revisões do atelier, ordenados cronologicamente.
- `buildMonthGrid(year: number, monthIndex: number): CalendarMonthCell[]` (grelha segunda–domingo múltipla de 7).
- `groupEventsByDate(events): Record<string, StudioCalendarEvent[]>`
- `filterCalendarEvents(events, filters): StudioCalendarEvent[]`

### 3.4 `src/features/operations/useStudioOperations.ts`
- `useStudioOperations(): UseStudioOperationsResult` combinando `useSyncExternalStore(subscribeTasksChanges, getTasksSnapshot, getTasksSnapshot)` + `useProjectLibrary()`, expondo:
  `{ tasks, activeTasks, calendarEvents, studioReviews, createTask, updateTask, transitionTaskStatus, resetTasks, getTaskById }`.

### 3.5 `src/features/workspace-shell/globalSearchIndex.ts` & `src/app/WorkspaceSessionContext.tsx`
- Tarefas activas de `getTasksSnapshot()` indexadas em `globalSearchIndex.ts` com cache versionado `(libraryVersion, tasksVersion, language)` e normalização NFD pré-computada (`0` leituras de `localStorage` e `0` `JSON.parse` por tecla), ligando cada resultado a `/workspace/tasks?task=<id>` com `taskId` opcional preservando compatibilidade estrita com `GlobalSearchDialog.tsx` e `locales/{pt,en}.ts`.
- `WorkspaceSessionContext.tsx`: adicionada `'oa_workspace_tasks_v1'` a `AUXILIARY_DEMO_STORAGE_KEYS` e disparo de `CustomEvent('oa:tasks-updated')` em `resetAllDemoData()`, mantendo `0` imports estáticos pesados no entry.

---

## 4. Testes Realizados e Resultados Reais

| Verificação | Comando | Resultado | Evidência |
|---|---|---|---|
| **Lint** | `npm run lint` | **PASS** | `0` erros, `0` avisos (`eslint .`) |
| **Vitest (obrigatório)** | `npx vitest run src/test/studioOperations.test.tsx src/test/projectLibraryConsistency.test.tsx src/test/workspaceShell.test.tsx` | **PASS** | `3/3` ficheiros · **`21/21` testes** em `12.82s` (`studioOperations`: `5/5`, `projectLibraryConsistency`: `8/8`, `workspaceShell`: `8/8`) |
| **Build & Bundle** | `npm run build` (`tsc -b && vite build`) | **PASS** | `2 788` módulos em `14.49s`, `0` erros, `0` ciclos |

### Evidência de Isolamento do Entry Bundle (`dist/assets/` e `dist/index.html`)
- `dist/assets/index-BDZ_r4nm.js`: **`73.84 kB` raw / `23.78 kB` gzip** (preservado em `~74 kB`, `+0.09 kB` apenas pela chave/evento de reset em `WorkspaceSessionContext.tsx`).
- `dist/index.html` `modulepreload`: apenas `vendor-react`, `vendor-icons`, `vendor-router` — **`0 B`** de `vendor-three`, `vendor-r3f`, `vendor-motion`, `tasksRepository`, `projectLibraryRepository` ou `modelAssetRepository`.

---

## 5. Problemas `P0` / `P1` / `P2`

- **P0:** Nenhum.
- **P1:** Nenhum.
- **P2 (nota de integração para `@agent-b`):** Em `globalSearchIndex.ts`, as entradas de tarefas utilizam `category: 'route'` (com campo opcional `taskId`) para manter compatibilidade estrita de compilação com `t.shell.search.categories` em `GlobalSearchDialog.tsx` e `locales/{pt,en}.ts` (fora da propriedade de `@agent-a`). Na etapa de UI de `@agent-b`, caso se deseje uma etiqueta visual dedicada `'Tarefa'` / `'Task'` no diálogo de pesquisa, basta adicionar a chave `task` em `src/locales/{pt,en}.ts` e ajustar `GlobalSearchDialog.tsx` + `SearchResultCategory`.

---

## 6. Limitações e Pendências

- Sem bloqueios ou pendências. Branch `codex/f05-task-agent-a` pronta para consumo por `@agent-b` (`TasksPage`, `CalendarPage` e sincronização de `StudioDeskPage`) na Onda 2 da Fase 05.

---

## 7. Recomendações

- Fornecer a `@agent-b` os contratos de `src/data/operationsTypes.ts`, `src/data/calendarSelector.ts` e `src/features/operations/useStudioOperations.ts` para construção das páginas lazy `/workspace/tasks` e `/workspace/calendar` e eventual sincronização de `StudioDeskPage` com `useStudioOperations()`.
