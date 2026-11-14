import type {
  CanonicalProjectRecord,
  ProjectStudioBase,
} from '../../data/projectLibraryTypes';
import type {
  DemoModelCatalogEntry,
  ModelFileValidationFailure,
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
import type {
  ArchitecturalModelSource,
  ModelViewerErrorDetail,
  ModelViewerProjectContext,
} from '../model-viewer/contracts';
import { getModelViewerDictionary } from '../model-viewer/i18n';

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
  code?: string;
  title?: LocalizedText;
  subtitle?: LocalizedText;
  origin: 'demo-asset' | 'session-file';
  url: string;
  format: ModelLoadableFormat;
  fileName: string;
  byteSize?: number;
  sizeLabel: string;
  scale?: string;
  declaredUnit?: 'm' | 'cm' | 'mm' | null;
  /**
   * Optional in-memory binary payload of the session file so GLTFLoader parses without re-fetching.
   */
  arrayBuffer?: ArrayBuffer;
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
  onModelLoaded: (metrics?: ModelLoadedMetrics, sourceKey?: string) => void;
  onModelError: (message: string) => void;
  onBackToDossier: () => void;
  onBackToProjects?: () => void;
  onSelectLocalFile: (file: File) => Promise<void> | void;
  onClearLocalFile: () => void;
  onClearActiveModel?: () => void;
  onRestoreDemoModel?: () => void;
  onSelectDemoAsset?: (demoAssetId: string) => void;
}

/**
 * Top-level integration props for mounting Agent B's `<ArchitecturalModelViewer />` inside
 * `/workspace/projects/:id/model`.
 */
export interface ModelViewerIntegrationProps {
  source: ModelSource | null;
  context: ModelContext;
  loadState: ModelLoadState;
  errorMessage: string | null;
  lastValidationFailure?: ModelFileValidationFailure | null;
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
      code: `${resolution.projectCode}-LOCAL`,
      origin: 'session-file',
      url: resolution.sessionModel.objectUrl,
      format: resolution.sessionModel.format,
      fileName: resolution.sessionModel.fileName,
      byteSize: resolution.sessionModel.byteSize,
      sizeLabel: resolution.sessionModel.sizeLabel,
      declaredUnit: null,
      arrayBuffer: resolution.sessionModel.arrayBuffer,
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
      code: resolution.activeDemoAsset.code,
      title: resolution.activeDemoAsset.title,
      subtitle: resolution.activeDemoAsset.studySummary,
      origin: 'demo-asset',
      url: resolution.activeDemoAsset.assetPath,
      format: resolution.activeDemoAsset.format,
      fileName: resolution.activeDemoAsset.fileName,
      byteSize: resolution.activeDemoAsset.byteSize,
      sizeLabel: resolution.activeDemoAsset.sizeHint,
      scale: resolution.activeDemoAsset.scale,
      declaredUnit: resolution.activeDemoAsset.declaredUnit ?? 'm',
      embeddedGltfJson: resolution.activeDemoAsset.embeddedGltfJson,
      isFictiveStudy: true,
      fictiveDisclaimer: resolution.activeDemoAsset.fictiveNotice,
    };
  }

  return null;
}

export function mapModelContextToViewerProjectContext(
  context: ModelContext,
): ModelViewerProjectContext {
  return {
    id: context.projectId,
    code: context.projectCode,
    title: context.projectTitle,
    subtitle: context.projectSubtitle,
    studioBase: context.studioBase,
    discipline: context.discipline,
    phase: context.phase,
    scale: context.scale,
    areaSqm: context.areaSqm,
    elevationDatum: context.elevationDatum,
    publicationStatusLabel:
      context.publicationStatus === 'private'
        ? {
            pt: 'Privado por omissão (Demo Local)',
            en: 'Private by default (Local Demo)',
          }
        : {
            pt: context.publicationStatus,
            en: context.publicationStatus,
          },
  };
}

