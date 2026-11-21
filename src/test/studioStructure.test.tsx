import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useWorkspaceSession,
  WorkspaceSessionProvider,
} from '../app/WorkspaceSessionContext';
import { DEMO_USERS, DEPARTMENTS } from '../data/fixtures';
import {
  archiveProject,
  clearProjectLibraryLocalState,
  listStudioDeskCompatibleProjects,
} from '../data/projectLibraryRepository';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';
import {
  buildDepartmentProfiles,
  buildTeamMemberProfiles,
  CANONICAL_DEPARTMENT_ORDER,
} from '../data/studioStructureSelectors';
import { listTasks, resetTasksLocalState } from '../data/tasksRepository';
import {
  createTechnicalReference,
  getTechnicalLibrarySnapshot,
  getTechnicalReferenceById,
  listTechnicalReferences,
  resetTechnicalLibraryLocalState,
  SEED_TECHNICAL_REFERENCES,
  TECHNICAL_LIBRARY_LIMITS,
  TECHNICAL_LIBRARY_STORAGE_KEY,
} from '../data/technicalLibraryRepository';
import { useStudioStructure } from '../features/studio-structure/useStudioStructure';
import {
  clearWorkspaceSearchIndexCache,
  searchWorkspaceDemo,
} from '../features/workspace-shell/globalSearchIndex';

