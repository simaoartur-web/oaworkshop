import {
  Suspense,
  useCallback,
  useEffect,
  type ComponentType,
} from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { LoginPage } from '../features/auth-demo/LoginPage';
import {
  EditorialEntryLoadingFallback,
  RouteChunkErrorBoundary,
  WorkspaceContentLoadingState,
} from '../features/loading/RouteLoadingStates';
import {
  createRetryableLazy,
  loadCalendarPage,
  loadDepartmentsPage,
  loadPlannedModuleView,
  loadProjectCreateEnginePage,
  loadProjectDossierShellPage,
  loadProjectLibraryCatalogPage,
  loadProjectModelEnginePage,
  loadStudioDeskPage,
  loadTasksPage,
  loadTeamPage,
  loadTechnicalLibraryPage,
  loadWelcomePage,
  loadWorkspaceSettingsPage,
  loadWorkspaceShell,
  preloadInitialBrowserRoute,
  preloadMatchedWorkspaceChild,
  resolveWorkspacePreloadKey,
  type WorkspacePreloadKey,
} from './routePreload';

preloadInitialBrowserRoute();
import {
  WorkspaceSessionProvider,
  useWorkspaceSession,
} from './WorkspaceSessionContext';

function retryableLazyNamed<
  T extends ComponentType<Record<string, never>>,
  M extends Record<string, unknown>,
>(importer: () => Promise<M>, exportName: keyof M) {
  return createRetryableLazy(async () => {
    const mod = await importer();
    return { default: mod[exportName] as T };
  });
}

const welcomeLazy = retryableLazyNamed(loadWelcomePage, 'WelcomePage');
const workspaceShellLazy = createRetryableLazy(async () => {
  const mod = await loadWorkspaceShell();
  return { default: mod.WorkspaceShell };
});
const studioDeskLazy = retryableLazyNamed(loadStudioDeskPage, 'StudioDeskPage');
const projectLibraryCatalogLazy = retryableLazyNamed(
  loadProjectLibraryCatalogPage,
  'ProjectLibraryCatalogPage',
);
const projectCreateEngineLazy = retryableLazyNamed(
  loadProjectCreateEnginePage,
  'ProjectCreateEnginePage',
);
const projectDossierShellLazy = retryableLazyNamed(
  loadProjectDossierShellPage,
  'ProjectDossierShellPage',
);
const projectModelEngineLazy = createRetryableLazy(loadProjectModelEnginePage);
const workspaceSettingsLazy = retryableLazyNamed(
  loadWorkspaceSettingsPage,
  'WorkspaceSettingsPage',
);
const tasksPageLazy = retryableLazyNamed(loadTasksPage, 'TasksPage');
const calendarPageLazy = retryableLazyNamed(loadCalendarPage, 'CalendarPage');
const departmentsPageLazy = retryableLazyNamed(
  loadDepartmentsPage,
  'DepartmentsPage',
);
const teamPageLazy = retryableLazyNamed(loadTeamPage, 'TeamPage');
const technicalLibraryPageLazy = retryableLazyNamed(
  loadTechnicalLibraryPage,
  'TechnicalLibraryPage',
);
const plannedModuleLazy = retryableLazyNamed(
  loadPlannedModuleView,
  'PlannedModuleView',
);

const WelcomePage = welcomeLazy.Component;
const WorkspaceShell = workspaceShellLazy.Component;
const StudioDeskPage = studioDeskLazy.Component;
const ProjectLibraryCatalogPage = projectLibraryCatalogLazy.Component;
const ProjectCreateEnginePage = projectCreateEngineLazy.Component;
const ProjectDossierShellPage = projectDossierShellLazy.Component;
const ProjectModelEnginePage = projectModelEngineLazy.Component;
const WorkspaceSettingsPage = workspaceSettingsLazy.Component;
const TasksPage = tasksPageLazy.Component;
const CalendarPage = calendarPageLazy.Component;
const DepartmentsPage = departmentsPageLazy.Component;
const TeamPage = teamPageLazy.Component;
const TechnicalLibraryPage = technicalLibraryPageLazy.Component;
const PlannedModuleView = plannedModuleLazy.Component;

