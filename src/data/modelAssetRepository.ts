import {
  getProjectById,
  PROJECT_LIBRARY_STORAGE_KEY,
  PROJECT_LIBRARY_UPDATED_EVENT,
} from './projectLibraryRepository';
import type {
  CanonicalProjectRecord,
  ProjectFileReference,
} from './projectLibraryTypes';
import {
  MAX_MODEL_FILE_SIZE_BYTES,
  MAX_MODEL_FILE_SIZE_LABEL,
  type ClassifiedProjectFileItem,
  type DemoModelCatalogEntry,
  type ModelAvailabilityStatus,
  type ModelFileFormat,
  type ModelFileValidationFailure,
  type ModelFileValidationResult,
  type ResolvedProjectModelResolution,
  type ResolveProjectModelOptions,
  type SessionModelEntry,
} from './modelAssetTypes';

export const MODEL_ENGINE_UPDATED_EVENT = 'oa:model-engine-updated';

/**
 * Valid, self-contained glTF 2.0 JSON manifest with an embedded base64 binary buffer
 * representing a minimal architectural massing prism study.
 * Used in the demonstrative catalog to guarantee at least one complete, self-contained `.gltf`
 * example works without external `.bin` or texture dependencies.
 */
export const EMBEDDED_DEMO_GLTF_JSON = JSON.stringify(
  {
    asset: {
      version: '2.0',
      generator: 'O+A Workspace Phase 04 Model Engine (Fictive Study)',
      copyright: 'O+A Arquitectos e Planeadores — Demo Study Only',
      extras: {
        declaredUnit: 'm',
        declaredScale: '1:100',
      },
    },
    scene: 0,
    scenes: [
      {
        name: 'OA_Climate_Blocks_Study_Scene',
        nodes: [0],
      },
    ],
    nodes: [
      {
        name: 'OA_RammedEarth_Prism_Node',
        mesh: 0,
        translation: [0, 0, 0],
      },
    ],
    meshes: [
      {
        name: 'OA_RammedEarth_Prism_Mesh',
        primitives: [
          {
            attributes: {
              POSITION: 0,
            },
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: 'OA_Terracotta_Earth_Sample',
        pbrMetallicRoughness: {
          baseColorFactor: [0.651, 0.365, 0.29, 1.0],
          metallicFactor: 0.05,
          roughnessFactor: 0.85,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        min: [0, 0, 0],
        max: [6, 3.5, 4],
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 36,
        target: 34962,
      },
    ],
    buffers: [
      {
        byteLength: 36,
        uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAACwQAAAAAAAAIBAAAAAAAAAGEAAAAAA',
      },
    ],
  },
  null,
  2,
);

export const EMBEDDED_DEMO_GLTF_DATA_URI = `data:model/gltf+json;charset=utf-8,${encodeURIComponent(EMBEDDED_DEMO_GLTF_JSON)}`;

const DEFAULT_FICTIVE_STUDY_DISCLAIMER = {
  pt: 'Estudo volumétrico fictício de demonstração — não constitui representação geométrica autêntica nem executiva do projecto.',
  en: 'Fictive demonstrative massing study — does not constitute an authentic or executive geometric representation of the project.',
} as const;

/**
 * Category B — Local demonstrative 3D model catalog associated with fictive studio studies.
 * Points exclusively to real published `.glb` binaries in `/assets/models/` and self-contained `.gltf` 2.0 manifests.
 * Note: `sd-proj-oa-25-084`, `sd-proj-oa-26-119`, and newly created local projects intentionally have no default
 * entry here so the honest empty/document-only state is preserved and verifiable.
 */
export const DEMO_MODEL_CATALOG: readonly DemoModelCatalogEntry[] = [
  {
    id: 'demo-model-oa-26-101-glb',
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    code: 'MOD-OA-101-V3',
    fileName: 'oa-ponta-vermelha-pavilion-demo.glb',
    format: 'glb',
    assetPath: '/assets/models/oa-ponta-vermelha-pavilion-demo.glb',
    byteSize: 24116,
    declaredUnit: 'm',
    title: {
      pt: 'Maquete Volumétrica · Pátio e Galeria (Estudo Demo .glb)',
      en: 'Volumetric Maquette · Courtyard & Gallery (.glb Demo Study)',
    },
    studySummary: {
      pt: 'Estudo fictício de implantação 1:100 com pátio sombreado, pala perimetral em betão e núcleo de taipa.',
      en: 'Fictive 1:100 siting study with shaded courtyard, perimeter concrete canopy, and rammed-earth core.',
    },
    scale: '1:100',
    sizeHint: '24.1 KB (Estudo Demo)',
    category: 'demo-asset',
    isFictiveStudy: true,
    fictiveNotice: DEFAULT_FICTIVE_STUDY_DISCLAIMER,
  },
  {
    id: 'demo-model-oa-26-101-gltf',
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    code: 'MOD-OA-101-GLTF',
    fileName: 'oa-26-101-canopy-section-study.gltf',
    format: 'gltf',
    assetPath: EMBEDDED_DEMO_GLTF_DATA_URI,
    embeddedGltfJson: EMBEDDED_DEMO_GLTF_JSON,
    byteSize: EMBEDDED_DEMO_GLTF_JSON.length,
    declaredUnit: 'm',
    title: {
      pt: 'Prisma Esquemático de Brise-Soleil (Estudo Completo .gltf)',
      en: 'Brise-Soleil Schematic Prism (Complete .gltf Study)',
    },
    studySummary: {
      pt: 'Exemplo demonstrativo .gltf 2.0 completo com buffer binário base64 incorporado no manifesto.',
      en: 'Complete demonstrative .gltf 2.0 example with base64 binary buffer embedded in the manifest.',
    },
    scale: '1:100',
    sizeHint: '1.2 KB (.gltf autónomo)',
    category: 'demo-asset',
    isFictiveStudy: true,
    fictiveNotice: DEFAULT_FICTIVE_STUDY_DISCLAIMER,
  },
  {
    id: 'demo-model-oa-26-108-glb',
    projectId: 'sd-proj-oa-26-108',
    projectCode: 'OA-26-108',
    code: 'MOD-OA-108-V2',
    fileName: 'oa-costa-terraces-massing-demo.glb',
    format: 'glb',
    assetPath: '/assets/models/oa-costa-terraces-massing-demo.glb',
    byteSize: 13000,
    declaredUnit: 'm',
    title: {
      pt: 'Maquete Topográfica · Socalcos da Costa (Estudo Demo .glb)',
      en: 'Topographic Maquette · Coastal Terraces (.glb Demo Study)',
    },
    studySummary: {
      pt: 'Estudo territorial fictício 1:250 de retenção pluvial e percursos pedonais.',
      en: 'Fictive 1:250 territorial study of stormwater retention and pedestrian corridors.',
    },
    scale: '1:250',
    sizeHint: '13.0 KB (Estudo Demo)',
    category: 'demo-asset',
    isFictiveStudy: true,
    fictiveNotice: DEFAULT_FICTIVE_STUDY_DISCLAIMER,
  },
  {
    id: 'demo-model-oa-26-112-gltf',
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    code: 'MOD-OA-112-GLTF',
    fileName: 'oa-26-112-climate-blocks-sample.gltf',
    format: 'gltf',
    assetPath: EMBEDDED_DEMO_GLTF_DATA_URI,
    embeddedGltfJson: EMBEDDED_DEMO_GLTF_JSON,
    byteSize: EMBEDDED_DEMO_GLTF_JSON.length,
    declaredUnit: 'm',
    title: {
      pt: 'Amostra Volumétrica · Blocos de Terra Comprimida (.gltf Completo)',
      en: 'Volumetric Sample · Compressed Earth Blocks (Complete .gltf)',
    },
    studySummary: {
      pt: 'Modelo demonstrativo .gltf 2.0 com geometria e recursos totalmente incorporados para ensaio térmico fictício.',
      en: 'Demonstrative .gltf 2.0 model with fully embedded geometry and resources for fictive thermal testing.',
    },
    scale: '1:20',
    sizeHint: '1.2 KB (.gltf autónomo)',
    category: 'demo-asset',
    isFictiveStudy: true,
    fictiveNotice: DEFAULT_FICTIVE_STUDY_DISCLAIMER,
  },
];

/**
 * In-memory store for Category C (`session-file`) models selected during the current browser session.
 * Intentionally never serialized to `localStorage`, `sessionStorage`, or `IndexedDB`.
 */
const sessionModelsByProjectId = new Map<string, SessionModelEntry>();

function emitModelEngineUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(MODEL_ENGINE_UPDATED_EVENT));
}

export function isValidTemporaryObjectUrl(url: unknown): url is string {
  return (
    typeof url === 'string' &&
    url.trim().startsWith('blob:') &&
    url.trim().length > 5
  );
}

function revokeObjectUrlSafely(url: string): void {
  if (
    typeof URL !== 'undefined' &&
    typeof URL.revokeObjectURL === 'function' &&
    isValidTemporaryObjectUrl(url)
  ) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore environment-specific revoke errors
    }
  }
}

