# Contrato de Integração Fase 04 · Motor de Modelos 3D (Agente A) ↔ Visualizador WebGL (Agente B)

> **Estado:** Activo na branch `codex/f04-model-engine` (Agente A) · Preparado para integração sequencial com `src/features/model-viewer/**` (Agente B).

## 1. Fronteira de Responsabilidades

| Camada | Responsável | Caminho | Responsabilidade |
|---|---|---|---|
| **Domínio & Repositório de Modelos** | Agente A | `src/data/modelAssetTypes.ts`, `src/data/modelAssetRepository.ts` | Distinção canónica das 3 categorias (`document-reference`, `demo-asset`, `session-file`), catálogo demonstrativo `.glb`/`.gltf`, validação de ficheiros locais (limite `50 MB`, cabeçalho binário `.glb`, manifesto `.gltf` 2.0 com recursos incorporados) e gestão efémera de `ObjectURL` (`blob:`) com revogação automática |
| **Motor de Rota & Estado Reactivo** | Agente A | `src/features/model-engine/**` | Rota `/workspace/projects/:id/model` (carregada por `React.lazy`), hook `useProjectModelEngine`, contrato `modelViewerContract.ts` e slot de montagem `ModelEngineStageSlot` |
| **Visualizador Gráfico WebGL** | Agente B | `src/features/model-viewer/**`, `public/assets/models/**` | Renderização 3D real (`.glb`/`.gltf`), câmara orbital, iluminação arquitectónica, grelha de cota e controlos visuais |

---

## 2. Distinção Obrigatória de Três Categorias (`ModelAssetCategory`)

1. **`'document-reference'` (A · Referência documental do dossier):**
   - Registo proveniente de `CanonicalProjectRecord.files` (`ProjectFileReference`), como `oa-26-101-study-model.skp` ou um `maquete.glb` adicionado pelo utilizador na aba Documentação.
   - Contém **exclusivamente metadados** (`isLoadableBinaryPresent: false`); nunca origina um `ModelSource` para o WebGL.
   - Ficheiros `.skp` nativos SketchUp são assinalados com `availabilityStatus: 'unsupported-skp'`, sem conversão automática ou simulada.
   - Registos `.glb`/`.gltf` apenas documentais são assinalados com `availabilityStatus: 'metadata-only'`.
2. **`'demo-asset'` (B · Modelo demonstrativo disponível):**
   - Estudo 3D fictício registado em `DEMO_MODEL_CATALOG` (`.glb` e `.gltf` 2.0 completo com recursos incorporados em `EMBEDDED_DEMO_GLTF_JSON`).
   - Transporta obrigatoriamente `isFictiveStudy: true` e `fictiveDisclaimer: LocalizedText`, exibidos na UI para não confundir o estudo demonstrativo com a geometria autêntica da obra.
3. **`'session-file'` (C · Modelo seleccionado na sessão):**
   - Ficheiro local `.glb` ou `.gltf` autónomo validado e registado em memória (`selectSessionModelFile`) com `URL.createObjectURL(file)`.
   - Nunca é persistido em `localStorage`, `sessionStorage` ou `IndexedDB`.
   - O `ObjectURL` anterior é revogado (`URL.revokeObjectURL`) ao substituir ficheiro, ao chamar `clearSessionModelForProject(projectId)` ou durante o reset global (`clearAllSessionModels()`).

---

## 3. Tipos do Contrato (`src/features/model-engine/modelViewerContract.ts`)

### 3.1 `ModelSource`
Fornecido apenas quando existe um modelo carregável (`'demo-asset'` ou `'session-file'`); caso contrário, `source` é `null`.

```ts
export interface ModelSource {
  id: string;
  origin: 'demo-asset' | 'session-file';
  url: string;
  format: 'glb' | 'gltf';
  fileName: string;
  sizeLabel: string;
  scale?: string;
  embeddedGltfJson?: string;
  isFictiveStudy: boolean;
  fictiveDisclaimer: LocalizedText | null;
}
```

### 3.2 `ModelContext`
Metadados canónicos sincronizados com a Biblioteca de Projectos da Fase 03:

```ts
export interface ModelContext {
  projectId: string;
  projectCode: string;
  projectTitle: LocalizedText;
  projectSubtitle: LocalizedText;
  departmentId: DepartmentId;
  discipline: LocalizedText;
  studioBase: 'Maputo' | 'Milão';
  scale: string;
  areaSqm: string;
  elevationDatum: string;
  phase: LocalizedText;
  projectStatus: ProjectStatus;
  publicationStatus: PublicationStatus;
  isArchived: boolean;
  activeUserRole: Role;
  language: AppLanguage;
}
```

### 3.3 `ModelLoadState` e `ModelViewerCallbacks`

```ts
export type ModelLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface ModelViewerCallbacks {
  onModelLoaded: (metrics?: ModelLoadedMetrics) => void;
  onModelError: (message: string) => void;
  onBackToDossier: () => void;
  onSelectLocalFile: (file: File) => Promise<void> | void;
  onClearLocalFile: () => void;
  onSelectDemoAsset?: (demoAssetId: string) => void;
}
```

---

## 4. Regras de Validação e Limites Documentados

- **Limite máximo de ficheiro local:** `MAX_MODEL_FILE_SIZE_BYTES = 52_428_800` (**50 MB**). Ficheiros acima deste limite são recusados com `errorCode: 'FILE_TOO_LARGE'`.
- **Ficheiros vazios (`0 B`):** recusados com `errorCode: 'EMPTY_FILE'`.
- **Ficheiros `.skp`:** recusados para carregamento directo WebGL com `errorCode: 'NATIVE_SKP_UNSUPPORTED'` e explicação sobre exportação prévia para `.glb` / `.gltf`.
- **Extensões não suportadas:** recusadas com `errorCode: 'UNSUPPORTED_EXTENSION'`.
- **Validação binária `.glb`:** verifica os primeiros 12 bytes (`magic === 0x46546C67` `'glTF'`, `version === 2`, `declaredLength >= 12`); caso contrário, recusa com `errorCode: 'INVALID_GLB_HEADER'`.
- **Validação de manifesto `.gltf`:** verifica JSON válido (`INVALID_GLTF_JSON`), `asset.version` `2.x` e presença de `scenes`/`nodes`/`meshes` (`INVALID_GLTF_MANIFEST`), além de confirmar que todos os `buffers` e `images` têm URI `data:` incorporado ou recurso disponível (`GLTF_EXTERNAL_RESOURCES_MISSING` quando faltam `.bin` ou texturas externas).
