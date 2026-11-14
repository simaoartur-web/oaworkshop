import {
  ArrowLeft,
  Box,
  FolderOpen,
  Layers,
  Trash2,
} from 'lucide-react';
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import type * as THREE from 'three';
import type {
  ArchitecturalModelSource,
  ArchitecturalModelViewerProps,
  LoadedModelTelemetry,
  ModelCameraPreset,
  ModelStageViewSettings,
  ModelViewerErrorDetail,
  ModelViewerStatus,
} from './contracts';
import {
  DEFAULT_DEMO_PROJECT_CONTEXT,
  DEFAULT_MAX_MODEL_FILE_SIZE_BYTES,
  OA_DEMO_MODEL_SOURCES,
} from './demoModels';
import {
  buildInvalidModelErrorDetail,
  buildWebGLUnavailableErrorDetail,
  detectWebGLSupport,
  disposeThreeObjectResources,
  parseGlbSceneAndTelemetry,
  validateLocalModelFileMetadata,
} from './glbInspector';
import { getModelViewerDictionary } from './i18n';
import { ModelInformationPanel } from './ModelInformationPanel';
import { ModelViewerControls } from './ModelViewerControls';
import { ModelViewerFallback } from './ModelViewerFallback';

// Lazy-load the WebGL / R3F stage so the 3D engine only mounts when needed
const LazyModelViewerStage = lazy(() => import('./ModelViewerStage'));

