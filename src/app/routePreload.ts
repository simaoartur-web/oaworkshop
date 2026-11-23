import { createElement, lazy, type ComponentType } from 'react';

export type WorkspacePreloadKey =
  | 'welcome'
  | 'shell'
  | 'desk'
  | 'settings'
  | 'projects'
  | 'projects-new'
  | 'project-dossier'
  | 'project-model'
  | 'tasks'
  | 'calendar'
  | 'departments'
  | 'team'
  | 'library'
  | 'publications'
  | 'activity'
  | 'reports'
  | 'planned';

export type RouteLoaderMap = Record<WorkspacePreloadKey, () => Promise<unknown>>;

export const loadWelcomePage = () => import('../features/welcome/WelcomePage');
export const loadWorkspaceShell = () =>
  import('../features/workspace-shell/WorkspaceShell');
export const loadStudioDeskPage = () =>
  import('../features/studio-desk/StudioDeskPage');
export const loadProjectLibraryCatalogPage = () =>
  import('../features/project-library/ProjectLibraryCatalogPage');
export const loadProjectCreateEnginePage = () =>
  import('../features/project-library/ProjectCreateEnginePage');
export const loadProjectDossierShellPage = () =>
  import('../features/project-library/ProjectDossierShellPage');
export const loadProjectModelEnginePage = () =>
  import('../features/model-engine/ProjectModelEnginePage');
export const loadWorkspaceSettingsPage = () =>
  import('../features/workspace/WorkspaceSettingsPage');
export const loadTasksPage = () => import('../features/operations/TasksPage');
export const loadCalendarPage = () =>
  import('../features/operations/CalendarPage');
export const loadDepartmentsPage = () =>
  import('../features/studio-structure/DepartmentsPage');
export const loadTeamPage = () =>
  import('../features/studio-structure/TeamPage');
export const loadTechnicalLibraryPage = () =>
  import('../features/studio-structure/TechnicalLibraryPage');
export const loadPublicationsPage = () =>
  import('../features/editorial-control/PublicationsPage');
export const loadActivityPage = () =>
  import('../features/editorial-control/ActivityPage');
export const loadReportsPage = () =>
  import('../features/editorial-control/ReportsPage');
export const loadPlannedModuleView = () =>
  import('../features/workspace/PlannedModuleView');

const DEFAULT_ROUTE_LOADERS: RouteLoaderMap = {
  welcome: loadWelcomePage,
  shell: loadWorkspaceShell,
  desk: loadStudioDeskPage,
  settings: loadWorkspaceSettingsPage,
  projects: loadProjectLibraryCatalogPage,
  'projects-new': loadProjectCreateEnginePage,
  'project-dossier': loadProjectDossierShellPage,
  'project-model': loadProjectModelEnginePage,
  tasks: loadTasksPage,
  calendar: loadCalendarPage,
  departments: loadDepartmentsPage,
  team: loadTeamPage,
  library: loadTechnicalLibraryPage,
  publications: loadPublicationsPage,
  activity: loadActivityPage,
  reports: loadReportsPage,
  planned: loadPlannedModuleView,
};

const completedWorkspacePreloads = new Set<WorkspacePreloadKey>();
const inFlightWorkspacePreloads = new Map<WorkspacePreloadKey, Promise<boolean>>();

export function resolveWorkspacePreloadKey(pathname: string): WorkspacePreloadKey {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === '/workspace') {
    return 'desk';
  }
  if (normalized === '/workspace/settings') {
    return 'settings';
  }
  if (normalized === '/workspace/projects') {
    return 'projects';
  }
  if (normalized === '/workspace/projects/new') {
    return 'projects-new';
  }
  if (normalized === '/workspace/tasks') {
    return 'tasks';
  }
  if (normalized === '/workspace/calendar') {
    return 'calendar';
  }
  if (normalized === '/workspace/departments') {
    return 'departments';
  }
  if (normalized === '/workspace/team') {
    return 'team';
  }
  if (normalized === '/workspace/library') {
    return 'library';
  }
  if (normalized === '/workspace/publications') {
    return 'publications';
  }
  if (normalized === '/workspace/activity') {
    return 'activity';
  }
  if (normalized === '/workspace/reports') {
    return 'reports';
  }
  if (/^\/workspace\/projects\/[^/]+\/model$/.test(normalized)) {
    return 'project-model';
  }
  if (/^\/workspace\/projects\/[^/]+$/.test(normalized)) {
    return 'project-dossier';
  }
  return 'planned';
}

