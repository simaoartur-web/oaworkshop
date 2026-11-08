import { DEMO_USERS, findDemoUserByEmail, findDemoUserById } from './fixtures';
import type { AppLanguage, DemoSession, DemoUser, Role, UserPreferences } from './types';

export const STORAGE_KEYS = {
  SESSION: 'oa_workspace_demo_session_v1',
  PREFERENCES: 'oa_workspace_user_prefs_v1',
} as const;

const VALID_ROLES: ReadonlySet<Role> = new Set([
  'director',
  'project_manager',
  'architect',
  'department_lead',
  'communications',
  'staff',
]);

export function getDefaultPreferences(): UserPreferences {
  return {
    language: 'pt',
    skipWelcomeOnLogin: false,
    reduceMotionOverride: 'system',
    updatedAt: new Date().toISOString(),
  };
}

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) {
      return getDefaultPreferences();
    }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const language: AppLanguage = parsed.language === 'en' ? 'en' : 'pt';
    const skipWelcomeOnLogin = Boolean(parsed.skipWelcomeOnLogin);
    const reduceMotionOverride =
      parsed.reduceMotionOverride === 'reduce' ? 'reduce' : 'system';

    return {
      language,
      skipWelcomeOnLogin,
      reduceMotionOverride,
      updatedAt:
        typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return getDefaultPreferences();
  }
}

export function saveUserPreferences(
  patch: Partial<Omit<UserPreferences, 'updatedAt'>>,
): UserPreferences {
  const current = loadUserPreferences();
  const next: UserPreferences = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }
  return next;
}

export function loadDemoSession(): DemoSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<DemoSession> & Record<string, unknown>;
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.role !== 'string' ||
      !VALID_ROLES.has(parsed.role as Role) ||
      parsed.mode !== 'local-demo'
    ) {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
    const user = findDemoUserById(parsed.userId);
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
    // Enforce zero-password invariant even if external storage was tampered with
    const sanitized: DemoSession = {
      userId: user.id,
      role: user.role,
      authenticatedAt:
        typeof parsed.authenticatedAt === 'string'
          ? parsed.authenticatedAt
          : new Date().toISOString(),
      mode: 'local-demo',
    };
    return sanitized;
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {
      // Ignore storage cleanup error
    }
    return null;
  }
}

export type AuthAttemptResult =
  | { ok: true; session: DemoSession; user: DemoUser }
  | {
      ok: false;
      fieldErrors: {
        email?: 'required' | 'invalidFormat' | 'unknownDemoAccount';
        password?: 'required' | 'invalidDemoKey';
      };
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function authenticateDemoCredentials(
  emailInput: string,
  passwordInput: string,
): AuthAttemptResult {
  const trimmedEmail = emailInput.trim();
  const fieldErrors: {
    email?: 'required' | 'invalidFormat' | 'unknownDemoAccount';
    password?: 'required' | 'invalidDemoKey';
  } = {};

  if (!trimmedEmail) {
    fieldErrors.email = 'required';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    fieldErrors.email = 'invalidFormat';
  }

  if (!passwordInput.trim()) {
    fieldErrors.password = 'required';
  }

  if (fieldErrors.email || fieldErrors.password) {
    return { ok: false, fieldErrors };
  }

  const matchedUser = findDemoUserByEmail(trimmedEmail);
  if (!matchedUser) {
    return {
      ok: false,
      fieldErrors: { email: 'unknownDemoAccount' },
    };
  }

  if (passwordInput.trim() !== matchedUser.demoAccessKey) {
    return {
      ok: false,
      fieldErrors: { password: 'invalidDemoKey' },
    };
  }

  const session = persistDemoSessionForUser(matchedUser);
  return { ok: true, session, user: matchedUser };
}

export function persistDemoSessionForUser(user: DemoUser): DemoSession {
  const session: DemoSession = {
    userId: user.id,
    role: user.role,
    authenticatedAt: new Date().toISOString(),
    mode: 'local-demo',
  };
  try {
    // Strictly persist ONLY non-sensitive demo session identifiers; never store passwords.
    window.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch {
    // Fallback to in-memory caller state if storage is blocked
  }
  return session;
}

export function switchDemoRole(role: Role): { session: DemoSession; user: DemoUser } {
  const targetUser = DEMO_USERS.find((item) => item.role === role) ?? DEMO_USERS[0];
  const session = persistDemoSessionForUser(targetUser);
  return { session, user: targetUser };
}

export function clearDemoSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch {
    // Ignore storage removal errors
  }
}

export function resetDemoWorkspaceState(): UserPreferences {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.SESSION);
    window.localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  } catch {
    // Ignore storage removal errors
  }
  const freshPrefs = getDefaultPreferences();
  try {
    window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(freshPrefs));
  } catch {
    // Ignore
  }
  return freshPrefs;
}
