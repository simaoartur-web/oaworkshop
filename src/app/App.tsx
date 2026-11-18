import {
  lazy,
  Suspense,
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
  WorkspaceContentLoadingState,
} from '../features/loading/RouteLoadingStates';
import {
  WorkspaceSessionProvider,
  useWorkspaceSession,
} from './WorkspaceSessionContext';

function lazyNamed<
  T extends ComponentType<Record<string, never>>,
  M extends Record<string, unknown>,
>(importer: () => Promise<M>, exportName: keyof M) {
  return lazy(async () => {
    const mod = await importer();
    return { default: mod[exportName] as T };
  });
}

const loadWelcomePage = () => import('../features/welcome/WelcomePage');
const loadWorkspaceShell = () =>
  import('../features/workspace-shell/WorkspaceShell');
const loadStudioDeskPage = () =>
  import('../features/studio-desk/StudioDeskPage');
const loadProjectLibraryCatalogPage = () =>
  import('../features/project-library/ProjectLibraryCatalogPage');
const loadProjectCreateEnginePage = () =>
  import('../features/project-library/ProjectCreateEnginePage');
const loadProjectDossierShellPage = () =>
  import('../features/project-library/ProjectDossierShellPage');
const loadProjectModelEnginePage = () =>
  import('../features/model-engine/ProjectModelEnginePage');
const loadWorkspaceSettingsPage = () =>
  import('../features/workspace/WorkspaceSettingsPage');
const loadPlannedModuleView = () =>
  import('../features/workspace/PlannedModuleView');

const WelcomePage = lazyNamed(loadWelcomePage, 'WelcomePage');
const WorkspaceShell = lazy(async () => {
  const mod = await loadWorkspaceShell();
  return { default: mod.WorkspaceShell };
});
const StudioDeskPage = lazyNamed(loadStudioDeskPage, 'StudioDeskPage');
const ProjectLibraryCatalogPage = lazyNamed(
  loadProjectLibraryCatalogPage,
  'ProjectLibraryCatalogPage',
);
const ProjectCreateEnginePage = lazyNamed(
  loadProjectCreateEnginePage,
  'ProjectCreateEnginePage',
);
const ProjectDossierShellPage = lazyNamed(
  loadProjectDossierShellPage,
  'ProjectDossierShellPage',
);
const ProjectModelEnginePage = lazy(loadProjectModelEnginePage);
const WorkspaceSettingsPage = lazyNamed(
  loadWorkspaceSettingsPage,
  'WorkspaceSettingsPage',
);
const PlannedModuleView = lazyNamed(
  loadPlannedModuleView,
  'PlannedModuleView',
);

const preloadedWorkspaceRoutes = new Set<string>();

function preloadMatchedWorkspaceChild(pathname: string): void {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  let key = 'planned';
  let loader: () => Promise<unknown> = loadPlannedModuleView;

  if (normalized === '/workspace') {
    key = 'desk';
    loader = loadStudioDeskPage;
  } else if (normalized === '/workspace/settings') {
    key = 'settings';
    loader = loadWorkspaceSettingsPage;
  } else if (normalized === '/workspace/projects') {
    key = 'projects';
    loader = loadProjectLibraryCatalogPage;
  } else if (normalized === '/workspace/projects/new') {
    key = 'projects-new';
    loader = loadProjectCreateEnginePage;
  } else if (/^\/workspace\/projects\/[^/]+\/model$/.test(normalized)) {
    key = 'project-model';
    loader = loadProjectModelEnginePage;
  } else if (/^\/workspace\/projects\/[^/]+$/.test(normalized)) {
    key = 'project-dossier';
    loader = loadProjectDossierShellPage;
  }

  if (preloadedWorkspaceRoutes.has(key)) {
    return;
  }
  preloadedWorkspaceRoutes.add(key);
  void loader();
}

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
      preloadMatchedWorkspaceChild(pathname);
    }
  }, [pathname, session, currentUser]);

  if (!session || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<EditorialEntryLoadingFallback language={language} />}>
      <WorkspaceShell>
        <Suspense fallback={<WorkspaceContentLoadingState language={language} />}>
          <Outlet />
        </Suspense>
      </WorkspaceShell>
    </Suspense>
  );
}

export function AppRoutes() {
  const { language } = useWorkspaceSession();

  return (
    <>
      <ScrollResetOnRouteChange />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/welcome"
          element={
            <Suspense
              fallback={<EditorialEntryLoadingFallback language={language} />}
            >
              <WelcomePage />
            </Suspense>
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
          <Route path="tasks" element={<PlannedModuleView />} />
          <Route path="calendar" element={<PlannedModuleView />} />
          <Route path="departments" element={<PlannedModuleView />} />
          <Route path="team" element={<PlannedModuleView />} />
          <Route path="library" element={<PlannedModuleView />} />
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
