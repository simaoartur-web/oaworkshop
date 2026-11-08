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
  isFutureModuleDemo: boolean;
  read: boolean;
}

export const INITIAL_DEMO_NOTIFICATIONS: DemoNotificationItem[] = [
  {
    id: 'notif-01',
    code: 'REV · 01',
    category: { pt: 'Revisão de Corte', en: 'Section Review' },
    title: {
      pt: 'Galeria Cívica & Pátio da Ponta Vermelha (OA-26-101 · DEMO)',
      en: 'Ponta Vermelha Civic Gallery & Courtyard (OA-26-101 · DEMO)',
    },
    detail: {
      pt: 'Corte longitudinal AA (PR-101-AA · v04) sinalizado para leitura conjunta no Studio Desk.',
      en: 'Longitudinal section AA (PR-101-AA · v04) flagged for joint critique at the Studio Desk.',
    },
    studioTag: 'Maputo · Studio Desk',
    timestampLabel: { pt: 'Hoje · 09:40 CAT', en: 'Today · 09:40 CAT' },
    targetPath: '/workspace?project=sd-proj-oa-26-101',
    isFutureModuleDemo: false,
    read: false,
  },
  {
    id: 'notif-02',
    code: 'MRC · 03',
    category: { pt: 'Coordenação & Fases', en: 'Schedule & Phases' },
    title: {
      pt: 'Corredor Pedonal & Terrários da Costa (OA-26-108 · DEMO)',
      en: 'Coastal Pedestrian Promenade & Terraces (OA-26-108 · DEMO)',
    },
    detail: {
      pt: 'Matriz de dependências hidráulicas referenciada para o futuro arquivo Projectos (Fases 03–04).',
      en: 'Hydraulic dependency matrix cross-referenced for the upcoming Projects archive (Phases 03–04).',
    },
    studioTag: 'Urbanismo · Fases 03–04 (Demo)',
    timestampLabel: { pt: 'Hoje · 08:50 CAT', en: 'Today · 08:50 CAT' },
    targetPath: '/workspace/projects',
    isFutureModuleDemo: true,
    read: false,
  },
  {
    id: 'notif-03',
    code: 'PUB · 03',
    category: { pt: 'Fila Editorial', en: 'Editorial Queue' },
    title: {
      pt: 'Arquivo de Matéria & Inércia Climática (OA-26-112 · DEMO)',
      en: 'Materiality & Thermal Inertia Archive (OA-26-112 · DEMO)',
    },
    detail: {
      pt: 'Pedido bilingue PT/EN mantido privado até activação da fila editorial (Fase 06).',
      en: 'Bilingual PT/EN request held private until editorial queue activation (Phase 06).',
    },
    studioTag: 'Milão · Fase 06 (Demo)',
    timestampLabel: { pt: 'Ontem · 17:30', en: 'Yesterday · 17:30' },
    targetPath: '/workspace/publications',
    isFutureModuleDemo: true,
    read: false,
  },
  {
    id: 'notif-04',
    code: 'MAT · 04',
    category: { pt: 'Biblioteca Técnica', en: 'Technical Library' },
    title: {
      pt: 'Oficina de Leitura em Terra Compactada (OA-26-119 · DEMO)',
      en: 'Rammed-Earth Reading Workshop (OA-26-119 · DEMO)',
    },
    detail: {
      pt: 'Caderno de implantação e ventilação cruzada catalogado para consulta na Fase 05.',
      en: 'Site orientation and cross-ventilation brief indexed for Phase 05 library consultation.',
    },
    studioTag: 'Maputo · Fase 05 (Demo)',
    timestampLabel: { pt: 'Há 2 dias', en: '2 days ago' },
    targetPath: '/workspace/library',
    isFutureModuleDemo: true,
    read: true,
  },
  {
    id: 'notif-05',
    code: 'SYS · 05',
    category: { pt: 'Sessão Local', en: 'Local Session' },
    title: {
      pt: 'Modo demonstrativo local sem servidor',
      en: 'Serverless local demo mode active',
    },
    detail: {
      pt: 'Sessão, preferências, notificações e Studio Desk guardados exclusivamente neste navegador.',
      en: 'Session, preferences, notifications, and Studio Desk stored locally in this browser only.',
    },
    studioTag: 'Shell · Fase 02',
    timestampLabel: { pt: 'Sessão actual', en: 'Current session' },
    targetPath: '/workspace/settings',
    isFutureModuleDemo: false,
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
