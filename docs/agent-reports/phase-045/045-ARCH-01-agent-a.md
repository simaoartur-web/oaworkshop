# Relatório Técnico — Fase 04.5 · Revisão Estática de Dados & Arquitectura (`045-ARCH-01`)

- **Identificador da tarefa:** `045-ARCH-01`
- **Agente:** `@agent-a` (Data & Architecture Engineer)
- **Origem das evidências:** Publicação directa do relatório concluído no Swarm Board (`#7`, `2026-11-19 18:49:13`) sem re-execução de investigação
- **Objectivo e âmbito:** Leitura e revisão estática dos contratos actuais, invariantes de dados, cache imutável, pesquisa pré-normalizada e fronteiras de segurança 3D no commit integrado `4197c2e`, em modo estritamente read-only.
- **Branch da tarefa:** `codex/f045-task-agent-a`
- **Commit base:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` (`origin/codex/f02-integration-preview`)
- **Estado:** `PASSED` *(revisão estática concluída sem alterações de código; 0 P0, 0 P1, 6 P2 defensivos registados)*

---

## 1. Ficheiros Modificados

- `docs/agent-reports/phase-045/045-ARCH-01-agent-a.md` *(apenas este relatório; zero alterações em código de produção)*

### Ficheiros Auditados (Somente Leitura)
- Documentação e Planos: `AGENTS.md`, `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md`, `docs/MOCK_DATA_CONTRACTS.md`, `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md`, `docs/DECISIONS.md`, `plans/011-phase-045a-data-consistency.md`, `plans/012-phase-045b-loading-performance.md`, `plans/013-phase-045-integration.md`.
- Código sob propriedade de `@agent-a`: `src/data/{types,fixtures,sessionRepository,projectLibraryTypes,projectLibraryAdapter,projectLibraryRepository,modelAssetTypes,modelAssetRepository,studioDeskTypes,studioDeskFixtures}.ts`, `src/app/WorkspaceSessionContext.tsx`, `src/features/project-library/{useProjectLibrary,projectExperienceContract,ProjectLibraryCatalogPage,ProjectCreateEnginePage,ProjectDossierShellPage,i18n}.*`, `src/features/workspace-shell/{globalSearchIndex,shellDemoState}.ts`, `src/features/model-engine/{modelViewerContract,useProjectModelEngine}.ts`.
- Fronteiras consultadas: `GlobalSearchDialog.tsx`, `StudioDeskPage.tsx`, `ProjectDossierDialog.tsx`, `glbInspector.ts`, `projectLibraryConsistency.test.tsx`.

---

## 2. Trabalho Executado e Evidências

- **Zero-password e limpeza no logout (`sessionRepository.ts`, `WorkspaceSessionContext.tsx`):** `DemoSession` persiste exclusivamente `{ userId, role, authenticatedAt, mode: 'local-demo' }`; sessões corrompidas são removidas em `loadDemoSession()`; `signOut()` executa `clearAllSessionModels()` (revogando `blob:` ObjectURLs) e `clearDemoSession()`.
- **Cache canónica imutável e persistência atómica (`projectLibraryRepository.ts`, `projectLibraryAdapter.ts`, `useProjectLibrary.ts`):** `cachedSeedCanonicalProjects` lazy; `ProjectLibrarySnapshot` imutável via `deepFreezeValue` + fachada `createImmutableLookupMap` (`Object.freeze`, sem `set`/`delete`/`clear`) para lookup `O(1)` por `id`/`code`/`slug`; `saveEnvelope` só actualiza `cachedSnapshot` após `localStorage.setItem` + verificação, preservando integridade sob `QuotaExceededError`; `loadEnvelopeFromStorage` recupera de JSON corrompido removendo a chave; privacidade `publicationStatus: 'private'` forçada para `local-created`; `MAX_LOCAL_PROJECTS = 50`, `MAX_FILES_PER_PROJECT = 100`, `MAX_REVISIONS_PER_PROJECT = 100` e `validateProjectDocumentFileName` activos; subscrição única via `useSyncExternalStore` + `StorageEvent` cross-tab.
- **Pesquisa Global pré-normalizada (`globalSearchIndex.ts`):** buckets estáticos por idioma e bucket de projectos indexado por `(libraryVersion, language)` com `normCode`/`normTitle`/`searchText` pré-normalizados em NFD e invalidados por `subscribeProjectLibraryChanges` (`0` leituras de `localStorage` e `0` `JSON.parse` por tecla).
- **Motor 3D e fronteiras de segurança (`modelAssetRepository.ts`, `modelViewerContract.ts`, `useProjectModelEngine.ts`):** separação estrita das 3 categorias (`document-reference`, `demo-asset` com `isFictiveStudy: true`, `session-file` efémero em memória); limite `50 MB`; validação de cabeçalho binário `.glb` (20 bytes + comprimento exacto + chunk JSON) e manifesto `.gltf` 2.0; allowlist MIME de `data:` URIs (`application/octet-stream`, `application/gltf-buffer`, `image/png`, `image/jpeg`, `image/webp`) e bloqueio de esquemas externos/traversal antes do `GLTFLoader`.

---

## 3. Testes Realizados e Resultados

- Revisão estática integral de contratos, invariantes e fluxos de dados em `4197c2e` (`read-only`, sem execução de builds ou testes concorrentes com `@agent-c` e `@agent-d`, conforme brief `#1`).

