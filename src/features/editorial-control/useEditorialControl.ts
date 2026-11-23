import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { buildUnifiedActivityEvents } from '../../data/activitySelector';
import type {
  ActivityEvent,
  PublicationActionResult,
  PublicationAuditEntry,
  PublicationQueueItem,
  StudioReportSnapshot,
} from '../../data/editorialReportsTypes';
import { canonicalToStudioDeskProject } from '../../data/projectLibraryAdapter';
import {
  clearLocalPublicationsStorage,
  getAllowedNextPublicationStatuses,
  getPublicationAuditSnapshot,
  subscribePublications,
  transitionProjectPublication,
} from '../../data/publicationsRepository';
import { buildStudioReportSnapshot } from '../../data/reportsSelector';
import type { PublicationStatus } from '../../data/types';
import { useStudioOperations } from '../operations/useStudioOperations';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import { useStudioStructure } from '../studio-structure/useStudioStructure';

export interface UseEditorialControlResult {
  queueItems: PublicationQueueItem[];
  auditEntries: PublicationAuditEntry[];
  activityEvents: ActivityEvent[];
  reportSnapshot: StudioReportSnapshot;
  transitionPublication: (
    projectId: string,
    nextStatus: PublicationStatus,
    notePt?: string,
    noteEn?: string,
  ) => PublicationActionResult;
  clearPublicationsHistory: () => void;
}

/**
 * Unified reactive Phase 06 hook combining canonical projects, tasks,
 * technical library references, and the local editorial publications repository.
 */
export function useEditorialControl(): UseEditorialControlResult {
  const { currentUser } = useWorkspaceSession();
  const { projects } = useProjectLibrary();
  const { activeTasks } = useStudioOperations();
  const { technicalReferences } = useStudioStructure();

  const publicationsSnapshot = useSyncExternalStore(
    subscribePublications,
    getPublicationAuditSnapshot,
    getPublicationAuditSnapshot,
  );

  const auditEntries = useMemo<PublicationAuditEntry[]>(
    () => [...publicationsSnapshot.allEntries],
    [publicationsSnapshot],
  );

  const queueItems = useMemo<PublicationQueueItem[]>(() => {
    return projects.map((canonicalRecord) => {
      const history =
        publicationsSnapshot.entriesByProjectId.get(
          canonicalRecord.identity.id,
        ) ?? [];
      const publicationStatus = canonicalRecord.publication.publicationStatus;
      return {
        project: canonicalToStudioDeskProject(canonicalRecord),
        canonicalRecord,
        publicationStatus,
        allowedNextStatuses: getAllowedNextPublicationStatuses(publicationStatus),
        lastAuditEntry: history[0] ?? null,
        historyCount: history.length,
        isArchived:
          canonicalRecord.metadata.isArchived ||
          canonicalRecord.lifecycle.projectStatus === 'archived',
      };
    });
  }, [projects, publicationsSnapshot]);

  const activityEvents = useMemo<ActivityEvent[]>(
    () =>
      buildUnifiedActivityEvents(
        projects,
        activeTasks,
        technicalReferences,
        publicationsSnapshot.allEntries,
      ),
    [projects, activeTasks, technicalReferences, publicationsSnapshot.allEntries],
  );

  const reportSnapshot = useMemo<StudioReportSnapshot>(
    () =>
      buildStudioReportSnapshot(
        projects,
        activeTasks,
        technicalReferences,
        publicationsSnapshot.allEntries,
      ),
    [projects, activeTasks, technicalReferences, publicationsSnapshot.allEntries],
  );

  const transitionPublication = useCallback(
    (
      projectId: string,
      nextStatus: PublicationStatus,
      notePt?: string,
      noteEn?: string,
    ): PublicationActionResult => {
      if (!currentUser) {
        return {
          ok: false,
          error:
            'Sessão demonstrativa obrigatória para executar transições editoriais.',
        };
      }
      return transitionProjectPublication(
        projectId,
        nextStatus,
        currentUser.id,
        notePt,
        noteEn,
      );
    },
    [currentUser],
  );

  const clearPublicationsHistory = useCallback(() => {
    clearLocalPublicationsStorage();
  }, []);

  return {
    queueItems,
    auditEntries,
    activityEvents,
    reportSnapshot,
    transitionPublication,
    clearPublicationsHistory,
  };
}