function createObjectUrlSafely(blob: Blob): string {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('Browser URL.createObjectURL API is unavailable.');
  }
  const created = URL.createObjectURL(blob);
  if (!isValidTemporaryObjectUrl(created)) {
    throw new Error(
      'URL.createObjectURL returned an invalid temporary blob: URL.',
    );
  }
  return created;
}

// Automatically clear and revoke all temporary session ObjectURLs when the global demo reset clears localStorage
if (typeof window !== 'undefined') {
  window.addEventListener(PROJECT_LIBRARY_UPDATED_EVENT, () => {
    try {
      if (window.localStorage.getItem(PROJECT_LIBRARY_STORAGE_KEY) === null) {
        clearAllSessionModels();
      }
    } catch {
      // Ignore storage access errors
    }
  });
}

export function formatModelByteSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function extractNormalizedExtension(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot < 0 || lastDot === trimmed.length - 1) {
    return '';
  }
  return trimmed.slice(lastDot + 1);
}

export function detectModelFormatFromName(fileName: string): ModelFileFormat {
  const ext = extractNormalizedExtension(fileName);
  if (ext === 'glb') {
    return 'glb';
  }
  if (ext === 'gltf') {
    return 'gltf';
  }
  if (ext === 'skp') {
    return 'skp';
  }
  return 'unsupported';
}

