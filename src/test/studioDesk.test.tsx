import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  useWorkspaceSession,
  WorkspaceSessionProvider,
} from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import {
  ROLE_DESK_CONFIGS,
  STUDIO_DESK_ACTIVITIES,
  STUDIO_DESK_PROJECTS,
  STUDIO_DESK_STORAGE_KEY,
  STUDIO_DESK_TASKS,
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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      {!startUnauthenticated && (
        <div data-testid="test-session-controls">
          <span data-testid="test-active-role">
            {currentUser?.role ?? 'none'}
          </span>
          <span data-testid="test-location-search">{location.search}</span>
          <button
            type="button"
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
          >
            Toggle Lang Harness
          </button>
          <button type="button" onClick={() => signOut()}>
            Sign Out Harness
          </button>
          <button
            type="button"
            onClick={() => navigate('/workspace?project=sd-proj-oa-26-101')}
          >
            DeepLink:101
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            HistoryBack
          </button>
          <button type="button" onClick={() => navigate(1)}>
            HistoryForward
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

function seedSessionForRole(role: Role) {
  const targetUser = DEMO_USERS.find((u) => u.role === role) ?? DEMO_USERS[0];
  window.localStorage.setItem(
    'oa_workspace_demo_session_v1',
    JSON.stringify({
      userId: targetUser.id,
      role: targetUser.role,
      authenticatedAt: '2026-11-11T09:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  return targetUser;
}

function renderStudioDesk(
  role: Role = 'director',
  initialEntries: string[] = ['/workspace'],
) {
  seedSessionForRole(role);
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <WorkspaceSessionProvider>
        <TestHarness />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('O+A Workspace — Phase 02.1B StudioDeskPage Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.title = 'O+A Workspace';
  });

  it('maintains strict PT/EN key parity and canonical continuous section ordering across all 6 role configs', () => {
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

    for (const config of Object.values(ROLE_DESK_CONFIGS)) {
      expect(config.sectionOrder).toEqual([
        'priorities',
        'featured',
        'overview',
        'activity',
      ]);
    }
  });

  it('uses explicit coherent fixture dates without static relative contradictions or repetitive title demo suffixes', () => {
    const relativePattern = /amanh[ãa]|tomorrow/i;

    for (const task of STUDIO_DESK_TASKS) {
      expect(task.dueLabel.pt).not.toMatch(relativePattern);
      expect(task.dueLabel.en).not.toMatch(relativePattern);
      expect(task.title.pt).not.toContain('(Demo)');
      expect(task.projectCode).not.toContain('DEMO');
    }

    for (const project of STUDIO_DESK_PROJECTS) {
      expect(project.code).not.toContain('DEMO');
      expect(project.title.pt).not.toContain('(Demo)');
      expect(project.nextMilestone.dateLabel.pt).not.toMatch(relativePattern);
    }

    for (const activity of STUDIO_DESK_ACTIVITIES) {
      expect(activity.dateLabel.pt).not.toMatch(relativePattern);
      expect(activity.projectCode).not.toContain('DEMO');
    }
  });

  it('renders an honest localized fallback without crashing when no demo session is active or outside Router context', () => {
    render(
      <WorkspaceSessionProvider>
        <StudioDeskPage />
      </WorkspaceSessionProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Nenhuma sessão demonstrativa activa/i,
      }),
    ).toBeInTheDocument();
  });

  it.each<
    [
      Role,
      {
        userName: string;
        featuredTitle: string;
        expectedDefaultMode: 'editorial' | 'technical';
        expectedFirstTaskCode: string;
      },
    ]
  >([
    [
      'director',
      {
        userName: 'Helena Mondlane',
        featuredTitle: 'Galeria Cívica & Pátio da Ponta Vermelha',
        expectedDefaultMode: 'editorial',
        expectedFirstTaskCode: 'REV · 01',
      },
    ],
    [
      'architect',
      {
        userName: 'Mateo Conti',
        featuredTitle: 'Galeria Cívica & Pátio da Ponta Vermelha',
        expectedDefaultMode: 'editorial',
        expectedFirstTaskCode: 'PRN · 02',
      },
    ],
    [
      'project_manager',
      {
        userName: 'Inês Macamo',
        featuredTitle: 'Corredor Pedonal & Terrários da Costa',
        expectedDefaultMode: 'technical',
        expectedFirstTaskCode: 'MRC · 03',
      },
    ],
    [
      'department_lead',
      {
        userName: 'Tomás Nhantumbo',
        featuredTitle: 'Corredor Pedonal & Terrários da Costa',
        expectedDefaultMode: 'technical',
        expectedFirstTaskCode: 'EQP · 04',
      },
    ],
    [
      'communications',
      {
        userName: 'Clara Ferraz',
        featuredTitle: 'Arquivo de Matéria & Inércia Climática',
        expectedDefaultMode: 'editorial',
        expectedFirstTaskCode: 'EDT · 05',
      },
    ],
    [
      'staff',
      {
        userName: 'Diogo Tembe',
        featuredTitle: 'Arquivo de Matéria & Inércia Climática',
        expectedDefaultMode: 'technical',
        expectedFirstTaskCode: 'MAT · 06',
      },
    ],
  ])(
    'maintains predictable continuity, work-oriented briefing, and personal "O meu trabalho" scope for role %s',
    (role, expected) => {
      const { container } = renderStudioDesk(role);

      expect(
        screen.getByRole('heading', {
          name: new RegExp(expected.userName, 'i'),
        }),
      ).toBeInTheDocument();

      // Work-oriented top briefing present
      expect(screen.getByText(/^Próxima prioridade$/i)).toBeInTheDocument();
      expect(
        screen.getAllByText(expected.featuredTitle).length,
      ).toBeGreaterThan(0);

      // Default scope is "O meu trabalho" and shows the collaborator's own priority first
      const myWorkBtn = screen.getByRole('button', {
        name: /^O meu trabalho$/i,
      });
      expect(myWorkBtn).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getAllByText(expected.expectedFirstTaskCode).length).toBeGreaterThan(0);

      // Spatial continuity: all 6 roles share identical predictable section ordering
      const sectionOrder = Array.from(
        container.querySelectorAll('[data-desk-section]'),
      ).map((el) => el.getAttribute('data-desk-section'));
      expect(sectionOrder).toEqual([
        'priorities',
        'featured',
        'overview',
        'activity',
      ]);

      // Default presentation mode preserved
      const editorialPressed =
        expected.expectedDefaultMode === 'editorial' ? 'true' : 'false';
      const technicalPressed =
        expected.expectedDefaultMode === 'technical' ? 'true' : 'false';
      expect(
        screen.getAllByRole('button', { name: /Modo Editorial/i })[0],
      ).toHaveAttribute('aria-pressed', editorialPressed);
      expect(
        screen.getAllByRole('button', { name: /Lista Técnica/i })[0],
      ).toHaveAttribute('aria-pressed', technicalPressed);
    },
  );

  it('replaces auto-completion with "Abrir próxima prioridade": highlights and inspects task without changing status until explicit action', async () => {
    const user = userEvent.setup();
    renderStudioDesk('director');

    // Old anti-pattern controls removed from QuickActionsBar
    expect(
      screen.queryByRole('button', { name: /Concluir próxima prioridade/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Repor dados demo/i }),
    ).not.toBeInTheDocument();

    const openNextBtn = screen.getByRole('button', {
      name: /Abrir próxima prioridade/i,
    });
    await user.click(openNextBtn);

    // Highlighted visually in list, and status NOT altered automatically
    const taskCard = document.getElementById('desk-task-task-dir-01');
    expect(taskCard).toHaveAttribute('data-task-highlighted', 'true');
    expect(window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY)).toBeNull();

    // Contextual Task Detail dialog opens with full metadata and explicit actions
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', {
        name: /Emitir parecer final sobre corte AA da Galeria Cívica/i,
      }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Por concluir/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/12 Nov 2026 · 11:00 CAT/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Helena Mondlane/i)).toBeInTheDocument();

    // Explicit conscious transition: Iniciar tarefa -> Em progresso
    await user.click(
      within(dialog).getByRole('button', { name: /Iniciar tarefa/i }),
    );
    expect(within(dialog).getByText(/Em progresso/i)).toBeInTheDocument();

    const storedAfterStart = JSON.parse(
      window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY) ?? '{}',
    );
    expect(storedAfterStart.taskStatuses?.['task-dir-01']).toBe('in_progress');

    // Explicit conscious transition: Concluir tarefa -> Concluída
    await user.click(
      within(dialog).getByRole('button', { name: /Concluir tarefa/i }),
    );
    expect(within(dialog).getByText(/Concluída/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(openNextBtn).toHaveFocus();
  });

  it('distinguishes individual ownership ("Atribuída a mim") from role context ("No meu papel") across scopes', async () => {
    const user = userEvent.setup();
    renderStudioDesk('director');

    const prioritiesSection = document.getElementById(
      'studio-priorities-section',
    ) as HTMLElement;

    // Default scope 'my_work': Helena only sees her 2 directly assigned tasks
    expect(
      within(prioritiesSection).getAllByText('Atribuída a mim'),
    ).toHaveLength(2);
    expect(
      within(prioritiesSection).queryByText('No meu papel'),
    ).not.toBeInTheDocument();
    expect(
      within(prioritiesSection).queryByText('PRN · 02'),
    ).not.toBeInTheDocument();

    // Switching to 'role_focus' includes shared role tasks explicitly labeled "No meu papel"
    await user.click(
      screen.getByRole('button', { name: /Foco do meu papel/i }),
    );
    expect(
      within(prioritiesSection).getByText('PRN · 02'),
    ).toBeInTheDocument();
    expect(
      within(prioritiesSection).getAllByText('No meu papel').length,
    ).toBeGreaterThan(0);

    // Switching to 'all' reveals all 12 studio tasks across all collaborators
    await user.click(
      screen.getByRole('button', { name: /Todos os registos/i }),
    );
    expect(
      within(prioritiesSection).getByText('MAT · 06'),
    ).toBeInTheDocument();
  });

  it('highlights and spotlights matched project on /workspace?project=<id>, syncs clear/Back/Forward, and opens full dossier on conscious action', async () => {
    const user = userEvent.setup();
    renderStudioDesk('director', ['/workspace?project=sd-proj-oa-26-108']);

    // Inline Spotlight region displays without hijacking focus into a blocking modal immediately after search navigation
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const spotlightTag = await screen.findByText(
      /PROJECTO EM DESTAQUE · PESQUISA \/ URL/i,
    );
    const spotlightPanel = spotlightTag.closest('section') as HTMLElement;
    expect(spotlightPanel).toBeInTheDocument();
    expect(
      within(spotlightPanel).getByRole('heading', {
        name: /Corredor Pedonal & Terrários da Costa/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('test-location-search')).toHaveTextContent(
      '?project=sd-proj-oa-26-108',
    );

    // Conscious click opens full ProjectDossierDialog modal
    await user.click(
      within(spotlightPanel).getByRole('button', { name: /Abrir dossier em janela/i }),
    );
    const modal = await screen.findByRole('dialog');
    expect(
      within(modal).getByRole('heading', {
        name: /Corredor Pedonal & Terrários da Costa/i,
      }),
    ).toBeInTheDocument();
    await user.click(within(modal).getByRole('button', { name: /^Fechar$/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Clearing spotlight removes ?project= param cleanly
    await user.click(
      within(spotlightPanel).getByRole('button', { name: /Fechar selecção de projecto/i }),
    );
    await waitFor(() => {
      expect(screen.getByTestId('test-location-search').textContent).toBe('');
    });

    // Simulate Global Search navigating to ?project=sd-proj-oa-26-101, then Browser Back & Forward
    await user.click(screen.getByRole('button', { name: 'DeepLink:101' }));
    expect(
      await screen.findByText(/PROJECTO EM DESTAQUE · PESQUISA/i),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-project-highlighted="true"]'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'HistoryBack' }));
    await waitFor(() => {
      expect(screen.queryByText(/PROJECTO EM DESTAQUE · PESQUISA/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'HistoryForward' }));
    expect(
      await screen.findByText(/PROJECTO EM DESTAQUE · PESQUISA/i),
    ).toBeInTheDocument();
  });

  it('shows a non-blocking dismissible notice when /workspace?project= has an invalid ID', async () => {
    const user = userEvent.setup();
    renderStudioDesk('director', ['/workspace?project=codigo-invalido-404']);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent(/não foi encontrado/i);
    expect(notice).toHaveTextContent(/codigo-invalido-404/i);

    await user.click(
      screen.getByRole('button', { name: /Dispensar aviso/i }),
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('test-location-search').textContent).toBe('');
  });

  it('filters projects by status and search, sorts cleanly, toggles Editorial vs Technical view, and keeps Secondary controls separate', async () => {
    const user = userEvent.setup();
    renderStudioDesk('architect');

    // Secondary group separates Presentation & Planned modules cleanly
    const secondaryRegion = screen.getByRole('region', {
      name: /Preferências da vista e módulos futuros/i,
    });
    expect(
      within(secondaryRegion).getByRole('button', { name: /Lista Técnica/i }),
    ).toBeInTheDocument();
    expect(
      within(secondaryRegion).getByRole('button', {
        name: /Viewer 3D \(\.glb\) · Fase 04/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Todos os registos/i }),
    );

    await user.click(
      within(secondaryRegion).getByRole('button', { name: /Lista Técnica/i }),
    );
    expect(screen.getByRole('table')).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', {
      name: /Procurar por código ou título/i,
    });
    await user.type(searchInput, 'Terrários');
    expect(
      screen.getAllByText(/Corredor Pedonal & Terrários da Costa/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryAllByText(/Arquivo de Matéria & Inércia Climática/i),
    ).toHaveLength(0);

    await user.clear(searchInput);
    const sortSelect = screen.getByRole('combobox', { name: /Ordenar por/i });
    await user.selectOptions(sortSelect, 'code');
    const codeRows = screen.getAllByRole('row').slice(1);
    expect(codeRows[0].textContent).toContain('OA-25-084');
  });

  it('replaces document.title on mount and tracks PT/EN bilingual switching across all desk regions', async () => {
    const user = userEvent.setup();
    renderStudioDesk('communications');

    expect(document.title).toBe('O+A Workspace — Mesa de Trabalho (Demo)');

    await user.click(
      screen.getByRole('button', { name: 'Toggle Lang Harness' }),
    );

    expect(document.title).toBe('O+A Workspace — Studio Desk (Demo)');
    expect(
      screen.getByRole('button', { name: /Open next priority/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^My work$/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('heading', {
        name: /Active frontline & priorities/i,
      }),
    ).toBeInTheDocument();
  });

  it('traps Tab and Shift+Tab inside ProjectDossierDialog, locks scroll, marks background inert, and restores focus on Escape', async () => {
    const user = userEvent.setup();
    renderStudioDesk('architect');

    const rootContainer = document.querySelector(
      '#root, [data-testid="test-session-controls"]',
    )?.parentElement?.parentElement;

    const featuredTrigger = screen.getByRole('button', {
      name: /Abrir dossier do projecto/i,
    });
    await user.click(featuredTrigger);

    const dialog = await screen.findByRole('dialog');
    const closeX = within(dialog).getByRole('button', {
      name: /Fechar janela de detalhes/i,
    });
    const closeBottom = within(dialog).getByRole('button', { name: /^Fechar$/i });

    expect(closeX).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    if (rootContainer) {
      expect(rootContainer).toHaveAttribute('inert');
      expect(rootContainer).toHaveAttribute('aria-hidden', 'true');
    }

    fireEvent.keyDown(closeBottom, { key: 'Tab' });
    expect(closeX).toHaveFocus();

    fireEvent.keyDown(closeX, { key: 'Tab', shiftKey: true });
    expect(closeBottom).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(document.body.style.overflow).toBe('');
    expect(featuredTrigger).toHaveFocus();
  });

  it('keeps per-role presentation modes isolated and clears local task state consistently across profile switches', async () => {
    const user = userEvent.setup();
    renderStudioDesk('director');

    await user.click(
      screen.getAllByRole('button', { name: /Lista Técnica/i })[0],
    );

    // Switch to Mateo Conti (architect -> defaults to editorial)
    await user.click(
      screen.getByRole('button', { name: 'SwitchRole:architect' }),
    );
    expect(
      screen.getAllByRole('button', { name: /Modo Editorial/i })[0],
    ).toHaveAttribute('aria-pressed', 'true');

    // Switch back to director -> remembers override without breaking architect default
    await user.click(
      screen.getByRole('button', { name: 'SwitchRole:director' }),
    );
    expect(
      screen.getAllByRole('button', { name: /Lista Técnica/i })[0],
    ).toHaveAttribute('aria-pressed', 'true');

    // Sign out preserves honest fallback without leaking previous profile modal
    await user.click(screen.getByRole('button', { name: 'Sign Out Harness' }));
    expect(
      screen.getByRole('heading', {
        name: /Nenhuma sessão demonstrativa activa/i,
      }),
    ).toBeInTheDocument();
  });
});
