# Plano 011 · Fase 04.5A — Data Performance & Workspace Consistency

- **Branch:** `codex/f045a-data-consistency`
- **Base:** `codex/f02-integration-preview` (`37265d5914f161bd9a45f688b8f85f48fffdd7b0`)
- **Referências:**
  - `docs/audits/phase04-performance-postmerge.md` (`codex/f04c-postmerge-performance`)
  - `docs/audits/phase04-final-memory-verification.md` (`codex/f04c-memory-verification`)
- **Agente:** A (Arquitectura de Dados, Repositório Canónico, Pesquisa & Consistência Operacional)
- **Estado:** Concluído e verificado (`lint`, `12/12` suites / `91/91` testes Vitest, `build`, `test:e2e`, benchmark Chromium 5/50/200 projectos)

## Objectivo

Eliminar trabalho síncrono redundante sobre `localStorage` e `JSON.parse`, reactivar e pré-normalizar o índice da Pesquisa Global e unificar o Studio Desk (`StudioDeskPage.tsx` e `ProjectDossierDialog.tsx`) sobre a fonte canónica única de projectos (`projectLibraryRepository.ts`), preservando integralmente os limites de segurança da Fase 04, o comportamento PT/EN, os seis perfis demonstrativos, o visualizador WebGL e o limite persistente de `MAX_LOCAL_PROJECTS = 50`.

## Alterações Arquitectónicas

1. **Cache em memória segura no repositório canónico (`src/data/projectLibraryRepository.ts`, `src/data/projectLibraryAdapter.ts`):**
   - Memorização lazy dos registos canónicos base em `projectLibraryAdapter.ts` (`cachedSeedCanonicalProjects`) para evitar reconstrução repetida da seed estática.
   - Snapshot imutável único em memória (`ProjectLibrarySnapshot`: `version`, `envelope`, `allRecords`, `activeRecords`, `lookupMap`, `studioDeskAll`, `studioDeskActive`) protegido por `deepFreezeValue` e cópias superficiais nos retornos, impedindo mutação acidental do cache por consumidores.
   - Inicialização preguiçosa (*lazy on demand*) na primeira leitura após carregamento ou invalidação; consulta `O(1)` via `lookupMap` em `getProjectById`.
   - Escrita atómica em `saveEnvelope`: o cache só é actualizado **após** `localStorage.setItem` e verificação de persistência terem sucesso; falhas como `QuotaExceededError` propagam-se intactas sem poluir o cache nem perder a consistência com o armazenamento.
   - Invalidação automática via versão monotónica em todas as mutações (`createProject`, `updateProjectMetadata`, `addProjectRevision`, `addProjectDocumentReference`, `archiveProject`, `restoreProjectFromArchive`, `transitionProjectPublication`, `resetProjectLibraryState`, `clearProjectLibraryLocalState`), evento local `PROJECT_LIBRARY_UPDATED_EVENT` e listener singleton `window` (`'storage'`) para alterações entre separadores. Recuperação resiliente caso o JSON armazenado seja inválido ou corrompido.
   - Funções exportadas: `getProjectLibrarySnapshot()`, `getProjectLibraryVersion()` e `invalidateProjectLibraryCache()`.

2. **Snapshot único no hook e memoização no Dossier (`src/features/project-library/useProjectLibrary.ts`, `src/features/project-library/ProjectDossierShellPage.tsx`):**
   - Substituição de estados separados (`listProjects` + `listStudioDeskCompatibleProjects`) por um único `useSyncExternalStore(subscribeProjectLibraryChanges, getProjectLibrarySnapshot, getProjectLibrarySnapshot)`, eliminando duplas leituras e re-renderizações desencontradas.
   - `getProject(id)` usa consulta directa `O(1)` no `lookupMap` do snapshot partilhado.
   - Memoização de `deskProject`, `documents` e `revisions` em `ProjectDossierShellPage.tsx`, habilitando a abertura no Studio Desk (`/workspace?project=<id>`) tanto para projectos seed como para projectos criados localmente.

