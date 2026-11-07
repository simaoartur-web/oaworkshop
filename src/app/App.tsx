import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { WorkspaceSessionProvider, useWorkspaceSession } from './WorkspaceSessionContext';
import { LoginPage } from '../features/auth-demo/LoginPage';

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
          <Route path="/workspace/*" element={<WorkspaceEntryGatePage />} />
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