export function mapModelSourceToArchitecturalModelSource(
  source: ModelSource | null,
  context: ModelContext,
): ArchitecturalModelSource | null {
  if (!source) {
    return null;
  }

  if (source.origin === 'session-file') {
    return {
      id: source.id,
      code: source.code ?? `${context.projectCode}-LOCAL`,
      title: {
        pt: `${source.fileName} (Pré-visualização local)`,
        en: `${source.fileName} (Local preview)`,
      },
      subtitle: {
        pt: 'Ficheiro carregado temporariamente na memória desta sessão do navegador.',
        en: 'File loaded temporarily in this browser session memory.',
      },
      url: source.url,
      fileName: source.fileName,
      format: source.format,
      origin: 'local_temporary',
      fileSizeBytes: source.byteSize,
      versionLabel:
        context.language === 'en'
          ? 'Temporary local session'
          : 'Sessão local temporária',
      authorLabel:
        context.language === 'en'
          ? 'Local browser selection'
          : 'Selecção local no navegador',
      declaredUnit: null,
      declaredScale: null,
      licenseNote: {
        pt: 'Visualização temporária local neste navegador. O ficheiro não foi enviado nem guardado num servidor.',
        en: 'Temporary local preview in this browser. The file was neither uploaded nor stored on a server.',
      },
      isDemoModel: false,
      arrayBuffer: source.arrayBuffer,
    };
  }

  return {
    id: source.id,
    code: source.code ?? `${context.projectCode}-DEMO`,
    title: source.title ?? context.projectTitle,
    subtitle: source.subtitle ?? context.projectSubtitle,
    url: source.url,
    fileName: source.fileName,
    format: source.format,
    origin: 'demo',
    fileSizeBytes: source.byteSize,
    versionLabel: `${source.scale ?? context.scale}`,
    authorLabel: `O+A · ${context.studioBase}`,
    declaredUnit: source.declaredUnit ?? 'm',
    declaredScale: source.scale ?? context.scale ?? null,
    licenseNote:
      source.fictiveDisclaimer ?? {
        pt: 'Estudo volumétrico fictício de demonstração.',
        en: 'Fictive demonstrative massing study.',
      },
    isDemoModel: true,
    embeddedGltfJson: source.embeddedGltfJson,
  };
}

export function mapDemoCatalogEntriesToViewerSources(
  entries: readonly DemoModelCatalogEntry[],
  context: ModelContext,
): ArchitecturalModelSource[] {
  return entries.map((entry) => ({
    id: entry.id,
    code: entry.code,
    title: entry.title,
    subtitle: entry.studySummary,
    url: entry.assetPath,
    fileName: entry.fileName,
    format: entry.format,
    origin: 'demo',
    fileSizeBytes: entry.byteSize,
    versionLabel: entry.scale,
    authorLabel: `O+A · ${context.studioBase}`,
    declaredUnit: entry.declaredUnit ?? 'm',
    declaredScale: entry.scale,
    licenseNote: entry.fictiveNotice,
    isDemoModel: true,
    embeddedGltfJson: entry.embeddedGltfJson,
  }));
}

export function mapValidationFailureToViewerErrorDetail(
  failure: ModelFileValidationFailure | null | undefined,
): ModelViewerErrorDetail | null {
  if (!failure) {
    return null;
  }

  const ptDict = getModelViewerDictionary('pt');
  const enDict = getModelViewerDictionary('en');

  if (
    failure.errorCode === 'NATIVE_SKP_UNSUPPORTED' ||
    failure.errorCode === 'UNSUPPORTED_EXTENSION'
  ) {
    return {
      status: 'error_format',
      fileName: failure.fileName,
      title: {
        pt: ptDict.states.errorFormatTitle,
        en: enDict.states.errorFormatTitle,
      },
      message: failure.message,
      nextAction: {
        pt: ptDict.states.errorFormatNextAction,
        en: enDict.states.errorFormatNextAction,
      },
    };
  }

  if (failure.errorCode === 'FILE_TOO_LARGE') {
    return {
      status: 'error_too_large',
      fileName: failure.fileName,
      title: {
        pt: ptDict.states.errorTooLargeTitle,
        en: enDict.states.errorTooLargeTitle,
      },
      message: failure.message,
      nextAction: {
        pt: ptDict.states.errorTooLargeNextAction,
        en: enDict.states.errorTooLargeNextAction,
      },
    };
  }

  return {
    status: 'error_invalid',
    fileName: failure.fileName,
    title: {
      pt: ptDict.states.errorInvalidTitle,
      en: enDict.states.errorInvalidTitle,
    },
    message: failure.message,
    nextAction: {
      pt: ptDict.states.errorInvalidNextAction,
      en: enDict.states.errorInvalidNextAction,
    },
  };
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
