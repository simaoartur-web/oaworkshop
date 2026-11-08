import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { LoginPage } from '../features/auth-demo/LoginPage';
import { WorkspaceShell } from '../features/workspace-shell/WorkspaceShell';
import {
  WorkspaceSessionProvider,
  useWorkspaceSession,
} from './WorkspaceSessionContext';

const WelcomePage = lazy(() =>
  import('../features/welcome/WelcomePage').then((mod) => ({
    default: mod.WelcomePage,
  })),
);

const WorkspaceEntryGatePage = lazy(() =>
  import('../features/workspace/WorkspaceEntryGatePage').then((mod) => ({
    default: mod.WorkspaceEntryGatePage,
  })),
);

const WorkspaceSettingsPage = lazy(() =>
  import('../features/workspace/WorkspaceSettingsPage').then((mod) => ({
    default: mod.WorkspaceSettingsPage,
  })),
);

const PlannedModuleView = lazy(() =>
  import('../features/workspace/PlannedModuleView').then((mod) => ({
    default: mod.PlannedModuleView,
  })),
);

function ScrollResetOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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

          {/* Authenticated Workspace framed by WorkspaceShell (Argon A) */}
          <Route
            path="/workspace"
            element={
              <RequireDemoSession>
                <WorkspaceShell />
              </RequireDemoSession>
            }
          >
            {/* Integration slot: replace WorkspaceEntryGatePage with StudioDeskPage on integration */}
            <Route index element={<WorkspaceEntryGatePage />} />
            <Route path="settings" element={<WorkspaceSettingsPage />} />
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
