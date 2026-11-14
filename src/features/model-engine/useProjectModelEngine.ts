import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  clearAllSessionModels,
  clearSessionModelForProject,
  resolveProjectModelState,
  selectSessionModelFile,
  subscribeModelEngineChanges,
} from '../../data/modelAssetRepository';
import type {
  ModelFileValidationFailure,
  ModelLoadState,
  ResolvedProjectModelResolution,
} from '../../data/modelAssetTypes';
import { pickLocalized } from '../../locales';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import {
  buildModelContextFromProject,
  buildModelSourceFromResolution,
  type ModelContext,
  type ModelLoadedMetrics,
  type ModelSource,
} from './modelViewerContract';

interface ScopedEngineTransientState {
  scopeKey: string;
  preferredDemoAssetId: string | null;
  ignoreDemoAsset: boolean;
  isValidatingFile: boolean;
  lastValidationFailure: ModelFileValidationFailure | null;
  viewerRuntimeError: string | null;
  loadedMetrics: ModelLoadedMetrics | null;
}

const DEFAULT_TRANSIENT_FIELDS = {
  preferredDemoAssetId: null,
  ignoreDemoAsset: false,
  isValidatingFile: false,
  lastValidationFailure: null,
  viewerRuntimeError: null,
  loadedMetrics: null,
} as const;

export function useProjectModelEngine(projectId: string | undefined) {
  const { currentUser, language, demoResetEpoch } = useWorkspaceSession();
  const { getProject } = useProjectLibrary();

  const scopeKey = `${projectId ?? ''}::${demoResetEpoch}`;
  const [engineRevision, setEngineRevision] = useState(0);
  const [transientState, setTransientState] =
    useState<ScopedEngineTransientState>(() => ({
      scopeKey,
      ...DEFAULT_TRANSIENT_FIELDS,
    }));

  const activeTransient = useMemo<ScopedEngineTransientState>(() => {
    if (transientState.scopeKey === scopeKey) {
      return transientState;
    }
    return {
      scopeKey,
      ...DEFAULT_TRANSIENT_FIELDS,
    };
  }, [transientState, scopeKey]);

  const updateTransient = useCallback(
    (
      updater: (
        current: ScopedEngineTransientState,
      ) => Partial<Omit<ScopedEngineTransientState, 'scopeKey'>>,
    ) => {
      setTransientState((prev) => {
        const base =
          prev.scopeKey === scopeKey
            ? prev
            : { scopeKey, ...DEFAULT_TRANSIENT_FIELDS };
        return {
          ...base,
          ...updater(base),
          scopeKey,
        };
      });
    },
    [scopeKey],
  );

  useEffect(() => {
    return subscribeModelEngineChanges(() => {
      setEngineRevision((prev) => prev + 1);
    });
  }, []);

  // Synchronize external session ObjectURL store on global demo reset
  useEffect(() => {
    if (demoResetEpoch > 0) {
      clearAllSessionModels();
    }
  }, [demoResetEpoch]);

  const {
    preferredDemoAssetId,
    ignoreDemoAsset,
    isValidatingFile,
    lastValidationFailure,
    viewerRuntimeError,
    loadedMetrics,
  } = activeTransient;

  const project = getProject(projectId);

  const resolution = useMemo<ResolvedProjectModelResolution | null>(() => {
    void engineRevision;
    if (!project) {
      return null;
    }
    return resolveProjectModelState(project, {
      preferredDemoAssetId,
      ignoreDemoAsset,
      lastValidationFailure,
    });
  }, [
    project,
    preferredDemoAssetId,
    ignoreDemoAsset,
    lastValidationFailure,
    engineRevision,
  ]);

  const source = useMemo<ModelSource | null>(() => {
    if (!resolution) {
      return null;
    }
    return buildModelSourceFromResolution(resolution);
  }, [resolution]);

  const context = useMemo<ModelContext | null>(() => {
    if (!project) {
      return null;
    }
    return buildModelContextFromProject(
      project,
      language,
      currentUser?.role ?? 'architect',
    );
  }, [project, language, currentUser?.role]);

  const loadState = useMemo<ModelLoadState>(() => {
    if (isValidatingFile) {
      return 'loading';
    }
    if (lastValidationFailure || viewerRuntimeError) {
      return 'error';
    }
    if (resolution?.hasLoadableModel) {
      return 'ready';
    }
    return 'idle';
  }, [
    isValidatingFile,
    lastValidationFailure,
    viewerRuntimeError,
    resolution?.hasLoadableModel,
  ]);

  const activeErrorMessage = useMemo<string | null>(() => {
    if (viewerRuntimeError) {
      return viewerRuntimeError;
    }
    if (lastValidationFailure) {
      return pickLocalized(lastValidationFailure.message, language);
    }
    return null;
  }, [viewerRuntimeError, lastValidationFailure, language]);

  const handleSelectLocalFile = useCallback(
    async (file: File) => {
      if (!project) {
        return;
      }
      updateTransient(() => ({
        isValidatingFile: true,
        lastValidationFailure: null,
        viewerRuntimeError: null,
      }));
      try {
        const result = await selectSessionModelFile(project.identity.id, file);
        if (!result.ok) {
          updateTransient(() => ({
            isValidatingFile: false,
            lastValidationFailure: result,
          }));
        } else {
          updateTransient(() => ({
            isValidatingFile: false,
            lastValidationFailure: null,
            loadedMetrics: null,
          }));
        }
      } catch {
        updateTransient(() => ({
          isValidatingFile: false,
        }));
      }
    },
    [project, updateTransient],
  );

  const handleClearLocalFile = useCallback(() => {
    if (!project) {
      return;
    }
    clearSessionModelForProject(project.identity.id);
    updateTransient(() => ({
      lastValidationFailure: null,
      viewerRuntimeError: null,
      loadedMetrics: null,
    }));
  }, [project, updateTransient]);

  const handleSelectDemoAsset = useCallback(
    (demoAssetId: string) => {
      updateTransient(() => ({
        ignoreDemoAsset: false,
        preferredDemoAssetId: demoAssetId,
        lastValidationFailure: null,
        viewerRuntimeError: null,
        loadedMetrics: null,
      }));
    },
    [updateTransient],
  );

  const handleToggleIgnoreDemoAsset = useCallback(
    (ignore: boolean) => {
      updateTransient(() => ({
        ignoreDemoAsset: ignore,
        lastValidationFailure: null,
        viewerRuntimeError: null,
        loadedMetrics: null,
      }));
    },
    [updateTransient],
  );

  const handleModelLoaded = useCallback(
    (metrics?: ModelLoadedMetrics) => {
      updateTransient(() => ({
        viewerRuntimeError: null,
        loadedMetrics: metrics ?? {},
      }));
    },
    [updateTransient],
  );

  const handleModelError = useCallback(
    (message: string) => {
      updateTransient(() => ({
        viewerRuntimeError: message,
      }));
    },
    [updateTransient],
  );

  const clearErrors = useCallback(() => {
    updateTransient(() => ({
      lastValidationFailure: null,
      viewerRuntimeError: null,
    }));
  }, [updateTransient]);

  return {
    project,
    resolution,
    source,
    context,
    loadState,
    activeErrorMessage,
    lastValidationFailure,
    loadedMetrics,
    ignoreDemoAsset,
    handleSelectLocalFile,
    handleClearLocalFile,
    handleSelectDemoAsset,
    handleToggleIgnoreDemoAsset,
    handleModelLoaded,
    handleModelError,
    clearErrors,
  };
}
