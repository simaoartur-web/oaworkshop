import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { clearProjectLibraryLocalState } from '../data/projectLibraryRepository';
import { clearLocalPublicationsStorage } from '../data/publicationsRepository';
import { STORAGE_KEYS } from '../data/sessionRepository';
import { resetTasksLocalState } from '../data/tasksRepository';
import { resetTechnicalLibraryLocalState } from '../data/technicalLibraryRepository';
import type { AppLanguage } from '../data/types';
import { FILTER_CONTROL_CLASS, FilterBar } from '../design-system/FilterBar';

const RAW_ISO_DATE_REGEX = /\b20\d{2}-\d{2}-\d{2}\b/;

function seedDemoSession(userIndex = 0, language: AppLanguage = 'pt') {
  const user = DEMO_USERS[userIndex];
  window.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      authenticatedAt: '2026-11-10T10:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  window.localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      language,
      skipWelcomeOnLogin: false,
      reduceMotionOverride: 'system',
      updatedAt: '2026-11-10T10:00:00.000Z',
    }),
  );
  return user;
}

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('Phase 08.3 (R-04 / R-05) — FilterBar Ergonomics & Editorial Formatting UI', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearProjectLibraryLocalState();
    resetTasksLocalState();
    resetTechnicalLibraryLocalState();
    clearLocalPublicationsStorage();
  });

  it('disables Reset button in FilterBar when no filters are active, enables when active, and enforces 44px uniform height', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSearch = vi.fn();

    const { rerender } = render(
      <FilterBar
        summaryText="A mostrar: 6 / 6"
        hasActiveFilters={false}
        resetLabel="Limpar filtros"
        onReset={onReset}
        search={{
          id: 'test-search',
          label: 'Pesquisar',
          value: '',
          placeholder: 'Código ou título…',
          onChange: onSearch,
        }}
      >
        <div>
          <label htmlFor="test-select">Estado</label>
          <select id="test-select" className={FILTER_CONTROL_CLASS}>
            <option value="all">Todos</option>
          </select>
        </div>
      </FilterBar>,
    );

    const resetBtn = screen.getByRole('button', { name: /Limpar filtros/i });
    expect(resetBtn).toBeDisabled();
    expect(screen.getByLabelText('Pesquisar').className).toContain('h-11');
    expect(screen.getByLabelText('Estado').className).toContain('h-11');

    rerender(
      <FilterBar
        summaryText="A mostrar: 2 / 6"
        hasActiveFilters={true}
        resetLabel="Limpar filtros"
        onReset={onReset}
        search={{
          id: 'test-search',
          label: 'Pesquisar',
          value: 'OA-26',
          placeholder: 'Código ou título…',
          onChange: onSearch,
        }}
      />,
    );

    const enabledResetBtn = screen.getByRole('button', {
      name: /Limpar filtros/i,
    });
    expect(enabledResetBtn).toBeEnabled();
    await user.click(enabledResetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('renders localized editorial dates without raw YYYY-MM-DD strings on TasksPage, CalendarPage, and ActivityPage', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    // 1. TasksPage
    const tasksView = renderApp('/workspace/tasks');
    await screen.findByRole('heading', { name: /Tarefas do Atelier/i });
    const tasksMain = screen.getByRole('main');
    expect(RAW_ISO_DATE_REGEX.test(tasksMain.textContent ?? '')).toBe(false);
    tasksView.unmount();

    // 2. CalendarPage (Month + Agenda)
    const calView = renderApp('/workspace/calendar');
    await screen.findByRole('heading', { name: /Calendário Operacional/i });
    const calMain = screen.getByRole('main');
    expect(RAW_ISO_DATE_REGEX.test(calMain.textContent ?? '')).toBe(false);
    await user.click(screen.getByRole('button', { name: /Agenda/i }));
    await waitFor(() => {
      expect(screen.getByTestId('calendar-agenda-view')).toBeInTheDocument();
    });
    expect(RAW_ISO_DATE_REGEX.test(calMain.textContent ?? '')).toBe(false);
    calView.unmount();

    // 3. ActivityPage (date group headings + disabled reset when empty)
    renderApp('/workspace/activity');
    await screen.findByRole('heading', {
      name: /Linha de Actividade do Atelier/i,
    });
    const actMain = screen.getByRole('main');
    expect(RAW_ISO_DATE_REGEX.test(actMain.textContent ?? '')).toBe(false);
    expect(
      screen.getByRole('button', { name: /Limpar filtros/i }),
    ).toBeDisabled();
  });

  it('displays Milan instead of Milão in English mode across TeamPage and ReportsPage', async () => {
    seedDemoSession(1, 'en'); // Mateo Conti (Milão)

    const teamView = renderApp('/workspace/team');
    await screen.findByRole('heading', { name: /Studio Team/i });
    expect(screen.getAllByText(/Milan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('main').textContent).not.toContain('Milão');
    teamView.unmount();

    renderApp('/workspace/reports');
    await screen.findByRole('heading', {
      name: /Operational Reports & Summary/i,
    });
    expect(screen.getAllByText(/Milan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('main').textContent).not.toContain('Milão');
  });
});
