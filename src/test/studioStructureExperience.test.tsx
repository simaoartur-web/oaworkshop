import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { STORAGE_KEYS } from '../data/sessionRepository';
import { invalidateTasksCache } from '../data/tasksRepository';
import { invalidateTechnicalLibraryCache } from '../data/technicalLibraryRepository';

function seedDemoSession(userIndex = 0, language: 'pt' | 'en' = 'pt') {
  const user = DEMO_USERS[userIndex];
  window.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      authenticatedAt: '2026-11-21T09:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  window.localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      language,
      skipWelcomeOnLogin: false,
      reduceMotionOverride: 'system',
      updatedAt: '2026-11-21T09:00:00.000Z',
    }),
  );
  return user;
}

function renderAppAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('Phase 05 · Module 2 — DepartmentsPage, TeamPage & TechnicalLibraryPage Experience', () => {
  beforeEach(() => {
    window.localStorage.clear();
    invalidateTasksCache();
    invalidateTechnicalLibraryCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders /workspace/departments with all 9 canonical departments, rich ARQ sheet, honest 0 state in ADM/RHU, and cross-links', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/departments');

    expect(
      await screen.findByRole('heading', { name: 'Departamentos' }),
    ).toBeInTheDocument();

    const directory = screen.getByTestId('departments-directory');
    const deptButtons = within(directory).getAllByRole('button');
    expect(deptButtons).toHaveLength(9);

    // Default ARQ sheet has real cross-links to Team, Projects, Tasks and Technical Library
    const detailSheet = screen.getByTestId('department-detail-sheet');
    expect(within(detailSheet).getByText('ARQ')).toBeInTheDocument();
    expect(
      within(detailSheet).getByRole('link', { name: /Ver na Biblioteca Técnica/i }),
    ).toHaveAttribute('href', '/workspace/library?dept=architecture');

    // Select Finance/Admin (ADM) -> honest 0 activity note without invented metrics
    await user.click(screen.getByTestId('department-item-finance'));
    expect(
      await screen.findByTestId('department-zero-activity-note'),
    ).toBeInTheDocument();

    // Select HR (RHU) -> honest 0 activity note
    await user.click(screen.getByTestId('department-item-hr'));
    expect(
      await screen.findByTestId('department-zero-activity-note'),
    ).toBeInTheDocument();
  });

  it('renders /workspace/team with all 6 demonstrative profiles, combinable filters, contextual profile links, and zero exposed credentials', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/team');

    expect(
      await screen.findByRole('heading', { name: /Equipa do Atelier/i }),
    ).toBeInTheDocument();

    const directory = screen.getByTestId('team-directory-list');
    expect(within(directory).getAllByRole('button')).toHaveLength(6);

    // Zero credentials exposed in DOM
    expect(document.body.textContent).not.toContain('oa-demo');

    // Filter by studio base = Milão -> shows Milan profiles
    await user.selectOptions(
      screen.getByLabelText(/Base de Estúdio/i),
      'Milão',
    );
    expect(
      within(directory).getAllByRole('button').length,
    ).toBeGreaterThan(0);
    expect(
      within(directory).getAllByRole('button').length,
    ).toBeLessThan(6);

    // Contextual detail panel links to Department and Projects
    const detailPanel = screen.getByTestId('team-member-detail');
    expect(
      within(detailPanel).getByRole('link', { name: /Ver departamento/i }),
    ).toBeInTheDocument();
  });

  it('renders /workspace/library across 3 categories, filters, registers metadata-only reference, handles QuotaExceededError with role="alert", and links to project dossier', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/library');

    expect(
      await screen.findByRole('heading', { name: /Biblioteca Técnica/i }),
    ).toBeInTheDocument();

    const grid = screen.getByTestId('technical-library-grid');
    expect(within(grid).getAllByRole('article').length).toBeGreaterThanOrEqual(8);

    // Filter by category: Sistema Construtivo
    await user.click(
      screen.getByRole('button', { name: /Sistema Construtivo/i }),
    );
    expect(
      within(screen.getByTestId('technical-library-grid')).getAllByRole('article')
        .length,
    ).toBeGreaterThan(0);

    // Reset back to all and verify direct link to project dossier
    await user.click(screen.getByRole('button', { name: /^Todos$/i }));
    const firstCard = screen.getByTestId('tech-ref-card-tech-mat-001');
    expect(
      within(firstCard).getByRole('link', { name: /OA-26-101/i }),
    ).toHaveAttribute('href', '/workspace/projects/sd-proj-oa-26-101');

    // Open metadata-only dialog (verify zero file inputs!) and test QuotaExceededError
    await user.click(
      screen.getByRole('button', { name: /Registar referência técnica/i }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('input[type="file"]')).toBeNull();

    await user.type(
      within(dialog).getByLabelText(/Título da ficha técnica/i),
      'Cal Hidráulica Natural NHL 3.5',
    );
    await user.type(
      within(dialog).getByLabelText(/Resumo operacional/i),
      'Reboco respirável para alvenarias costeiras.',
    );
    await user.type(
      within(dialog).getByLabelText(/Especificações técnicas/i),
      'Espessura 20 mm · Permeabilidade elevada ao vapor.',
    );
    await user.type(
      within(dialog).getByLabelText(/Região \/ Origem climática/i),
      'Maputo / Clima costeiro',
    );
    await user.type(
      within(dialog).getByLabelText(/Normas \/ Etiqueta técnica/i),
      'EN 459-1',
    );
    await user.type(
      within(dialog).getByLabelText(/Citação \/ Fonte documental/i),
      'Caderno O+A · Teste Local',
    );

    const quotaSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    await user.click(
      within(dialog).getByRole('button', { name: /Guardar referência técnica/i }),
    );
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      /QuotaExceededError/i,
    );

    // Restore storage and submit cleanly
    quotaSpy.mockRestore();
    await user.click(
      within(dialog).getByRole('button', { name: /Guardar referência técnica/i }),
    );
    expect(
      await screen.findByText('Cal Hidráulica Natural NHL 3.5'),
    ).toBeInTheDocument();
  });

  it('supports full PT/EN parity across /workspace/departments, /workspace/team, and /workspace/library', async () => {
    seedDemoSession(0, 'en');

    const { unmount: unmountDept } = renderAppAt('/workspace/departments');
    expect(
      await screen.findByRole('heading', { name: 'Departments' }),
    ).toBeInTheDocument();
    unmountDept();

    const { unmount: unmountTeam } = renderAppAt('/workspace/team');
    expect(
      await screen.findByRole('heading', { name: /Studio Team/i }),
    ).toBeInTheDocument();
    unmountTeam();

    renderAppAt('/workspace/library');
    expect(
      await screen.findByRole('heading', { name: /Technical Library/i }),
    ).toBeInTheDocument();
  });

  it('05-M2-FE-02: syncs ?dept= URL query changes in-place while TeamPage remains mounted', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    function TeamNavHarness() {
      const navigate = useNavigate();
      return (
        <div>
          <button
            type="button"
            onClick={() => navigate('/workspace/team?dept=urbanism')}
          >
            Go Urbanism
          </button>
          <button type="button" onClick={() => navigate('/workspace/team')}>
            Clear Dept URL
          </button>
          <AppRoutes />
        </div>
      );
    }

    render(
      <MemoryRouter initialEntries={['/workspace/team?dept=architecture']}>
        <WorkspaceSessionProvider>
          <TeamNavHarness />
        </WorkspaceSessionProvider>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /Equipa do Atelier/i });
    const deptSelect = screen.getByLabelText(
      /Departamento/i,
    ) as HTMLSelectElement;
    expect(deptSelect.value).toBe('architecture');
    expect(
      within(screen.getByTestId('team-directory-list')).getByText(/Mateo Conti/i),
    ).toBeInTheDocument();

    // Change ?dept= while TeamPage stays mounted -> filter & list update immediately
    await user.click(screen.getByRole('button', { name: 'Go Urbanism' }));
    expect(deptSelect.value).toBe('urbanism');
    expect(
      within(screen.getByTestId('team-directory-list')).queryByText(/Mateo Conti/i),
    ).not.toBeInTheDocument();

    // Remove ?dept= while TeamPage stays mounted -> restores all 6 members
    await user.click(screen.getByRole('button', { name: 'Clear Dept URL' }));
    expect(deptSelect.value).toBe('all');
    expect(
      within(screen.getByTestId('team-directory-list')).getAllByRole('button'),
    ).toHaveLength(6);
  });

  it('05-M2-FE-02: syncs ?dept= and ?project= URL query changes in-place while TechnicalLibraryPage remains mounted', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    function LibraryNavHarness() {
      const navigate = useNavigate();
      return (
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                '/workspace/library?dept=interiors&project=sd-proj-oa-26-119',
              )
            }
          >
            Go Interiors 119
          </button>
          <button type="button" onClick={() => navigate('/workspace/library')}>
            Clear Library URL
          </button>
          <AppRoutes />
        </div>
      );
    }

    render(
      <MemoryRouter initialEntries={['/workspace/library?dept=architecture']}>
        <WorkspaceSessionProvider>
          <LibraryNavHarness />
        </WorkspaceSessionProvider>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /Biblioteca Técnica/i });
    const deptSelect = screen.getByLabelText(
      /Departamento/i,
    ) as HTMLSelectElement;
    const projectSelect = screen.getByLabelText(
      /Projecto associado/i,
    ) as HTMLSelectElement;

    expect(deptSelect.value).toBe('architecture');
    expect(projectSelect.value).toBe('all');
    expect(
      screen.getByTestId('tech-ref-card-tech-mat-001'),
    ).toBeInTheDocument();

    // Change both ?dept= and ?project= while TechnicalLibraryPage remains mounted
    await user.click(screen.getByRole('button', { name: 'Go Interiors 119' }));
    expect(deptSelect.value).toBe('interiors');
    expect(projectSelect.value).toBe('sd-proj-oa-26-119');
    expect(
      screen.queryByTestId('tech-ref-card-tech-mat-001'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('tech-ref-card-tech-mat-002'),
    ).toBeInTheDocument();

    // Clear query params while mounted -> both selects return to 'all'
    await user.click(screen.getByRole('button', { name: 'Clear Library URL' }));
    expect(deptSelect.value).toBe('all');
    expect(projectSelect.value).toBe('all');
    expect(
      within(screen.getByTestId('technical-library-grid')).getAllByRole(
        'article',
      ).length,
    ).toBeGreaterThanOrEqual(8);
  });
});
