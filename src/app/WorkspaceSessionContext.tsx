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
import { resetShellLocalState } from '../features/workspace-shell/shellDemoState';
import { DICTIONARIES, type TranslationDictionary } from '../locales';

interface WorkspaceSessionContextValue {
  session: DemoSession | null;
  currentUser: DemoUser | null;
  preferences: UserPreferences;
  language: AppLanguage;
  t: TranslationDictionary;
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
    resetShellLocalState();
    setSession(null);
    setPreferences(freshPrefs);
  }, []);

  const value = useMemo<WorkspaceSessionContextValue>(
    () => ({
      session,
      currentUser,
      preferences,
      language,
      t,
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