/**
 * Validates the 20-byte binary glTF 2.0 (`.glb`) header and first JSON chunk header:
 * - magic === 0x46546C67 ('glTF' in ASCII little-endian)
 * - version === 2
 * - declared total length >= 20 and matches expectedTotalByteLength (when provided)
 * - first chunk type === 0x4E4F534A ('JSON') and 20 + jsonChunkLength <= declaredLength
 */
export function validateGlbHeaderBytes(
  bytes: ArrayBuffer,
  expectedTotalByteLength?: number,
): boolean {
  if (bytes.byteLength < 20) {
    return false;
  }
  const view = new DataView(bytes);
  const magic = view.getUint32(0, true);
  const version = view.getUint32(4, true);
  const declaredLength = view.getUint32(8, true);
  if (magic !== 0x46546c67 || version !== 2 || declaredLength < 20) {
    return false;
  }
  if (
    expectedTotalByteLength !== undefined &&
    declaredLength !== expectedTotalByteLength
  ) {
    return false;
  }
  if (
    expectedTotalByteLength === undefined &&
    declaredLength < bytes.byteLength
  ) {
    return false;
  }
  const jsonChunkLength = view.getUint32(12, true);
  const jsonChunkType = view.getUint32(16, true);
  if (
    jsonChunkType !== 0x4e4f534a ||
    jsonChunkLength === 0 ||
    20 + jsonChunkLength > declaredLength
  ) {
    return false;
  }
  return true;
}

export interface GltfManifestValidationCheck {
  ok: boolean;
  errorCode?:
    | 'INVALID_GLTF_JSON'
    | 'INVALID_GLTF_MANIFEST'
    | 'GLTF_EXTERNAL_RESOURCES_MISSING';
  missingExternalResources?: string[];
  embeddedResourcesVerified?: boolean;
}

/**
 * Validates a `.gltf` JSON manifest and checks that all referenced `buffers` and `images`
 * either use embedded `data:` URIs or exist in `availableResourceNames`.
 */
export function validateGltfManifestText(
  rawText: string,
  availableResourceNames?: ReadonlySet<string>,
): GltfManifestValidationCheck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      errorCode: 'INVALID_GLTF_JSON',
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      ok: false,
      errorCode: 'INVALID_GLTF_MANIFEST',
    };
  }

  const record = parsed as Record<string, unknown>;
  const asset = record.asset;
  if (
    typeof asset !== 'object' ||
    asset === null ||
    Array.isArray(asset) ||
    typeof (asset as Record<string, unknown>).version !== 'string' ||
    !/^2\.\d+/.test(((asset as Record<string, unknown>).version as string).trim())
  ) {
    return {
      ok: false,
      errorCode: 'INVALID_GLTF_MANIFEST',
    };
  }

  const hasScenes = Array.isArray(record.scenes) && record.scenes.length > 0;
  const hasNodes = Array.isArray(record.nodes) && record.nodes.length > 0;
  const hasMeshes = Array.isArray(record.meshes) && record.meshes.length > 0;

  if (!hasScenes && !hasNodes && !hasMeshes) {
    return {
      ok: false,
      errorCode: 'INVALID_GLTF_MANIFEST',
    };
  }

  const missingExternal: string[] = [];
  const checkResourceList = (items: unknown) => {
    if (!Array.isArray(items)) {
      return;
    }
    for (const item of items) {
      if (typeof item !== 'object' || item === null) {
        continue;
      }
      const uri = (item as Record<string, unknown>).uri;
      if (typeof uri !== 'string' || uri.trim().length === 0) {
        continue;
      }
      const trimmedUri = uri.trim();
      if (trimmedUri.startsWith('data:')) {
        continue;
      }
      if (
        /^(?:https?:|\/\/|ftp:|javascript:|file:|blob:)/i.test(trimmedUri) ||
        trimmedUri.includes('..')
      ) {
        missingExternal.push(trimmedUri);
        continue;
      }
      const normalizedName = trimmedUri.replace(/^\.?\//, '').toLowerCase();
      if (
        availableResourceNames &&
        (availableResourceNames.has(trimmedUri) ||
          availableResourceNames.has(normalizedName))
      ) {
        continue;
      }
      missingExternal.push(trimmedUri);
    }
  };

  checkResourceList(record.buffers);
  checkResourceList(record.images);

  if (missingExternal.length > 0) {
    return {
      ok: false,
      errorCode: 'GLTF_EXTERNAL_RESOURCES_MISSING',
      missingExternalResources: missingExternal,
    };
  }

  return {
    ok: true,
    embeddedResourcesVerified: true,
  };
}

