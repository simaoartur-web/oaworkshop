---
trigger: glob
globs: "**/src/data/**/*.ts, **/src/app/WorkspaceSessionContext.tsx, **/src/features/project-library/**/*.ts, **/src/features/project-library/**/*.tsx, **/src/features/workspace-shell/globalSearchIndex.ts, **/src/features/workspace-shell/shellDemoState.ts, **/src/features/model-engine/modelViewerContract.ts, **/src/features/model-engine/useProjectModelEngine.ts"
---

# Regras de Dados & Arquitectura (`@agent-a`)

Aplicam-se a alterações na camada canónica de dados, sessão, pesquisa local e contratos de modelos 3D:

1. **Privacidade e sessão honesta:** Nunca guardar palavras-passe (mesmo fictícias) em `localStorage`, `sessionStorage` ou `IndexedDB`. Limpar entradas corrompidas automaticamente e revogar `ObjectURL` (`clearAllSessionModels()`) no `signOut()`.
2. **Imutabilidade e cache canónica:** Manter snapshot imutável (`deepFreezeValue` + fachada `ReadonlyMap` encapsulada em `lookupMap`). Não devolver referências mutáveis a arrays/objectos em cache.
3. **Persistência atómica:** Actualizar o cache em memória apenas **após** escrita confirmada em `localStorage`; falhas como `QuotaExceededError` devem propagar-se intactas sem corromper o snapshot nem confirmar falsamente a operação.
4. **Validação defensiva e quotas:** Preservar `MAX_LOCAL_PROJECTS = 50`, limites de revisões/documentos e aplicar `assertWithinMaxLength` a todos os campos de texto e metadados técnicos (`scale`, `areaSqm`, `elevationDatum`, `discipline`). Validar origens seguras em `editorial.imageSrc` e tipos `LocalizedText`.
5. **Segurança 3D (`modelAssetRepository`):** Separar estritamente `document-reference` (`.skp` nunca renderizável), `demo-asset` (fictício) e `session-file` (em memória, limite `50 MB`). Impor allowlist estrita de `data:` URIs (`application/octet-stream`, `application/gltf-buffer`, `image/png`, `image/jpeg`, `image/webp`), bloquear URIs externas/`../`/`javascript:`, validar `images[].mimeType` em `bufferView` e proteger leituras assíncronas contra race conditions com `signOut()`/reset.
6. **Pesquisa e sincronização:** Manter `0` chamadas `localStorage.getItem` e `0` `JSON.parse` por tecla na Pesquisa Global; suportar invalidação cross-tab via `StorageEvent` e preservar a fonte única de verdade entre Biblioteca, Studio Desk e Dossier.
7. **Contratos e documentação:** Actualizar `docs/MOCK_DATA_CONTRACTS.md`, `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md` e `PROJECT_MAP.md` sempre que chaves, contratos ou ficheiros mudarem; evitar imports estáticos pesados no entry inicial (`WorkspaceSessionContext.tsx`).