3. **Pesquisa Global pré-normalizada e sem leituras no teclado (`src/features/workspace-shell/globalSearchIndex.ts`, `src/features/workspace-shell/GlobalSearchDialog.tsx`):**
   - Cache do índice estático por idioma e do índice de projectos por chave `(libraryVersion, language)`.
   - Pré-computação na construção do índice da normalização Unicode/NFD sem diacríticos (`normCode`, `normTitle`, `searchText`), evitando normalizar cada item em cada tecla digitada (`0` chamadas a `localStorage.getItem` e `0` `JSON.parse` durante a escrita no diálogo).
   - `GlobalSearchDialog.tsx` subscreve `getProjectLibrarySnapshot` com `useSyncExternalStore`, garantindo reactividade imediata após criação, edição, arquivo, restauro, troca de idioma PT/EN e mudança de perfil entre os 6 utilizadores demonstrativos. Exportada `clearWorkspaceSearchIndexCache()` para suporte determinístico em testes.

4. **Consistência Studio Desk ↔ Biblioteca de Projectos (`src/features/studio-desk/StudioDeskPage.tsx`, `src/features/studio-desk/ProjectDossierDialog.tsx`):**
   - Substituição da lista estática `STUDIO_DESK_PROJECTS` em `StudioDeskPage.tsx` pelos dados canónicos de `useProjectLibrary().studioDeskProjects`.
   - `activeDeskProjects` filtra projectos arquivados das secções activas (*Briefing / Atenção*, *Projecto em Destaque* e vista *Todos* / filtros de estado activo), mantendo visíveis os arquivados quando o filtro `Arquivado` é seleccionado e em deep links `?project=<id>`.
   - Campos de pesquisa pré-normalizados em memória para filtragem instantânea no panorama de projectos.
   - `ProjectDossierDialog.tsx` resolve o projecto aberto dinamicamente a partir da prop reactiva `projects` (`projects.find(...)`), evitando snapshots obsoletos se o projecto for editado enquanto o diálogo está aberto.
   - Preservação integral de `STUDIO_DESK_TASKS` e da actividade demonstrativa estática, sem inventar tarefas falsas para projectos recém-criados.

5. **Testes e ambiente (`src/test/projectLibraryConsistency.test.tsx`, `src/test/projectLibrary.test.tsx`, `src/test/projectLibrarySecurity.test.tsx`, `src/test/setup.ts`):**
   - Limpeza automática das caches no `beforeEach` de `src/test/setup.ts`.
   - Disparo explícito de `StorageEvent` nos testes que simulam injecção/corrupção directa no `localStorage`.
   - Nova suite `src/test/projectLibraryConsistency.test.tsx` (5 testes) cobrindo imutabilidade, invalidação cross-tab, não-poluição em `QuotaExceededError`, 0 leituras/parses no teclado da Pesquisa Global, ciclo completo Studio Desk (criar, editar, diálogo live, arquivar, restaurar, deep link `?project=`) e benchmark até 200 projectos sintéticos preservando `MAX_LOCAL_PROJECTS = 50`.

## Medições Reais (Chromium Headless via Vite Preview — Antes vs Depois)

Metodologia: mesma bateria Playwright em Chromium sobre `npm run build` + `vite preview` antes e depois das alterações, mantendo intocado `MAX_LOCAL_PROJECTS = 50` em produção e injectando conjuntos sintéticos directamente no `localStorage` exclusivamente para medir escala (`5`, `50` e `200` projectos).

### Resumo de Operações de Armazenamento & Parsing (`getItem(library)` / `JSON.parse`)

