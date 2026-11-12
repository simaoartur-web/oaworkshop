import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { STORAGE_KEYS } from '../data/sessionRepository';
import {
  ROLE_DESK_CONFIGS,
  STUDIO_DESK_STORAGE_KEY,
} from '../data/studioDeskFixtures';
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

function renderIntegratedApp(initialPath = '/workspace') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('O+A Workspace — Phase 02 Integrated Quality Gate Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('guarantees single chrome (one header, one rail, one main) with Studio Desk at /workspace', async () => {
    seedDemoSession(0);
    renderIntegratedApp('/workspace');

    // Wait for Studio Desk lazy component to mount inside WorkspaceShell
    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    // Single contextual header
    const headers = screen.getAllByRole('banner');
    expect(headers).toHaveLength(1);

    // Single navigation rail
    const navs = screen.getAllByRole('navigation', {
      name: /Navegação principal do O\+A Workspace/i,
    });
    expect(navs).toHaveLength(1);

    // Single main content area containing Studio Desk
    const mains = screen.getAllByRole('main');
    expect(mains).toHaveLength(1);
    expect(mains[0]).toHaveAttribute('id', 'workspace-main-content');

    // Studio Desk content inside main
    expect(
      within(mains[0]).getByText(/FOLHA 02 · MESA DE TRABALHO · MODO DEMO/i),
    ).toBeInTheDocument();
    expect(
      within(mains[0]).getAllByText(/Galeria Cívica & Pátio da Ponta Vermelha/i).length,
    ).toBeGreaterThan(0);
  });

  it('adapts Studio Desk seamlessly across all 6 demo collaborator roles', async () => {
    for (let i = 0; i < DEMO_USERS.length; i++) {
      window.localStorage.clear();
      const user = seedDemoSession(i);
      const roleConfig = ROLE_DESK_CONFIGS[user.role];
      const { unmount } = renderIntegratedApp('/workspace');

      const cleanName = user.name.replace(' (Demo)', '');
      expect(
        await screen.findByRole('heading', {
          name: new RegExp(cleanName, 'i'),
        }),
      ).toBeInTheDocument();
      expect(screen.getAllByText(new RegExp(user.code, 'i')).length).toBeGreaterThan(0);

      // Department & perspective lens
      expect(
        screen.getByText(new RegExp(roleConfig.focalLensLabel.pt, 'i')),
      ).toBeInTheDocument();

      unmount();
    }
  });

  it('integrates Global Search with Studio Desk projects, showing code, client, status, and planned indicators', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderIntegratedApp('/workspace');

    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    // Open search dialog
    await user.click(
      screen.getByRole('button', { name: /Abrir pesquisa demonstrativa local/i }),
    );
    const dialog = await screen.findByRole('dialog', {
      name: /Pesquisa do Atelier/i,
    });
    const searchInput = within(dialog).getByRole('combobox');

    // Search for project code "OA-26-101"
    await user.type(searchInput, 'OA-26-101');
    expect(
      await within(dialog).findByText(/Galeria Cívica/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/OA-26-101/i),
    ).toBeInTheDocument();

    // Search for another project: "Costa"
    await user.clear(searchInput);
    await user.type(searchInput, 'Costa');
    expect(
      await within(dialog).findByText(/Corredor Pedonal/i),
    ).toBeInTheDocument();

    // Select project and press Enter -> closes dialog and highlights matched project via ?project=
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(
      await screen.findByText(/PROJECTO EM DESTAQUE · PESQUISA \/ URL/i),
    ).toBeInTheDocument();
  });

  it('keeps "O meu trabalho" as initial scope and ensures "Abrir próxima prioridade" inspects without auto-completing inside WorkspaceShell', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderIntegratedApp('/workspace');

    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    const myWorkBtn = screen.getByRole('button', { name: /^O meu trabalho$/i });
    expect(myWorkBtn).toHaveAttribute('aria-pressed', 'true');

    const pendingBefore = screen.getAllByText(/1\s+POR CONCLUIR/i).length;
    expect(pendingBefore).toBeGreaterThan(0);

    await user.click(
      screen.getByRole('button', { name: /Abrir próxima prioridade/i }),
    );

    expect(
      await screen.findByText(/Prioridade aberta em detalhe/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/1\s+POR CONCLUIR/i).length).toBe(pendingBefore);
  });

  it('harmonizes notifications popover with Studio Desk project references and planned module previews', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderIntegratedApp('/workspace');

    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    // Open notifications
    const bell = await screen.findByRole('button', {
      name: /Notificações demonstrativas do atelier/i,
    });
    await user.click(bell);

    const popover = await screen.findByRole('dialog', {
      name: /Central de Notificações/i,
    });

    // Check project reference in notification item
    expect(
      within(popover).getByText(/Galeria Cívica & Pátio da Ponta Vermelha/i),
    ).toBeInTheDocument();
    expect(
      within(popover).getByText(/Oficina de Leitura em Terra Compactada/i),
    ).toBeInTheDocument();

    // Future module previews carry planned action button
    const plannedBadges = within(popover).getAllByText(/Ver Prancha Planeada/i);
    expect(plannedBadges.length).toBeGreaterThan(0);
  });

  it('harmonizes global demo reset across all 5 localStorage keys', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);

    // Seed custom states into all 5 keys
    window.localStorage.setItem(
      SHELL_STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(['note-1']),
    );
    window.localStorage.setItem(
      SHELL_STORAGE_KEYS.RAIL_COMPACT,
      'compact',
    );
    window.localStorage.setItem(
      STUDIO_DESK_STORAGE_KEY,
      JSON.stringify({
        taskOverrides: { 'task-1': 'completed' },
        featuredPresentationOverrides: {},
      }),
    );

    renderIntegratedApp('/workspace/settings');

    expect(
      await screen.findByRole('heading', {
        name: /Configuração local do ambiente demonstrativo/i,
      }),
    ).toBeInTheDocument();

    // Trigger full reset
    await user.click(
      screen.getByRole('button', { name: /Repor dados demo/i }),
    );

    // Redirected to /login
    expect(
      await screen.findByRole('heading', {
        name: /Espaço operativo de arquitectura e planeamento/i,
      }),
    ).toBeInTheDocument();

    // All 5 storage keys cleared or reset to defaults
    expect(window.localStorage.getItem(STORAGE_KEYS.SESSION)).toBeNull();
    expect(window.localStorage.getItem(SHELL_STORAGE_KEYS.NOTIFICATIONS)).toBeNull();
    expect(window.localStorage.getItem(SHELL_STORAGE_KEYS.RAIL_COMPACT)).toBeNull();
    expect(window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY)).toBeNull();
    const prefs = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.PREFERENCES) ?? '{}',
    );
    expect(prefs.skipWelcomeOnLogin).toBe(false);
  });

  it('switches PT/EN seamlessly on the integrated workspace', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);
    renderIntegratedApp('/workspace');

    expect(
      await screen.findByText(/FOLHA 02 · MESA DE TRABALHO · MODO DEMO/i),
    ).toBeInTheDocument();

    // Switch to EN
    const enButton = screen.getByRole('button', {
      name: /Mudar idioma para inglês/i,
    });
    await user.click(enButton);

    expect(
      await screen.findByText(/SHEET 02 · STUDIO DESK · DEMO MODE/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/FEATURED PROJECT · ACTIVE DRAWING PLATE/i),
    ).toBeInTheDocument();
  });
});