---

## 4. Problemas Classificados (`P0` / `P1` / `P2`)

- **P0:** Nenhum identificado em revisão estática.
- **P1:** Nenhum identificado em revisão estática.
- **P2 (endurecimentos defensivos de fronteira):**
  1. **Race assíncrona em `selectSessionModelFile` (`modelAssetRepository.ts:987-1044` / `useProjectModelEngine.ts:185-224`):** sem token/geração monotónica; se `signOut()`, `clearAllSessionModels()` ou uma nova selecção ocorrer durante `readFullFileArrayBuffer()`, a chamada antiga pode ainda criar e registar um `blob:` ObjectURL + `ArrayBuffer` (até 50 MB) em memória após o logout/reset.
  2. **Allowlist de `images[].mimeType` com `bufferView` (`modelAssetRepository.ts:515-522`, fronteira com `glbInspector.ts:340-355`):** valida `images[].uri` (`data:` allowlist), mas não valida `images[].mimeType` quando a imagem está embutida via `bufferView` (ex.: `image/svg+xml` num BIN chunk contorna a allowlist PNG/JPEG/WebP, embora sem execução de script em `<img>`/textura).
  3. **Campos sem validação de comprimento ou origem em `projectLibraryRepository.ts`:** `createProject` (`:1230-1232`) e `updateProjectMetadata` (`:1454-1463`) não aplicam `assertWithinMaxLength` a `scale`, `areaSqm`, `elevationDatum` (e `discipline` em update); `validateCanonicalRecord` (`:296`, `:359`, `:415`, `:460`) aceita qualquer string em `editorial.imageSrc` e faz cast de `review.roleFocalNote` sem validar que os valores são `LocalizedText`.
  4. **Sincronização cross-tab de sessão/preferências/modelos (`WorkspaceSessionContext.tsx`, `sessionRepository.ts`, `modelAssetRepository.ts`):** `WorkspaceSessionContext` não subscreve `StorageEvent` para `SESSION`/`PREFERENCES`; `loadDemoSession()` sanitiza campos extra em memória mas não reescreve/limpa a chave adulterada no `localStorage`.
  5. **Deriva de copy/flags e documentação:** `globalSearchIndex.ts:181-183` e `shellDemoState.ts:49-56` ainda marcam `/workspace/projects` como `isPlannedRoute: true` / `isFutureModuleDemo: true` (`Fases 03–04`), apesar de a Biblioteca estar activa; `docs/MOCK_DATA_CONTRACTS.md` e `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md` estão parcialmente desactualizados face a `4197c2e`.
  6. **Imutabilidade defensiva secundária:** `listAllDemoCollaborators()` devolve referência directa a `DEMO_USERS` e `searchWorkspaceDemo()`/`buildWorkspaceSearchEntries()` devolvem entradas cacheadas não congeladas.

---

## 5. Limitações e Pendências

- Missão exclusivamente read-only; nenhuma correcção aplicada até aprovação humana de plano e `TASK_CONTRACT` dedicados.

---

## 6. Recomendações

- Endurecer os pontos P2 acima após aprovação humana (em particular `assertWithinMaxLength` em `scale`/`areaSqm`/`elevationDatum`, validação de `images[].mimeType` em `bufferView`, geração monotónica em `selectSessionModelFile`, sync cross-tab em `WorkspaceSessionContext.tsx` e actualização de `MOCK_DATA_CONTRACTS.md` e `PHASE_04_MODEL_ENGINE_CONTRACT.md`).