async function readFileHeaderBytes(
  file: Pick<Blob, 'slice'>,
  byteCount: number,
): Promise<ArrayBuffer> {
  const slice = file.slice(0, byteCount);
  if (typeof slice.arrayBuffer === 'function') {
    return slice.arrayBuffer();
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read binary slice'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsArrayBuffer(slice);
  });
}

async function readFullFileArrayBuffer(
  file: Pick<Blob, 'slice' | 'arrayBuffer'>,
): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return readFileHeaderBytes(file, Number.MAX_SAFE_INTEGER);
}

async function readFileTextContent(
  file: Pick<Blob, 'text' | 'slice'>,
): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }
  const fullSlice = file.slice(0);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsText(fullSlice);
  });
}

/**
 * Validates a user-selected file for Phase 04 Web 3D preview.
 * Enforces size limits, rejects empty files, explains `.skp` non-WebGL nature,
 * verifies `.glb` binary magic header + declared length, and verifies `.gltf` manifest & resource completeness.
 */
export async function validateModelFileSelection(
  file: Pick<File, 'name' | 'size' | 'slice' | 'text' | 'arrayBuffer'>,
  availableResourceNames?: ReadonlySet<string>,
): Promise<ModelFileValidationResult> {
  const fileName = file.name.trim();
  const byteSize = file.size;
  const detectedFormat = detectModelFormatFromName(fileName);

  if (detectedFormat === 'skp') {
    return {
      ok: false,
      errorCode: 'NATIVE_SKP_UNSUPPORTED',
      detectedFormat: 'skp',
      fileName,
      byteSize,
      message: {
        pt: `O ficheiro "${fileName}" é um modelo nativo SketchUp (.skp). Nesta fase mantém-se como referência documental sem conversão automática para WebGL. Exporte previamente para .glb ou .gltf autónomo para pré-visualizar em 3D.`,
        en: `The file "${fileName}" is a native SketchUp model (.skp). In this phase it remains a document reference without automatic WebGL conversion. Export to .glb or self-contained .gltf first to preview in 3D.`,
      },
    };
  }

  if (detectedFormat === 'unsupported') {
    const ext = extractNormalizedExtension(fileName) || 'sem extensão';
    return {
      ok: false,
      errorCode: 'UNSUPPORTED_EXTENSION',
      detectedFormat: 'unsupported',
      fileName,
      byteSize,
      message: {
        pt: `Formato não suportado (.${ext}). Seleccione um ficheiro binário .glb ou um manifesto .gltf 2.0 com recursos incorporados.`,
        en: `Unsupported format (.${ext}). Select a binary .glb file or a .gltf 2.0 manifest with embedded resources.`,
      },
    };
  }

  if (byteSize <= 0) {
    return {
      ok: false,
      errorCode: 'EMPTY_FILE',
      detectedFormat,
      fileName,
      byteSize,
      message: {
        pt: `O ficheiro "${fileName}" está vazio (0 B) e não contém geometria 3D válida.`,
        en: `The file "${fileName}" is empty (0 B) and contains no valid 3D geometry.`,
      },
    };
  }

  if (byteSize > MAX_MODEL_FILE_SIZE_BYTES) {
    return {
      ok: false,
      errorCode: 'FILE_TOO_LARGE',
      detectedFormat,
      fileName,
      byteSize,
      message: {
        pt: `O ficheiro "${fileName}" (${formatModelByteSize(byteSize)}) excede o limite máximo documentado de ${MAX_MODEL_FILE_SIZE_LABEL} para pré-visualização local no navegador.`,
        en: `The file "${fileName}" (${formatModelByteSize(byteSize)}) exceeds the documented ${MAX_MODEL_FILE_SIZE_LABEL} maximum limit for local browser preview.`,
      },
    };
  }

  if (detectedFormat === 'glb') {
    try {
      const headerBuffer = await readFileHeaderBytes(file, 20);
      if (!validateGlbHeaderBytes(headerBuffer, byteSize)) {
        return {
          ok: false,
          errorCode: 'INVALID_GLB_HEADER',
          detectedFormat: 'glb',
          fileName,
          byteSize,
          message: {
            pt: `O ficheiro "${fileName}" não apresenta um cabeçalho binário glTF 2.0 (.glb) válido ou o comprimento declarado não coincide com o ficheiro.`,
            en: `The file "${fileName}" does not contain a valid glTF 2.0 (.glb) binary header or its declared length does not match the file size.`,
          },
        };
      }
    } catch {
      return {
        ok: false,
        errorCode: 'INVALID_GLB_HEADER',
        detectedFormat: 'glb',
        fileName,
        byteSize,
        message: {
          pt: `Não foi possível ler o cabeçalho binário do ficheiro "${fileName}".`,
          en: `Could not read the binary header of "${fileName}".`,
        },
      };
    }

    return {
      ok: true,
      detectedFormat: 'glb',
      fileName,
      byteSize,
      sizeLabel: formatModelByteSize(byteSize),
      embeddedResourcesVerified: true,
    };
  }

  // .gltf validation
  let rawText = '';
  try {
    rawText = await readFileTextContent(file);
  } catch {
    return {
      ok: false,
      errorCode: 'INVALID_GLTF_JSON',
      detectedFormat: 'gltf',
      fileName,
      byteSize,
      message: {
        pt: `Não foi possível ler o conteúdo JSON do ficheiro "${fileName}".`,
        en: `Could not read the JSON content of "${fileName}".`,
      },
    };
  }

  const manifestCheck = validateGltfManifestText(rawText, availableResourceNames);
  if (!manifestCheck.ok) {
    if (manifestCheck.errorCode === 'GLTF_EXTERNAL_RESOURCES_MISSING') {
      const missingList = (manifestCheck.missingExternalResources ?? []).join(', ');
      return {
        ok: false,
        errorCode: 'GLTF_EXTERNAL_RESOURCES_MISSING',
        detectedFormat: 'gltf',
        fileName,
        byteSize,
        missingExternalResources: manifestCheck.missingExternalResources,
        message: {
          pt: `O manifesto "${fileName}" referencia recursos externos não incorporados (${missingList}). Para pré-visualização local dum único ficheiro, exporte como .glb binário ou .gltf com buffers/texturas incorporados (data:).`,
          en: `The manifest "${fileName}" references unbundled external resources (${missingList}). For single-file local preview, export as a binary .glb or a .gltf with embedded buffers/textures (data:).`,
        },
      };
    }

    return {
      ok: false,
      errorCode: manifestCheck.errorCode ?? 'INVALID_GLTF_MANIFEST',
      detectedFormat: 'gltf',
      fileName,
      byteSize,
      message: {
        pt: `O ficheiro "${fileName}" não é um manifesto glTF 2.0 válido (verifique "asset.version": "2.0" e a estrutura de cena/malha).`,
        en: `The file "${fileName}" is not a valid glTF 2.0 manifest (check "asset.version": "2.0" and scene/mesh structure).`,
      },
    };
  }

  return {
    ok: true,
    detectedFormat: 'gltf',
    fileName,
    byteSize,
    sizeLabel: formatModelByteSize(byteSize),
    embeddedResourcesVerified: true,
  };
}