describe('Phase 05 · Module 2 — Departments, Team Selectors & Technical Library Repository', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
    resetTasksLocalState();
    resetTechnicalLibraryLocalState();
    clearWorkspaceSearchIndexCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives all 9 departments in canonical order with 100% real counts (0 for empty departments) and 6 team members without demoAccessKey', () => {
    // Archive one seed project to verify active vs archived counts derive dynamically
    archiveProject('sd-proj-oa-25-084', DEMO_USERS[0]);

    const projects = listStudioDeskCompatibleProjects({ includeArchived: true });
    const tasks = listTasks({ includeArchived: false });
    const techRefs = listTechnicalReferences();

    const departments = buildDepartmentProfiles(projects, tasks, techRefs);
    expect(departments).toHaveLength(Object.keys(DEPARTMENTS).length);
    expect(departments.map((d) => d.department.id)).toEqual([
      ...CANONICAL_DEPARTMENT_ORDER,
    ]);

    // Architecture has 1 active seed project (OA-26-101) and 1 archived seed project (OA-25-084)
    const arch = departments.find((d) => d.department.id === 'architecture')!;
    expect(arch.activeProjectsCount).toBe(1);
    expect(arch.archivedProjectsCount).toBe(1);
    expect(arch.members).toHaveLength(1);
    expect(arch.technicalReferences.length).toBeGreaterThan(0);

    // Empty departments (ADM / finance, RHU / hr) report strictly 0 — never invented metrics
    for (const emptyDeptId of ['finance', 'hr'] as const) {
      const profile = departments.find((d) => d.department.id === emptyDeptId)!;
      expect(profile.members).toHaveLength(0);
      expect(profile.projects).toHaveLength(0);
      expect(profile.activeProjectsCount).toBe(0);
      expect(profile.archivedProjectsCount).toBe(0);
      expect(profile.tasks).toHaveLength(0);
      expect(profile.pendingTasksCount).toBe(0);
      expect(profile.inProgressTasksCount).toBe(0);
      expect(profile.completedTasksCount).toBe(0);
      expect(profile.technicalReferences).toHaveLength(0);
    }

    // Zero demoAccessKey leakage in department members
    for (const dept of departments) {
      for (const member of dept.members) {
        expect('demoAccessKey' in member).toBe(false);
      }
    }

    // All 6 team members derived without demoAccessKey and with distinct project roles
    const team = buildTeamMemberProfiles(projects, tasks);
    expect(team).toHaveLength(DEMO_USERS.length);
    for (const profile of team) {
      expect('demoAccessKey' in profile.user).toBe(false);
      expect(profile.department.id).toBe(profile.user.departmentId);
      expect(profile.openTasksCount + profile.completedTasksCount).toBe(
        profile.assignedTasks.length,
      );
    }

    const mateo = team.find((m) => m.user.id === 'usr-arq-02')!;
    expect(mateo.ledProjects.some((p) => p.id === 'sd-proj-oa-26-101')).toBe(
      true,
    );
    expect(mateo.assignedTasks.length).toBeGreaterThan(0);
  });

  it('supports local metadata-only technical reference creation, immutable snapshots, and strict validation/quota bounds', () => {
    const initialSnapshot = getTechnicalLibrarySnapshot();
    expect(initialSnapshot.allReferences).toHaveLength(
      SEED_TECHNICAL_REFERENCES.length,
    );
    expect(Object.isFrozen(initialSnapshot)).toBe(true);
    expect(Object.isFrozen(initialSnapshot.allReferences)).toBe(true);
    expect(Object.isFrozen(initialSnapshot.allReferences[0])).toBe(true);
    expect(Object.isFrozen(initialSnapshot.lookupMap)).toBe(true);

    const unsafeLookup = initialSnapshot.lookupMap as unknown as Record<
      string,
      unknown
    >;
    expect(unsafeLookup.set).toBeUndefined();
    expect(unsafeLookup.delete).toBeUndefined();
    expect(unsafeLookup.clear).toBeUndefined();
    expect(() => {
      unsafeLookup.get = () => undefined;
    }).toThrow(TypeError);

    const validInput = {
      category: 'material' as const,
      titlePt: 'Pedra Basáltica Serrada de Namaacha',
      titleEn: 'Sawn Namaacha Basalt Stone',
      summaryPt: 'Pedra vulcânica local para embasamentos e soleiras drenantes.',
      summaryEn: 'Local volcanic stone for plinths and permeable thresholds.',
      technicalSpecsPt: 'Absorção de água < 1,2% · Acabamento bujardado fino.',
      technicalSpecsEn: 'Water absorption < 1.2% · Fine bush-hammered finish.',
      originRegionPt: 'Namaacha · Maputo (Demo)',
      originRegionEn: 'Namaacha · Maputo (Demo)',
      standardsTag: 'EN 1341 · Classe F2',
      departmentId: 'architecture' as const,
      relatedProjectIds: ['sd-proj-oa-26-101'],
      referenceCitationPt: 'Caderno de Pedras O+A · Ensaio Local (Demo).',
      referenceCitationEn: 'O+A Stone Log · Local Trial (Demo).',
    };

    const created = createTechnicalReference(validInput);
    expect(created.origin).toBe('local-created');
    expect(created.code).toBe('MAT-004');
    expect(getTechnicalReferenceById(created.id)?.title.pt).toBe(
      'Pedra Basáltica Serrada de Namaacha',
    );
    expect(getTechnicalReferenceById('MAT-004')?.id).toBe(created.id);

    // Duplicate code rejected
    expect(() =>
      createTechnicalReference({ ...validInput, code: 'MAT-004' }),
    ).toThrow(/já existe/i);

    // Invalid project ID rejected
    expect(() =>
      createTechnicalReference({
        ...validInput,
        relatedProjectIds: ['non-existent-project'],
      }),
    ).toThrow(/não foi encontrado/i);

    // Length limit enforced
    expect(() =>
      createTechnicalReference({
        ...validInput,
        titlePt: 'T'.repeat(TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH + 1),
      }),
    ).toThrow(new RegExp(String(TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH)));

    // Cap: MAX_LOCAL_TECH_REFS = 100
    const filled = Array.from(
      { length: TECHNICAL_LIBRARY_LIMITS.MAX_LOCAL_TECH_REFS },
      (_, idx) => ({
        ...created,
        id: `tech-cap-${idx}`,
        code: `MAT-${String(idx + 100)}`,
      }),
    );
    window.localStorage.setItem(
      TECHNICAL_LIBRARY_STORAGE_KEY,
      JSON.stringify({ version: 1, createdReferences: filled }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: TECHNICAL_LIBRARY_STORAGE_KEY }),
    );
    expect(() => createTechnicalReference(validInput)).toThrow(
      new RegExp(String(TECHNICAL_LIBRARY_LIMITS.MAX_LOCAL_TECH_REFS)),
    );
  });

  it('handles QuotaExceededError atomically, recovers from corrupted JSON, and synchronizes cross-tab StorageEvent', () => {
    const baseInput = {
      category: 'constructive_system' as const,
      titlePt: 'Estrutura Mista Madeira-Aço',
      summaryPt: 'Pórticos leves de montagem seca para grandes vãos.',
      technicalSpecsPt: 'Vigas GL28h + conectores aço S355 galvanizado.',
      originRegionPt: 'Milão / Maputo (Demo)',
      standardsTag: 'EN 1995-1-1',
      departmentId: 'architecture' as const,
      relatedProjectIds: ['sd-proj-oa-26-101'],
      referenceCitationPt: 'Caderno Estrutural O+A (Demo).',
    };

    const created = createTechnicalReference(baseInput);
    const snapshotBefore = getTechnicalLibrarySnapshot();

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    let caught: unknown = null;
    try {
      createTechnicalReference({
        ...baseInput,
        titlePt: 'Referência Não Persistida',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).name).toBe('QuotaExceededError');
    expect(getTechnicalLibrarySnapshot().version).toBe(snapshotBefore.version);
    expect(listTechnicalReferences()).toHaveLength(
      SEED_TECHNICAL_REFERENCES.length + 1,
    );
    setItemSpy.mockRestore();

    // Cross-tab StorageEvent update
    const envelope = JSON.parse(
      window.localStorage.getItem(TECHNICAL_LIBRARY_STORAGE_KEY)!,
    );
    envelope.createdReferences[0].title.pt = 'Estrutura Mista · Outra Aba';
    window.localStorage.setItem(
      TECHNICAL_LIBRARY_STORAGE_KEY,
      JSON.stringify(envelope),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: TECHNICAL_LIBRARY_STORAGE_KEY }),
    );
    expect(getTechnicalReferenceById(created.id)?.title.pt).toBe(
      'Estrutura Mista · Outra Aba',
    );

    // Corrupted JSON recovery
    window.localStorage.setItem(TECHNICAL_LIBRARY_STORAGE_KEY, '{broken-json');
    window.dispatchEvent(
      new StorageEvent('storage', { key: TECHNICAL_LIBRARY_STORAGE_KEY }),
    );
    expect(listTechnicalReferences()).toHaveLength(
      SEED_TECHNICAL_REFERENCES.length,
    );
    expect(window.localStorage.getItem(TECHNICAL_LIBRARY_STORAGE_KEY)).toBeNull();
  });

  it('indexes departments, team members, and technical references in Global Search with 0 storage reads/keystroke and clears on resetAllDemoData()', async () => {
    // Warm caches and verify deep links for departments, team, and technical library
    const deptResults = searchWorkspaceDemo('Urbanismo', 'pt');
    expect(
      deptResults.some((r) => r.targetPath === '/workspace/departments?dept=urbanism'),
    ).toBe(true);

    const teamResults = searchWorkspaceDemo('EQUIPA ARQ-02', 'pt');
    expect(
      teamResults.some((r) => r.targetPath === '/workspace/team?member=usr-arq-02'),
    ).toBe(true);

    const techResults = searchWorkspaceDemo('MAT-001', 'pt');
    expect(
      techResults.some((r) => r.targetPath === '/workspace/library?ref=tech-mat-001'),
    ).toBe(true);

    // Zero storage reads and zero JSON.parse during keystrokes
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const parseSpy = vi.spyOn(JSON, 'parse');
    for (const q of ['m', 'ma', 'mat', 'umbila', 'ventilacao', 'urbanismo']) {
      searchWorkspaceDemo(q, 'pt');
    }
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(parseSpy).not.toHaveBeenCalled();
    getItemSpy.mockRestore();
    parseSpy.mockRestore();

    // Create local technical reference -> immediately searchable
    const created = createTechnicalReference({
      category: 'technical_study',
      titlePt: 'Microclima de Pátios Sombreados na Baía',
      titleEn: 'Shaded Courtyard Microclimate Study',
      summaryPt: 'Análise de conforto radiante sob pérgolas vegetadas.',
      technicalSpecsPt: 'Redução de temperatura radiante média ΔMRT ≈ -4,5 °C.',
      originRegionPt: 'Maputo (Demo)',
      standardsTag: 'ISO 7726',
      departmentId: 'research',
      relatedProjectIds: ['sd-proj-oa-26-101'],
      referenceCitationPt: 'Estudo Interno O+A (Demo).',
    });

    expect(
      searchWorkspaceDemo('Microclima', 'pt').some(
        (r) => r.targetPath === `/workspace/library?ref=${created.id}`,
      ),
    ).toBe(true);

    // Reactive useStudioStructure + WorkspaceSessionProvider.resetAllDemoData()
    function StructureResetHarness() {
      const { resetAllDemoData } = useWorkspaceSession();
      const { departments, teamMembers, technicalReferences, getTechnicalReferenceById: getRef } =
        useStudioStructure();
      return (
        <div>
          <span data-testid="dept-count">{departments.length}</span>
          <span data-testid="team-count">{teamMembers.length}</span>
          <span data-testid="tech-count">{technicalReferences.length}</span>
          <span data-testid="has-created">{getRef(created.id) ? 'yes' : 'no'}</span>
          <button type="button" onClick={resetAllDemoData}>
            Reset All Demo
          </button>
        </div>
      );
    }

    persistDemoSessionForUser(DEMO_USERS[1]);
    const user = userEvent.setup();
    render(
      <WorkspaceSessionProvider>
        <StructureResetHarness />
      </WorkspaceSessionProvider>,
    );

    expect(screen.getByTestId('dept-count')).toHaveTextContent('9');
    expect(screen.getByTestId('team-count')).toHaveTextContent('6');
    expect(screen.getByTestId('tech-count')).toHaveTextContent(
      String(SEED_TECHNICAL_REFERENCES.length + 1),
    );
    expect(screen.getByTestId('has-created')).toHaveTextContent('yes');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Reset All Demo' }));
    });

    expect(window.localStorage.getItem(TECHNICAL_LIBRARY_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('tech-count')).toHaveTextContent(
      String(SEED_TECHNICAL_REFERENCES.length),
    );
    expect(screen.getByTestId('has-created')).toHaveTextContent('no');
    expect(
      searchWorkspaceDemo('Microclima', 'pt').some(
        (r) => r.targetPath === `/workspace/library?ref=${created.id}`,
      ),
    ).toBe(false);
  });
});
