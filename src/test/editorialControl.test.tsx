import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useWorkspaceSession,
  WorkspaceSessionProvider,
} from '../app/WorkspaceSessionContext';
import {
  buildUnifiedActivityEvents,
  filterActivityEvents,
  groupActivityEventsByDate,
} from '../data/activitySelector';
import { DEMO_USERS } from '../data/fixtures';
import {
  archiveProject,
  clearProjectLibraryLocalState,
  createProject,
  getProjectById,
  invalidateProjectLibraryCache,
  listProjects,
} from '../data/projectLibraryRepository';
import {
  clearLocalPublicationsStorage,
  getPublicationAuditSnapshot,
  invalidatePublicationsCache,
  isPublicationTransitionAllowed,
  PUBLICATIONS_LIMITS,
  PUBLICATIONS_STORAGE_KEY,
  SEED_PUBLICATION_AUDIT_ENTRIES,
  transitionProjectPublication,
} from '../data/publicationsRepository';
import {
  buildStudioReportSnapshot,
  serializeReportSnapshotJson,
} from '../data/reportsSelector';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';
import { listTasks, resetTasksLocalState } from '../data/tasksRepository';
import {
  listTechnicalReferences,
  resetTechnicalLibraryLocalState,
} from '../data/technicalLibraryRepository';
import { useEditorialControl } from '../features/editorial-control/useEditorialControl';
import {
  clearWorkspaceSearchIndexCache,
  searchWorkspaceDemo,
} from '../features/workspace-shell/globalSearchIndex';

