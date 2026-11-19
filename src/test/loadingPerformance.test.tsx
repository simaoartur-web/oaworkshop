import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import {
  createRetryableLazy,
  isWorkspaceRoutePreloaded,
  preloadMatchedWorkspaceChild,
  resetWorkspacePreloadStateForTests,
} from '../app/routePreload';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { STORAGE_KEYS } from '../data/sessionRepository';
import { STUDIO_DESK_PROJECTS } from '../data/studioDeskFixtures';
import {
  EditorialEntryLoadingFallback,
  RouteChunkErrorBoundary,
  WorkspaceContentLoadingState,
} from '../features/loading/RouteLoadingStates';
import { FeaturedProjectPlate } from '../features/studio-desk/FeaturedProjectPlate';
import { STUDIO_DESK_I18N } from '../features/studio-desk/i18n';
import { ProjectOverviewPanel } from '../features/studio-desk/ProjectOverviewPanel';
import { pt } from '../locales/pt';
import {
  formatEditorialDate,
  formatGreetingForTime,
  formatStudioClocks,
  resolveMilanTimeZoneAbbreviation,
} from '../utils/timeGreeting';

function seedDemoSession(userIndex = 0) {
  const user = DEMO_USERS[userIndex];
  window.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      authenticatedAt: '2026-11-18T10:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  return user;
}