/**
 * Safely preloads a route chunk by key:
 * - Never leaves unhandled promise rejections.
 * - Marks a key as completed ONLY after the dynamic import resolves.
 * - Clears in-flight tracking in `finally` so failed preloads can be retried cleanly.
 */
export function preloadRouteKey(
  key: WorkspacePreloadKey,
  loader: () => Promise<unknown> = DEFAULT_ROUTE_LOADERS[key],
): Promise<boolean> {
  if (completedWorkspacePreloads.has(key)) {
    return Promise.resolve(true);
  }
  const existing = inFlightWorkspacePreloads.get(key);
  if (existing) {
    return existing;
  }

  const attempt = Promise.resolve()
    .then(() => loader())
    .then(() => {
      completedWorkspacePreloads.add(key);
      return true;
    })
    .catch(() => {
      return false;
    })
    .finally(() => {
      inFlightWorkspacePreloads.delete(key);
    });

  inFlightWorkspacePreloads.set(key, attempt);
  return attempt;
}

export function preloadMatchedWorkspaceChild(
  pathname: string,
  loaderOverrides?: Partial<RouteLoaderMap>,
): Promise<boolean> {
  const key = resolveWorkspacePreloadKey(pathname);
  const loader = loaderOverrides?.[key] ?? DEFAULT_ROUTE_LOADERS[key];
  return preloadRouteKey(key, loader);
}

export function preloadWorkspaceEntry(
  loaderOverrides?: Partial<RouteLoaderMap>,
): Promise<[boolean, boolean]> {
  return Promise.all([
    preloadRouteKey('shell', loaderOverrides?.shell ?? DEFAULT_ROUTE_LOADERS.shell),
    preloadRouteKey('desk', loaderOverrides?.desk ?? DEFAULT_ROUTE_LOADERS.desk),
  ]);
}

/**
 * Eliminates the cold-load waterfall for authenticated lazy routes by starting
 * the exact matched route chunk at module bootstrap before React's first
 * render/effect commits. Never downloads chunks on `/login` or when no local
 * demo session is present, and never pulls 3D chunks outside `/model`.
 */
export function preloadInitialBrowserRoute(): void {
  if (typeof window === 'undefined') {
    return;
  }
  let hasStoredSession = false;
  try {
    hasStoredSession = Boolean(
      window.localStorage.getItem('oa_workspace_demo_session_v1'),
    );
  } catch {
    hasStoredSession = false;
  }
  if (!hasStoredSession) {
    return;
  }

  const rawPath = window.location?.pathname ?? '/';
  const pathname =
    rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;

  if (pathname === '/welcome') {
    void preloadRouteKey('welcome');
    return;
  }

  if (pathname === '/workspace' || pathname.startsWith('/workspace/')) {
    void preloadRouteKey('shell');
    void preloadMatchedWorkspaceChild(pathname);
  }
}

export function isWorkspaceRoutePreloaded(key: WorkspacePreloadKey): boolean {
  return completedWorkspacePreloads.has(key);
}

export function resetWorkspacePreloadStateForTests(): void {
  completedWorkspacePreloads.clear();
  inFlightWorkspacePreloads.clear();
}

export interface RetryableLazyHandle<P extends object> {
  Component: ComponentType<P>;
  reset: () => void;
}

/**
 * Creates a React.lazy wrapper whose internal lazy reference can be recreated
 * after a chunk import failure so ErrorBoundary retries trigger a fresh import.
 */
export function createRetryableLazy<P extends object>(
  importer: () => Promise<{ default: ComponentType<P> }>,
): RetryableLazyHandle<P> {
  let LazyImpl = lazy(importer);

  const reset = () => {
    LazyImpl = lazy(importer);
  };

  function RetryableLazyComponent(props: P) {
    return createElement(LazyImpl, props);
  }

  return {
    Component: RetryableLazyComponent,
    reset,
  };
}