const WORKSPACE_CHILD_LAZY_RESETTERS: Record<
  Exclude<WorkspacePreloadKey, 'welcome' | 'shell'>,
  () => void
> = {
  desk: studioDeskLazy.reset,
  settings: workspaceSettingsLazy.reset,
  projects: projectLibraryCatalogLazy.reset,
  'projects-new': projectCreateEngineLazy.reset,
  'project-dossier': projectDossierShellLazy.reset,
  'project-model': projectModelEngineLazy.reset,
  tasks: tasksPageLazy.reset,
  calendar: calendarPageLazy.reset,
  departments: departmentsPageLazy.reset,
  team: teamPageLazy.reset,
  library: technicalLibraryPageLazy.reset,
  planned: plannedModuleLazy.reset,
};

function ScrollResetOnRouteChange() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') {
      return;
    }
    if (typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}

function RootRedirect() {
  const { session, preferences } = useWorkspaceSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Navigate
      to={preferences.skipWelcomeOnLogin ? '/workspace' : '/welcome'}
      replace
    />
  );
}

function WorkspaceShellLayout() {
  const { pathname } = useLocation();
  const { session, currentUser, language } = useWorkspaceSession();

  useEffect(() => {
    if (session && currentUser) {
      void preloadMatchedWorkspaceChild(pathname);
    }
  }, [pathname, session, currentUser]);

  const handleRetryShell = useCallback(() => {
    workspaceShellLazy.reset();
  }, []);

  const handleRetryChild = useCallback(() => {
    const key = resolveWorkspacePreloadKey(pathname);
    if (key !== 'welcome' && key !== 'shell') {
      WORKSPACE_CHILD_LAZY_RESETTERS[key]();
    }
  }, [pathname]);

  if (!session || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RouteChunkErrorBoundary
      language={language}
      resetKey="workspace-shell"
      variant="fullscreen"
      onRetry={handleRetryShell}
    >
      <Suspense fallback={<EditorialEntryLoadingFallback language={language} />}>
        <WorkspaceShell>
          <RouteChunkErrorBoundary
            language={language}
            resetKey={pathname}
            variant="shell-content"
            onRetry={handleRetryChild}
          >
            <Suspense
              key={pathname}
              fallback={<WorkspaceContentLoadingState language={language} />}
            >
              <Outlet />
            </Suspense>
          </RouteChunkErrorBoundary>
        </WorkspaceShell>
      </Suspense>
    </RouteChunkErrorBoundary>
  );
}

export function AppRoutes() {
  const { language } = useWorkspaceSession();
  const { pathname } = useLocation();

  const handleRetryWelcome = useCallback(() => {
    welcomeLazy.reset();
  }, []);

  return (
    <>
      <ScrollResetOnRouteChange />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/welcome"
          element={
            <RouteChunkErrorBoundary
              language={language}
              resetKey={pathname}
              variant="fullscreen"
              onRetry={handleRetryWelcome}
            >
              <Suspense
                fallback={<EditorialEntryLoadingFallback language={language} />}
              >
                <WelcomePage />
              </Suspense>
            </RouteChunkErrorBoundary>
          }
        />

        {/* Authenticated Workspace framed cleanly by persistent WorkspaceShell */}
        <Route path="/workspace" element={<WorkspaceShellLayout />}>
          <Route index element={<StudioDeskPage />} />
          <Route path="settings" element={<WorkspaceSettingsPage />} />
          <Route path="projects" element={<ProjectLibraryCatalogPage />} />
          <Route path="projects/new" element={<ProjectCreateEnginePage />} />
          <Route path="projects/:id" element={<ProjectDossierShellPage />} />
          <Route path="projects/:id/model" element={<ProjectModelEnginePage />} />
          <Route path="projects/*" element={<PlannedModuleView />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="library" element={<TechnicalLibraryPage />} />
          <Route path="publications" element={<PlannedModuleView />} />
          <Route path="activity" element={<PlannedModuleView />} />
          <Route path="reports" element={<PlannedModuleView />} />
          <Route path="*" element={<PlannedModuleView />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </BrowserRouter>
  );
}

export default App;