/**
 * Helper to create a valid binary `.glb` ArrayBuffer with a complete 1-triangle (3-vertex)
 * 3D architectural massing mesh so both header validation and Three.js `GLTFLoader` succeed.
 */
export function createMinimalValidGlbBytes(): Uint8Array<ArrayBuffer> {
  const positions = new Float32Array([0, 0, 0, 4, 0, 0, 0, 3, 2]);
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  const indices = new Uint16Array([0, 1, 2, 0]); // 6 bytes + 2 pad = 8 bytes
  const binChunkLength =
    positions.byteLength + normals.byteLength + indices.byteLength; // 36 + 36 + 8 = 80 bytes

  const jsonChunk = new TextEncoder().encode(
    JSON.stringify({
      asset: { version: '2.0', generator: 'OAWorkspaceMinimalGlb' },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ name: 'OA_Local_Study_Prism', mesh: 0 }],
      meshes: [
        {
          primitives: [
            {
              attributes: { POSITION: 0, NORMAL: 1 },
              indices: 2,
            },
          ],
        },
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 3,
          type: 'VEC3',
          min: [0, 0, 0],
          max: [4, 3, 2],
        },
        {
          bufferView: 1,
          componentType: 5126,
          count: 3,
          type: 'VEC3',
          min: [0, 0, 1],
          max: [0, 0, 1],
        },
        {
          bufferView: 2,
          componentType: 5123,
          count: 3,
          type: 'SCALAR',
          min: [0],
          max: [2],
        },
      ],
      bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
        { buffer: 0, byteOffset: 36, byteLength: 36, target: 34962 },
        { buffer: 0, byteOffset: 72, byteLength: 6, target: 34963 },
      ],
      buffers: [{ byteLength: binChunkLength }],
    }),
  );
  const paddedJsonLength = Math.ceil(jsonChunk.byteLength / 4) * 4;
  const totalLength = 12 + 8 + paddedJsonLength + 8 + binChunkLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);
  // Header: magic 'glTF', version 2, totalLength
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);
  // JSON chunk header: chunkLength, chunkType 'JSON' (0x4E4F534A)
  view.setUint32(12, paddedJsonLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  const bytes = new Uint8Array(buffer);
  bytes.set(jsonChunk, 20);
  for (let i = 20 + jsonChunk.byteLength; i < 20 + paddedJsonLength; i++) {
    bytes[i] = 0x20; // space padding per glTF 2.0 spec
  }
  // BIN chunk header: chunkLength, chunkType 'BIN\0' (0x004E4942)
  const binHeaderOffset = 20 + paddedJsonLength;
  view.setUint32(binHeaderOffset, binChunkLength, true);
  view.setUint32(binHeaderOffset + 4, 0x004e4942, true);
  const binOffset = binHeaderOffset + 8;
  bytes.set(new Uint8Array(positions.buffer), binOffset);
  bytes.set(new Uint8Array(normals.buffer), binOffset + 36);
  bytes.set(new Uint8Array(indices.buffer), binOffset + 72);
  return bytes;
}