describe('Phase 04.5B — Bundle Optimization, Loading Experience, Time Cache & Image Strategy', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('caches Intl.DateTimeFormat instances across repeated calls while preserving Maputo/Milan timezones, day rollovers, and CET/CEST DST transitions', () => {
    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    let constructorCount = 0;

    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation((...args) => {
      constructorCount += 1;
      return new OriginalDateTimeFormat(...args);
    });

    // Distinct timestamps across winter, spring DST, summer, autumn DST, and day boundary
    const dates = [
      new Date('2026-01-15T10:00:00Z'),
      new Date('2026-03-29T00:59:00Z'), // CET (before 01:00Z spring transition)
      new Date('2026-03-29T01:05:00Z'), // CEST (after 01:00Z spring transition)
      new Date('2026-07-16T22:30:00Z'), // Day rollover to 17 July in Africa/Maputo & Europe/Rome
      new Date('2026-10-25T00:59:00Z'), // CEST (before 01:00Z autumn transition)
      new Date('2026-10-25T01:05:00Z'), // CET (after 01:00Z autumn transition)
    ];

    // Warm caches across all distinct formatter shapes
    for (const d of dates) {
      formatStudioClocks(d);
      formatEditorialDate('pt', d, 'Maputo');
      formatEditorialDate('en', d, 'Milão');
      formatGreetingForTime(pt, d, 'Maputo');
      formatGreetingForTime(pt, d, 'Milão');
    }
    const countAfterWarmup = constructorCount;

    // 50 repeated calls across different minutes/timestamps must allocate ZERO new formatters
    for (let i = 0; i < 50; i += 1) {
      const sample = new Date(Date.UTC(2026, 4, 1 + (i % 20), i % 24, (i * 7) % 60));
      formatStudioClocks(sample);
      formatEditorialDate('pt', sample, 'Maputo');
      formatEditorialDate('en', sample, 'Milão');
      formatGreetingForTime(pt, sample, 'Maputo');
      formatGreetingForTime(pt, sample, 'Milão');
    }
    expect(constructorCount).toBe(countAfterWarmup);

    // Exact behavioral checks preserved
    expect(resolveMilanTimeZoneAbbreviation(dates[1])).toBe('CET');
    expect(resolveMilanTimeZoneAbbreviation(dates[2])).toBe('CEST');
    expect(resolveMilanTimeZoneAbbreviation(dates[4])).toBe('CEST');
    expect(resolveMilanTimeZoneAbbreviation(dates[5])).toBe('CET');

    const clocksWinter = formatStudioClocks(dates[0]);
    expect(clocksWinter.maputo).toBe('12:00 CAT');
    expect(clocksWinter.milan).toBe('11:00 CET');

    expect(formatEditorialDate('en', dates[3], 'Maputo')).toContain('17 July 2026');
    expect(formatEditorialDate('en', dates[3], 'Milão')).toContain('17 July 2026');
  });

  it('preserves WorkspaceShell chrome (header and rail DOM nodes) across lazy route transitions without flashing or losing navigation', async () => {
    const user = userEvent.setup();
    seedDemoSession(0);

    render(
      <MemoryRouter initialEntries={['/workspace']}>
        <WorkspaceSessionProvider>
          <AppRoutes />
        </WorkspaceSessionProvider>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', {
      name: /Bom dia, Helena Mondlane|Boa tarde, Helena Mondlane|Boa noite, Helena Mondlane/i,
    });

    const headerBefore = screen.getAllByRole('banner')[0];
    const navBefore = screen.getByRole('navigation', {
      name: /Navegação principal do O\+A Workspace/i,
    });

    // Navigate inside shell to lazy WorkspaceSettingsPage
    await user.click(screen.getByRole('link', { name: /Definições/i }));
    await screen.findByRole('heading', { name: pt.shell.settings.heading });

    expect(screen.getAllByRole('banner')[0]).toBe(headerBefore);
    expect(
      screen.getByRole('navigation', {
        name: /Navegação principal do O\+A Workspace/i,
      }),
    ).toBe(navBefore);

    // Navigate inside shell to lazy ProjectLibraryCatalogPage
    await user.click(screen.getByRole('link', { name: /Projectos/i }));
    await screen.findByText(/OA-26-101/i);

    expect(screen.getAllByRole('banner')[0]).toBe(headerBefore);
  });

  it('renders accessible, non-flashing dark loading states in PT and EN without continuous decorative animations', () => {
    const { rerender } = render(<EditorialEntryLoadingFallback language="pt" />);
    const entryFallback = screen.getByTestId('editorial-entry-loading');
    expect(entryFallback).toHaveAttribute('role', 'status');
    expect(entryFallback).toHaveAttribute('aria-live', 'polite');
    expect(entryFallback.className).toContain('bg-[#050505]');
    expect(entryFallback.innerHTML).not.toMatch(/animate-pulse|animate-spin|animate-bounce/);

    rerender(<WorkspaceContentLoadingState language="en" />);
    const contentFallback = screen.getByTestId('workspace-content-loading');
    expect(contentFallback).toHaveAttribute('role', 'status');
    expect(contentFallback).toHaveAttribute('aria-live', 'polite');
    expect(contentFallback).toHaveTextContent(/O\+A WORKSPACE · LOADING MODULE/i);
    expect(contentFallback.innerHTML).not.toMatch(/animate-pulse|animate-spin|animate-bounce/);
  });

  it('keeps above-the-fold priority decoding="async" on FeaturedProjectPlate and lazy decoding="async" on ProjectOverviewPanel cards', () => {
    const deskDict = STUDIO_DESK_I18N.pt;
    const featured = STUDIO_DESK_PROJECTS[0];

    const { unmount } = render(
      <FeaturedProjectPlate
        project={featured}
        activeRole="director"
        language="pt"
        deskDict={deskDict}
        showDatumOverlay={false}
        onToggleDatumOverlay={() => {}}
        onInspectDossier={() => {}}
      />,
    );

    const heroImg = screen.getByRole('img');
    expect(heroImg).toHaveAttribute('loading', 'eager');
    expect(heroImg).toHaveAttribute('decoding', 'async');
    expect(heroImg).toHaveAttribute('fetchpriority', 'high');
    unmount();

    render(
      <ProjectOverviewPanel
        projects={STUDIO_DESK_PROJECTS}
        activeRole="director"
        currentUserId={DEMO_USERS[0].id}
        highlightedProjectId={null}
        language="pt"
        deskDict={deskDict}
        overviewFocusNote="Foco demonstrativo"
        presentationMode="editorial"
        onPresentationModeChange={() => {}}
        statusFilter="all"
        onStatusFilterChange={() => {}}
        sortBy="priority"
        onSortByChange={() => {}}
        searchQuery=""
        onSearchQueryChange={() => {}}
        onInspectDossier={() => {}}
        onResetFilters={() => {}}
      />,
    );

    const cardImgs = screen.getAllByRole('img');
    expect(cardImgs.length).toBeGreaterThan(0);
    for (const img of cardImgs) {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    }
  });

  it('handles preloadMatchedWorkspaceChild import failures without unhandled rejections, never marks failed routes completed, and retries cleanly on recovery', async () => {
    resetWorkspacePreloadStateForTests();
    const unhandledRejections: unknown[] = [];
    const onUnhandled = (event: PromiseRejectionEvent) => {
      unhandledRejections.push(event.reason);
    };
    window.addEventListener('unhandledrejection', onUnhandled);

    try {
      let attemptCount = 0;
      const flakyProjectsLoader = vi.fn(() => {
        attemptCount += 1;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Simulated network chunk failure'));
        }
        return Promise.resolve({ ProjectLibraryCatalogPage: () => null });
      });

      const firstOutcome = await preloadMatchedWorkspaceChild(
        '/workspace/projects',
        { projects: flakyProjectsLoader },
      );
      expect(firstOutcome).toBe(false);
      expect(isWorkspaceRoutePreloaded('projects')).toBe(false);
      expect(flakyProjectsLoader).toHaveBeenCalledTimes(1);

      // Flush microtasks to guarantee no unhandled rejection was emitted
      await Promise.resolve();
      expect(unhandledRejections).toHaveLength(0);

      // Second attempt recovers cleanly and marks route as completed
      const secondOutcome = await preloadMatchedWorkspaceChild(
        '/workspace/projects',
        { projects: flakyProjectsLoader },
      );
      expect(secondOutcome).toBe(true);
      expect(isWorkspaceRoutePreloaded('projects')).toBe(true);
      expect(flakyProjectsLoader).toHaveBeenCalledTimes(2);

      // Third attempt is a cached no-op
      const thirdOutcome = await preloadMatchedWorkspaceChild(
        '/workspace/projects',
        { projects: flakyProjectsLoader },
      );
      expect(thirdOutcome).toBe(true);
      expect(flakyProjectsLoader).toHaveBeenCalledTimes(2);
    } finally {
      window.removeEventListener('unhandledrejection', onUnhandled);
      resetWorkspacePreloadStateForTests();
    }
  });

  it('catches lazy route chunk import failures in RouteChunkErrorBoundary and recovers in-place on retry', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      let shouldFail = true;
      const flakyChunk = createRetryableLazy<Record<string, never>>(() => {
        if (shouldFail) {
          return Promise.reject(new Error('ChunkLoadError: simulated offline'));
        }
        return Promise.resolve({
          default: function RecoveredModule() {
            return <div data-testid="recovered-lazy-module">Módulo recuperado</div>;
          },
        });
      });

      const FlakyComponent = flakyChunk.Component;

      render(
        <RouteChunkErrorBoundary
          language="pt"
          resetKey="/workspace/projects"
          variant="shell-content"
          onRetry={() => {
            shouldFail = false;
            flakyChunk.reset();
          }}
        >
          <Suspense fallback={<WorkspaceContentLoadingState language="pt" />}>
            <FlakyComponent />
          </Suspense>
        </RouteChunkErrorBoundary>,
      );

      const alert = await screen.findByTestId('route-chunk-error-fallback');
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveTextContent(/Não foi possível carregar este módulo/i);

      await user.click(
        screen.getByRole('button', { name: /Tentar novamente/i }),
      );

      expect(
        await screen.findByTestId('recovered-lazy-module'),
      ).toHaveTextContent('Módulo recuperado');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
