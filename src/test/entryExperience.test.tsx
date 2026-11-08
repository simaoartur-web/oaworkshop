import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { loadDemoSession, STORAGE_KEYS } from '../data/sessionRepository';
import { STUDIO_DESK_STORAGE_KEY } from '../data/studioDeskFixtures';
import { SHELL_STORAGE_KEYS } from '../features/workspace-shell/shellDemoState';
import { en } from '../locales/en';
import { pt } from '../locales/pt';
import { resolveDayPeriod } from '../utils/timeGreeting';

function renderWorkspaceApp(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('O+A Workspace — Phase 01 Entry & Access Verification Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('maintains strict key parity between PT and EN translation dictionaries', () => {
    const collectKeys = (obj: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return collectKeys(value as Record<string, unknown>, path);
        }
        return [path];
      });

    expect(collectKeys(en)).toEqual(collectKeys(pt));
  });

  it('computes studio-base time-of-day periods deterministically from UTC timestamps', () => {
    // 06:30Z -> 08:30 CAT (Maputo morning) / 07:30 CET winter (Milão morning)
    expect(resolveDayPeriod(new Date('2026-01-15T06:30:00Z'), 'Maputo')).toBe('morning');
    // 12:15Z -> 14:15 CAT (Maputo afternoon)
    expect(resolveDayPeriod(new Date('2026-01-15T12:15:00Z'), 'Maputo')).toBe('afternoon');
    // 19:00Z -> 21:00 CAT (Maputo evening)
    expect(resolveDayPeriod(new Date('2026-01-15T19:00:00Z'), 'Maputo')).toBe('evening');
  });

  it('guards /welcome, /workspace, and /workspace/* when unauthenticated and redirects to /login', async () => {
    for (const protectedPath of ['/welcome', '/workspace', '/workspace/projects', '/workspace/settings']) {
      const { unmount } = renderWorkspaceApp(protectedPath);
      expect(
        await screen.findByRole('heading', {
          name: /Espaço operativo de arquitectura e planeamento/i,
        }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it('redirects authenticated visitors away from /login coherently according to skipWelcomeOnLogin', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify({
        userId: DEMO_USERS[0].id,
        role: DEMO_USERS[0].role,
        authenticatedAt: '2026-11-08T10:00:00.000Z',
        mode: 'local-demo',
      }),
    );

    const { unmount } = renderWorkspaceApp('/login');
    expect(
      await screen.findByText(/Pavilhão Cívico e Arquivo da Baía/i),
    ).toBeInTheDocument();
    unmount();

    window.localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        language: 'pt',
        skipWelcomeOnLogin: true,
        reduceMotionOverride: 'system',
        updatedAt: '2026-11-08T10:00:00.000Z',
      }),
    );
    renderWorkspaceApp('/login');
    expect(
      await screen.findByRole('heading', {
        name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
      }),
    ).toBeInTheDocument();
  });

  it('safely discards corrupted or invalid localStorage sessions without crashing', () => {
    window.localStorage.setItem(STORAGE_KEYS.SESSION, '{not valid json');
    expect(loadDemoSession()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.SESSION)).toBeNull();

    window.localStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify({ userId: 'usr-dir-01', role: 'director', mode: 'tampered' }),
    );
    expect(loadDemoSession()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.SESSION)).toBeNull();
  });

  it('validates login fields non-destructively and never stores passwords in localStorage', async () => {
    const user = userEvent.setup();
    renderWorkspaceApp('/login');

    const emailInput = screen.getByLabelText(/Correio institucional/i);
    const passwordInput = screen.getByLabelText(/Código de acesso demo/i);

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.click(screen.getByRole('button', { name: /Entrar no Atelier/i }));

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(window.localStorage.getItem(STORAGE_KEYS.SESSION)).toBeNull();

    await user.type(emailInput, 'direccao.demo@oa-workspace.local');
    await user.type(passwordInput, 'wrong-key');
    await user.click(screen.getByRole('button', { name: /Entrar no Atelier/i }));

    expect(
      await screen.findByText(/Código incorrecto para o modo demonstrativo/i),
    ).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, 'oa-demo{Enter}');

    expect(
      await screen.findByText(/Pavilhão Cívico e Arquivo da Baía/i),
    ).toBeInTheDocument();

    const rawSession = window.localStorage.getItem(STORAGE_KEYS.SESSION);
    expect(rawSession).not.toBeNull();
    expect(rawSession).not.toContain('oa-demo');
    expect(rawSession).not.toContain('password');
    expect(rawSession).not.toContain('demoAccessKey');
  });

  it('opens an honest non-simulated forgot-password dialog and closes on Escape', async () => {
    const user = userEvent.setup();
    renderWorkspaceApp('/login');

    const trigger = screen.getByRole('button', {
      name: /Esqueceu-se da palavra-passe/i,
    });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByText(/Não existe servidor de autenticação nem envio real/i),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('switches PT/EN seamlessly and toggles between Spatial Study and 1:100 Section on /login', async () => {
    const user = userEvent.setup();
    renderWorkspaceApp('/login');

    await user.click(
      screen.getByRole('button', { name: /Mudar idioma para inglês/i }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Operating space for architecture and planning/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /1:100 Orthogonal Section/i }),
    );
    expect(
      await screen.findByRole('img', {
        name: /Orthogonal architectural section technical drawing/i,
      }),
    ).toBeInTheDocument();
  });

  it('completes /login -> /welcome -> /workspace -> logout -> /login and respects skipWelcomeOnLogin & full demo reset', async () => {
    const user = userEvent.setup();
    renderWorkspaceApp('/login');

    await user.click(
      screen.getByRole('button', {
        name: /Entrar como Mateo Conti \(Demo\)/i,
      }),
    );

    expect(
      await screen.findByText(/Actualizar exportação \.glb leve/i),
    ).toBeInTheDocument();

    const skipCheckbox = screen.getByRole('checkbox', {
      name: /Abrir directamente o workspace nas próximas entradas/i,
    });
    await user.click(skipCheckbox);
    expect(skipCheckbox).toBeChecked();

    await user.click(
      screen.getByRole('button', { name: /^Entrar no Workspace$/i }),
    );

    expect(
      await screen.findByRole('heading', {
        name: /Bom dia, Mateo Conti|Boa tarde, Mateo Conti|Boa noite, Mateo Conti/i,
      }),
    ).toBeInTheDocument();

    // Terminar sessão demo directly from ContextualHeader
    await user.click(
      screen.getByRole('button', { name: /Terminar sessão demo/i }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Espaço operativo de arquitectura e planeamento/i,
      }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEYS.SESSION)).toBeNull();

    // Sign in again as Mateo Conti -> goes straight to /workspace inside Shell (skipWelcomeOnLogin is active)
    await user.click(
      screen.getByRole('button', {
        name: /Entrar como Mateo Conti \(Demo\)/i,
      }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Bom dia, Mateo Conti|Boa tarde, Mateo Conti|Boa noite, Mateo Conti/i,
      }),
    ).toBeInTheDocument();

    // Open user context menu -> navigate to settings
    await user.click(
      screen.getByRole('button', { name: /Menu do utilizador demo/i }),
    );
    await user.click(
      screen.getByRole('menuitem', { name: /Preferências/i }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Configuração local do ambiente demonstrativo/i,
      }),
    ).toBeInTheDocument();

    // Full demo reset cleans session, preferences, notifications, rail, and studio desk localStorage keys
    await user.click(
      screen.getByRole('button', { name: /Repor dados demo/i }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Espaço operativo de arquitectura e planeamento/i,
      }),
    ).toBeInTheDocument();

    const prefsAfterReset = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.PREFERENCES) ?? '{}',
    );
    expect(prefsAfterReset.skipWelcomeOnLogin).toBe(false);
    expect(window.localStorage.getItem(SHELL_STORAGE_KEYS.NOTIFICATIONS)).toBeNull();
    expect(window.localStorage.getItem(SHELL_STORAGE_KEYS.RAIL_COMPACT)).toBeNull();
    expect(window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY)).toBeNull();
  });
});
