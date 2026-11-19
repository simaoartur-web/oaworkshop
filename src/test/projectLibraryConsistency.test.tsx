import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import {
  archiveProject,
  clearProjectLibraryLocalState,
  createProject,
  getProjectById,
  getProjectLibrarySnapshot,
  listProjects,
  listStudioDeskCompatibleProjects,
  PROJECT_LIBRARY_LIMITS,
  PROJECT_LIBRARY_STORAGE_KEY,
  resetProjectLibraryState,
  restoreProjectFromArchive,
  updateProjectMetadata,
} from '../data/projectLibraryRepository';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';
import { STUDIO_DESK_TASKS } from '../data/studioDeskFixtures';
import {
  clearWorkspaceSearchIndexCache,
  searchWorkspaceDemo,
} from '../features/workspace-shell/globalSearchIndex';

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('Phase 04.5A · Data Cache Performance, Global Search & Studio Desk Consistency', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
    clearWorkspaceSearchIndexCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('caches reads after lazy initialization, keeps internal records immutable, and avoids re-parsing across consecutive reads', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const parseSpy = vi.spyOn(JSON, 'parse');

    const first = listProjects({ includeArchived: true });
    expect(first).toHaveLength(5);
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledTimes(0); // key absent (empty storage -> no JSON.parse needed)

    // Repeat imperative reads, O(1) lookup, and Studio Desk conversion: ZERO additional storage reads/parses
    const second = listProjects({ includeArchived: false });
    const deskCompat = listStudioDeskCompatibleProjects({ includeArchived: true });
    const byId = getProjectById('sd-proj-oa-26-101');
    const byCode = getProjectById('OA-26-108');

    expect(second).toHaveLength(5);
    expect(deskCompat).toHaveLength(5);
    expect(byId?.identity.code).toBe('OA-26-101');
    expect(byCode?.identity.id).toBe('sd-proj-oa-26-108');
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledTimes(0);

    // Defensive immutability: records held in cache are frozen
    expect(Object.isFrozen(byId)).toBe(true);
    expect(Object.isFrozen(deskCompat[0])).toBe(true);
  });

  it('invalidates cache on cross-tab StorageEvent and never commits failed QuotaExceededError writes to cache', () => {
    const actor = DEMO_USERS[1]; // Sofia Mbanza
    const created = createProject(
      {
        titlePt: 'Miradouro Atlântico',
        subtitlePt: 'Equipamento costeiro em pedra e madeira.',
        departmentId: 'architecture',
        disciplinePt: 'Arquitectura Pública',
        studioBase: 'Maputo',
        projectStatus: 'concept',
        phasePt: 'Estudo Prévio',
        nextMilestoneTitlePt: 'Entrega preliminar',
        nextMilestoneDateIso: '2026-12-20',
        leadUserId: actor.id,
      },
      actor,
    );

    expect(listProjects({ includeArchived: true })).toHaveLength(6);

    // Trigger QuotaExceededError on write: error propagates AND cache must remain unpolluted (still 6, title unchanged)
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    let caught: unknown = null;
    try {
      updateProjectMetadata(
        created.identity.id,
        { title: { pt: 'Título Não Persistido', en: 'Unpersisted Title' } },
        actor,
      );
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).name).toBe('QuotaExceededError');
    expect(getProjectById(created.identity.id)?.editorial.title.pt).toBe(
      'Miradouro Atlântico',
    );
    setItemSpy.mockRestore();

    // Cross-tab storage synchronization invalidates cache cleanly
    const envelope = JSON.parse(
      window.localStorage.getItem(PROJECT_LIBRARY_STORAGE_KEY)!,
    );
    envelope.createdRecords[0].editorial.title.pt = 'Miradouro Actualizado Outra Aba';
    window.localStorage.setItem(
      PROJECT_LIBRARY_STORAGE_KEY,
      JSON.stringify(envelope),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: PROJECT_LIBRARY_STORAGE_KEY }),
    );

    expect(getProjectById(created.identity.id)?.editorial.title.pt).toBe(
      'Miradouro Actualizado Outra Aba',
    );

    // Reset invalidates cache and restores defaults
    const afterReset = resetProjectLibraryState();
    expect(afterReset).toHaveLength(5);
    expect(getProjectById(created.identity.id)).toBeNull();
  });

  it('performs 0 storage reads and 0 JSON.parse calls during keystrokes in GlobalSearchDialog and refreshes reactively across mutations, roles, and PT/EN', async () => {
    const actor = DEMO_USERS[1];
    persistDemoSessionForUser(actor);
    const user = userEvent.setup();

    renderAt('/workspace/projects');
    const openSearchBtn = await screen.findByRole('button', {
      name: /Abrir pesquisa demonstrativa local/i,
    });

    // Open Global Search once (index builds cleanly for current library version)
    await user.click(openSearchBtn);
    const searchInput = await screen.findByRole('combobox');

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const parseSpy = vi.spyOn(JSON, 'parse');

    await user.type(searchInput, 'arquitectu');
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(parseSpy).not.toHaveBeenCalled();

    // Close, create a new project, re-open search -> new project is indexed immediately
    await user.keyboard('{Escape}');
    getItemSpy.mockRestore();
    parseSpy.mockRestore();

    let created!: ReturnType<typeof createProject>;
    act(() => {
      created = createProject(
        {
          titlePt: 'Anfiteatro da Marginal',
          titleEn: 'Waterfront Amphitheatre',
          subtitlePt: 'Equipamento cultural de madeira e betão.',
          departmentId: 'architecture',
          disciplinePt: 'Arquitectura Pública',
          studioBase: 'Maputo',
          projectStatus: 'design',
          phasePt: 'Anteprojecto',
          nextMilestoneTitlePt: 'Revisão conjunta',
          nextMilestoneDateIso: '2026-12-18',
          leadUserId: actor.id,
        },
        actor,
      );
    });

    await user.click(
      screen.getByRole('button', { name: /Abrir pesquisa demonstrativa local/i }),
    );
    const searchDialog = await screen.findByRole('dialog');
    const reopenedInput = await within(searchDialog).findByRole('combobox');
    await user.type(reopenedInput, 'anfiteatro');
    expect(
      await within(searchDialog).findByText('Anfiteatro da Marginal'),
    ).toBeInTheDocument();
    expect(
      within(searchDialog).getByText(new RegExp(created.identity.code, 'i')),
    ).toBeInTheDocument();

    // Verify EN results & direct NFD-normalized query
    const enResults = searchWorkspaceDemo('waterfront', 'en');
    expect(enResults.some((item) => item.id === `project-${created.identity.id}`)).toBe(
      true,
    );

    // Switch role profile cleanly via Global Search works as expected across all 6 profiles
    for (const demoUser of DEMO_USERS) {
      const roleResults = searchWorkspaceDemo(demoUser.code, 'pt');
      expect(roleResults.some((r) => r.switchToRole === demoUser.role)).toBe(
        true,
      );
    }
  });

  it('synchronizes StudioDeskPage and ProjectDossierDialog with canonical create/edit/archive/restore without inventing tasks, and preserves ?project= deep links', async () => {
    const actor = DEMO_USERS[1]; // Sofia Mbanza (usr-arq-02)
    persistDemoSessionForUser(actor);
    const user = userEvent.setup();

    // 1. Create a new local project assigned to Sofia
    const created = createProject(
      {
        titlePt: 'Centro Cultural de Inhambane',
        titleEn: 'Inhambane Cultural Center',
        subtitlePt: 'Recinto cívico em cobertura ventilada.',
        departmentId: 'architecture',
        disciplinePt: 'Arquitectura Pública',
        studioBase: 'Maputo',
        projectStatus: 'in_progress',
        phasePt: 'Projecto Executivo',
        nextMilestoneTitlePt: 'Coordenação estrutural',
        nextMilestoneDateIso: '2026-12-22',
        leadUserId: actor.id,
      },
      actor,
    );

    const view = renderAt('/workspace');
    const overviewHeading = await screen.findByRole('heading', {
      name: /Projectos atribuídos e dossiers/i,
    });
    const overviewSection = overviewHeading.closest('section')!;
    expect(
      await within(overviewSection).findByText('Centro Cultural de Inhambane'),
    ).toBeInTheDocument();

    // No invented tasks for new projects: PrioritiesPanel remains sourced solely from STUDIO_DESK_TASKS
    const myTaskCount = STUDIO_DESK_TASKS.filter(
      (t) => t.assigneeUserId === actor.id,
    ).length;
    expect(myTaskCount).toBeGreaterThan(0);

    // 2. Edit seed project OA-26-101 & newly created project -> Studio Desk updates live!
    act(() => {
      updateProjectMetadata(
        created.identity.id,
        {
          title: {
            pt: 'Centro Cultural de Inhambane · Revisto',
            en: 'Inhambane Cultural Center · Revised',
          },
          phase: { pt: 'Coordenação Final', en: 'Final Coordination' },
        },
        actor,
      );
    });

    const updatedCardTitle = await within(overviewSection).findByText(
      'Centro Cultural de Inhambane · Revisto',
    );
    expect(updatedCardTitle).toBeInTheDocument();

    // Open modal dossier in Studio Desk -> update again via storage -> dialog displays fresh canonical data (no stale snapshot)
    const cardArticle = updatedCardTitle.closest('article')!;
    const cardButton = within(cardArticle).getByRole('button', {
      name: /Detalhes/i,
    });
    await user.click(cardButton);

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', {
        name: 'Centro Cultural de Inhambane · Revisto',
      }),
    ).toBeInTheDocument();

    act(() => {
      updateProjectMetadata(
        created.identity.id,
        {
          dossierNotes: {
            pt: 'Nota em tempo real dentro do diálogo aberto.',
            en: 'Live note while dialog is open.',
          },
        },
        actor,
      );
    });
    expect(
      await within(dialog).findByText(
        'Nota em tempo real dentro do diálogo aberto.',
      ),
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');

    // 3. Archive created project -> disappears from active Studio Desk list ('Todos'), appears when selecting 'Arquivado'
    act(() => {
      archiveProject(created.identity.id, actor);
    });
    await waitFor(() => {
      expect(
        within(overviewSection).queryByText('Centro Cultural de Inhambane · Revisto'),
      ).not.toBeInTheDocument();
    });

    await user.click(
      within(overviewSection).getByRole('button', { name: /^Arquivado$/i }),
    );
    expect(
      await within(overviewSection).findByText('Centro Cultural de Inhambane · Revisto'),
    ).toBeInTheDocument();

    // 4. Restore -> returns cleanly to active lists
    act(() => {
      restoreProjectFromArchive(created.identity.id, 'in_progress', actor);
    });
    await user.click(
      within(overviewSection).getByRole('button', { name: /^Todos$/i }),
    );
    expect(
      await within(overviewSection).findByText('Centro Cultural de Inhambane · Revisto'),
    ).toBeInTheDocument();
    view.unmount();

    // 5. Verify ?project= deep link works for both newly created projects and seed projects
    const deepView = renderAt(`/workspace?project=${created.identity.id}`);
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Centro Cultural de Inhambane · Revisto',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/PROJECTO EM DESTAQUE · PESQUISA \/ URL/i),
    ).toBeInTheDocument();
    deepView.unmount();
  });

  it('maintains single-parse O(1) lookup and zero storage keystroke reads up to 50 and 200 synthetic projects without lifting the 50-project creation limit', () => {
    expect(PROJECT_LIBRARY_LIMITS.MAX_LOCAL_PROJECTS).toBe(50);

    // Inject 195 synthetic records + 5 seeds = 200 total projects cleanly in storage for benchmark verification
    const now = '2026-11-18T12:00:00.000Z';
    const baseSeed = getProjectById('sd-proj-oa-26-101')!;
    const createdRecords = Array.from({ length: 195 }, (_, idx) => ({
      ...baseSeed,
      identity: {
        id: `proj-synth-${idx}`,
        code: `OA-99-${String(idx).padStart(3, '0')}`,
        slug: `oa-99-${String(idx).padStart(3, '0')}-benchmark`,
      },
      editorial: {
        ...baseSeed.editorial,
        title: {
          pt: `Projecto Sintético Escala ${idx + 1}`,
          en: `Scale Benchmark Project ${idx + 1}`,
        },
      },
      publication: { publicationStatus: 'private' as const },
      metadata: {
        origin: 'local-created' as const,
        isArchived: false,
        createdAtIso: now,
        updatedAtIso: now,
        createdByUserId: 'usr-arq-02',
        updatedByUserId: 'usr-arq-02',
      },
    }));

    window.localStorage.setItem(
      PROJECT_LIBRARY_STORAGE_KEY,
      JSON.stringify({ version: 1, overridesById: {}, createdRecords }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: PROJECT_LIBRARY_STORAGE_KEY }),
    );

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const parseSpy = vi.spyOn(JSON, 'parse');

    // Cold load parses ONCE for all 200 projects
    const loaded200 = listProjects({ includeArchived: true });
    expect(loaded200).toHaveLength(200);
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledTimes(1);

    // Warm search index builds once then answers repeated searches with ZERO storage reads/parses
    const firstQuery = searchWorkspaceDemo('Escala 195', 'pt');
    expect(firstQuery.some((r) => r.id === 'project-proj-synth-194')).toBe(true);
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledTimes(1);

    for (const term of ['e', 'es', 'esc', 'esca', 'escal', 'escala 42', 'oa-99-100']) {
      searchWorkspaceDemo(term, 'pt');
    }
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledTimes(1);

    // Attempting to create a 51st/196th local project is still strictly rejected by MAX_LOCAL_PROJECTS
    expect(() =>
      createProject(
        {
          titlePt: 'Excede Limite',
          subtitlePt: 'Deve falhar pelo limite persistente.',
          departmentId: 'architecture',
          disciplinePt: 'Arquitectura',
          studioBase: 'Maputo',
          projectStatus: 'concept',
          phasePt: 'Estudo Prévio',
          nextMilestoneTitlePt: 'Marco',
          nextMilestoneDateIso: '2026-12-20',
          leadUserId: 'usr-arq-02',
        },
        DEMO_USERS[1],
      ),
    ).toThrow(/50/);
  });

  it('encapsulates snapshot.lookupMap against external consumer mutation (P2)', () => {
    const snapshot = getProjectLibrarySnapshot();
    const initialSize = snapshot.lookupMap.size;
    expect(initialSize).toBeGreaterThan(0);
    expect(Object.isFrozen(snapshot.lookupMap)).toBe(true);

    // Mutating methods must not exist on the exposed ReadonlyMap view
    const unsafeView = snapshot.lookupMap as unknown as Record<string, unknown>;
    expect(unsafeView.set).toBeUndefined();
    expect(unsafeView.delete).toBeUndefined();
    expect(unsafeView.clear).toBeUndefined();

    // Attempting to overwrite or add properties fails under strict frozen object rules
    expect(() => {
      unsafeView.get = () => undefined;
    }).toThrow(TypeError);

    expect(snapshot.lookupMap.size).toBe(initialSize);
    expect(snapshot.lookupMap.get('sd-proj-oa-26-101')?.identity.code).toBe(
      'OA-26-101',
    );
  });

  it('never presents an archived project as active featured or attention project when all projects are archived (P2)', async () => {
    const actor = DEMO_USERS[0]; // Director
    persistDemoSessionForUser(actor);
    const user = userEvent.setup();

    // Archive every project in the canonical library
    const all = listProjects({ includeArchived: true });
    expect(all.length).toBeGreaterThan(0);
    for (const proj of all) {
      archiveProject(proj.identity.id, actor);
    }

    renderAt('/workspace');

    // Featured section must show honest empty-active state, NOT an archived project
    const emptyFeatured = await screen.findByTestId('featured-all-archived-empty');
    expect(emptyFeatured).toHaveTextContent(/Sem projectos activos em destaque/i);
    expect(emptyFeatured).not.toHaveTextContent(/OA-26-101/i);

    // QuickActionsBar featured button must be disabled honestly
    const disabledFeaturedBtn = screen.getByRole('button', {
      name: /Sem projecto activo em foco/i,
    });
    expect(disabledFeaturedBtn).toBeDisabled();

    // Clicking "Ver projectos arquivados" reveals the archived projects in Overview
    await user.click(
      within(emptyFeatured).getByRole('button', {
        name: /Ver projectos arquivados/i,
      }),
    );

    const overviewHeading = await screen.findByRole('heading', {
      name: /Projectos atribuídos e dossiers/i,
    });
    const overviewSection = overviewHeading.closest('section')!;
    expect(await within(overviewSection).findByText(/OA-26-101/i)).toBeInTheDocument();
  });
});
