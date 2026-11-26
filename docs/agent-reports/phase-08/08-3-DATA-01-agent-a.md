# Relatório Técnico — `08-3-DATA-01` (`@agent-a` · Fase 08.3 — `R-04` Formatação e Internacionalização)

- **Missão / Contrato:** `08-3-DATA-01` (Plano `plans/021-phase-08-product-refinement-and-user-experience.md`, requisito `R-04`)
- **Agente:** `@agent-a` (Data & Architecture Engineer)
- **Governança de Modelo (v1.1):** Classe `T1` · Modelo `Gemini 4 Neon (Medium)`
- **Branch / Worktree:** `codex/f083-format-agent-a` (`D:/projects/O+A Architecture and Planners/Main/oaworkspace-f083-agent-a`)
- **Base SHA:** `5ecc04b897f0e7f3e1754a67df95573ea4336b5e`
- **Estado:** `PASSED`

---

## 1. Resumo da Entrega

Criada a camada pura de formatação editorial bilingue (`PT`/`EN`) em `src/utils/editorialFormatting.ts` (com instâncias `Intl.DateTimeFormat` em cache a nível de módulo — zero alocações por render) e eliminadas as fugas de enums crus, datas ISO cruas em prosa, termos em português no modo inglês e a referência literal `mode: local-demo` em texto editorial, preservando intactos todos os contratos de tipos (`src/data/*Types.ts`), valores canónicos internos (`'Milão'`, `'in_progress'`, `'requested'`, etc.) e chaves `localStorage`.

---

## 2. Exportações de `src/utils/editorialFormatting.ts` (prontas para adopção por `@agent-b` em `08-3-FE-01`)

| Função | Assinatura | Comportamento |
|---|---|---|
| `formatEditorialDate` | `(isoDateOrTimestamp: string, language: AppLanguage) => string` | Interpreta datas puras `YYYY-MM-DD` via `Date.UTC(year, month - 1, day)` (sem desvio de fuso horário) e timestamps ISO completos em UTC usando `Intl.DateTimeFormat` em cache. Ex.: `'2026-11-10'` → `'10 Nov 2026'` (`pt`) / `'Nov 10, 2026'` (`en`). Fallback seguro sem lançar excepção em entradas vazias ou inválidas. |
| `formatStudioBaseLabel` | `(base: ProjectStudioBase, language: AppLanguage) => string` | Devolve `'Milan'` quando `base === 'Milão'` e `language === 'en'`; preserva `'Milão'` em `pt` e `'Maputo'` em ambos os idiomas. Valor interno canónico inalterado (`'Maputo' \| 'Milão'`). |
| `formatTaskStatusLabel` | `(status: DeskTaskStatus, language: AppLanguage) => string` | `pending` → `Pendente` / `Pending`; `in_progress` → `Em Curso` / `In Progress`; `completed` → `Concluída` / `Completed`. |
| `formatPublicationStatusLabel` | `(status: PublicationStatus, language: AppLanguage) => string` | `private` (`Privado`/`Private`), `requested` (`Solicitado`/`Requested`), `approved` (`Aprovado`/`Approved`), `published-demo` (`Publicado (Demo)`/`Published (Demo)`), `rejected` (`Rejeitado`/`Rejected`), `unpublished` (`Despublicado`/`Unpublished`). |
| `formatActivityDomainLabel` | `(domain: ActivityDomain, language: AppLanguage) => string` | `project` (`Projectos`/`Projects`), `task` (`Tarefas`/`Tasks`), `technical_library` (`Biblioteca Técnica`/`Technical Library`), `publication` (`Publicações`/`Publications`). |
| `formatProjectStatusLabel` | `(status: ProjectStatus, language: AppLanguage) => string` | `concept` (`Conceito`/`Concept`), `design` (`Projecto`/`Design`), `in_progress` (`Em Curso`/`In Progress`), `review` (`Em Revisão`/`In Review`), `completed` (`Concluído`/`Completed`), `archived` (`Arquivado`/`Archived`). |
| `formatDemoAuthorDisplay` | `(name: string) => string` | Uniformiza o sufixo `(Demo)` em nomes de autores demonstrativos sem duplicar sufixos existentes (`(Demo)` / `(demo)`). |

