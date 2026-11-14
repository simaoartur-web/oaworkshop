import type { AppLanguage, LocalizedText } from '../../data/types';

/**
 * Standard architectural camera presets available in the 3D viewer.
 */
export type ModelCameraPreset = 'isometric' | 'top' | 'front' | 'side';

/**
 * Complete visual states required for Phase 04B.
 * The viewer never reports `'loaded'` unless a 3D scene has genuinely been parsed and mounted.
 */
export type ModelViewerStatus =
  | 'empty'
  | 'loading'
  | 'loaded'
  | 'error_format'
  | 'error_invalid'
  | 'error_too_large'
  | 'webgl_unavailable';

/**
 * Distinguishes whether the currently active model comes from a built-in
 * studio demonstration asset, a temporary local file selected in the browser,
 * or an external catalog reference provided by Agent A.
 */
export type ModelSourceOrigin = 'demo' | 'local_temporary' | 'project_reference';

/**
 * Source descriptor for a 3D model to be loaded by GLTFLoader.
 */
export interface ArchitecturalModelSource {
  id: string;
  code: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  /** URL or ObjectURL pointing to a real `.glb` or self-contained `.gltf` asset. */
  url: string;
  fileName: string;
  format: 'glb' | 'gltf';
  origin: ModelSourceOrigin;
  fileSizeBytes?: number;
  versionLabel?: string;
  authorLabel?: string;
  updatedAtIso?: string;
  /**
   * Only set when the asset or metadata reliably declares real-world linear units.
   * Never invented when an arbitrary file lacks unit metadata.
   */
  declaredUnit?: 'm' | 'mm' | 'cm' | null;
  /**
   * Optional architectural drawing scale reference (e.g. "1:100") when reliably known.
   */
  declaredScale?: string | null;
  licenseNote?: LocalizedText;
  isDemoModel: boolean;
}

/**
 * Project context metadata passed to the viewer by the host route or dossier.
 * Kept decoupled from `projectLibraryRepository` and React Router.
 */
export interface ModelViewerProjectContext {
  id: string;
  code: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  discipline?: LocalizedText;
  studioBase?: 'Maputo' | 'Milão';
  phase?: LocalizedText;
  leadAuthorName?: string;
  scale?: string;
  areaSqm?: string;
  elevationDatum?: string;
  publicationStatusLabel?: LocalizedText;
}

/**
 * Computed 3D scene telemetry extracted after `GLTFLoader` parses a real model.
 */
export interface LoadedModelTelemetry {
  meshCount: number;
  vertexCount: number;
  triangleCount: number;
  materialCount: number;
  nodeNames: string[];
  /** Bounding box dimensions in raw scene units (width X, height Y, depth Z). */
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  /** Bounding sphere radius in scene units. */
  boundingRadius: number;
  /**
   * Reliable unit string (`'m'`, `'cm'`, `'mm'`) ONLY if verified in glTF `asset.extras`
   * or explicit source metadata; `null` when the file does not declare reliable units.
   */
  verifiedUnit: 'm' | 'mm' | 'cm' | null;
  verifiedScale: string | null;
  generatorTag?: string;
}

/**
 * Structured error information emitted when a model fails validation or loading.
 */
export interface ModelViewerErrorDetail {
  status: Extract<
    ModelViewerStatus,
    'error_format' | 'error_invalid' | 'error_too_large' | 'webgl_unavailable'
  >;
  fileName?: string;
  title: LocalizedText;
  message: LocalizedText;
  nextAction: LocalizedText;
  technicalDetail?: string;
}

/**
 * Interactive stage view options controlled by the user.
 */
export interface ModelStageViewSettings {
  cameraPreset: ModelCameraPreset;
  showGrid: boolean;
  showAxes: boolean;
  wireframe: boolean;
  revisionCounter: number;
  recenterCounter: number;
  zoomDeltaCounter: number;
  lastZoomDirection: 'in' | 'out' | null;
}

/**
 * Props for `ArchitecturalModelViewer` — main integration contract for Agent A.
 */
export interface ArchitecturalModelViewerProps {
  /** Project identification and editorial context. */
  project?: ModelViewerProjectContext;
  /** Initial or controlled model source to load. */
  modelSource?: ArchitecturalModelSource | null;
  /** Available built-in or project model sources to switch between. */
  availableModels?: readonly ArchitecturalModelSource[];
  /** Active UI language (`'pt'` by default). */
  language?: AppLanguage;
  /** Respect reduced motion preferences from WorkspaceSessionContext. */
  reduceMotion?: boolean;
  /** Optional external loading state override from host container. */
  externalLoading?: boolean;
  /** Maximum allowed local file size in bytes (defaults to 45 MB). */
  maxFileSizeBytes?: number;
  /** Optional WebGL availability override (useful for deterministic testing). */
  webglAvailableOverride?: boolean;
  /** Callback fired when a model finishes loading and telemetry is computed. */
  onModelLoaded?: (
    source: ArchitecturalModelSource,
    telemetry: LoadedModelTelemetry,
  ) => void;
  /** Callback fired when a format, parsing, size, or WebGL error occurs. */
  onModelError?: (error: ModelViewerErrorDetail) => void;
  /** Callback fired when the user selects a local `.glb`/`.gltf` file in the browser. */
  onLocalFileSelected?: (
    file: File,
    source: ArchitecturalModelSource,
  ) => void;
  /** Callback fired when the user switches between available models. */
  onSelectModelSource?: (source: ArchitecturalModelSource) => void;
  /** Callback fired when the user changes the camera preset. */
  onCameraPresetChange?: (preset: ModelCameraPreset) => void;
  /** Callback fired when GPU geometries/materials/textures are disposed on swap or unmount. */
  onSceneDisposed?: (summary: {
    disposedGeometries: number;
    disposedMaterials: number;
    disposedTextures: number;
  }) => void;
  /** Callback to navigate back to the project dossier (`/workspace/projects/:id`). */
  onBackToDossier?: () => void;
  /** Callback to navigate back to the projects catalog (`/workspace/projects`). */
  onBackToProjects?: () => void;
  className?: string;
}