export function listDemoModelsForProject(
  projectId: string,
): DemoModelCatalogEntry[] {
  return DEMO_MODEL_CATALOG.filter((entry) => entry.projectId === projectId);
}

export function getDemoModelById(
  demoAssetId: string,
): DemoModelCatalogEntry | null {
  return (
    DEMO_MODEL_CATALOG.find((entry) => entry.id === demoAssetId) ?? null
  );
}

export function getSessionModelForProject(
  projectId: string,
): SessionModelEntry | null {
  return sessionModelsByProjectId.get(projectId) ?? null;
}

/**
 * Validates and registers a temporary local `.glb` / `.gltf` file for `projectId` in the current session.
 * Automatically revokes any previous `ObjectURL` associated with `projectId`.
 */
export async function selectSessionModelFile(
  projectId: string,
  file: File,
  availableResourceNames?: ReadonlySet<string>,
): Promise<{ ok: true; entry: SessionModelEntry } | ModelFileValidationFailure> {
  const validation = await validateModelFileSelection(
    file,
    availableResourceNames,
  );
  if (!validation.ok) {
    return validation;
  }

  let arrayBuffer: ArrayBuffer;
  let objectUrl: string;
  try {
    arrayBuffer = await readFullFileArrayBuffer(file);
    objectUrl = createObjectUrlSafely(file);
  } catch {
    return {
      ok: false,
      errorCode: 'INVALID_GLB_HEADER',
      detectedFormat: validation.detectedFormat,
      fileName: validation.fileName,
      byteSize: validation.byteSize,
      message: {
        pt: `Não foi possível criar um ObjectURL temporário válido na sessão para "${validation.fileName}".`,
        en: `Could not create a valid temporary session ObjectURL for "${validation.fileName}".`,
      },
    };
  }

  const previous = sessionModelsByProjectId.get(projectId);
  if (previous) {
    revokeObjectUrlSafely(previous.objectUrl);
  }

  const entry: SessionModelEntry = {
    id: `session-model-${projectId}-${Date.now()}`,
    projectId,
    fileName: validation.fileName,
    format: validation.detectedFormat,
    byteSize: validation.byteSize,
    sizeLabel: validation.sizeLabel,
    objectUrl,
    arrayBuffer,
    selectedAtIso: new Date().toISOString(),
    category: 'session-file',
  };

  sessionModelsByProjectId.set(projectId, entry);
  emitModelEngineUpdated();

  return {
    ok: true,
    entry,
  };
}

/**
 * Revokes the temporary `ObjectURL` and clears the session model for `projectId`.
 */
export function clearSessionModelForProject(projectId: string): boolean {
  const existing = sessionModelsByProjectId.get(projectId);
  if (!existing) {
    return false;
  }
  revokeObjectUrlSafely(existing.objectUrl);
  sessionModelsByProjectId.delete(projectId);
  emitModelEngineUpdated();
  return true;
}

/**
 * Revokes all active temporary `ObjectURL`s across all projects and clears the session store.
 */
export function clearAllSessionModels(): number {
  let count = 0;
  for (const entry of sessionModelsByProjectId.values()) {
    revokeObjectUrlSafely(entry.objectUrl);
    count += 1;
  }
  sessionModelsByProjectId.clear();
  if (count > 0) {
    emitModelEngineUpdated();
  }
  return count;
}

export function subscribeModelEngineChanges(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(MODEL_ENGINE_UPDATED_EVENT, listener);
  window.addEventListener(PROJECT_LIBRARY_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(MODEL_ENGINE_UPDATED_EVENT, listener);
    window.removeEventListener(PROJECT_LIBRARY_UPDATED_EVENT, listener);
  };
}

/**
 * Classifies a dossier `ProjectFileReference` under Category A (`document-reference`),
 * distinguishing native `.skp` records from metadata-only `.glb`/`.gltf` references
 * and general sheets (`.pdf`/`.dwg`).
 */
