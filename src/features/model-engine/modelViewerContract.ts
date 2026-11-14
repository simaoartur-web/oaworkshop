import type {
  CanonicalProjectRecord,
  ProjectStudioBase,
} from '../../data/projectLibraryTypes';
import type {
  DemoModelCatalogEntry,
  ModelLoadableFormat,
  ModelLoadState,
  ResolvedProjectModelResolution,
} from '../../data/modelAssetTypes';
import type {
  AppLanguage,
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
  Role,
} from '../../data/types';

/**
 * Contract source descriptor passed from Agent A's Model Engine (`src/features/model-engine`)
 * to Agent B's WebGL 3D Viewer (`src/features/model-viewer`).
 *
 * Only loadable 3D sources (`'demo-asset'` or `'session-file'`) produce a `ModelSource`.
 * Documentary references (`'document-reference'`, such as `.skp` or metadata-only `.glb` entries)
 * never produce a `ModelSource`.
 */
export interface ModelSource {
  id: string;
  origin: 'demo-asset' | 'session-file';
  url: string;
  format: ModelLoadableFormat;
  fileName: string;
  sizeLabel: string;
  scale?: string;
  /**
   * Optional embedded glTF 2.0 JSON payload when `format === 'gltf'` and the catalog
   * provides a self-contained manifest with base64 buffer data.
   */
  embeddedGltfJson?: string;
  /** True when the model comes from the fictive demonstrative catalog. */
  isFictiveStudy: boolean;
  fictiveDisclaimer: LocalizedText | null;
}

/**
 * Canonical project context passed to the 3D Viewer so its HUD, scale bar, and labels
 * stay synchronized with the Phase 03 Project Library.
 */
export interface ModelContext {
  projectId: string;
  projectCode: string;
  projectTitle: LocalizedText;
  projectSubtitle: LocalizedText;
  departmentId: DepartmentId;
  discipline: LocalizedText;
  studioBase: ProjectStudioBase;
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

export interface ModelLoadedMetrics {
  triangleCount?: number;
  vertexCount?: number;
  meshCount?: number;
  materialCount?: number;
  loadDurationMs?: number;
}

/**
 * Callbacks exposed by Agent A's Model Engine to Agent B's Viewer component.
 */
export interface ModelViewerCallbacks {
  onModelLoaded: (metrics?: ModelLoadedMetrics) => void;
  onModelError: (message: string) => void;
  onBackToDossier: () => void;
  onSelectLocalFile: (file: File) => Promise<void> | void;
  onClearLocalFile: () => void;
  onSelectDemoAsset?: (demoAssetId: string) => void;
}

/**
 * Top-level integration props for mounting Agent B's `<ModelViewer />` inside
 * `/workspace/projects/:id/model`.
 */
export interface ModelViewerIntegrationProps {
  source: ModelSource | null;
  context: ModelContext;
  loadState: ModelLoadState;
  errorMessage: string | null;
  availableDemoAssets: readonly DemoModelCatalogEntry[];
  resolution: ResolvedProjectModelResolution;
  callbacks: ModelViewerCallbacks;
}

export function buildModelSourceFromResolution(
  resolution: ResolvedProjectModelResolution,
): ModelSource | null {
  if (!resolution.hasLoadableModel || !resolution.url || !resolution.fileName) {
    return null;
  }

  if (
    resolution.origin === 'session-file' &&
    resolution.sessionModel &&
    (resolution.format === 'glb' || resolution.format === 'gltf')
  ) {
    return {
      id: resolution.sessionModel.id,
      origin: 'session-file',
      url: resolution.sessionModel.objectUrl,
      format: resolution.sessionModel.format,
      fileName: resolution.sessionModel.fileName,
      sizeLabel: resolution.sessionModel.sizeLabel,
      isFictiveStudy: false,
      fictiveDisclaimer: null,
    };
  }

  if (
    resolution.origin === 'demo-asset' &&
    resolution.activeDemoAsset &&
    (resolution.format === 'glb' || resolution.format === 'gltf')
  ) {
    return {
      id: resolution.activeDemoAsset.id,
      origin: 'demo-asset',
      url: resolution.activeDemoAsset.assetPath,
      format: resolution.activeDemoAsset.format,
      fileName: resolution.activeDemoAsset.fileName,
      sizeLabel: resolution.activeDemoAsset.sizeHint,
      scale: resolution.activeDemoAsset.scale,
      embeddedGltfJson: resolution.activeDemoAsset.embeddedGltfJson,
      isFictiveStudy: true,
      fictiveDisclaimer: resolution.activeDemoAsset.fictiveNotice,
    };
  }

  return null;
}

export function buildModelContextFromProject(
  record: CanonicalProjectRecord,
  language: AppLanguage,
  activeUserRole: Role,
): ModelContext {
  return {
    projectId: record.identity.id,
    projectCode: record.identity.code,
    projectTitle: { ...record.editorial.title },
    projectSubtitle: { ...record.editorial.subtitle },
    departmentId: record.classification.departmentId,
    discipline: { ...record.classification.discipline },
    studioBase: record.location.studioBase,
    scale: record.classification.scale,
    areaSqm: record.classification.areaSqm,
    elevationDatum: record.classification.elevationDatum,
    phase: { ...record.lifecycle.phase },
    projectStatus: record.lifecycle.projectStatus,
    publicationStatus: record.publication.publicationStatus,
    isArchived:
      record.metadata.isArchived ||
      record.lifecycle.projectStatus === 'archived',
    activeUserRole,
    language,
  };
}