| Métrica | Escala 5 (Antes → Depois) | Escala 50 (Antes → Depois) | Escala 200 (Antes → Depois) |
| --- | --- | --- | --- |
| **Abertura do Catálogo (`catalogOpen`) · `getItemLibrary`** | `2` → `0` | `2` → `0` | `2` → `0` |
| **Abertura da Pesquisa (`searchOpen`) · `getItemLibrary`** | `1` → `0` | `1` → `0` | `3` → `0` |
| **Abertura da Pesquisa (`searchOpen`) · `JSON.parse` totais** | `0` → `0` | `1` → `0` | `29` → `0` |
| **10 teclas na Pesquisa (`search10Keystrokes`) · `getItemLibrary`** | **`10` → `0`** | **`10` → `0`** | **`10` → `0`** |
| **10 teclas na Pesquisa (`search10Keystrokes`) · `JSON.parse` totais** | `0` → `0` | **`10` → `0`** | **`10` → `0`** |
| **10 teclas na Pesquisa (`search10Keystrokes`) · tempo total** | `374.23ms` → `490.12ms` | `354.04ms` → `459.84ms` | **`865.91ms` → `415.80ms`** |
| **Abertura directa Dossier (`dossierOpen` cold) · `getItemLibrary`** | `3` → **`1`** | `3` → **`1`** | `3` → **`1`** |
| **Actualização no Dossier (`dossierUpdate`) · `getItemLibrary`** | `7` → **`2`** | `7` → **`2`** | `7` → **`2`** |
| **Actualização no Dossier (`dossierUpdate`) · `JSON.parse` totais** | `3` → **`0`** | `5` → **`0`** | `5` → **`0`** |
| **Abertura Studio Desk (`studioDeskOpen`) · `getItemLibrary`** | `0` (estático) → `1` (canónico) | `0` (estático) → `1` (canónico) | `0` (estático) → `1` (canónico) |

*Notas observadas nas medições:*
- Em `studioDeskOpen` (arranque frio com sessão activa e 200 projectos), a leitura canónica única e construção inicial do snapshot + DOM levou `1141.2ms` com `1` `getItemLibrary` (contra leitura estática isolada sem projectos locais antes da unificação), eliminando por completo novas leituras no Catálogo (`0`) e Pesquisa (`0`).
- O tempo total de `search10Keystrokes` em Chromium inclui a cadência sintética de digitação de 10 caracteres no browser; a eliminação do parsing e da re-normalização por tecla reduziu o cenário de 200 projectos de `865.91ms` para `415.80ms` com `0` leituras de `localStorage` e `0` `JSON.parse`.

## Ficheiros Alterados (Âmbito Autorizado)

- `src/data/projectLibraryAdapter.ts`
- `src/data/projectLibraryRepository.ts`
- `src/features/project-library/useProjectLibrary.ts`
- `src/features/project-library/ProjectDossierShellPage.tsx`
- `src/features/workspace-shell/globalSearchIndex.ts`
- `src/features/workspace-shell/GlobalSearchDialog.tsx`
- `src/features/studio-desk/StudioDeskPage.tsx`
- `src/features/studio-desk/ProjectDossierDialog.tsx`
- `src/test/setup.ts`
- `src/test/projectLibrary.test.tsx`
- `src/test/projectLibrarySecurity.test.tsx`
- `src/test/projectLibraryConsistency.test.tsx` *(novo)*
- `plans/011-phase-045a-data-consistency.md` *(este documento)*

*Intocados conforme restrições da fase:* `PROJECT_MAP.md`, `src/app/App.tsx`, `vite.config.ts`, `src/utils/timeGreeting.ts`, `src/features/model-viewer/**`, `src/features/model-engine/**`, `package.json`, `package-lock.json`.

## Verificações Executadas

- `npm run lint`: PASSOU (`0` erros/avisos).
- `npm run test`: PASSOU (`12/12` ficheiros de teste, `91/91` testes Vitest, incluindo `src/test/projectLibraryConsistency.test.tsx`).
- `npm run build`: PASSOU (`tsc -b && vite build`, `2785` módulos, `dist/` gerado em `19.76s`).
- `npm run test:e2e`: PASSOU (`scripts/e2e-verify-entry.mjs`).
- Benchmark Chromium Playwright (5, 50 e 200 projectos sintéticos): EXECUTADO antes e depois da refactoração.
