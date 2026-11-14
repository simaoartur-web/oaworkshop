import type {
  CanonicalProjectRecord,
  ProjectFileReference,
  ProjectStudioBase,
} from './projectLibraryTypes';
import type {
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
} from './types';

/**
 * Maximum file size accepted for local temporary 3D model preview in the browser session:
 * 50 MB (52,428,800 bytes).
 */
export const MAX_MODEL_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_MODEL_FILE_SIZE_LABEL = '50 MB';

/**
 * Strict three-tier distinction mandated by Phase 04A:
 * - `'document-reference'`: A metadata-only record in the project dossier (e.g. `.skp` or `.glb` entry). Never implies binary presence.
 * - `'demo-asset'`: A fictive demonstrative `.glb` or `.gltf` asset included in the Workspace demo catalog.
 * - `'session-file'`: A temporary `.glb` or self-contained `.gltf` file selected by the user during the current browser session (`blob:` URL).
 */
export type ModelAssetCategory =
  | 'document-reference'
  | 'demo-asset'
  | 'session-file';

export type ModelSourceOrigin =
  | 'demo-asset'
  | 'session-file'
  | 'document-reference'
  | 'none';

export type ModelLoadableFormat = 'glb' | 'gltf';

export type ModelFileFormat = ModelLoadableFormat | 'skp' | 'unsupported';

export type ModelAvailabilityStatus =
  | 'available'
  | 'metadata-only'
  | 'unsupported-skp'
  | 'invalid-file'
  | 'unavailable';

export type ModelValidationErrorCode =
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'NATIVE_SKP_UNSUPPORTED'
  | 'UNSUPPORTED_EXTENSION'
  | 'INVALID_GLB_HEADER'
  | 'INVALID_GLTF_JSON'
  | 'INVALID_GLTF_MANIFEST'
  | 'GLTF_EXTERNAL_RESOURCES_MISSING';

export type ModelLoadState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Category B — Fictive demonstrative 3D model available in the local Workspace catalog.
 */
export interface DemoModelCatalogEntry {
  id: string;
  projectId: string;
  projectCode: string;
  code: string;
  fileName: string;
  format: ModelLoadableFormat;
  /** Canonical static asset path (e.g. `/assets/models/...`) or data URI consumed by the WebGL viewer. */
  assetPath: string;
  /**
   * Optional self-contained glTF 2.0 JSON string (with embedded base64 buffer)
   * ensuring at least one complete, verifiable `.gltf` study is always resolvable.
   */
  embeddedGltfJson?: string;
  /** Optional known byte size of the published demonstrative binary/manifest. */
  byteSize?: number;
  /** Optional verified linear unit declared in the demonstrative asset metadata. */
  declaredUnit?: 'm' | 'cm' | 'mm' | null;
  title: LocalizedText;
  studySummary: LocalizedText;
  scale: string;
  sizeHint: string;
  category: 'demo-asset';
  /** Always true: demonstrative models are fictive studies, never authentic client works. */
  isFictiveStudy: true;
  fictiveNotice: LocalizedText;
}

/**
 * Category C — Local file selected by the user during the active browser session.
 * Never persisted to `localStorage`, `sessionStorage`, or `IndexedDB`.
 */
export interface SessionModelEntry {
  id: string;
  projectId: string;
  fileName: string;
  format: ModelLoadableFormat;
  byteSize: number;
  sizeLabel: string;
  /** Temporary `blob:` URL created via `URL.createObjectURL` and revoked on cleanup/replacement/reset. */
  objectUrl: string;
  /** In-memory binary payload of the validated session file so GLTFLoader can parse it without re-fetching. */
  arrayBuffer?: ArrayBuffer;
  selectedAtIso: string;
  category: 'session-file';
}

/**
 * Category A — Classified view of a `ProjectFileReference` from the project dossier.
 * Explicitly marks that dossier file references are metadata-only records.
 */
export interface ClassifiedProjectFileItem {
  reference: ProjectFileReference;
  category: 'document-reference';
  detectedFormat: ModelFileFormat | 'pdf' | 'dwg' | 'webp' | 'xlsx';
  isWeb3DFormat: boolean;
  isNativeSkp: boolean;
  /** Always false: a dossier `ProjectFileReference` never stores or implies a binary file in the browser. */
  isLoadableBinaryPresent: false;
  availabilityStatus: 'metadata-only' | 'unsupported-skp';
  honestStatusLabel: LocalizedText;
  honestExplanation: LocalizedText;
}

export interface ModelFileValidationFailure {
  ok: false;
  errorCode: ModelValidationErrorCode;
  detectedFormat: ModelFileFormat;
  fileName: string;
  byteSize: number;
  missingExternalResources?: string[];
  message: LocalizedText;
}

export interface ModelFileValidationSuccess {
  ok: true;
  detectedFormat: ModelLoadableFormat;
  fileName: string;
  byteSize: number;
  sizeLabel: string;
  embeddedResourcesVerified: boolean;
}

export type ModelFileValidationResult =
  | ModelFileValidationSuccess
  | ModelFileValidationFailure;

/**
 * Canonical resolution of a project's 3D model state communicated to the viewer and UI.
 */
export interface ResolvedProjectModelResolution {
  projectId: string;
  projectCode: string;
  projectTitle: LocalizedText;
  departmentId: DepartmentId;
  studioBase: ProjectStudioBase;
  projectStatus: ProjectStatus;
  publicationStatus: PublicationStatus;
  isProjectArchived: boolean;
  hasLoadableModel: boolean;
  origin: ModelSourceOrigin;
  category: ModelAssetCategory | 'none';
  fileName: string | null;
  format: ModelFileFormat | null;
  availabilityStatus: ModelAvailabilityStatus;
  /**
   * Loadable URL when `hasLoadableModel === true`:
   * - Temporary `blob:` URL for `session-file`
   * - Static asset path or data URI for `demo-asset`
   * - `null` when no loadable model is available (`document-reference` or `none`)
   */
  url: string | null;
  isFictiveStudy: boolean;
  fictiveDisclaimer: LocalizedText | null;
  statusMessage: LocalizedText;
  errorMessage: LocalizedText | null;
  validationErrorCode: ModelValidationErrorCode | null;
  activeDemoAsset: DemoModelCatalogEntry | null;
  availableDemoAssets: DemoModelCatalogEntry[];
  sessionModel: SessionModelEntry | null;
  classifiedFiles: ClassifiedProjectFileItem[];
  skpReferences: ClassifiedProjectFileItem[];
  metadataOnly3DReferences: ClassifiedProjectFileItem[];
}

export interface ResolveProjectModelOptions {
  /** Optional demo asset ID override when a project has multiple demonstrative studies. */
  preferredDemoAssetId?: string | null;
  /** If true, suppresses falling back to the demonstrative catalog so only session files are active. */
  ignoreDemoAsset?: boolean;
  /** Optional last validation failure to surface in the resolved state. */
  lastValidationFailure?: ModelFileValidationFailure | null;
}

export type { CanonicalProjectRecord, ProjectFileReference };
