import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  useWorkspaceSession,
  WorkspaceSessionProvider,
} from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import {
  ROLE_DESK_CONFIGS,
  STUDIO_DESK_STORAGE_KEY,
} from '../data/studioDeskFixtures';
import type { Role } from '../data/types';
import { STUDIO_DESK_I18N } from '../features/studio-desk/i18n';
import { StudioDeskPage } from '../features/studio-desk/StudioDeskPage';

function TestHarness({
  startUnauthenticated = false,
}: {
  startUnauthenticated?: boolean;
}) {
  const { currentUser, switchRole, setLanguage, language, signOut } =
    useWorkspaceSession();

  return (
    <div>
      {!startUnauthenticated && (
        <div data-testid="test-session-controls">
          <span data-testid="test-active-role">
            {currentUser?.role ?? 'none'}
          </span>
          <button
            type="button"
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
          >
            Toggle Lang Harness
          </button>
          <button type="button" onClick={() => signOut()}>
            Sign Out Harness
          </button>
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => switchRole(u.role)}
            >
              SwitchRole:{u.role}
            </button>
          ))}
        </div>
      )}
      <main>
        <StudioDeskPage />
      </main>
    </div>
  );
}

function renderStudioDesk(role: Role = 'director') {
  const targetUser = DEMO_USERS.find((u) => u.role === role) ?? DEMO_USERS[0];
  window.localStorage.setItem(
    'oa_workspace_demo_session_v1',
    JSON.stringify({
      userId: targetUser.id,
      role: targetUser.role,
      authenticatedAt: '2026-11-08T09:00:00.000Z',
      mode: 'local-demo',
    }),
  );

  return render(
    <WorkspaceSessionProvider>
      <TestHarness />
    </WorkspaceSessionProvider>,
  );
}

