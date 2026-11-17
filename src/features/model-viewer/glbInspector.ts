import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type {
  ArchitecturalModelSource,
  LoadedModelTelemetry,
  ModelCameraPreset,
  ModelViewerErrorDetail,
} from './contracts';
import { DEFAULT_MAX_MODEL_FILE_SIZE_BYTES } from './demoModels';
import { getModelViewerDictionary } from './i18n';

const GLB_MAGIC = 0x46546c67; // 'glTF'
const GLB_JSON_CHUNK_TYPE = 0x4e4f534a; // 'JSON'

const ALLOWED_BUFFER_DATA_MIME_TYPES = new Set([
  'application/octet-stream',
  'application/gltf-buffer',
]);

const ALLOWED_IMAGE_DATA_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

let cachedWebGLSupport: boolean | null = null;

export function resetWebGLSupportCache(): void {
  cachedWebGLSupport = null;
}

export function detectWebGLSupport(
  override?: boolean,
  options?: { forceRecheck?: boolean },
): boolean {
  if (typeof override === 'boolean') {
    return override;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.userAgent === 'string' &&
    /jsdom/i.test(navigator.userAgent)
  ) {
    return false;
  }
  if (!options?.forceRecheck && cachedWebGLSupport !== null) {
    return cachedWebGLSupport;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    const supported = Boolean(gl);
    if (
      gl &&
      typeof (gl as WebGLRenderingContext).getExtension === 'function'
    ) {
      try {
        (gl as WebGLRenderingContext)
          .getExtension('WEBGL_lose_context')
          ?.loseContext();
      } catch {
        // Ignore loseContext errors on synthetic/restricted WebGL handles
      }
    }
    canvas.width = 0;
    canvas.height = 0;
    cachedWebGLSupport = supported;
    return supported;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

export function buildFormatErrorDetail(
  fileName: string,
  reason: 'skp' | 'generic',
): ModelViewerErrorDetail {
  const pt = getModelViewerDictionary('pt').states;
  const en = getModelViewerDictionary('en').states;
  return {
    status: 'error_format',
    fileName,
    title: {
      pt: pt.errorFormatTitle,
      en: en.errorFormatTitle,
    },
    message: {
      pt: reason === 'skp' ? pt.errorFormatSkpBody : pt.errorFormatGenericBody,
      en: reason === 'skp' ? en.errorFormatSkpBody : en.errorFormatGenericBody,
    },
    nextAction: {
      pt: pt.errorFormatNextAction,
      en: en.errorFormatNextAction,
    },
    technicalDetail:
      reason === 'skp'
        ? `Unsupported SketchUp source file (${fileName}). Export to .glb first.`
        : `Unsupported file extension for ${fileName}. Expected .glb or .gltf.`,
  };
}

export function buildInvalidModelErrorDetail(
  fileName: string,
  kind: 'corrupt' | 'missing_deps',
  technicalDetail?: string,
): ModelViewerErrorDetail {
  const pt = getModelViewerDictionary('pt').states;
  const en = getModelViewerDictionary('en').states;
  return {
    status: 'error_invalid',
    fileName,
    title: {
      pt: pt.errorInvalidTitle,
      en: en.errorInvalidTitle,
    },
    message: {
      pt:
        kind === 'missing_deps'
          ? pt.errorInvalidMissingDepsBody
          : pt.errorInvalidBody,
      en:
        kind === 'missing_deps'
          ? en.errorInvalidMissingDepsBody
          : en.errorInvalidBody,
    },
    nextAction: {
      pt: pt.errorInvalidNextAction,
      en: en.errorInvalidNextAction,
    },
    technicalDetail,
  };
}

export function buildTooLargeErrorDetail(
  fileName: string,
  fileSizeBytes: number,
  maxBytes: number,
): ModelViewerErrorDetail {
  const pt = getModelViewerDictionary('pt').states;
  const en = getModelViewerDictionary('en').states;
  const sizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(1);
  const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
  return {
    status: 'error_too_large',
    fileName,
    title: {
      pt: pt.errorTooLargeTitle,
      en: en.errorTooLargeTitle,
    },
    message: {
      pt: `${pt.errorTooLargeBody} (${sizeMb} MB > limite ${maxMb} MB).`,
      en: `${en.errorTooLargeBody} (${sizeMb} MB > ${maxMb} MB limit).`,
    },
    nextAction: {
      pt: pt.errorTooLargeNextAction,
      en: en.errorTooLargeNextAction,
    },
    technicalDetail: `${fileName}: ${fileSizeBytes} bytes exceeds ${maxBytes} bytes.`,
  };
}

export function buildWebGLUnavailableErrorDetail(
  technicalDetail?: string,
): ModelViewerErrorDetail {
  const pt = getModelViewerDictionary('pt').states;
  const en = getModelViewerDictionary('en').states;
  return {
    status: 'webgl_unavailable',
    title: {
      pt: pt.webglUnavailableTitle,
      en: en.webglUnavailableTitle,
    },
    message: {
      pt: pt.webglUnavailableBody,
      en: en.webglUnavailableBody,
    },
    nextAction: {
      pt: pt.webglUnavailableNextAction,
      en: en.webglUnavailableNextAction,
    },
    technicalDetail,
  };
}

export function validateLocalModelFileMetadata(
  file: { name: string; size: number },
  maxFileSizeBytes: number = DEFAULT_MAX_MODEL_FILE_SIZE_BYTES,
):
  | { valid: true; format: 'glb' | 'gltf' }
  | { valid: false; error: ModelViewerErrorDetail } {
  const trimmedName = file.name.trim();
  const lower = trimmedName.toLowerCase();

  if (lower.endsWith('.skp')) {
    return {
      valid: false,
      error: buildFormatErrorDetail(trimmedName, 'skp'),
    };
  }

  if (!lower.endsWith('.glb') && !lower.endsWith('.gltf')) {
    return {
      valid: false,
      error: buildFormatErrorDetail(trimmedName, 'generic'),
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: buildInvalidModelErrorDetail(
        trimmedName,
        'corrupt',
        'Empty file (0 bytes).',
      ),
    };
  }

  if (file.size > maxFileSizeBytes) {
    return {
      valid: false,
      error: buildTooLargeErrorDetail(trimmedName, file.size, maxFileSizeBytes),
    };
  }

  return {
    valid: true,
    format: lower.endsWith('.gltf') ? 'gltf' : 'glb',
  };
}

interface RawGltfJson {
  asset?: {
    version?: string;
    generator?: string;
    extras?: Record<string, unknown>;
  };
  buffers?: Array<{ uri?: string; byteLength?: number }>;
  images?: Array<{ uri?: string; bufferView?: number }>;
  meshes?: unknown[];
}

function hasAsciiControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

function extractDataUriMimeType(uri: string): string | null {
  if (hasAsciiControlChars(uri)) {
    return null;
  }
  const trimmed = uri.trim();
  const commaIdx = trimmed.indexOf(',');
  if (commaIdx === -1) {
    return null;
  }
  const header = trimmed.slice(5, commaIdx);
  const [rawMime = '', ...params] = header.split(';');
  const mime = rawMime.trim().toLowerCase();
  if (!mime) {
    return null;
  }
  for (const param of params) {
    const normalizedParam = param.trim().toLowerCase();
    if (!normalizedParam) {
      return null;
    }
    if (
      normalizedParam !== 'base64' &&
      !/^[a-z0-9.+-]+=[a-z0-9.+"_-]+$/i.test(normalizedParam)
    ) {
      return null;
    }
    if (/(?:svg|html|script|[<>])/i.test(normalizedParam)) {
      return null;
    }
  }
  return mime;
}

export function isAllowedEmbeddedDataUri(
  uri: string,
  kind: 'buffer' | 'image' | 'any' = 'any',
): boolean {
  const trimmed = uri.trim();
  if (!/^data:/i.test(trimmed)) {
    return false;
  }
  const mimeType = extractDataUriMimeType(trimmed);
  if (!mimeType) {
    return false;
  }
  if (kind === 'buffer') {
    return ALLOWED_BUFFER_DATA_MIME_TYPES.has(mimeType);
  }
  if (kind === 'image') {
    return ALLOWED_IMAGE_DATA_MIME_TYPES.has(mimeType);
  }
  return (
    ALLOWED_BUFFER_DATA_MIME_TYPES.has(mimeType) ||
    ALLOWED_IMAGE_DATA_MIME_TYPES.has(mimeType)
  );
}

interface UnauthorizedResourceUri {
  uri: string;
  kind: 'external' | 'disallowed_data_uri';
}

function findUnauthorizedResourceUri(
  json: RawGltfJson,
): UnauthorizedResourceUri | null {
  if (Array.isArray(json.buffers)) {
    for (const buf of json.buffers) {
      if (typeof buf?.uri === 'string') {
        const trimmed = buf.uri.trim();
        if (trimmed.length === 0) continue;
        if (/^data:/i.test(trimmed)) {
          if (!isAllowedEmbeddedDataUri(trimmed, 'buffer')) {
            return { uri: trimmed, kind: 'disallowed_data_uri' };
          }
        } else {
          return { uri: trimmed, kind: 'external' };
        }
      }
    }
  }
  if (Array.isArray(json.images)) {
    for (const img of json.images) {
      if (typeof img?.uri === 'string') {
        const trimmed = img.uri.trim();
        if (trimmed.length === 0) continue;
        if (/^data:/i.test(trimmed)) {
          if (!isAllowedEmbeddedDataUri(trimmed, 'image')) {
            return { uri: trimmed, kind: 'disallowed_data_uri' };
          }
        } else {
          return { uri: trimmed, kind: 'external' };
        }
      }
    }
  }
  return null;
}

function isAllowedInternalBlobUrl(url: string): boolean {
  if (!/^blob:/i.test(url)) {
    return false;
  }
  if (
    typeof window !== 'undefined' &&
    window.location &&
    typeof window.location.origin === 'string' &&
    window.location.origin !== 'null' &&
    window.location.origin.length > 0
  ) {
    return url
      .toLowerCase()
      .startsWith(`blob:${window.location.origin.toLowerCase()}`);
  }
  return true;
}

export function validateModelBufferContents(
  buffer: ArrayBuffer,
  format: 'glb' | 'gltf',
  fileName: string,
  origin: 'demo' | 'local_temporary' | 'project_reference' = 'local_temporary',
):
  | { valid: true; jsonHeader: RawGltfJson }
  | { valid: false; error: ModelViewerErrorDetail } {
  void origin;
  if (buffer.byteLength < 20) {
    return {
      valid: false,
      error: buildInvalidModelErrorDetail(
        fileName,
        'corrupt',
        `File too short (${buffer.byteLength} bytes).`,
      ),
    };
  }

  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);

  if (format === 'glb' || magic === GLB_MAGIC) {
    if (magic !== GLB_MAGIC) {
      return {
        valid: false,
        error: buildInvalidModelErrorDetail(
          fileName,
          'corrupt',
          'Missing binary glTF 2.0 magic header (0x46546C67).',
        ),
      };
    }

    const version = view.getUint32(4, true);
    const totalLength = view.getUint32(8, true);
    if (version !== 2 || totalLength !== buffer.byteLength || totalLength < 20) {
      return {
        valid: false,
        error: buildInvalidModelErrorDetail(
          fileName,
          'corrupt',
          `Invalid GLB header (version=${version}, length=${totalLength}, actual=${buffer.byteLength}).`,
        ),
      };
    }

    const jsonChunkLength = view.getUint32(12, true);
    const jsonChunkType = view.getUint32(16, true);
    if (
      jsonChunkType !== GLB_JSON_CHUNK_TYPE ||
      jsonChunkLength === 0 ||
      20 + jsonChunkLength > buffer.byteLength
    ) {
      return {
        valid: false,
        error: buildInvalidModelErrorDetail(
          fileName,
          'corrupt',
          'Invalid or truncated GLB JSON chunk.',
        ),
      };
    }

    try {
      const jsonBytes = new Uint8Array(buffer, 20, jsonChunkLength);
      const jsonText = new TextDecoder('utf-8').decode(jsonBytes);
      const parsed = JSON.parse(jsonText) as RawGltfJson;
      if (!parsed.asset || !String(parsed.asset.version ?? '').startsWith('2')) {
        return {
          valid: false,
          error: buildInvalidModelErrorDetail(
            fileName,
            'corrupt',
            'Unsupported glTF asset version.',
          ),
        };
      }
      const unauthorizedUri = findUnauthorizedResourceUri(parsed);
      if (unauthorizedUri) {
        return {
          valid: false,
          error: buildInvalidModelErrorDetail(
            fileName,
            unauthorizedUri.kind === 'external' ? 'missing_deps' : 'corrupt',
            unauthorizedUri.kind === 'external'
              ? `Unresolved external dependency URI: ${unauthorizedUri.uri}`
              : `Unauthorized embedded data URI MIME type: ${unauthorizedUri.uri.slice(0, 64)}`,
          ),
        };
      }
      return { valid: true, jsonHeader: parsed };
    } catch (err) {
      return {
        valid: false,
        error: buildInvalidModelErrorDetail(
          fileName,
          'corrupt',
          err instanceof Error ? err.message : 'Failed to parse GLB JSON chunk.',
        ),
      };
    }
  }

  // Self-contained .gltf JSON check
  try {
    const text = new TextDecoder('utf-8').decode(new Uint8Array(buffer));
    const parsed = JSON.parse(text) as RawGltfJson;
    if (!parsed.asset || !String(parsed.asset.version ?? '').startsWith('2')) {
      return {
        valid: false,
        error: buildInvalidModelErrorDetail(
          fileName,
          'corrupt',
          'Missing glTF 2.0 asset version.',
        ),
      };
    }
    const unauthorizedUri = findUnauthorizedResourceUri(parsed);
    if (unauthorizedUri) {
      return {
        valid: false,
        error: buildInvalidModelErrorDetail(
          fileName,
          unauthorizedUri.kind === 'external' ? 'missing_deps' : 'corrupt',
          unauthorizedUri.kind === 'external'
            ? `External resource "${unauthorizedUri.uri}" cannot be resolved from a single local .gltf file.`
            : `Unauthorized embedded data URI MIME type in .gltf: ${unauthorizedUri.uri.slice(0, 64)}`,
        ),
      };
    }
    return { valid: true, jsonHeader: parsed };
  } catch (err) {
    return {
      valid: false,
      error: buildInvalidModelErrorDetail(
        fileName,
        'corrupt',
        err instanceof Error ? err.message : 'Invalid JSON in .gltf file.',
      ),
    };
  }
}

export interface ParsedArchitecturalGlbResult {
  scene: THREE.Group;
  telemetry: LoadedModelTelemetry;
}

function normalizeDeclaredUnit(
  raw: unknown,
): 'm' | 'mm' | 'cm' | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase();
  if (v === 'm' || v === 'meter' || v === 'meters' || v === 'metro' || v === 'metros') {
    return 'm';
  }
  if (v === 'cm' || v === 'centimeter' || v === 'centimeters') {
    return 'cm';
  }
  if (v === 'mm' || v === 'millimeter' || v === 'millimeters') {
    return 'mm';
  }
  return null;
}

/**
 * Loads an ArrayBuffer through Three.js `GLTFLoader`, centers its geometry on the stage,
 * and computes reliable telemetry without inventing units when undeclared.
 */
export async function parseGlbSceneAndTelemetry(
  buffer: ArrayBuffer,
  source: ArchitecturalModelSource,
): Promise<ParsedArchitecturalGlbResult> {
  const precheck = validateModelBufferContents(
    buffer,
    source.format,
    source.fileName,
    source.origin,
  );
  if (!precheck.valid) {
    throw precheck.error;
  }

  const parseBuffer = (() => {
    if (buffer.byteLength >= 4 && new DataView(buffer).getUint32(0, true) === 0x46546c67) {
      return buffer;
    }
    const jsonHeader = precheck.jsonHeader;
    const firstBuffer = jsonHeader.buffers?.[0];
    const uri = firstBuffer?.uri?.trim() ?? '';
    const hasImageUri = (jsonHeader.images ?? []).some((img) =>
      Boolean(img.uri && img.uri.trim().length > 0),
    );
    const base64MarkerMatch = /;base64,/i.exec(uri);
    if (
      jsonHeader.buffers?.length === 1 &&
      !hasImageUri &&
      isAllowedEmbeddedDataUri(uri, 'buffer') &&
      base64MarkerMatch
    ) {
      try {
        const base64Payload = uri.slice(
          base64MarkerMatch.index + base64MarkerMatch[0].length,
        );
        const binaryString = atob(base64Payload);
        const rawBin = new Uint8Array(binaryString.length);
        for (let index = 0; index < binaryString.length; index += 1) {
          rawBin[index] = binaryString.charCodeAt(index);
        }
        const restBuffer: Record<string, unknown> = { ...firstBuffer, byteLength: rawBin.byteLength };
        delete restBuffer.uri;
        const normalizedJson = {
          ...jsonHeader,
          buffers: [restBuffer],
        };
        const jsonBytes = new TextEncoder().encode(JSON.stringify(normalizedJson));
        const jsonPad = (4 - (jsonBytes.byteLength % 4)) % 4;
        const paddedJsonLen = jsonBytes.byteLength + jsonPad;
        const binPad = (4 - (rawBin.byteLength % 4)) % 4;
        const paddedBinLen = rawBin.byteLength + binPad;
        const totalLength = 12 + 8 + paddedJsonLen + 8 + paddedBinLen;

        const glbOut = new ArrayBuffer(totalLength);
        const view = new DataView(glbOut);
        const outBytes = new Uint8Array(glbOut);

        view.setUint32(0, 0x46546c67, true);
        view.setUint32(4, 2, true);
        view.setUint32(8, totalLength, true);

        view.setUint32(12, paddedJsonLen, true);
        view.setUint32(16, 0x4e4f534a, true);
        outBytes.set(jsonBytes, 20);
        for (let padIndex = 0; padIndex < jsonPad; padIndex += 1) {
          outBytes[20 + jsonBytes.byteLength + padIndex] = 0x20;
        }

        const binChunkOffset = 20 + paddedJsonLen;
        view.setUint32(binChunkOffset, paddedBinLen, true);
        view.setUint32(binChunkOffset + 4, 0x004e4942, true);
        outBytes.set(rawBin, binChunkOffset + 8);
        return glbOut;
      } catch {
        return buffer;
      }
    }
    return buffer;
  })();

  let blockedExternalResourceUrl: string | null = null;
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    const trimmed = url.trim();
    if (trimmed.length === 0) {
      return url;
    }
    if (/^data:/i.test(trimmed)) {
      if (isAllowedEmbeddedDataUri(trimmed, 'any')) {
        return trimmed;
      }
      blockedExternalResourceUrl = trimmed;
      return 'data:application/octet-stream;base64,';
    }
    if (isAllowedInternalBlobUrl(trimmed)) {
      return trimmed;
    }
    blockedExternalResourceUrl = trimmed;
    return 'data:application/octet-stream;base64,';
  });

  const loader = new GLTFLoader(manager);
  let gltf: GLTF;
  try {
    gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.parse(parseBuffer, '', resolve, reject);
    });
  } catch (err) {
    if (blockedExternalResourceUrl) {
      throw buildInvalidModelErrorDetail(
        source.fileName,
        'missing_deps',
        `Blocked unauthorized external dependency URI: ${blockedExternalResourceUrl}`,
      );
    }
    throw buildInvalidModelErrorDetail(
      source.fileName,
      'corrupt',
      err instanceof Error ? err.message : 'GLTFLoader failed to parse buffer.',
    );
  }
  if (blockedExternalResourceUrl) {
    if (gltf?.scene) {
      disposeThreeObjectResources(gltf.scene);
    }
    throw buildInvalidModelErrorDetail(
      source.fileName,
      'missing_deps',
      `Blocked unauthorized external dependency URI: ${blockedExternalResourceUrl}`,
    );
  }

  const root = gltf.scene || (gltf.scenes && gltf.scenes[0]);
  if (!root) {
    throw buildInvalidModelErrorDetail(
      source.fileName,
      'corrupt',
      'glTF file contains no scene root.',
    );
  }

  root.updateMatrixWorld(true);

  let meshCount = 0;
  let vertexCount = 0;
  let triangleCount = 0;
  const materialSet = new Set<THREE.Material>();
  const nodeNames: string[] = [];

  root.traverse((obj) => {
    if (obj.name && !nodeNames.includes(obj.name)) {
      nodeNames.push(obj.name);
    }
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      meshCount += 1;
      const posAttr = mesh.geometry.getAttribute('position');
      if (posAttr) {
        vertexCount += posAttr.count;
      }
      if (mesh.geometry.index) {
        triangleCount += Math.floor(mesh.geometry.index.count / 3);
      } else if (posAttr) {
        triangleCount += Math.floor(posAttr.count / 3);
      }
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => materialSet.add(m));
      } else if (mesh.material) {
        materialSet.add(mesh.material);
      }
    }
  });

  if (meshCount === 0 || vertexCount === 0) {
    throw buildInvalidModelErrorDetail(
      source.fileName,
      'corrupt',
      'glTF scene contains 0 valid meshes.',
    );
  }

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // Center X and Z at 0, and place base min.y at 0 so model rests on the architectural datum plane
  const stageGroup = new THREE.Group();
  stageGroup.name = `OA_Stage_${source.code}`;
  root.position.set(
    root.position.x - center.x,
    root.position.y - box.min.y,
    root.position.z - center.z,
  );
  stageGroup.add(root);
  stageGroup.updateMatrixWorld(true);

  const sphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(stageGroup).getBoundingSphere(sphere);
  const boundingRadius =
    Number.isFinite(sphere.radius) && sphere.radius > 0.01
      ? sphere.radius
      : Math.max(size.x, size.y, size.z, 1) * 0.65;

  const assetExtras = precheck.jsonHeader.asset?.extras ?? {};
  const extrasUnit = normalizeDeclaredUnit(
    assetExtras.declaredUnit ?? assetExtras.unit ?? assetExtras.units,
  );
  const verifiedUnit = source.declaredUnit ?? extrasUnit ?? null;

  const extrasScale =
    typeof assetExtras.declaredScale === 'string' &&
    assetExtras.declaredScale.trim().length > 0
      ? assetExtras.declaredScale.trim()
      : null;
  const verifiedScale = source.declaredScale ?? extrasScale ?? null;

  return {
    scene: stageGroup,
    telemetry: {
      meshCount,
      vertexCount,
      triangleCount,
      materialCount: materialSet.size,
      nodeNames,
      dimensions: {
        width: Number(size.x.toFixed(2)),
        height: Number(size.y.toFixed(2)),
        depth: Number(size.z.toFixed(2)),
      },
      boundingRadius: Number(boundingRadius.toFixed(2)),
      verifiedUnit,
      verifiedScale,
      generatorTag: precheck.jsonHeader.asset?.generator,
    },
  };
}