export function classifyProjectFileReference(
  reference: ProjectFileReference,
): ClassifiedProjectFileItem {
  const ext = extractNormalizedExtension(reference.fileName);
  const isNativeSkp =
    ext === 'skp' || reference.kind === 'source_skp';
  const isWeb3DFormat =
    !isNativeSkp &&
    (ext === 'glb' || ext === 'gltf' || reference.kind === 'model_3d');

  let detectedFormat: ClassifiedProjectFileItem['detectedFormat'] = 'unsupported';
  if (isNativeSkp) {
    detectedFormat = 'skp';
  } else if (ext === 'glb' || (isWeb3DFormat && ext !== 'gltf')) {
    detectedFormat = 'glb';
  } else if (ext === 'gltf') {
    detectedFormat = 'gltf';
  } else if (ext === 'pdf' || ext === 'dwg' || ext === 'webp' || ext === 'xlsx') {
    detectedFormat = ext;
  }

  if (isNativeSkp) {
    return {
      reference,
      category: 'document-reference',
      detectedFormat: 'skp',
      isWeb3DFormat: false,
      isNativeSkp: true,
      isLoadableBinaryPresent: false,
      availabilityStatus: 'unsupported-skp',
      honestStatusLabel: {
        pt: 'Referência documental .skp (sem WebGL directo)',
        en: 'Documentary .skp reference (no direct WebGL)',
      },
      honestExplanation: {
        pt: 'Ficheiro nativo SketchUp registado apenas como metadado documental. Não pode ser carregado directamente em WebGL nem possui conversão automática nesta fase.',
        en: 'Native SketchUp file registered solely as documentary metadata. Cannot be loaded directly into WebGL and has no automatic conversion in this phase.',
      },
    };
  }

  if (isWeb3DFormat) {
    return {
      reference,
      category: 'document-reference',
      detectedFormat: detectedFormat === 'gltf' ? 'gltf' : 'glb',
      isWeb3DFormat: true,
      isNativeSkp: false,
      isLoadableBinaryPresent: false,
      availabilityStatus: 'metadata-only',
      honestStatusLabel: {
        pt: 'Registo documental (apenas metadados — sem binário no browser)',
        en: 'Document record (metadata only — no binary in browser)',
      },
      honestExplanation: {
        pt: 'Este registo no dossier documenta a referência técnica do ficheiro, mas não armazena o binário 3D no navegador. Para visualizar, seleccione um ficheiro .glb/.gltf local na sessão ou abra um estudo demonstrativo associado.',
        en: 'This dossier entry documents the technical file reference, but does not store the 3D binary in the browser. To preview, select a local .glb/.gltf file in the session or open an associated demonstrative study.',
      },
    };
  }

  return {
    reference,
    category: 'document-reference',
    detectedFormat,
    isWeb3DFormat: false,
    isNativeSkp: false,
    isLoadableBinaryPresent: false,
    availabilityStatus: 'metadata-only',
    honestStatusLabel: {
      pt: 'Peça documental (metadados)',
      en: 'Documentary sheet (metadata)',
    },
    honestExplanation: {
      pt: 'Registo documental técnico do dossier sem payload binário armazenado.',
      en: 'Technical documentary dossier record without stored binary payload.',
    },
  };
}

/**
 * Resolves the complete 3D model state for a `CanonicalProjectRecord`, keeping Categories A, B, and C strictly separated.
 */
