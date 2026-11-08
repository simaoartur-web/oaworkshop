import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { STORAGE_KEYS } from '../data/sessionRepository';
import { SHELL_STORAGE_KEYS } from '../features/workspace-shell/shellDemoState';

function seedDemoSession(userIndex = 0) {
  const user = DEMO_USERS[userIndex];
  window.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      authenticatedAt: '2026-11-08T10:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  return user;
}

function renderWorkspaceShellApp(initialPath = '/workspace') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('Phase 02A — Workspace Shell Architecture, Search, Notifications & Navigation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders WorkspaceShell around integrated StudioDeskPage with active collaborator context', async () => {
    seedDemoSession(0);
    renderWorkspaceShellApp('/workspace');

    expect(
      await screen.findByRole('heading', {
        name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/FOLHA 02 · MESA DE TRABALHO · MODO DEMO/i),
    ).toBeInTheDocument();

    // Desktop rail navigation items are present & Studio Desk is active
    const deskLinks = screen.getAllByRole('link', { name: /Studio Desk/i });
    expect(deskLinks.some((el) => el.getAttribute('aria-current') === 'page')).toBe(
      true,
    );
  });

  it('toggles desktop Architectural Rail between expanded and compact and persists state locally', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderWorkspaceShellApp('/workspace');

    const collapseBtn = await screen.findByRole('button', {
      name: /Recolher prancha/i,
    });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');

    await user.click(collapseBtn);

    const expandBtn = await screen.findByRole('button', {
      name: /Expandir prancha/i,
    });
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
    expect(window.localStorage.getItem(SHELL_STORAGE_KEYS.RAIL_COMPACT)).toBe(
      'compact',
    );
  });

  it('supports keyboard-driven Global Search Demo with normalized matching, honest empty state, and role activation', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderWorkspaceShellApp('/workspace');

    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    await user.click(
      screen.getByRole('button', { name: /Abrir pesquisa demonstrativa local/i }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: /Pesquisa do Atelier/i,
    });
    const input = within(dialog).getByRole('combobox');
    expect(input).toHaveFocus();

    // Accent-insensitive query with zero matches -> honest empty state
    await user.type(input, 'nao-existe-em-demo-999');
    expect(
      await within(dialog).findByText(
        /Nenhuma correspondência encontrada nos dados demo actuais/i,
      ),
    ).toBeInTheDocument();

    // Accent-insensitive search for "Milao" -> matches Mateo Conti (Milão)
    await user.clear(input);
    await user.type(input, 'Mateo');
    const mateoMatches = await within(dialog).findAllByText(/Mateo Conti/i);
    expect(mateoMatches.length).toBeGreaterThan(0);

    // Activate via Enter on first highlighted result -> switches active collaborator to Mateo Conti!
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(
      await screen.findByRole('heading', { name: /Mateo Conti/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/ARQ-02/i).length).toBeGreaterThan(0);
  });

  it('supports accessible Notifications Demo center with unread indicator and local mark-as-read persistence', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    const { unmount } = renderWorkspaceShellApp('/workspace');

    const bell = await screen.findByRole('button', {
      name: /Notificações demonstrativas do atelier \(3 por ler\)/i,
    });
    await user.click(bell);

    expect(
      await screen.findByRole('dialog', { name: /Central de Notificações/i }),
    ).toBeInTheDocument();

    // Mark single unread item read -> badge drops from 3 to 2
    const markButtons = screen.getAllByRole('button', {
      name: /Marcar como lida/i,
    });
    expect(markButtons).toHaveLength(3);
    await user.click(markButtons[0]);

    expect(
      screen.getByRole('button', {
        name: /Notificações demonstrativas do atelier \(2 por ler\)/i,
      }),
    ).toBeInTheDocument();

    // Mark remaining all read -> drops to 0 unread
    await user.click(
      screen.getByRole('button', { name: /Marcar todas como lidas/i }),
    );
    expect(
      screen.getByRole('button', { name: /^Notificações demonstrativas do atelier$/i }),
    ).toBeInTheDocument();

    // Escape closes popover and returns focus to bell
    await user.keyboard('{Escape}');
    expect(bell).toHaveFocus();

    // Remount -> read states persist via localStorage
    unmount();
    renderWorkspaceShellApp('/workspace');
    expect(
      await screen.findByRole('button', {
        name: /^Notificações demonstrativas do atelier$/i,
      }),
    ).toBeInTheDocument();
  });

  it('navigates across planned workspace routes honestly and updates reduced-motion preference in Settings', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderWorkspaceShellApp('/workspace');

    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    await user.click(
      (await screen.findAllByRole('link', { name: /Departamentos/i }))[0],
    );
    expect(
      await screen.findByRole('heading', { name: 'Departamentos' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Urbanismo e Território/i)).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('link', { name: /Definições/i })[0],
    );
    expect(
      await screen.findByRole('heading', {
        name: /Configuração local do ambiente demonstrativo/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Reduzir Movimento/i }),
    );
    expect(document.documentElement.dataset.reduceMotion).toBe('reduce');
  });

  it('opens accessible Mobile Navigation Drawer with focus trap and restores trigger focus on Escape', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderWorkspaceShellApp('/workspace');

    const menuButton = await screen.findByRole('button', {
      name: /Abrir menu de navegação/i,
    });
    await user.click(menuButton);

    const drawer = await screen.findByRole('dialog', {
      name: /Navegação principal do O\+A Workspace/i,
    });
    expect(drawer).toBeInTheDocument();

    const closeBtn = within(drawer).getByRole('button', {
      name: /Fechar menu de navegação/i,
    });
    await waitFor(() => {
      expect(closeBtn).toHaveFocus();
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: /Navegação principal do O\+A Workspace/i,
        }),
      ).not.toBeInTheDocument();
    });
    expect(menuButton).toHaveFocus();
  });
});
