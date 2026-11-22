# Relatório de Entrega — `05-M2-DATA-01` (`@agent-a`)

- **Identificador da tarefa:** `05-M2-DATA-01`
- **Agente:** `@agent-a` (Data & Architecture Engineer)
- **Fase / Ciclo:** Fase 05 / Módulo 2 — Departamentos, Equipa & Biblioteca Técnica (Camada Canónica, Selectors Derivados, Repositório Técnico & Pesquisa Global)
- **Classificação Model Governance v1.1:** Classe `T2 (Complexa)` · Risco Médio · Modelo/Esforço efectivamente utilizado: **`Gemini 4 Neon (Medium)`** (Opus 0% até 2026-11-26, sem GPT proprietário, zero Argon)
- **Branch de trabalho:** `codex/f05-m2-task-agent-a`
- **Commit base:** `bd00f68f02d0078c7d5d0c59b68e17df9e581abe`
- **Aprovação:** `APROVADO: plans/018-phase-05-m2-departments-team-library.md`
- **Estado:** `PASSED`

---

## 1. Objectivo e Âmbito

Implementar a camada canónica de dados e contratos do Módulo 2 da Fase 05 sem duplicação de fontes:
- Selectors puros derivados sobre `DEPARTMENTS` (`9`), `DEMO_USERS` (`6`, sem `demoAccessKey`), `projectLibraryRepository` e `tasksRepository`;
- Repositório imutável da Biblioteca Técnica (`technicalLibraryRepository.ts`) apenas com metadados (zero uploads binários), 9 fichas seed PT/EN nas 3 categorias (`material`, `constructive_system`, `technical_study`), escrita atómica sob `QuotaExceededError`, recuperação de JSON corrompido e sync cross-tab `StorageEvent`;
- Hook reactivo único `useStudioStructure.ts`;
- Indexação de Departamentos (`/workspace/departments?dept=<id>`), Equipa (`/workspace/team?member=<id>`) e Biblioteca Técnica (`/workspace/library?ref=<id>`) em `globalSearchIndex.ts` com `0` leituras de `localStorage` por tecla;
- Registo da chave `'oa_workspace_technical_library_v1'` e evento `'oa:technical-library-updated'` em `WorkspaceSessionContext.tsx` sem qualquer novo import estático.

**Fronteiras respeitadas:** zero alterações em ficheiros UI, `shellNavigation.ts`, `App.tsx`, `PROJECT_MAP.md`, `package.json`, `main` ou repositório público `oaworkshop`.

---

## 2. Ficheiros Criados / Modificados

- `src/data/studioStructureTypes.ts` *(novo)*
- `src/data/studioStructureSelectors.ts` *(novo)*
- `src/data/technicalLibraryRepository.ts` *(novo)*
- `src/features/studio-structure/useStudioStructure.ts` *(novo)*
- `src/features/workspace-shell/globalSearchIndex.ts` *(modificado)*
- `src/app/WorkspaceSessionContext.tsx` *(modificado)*
- `src/test/studioStructure.test.tsx` *(novo)*
- `docs/agent-reports/phase-05/05-M2-DATA-01-agent-a.md` *(este relatório)*

---

## 3. Resumo das Exportações Públicas para `agent-b`

### 3.1 `src/data/studioStructureTypes.ts`
- `TechnicalLibraryCategory = 'material' | 'constructive_system' | 'technical_study'`
- `TechnicalReferenceOrigin = 'seed-fixture' | 'local-created'`
- `PublicTeamMember = Omit<DemoUser, 'demoAccessKey'>`
- `TechnicalReferenceRecord` (`id`, `code`, `category`, `title`, `summary`, `technicalSpecs`, `originRegion`, `standardsTag`, `departmentId`, `relatedProjectIds`, `referenceCitation`, `origin`, `createdAt`, `updatedAt`)
- `CreateTechnicalReferenceInput`, `TechnicalLibrarySnapshot`
- `DepartmentOperationalProfile` (`department`, `members`, `projects`, `activeProjectsCount`, `archivedProjectsCount`, `tasks`, `pendingTasksCount`, `inProgressTasksCount`, `completedTasksCount`, `technicalReferences`)
- `TeamMemberOperationalProfile` (`user`, `department`, `ledProjects`, `contributedProjects`, `roleMatchedProjects`, `allRelatedProjects`, `assignedTasks`, `openTasksCount`, `completedTasksCount`)