export function resolveProjectModelState(
  record: CanonicalProjectRecord,
  options: ResolveProjectModelOptions = {},
): ResolvedProjectModelResolution {
  const projectId = record.identity.id;
  const isProjectArchived =
    record.metadata.isArchived || record.lifecycle.projectStatus === 'archived';

  const classifiedFiles = record.files.map(classifyProjectFileReference);
  const skpReferences = classifiedFiles.filter((item) => item.isNativeSkp);
  const metadataOnly3DReferences = classifiedFiles.filter(
    (item) => item.isWeb3DFormat,
  );

  const availableDemoAssets = listDemoModelsForProject(projectId);
  const sessionModel = getSessionModelForProject(projectId);

  let activeDemoAsset: DemoModelCatalogEntry | null = null;
  if (!options.ignoreDemoAsset && availableDemoAssets.length > 0) {
    if (options.preferredDemoAssetId) {
      activeDemoAsset =
        availableDemoAssets.find(
          (item) => item.id === options.preferredDemoAssetId,
        ) ?? availableDemoAssets[0];
    } else {
      activeDemoAsset = availableDemoAssets[0];
    }
  }

  const lastFailure = options.lastValidationFailure ?? null;

  // Priority 1: Active Session File (Category C)
  if (sessionModel) {
    return {
      projectId,
      projectCode: record.identity.code,
      projectTitle: record.editorial.title,
      departmentId: record.classification.departmentId,
      studioBase: record.location.studioBase,
      projectStatus: record.lifecycle.projectStatus,
      publicationStatus: record.publication.publicationStatus,
      isProjectArchived,
      hasLoadableModel: true,
      origin: 'session-file',
      category: 'session-file',
      fileName: sessionModel.fileName,
      format: sessionModel.format,
      availabilityStatus: 'available',
      url: sessionModel.objectUrl,
      isFictiveStudy: false,
      fictiveDisclaimer: null,
      statusMessage: {
        pt: `Modelo local "${sessionModel.fileName}" (${sessionModel.sizeLabel}) activo apenas nesta sessão do navegador. Não persiste após recarregar a página.`,
        en: `Local model "${sessionModel.fileName}" (${sessionModel.sizeLabel}) active only in this browser session. Does not persist after page reload.`,
      },
      errorMessage: lastFailure ? lastFailure.message : null,
      validationErrorCode: lastFailure ? lastFailure.errorCode : null,
      activeDemoAsset,
      availableDemoAssets,
      sessionModel,
      classifiedFiles,
      skpReferences,
      metadataOnly3DReferences,
    };
  }

  // Priority 2: Available Demonstrative Study Asset (Category B)
  if (activeDemoAsset) {
    return {
      projectId,
      projectCode: record.identity.code,
      projectTitle: record.editorial.title,
      departmentId: record.classification.departmentId,
      studioBase: record.location.studioBase,
      projectStatus: record.lifecycle.projectStatus,
      publicationStatus: record.publication.publicationStatus,
      isProjectArchived,
      hasLoadableModel: true,
      origin: 'demo-asset',
      category: 'demo-asset',
      fileName: activeDemoAsset.fileName,
      format: activeDemoAsset.format,
      availabilityStatus: 'available',
      url: activeDemoAsset.assetPath,
      isFictiveStudy: true,
      fictiveDisclaimer: activeDemoAsset.fictiveNotice,
      statusMessage: {
        pt: `Estudo demonstrativo fictício "${activeDemoAsset.fileName}" (.${activeDemoAsset.format}) disponível nos assets locais do Workspace.`,
        en: `Fictive demonstrative study "${activeDemoAsset.fileName}" (.${activeDemoAsset.format}) available in local Workspace assets.`,
      },
      errorMessage: lastFailure ? lastFailure.message : null,
      validationErrorCode: lastFailure ? lastFailure.errorCode : null,
      activeDemoAsset,
      availableDemoAssets,
      sessionModel: null,
      classifiedFiles,
      skpReferences,
      metadataOnly3DReferences,
    };
  }

  // Priority 3: Only documentary references (.glb/.gltf metadata-only or .skp) or completely empty
  let availabilityStatus: ModelAvailabilityStatus = 'unavailable';
  let origin: ResolvedProjectModelResolution['origin'] = 'none';
  let category: ResolvedProjectModelResolution['category'] = 'none';
  let fileName: string | null = null;
  let format: ModelFileFormat | null = null;
  let statusMessage = {
    pt: 'Nenhum modelo 3D carregável (.glb / .gltf) está associado a este projecto. Pode seleccionar um ficheiro .glb ou .gltf local para pré-visualização temporária nesta sessão.',
    en: 'No loadable 3D model (.glb / .gltf) is associated with this project. You may select a local .glb or .gltf file for temporary preview in this session.',
  };

  if (lastFailure) {
    availabilityStatus = 'invalid-file';
    fileName = lastFailure.fileName;
    format = lastFailure.detectedFormat;
    statusMessage = lastFailure.message;
  } else if (metadataOnly3DReferences.length > 0) {
    const first3DRef = metadataOnly3DReferences[0];
    availabilityStatus = 'metadata-only';
    origin = 'document-reference';
    category = 'document-reference';
    fileName = first3DRef.reference.fileName;
    format = first3DRef.detectedFormat === 'gltf' ? 'gltf' : 'glb';
    statusMessage = {
      pt: `O dossier regista a referência documental "${first3DRef.reference.fileName}", mas apenas os metadados existem no navegador (sem ficheiro binário). Seleccione um ficheiro .glb / .gltf local para o pré-visualizar na sessão.`,
      en: `The dossier records the documentary reference "${first3DRef.reference.fileName}", but only metadata exists in the browser (no binary file). Select a local .glb / .gltf file to preview it in the session.`,
    };
  } else if (skpReferences.length > 0) {
    const firstSkp = skpReferences[0];
    availabilityStatus = 'unsupported-skp';
    origin = 'document-reference';
    category = 'document-reference';
    fileName = firstSkp.reference.fileName;
    format = 'skp';
    statusMessage = {
      pt: `O dossier inclui a referência SketchUp "${firstSkp.reference.fileName}" (.skp). Ficheiros .skp são referências documentais de autoria e não podem ser carregados directamente em WebGL. Seleccione um ficheiro .glb ou .gltf local para pré-visualizar.`,
      en: `The dossier includes the SketchUp reference "${firstSkp.reference.fileName}" (.skp). Native .skp files are authoring document references and cannot be loaded directly into WebGL. Select a local .glb or .gltf file to preview.`,
    };
  }

  return {
    projectId,
    projectCode: record.identity.code,
    projectTitle: record.editorial.title,
    departmentId: record.classification.departmentId,
    studioBase: record.location.studioBase,
    projectStatus: record.lifecycle.projectStatus,
    publicationStatus: record.publication.publicationStatus,
    isProjectArchived,
    hasLoadableModel: false,
    origin,
    category,
    fileName,
    format,
    availabilityStatus,
    url: null,
    isFictiveStudy: false,
    fictiveDisclaimer: null,
    statusMessage,
    errorMessage: lastFailure ? lastFailure.message : null,
    validationErrorCode: lastFailure ? lastFailure.errorCode : null,
    activeDemoAsset: null,
    availableDemoAssets,
    sessionModel: null,
    classifiedFiles,
    skpReferences,
    metadataOnly3DReferences,
  };
}

export function resolveProjectModelById(
  projectId: string | undefined,
  options: ResolveProjectModelOptions = {},
): {
  project: CanonicalProjectRecord | null;
  resolution: ResolvedProjectModelResolution | null;
} {
  const project = getProjectById(projectId);
  if (!project) {
    return { project: null, resolution: null };
  }
  return {
    project,
    resolution: resolveProjectModelState(project, options),
  };
}
