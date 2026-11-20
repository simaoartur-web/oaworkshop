import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEMO_USERS, findDemoUserById } from '../data/fixtures';
import {
  authenticateDemoCredentials,
  clearDemoSession,
  loadDemoSession,
  loadUserPreferences,
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
  saveUserPreferences,
  switchDemoRole,
  type AuthAttemptResult,
} from '../data/sessionRepository';
import type {
  AppLanguage,
  DemoSession,
  DemoUser,
  Role,
  UserPreferences,
} from '../data/types';
import { DICTIONARIES, type TranslationDictionary } from '../locales';

// Keep entry bundle decoupled from heavy workspace repositories (`modelAssetRepository`,
// `projectLibraryRepository`, `studioDeskFixtures`, `shellDemoState`) on `/login` & `/welcome`.
const AUXILIARY_DEMO_STORAGE_KEYS = [
  'oa_workspace_demo_notifications_v1',
  'oa_workspace_shell_rail_v1',
  'oa_workspace_studio_desk_v1',
  'oa_workspace_project_library_v1',
  'oa_workspace_tasks_v1',
] as const;

const PROJECT_LIBRARY_UPDATED_EVENT_NAME = 'oa:project-library-updated';
const TASKS_UPDATED_EVENT_NAME = 'oa:tasks-updated';

interface WorkspaceSessionContextValue {
  session: DemoSession | null;
  currentUser: DemoUser | null;
  preferences: UserPreferences;
  language: AppLanguage;
  t: TranslationDictionary;
  demoResetEpoch: number;
  signInWithCredentials: (email: string, password: string) => AuthAttemptResult;
  signInAsDemoUser: (user: DemoUser) => DemoSession;
  switchRole: (role: Role) => void;
  signOut: () => void;
  setLanguage: (language: AppLanguage) => void;
  setSkipWelcomeOnLogin: (skip: boolean) => void;
  setReduceMotionOverride: (mode: 'system' | 'reduce') => void;
  resetAllDemoData: () => void;
}

const WorkspaceSessionContext =
  createContext<WorkspaceSessionContextValue | null>(null);

export function WorkspaceSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<DemoSession | null>(() =>
    loadDemoSession(),
  );
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadUserPreferences(),
  );
  const [demoResetEpoch, setDemoResetEpoch] = useState(0);

  const currentUser = useMemo<DemoUser | null>(() => {
    if (!session) {
      return null;
    }
    return findDemoUserById(session.userId) ?? DEMO_USERS[0];
  }, [session]);

  const language = preferences.language;
  const t = DICTIONARIES[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion =
      preferences.reduceMotionOverride;
  }, [preferences.reduceMotionOverride]);

  const signInWithCredentials = useCallback(
    (email: string, password: string): AuthAttemptResult => {
      const result = authenticateDemoCredentials(email, password);
      if (result.ok) {
        setSession(result.session);
      }
      return result;
    },
    [],
  );

  const signInAsDemoUser = useCallback((user: DemoUser): DemoSession => {
    const nextSession = persistDemoSessionForUser(user);
    setSession(nextSession);
    return nextSession;
  }, []);

  const switchRole = useCallback((role: Role) => {
    const { session: nextSession } = switchDemoRole(role);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    clearDemoSession();
    setSession(null);
    void import('../data/modelAssetRepository')
      .then(({ clearAllSessionModels }) => {
        clearAllSessionModels();
      })
      .catch(() => {
        // Ignore dynamic import failures when model repository chunk is unavailable offline
      });
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    const updated = saveUserPreferences({ language: nextLanguage });
    setPreferences(updated);
  }, []);

  const setSkipWelcomeOnLogin = useCallback((skip: boolean) => {
    const updated = saveUserPreferences({ skipWelcomeOnLogin: skip });
    setPreferences(updated);
  }, []);

  const setReduceMotionOverride = useCallback((mode: 'system' | 'reduce') => {
    const updated = saveUserPreferences({ reduceMotionOverride: mode });
    setPreferences(updated);
  }, []);

  const resetAllDemoData = useCallback(() => {
    const freshPrefs = resetDemoWorkspaceState();
    if (typeof window !== 'undefined') {
      try {
        for (const key of AUXILIARY_DEMO_STORAGE_KEYS) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Ignore storage removal errors in restricted browsing modes
      }
      // Synchronously invalidates loaded project library, tasks & search caches, and triggers
      // modelAssetRepository's reset listener to revoke/clear all temporary session ObjectURLs.
      window.dispatchEvent(new CustomEvent(PROJECT_LIBRARY_UPDATED_EVENT_NAME));
      window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT_NAME));
    }
    setSession(null);
    setPreferences(freshPrefs);
    setDemoResetEpoch((prev) => prev + 1);
  }, []);

  const value = useMemo<WorkspaceSessionContextValue>(
    () => ({
      session,
      currentUser,
      preferences,
      language,
      t,
      demoResetEpoch,
      signInWithCredentials,
      signInAsDemoUser,
      switchRole,
      signOut,
      setLanguage,
      setSkipWelcomeOnLogin,
      setReduceMotionOverride,
      resetAllDemoData,
    }),
    [
      session,
      currentUser,
      preferences,
      language,
      t,
      demoResetEpoch,
      signInWithCredentials,
      signInAsDemoUser,
      switchRole,
      signOut,
      setLanguage,
      setSkipWelcomeOnLogin,
      setReduceMotionOverride,
      resetAllDemoData,
    ],
  );

  return (
    <WorkspaceSessionContext.Provider value={value}>
      {children}
    </WorkspaceSessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspaceSession(): WorkspaceSessionContextValue {
  const ctx = useContext(WorkspaceSessionContext);
  if (!ctx) {
    throw new Error(
      'useWorkspaceSession must be used inside WorkspaceSessionProvider',
    );
  }
  return ctx;
}