export interface DisposalSummary {
  disposedGeometries: number;
  disposedMaterials: number;
  disposedTextures: number;
}

export function disposeThreeObjectResources(
  root: THREE.Object3D | null | undefined,
): DisposalSummary {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  if (!root) {
    return {
      disposedGeometries: 0,
      disposedMaterials: 0,
      disposedTextures: 0,
    };
  }

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      geometries.add(mesh.geometry);
    }
    const matList = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const mat of matList) {
      materials.add(mat);
      const record = mat as unknown as Record<string, unknown>;
      for (const value of Object.values(record)) {
        if (value && typeof value === 'object' && (value as THREE.Texture).isTexture) {
          textures.add(value as THREE.Texture);
        }
      }
    }
  });

  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());

  return {
    disposedGeometries: geometries.size,
    disposedMaterials: materials.size,
    disposedTextures: textures.size,
  };
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  near: number;
  far: number;
}

export function computeCameraPoseForPreset(
  preset: ModelCameraPreset,
  boundingRadius: number,
  modelHeight: number = boundingRadius * 0.6,
): CameraPose {
  const r = Math.max(boundingRadius, 1.5);
  const targetY = Number(Math.max(modelHeight * 0.35, 0.5).toFixed(2));
  const dist = r * 1.62;
  const near = Number(Math.max(0.05, r * 0.01).toFixed(3));
  const far = Number(Math.max(500, r * 25).toFixed(1));

  switch (preset) {
    case 'top':
      return {
        position: [0, Number((targetY + dist * 1.25).toFixed(2)), 0.01],
        target: [0, targetY, 0],
        up: [0, 0, -1],
        near,
        far,
      };
    case 'front':
      return {
        position: [
          0,
          Number((targetY + r * 0.22).toFixed(2)),
          Number((dist * 1.15).toFixed(2)),
        ],
        target: [0, targetY, 0],
        up: [0, 1, 0],
        near,
        far,
      };
    case 'side':
      return {
        position: [
          Number((dist * 1.15).toFixed(2)),
          Number((targetY + r * 0.22).toFixed(2)),
          0,
        ],
        target: [0, targetY, 0],
        up: [0, 1, 0],
        near,
        far,
      };
    case 'isometric':
    default:
      return {
        position: [
          Number((dist * 0.82).toFixed(2)),
          Number((targetY + dist * 0.64).toFixed(2)),
          Number((dist * 0.88).toFixed(2)),
        ],
        target: [0, targetY, 0],
        up: [0, 1, 0],
        near,
        far,
      };
  }
}

export function formatByteSize(bytes?: number): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
