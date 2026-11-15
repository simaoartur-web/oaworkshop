# Plano 010 · Fase 04 Hardening — Agente A (Security & Data Integrity)

- **Branch:** `codex/f04a-security-hardening`
- **Base:** `codex/f02-integration-preview` (`ac13ee14dad89c446546e65966b1a96983f6a44a`)
- **Referência:** `docs/audits/phase04-security-postmerge.md` (branch `codex/f04d-postmerge-security`)
- **Agente:** A (Motor de Modelos 3D, Sessão & Repositório Canónico de Projectos)
- **Estado:** Concluído e verificado (`lint`, `build`, `81/81` testes Vitest)

## Objectivo

Corrigir as vulnerabilidades P0 e P1 de segurança e integridade de dados identificadas na auditoria pós-integração da Fase 04, sem alterar o visualizador WebGL (`src/features/model-viewer/**`, responsabilidade do Agente B) nem a `main`.

## Correcções P0

1. **Allowlist estrita de MIME para URIs `data:` em `.gltf` e chunks JSON `.glb`:**
   - Permitir apenas `application/octet-stream` e `application/gltf-buffer` em `buffers[]`.
   - Permitir apenas `image/png`, `image/jpeg` e `image/webp` em `images[]`.
   - Verificação case-insensitive em `data:` e no MIME base, além de bloqueio a parâmetros suspeitos e caracteres de controlo.
2. **Rejeição explícita de SVG, HTML, JavaScript, esquemas externos e caminhos relativos:**
   - Bloquear `image/svg+xml`, `text/html`, `application/javascript`, `text/javascript`, `data:,...`, `http:`, `https:`, `//`, `ftp:`, `file:`, `javascript:`, `blob:`, `..`, `\`, `/` e caminhos relativos sem bundle em `validateGltfManifestText`.
3. **Inspecção de chunk JSON `.glb` antes da carga 3D:**
   - Extrair `[20, 20 + jsonChunkLength)` em `validateModelFileSelection` quando o ficheiro é `.glb`, descodificar UTF-8 e validar com `validateGltfManifestText`.
   - Garantir que qualquer `.glb` ou `.gltf` rejeitado falha antes da criação de `ObjectURL` e nunca chega ao `GLTFLoader` (`parseGlbSceneAndTelemetry`).

## Correcções P1

4. **Limpeza de modelos temporários ao terminar sessão:**
   - Invocar `clearAllSessionModels()` em `signOut()` e `resetAllDemoData()` em `WorkspaceSessionContext.tsx`, limpando `sessionModelsByProjectId` e revogando `ObjectURL`s activos.
5. **Validação de nomes de ficheiros documentais e correspondência extensão/tipo:**
   - Validar nomes base sem `/`, `\`, `..`, esquemas URL ou caracteres de controlo; bloquear extensões web/executáveis (`.html`, `.svg`, `.js`, `.exe`, etc.) e validar correspondência com `ProjectFileKind` em `projectLibraryRepository.ts` e no formulário documental de `ProjectDossierView.tsx`.
6. **Limites de caracteres e número de registos:**
   - Aplicar `PROJECT_LIBRARY_LIMITS` (`MAX_LOCAL_PROJECTS = 50`, `MAX_FILES_PER_PROJECT = 100`, `MAX_REVISIONS_PER_PROJECT = 100`, `MAX_TITLE_LENGTH = 160`, `MAX_TEXT_LENGTH = 2000`, `MAX_FILENAME_LENGTH = 180`, `MAX_SHORT_FIELD_LENGTH = 120`, `MAX_CODE_LENGTH = 40`) tanto no repositório como em atributos `maxLength` dos formulários de `ProjectDossierView.tsx` e `ProjectCreationWizard.tsx`.
7. **Preservação e exposição honesta de `QuotaExceededError`:**
   - Preservar `error.name === 'QuotaExceededError'` em `saveEnvelope` e confirmar apresentação do alerta sem falsas confirmações na interface.

## Ficheiros Afectados

- `src/data/modelAssetTypes.ts`
- `src/data/modelAssetRepository.ts`
- `src/app/WorkspaceSessionContext.tsx`
- `src/data/projectLibraryRepository.ts`
- `src/features/project-experience/ProjectDossierView.tsx`
- `src/features/project-experience/ProjectCreationWizard.tsx`
- `src/test/modelEngineSecurity.test.tsx`
- `src/test/projectLibrarySecurity.test.tsx`
- `PROJECT_MAP.md`
- `plans/010-phase-04a-security-hardening.md`

## Critérios de Aceitação e Verificação

- `npm run lint` sem erros ou avisos.
- `npm run test` verde, incluindo os novos testes adversariais P0 e P1.
- `npm run build` sem erros.