---

## 3. Ficheiros Criados / Alterados

- `src/utils/editorialFormatting.ts` *(novo)* — utilitários puros de formatação editorial PT/EN com `Intl.DateTimeFormat` em cache.
- `src/data/activitySelector.ts` — substituição de enums crus (`task.status`, `entry.toStatus.toUpperCase()`) e datas ISO cruas (`task.dueDateIso`) por etiquetas localizadas e datas formatadas via `editorialFormatting.ts`; uniformização do sufixo `(Demo)` em `resolveActorName`.
- `src/data/publicationsRepository.ts` — `defaultTransitionNote` actualizado para usar `formatPublicationStatusLabel` em `pt` e `en`, eliminando estados crus (`"private"`, `"requested"`, etc.) das notas automáticas de auditoria.
- `src/data/modelAssetRepository.ts` — remoção de termos exclusivamente em português (`Estudo Demo`, `.gltf autónomo`) em `sizeHint` de `DEMO_MODEL_CATALOG` (`'24.1 KB (Demo)'`, `'13.0 KB (Demo)'`, `'1.2 KB (.gltf)'`), preservando o contrato `sizeHint: string`.
- `src/features/editorial-control/i18n.ts` — remoção de `(mode: local-demo)` da prosa editorial em `pt.reports.honestBanner` e `en.reports.honestBanner`, preservando `mode: 'local-demo'` no payload JSON de `serializeReportSnapshotJson`.
- `src/test/editorialFormatting.test.tsx` *(novo)* — 13 testes unitários e de regressão cobrindo `YYYY-MM-DD` sem desvio de fuso, timestamps ISO, `Milão`/`Milan`, todos os 4 formatadores de enums em PT/EN, `formatDemoAuthorDisplay` e ausência de fugas em `activitySelector.ts`, `publicationsRepository.ts`, `modelAssetRepository.ts` e `editorial-control/i18n.ts`.
- `PROJECT_MAP.md` — registo de `src/utils/editorialFormatting.ts` e `src/test/editorialFormatting.test.tsx`.
- `docs/agent-reports/phase-08/08-3-DATA-01-agent-a.md` *(novo)* — este relatório técnico.

**Fronteiras respeitadas:** zero alterações em componentes React UI (`.tsx` de páginas/`FilterBar`), zero alterações em `src/data/*Types.ts`, `package.json`, `main` ou no website público `oaworkshop`.

---

## 4. Verificações e Quality Gate

| Verificação | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | **PASS** (`0` erros, `0` avisos) |
| Typecheck + Build | `npm run build` (`tsc -b && vite build`) | **PASS** (`38.80s`, `dist/index.html` = `1.74 kB`) |
| Isolamento de Entry Bundle | `Select-String dist\index.html` (`vendor-three\|vendor-r3f\|vendor-motion`) | **PASS** (`0` correspondências / `0 B` no entry) |
| Suite de Testes | `npm run test` (`vitest run`) | **PASS** — `20/20` ficheiros, `147/147` testes (`13/13` novos em `editorialFormatting.test.tsx`) |

---

## 5. Riscos Restantes / Notas para `08-3-FE-01` (`@agent-b`)

- Todos os helpers de `src/utils/editorialFormatting.ts` são funções puras sem efeitos laterais e sem dependências React, podendo ser importados directamente nos componentes UI de `08-3-FE-01` (ex.: `FilterBar`, cabeçalhos de tabelas, `ReportsPage`, `ActivityPage`, `TasksPage`, `PublicationsPage`, `ProjectDossierView`, `ProjectModelEnginePage`).
- Nenhum risco bloqueante identificado.