describe('O+A Workspace — Phase 02B StudioDeskPage Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.title = 'O+A Workspace';
  });

  it('maintains strict PT/EN key parity across the Studio Desk dictionary and covers all 6 role configs', () => {
    const collectKeys = (obj: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return collectKeys(value as Record<string, unknown>, path);
        }
        return [path];
      });

    expect(collectKeys(STUDIO_DESK_I18N.en)).toEqual(
      collectKeys(STUDIO_DESK_I18N.pt),
    );
    expect(Object.keys(ROLE_DESK_CONFIGS).sort()).toEqual(
      [
        'architect',
        'communications',
        'department_lead',
        'director',
        'project_manager',
        'staff',
      ].sort(),
    );
  });

  it('renders an honest localized fallback without crashing when no demo session is active', () => {
    render(
      <WorkspaceSessionProvider>
        <TestHarness startUnauthenticated />
      </WorkspaceSessionProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Nenhuma sessão demonstrativa activa/i,
      }),
    ).toBeInTheDocument();
  });

  it.each<{
    role: Role;
    userName: string;
    expectedLens: string;
    expectedFeaturedCode: string;
    expectedTopTaskCode: string;
    expectedPresentation: 'editorial' | 'technical';
  }>([
    {
      role: 'director',
      userName: 'Helena Mondlane (Demo)',
      expectedLens: 'Lente Direcção · Decisão & Portfólio',
      expectedFeaturedCode: 'OA-26-101 · DEMO',
      expectedTopTaskCode: 'REV · 01',
      expectedPresentation: 'editorial',
    },
    {
      role: 'architect',
      userName: 'Mateo Conti (Demo)',
      expectedLens: 'Lente Arquitectura · Dossiers & Pranchas',
      expectedFeaturedCode: 'OA-26-101 · DEMO',
      expectedTopTaskCode: 'REV · 01',
      expectedPresentation: 'editorial',
    },
    {
      role: 'project_manager',
      userName: 'Inês Macamo (Demo)',
      expectedLens: 'Lente Gestão · Cronogramas & Marcos',
      expectedFeaturedCode: 'OA-26-108 · DEMO',
      expectedTopTaskCode: 'MRC · 03',
      expectedPresentation: 'technical',
    },
    {
      role: 'department_lead',
      userName: 'Tomás Nhantumbo (Demo)',
      expectedLens: 'Lente Coordenação · Equipa & Revisões',
      expectedFeaturedCode: 'OA-26-108 · DEMO',
      expectedTopTaskCode: 'MRC · 03',
      expectedPresentation: 'technical',
    },
    {
      role: 'communications',
      userName: 'Clara Ferraz (Demo)',
      expectedLens: 'Lente Comunicação · Curadoria PT/EN',
      expectedFeaturedCode: 'OA-26-112 · DEMO',
      expectedTopTaskCode: 'EDT · 05',
      expectedPresentation: 'editorial',
    },
    {
      role: 'staff',
      userName: 'Diogo Tembe (Demo)',
      expectedLens: 'Lente Equipa Técnica · Tarefas & Arquivo',
      expectedFeaturedCode: 'OA-26-112 · DEMO',
      expectedTopTaskCode: 'MAT · 06',
      expectedPresentation: 'technical',
    },
  ])(
    'adapts opening identity, featured study, priority order, default mode, and section order for role $role',
    ({
      role,
      userName,
      expectedLens,
      expectedFeaturedCode,
      expectedTopTaskCode,
      expectedPresentation,
    }) => {
      const { container } = renderStudioDesk(role);

      expect(
        screen.getByRole('heading', { name: new RegExp(userName.replace(/[()]/g, '\\$&')) }),
      ).toBeInTheDocument();
      expect(screen.getByText(expectedLens)).toBeInTheDocument();

      // Featured project matches role calibration
      const featuredSection = container.querySelector(
        '[data-desk-section="featured"]',
      ) as HTMLElement;
      expect(featuredSection).toBeInTheDocument();
      expect(within(featuredSection).getByText(expectedFeaturedCode)).toBeInTheDocument();

      // Section sequence matches role config
      const sectionOrderInDom = Array.from(
        container.querySelectorAll('[data-desk-section]'),
      ).map((el) => el.getAttribute('data-desk-section'));
      expect(sectionOrderInDom).toEqual([...ROLE_DESK_CONFIGS[role].sectionOrder]);

      // First priority item aligns with active role
      const prioritiesSection = container.querySelector(
        '[data-desk-section="priorities"]',
      ) as HTMLElement;
      const firstPriorityCard = within(prioritiesSection).getAllByRole('listitem')[0];
      expect(within(firstPriorityCard).getByText(expectedTopTaskCode)).toBeInTheDocument();

      // Default presentation mode
      const overviewSection = container.querySelector(
        '[data-desk-section="overview"]',
      ) as HTMLElement;
      if (expectedPresentation === 'technical') {
        expect(within(overviewSection).getByRole('table')).toBeInTheDocument();
      } else {
        expect(within(overviewSection).queryByRole('table')).not.toBeInTheDocument();
      }
    },
  );

  it('filters projects by status and search, sorts by code/date/priority, and toggles Editorial vs Technical view', async () => {
    const user = userEvent.setup();
    const { container } = renderStudioDesk('director');

    const overview = container.querySelector(
      '[data-desk-section="overview"]',
    ) as HTMLElement;

    // Switch Overview to Technical List view
    await user.click(
      within(overview).getByRole('button', { name: /Lista Técnica/i }),
    );
    expect(within(overview).getByRole('table')).toBeInTheDocument();

    // Sort by Código ascending -> OA-25-084 · DEMO should appear first
    const sortSelect = within(overview).getByLabelText(/Ordenar por/i);
    await user.selectOptions(sortSelect, 'code');
    const sortedRows = within(overview).getAllByRole('row');
    expect(within(sortedRows[1]).getByText('OA-25-084 · DEMO')).toBeInTheDocument();

    // Filter by status "Em revisão" -> only OA-26-101 · DEMO remains
    await user.click(
      within(overview).getByRole('button', { name: /^Em revisão$/i }),
    );
    const filteredTable = within(overview).getByRole('table');
    expect(within(filteredTable).getByText('OA-26-101 · DEMO')).toBeInTheDocument();
    expect(
      within(filteredTable).queryByText('OA-25-084 · DEMO'),
    ).not.toBeInTheDocument();

    // Reset status filter then search "Terrários"
    await user.click(
      within(overview).getByRole('button', { name: /^Todos$/i }),
    );
    const searchInput = within(overview).getByLabelText(
      /Procurar por código ou título/i,
    );
    await user.type(searchInput, 'Terrários');
    const searchedTable = within(overview).getByRole('table');
    expect(within(searchedTable).getByText('OA-26-108 · DEMO')).toBeInTheDocument();
    expect(
      within(searchedTable).queryByText('OA-26-101 · DEMO'),
    ).not.toBeInTheDocument();
  });

  it('updates task status locally, recalculates derived priority counters, persists to isolated localStorage, and resets demo state cleanly', async () => {
    const user = userEvent.setup();
    const { container } = renderStudioDesk('architect');

    const priorities = container.querySelector(
      '[data-desk-section="priorities"]',
    ) as HTMLElement;

    // Initial counts across 9 studio tasks: 4 pending, 3 in_progress, 2 completed
    const countersRegion = priorities.querySelector('dl[aria-live="polite"]') as HTMLElement;
    expect(countersRegion).toHaveTextContent('4por concluir');
    expect(countersRegion).toHaveTextContent('3em curso');
    expect(countersRegion).toHaveTextContent('2concluídas');

    // Cycle status of top pending task (pending -> in_progress)
    const cycleBtn = within(priorities).getByRole('button', {
      name: /Alternar estado · REV · 01/i,
    });
    await user.click(cycleBtn);
    expect(countersRegion).toHaveTextContent('3por concluir');
    expect(countersRegion).toHaveTextContent('4em curso');

    // Quick Action: "Concluir próxima prioridade" completes that top item
    await user.click(
      screen.getByRole('button', { name: /Concluir próxima prioridade/i }),
    );
    expect(countersRegion).toHaveTextContent('3por concluir');
    expect(countersRegion).toHaveTextContent('3em curso');
    expect(countersRegion).toHaveTextContent('3concluídas');

    // Verify isolated localStorage key contains task status only (no credentials)
    const savedRaw = window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY);
    expect(savedRaw).not.toBeNull();
    expect(savedRaw).toContain('"task-dir-01":"completed"');
    expect(savedRaw).not.toContain('password');
    expect(savedRaw).not.toContain('oa-demo');

    // Local change indicator appears in Studio Opening
    expect(
      screen.getByText(/Alterações guardadas apenas neste navegador/i),
    ).toBeInTheDocument();

    // Reset demo data restores defaults and clears storage key
    await user.click(
      screen.getByRole('button', { name: /Repor dados demo/i }),
    );
    expect(window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY)).toBeNull();
    expect(countersRegion).toHaveTextContent('4por concluir');
    expect(countersRegion).toHaveTextContent('3em curso');
    expect(countersRegion).toHaveTextContent('2concluídas');
  });

  it('switches cleanly between Portuguese and English across all Studio Desk regions', async () => {
    const user = userEvent.setup();
    renderStudioDesk('communications');

    expect(
      screen.getByText(/FOLHA 02 · MESA DE TRABALHO/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Histórico demonstrativo estático · Sem sincronização em tempo real/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Toggle Lang Harness' }),
    );

    expect(
      await screen.findByText(/SHEET 02 · STUDIO DESK · DEMO MODE/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Static demonstrative history · No real-time synchronization/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Assigned projects & dossiers/i }),
    ).toBeInTheDocument();
  });

  it('renders honest empty states across Priorities, Activity, and Project Overview and lets users recover cleanly', async () => {
    const user = userEvent.setup();
    const { container } = renderStudioDesk('project_manager');

    // 1. Priorities empty state: PM in "Foco do meu papel" has 0 completed tasks
    await user.click(
      screen.getByRole('button', { name: /Foco do meu papel/i }),
    );
    const priorities = container.querySelector(
      '[data-desk-section="priorities"]',
    ) as HTMLElement;
    await user.click(
      within(priorities).getByRole('button', { name: /^Concluídas$/i }),
    );
    expect(
      within(priorities).getByText(/Nenhuma prioridade nesta selecção/i),
    ).toBeInTheDocument();

    // 2. Activity empty state: PM in role_focus has 0 "Editorial" log entries
    const activity = container.querySelector(
      '[data-desk-section="activity"]',
    ) as HTMLElement;
    await user.click(
      within(activity).getByRole('button', { name: /^Editorial$/i }),
    );
    expect(
      within(activity).getByText(/Sem registos para esta categoria/i),
    ).toBeInTheDocument();

    // Recover activity
    await user.click(
      within(activity).getByRole('button', { name: /Ver todo o histórico/i }),
    );
    expect(
      within(activity).queryByText(/Sem registos para esta categoria/i),
    ).not.toBeInTheDocument();

    // 3. Project Overview empty state: filter by "Arquivado"
    const overview = container.querySelector(
      '[data-desk-section="overview"]',
    ) as HTMLElement;
    await user.click(
      within(overview).getByRole('button', { name: /^Arquivado$/i }),
    );
    expect(
      within(overview).getByText(/Nenhum projecto corresponde aos filtros activos/i),
    ).toBeInTheDocument();

    await user.click(
      within(overview).getByRole('button', { name: /Limpar filtros/i }),
    );
    expect(
      within(within(overview).getByRole('table')).getByText('OA-26-101 · DEMO'),
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation, accessible dossier dialog Escape close, focus restoration, and zero deceptive controls', async () => {
    const user = userEvent.setup();
    const { container } = renderStudioDesk('director');

    // Zero fake file inputs or fake publish actions
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(
      screen.queryByRole('button', { name: /Carregar SketchUp|Upload \.skp/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Publicar no site/i }),
    ).not.toBeInTheDocument();

    // Keyboard open Featured Dossier
    const dossierTrigger = screen.getByRole('button', {
      name: /Abrir dossier demonstrativo/i,
    });
    dossierTrigger.focus();
    expect(dossierTrigger).toHaveFocus();

    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText(/dados fictícios guardados localmente/i),
    ).toBeInTheDocument();

    // Press Escape to close and verify focus restoration
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(dossierTrigger).toHaveFocus();

    // Clicking Future 3D Viewer notice shows transparent Phase 04 boundary
    await user.click(
      screen.getByRole('button', { name: /Viewer 3D \(\.glb\) · Fase 04/i }),
    );
    const futureDialog = await screen.findByRole('dialog');
    expect(
      within(futureDialog).getByText(/Nenhum botão de upload falso foi incluído/i),
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Quick Action "Ir para prioridades" focuses priorities landmark
    await user.click(
      screen.getByRole('button', { name: /Ir para prioridades/i }),
    );
    expect(document.getElementById('studio-priorities-section')).toHaveFocus();
  });

  it('replaces the WelcomePage document.title immediately upon entering /workspace and tracks PT/EN switches', async () => {
    const user = userEvent.setup();
    document.title = 'O+A Workspace — Caderno de Entrada (Demo)';

    renderStudioDesk('director');

    expect(document.title).toBe('O+A Workspace — Mesa de Trabalho (Demo)');

    await user.click(
      screen.getByRole('button', { name: 'Toggle Lang Harness' }),
    );

    await waitFor(() => {
      expect(document.title).toBe('O+A Workspace — Studio Desk (Demo)');
    });

    await user.click(
      screen.getByRole('button', { name: 'Toggle Lang Harness' }),
    );

    await waitFor(() => {
      expect(document.title).toBe('O+A Workspace — Mesa de Trabalho (Demo)');
    });
  });

  it('confines Tab and Shift+Tab inside ProjectDossierDialog, blocks background interaction, locks body scroll, and restores focus cleanly on Escape', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';

    const { container } = renderStudioDesk('director');
    const appRootWrapper = container;

    const triggerButton = screen.getByRole('button', {
      name: /Abrir dossier demonstrativo/i,
    });
    triggerButton.focus();
    expect(triggerButton).toHaveFocus();

    await user.keyboard('{Enter}');

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest('[data-studio-desk-dialog-portal="true"]')?.parentElement).toBe(
      document.body,
    );

    // Background subtree is blocked and body scroll is locked
    expect(appRootWrapper).toHaveAttribute('inert');
    expect(appRootWrapper).toHaveAttribute('aria-hidden', 'true');
    expect(document.body.style.overflow).toBe('hidden');

    const closeIconButton = within(dialog).getByRole('button', {
      name: /Fechar janela de detalhes/i,
    });
    const footerCloseButton = within(dialog).getByRole('button', {
      name: /^Fechar$/i,
    });

    // Initial focus moves to top [X] close icon button
    expect(closeIconButton).toHaveFocus();

    // Forward Tab cycles [X] -> Footer [Fechar] -> wraps back to [X]
    await user.tab();
    expect(footerCloseButton).toHaveFocus();

    await user.tab();
    expect(closeIconButton).toHaveFocus();

    // Backward Shift+Tab wraps cleanly from [X] back to Footer [Fechar]
    await user.tab({ shift: true });
    expect(footerCloseButton).toHaveFocus();

    // Background buttons are excluded from accessible tree while modal is open
    expect(
      screen.queryByRole('button', { name: 'Toggle Lang Harness' }),
    ).not.toBeInTheDocument();

    // Attempted programmatic focus onto background harness control is intercepted inside dialog
    const backgroundButton = screen.getByRole('button', {
      name: 'Toggle Lang Harness',
      hidden: true,
    });
    backgroundButton.focus();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape closes modal, unlocks scroll, removes background inert/aria-hidden, and restores trigger focus
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(appRootWrapper).not.toHaveAttribute('inert');
    expect(appRootWrapper).not.toHaveAttribute('aria-hidden');
    expect(document.body.style.overflow).toBe('auto');
    expect(triggerButton).toHaveFocus();
  });

  it('keeps per-role presentation modes isolated and preserves shared local task consistency across dynamic profile switches and sign-out', async () => {
    const user = userEvent.setup();
    const { container } = renderStudioDesk('director');

    // Director defaults to Editorial; switch Overview to Technical List
    const overviewAsDirector = () =>
      container.querySelector('[data-desk-section="overview"]') as HTMLElement;
    expect(within(overviewAsDirector()).queryByRole('table')).not.toBeInTheDocument();

    await user.click(
      within(overviewAsDirector()).getByRole('button', {
        name: /Lista Técnica/i,
      }),
    );
    expect(within(overviewAsDirector()).getByRole('table')).toBeInTheDocument();

    // Complete a priority task as Director and keep role filter / counters consistent
    await user.click(
      screen.getByRole('button', { name: /Concluir próxima prioridade/i }),
    );
    const savedState = JSON.parse(
      window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY) ?? '{}',
    );
    expect(savedState.presentationModeByRole).toEqual({ director: 'technical' });
    expect(savedState.taskStatuses['task-dir-01']).toBe('completed');

    // Open a dossier modal as Director, then switch roles dynamically while open
    await user.click(
      screen.getByRole('button', { name: /Abrir dossier demonstrativo/i }),
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate external programmatic role switch to Communications while modal is open
    const hiddenCommsSwitch = screen.getByRole('button', {
      name: 'SwitchRole:communications',
      hidden: true,
    });
    fireEvent.click(hiddenCommsSwitch);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(document.body.style.overflow).toBe('');
    expect(container).not.toHaveAttribute('inert');

    // Communications retains its calibrated Editorial default (not leaked Director's Technical mode)
    expect(screen.getByTestId('test-active-role')).toHaveTextContent(
      'communications',
    );
    expect(
      screen.getByRole('heading', { name: /Clara Ferraz \(Demo\)/i }),
    ).toBeInTheDocument();
    expect(within(overviewAsDirector()).queryByRole('table')).not.toBeInTheDocument();

    // Derived counters stay consistent with shared local task completion (3 pending, 3 in_progress, 3 completed)
    const commsPriorities = container.querySelector(
      '[data-desk-section="priorities"]',
    ) as HTMLElement;
    const counters = commsPriorities.querySelector(
      'dl[aria-live="polite"]',
    ) as HTMLElement;
    expect(counters).toHaveTextContent('3por concluir');
    expect(counters).toHaveTextContent('3em curso');
    expect(counters).toHaveTextContent('3concluídas');

    // Switch to Staff (Technical default), then return to Director (remembers explicit Technical choice)
    await user.click(screen.getByRole('button', { name: 'SwitchRole:staff' }));
    expect(
      screen.getByRole('heading', { name: /Diogo Tembe \(Demo\)/i }),
    ).toBeInTheDocument();
    expect(within(overviewAsDirector()).getByRole('table')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'SwitchRole:director' }));
    expect(
      screen.getByRole('heading', { name: /Helena Mondlane \(Demo\)/i }),
    ).toBeInTheDocument();
    expect(within(overviewAsDirector()).getByRole('table')).toBeInTheDocument();

    // Reset clears all per-role presentation overrides and task modifications
    await user.click(
      screen.getByRole('button', { name: /Repor dados demo/i }),
    );
    expect(window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY)).toBeNull();
    expect(within(overviewAsDirector()).queryByRole('table')).not.toBeInTheDocument();

    // Sign out unmounts authenticated desk cleanly with honest fallback
    await user.click(screen.getByRole('button', { name: 'Sign Out Harness' }));
    expect(
      screen.getByRole('heading', {
        name: /Nenhuma sessão demonstrativa activa/i,
      }),
    ).toBeInTheDocument();
  });
});