### 3.2 `src/data/technicalLibraryRepository.ts`
- `TECHNICAL_LIBRARY_STORAGE_KEY = 'oa_workspace_technical_library_v1'`
- `TECHNICAL_LIBRARY_UPDATED_EVENT = 'oa:technical-library-updated'`
- `TECHNICAL_LIBRARY_LIMITS` (`MAX_LOCAL_TECH_REFS = 100`, `MAX_CODE_LENGTH = 32`, `MAX_TITLE_LENGTH = 160`, `MAX_SUMMARY_LENGTH = 1200`, `MAX_SPECS_LENGTH = 2000`, `MAX_SHORT_FIELD_LENGTH = 120`, `MAX_CITATION_LENGTH = 400`, `MAX_RELATED_PROJECTS = 20`)
- `SEED_TECHNICAL_REFERENCES` (`9` fichas seed PT/EN: `MAT-001..003`, `SYS-001..003`, `EST-001..003`)
- `getTechnicalLibrarySnapshot()`, `getTechnicalLibraryVersion()`, `listTechnicalReferences()`, `getTechnicalReferenceById(idOrCode)`, `createTechnicalReference(input)`, `resetTechnicalLibraryLocalState()`, `subscribeTechnicalLibraryChanges(listener)`, `invalidateTechnicalLibraryCache()`

### 3.3 `src/data/studioStructureSelectors.ts`
- `CANONICAL_DEPARTMENT_ORDER` (os 9 `DepartmentId` na ordem canónica)
- `toPublicTeamMember(user)` (remove `demoAccessKey`)
- `buildDepartmentProfiles(projects, tasks, techRefs)` (9 perfis 100% derivados; `finance` e `hr` reportam `0` honestamente)
- `buildTeamMemberProfiles(projects, tasks)` (6 perfis sem `demoAccessKey`, distinguindo liderança vs contribuição vs papel)

### 3.4 `src/features/studio-structure/useStudioStructure.ts`
- `useStudioStructure(): UseStudioStructureResult` → `{ departments, teamMembers, technicalReferences, createTechnicalReference, getDepartmentById, getTeamMemberById, getTechnicalReferenceById, resetTechnicalLibrary }`

---

## 4. Testes Realizados e Resultados Reais

| Verificação | Comando | Resultado | Evidência |
|---|---|---|---|
| **Lint** | `npm run lint` | **PASS** | `0` erros, `0` avisos (`eslint .`) |
| **Vitest (obrigatório)** | `npx vitest run src/test/studioStructure.test.tsx src/test/studioOperations.test.tsx src/test/projectLibraryConsistency.test.tsx src/test/workspaceShell.test.tsx` | **PASS** | `4/4` ficheiros · **`25/25` testes** em `19.45s` (`studioStructure`: `4/4`, `studioOperations`: `5/5`, `projectLibraryConsistency`: `8/8`, `workspaceShell`: `8/8`) |
| **Build & Bundle** | `npm run build` (`tsc -b && vite build`) | **PASS** | `2 796` módulos em `15.44s`, `0` erros, `0` ciclos |

### Evidência do Entry Bundle (`dist/assets/` e `dist/index.html`)
- `dist/assets/index-C4oM75FR.js`: **`74.51 kB` raw / `24.01 kB` gzip** (preservado em `~74–75 kB`, `0` novos imports estáticos em `WorkspaceSessionContext.tsx`).
- `dist/index.html` `modulepreload`: apenas `vendor-react`, `vendor-icons`, `vendor-router` — **`0 B`** de `vendor-three`, `vendor-r3f`, `vendor-motion`, `technicalLibraryRepository`, `tasksRepository` ou `projectLibraryRepository`.

---

## 5. Problemas `P0` / `P1` / `P2`

- **P0:** Nenhum.
- **P1:** Nenhum.
- **P2:** Nenhum no âmbito de `05-M2-DATA-01`.

---

## 6. Limitações e Pendências

- Sem bloqueios ou pendências. Branch `codex/f05-m2-task-agent-a` pronta para empilhamento pela Etapa 2 (`05-M2-FE-01` · `agent-b`).

---

## 7. Recomendações

- Avançar para `05-M2-FE-01` consumindo `useStudioStructure()` e os tipos de `src/data/studioStructureTypes.ts` nas páginas lazy `/workspace/departments`, `/workspace/team` e `/workspace/library`.
