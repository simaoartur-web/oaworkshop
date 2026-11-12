import { Suspense, useEffect, type ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { LoginPage } from '../features/auth-demo/LoginPage';
import { ProjectCreateEnginePage } from '../features/project-library/ProjectCreateEnginePage';
import { ProjectDossierShellPage } from '../features/project-library/ProjectDossierShellPage';
import { ProjectLibraryCatalogPage } from '../features/project-library/ProjectLibraryCatalogPage';
import { StudioDeskPage } from '../features/studio-desk/StudioDeskPage';
import { PlannedModuleView } from '../features/workspace/PlannedModuleView';
import { WorkspaceSettingsPage } from '../features/workspace/WorkspaceSettingsPage';
import { WorkspaceShell } from '../features/workspace-shell/WorkspaceShell';
import { WelcomePage } from '../features/welcome/WelcomePage';
import {
  WorkspaceSessionProvider,
  useWorkspaceSession,
} from './WorkspaceSessionContext';

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

function RequireDemoSession({ children }: { children: ReactNode }) {
  const { session, currentUser } = useWorkspaceSession();
  if (!session || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <>
      <ScrollResetOnRouteChange />
      <Suspense
        fallback={
          <div className="min-h-dvh w-full bg-[#050505] flex items-center justify-center text-xs uppercase tracking-[0.24em] text-[#BDBDBD]">
            O+A Workspace
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />

          {/* Authenticated Workspace framed by WorkspaceShell with integrated StudioDeskPage */}
          <Route
            path="/workspace"
            element={
              <RequireDemoSession>
                <WorkspaceShell />
              </RequireDemoSession>
            }
          >
            <Route index element={<StudioDeskPage />} />
            <Route path="settings" element={<WorkspaceSettingsPage />} />
            <Route path="projects" element={<ProjectLibraryCatalogPage />} />
            <Route path="projects/new" element={<ProjectCreateEnginePage />} />
            <Route path="projects/:id" element={<ProjectDossierShellPage />} />
            <Route path="projects/:id/model" element={<PlannedModuleView />} />
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
      </Suspense>
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