const INITIAL_STAGE_SETTINGS: ModelStageViewSettings = {
  cameraPreset: 'isometric',
  showGrid: true,
  showAxes: false,
  wireframe: false,
  revisionCounter: 0,
  recenterCounter: 0,
  zoomDeltaCounter: 0,
  lastZoomDirection: null,
};

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return an ArrayBuffer.'));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read local file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function ArchitecturalModelViewer({
  project = DEFAULT_DEMO_PROJECT_CONTEXT,
  modelSource,
  availableModels,
  language = 'pt',
  reduceMotion = false,
  externalLoading = false,
  externalErrorDetail = null,
  maxFileSizeBytes = DEFAULT_MAX_MODEL_FILE_SIZE_BYTES,
  webglAvailableOverride,
  onModelLoaded,
  onModelError,
  onLocalFileSelected,
  onRequestSelectLocalFile,
  onRequestClearModel,
  onRequestRestoreDemoModel,
  onSelectModelSource,
  onCameraPresetChange,
  onSceneDisposed,
  onBackToDossier,
  onBackToProjects,
  className = '',
}: ArchitecturalModelViewerProps) {
  const dict = getModelViewerDictionary(language);
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resolvedAvailableModels = useMemo<readonly ArchitecturalModelSource[]>(() => {
    if (availableModels !== undefined) {
      return availableModels;
    }
    if (modelSource === null) {
      return [];
    }
    return OA_DEMO_MODEL_SOURCES;
  }, [availableModels, modelSource]);

  const isControlledByHost = Boolean(
    onRequestSelectLocalFile ||
      onRequestClearModel ||
      onRequestRestoreDemoModel,
  );

  const initialSource =
    modelSource === undefined
      ? resolvedAvailableModels[0] ?? null
      : modelSource;

  const [internalSource, setInternalSource] =
    useState<ArchitecturalModelSource | null>(initialSource);
  const [hasUserOverriddenSource, setHasUserOverriddenSource] = useState(false);

  const activeSource = isControlledByHost
    ? (modelSource ?? null)
    : modelSource !== undefined && !hasUserOverriddenSource
      ? modelSource
      : internalSource;

  const webglSupported = useMemo(
    () => detectWebGLSupport(webglAvailableOverride),
    [webglAvailableOverride],
  );

  const [status, setStatus] = useState<ModelViewerStatus>(() => {
    if (!webglSupported) {
      return 'webgl_unavailable';
    }
    if (externalErrorDetail) {
      return externalErrorDetail.status;
    }
    if (externalLoading) {
      return 'loading';
    }
    return initialSource ? 'loading' : 'empty';
  });
  const [errorDetail, setErrorDetail] = useState<ModelViewerErrorDetail | null>(
    () =>
      !webglSupported
        ? buildWebGLUnavailableErrorDetail('WebGL context creation returned null.')
        : externalErrorDetail ?? null,
  );
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);
  const [telemetry, setTelemetry] = useState<LoadedModelTelemetry | null>(null);
  const [stageSettings, setStageSettings] = useState<ModelStageViewSettings>(
    INITIAL_STAGE_SETTINGS,
  );

  // Keep references to the active Three.js scene, local ArrayBuffer cache, and ObjectURL for cleanup
  const activeSceneRef = useRef<THREE.Group | null>(null);
  const localBufferByUrlRef = useRef<Map<string, ArrayBuffer>>(new Map());
  const activeObjectUrlRef = useRef<string | null>(null);
  const activeSourceRef = useRef<ArchitecturalModelSource | null>(activeSource);
  const onSceneDisposedRef = useRef(onSceneDisposed);
  const onModelLoadedRef = useRef(onModelLoaded);
  const onModelErrorRef = useRef(onModelError);

  const activeSourceKey = activeSource
    ? `${activeSource.id}::${activeSource.url}::${activeSource.format}::${activeSource.fileSizeBytes}`
    : null;

  useEffect(() => {
    activeSourceRef.current = activeSource;
    onSceneDisposedRef.current = onSceneDisposed;
    onModelLoadedRef.current = onModelLoaded;
    onModelErrorRef.current = onModelError;
  }, [activeSource, onSceneDisposed, onModelLoaded, onModelError]);

  const releaseCurrentScene = useCallback(() => {
    if (activeSceneRef.current) {
      const summary = disposeThreeObjectResources(activeSceneRef.current);
      activeSceneRef.current = null;
      onSceneDisposedRef.current?.(summary);
    }
  }, []);

  const revokeActiveObjectUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      localBufferByUrlRef.current.delete(activeObjectUrlRef.current);
      if (
        typeof URL !== 'undefined' &&
        typeof URL.revokeObjectURL === 'function' &&
        activeObjectUrlRef.current.startsWith('blob:')
      ) {
        try {
          URL.revokeObjectURL(activeObjectUrlRef.current);
        } catch {
          // Ignore revoke errors in synthetic test environments
        }
      }
      activeObjectUrlRef.current = null;
    }
  }, []);

  // Dispose GPU geometries/materials/textures and ObjectURLs when component unmounts
  useEffect(() => {
    return () => {
      releaseCurrentScene();
      revokeActiveObjectUrl();
    };
  }, [releaseCurrentScene, revokeActiveObjectUrl]);

  // Core model loading effect: fetches or reads buffer, parses with GLTFLoader asynchronously
  useEffect(() => {
    let cancelled = false;

    async function runLoadCycle() {
      await Promise.resolve();
      if (cancelled) return;

      if (!webglSupported) {
        releaseCurrentScene();
        setLoadedScene(null);
        setTelemetry(null);
        const webglErr = buildWebGLUnavailableErrorDetail(
          'WebGL context creation returned null.',
        );
        setErrorDetail(webglErr);
        setStatus('webgl_unavailable');
        onModelErrorRef.current?.(webglErr);
        return;
      }

      if (externalErrorDetail) {
        releaseCurrentScene();
        setLoadedScene(null);
        setTelemetry(null);
        setErrorDetail(externalErrorDetail);
        setStatus(externalErrorDetail.status);
        return;
      }

      if (externalLoading) {
        setStatus('loading');
        return;
      }

      const sourceToLoad = activeSourceRef.current;
      if (!sourceToLoad) {
        releaseCurrentScene();
        setLoadedScene(null);
        setTelemetry(null);
        setErrorDetail(null);
        setStatus('empty');
        return;
      }

      setStatus('loading');
      setErrorDetail(null);

      try {
        const encodedEmbeddedGltf = sourceToLoad.embeddedGltfJson
          ? new TextEncoder().encode(sourceToLoad.embeddedGltfJson)
          : null;
        let buffer =
          sourceToLoad.arrayBuffer ??
          (encodedEmbeddedGltf
            ? encodedEmbeddedGltf.buffer.slice(
                encodedEmbeddedGltf.byteOffset,
                encodedEmbeddedGltf.byteOffset + encodedEmbeddedGltf.byteLength,
              )
            : undefined) ??
          localBufferByUrlRef.current.get(sourceToLoad.url);
        if (!buffer) {
          const response = await fetch(sourceToLoad.url);
          if (!response.ok) {
            throw buildInvalidModelErrorDetail(
              sourceToLoad.fileName,
              'corrupt',
              `HTTP ${response.status} while fetching ${sourceToLoad.url}`,
            );
          }
          buffer = await response.arrayBuffer();
        }

        if (cancelled) return;

        if (buffer.byteLength > maxFileSizeBytes) {
          const err: ModelViewerErrorDetail = {
            status: 'error_too_large',
            fileName: sourceToLoad.fileName,
            title: {
              pt: getModelViewerDictionary('pt').states.errorTooLargeTitle,
              en: getModelViewerDictionary('en').states.errorTooLargeTitle,
            },
            message: {
              pt: getModelViewerDictionary('pt').states.errorTooLargeBody,
              en: getModelViewerDictionary('en').states.errorTooLargeBody,
            },
            nextAction: {
              pt: getModelViewerDictionary('pt').states.errorTooLargeNextAction,
              en: getModelViewerDictionary('en').states.errorTooLargeNextAction,
            },
          };
          throw err;
        }

        const parsed = await parseGlbSceneAndTelemetry(buffer, sourceToLoad);
        if (cancelled) {
          disposeThreeObjectResources(parsed.scene);
          return;
        }

        // Release previous model GPU resources before swapping in the new scene
        releaseCurrentScene();
        activeSceneRef.current = parsed.scene;
        setLoadedScene(parsed.scene);
        setTelemetry(parsed.telemetry);
        setErrorDetail(null);
        setStatus('loaded');
        setStageSettings((prev) => ({
          ...prev,
          cameraPreset: 'isometric',
          revisionCounter: prev.revisionCounter + 1,
        }));
        onModelLoadedRef.current?.(sourceToLoad, parsed.telemetry);
      } catch (err) {
        if (cancelled) return;
        releaseCurrentScene();
        setLoadedScene(null);
        setTelemetry(null);

        const structuredError: ModelViewerErrorDetail =
          err &&
          typeof err === 'object' &&
          'status' in err &&
          'title' in err &&
          'message' in err
            ? (err as ModelViewerErrorDetail)
            : buildInvalidModelErrorDetail(
                sourceToLoad.fileName,
                'corrupt',
                err instanceof Error ? err.message : 'Unknown model load failure.',
              );

        setErrorDetail(structuredError);
        setStatus(structuredError.status);
        onModelErrorRef.current?.(structuredError);
      }
    }

    void runLoadCycle();

    return () => {
      cancelled = true;
    };
  }, [
    activeSourceKey,
    externalErrorDetail,
    externalLoading,
    maxFileSizeBytes,
    releaseCurrentScene,
    webglSupported,
  ]);

  const hasRestorableDemo =
    Boolean(onRequestRestoreDemoModel) || resolvedAvailableModels.length > 0;

  const handleSelectBuiltInModel = (source: ArchitecturalModelSource) => {
    if (isControlledByHost) {
      onSelectModelSource?.(source);
      return;
    }
    revokeActiveObjectUrl();
    setHasUserOverriddenSource(true);
    setInternalSource(source);
    onSelectModelSource?.(source);
  };

  const handleRestoreDemoModel = () => {
    if (onRequestRestoreDemoModel) {
      onRequestRestoreDemoModel();
      return;
    }
    const fallbackDemo = resolvedAvailableModels[0] ?? null;
    if (!fallbackDemo) {
      return;
    }
    revokeActiveObjectUrl();
    setHasUserOverriddenSource(true);
    setInternalSource({ ...fallbackDemo });
    onSelectModelSource?.(fallbackDemo);
  };

  const handleClearModel = () => {
    if (onRequestClearModel) {
      onRequestClearModel();
      return;
    }
    revokeActiveObjectUrl();
    setHasUserOverriddenSource(true);
    setInternalSource(null);
  };

  const handleTriggerLocalFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleLocalFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    if (onRequestSelectLocalFile) {
      await onRequestSelectLocalFile(file);
      return;
    }

    const metaCheck = validateLocalModelFileMetadata(file, maxFileSizeBytes);
    if (!metaCheck.valid) {
      releaseCurrentScene();
      setLoadedScene(null);
      setTelemetry(null);
      setErrorDetail(metaCheck.error);
      setStatus(metaCheck.error.status);
      onModelErrorRef.current?.(metaCheck.error);
      return;
    }

    try {
      const buffer = await readFileAsArrayBuffer(file);
      revokeActiveObjectUrl();

      if (
        typeof URL === 'undefined' ||
        typeof URL.createObjectURL !== 'function'
      ) {
        throw new Error('Browser URL.createObjectURL API is unavailable.');
      }
      const objectUrl = URL.createObjectURL(file);
      if (
        typeof objectUrl !== 'string' ||
        !objectUrl.trim().startsWith('blob:')
      ) {
        throw new Error(
          'URL.createObjectURL returned an invalid temporary blob: URL.',
        );
      }

      activeObjectUrlRef.current = objectUrl;
      localBufferByUrlRef.current.set(objectUrl, buffer);

      const localSource: ArchitecturalModelSource = {
        id: `local-${Date.now()}`,
        code: 'LOCAL-GLTF',
        title: {
          pt: `${file.name} (Pré-visualização local)`,
          en: `${file.name} (Local preview)`,
        },
        subtitle: {
          pt: 'Ficheiro carregado temporariamente na memória deste navegador.',
          en: 'File loaded temporarily in this browser memory.',
        },
        url: objectUrl,
        fileName: file.name,
        format: metaCheck.format,
        origin: 'local_temporary',
        fileSizeBytes: file.size,
        versionLabel:
          language === 'en' ? 'Temporary local session' : 'Sessão local temporária',
        authorLabel:
          language === 'en' ? 'Local browser selection' : 'Selecção local no navegador',
        declaredUnit: null,
        declaredScale: null,
        licenseNote: {
          pt: 'Visualização temporária local neste navegador. O ficheiro não foi enviado nem guardado num servidor.',
          en: 'Temporary local preview in this browser. The file was neither uploaded nor stored on a server.',
        },
        isDemoModel: false,
      };

      setHasUserOverriddenSource(true);
      setInternalSource(localSource);
      onLocalFileSelected?.(file, localSource);
    } catch (err) {
      const readErr = buildInvalidModelErrorDetail(
        file.name,
        'corrupt',
        err instanceof Error ? err.message : 'Could not read local file.',
      );
      releaseCurrentScene();
      setLoadedScene(null);
      setTelemetry(null);
      setErrorDetail(readErr);
      setStatus('error_invalid');
      onModelErrorRef.current?.(readErr);
    }
  };

  const handleSelectCameraPreset = (preset: ModelCameraPreset) => {
    setStageSettings((prev) => ({
      ...prev,
      cameraPreset: preset,
      recenterCounter: prev.recenterCounter + 1,
    }));
    onCameraPresetChange?.(preset);
  };

  const handleRecenterModel = () => {
    setStageSettings((prev) => ({
      ...prev,
      recenterCounter: prev.recenterCounter + 1,
    }));
  };

  const handleResetInitialView = () => {
    setStageSettings((prev) => ({
      ...prev,
      cameraPreset: 'isometric',
      revisionCounter: prev.revisionCounter + 1,
      recenterCounter: prev.recenterCounter + 1,
    }));
    onCameraPresetChange?.('isometric');
  };

  const handleZoomIn = () => {
    setStageSettings((prev) => ({
      ...prev,
      zoomDeltaCounter: prev.zoomDeltaCounter + 1,
      lastZoomDirection: 'in',
    }));
  };

  const handleZoomOut = () => {
    setStageSettings((prev) => ({
      ...prev,
      zoomDeltaCounter: prev.zoomDeltaCounter + 1,
      lastZoomDirection: 'out',
    }));
  };

  const handleWebGLContextLost = useCallback(() => {
    releaseCurrentScene();
    setLoadedScene(null);
    setTelemetry(null);
    const lostErr = buildWebGLUnavailableErrorDetail(
      'WebGL context lost event triggered by browser/GPU.',
    );
    setErrorDetail(lostErr);
    setStatus('webgl_unavailable');
    onModelErrorRef.current?.(lostErr);
  }, [releaseCurrentScene]);

  const controlsDisabled = status !== 'loaded' || !loadedScene;

  return (
    <section
      aria-label={dict.header.eyebrow}
      data-testid="architectural-model-viewer"
      data-viewer-status={status}
      className={`w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 bg-[#050505] text-white space-y-3.5 overflow-x-hidden ${className}`}
    >
      {/* Hidden accessible file input for local .glb / .gltf inspection */}
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        accept=".glb,.gltf"
        onChange={handleLocalFileChange}
        data-testid="model-viewer-file-input"
        className="sr-only"
        aria-label={dict.panel.selectLocalFileCta}
      />

      {/* Contextual Project & Model Desk Header */}
      <header className="bg-[#111111] border border-white/10 p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {onBackToDossier && (
              <button
                type="button"
                onClick={onBackToDossier}
                className="min-h-[44px] px-3.5 py-2 bg-[#181818] hover:border-[#A65D4A] border border-white/15 text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>{dict.header.backToDossier}</span>
              </button>
            )}
            {onBackToProjects && (
              <button
                type="button"
                onClick={onBackToProjects}
                className="min-h-[44px] px-3.5 py-2 bg-[#141414] hover:border-white/35 border border-white/12 text-xs font-medium uppercase tracking-[0.14em] text-[#BDBDBD] inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{dict.header.backToProjects}</span>
              </button>
            )}
            <span className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D] px-1">
              {dict.header.eyebrow}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSource && (
              <span
                data-testid="header-model-origin-badge"
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] border ${
                  activeSource.origin === 'local_temporary'
                    ? 'border-[#CE826D] bg-[#221612] text-[#CE826D]'
                    : 'border-white/15 bg-[#181818] text-[#E0E0E0]'
                }`}
              >
                {activeSource.origin === 'local_temporary'
                  ? dict.header.localBadge
                  : activeSource.isDemoModel
                    ? dict.header.demoBadge
                    : dict.header.referenceBadge}
              </span>
            )}
            {project.publicationStatusLabel && (
              <span className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] border border-white/12 bg-[#181818] text-[#BDBDBD]">
                {project.publicationStatusLabel[language]}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#9E9E9E]">
              <span className="text-white font-semibold">{project.code}</span>
              {project.studioBase && <span>· {project.studioBase}</span>}
              {project.discipline && (
                <span className="text-[#CE826D]">
                  · {project.discipline[language]}
                </span>
              )}
              {project.phase && <span>· {project.phase[language]}</span>}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight">
              {activeSource
                ? activeSource.title[language]
                : project.title[language]}
            </h1>
            <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed">
              {activeSource
                ? activeSource.subtitle[language]
                : project.subtitle?.[language]}
            </p>
          </div>

          {/* Model Source Switcher & Local File Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            {resolvedAvailableModels.map((item) => {
              const isSelected = activeSource?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelectBuiltInModel(item)}
                  className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#A65D4A] border-[#A65D4A] text-white'
                      : 'bg-[#181818] border-white/15 text-[#E0E0E0] hover:border-[#A65D4A]'
                  }`}
                >
                  <Box size={14} strokeWidth={1.6} aria-hidden="true" />
                  <span>{item.code}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleTriggerLocalFilePicker}
              className="min-h-[44px] px-3.5 py-2 bg-[#181818] hover:border-[#A65D4A] border border-white/20 text-xs font-medium uppercase tracking-[0.12em] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderOpen size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.header.uploadLocalButton}</span>
            </button>

            {activeSource && (
              <button
                type="button"
                onClick={handleClearModel}
                className="min-h-[44px] px-3 py-2 bg-[#141414] hover:border-white/35 border border-white/12 text-xs font-medium uppercase tracking-[0.12em] text-[#BDBDBD] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>{dict.header.clearModelButton}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Spatial Exploration Grid: 8-col 3D Stage & Controls + 4-col Technical Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-3 min-w-0">
          <ModelViewerControls
            language={language}
            activePreset={stageSettings.cameraPreset}
            showGrid={stageSettings.showGrid}
            showAxes={stageSettings.showAxes}
            wireframe={stageSettings.wireframe}
            disabled={controlsDisabled}
            onSelectPreset={handleSelectCameraPreset}
            onRecenter={handleRecenterModel}
            onResetInitialView={handleResetInitialView}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleGrid={() =>
              setStageSettings((prev) => ({
                ...prev,
                showGrid: !prev.showGrid,
              }))
            }
            onToggleAxes={() =>
              setStageSettings((prev) => ({
                ...prev,
                showAxes: !prev.showAxes,
              }))
            }
            onToggleWireframe={() =>
              setStageSettings((prev) => ({
                ...prev,
                wireframe: !prev.wireframe,
              }))
            }
          />

          {status === 'loaded' && activeSource && loadedScene && telemetry ? (
            <Suspense
              fallback={
                <ModelViewerFallback
                  status="loading"
                  language={language}
                  project={project}
                />
              }
            >
              <LazyModelViewerStage
                language={language}
                source={activeSource}
                scene={loadedScene}
                telemetry={telemetry}
                settings={stageSettings}
                reduceMotion={reduceMotion}
                onWebGLContextLost={handleWebGLContextLost}
              />
            </Suspense>
          ) : (
            <ModelViewerFallback
              status={status === 'loaded' ? 'loading' : status}
              language={language}
              errorDetail={errorDetail}
              project={project}
              onRestoreDemoModel={
                hasRestorableDemo ? handleRestoreDemoModel : undefined
              }
              onTriggerLocalFilePicker={handleTriggerLocalFilePicker}
              onBackToDossier={onBackToDossier}
            />
          )}
        </div>

        <div className="lg:col-span-4 min-w-0">
          <ModelInformationPanel
            language={language}
            status={status}
            source={activeSource}
            telemetry={telemetry}
            onTriggerLocalFilePicker={handleTriggerLocalFilePicker}
            onRestoreDemoModel={
              hasRestorableDemo ? handleRestoreDemoModel : undefined
            }
            isShowingLocalFile={activeSource?.origin === 'local_temporary'}
          />
        </div>
      </div>

      {/* Loaded Architectural Nodes Strip (when a 3D scene is mounted) */}
      {status === 'loaded' && telemetry && telemetry.nodeNames.length > 0 && (
        <footer className="bg-[#111111] border border-white/10 px-4 py-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#CE826D] inline-flex items-center gap-1.5 mr-1">
            <Layers size={12} strokeWidth={1.6} aria-hidden="true" />
            <span>
              {language === 'en' ? 'SCENE ELEMENTS' : 'ELEMENTOS VOLUMÉTRICOS'}:
            </span>
          </span>
          {telemetry.nodeNames.slice(0, 12).map((nodeName) => (
            <span
              key={nodeName}
              className="px-2 py-0.5 bg-[#181818] border border-white/10 font-mono text-[11px] text-[#BDBDBD]"
            >
              {nodeName}
            </span>
          ))}
        </footer>
      )}
    </section>
  );
}

export default ArchitecturalModelViewer;
