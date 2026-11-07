import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { STORAGE_KEYS } from '../data/sessionRepository';
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

describe('O+A Workspace — Phase 00 & Phase 01 Acceptance Suite', () => {
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

  it('computes respectful time-of-day periods accurately', () => {
    expect(resolveDayPeriod(new Date('2026-11-07T08:30:00'))).toBe('morning');
    expect(resolveDayPeriod(new Date('2026-11-07T14:15:00'))).toBe('afternoon');
    expect(resolveDayPeriod(new Date('2026-11-07T21:00:00'))).toBe('evening');
  });

  it('guards /welcome and /workspace when unauthenticated and redirects to /login', async () => {
    renderWorkspaceApp('/welcome');
    expect(
      await screen.findByRole('heading', {
        name: /Espaço operativo de arquitectura e planeamento/i,
      }),
    ).toBeInTheDocument();
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

    // Test invalid password with valid demo email
    await user.type(emailInput, 'direccao.demo@oa-workspace.local');
    await user.type(passwordInput, 'wrong-key');
    await user.click(screen.getByRole('button', { name: /Entrar no Atelier/i }));

    expect(
      await screen.findByText(/Código incorrecto para o modo demonstrativo/i),
    ).toBeInTheDocument();

    // Test valid login and verify zero-password invariant in localStorage
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

    await user.click(
      screen.getByRole('button', { name: /Esqueceu-se da palavra-passe/i }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByText(/Não existe servidor de autenticação nem envio real/i),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
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

    // Toggle architectural 1:100 section SVG
    await user.click(
      screen.getByRole('button', { name: /1:100 Orthogonal Section/i }),
    );
    expect(
      await screen.findByRole('img', {
        name: /Orthogonal architectural section technical drawing/i,
      }),
    ).toBeInTheDocument();
  });

  it('completes /login -> /welcome -> /workspace -> logout -> /login and respects skipWelcomeOnLogin', async () => {
    const user = userEvent.setup();
    renderWorkspaceApp('/login');

    // Quick-enter as Senior Architect (Mateo Conti)
    await user.click(
      screen.getByRole('button', {
        name: /Entrar como Mateo Conti \(Demo\)/i,
      }),
    );

    // Arrives at /welcome with Architect priorities
    expect(
      await screen.findByText(/Mateo Conti \(Demo\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Actualizar exportação \.glb leve/i),
    ).toBeInTheDocument();

    // Enable "Abrir directamente o workspace nas próximas entradas"
    const skipCheckbox = screen.getByRole('checkbox', {
      name: /Abrir directamente o workspace nas próximas entradas/i,
    });
    await user.click(skipCheckbox);
    expect(skipCheckbox).toBeChecked();

    // Continue to /workspace
    await user.click(
      screen.getByRole('button', { name: /^Entrar no Workspace$/i }),
    );

    expect(
      await screen.findByRole('heading', {
        name: /Sessão demonstrativa iniciada no O\+A Workspace/i,
      }),
    ).toBeInTheDocument();

    // Logout -> returns to /login
    await user.click(
      screen.getByRole('button', { name: /Terminar sessão demo/i }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Espaço operativo de arquitectura e planeamento/i,
      }),
    ).toBeInTheDocument();

    // Sign in again -> because skipWelcomeOnLogin is true, goes directly to /workspace!
    await user.click(
      screen.getByRole('button', { name: /Entrar no Atelier/i }),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Sessão demonstrativa iniciada no O\+A Workspace/i,
      }),
    ).toBeInTheDocument();

    // Reset demo data -> clears session and preferences cleanly
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
  });
});
