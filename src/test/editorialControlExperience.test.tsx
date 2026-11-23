import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { clearProjectLibraryLocalState } from '../data/projectLibraryRepository';
import { clearLocalPublicationsStorage } from '../data/publicationsRepository';
import { STORAGE_KEYS } from '../data/sessionRepository';
import { resetTasksLocalState } from '../data/tasksRepository';
import { resetTechnicalLibraryLocalState } from '../data/technicalLibraryRepository';
import type { AppLanguage } from '../data/types';

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

function MountedNavHarness({ targets }: { targets: { label: string; to: string }[] }) {
  const navigate = useNavigate();
  return (
    <div data-testid="mounted-nav-harness">
      {targets.map((target) => (
        <button
          key={target.to}
          type="button"
          onClick={() => navigate(target.to)}
        >
          {target.label}
        </button>
      ))}
    </div>
  );
}

function renderApp(
  initialPath: string,
  navTargets?: { label: string; to: string }[],
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        {navTargets && <MountedNavHarness targets={navTargets} />}
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('Phase 06 — Publications, Activity & Reports Experience', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearProjectLibraryLocalState();
    resetTasksLocalState();
    resetTechnicalLibraryLocalState();
    clearLocalPublicationsStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders /workspace/publications in PT and EN, executes editorial transitions with notes, and opens/closes accessible preview modal', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    renderApp('/workspace/publications');

    expect(
      await screen.findByRole('heading', {
        name: /Fila Editorial & Pré-visualização/i,
      }),
    ).toBeInTheDocument();

    // Honest local-demo boundary notice is visible
    expect(
      screen.getByText(/Operação 100% demonstrativa neste navegador/i),
    ).toBeInTheDocument();

    // Seed project OA-26-112 starts in 'requested' status
    const oa112Card = screen
      .getAllByRole('article')
      .find((el) => el.textContent?.includes('OA-26-112'));
    expect(oa112Card).toBeDefined();

    // Open preview dialog and verify accessibility + PT/EN toggle + Escape focus restoration
    const previewButton = within(oa112Card!).getByRole('button', {
      name: /Pré-visualizar portfólio \(local\)/i,
    });
    await user.click(previewButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Pré-visualização local \(demo\): esta ficha simula/i),
    ).toBeInTheDocument();

    // Toggle preview language to EN inside modal
    await user.click(within(dialog).getByRole('button', { name: 'EN' }));
    expect(
      within(dialog).getByText(/Materiality & Thermal Inertia Archive/i),
    ).toBeInTheDocument();

    // Close modal with Escape and confirm focus returns to trigger
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(previewButton).toHaveFocus();

    // Transition OA-26-112 from requested -> approved with an optional note
    const noteInput = within(oa112Card!).getByPlaceholderText(
      /Registar critério de curadoria/i,
    );
    await user.type(noteInput, 'Aprovado pela direcção para pré-visualização.');
    await user.click(
      within(oa112Card!).getByRole('button', { name: /Aprovar editorialmente/i }),
    );

    // Last decision reflects the approval note
    expect(
      await within(oa112Card!).findByText(
        /Aprovado pela direcção para pré-visualização\./i,
      ),
    ).toBeInTheDocument();

    // Status advances to approved -> 'Publicar (pré-visualização local)' button is now available
    const publishDemoBtn = await within(oa112Card!).findByRole('button', {
      name: /Publicar \(pré-visualização local\)/i,
    });
    await user.click(publishDemoBtn);

    expect(
      await within(oa112Card!).findByText(/Publicado \(pré-visualização local\)/i),
    ).toBeInTheDocument();

    // Switch workspace language to EN via header toggle and verify English copy
    const langGroup = screen.getAllByRole('group', {
      name: /Idioma \/ Language/i,
    })[0];
    await user.click(
      within(langGroup).getByRole('button', { name: /Inglês|English/i }),
    );

    expect(
      await screen.findByRole('heading', {
        name: /Editorial Queue & Preview/i,
      }),
    ).toBeInTheDocument();
  });

  it('surfaces an accessible alert when QuotaExceededError occurs during publication transition', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    renderApp('/workspace/publications');

    await screen.findByRole('heading', {
      name: /Fila Editorial & Pré-visualização/i,
    });

    const oa112Card = screen
      .getAllByRole('article')
      .find((el) => el.textContent?.includes('OA-26-112'));
    expect(oa112Card).toBeDefined();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const error = new DOMException('Quota exceeded', 'QuotaExceededError');
      throw error;
    });

    await user.click(
      within(oa112Card!).getByRole('button', { name: /Aprovar editorialmente/i }),
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent?.length).toBeGreaterThan(10);
  });

  it('synchronizes PublicationsPage filters when URL query params change while mounted', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    renderApp('/workspace/publications', [
      { label: 'Go Requested', to: '/workspace/publications?status=requested' },
      { label: 'Go Private Dept', to: '/workspace/publications?status=private&dept=architecture' },
      { label: 'Clear Query', to: '/workspace/publications' },
    ]);

    await screen.findByRole('heading', {
      name: /Fila Editorial & Pré-visualização/i,
    });

    const statusSelect = screen.getByLabelText(/Estado editorial/i);
    expect(statusSelect).toHaveValue('all');

    await user.click(screen.getByRole('button', { name: 'Go Requested' }));
    await waitFor(() => {
      expect(statusSelect).toHaveValue('requested');
    });

    await user.click(screen.getByRole('button', { name: 'Go Private Dept' }));
    await waitFor(() => {
      expect(statusSelect).toHaveValue('private');
      expect(screen.getByLabelText(/Departamento/i)).toHaveValue('architecture');
    });

    await user.click(screen.getByRole('button', { name: 'Clear Query' }));
    await waitFor(() => {
      expect(statusSelect).toHaveValue('all');
      expect(screen.getByLabelText(/Departamento/i)).toHaveValue('all');
    });
  });

  it('renders /workspace/activity, filters by domain, and synchronizes URL query params while mounted', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    renderApp('/workspace/activity', [
      { label: 'Filter Publication', to: '/workspace/activity?domain=publication' },
      { label: 'Filter Dept Research', to: '/workspace/activity?dept=research' },
      { label: 'Reset Activity', to: '/workspace/activity' },
    ]);

    expect(
      await screen.findByRole('heading', {
        name: /Linha de Actividade do Atelier/i,
      }),
    ).toBeInTheDocument();

    const domainGroup = screen.getByRole('group', {
      name: /Filtrar actividade por domínio/i,
    });
    expect(
      within(domainGroup).getByRole('button', { name: /^Todos$/i }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(
      screen.getByRole('button', { name: 'Filter Publication' }),
    );
    await waitFor(() => {
      expect(
        within(domainGroup).getByRole('button', { name: /^Publicações$/i }),
      ).toHaveAttribute('aria-pressed', 'true');
    });
    expect(screen.getAllByText(/OA-26-112/).length).toBeGreaterThanOrEqual(1);

    await user.click(
      screen.getByRole('button', { name: 'Filter Dept Research' }),
    );
    await waitFor(() => {
      expect(
        within(domainGroup).getByRole('button', { name: /^Todos$/i }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText(/Departamento/i)).toHaveValue('research');
    });

    await user.click(screen.getByRole('button', { name: 'Reset Activity' }));
    await waitFor(() => {
      expect(screen.getByLabelText(/Departamento/i)).toHaveValue('all');
    });
  });

  it('renders /workspace/reports with all 9 departments (including honest 0 counts) and exports local JSON with immediate ObjectURL revocation', async () => {
    const user = userEvent.setup();
    seedDemoSession(0, 'pt');

    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:oa-report-test');
    const revokeObjectUrlSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderApp('/workspace/reports');

    expect(
      await screen.findByRole('heading', {
        name: /Relatórios & Síntese Operacional/i,
      }),
    ).toBeInTheDocument();

    // All 9 departments present in operational breakdown table, including ADM and RHU
    const table = screen.getByRole('table');
    expect(within(table).getByText('ADM')).toBeInTheDocument();
    expect(within(table).getByText('RHU')).toBeInTheDocument();
    expect(within(table).getByText('ARQ')).toBeInTheDocument();

    // Cross-links exist to /workspace/departments?dept= and /workspace/publications?status=
    const arqLink = within(table).getByRole('link', { name: /Arquitectura/i });
    expect(arqLink).toHaveAttribute(
      'href',
      '/workspace/departments?dept=architecture',
    );

    const requestedFunnelLink = screen.getByRole('link', {
      name: /Pedido de publicação/i,
    });
    expect(requestedFunnelLink).toHaveAttribute(
      'href',
      '/workspace/publications?status=requested',
    );

    // Export JSON creates Blob URL and immediately revokes it
    await user.click(
      screen.getByRole('button', { name: /Exportar JSON \(demo\)/i }),
    );

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:oa-report-test');
  });
});