describe('Phase 06 · Editorial Publications, Unified Activity & Derived Reports (06-DATA-01)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
    resetTasksLocalState();
    resetTechnicalLibraryLocalState();
    clearLocalPublicationsStorage();
    clearWorkspaceSearchIndexCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates allowed editorial transitions, syncs with projectLibraryRepository independently of projectStatus, persists across reload, and keeps snapshots frozen', () => {
    const initialPubSnap = getPublicationAuditSnapshot();
    expect(initialPubSnap.allEntries).toHaveLength(
      SEED_PUBLICATION_AUDIT_ENTRIES.length,
    );
    expect(Object.isFrozen(initialPubSnap)).toBe(true);
    expect(Object.isFrozen(initialPubSnap.allEntries)).toBe(true);
    expect(Object.isFrozen(initialPubSnap.entriesByProjectId)).toBe(true);

    const unsafeMap = initialPubSnap.entriesByProjectId as unknown as Record<
      string,
      unknown
    >;
    expect(unsafeMap.set).toBeUndefined();
    expect(unsafeMap.delete).toBeUndefined();
    expect(unsafeMap.clear).toBeUndefined();

    // Direct jump private -> published-demo is forbidden
    expect(isPublicationTransitionAllowed('private', 'published-demo')).toBe(
      false,
    );
    const forbidden = transitionProjectPublication(
      'sd-proj-oa-26-101',
      'published-demo',
      DEMO_USERS[0].id,
    );
    expect(forbidden.ok).toBe(false);
    expect(
      getProjectById('sd-proj-oa-26-101')?.publication.publicationStatus,
    ).toBe('private');

    // Create a local project (starts strictly private) and walk the full editorial lifecycle
    const localProj = createProject(
      {
        titlePt: 'Pavilhão Editorial da Costa',
        titleEn: 'Coastal Editorial Pavilion',
        subtitlePt: 'Teste de ciclo editorial completo em modo demo.',
        departmentId: 'architecture',
        disciplinePt: 'Arquitectura Pública',
        studioBase: 'Maputo',
        projectStatus: 'design',
        phasePt: 'Anteprojecto',
        nextMilestoneTitlePt: 'Revisão editorial',
        nextMilestoneDateIso: '2026-12-10',
        leadUserId: DEMO_USERS[1].id,
      },
      DEMO_USERS[1],
    );
    expect(localProj.publication.publicationStatus).toBe('private');
    expect(localProj.lifecycle.projectStatus).toBe('design');

    // private -> requested -> approved -> published-demo -> unpublished -> requested -> rejected -> private
    const steps = [
      'requested',
      'approved',
      'published-demo',
      'unpublished',
      'requested',
      'rejected',
      'private',
    ] as const;

    for (const nextStatus of steps) {
      const res = transitionProjectPublication(
        localProj.identity.id,
        nextStatus,
        DEMO_USERS[0].id,
        `Decisão editorial para ${nextStatus}`,
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.updatedProject.publication.publicationStatus).toBe(
          nextStatus,
        );
        // projectStatus remains strictly independent
        expect(res.updatedProject.lifecycle.projectStatus).toBe('design');
      }
    }

    // Transition to published-demo and simulate full page reload via cache invalidation
    const r1 = transitionProjectPublication(
      localProj.identity.id,
      'requested',
      DEMO_USERS[4].id,
    );
    const r2 = transitionProjectPublication(
      localProj.identity.id,
      'approved',
      DEMO_USERS[0].id,
    );
    const r3 = transitionProjectPublication(
      localProj.identity.id,
      'published-demo',
      DEMO_USERS[0].id,
    );
    expect(r1.ok && r2.ok && r3.ok).toBe(true);

    invalidateProjectLibraryCache();
    invalidatePublicationsCache();

    expect(
      getProjectById(localProj.identity.id)?.publication.publicationStatus,
    ).toBe('published-demo');
    expect(
      getPublicationAuditSnapshot().entriesByProjectId.get(
        localProj.identity.id,
      )?.length,
    ).toBe(10);
  });

  it('handles QuotaExceededError atomically (including rollback), enforces length/cap limits, recovers corrupted JSON, and syncs cross-tab StorageEvent', () => {
    const projectId = 'sd-proj-oa-26-101';
    const beforePubSnap = getPublicationAuditSnapshot();

    // Note length bound
    expect(() =>
      transitionProjectPublication(
        projectId,
        'requested',
        DEMO_USERS[4].id,
        'N'.repeat(PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH + 1),
      ),
    ).toThrow(new RegExp(String(PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH)));

    // Simulate QuotaExceededError ONLY on publications storage write -> rolls back projectLibraryRepository!
    const origSetItem = Storage.prototype.setItem;
    const partialQuotaSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (key === PUBLICATIONS_STORAGE_KEY) {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        }
        return origSetItem.call(this, key, value);
      });

    let caught: unknown = null;
    try {
      transitionProjectPublication(projectId, 'requested', DEMO_USERS[4].id);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).name).toBe('QuotaExceededError');
    expect(getPublicationAuditSnapshot().version).toBe(beforePubSnap.version);
    expect(getProjectById(projectId)?.publication.publicationStatus).toBe(
      'private',
    );
    partialQuotaSpy.mockRestore();

    // Succeed cleanly, then test cross-tab StorageEvent + corrupted JSON recovery
    const okRes = transitionProjectPublication(
      projectId,
      'requested',
      DEMO_USERS[4].id,
      'Submissão inicial',
    );
    expect(okRes.ok).toBe(true);

    const envelope = JSON.parse(
      window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY)!,
    );
    envelope.createdEntries[0].note.pt = 'Nota editada noutra aba';
    window.localStorage.setItem(
      PUBLICATIONS_STORAGE_KEY,
      JSON.stringify(envelope),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: PUBLICATIONS_STORAGE_KEY }),
    );
    expect(
      getPublicationAuditSnapshot().entriesByProjectId.get(projectId)?.[0]?.note
        .pt,
    ).toBe('Nota editada noutra aba');

    // Corrupted JSON recovery
    window.localStorage.setItem(PUBLICATIONS_STORAGE_KEY, '{invalid-json');
    window.dispatchEvent(
      new StorageEvent('storage', { key: PUBLICATIONS_STORAGE_KEY }),
    );
    expect(getPublicationAuditSnapshot().allEntries).toHaveLength(
      SEED_PUBLICATION_AUDIT_ENTRIES.length,
    );
    expect(window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY)).toBeNull();
  });

  it('derives deterministic unified activity events across all 4 domains and accurate studio reports with 0 for empty departments', () => {
    const actor = DEMO_USERS[0];
    archiveProject('sd-proj-oa-25-084', actor);
    const pubRes = transitionProjectPublication(
      'sd-proj-oa-26-112',
      'approved',
      actor.id,
      'Aprovado para pré-visualização local',
    );
    expect(pubRes.ok).toBe(true);

    const projects = listProjects({ includeArchived: true });
    const tasks = listTasks({ includeArchived: false });
    const techRefs = listTechnicalReferences();
    const pubEntries = getPublicationAuditSnapshot().allEntries;

    // 1. Unified activity selector
    const events = buildUnifiedActivityEvents(
      projects,
      tasks,
      techRefs,
      pubEntries,
    );
    expect(events.some((e) => e.domain === 'project')).toBe(true);
    expect(events.some((e) => e.domain === 'task')).toBe(true);
    expect(events.some((e) => e.domain === 'technical_library')).toBe(true);
    expect(events.some((e) => e.domain === 'publication')).toBe(true);

    // Most recent first with deterministic id tie-breaker
    for (let i = 1; i < events.length; i += 1) {
      const prev = events[i - 1];
      const curr = events[i];
      if (prev.timestampIso === curr.timestampIso) {
        expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
      } else {
        expect(prev.timestampIso >= curr.timestampIso).toBe(true);
      }
    }

    const pubOnly = filterActivityEvents(events, {
      domain: 'publication',
      query: 'aprovado',
    });
    expect(pubOnly.length).toBeGreaterThanOrEqual(1);
    expect(pubOnly.every((e) => e.domain === 'publication')).toBe(true);

    const grouped = groupActivityEventsByDate(events);
    expect(grouped.length).toBeGreaterThan(0);
    expect(
      grouped.reduce((sum, g) => sum + g.events.length, 0),
    ).toBe(events.length);

    // 2. Derived reports selector + JSON serialization
    const report = buildStudioReportSnapshot(
      projects,
      tasks,
      techRefs,
      pubEntries,
      '2026-11-23T12:00:00.000Z',
    );
    expect(report.mode).toBe('local-demo');
    expect(report.totals.projectsTotal).toBe(projects.length);
    expect(report.totals.archivedProjects).toBe(1);
    expect(report.totals.activeProjects).toBe(projects.length - 1);
    expect(report.departmentRows).toHaveLength(9);

    // Empty departments (ADM / finance, RHU / hr) strictly report 0
    for (const emptyId of ['finance', 'hr'] as const) {
      const row = report.departmentRows.find((r) => r.departmentId === emptyId)!;
      expect(row.membersCount).toBe(0);
      expect(row.totalProjectsCount).toBe(0);
      expect(row.totalTasksCount).toBe(0);
      expect(row.technicalReferencesCount).toBe(0);
      expect(row.editorialRequestedCount).toBe(0);
      expect(row.editorialPublishedDemoCount).toBe(0);
    }

    // Studio base summaries sum to total projects
    const baseSum = report.studioBaseSummaries.reduce(
      (acc, item) => acc + item.totalProjectsCount,
      0,
    );
    expect(baseSum).toBe(projects.length);

    // Editorial funnel sums to total projects
    const funnelSum = report.editorialFunnel.reduce(
      (acc, item) => acc + item.count,
      0,
    );
    expect(funnelSum).toBe(projects.length);

    const serialized = serializeReportSnapshotJson(report, 'pt');
    const parsedJson = JSON.parse(serialized);
    expect(parsedJson.mode).toBe('local-demo');
    expect(parsedJson.schema).toBe('oa-workspace-report-v1');
    expect(parsedJson.snapshot.totals.projectsTotal).toBe(projects.length);
  });

  it('indexes publications in Global Search with 0 storage reads/keystroke and cleans up via resetAllDemoData()', async () => {
    const pubMatches = searchWorkspaceDemo('Publicacao OA-26-112', 'pt');
    expect(
      pubMatches.some(
        (entry) =>
          entry.targetPath === '/workspace/publications?project=sd-proj-oa-26-112',
      ),
    ).toBe(true);

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const parseSpy = vi.spyOn(JSON, 'parse');
    for (const q of ['p', 'pu', 'pub', 'publicacao', 'relatorios', 'actividade']) {
      searchWorkspaceDemo(q, 'pt');
    }
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(parseSpy).not.toHaveBeenCalled();
    getItemSpy.mockRestore();
    parseSpy.mockRestore();

    function EditorialResetHarness() {
      const { resetAllDemoData } = useWorkspaceSession();
      const {
        queueItems,
        auditEntries,
        activityEvents,
        reportSnapshot,
        transitionPublication,
      } = useEditorialControl();
      return (
        <div>
          <span data-testid="ed-queue">{queueItems.length}</span>
          <span data-testid="ed-audit">{auditEntries.length}</span>
          <span data-testid="ed-activity">{activityEvents.length}</span>
          <span data-testid="ed-report-pub-demo">
            {
              reportSnapshot.editorialFunnel.find(
                (f) => f.status === 'published-demo',
              )?.count
            }
          </span>
          <button
            type="button"
            onClick={() => {
              transitionPublication('sd-proj-oa-26-112', 'approved', 'Aprovar');
              transitionPublication(
                'sd-proj-oa-26-112',
                'published-demo',
                'Publicar demo',
              );
            }}
          >
            Publish Demo
          </button>
          <button type="button" onClick={resetAllDemoData}>
            Reset All Demo
          </button>
        </div>
      );
    }

    persistDemoSessionForUser(DEMO_USERS[0]);
    const user = userEvent.setup();
    render(
      <WorkspaceSessionProvider>
        <EditorialResetHarness />
      </WorkspaceSessionProvider>,
    );

    expect(screen.getByTestId('ed-report-pub-demo')).toHaveTextContent('0');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Publish Demo' }));
    });

    expect(screen.getByTestId('ed-report-pub-demo')).toHaveTextContent('1');
    expect(screen.getByTestId('ed-audit')).toHaveTextContent(
      String(SEED_PUBLICATION_AUDIT_ENTRIES.length + 2),
    );
    expect(window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY)).not.toBeNull();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Reset All Demo' }));
    });

    expect(window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('ed-report-pub-demo')).toHaveTextContent('0');
    expect(screen.getByTestId('ed-audit')).toHaveTextContent(
      String(SEED_PUBLICATION_AUDIT_ENTRIES.length),
    );
  });
});
