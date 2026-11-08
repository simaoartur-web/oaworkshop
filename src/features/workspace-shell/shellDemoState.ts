import type { LocalizedText } from '../../data/types';

export const SHELL_STORAGE_KEYS = {
  NOTIFICATIONS: 'oa_workspace_demo_notifications_v1',
  RAIL_COMPACT: 'oa_workspace_shell_rail_v1',
} as const;

export interface DemoNotificationItem {
  id: string;
  code: string;
  category: LocalizedText;
  title: LocalizedText;
  detail: LocalizedText;
  studioTag: string;
  timestampLabel: LocalizedText;
  targetPath: string;
  read: boolean;
}

export const INITIAL_DEMO_NOTIFICATIONS: DemoNotificationItem[] = [
  {
    id: 'notif-01',
    code: 'REV · 01',
    category: { pt: 'Revisão de Corte', en: 'Section Review' },
    title: {
      pt: 'Pavilhão Cívico da Baía (OA-26-014)',
      en: 'Bay Civic Pavilion (OA-26-014)',
    },
    detail: {
      pt: 'Cota da galeria nascente marcada para leitura conjunta no Studio Desk.',
      en: 'East gallery datum flagged for joint reading at the Studio Desk.',
    },
    studioTag: 'Maputo · Demo',
    timestampLabel: { pt: 'Hoje · 09:40 CAT', en: 'Today · 09:40 CAT' },
    targetPath: '/workspace/projects',
    read: false,
  },
  {
    id: 'notif-02',
    code: 'MOD · 02',
    category: { pt: 'Maquete & GLB', en: 'Maquette & GLB' },
    title: {
      pt: 'Exportação v04 da cobertura laminada',
      en: 'Laminated timber roof export v04',
    },
    detail: {
      pt: 'Verificação preliminar de polígonos agendada para integração na Fase 04.',
      en: 'Preliminary mesh check queued for Phase 04 Web 3D integration.',
    },
    studioTag: 'Milão · Demo',
    timestampLabel: { pt: 'Hoje · 08:15 CEST', en: 'Today · 08:15 CEST' },
    targetPath: '/workspace/projects',
    read: false,
  },
  {
    id: 'notif-03',
    code: 'PUB · 03',
    category: { pt: 'Fila Editorial', en: 'Editorial Queue' },
    title: {
      pt: '2 cadernos mantidos em estado privado',
      en: '2 monographs held in private status',
    },
    detail: {
      pt: 'Paridade bilingue PT/EN preparada antes de revisão pela Direcção.',
      en: 'PT/EN bilingual copy staged ahead of Direction editorial critique.',
    },
    studioTag: 'Comunicação · Demo',
    timestampLabel: { pt: 'Ontem · 17:30', en: 'Yesterday · 17:30' },
    targetPath: '/workspace/publications',
    read: false,
  },
  {
    id: 'notif-04',
    code: 'MAT · 04',
    category: { pt: 'Investigação', en: 'Applied Research' },
    title: {
      pt: 'Ficha de blocos de terra comprimida registada',
      en: 'Compressed earth block thermal record logged',
    },
    detail: {
      pt: 'Referência de amostra catalogada para consulta departamental em Fase 05.',
      en: 'Sample reference indexed for department library consultation in Phase 05.',
    },
    studioTag: 'Investigação · Demo',
    timestampLabel: { pt: 'Há 2 dias', en: '2 days ago' },
    targetPath: '/workspace/library',
    read: true,
  },
  {
    id: 'notif-05',
    code: 'SYS · 05',
    category: { pt: 'Sessão Local', en: 'Local Session' },
    title: {
      pt: 'Modo demonstrativo sem servidor activo',
      en: 'Serverless local demo mode active',
    },
    detail: {
      pt: 'Preferências guardadas exclusivamente em localStorage sem palavras-passe.',
      en: 'Preferences stored strictly in localStorage with zero stored passwords.',
    },
    studioTag: 'Shell · Fase 02A',
    timestampLabel: { pt: 'Sessão actual', en: 'Current session' },
    targetPath: '/workspace/settings',
    read: true,
  },
];

export function cloneInitialNotifications(): DemoNotificationItem[] {
  return INITIAL_DEMO_NOTIFICATIONS.map((item) => ({ ...item }));
}

export function loadDemoNotifications(): DemoNotificationItem[] {
  try {
    const raw = window.localStorage.getItem(SHELL_STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      return cloneInitialNotifications();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return cloneInitialNotifications();
    }
    const readMap = new Map<string, boolean>();
    for (const entry of parsed) {
      if (
        entry &&
        typeof entry === 'object' &&
        'id' in entry &&
        'read' in entry &&
        typeof entry.id === 'string' &&
        typeof entry.read === 'boolean'
      ) {
        readMap.set(entry.id, entry.read);
      }
    }
    return INITIAL_DEMO_NOTIFICATIONS.map((seed) => ({
      ...seed,
      read: readMap.get(seed.id) ?? seed.read,
    }));
  } catch {
    return cloneInitialNotifications();
  }
}

export function saveDemoNotifications(items: DemoNotificationItem[]): void {
  try {
    const minimalState = items.map((item) => ({ id: item.id, read: item.read }));
    window.localStorage.setItem(
      SHELL_STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(minimalState),
    );
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function markDemoNotificationRead(
  items: DemoNotificationItem[],
  id: string,
): DemoNotificationItem[] {
  const next = items.map((item) =>
    item.id === id ? { ...item, read: true } : item,
  );
  saveDemoNotifications(next);
  return next;
}

export function markAllDemoNotificationsRead(
  items: DemoNotificationItem[],
): DemoNotificationItem[] {
  const next = items.map((item) => ({ ...item, read: true }));
  saveDemoNotifications(next);
  return next;
}

export function loadRailCompactPreference(): boolean {
  try {
    return window.localStorage.getItem(SHELL_STORAGE_KEYS.RAIL_COMPACT) === 'compact';
  } catch {
    return false;
  }
}

export function saveRailCompactPreference(compact: boolean): void {
  try {
    window.localStorage.setItem(
      SHELL_STORAGE_KEYS.RAIL_COMPACT,
      compact ? 'compact' : 'expanded',
    );
  } catch {
    // Ignore storage errors
  }
}

export function resetShellLocalState(): void {
  try {
    window.localStorage.removeItem(SHELL_STORAGE_KEYS.NOTIFICATIONS);
    window.localStorage.removeItem(SHELL_STORAGE_KEYS.RAIL_COMPACT);
  } catch {
    // Ignore storage cleanup errors
  }
}
