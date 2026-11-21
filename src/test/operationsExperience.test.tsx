import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { STORAGE_KEYS } from '../data/sessionRepository';
import { invalidateTasksCache } from '../data/tasksRepository';

function seedDemoSession(userIndex = 0, language: 'pt' | 'en' = 'pt') {
  const user = DEMO_USERS[userIndex];
  window.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      authenticatedAt: '2026-11-20T09:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  window.localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      language,
      skipWelcomeOnLogin: false,
      reduceMotionOverride: 'system',
      updatedAt: '2026-11-20T09:00:00.000Z',
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

describe('Phase 05 · Module 1 — TasksPage, TaskBoardView, TaskEditorDialog, CalendarPage & Studio Desk Sync', () => {
  beforeEach(() => {
    window.localStorage.clear();
    invalidateTasksCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders /workspace/tasks in List & 3-column Board views, creates a task, transitions status via buttons, and syncs live with StudioDeskPage', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/tasks');

    expect(
      await screen.findByRole('heading', { name: /Tarefas do Atelier/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tasks-list-view')).toBeInTheDocument();

    // Open TaskEditorDialog and create a new task assigned to Helena Mondlane
    await user.click(screen.getByRole('button', { name: /Nova tarefa/i }));
    const dialog = await screen.findByRole('dialog', {
      name: /Registar nova tarefa operacional/i,
    });
    const titleInput = within(dialog).getByLabelText(/Título da tarefa/i);
    expect(titleInput).toHaveFocus();

    await user.type(titleInput, 'Rever pormenor de cobertura 1:20');
    await user.type(
      within(dialog).getByLabelText(/Descrição técnica/i),
      'Validar drenagem e sombreamento do pátio.',
    );
    await user.click(
      within(dialog).getByRole('button', { name: /Criar tarefa/i }),
    );

    expect(
      await screen.findByText('Rever pormenor de cobertura 1:20'),
    ).toBeInTheDocument();

    // Switch to 3-column Board view and transition the new task to Completed via explicit button
    await user.click(
      screen.getByRole('button', { name: /Quadro Operacional/i }),
    );
    expect(screen.getByTestId('tasks-board-view')).toBeInTheDocument();
    const pendingColumn = screen.getByTestId('tasks-board-column-pending');
    expect(
      within(pendingColumn).getByText('Rever pormenor de cobertura 1:20'),
    ).toBeInTheDocument();

    const card = within(pendingColumn)
      .getByText('Rever pormenor de cobertura 1:20')
      .closest('article');
    expect(card).not.toBeNull();
    if (card) {
      await user.click(
        within(card).getByRole('button', { name: /^Concluir$/i }),
      );
    }

    const completedColumn = screen.getByTestId('tasks-board-column-completed');
    expect(
      within(completedColumn).getByText('Rever pormenor de cobertura 1:20'),
    ).toBeInTheDocument();

    // Navigate to Studio Desk -> newly created task is immediately reflected in PrioritiesPanel
    await user.click(
      screen.getAllByRole('link', { name: /Studio Desk/i })[0],
    );
    expect(
      await screen.findByText('Rever pormenor de cobertura 1:20'),
    ).toBeInTheDocument();
  });

  it('catches QuotaExceededError in TaskEditorDialog and renders an accessible role="alert" without closing the modal', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/tasks');

    await screen.findByRole('heading', { name: /Tarefas do Atelier/i });
    await user.click(screen.getByRole('button', { name: /Nova tarefa/i }));

    const dialog = await screen.findByRole('dialog');
    await user.type(
      within(dialog).getByLabelText(/Título da tarefa/i),
      'Tarefa sob quota excedida',
    );
    await user.type(
      within(dialog).getByLabelText(/Descrição técnica/i),
      'Testar protecção contra QuotaExceededError.',
    );

    const quotaErr = new DOMException('Quota exceeded', 'QuotaExceededError');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw quotaErr;
    });

    await user.click(
      within(dialog).getByRole('button', { name: /Criar tarefa/i }),
    );

    const alert = await within(dialog).findByRole('alert');
    expect(alert).toHaveTextContent(/QuotaExceededError/i);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('highlights the matched task via ?task=<id> deep link on /workspace/tasks', async () => {
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/tasks?task=task-dir-01');

    const spotlight = await screen.findByTestId('task-url-spotlight');
    expect(spotlight).toHaveTextContent(/REV · 01/i);
  });

  it('renders /workspace/calendar in Monthly Grid and Chronological Agenda views with filters and direct links to dossier/tasks', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');
    renderAppAt('/workspace/calendar');

    expect(
      await screen.findByRole('heading', { name: /Calendário Operacional/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('calendar-month-view')).toBeInTheDocument();

    // Default selected date 2026-11-12 displays joint review event with link to project dossier
    const detailPanel = screen.getByTestId('calendar-detail-panel');
    expect(
      within(detailPanel).getByText(/Revisão Crítica Conjunta/i),
    ).toBeInTheDocument();
    const dossierLink = within(detailPanel).getAllByRole('link', {
      name: /Abrir dossier/i,
    })[0];
    expect(dossierLink).toHaveAttribute(
      'href',
      '/workspace/projects/sd-proj-oa-26-101',
    );

    // Switch to Chronological Agenda and filter to Maputo studio base
    await user.click(
      screen.getByRole('button', { name: /Agenda Cronológica/i }),
    );
    const agendaView = screen.getByTestId('calendar-agenda-view');
    expect(agendaView).toBeInTheDocument();
    expect(
      within(agendaView).getAllByRole('link', { name: /Abrir tarefa/i }).length,
    ).toBeGreaterThan(0);

    await user.selectOptions(
      screen.getByLabelText(/Base de Estúdio/i),
      'Maputo',
    );
    expect(
      within(agendaView).queryByText(/Mesa Editorial PT\/EN/i),
    ).not.toBeInTheDocument();
  });

  it('supports full PT/EN parity on /workspace/tasks and /workspace/calendar', async () => {
    seedDemoSession(0, 'en');
    const { unmount } = renderAppAt('/workspace/tasks');

    expect(
      await screen.findByRole('heading', { name: /Studio Tasks/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Saved in this browser \(demo\)/i),
    ).toBeInTheDocument();
    unmount();

    renderAppAt('/workspace/calendar');
    expect(
      await screen.findByRole('heading', { name: /Operational Calendar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Chronological Agenda/i }),
    ).toBeInTheDocument();
  });
});
