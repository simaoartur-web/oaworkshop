import { DEPARTMENTS, findDemoUserById } from './fixtures';
import type {
  CanonicalTaskRecord,
  CreateTaskInput,
  TasksRepositorySnapshot,
  TaskStatusTransition,
  UpdateTaskInput,
} from './operationsTypes';
import {
  formatMilestoneDateLabel,
  getProjectById,
  isValidIsoCalendarDate,
  PROJECT_LIBRARY_UPDATED_EVENT,
} from './projectLibraryRepository';
import { STUDIO_DESK_TASKS } from './studioDeskFixtures';
import type {
  DeskPriorityLevel,
  DeskTaskStatus,
  StudioDeskTask,
} from './studioDeskTypes';
import type { DepartmentId, LocalizedText, Role } from './types';

export const TASKS_STORAGE_KEY = 'oa_workspace_tasks_v1';
export const TASKS_UPDATED_EVENT = 'oa:tasks-updated';

export const TASKS_LIMITS = {
  MAX_LOCAL_TASKS: 150,
  MAX_TITLE_LENGTH: 160,
  MAX_DETAIL_LENGTH: 2000,
  MAX_TAG_LENGTH: 80,
} as const;

interface StoredTasksEnvelope {
  version: 1;
  overridesById: Record<string, CanonicalTaskRecord>;
  createdTasks: CanonicalTaskRecord[];
}

const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

const VALID_ROLES = new Set<Role>([
  'director',
  'project_manager',
  'architect',
  'department_lead',
  'communications',
  'staff',
]);

const VALID_PRIORITIES = new Set<DeskPriorityLevel>(['high', 'medium', 'base']);

const VALID_TASK_STATUSES = new Set<DeskTaskStatus>([
  'pending',
  'in_progress',
  'completed',
]);

const SEED_TASK_CREATED_AT_ISO = '2026-11-01T09:00:00.000Z';
const SEED_TASK_UPDATED_AT_ISO = '2026-11-10T12:00:00.000Z';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return (
    isObjectRecord(value) &&
    typeof value.pt === 'string' &&
    value.pt.trim().length > 0 &&
    typeof value.en === 'string' &&
    value.en.trim().length > 0
  );
}

function sanitizeLocalizedText(
  value: LocalizedText,
  fallback: LocalizedText,
): LocalizedText {
  const pt = value.pt.trim() || fallback.pt;
  const en = value.en.trim() || pt;
  return { pt, en };
}

function assertTaskFieldWithinMaxLength(
  value: string,
  fieldLabel: string,
  maxLength: number,
): string {
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(
      `O campo "${fieldLabel}" excede o limite de ${maxLength} caracteres (${trimmed.length}).`,
    );
  }
  return trimmed;
}

function deepFreezeValue<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreezeValue(nested);
    }
  }
  return value;
}

function createImmutableLookupMap<K, V>(
  source: Map<K, V>,
): ReadonlyMap<K, V> {
  const readonlyView: ReadonlyMap<K, V> = {
    get size() {
      return source.size;
    },
    get(key: K) {
      return source.get(key);
    },
    has(key: K) {
      return source.has(key);
    },
    forEach(
      callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
      thisArg?: unknown,
    ) {
      source.forEach((value, key) => {
        callbackfn.call(thisArg, value, key, readonlyView);
      });
    },
    entries() {
      return source.entries();
    },
    keys() {
      return source.keys();
    },
    values() {
      return source.values();
    },
    [Symbol.iterator]() {
      return source[Symbol.iterator]();
    },
  };
  return Object.freeze(readonlyView);
}

let cachedSeedCanonicalTasks: CanonicalTaskRecord[] | null = null;

function studioDeskTaskToCanonical(task: StudioDeskTask): CanonicalTaskRecord {
  return {
    id: task.id,
    code: task.code,
    title: { ...task.title },
    detail: { ...task.detail },
    projectId: task.projectId,
    projectCode: task.projectCode,
    departmentId: task.departmentId,
    primaryRoles: [...task.primaryRoles],
    priority: task.priority,
    status: task.status,
    dueDateIso: task.dueDateIso,
    dueLabel: { ...task.dueLabel },
    assigneeUserId: task.assigneeUserId,
    assigneeLabel: task.assigneeLabel,
    referenceTag: { ...task.referenceTag },
    origin: 'seed-fixture',
    createdAt: SEED_TASK_CREATED_AT_ISO,
    updatedAt: SEED_TASK_UPDATED_AT_ISO,
    archived: false,
  };
}

function getSeedCanonicalTasks(): CanonicalTaskRecord[] {
  if (cachedSeedCanonicalTasks === null) {
    cachedSeedCanonicalTasks = STUDIO_DESK_TASKS.map(studioDeskTaskToCanonical);
  }
  return [...cachedSeedCanonicalTasks];
}

function validateStoredTaskRecord(raw: unknown): CanonicalTaskRecord | null {
  if (!isObjectRecord(raw)) {
    return null;
  }

  if (
    typeof raw.id !== 'string' ||
    raw.id.trim().length === 0 ||
    typeof raw.code !== 'string' ||
    raw.code.trim().length === 0 ||
    !isLocalizedText(raw.title) ||
    raw.title.pt.trim().length > TASKS_LIMITS.MAX_TITLE_LENGTH ||
    raw.title.en.trim().length > TASKS_LIMITS.MAX_TITLE_LENGTH ||
    !isLocalizedText(raw.detail) ||
    raw.detail.pt.trim().length > TASKS_LIMITS.MAX_DETAIL_LENGTH ||
    raw.detail.en.trim().length > TASKS_LIMITS.MAX_DETAIL_LENGTH ||
    typeof raw.projectId !== 'string' ||
    raw.projectId.trim().length === 0 ||
    typeof raw.projectCode !== 'string' ||
    raw.projectCode.trim().length === 0 ||
    typeof raw.departmentId !== 'string' ||
    !VALID_DEPARTMENTS.has(raw.departmentId as DepartmentId) ||
    !Array.isArray(raw.primaryRoles) ||
    typeof raw.priority !== 'string' ||
    !VALID_PRIORITIES.has(raw.priority as DeskPriorityLevel) ||
    typeof raw.status !== 'string' ||
    !VALID_TASK_STATUSES.has(raw.status as DeskTaskStatus) ||
    typeof raw.dueDateIso !== 'string' ||
    !isValidIsoCalendarDate(raw.dueDateIso) ||
    !isLocalizedText(raw.dueLabel) ||
    typeof raw.assigneeUserId !== 'string' ||
    raw.assigneeUserId.trim().length === 0 ||
    typeof raw.assigneeLabel !== 'string' ||
    raw.assigneeLabel.trim().length === 0 ||
    !isLocalizedText(raw.referenceTag) ||
    raw.referenceTag.pt.trim().length > TASKS_LIMITS.MAX_TAG_LENGTH ||
    raw.referenceTag.en.trim().length > TASKS_LIMITS.MAX_TAG_LENGTH ||
    (raw.origin !== 'seed-fixture' && raw.origin !== 'local-created') ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string'
  ) {
    return null;
  }

  const cleanRoles = raw.primaryRoles.filter(
    (role): role is Role =>
      typeof role === 'string' && VALID_ROLES.has(role as Role),
  );

  return {
    id: raw.id.trim(),
    code: raw.code.trim(),
    title: sanitizeLocalizedText(raw.title, raw.title),
    detail: sanitizeLocalizedText(raw.detail, raw.detail),
    projectId: raw.projectId.trim(),
    projectCode: raw.projectCode.trim(),
    departmentId: raw.departmentId as DepartmentId,
    primaryRoles: cleanRoles.length > 0 ? cleanRoles : ['architect'],
    priority: raw.priority as DeskPriorityLevel,
    status: raw.status as DeskTaskStatus,
    dueDateIso: raw.dueDateIso.trim(),
    dueLabel: sanitizeLocalizedText(raw.dueLabel, raw.dueLabel),
    assigneeUserId: raw.assigneeUserId.trim(),
    assigneeLabel: raw.assigneeLabel.trim(),
    referenceTag: sanitizeLocalizedText(raw.referenceTag, raw.referenceTag),
    origin: raw.origin,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    archived: Boolean(raw.archived),
  };
}

function emptyEnvelope(): StoredTasksEnvelope {
  return {
    version: 1,
    overridesById: {},
    createdTasks: [],
  };
}

let cachedSnapshot: (TasksRepositorySnapshot & { envelope: StoredTasksEnvelope }) | null =
  null;
let cacheVersionCounter = 0;
let isInternalEventEmit = false;
const taskSubscribers = new Set<() => void>();

function notifyTaskSubscribers(): void {
  for (const listener of Array.from(taskSubscribers)) {
    listener();
  }
}

function emitTasksUpdated(): void {
  notifyTaskSubscribers();
  if (typeof window === 'undefined') {
    return;
  }
  isInternalEventEmit = true;
  try {
    window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
  } finally {
    isInternalEventEmit = false;
  }
}

export function invalidateTasksCache(): void {
  cachedSnapshot = null;
  cacheVersionCounter += 1;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === null || event.key === TASKS_STORAGE_KEY) {
      invalidateTasksCache();
      notifyTaskSubscribers();
    }
  });
  window.addEventListener(TASKS_UPDATED_EVENT, () => {
    if (!isInternalEventEmit) {
      try {
        if (window.localStorage.getItem(TASKS_STORAGE_KEY) === null) {
          cachedSnapshot = buildTasksSnapshot(emptyEnvelope());
        } else {
          invalidateTasksCache();
        }
      } catch {
        invalidateTasksCache();
      }
      notifyTaskSubscribers();
    }
  });
  window.addEventListener(PROJECT_LIBRARY_UPDATED_EVENT, () => {
    try {
      if (window.localStorage.getItem(TASKS_STORAGE_KEY) === null) {
        cachedSnapshot = buildTasksSnapshot(emptyEnvelope());
        notifyTaskSubscribers();
      }
    } catch {
      // Ignore storage access errors in restricted browsing modes
    }
  });
}

function loadEnvelopeFromStorage(): StoredTasksEnvelope {
  if (typeof window === 'undefined') {
    return emptyEnvelope();
  }
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      return emptyEnvelope();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isObjectRecord(parsed) || parsed.version !== 1) {
      window.localStorage.removeItem(TASKS_STORAGE_KEY);
      return emptyEnvelope();
    }

    const overridesById: Record<string, CanonicalTaskRecord> = {};
    if (isObjectRecord(parsed.overridesById)) {
      for (const [id, entry] of Object.entries(parsed.overridesById)) {
        const validated = validateStoredTaskRecord(entry);
        if (validated && validated.id === id) {
          overridesById[id] = validated;
        }
      }
    }

    const seenIds = new Set<string>();
    const createdTasks: CanonicalTaskRecord[] = [];
    if (Array.isArray(parsed.createdTasks)) {
      for (const entry of parsed.createdTasks) {
        const validated = validateStoredTaskRecord(entry);
        if (
          validated &&
          validated.origin === 'local-created' &&
          !seenIds.has(validated.id)
        ) {
          seenIds.add(validated.id);
          createdTasks.push(validated);
        }
      }
    }

    return {
      version: 1,
      overridesById,
      createdTasks,
    };
  } catch {
    try {
      window.localStorage.removeItem(TASKS_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors in restricted browsing modes
    }
    return emptyEnvelope();
  }
}

function buildTasksSnapshot(
  envelope: StoredTasksEnvelope,
): TasksRepositorySnapshot & { envelope: StoredTasksEnvelope } {
  const seeds = getSeedCanonicalTasks();
  const resolvedSeeds = seeds.map(
    (seed) => envelope.overridesById[seed.id] ?? seed,
  );
  const allTasks = [...envelope.createdTasks, ...resolvedSeeds].map(
    deepFreezeValue,
  );
  const activeTasks = allTasks.filter((task) => !task.archived);

  const internalLookupMap = new Map<string, CanonicalTaskRecord>();
  const registerKey = (key: string, record: CanonicalTaskRecord) => {
    const normalized = key.trim().toLowerCase();
    if (normalized && !internalLookupMap.has(normalized)) {
      internalLookupMap.set(normalized, record);
    }
  };
  for (const task of allTasks) {
    registerKey(task.id, task);
    registerKey(task.code, task);
  }
  const lookupMap = createImmutableLookupMap(internalLookupMap);

  cacheVersionCounter += 1;

  return Object.freeze({
    version: cacheVersionCounter,
    envelope: deepFreezeValue<StoredTasksEnvelope>({
      version: 1,
      overridesById: { ...envelope.overridesById },
      createdTasks: [...envelope.createdTasks],
    }),
    allTasks: Object.freeze(allTasks),
    activeTasks: Object.freeze(activeTasks),
    lookupMap,
  });
}

function getInternalSnapshot(): TasksRepositorySnapshot & {
  envelope: StoredTasksEnvelope;
} {
  if (cachedSnapshot === null) {
    cachedSnapshot = buildTasksSnapshot(loadEnvelopeFromStorage());
  }
  return cachedSnapshot;
}

export function getTasksSnapshot(): TasksRepositorySnapshot {
  return getInternalSnapshot();
}

export function getTasksVersion(): number {
  return getInternalSnapshot().version;
}

export function listTasks(options?: {
  includeArchived?: boolean;
}): CanonicalTaskRecord[] {
  const includeArchived = options?.includeArchived ?? true;
  const snapshot = getInternalSnapshot();
  return includeArchived ? [...snapshot.allTasks] : [...snapshot.activeTasks];
}

export function getTaskById(
  idOrCode: string | undefined | null,
): CanonicalTaskRecord | null {
  const query = idOrCode?.trim().toLowerCase();
  if (!query) {
    return null;
  }
  return getInternalSnapshot().lookupMap.get(query) ?? null;
}

function saveEnvelope(envelope: StoredTasksEnvelope): void {
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(envelope);
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, serialized);
      const verified = window.localStorage.getItem(TASKS_STORAGE_KEY);
      if (verified === null) {
        throw new Error(
          'Não foi possível confirmar a gravação local das tarefas neste navegador.',
        );
      }
    } catch (error) {
      const isQuotaError =
        (error instanceof Error && error.name === 'QuotaExceededError') ||
        (typeof DOMException !== 'undefined' &&
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            error.code === 22 ||
            error.code === 1014));
      if (isQuotaError) {
        const quotaError = new Error(
          'Limite de armazenamento local do navegador atingido (QuotaExceededError). Arquive ou limpe dados locais antes de guardar novas tarefas.',
          { cause: error },
        );
        quotaError.name = 'QuotaExceededError';
        throw quotaError;
      }
      const detail =
        error instanceof Error && error.message ? ` (${error.message})` : '';
      throw new Error(
        `Falha ao guardar as tarefas no armazenamento local do navegador.${detail}`,
        { cause: error },
      );
    }
  }
  // Update the in-memory cache ONLY after persistence succeeds.
  cachedSnapshot = buildTasksSnapshot(envelope);
  emitTasksUpdated();
}

function persistMutatedTask(record: CanonicalTaskRecord): void {
  const envelope = getInternalSnapshot().envelope;
  const nextOverridesById = { ...envelope.overridesById };
  const nextCreatedTasks = [...envelope.createdTasks];

  if (record.origin === 'seed-fixture') {
    nextOverridesById[record.id] = record;
  } else {
    const existingIndex = nextCreatedTasks.findIndex(
      (item) => item.id === record.id,
    );
    if (existingIndex >= 0) {
      nextCreatedTasks[existingIndex] = record;
    } else {
      nextCreatedTasks.unshift(record);
    }
  }

  saveEnvelope({
    version: 1,
    overridesById: nextOverridesById,
    createdTasks: nextCreatedTasks,
  });
}

function generateNextTaskCode(
  departmentId: DepartmentId,
  existingTasks: readonly CanonicalTaskRecord[],
): string {
  const deptCode = DEPARTMENTS[departmentId].code;
  const used = new Set(existingTasks.map((t) => t.code.trim().toUpperCase()));
  let num = existingTasks.length + 1;
  while (used.has(`${deptCode} · ${String(num).padStart(2, '0')}`)) {
    num += 1;
  }
  return `${deptCode} · ${String(num).padStart(2, '0')}`;
}

export function createLocalTask(input: CreateTaskInput): CanonicalTaskRecord {
  const snapshot = getInternalSnapshot();
  if (snapshot.envelope.createdTasks.length >= TASKS_LIMITS.MAX_LOCAL_TASKS) {
    throw new Error(
      `Limite máximo de ${TASKS_LIMITS.MAX_LOCAL_TASKS} tarefas locais atingido nesta demonstração.`,
    );
  }

  const titlePt = assertTaskFieldWithinMaxLength(
    input.titlePt,
    'Título da tarefa (PT)',
    TASKS_LIMITS.MAX_TITLE_LENGTH,
  );
  const titleEn =
    assertTaskFieldWithinMaxLength(
      input.titleEn ?? '',
      'Título da tarefa (EN)',
      TASKS_LIMITS.MAX_TITLE_LENGTH,
    ) || titlePt;
  if (!titlePt) {
    throw new Error('O título da tarefa é obrigatório.');
  }

  const detailPt = assertTaskFieldWithinMaxLength(
    input.detailPt,
    'Detalhe da tarefa (PT)',
    TASKS_LIMITS.MAX_DETAIL_LENGTH,
  );
  const detailEn =
    assertTaskFieldWithinMaxLength(
      input.detailEn ?? '',
      'Detalhe da tarefa (EN)',
      TASKS_LIMITS.MAX_DETAIL_LENGTH,
    ) || detailPt;
  if (!detailPt) {
    throw new Error('A descrição da tarefa é obrigatória.');
  }

  const referenceTagPt =
    assertTaskFieldWithinMaxLength(
      input.referenceTagPt ?? '',
      'Etiqueta de referência (PT)',
      TASKS_LIMITS.MAX_TAG_LENGTH,
    ) || 'Operação de Atelier';
  const referenceTagEn =
    assertTaskFieldWithinMaxLength(
      input.referenceTagEn ?? '',
      'Etiqueta de referência (EN)',
      TASKS_LIMITS.MAX_TAG_LENGTH,
    ) || referenceTagPt;

  const project = getProjectById(input.projectId);
  if (!project) {
    throw new Error(
      `O projecto "${input.projectId}" não foi encontrado na Biblioteca de Projectos.`,
    );
  }

  const dueDateIso = input.dueDateIso.trim();
  if (!isValidIsoCalendarDate(dueDateIso)) {
    throw new Error(
      `A data limite ("${dueDateIso}") não é uma data de calendário válida (AAAA-MM-DD).`,
    );
  }

  const assignee = findDemoUserById(input.assigneeUserId);
  if (!assignee) {
    throw new Error(
      `O colaborador "${input.assigneeUserId}" não existe nos perfis demonstrativos.`,
    );
  }

  const departmentId =
    input.departmentId && VALID_DEPARTMENTS.has(input.departmentId)
      ? input.departmentId
      : project.classification.departmentId;

  const priority: DeskPriorityLevel = VALID_PRIORITIES.has(input.priority)
    ? input.priority
    : 'medium';

  const status: DeskTaskStatus =
    input.status && VALID_TASK_STATUSES.has(input.status)
      ? input.status
      : 'pending';

  const requestedRoles = (input.primaryRoles ?? []).filter((role) =>
    VALID_ROLES.has(role),
  );
  const primaryRoles = Array.from(new Set<Role>([assignee.role, ...requestedRoles]));

  const nowIso = new Date().toISOString();
  const timeStamp = Date.now().toString(36);
  const existingIds = new Set(snapshot.allTasks.map((t) => t.id));
  let id = `task-loc-${timeStamp}`;
  let suffix = 1;
  while (existingIds.has(id)) {
    suffix += 1;
    id = `task-loc-${timeStamp}-${suffix}`;
  }

  const code = generateNextTaskCode(departmentId, snapshot.allTasks);

  const record: CanonicalTaskRecord = {
    id,
    code,
    title: { pt: titlePt, en: titleEn },
    detail: { pt: detailPt, en: detailEn },
    projectId: project.identity.id,
    projectCode: project.identity.code,
    departmentId,
    primaryRoles,
    priority,
    status,
    dueDateIso,
    dueLabel: formatMilestoneDateLabel(dueDateIso),
    assigneeUserId: assignee.id,
    assigneeLabel: assignee.name.replace(' (Demo)', ''),
    referenceTag: { pt: referenceTagPt, en: referenceTagEn },
    origin: 'local-created',
    createdAt: nowIso,
    updatedAt: nowIso,
    archived: false,
  };

  persistMutatedTask(record);
  return record;
}

export function updateLocalTask(
  id: string,
  patch: UpdateTaskInput,
): CanonicalTaskRecord | null {
  const existing = getTaskById(id);
  if (!existing) {
    return null;
  }

  if (patch.title) {
    assertTaskFieldWithinMaxLength(
      patch.title.pt,
      'Título da tarefa (PT)',
      TASKS_LIMITS.MAX_TITLE_LENGTH,
    );
    assertTaskFieldWithinMaxLength(
      patch.title.en,
      'Título da tarefa (EN)',
      TASKS_LIMITS.MAX_TITLE_LENGTH,
    );
  }

  if (patch.detail) {
    assertTaskFieldWithinMaxLength(
      patch.detail.pt,
      'Detalhe da tarefa (PT)',
      TASKS_LIMITS.MAX_DETAIL_LENGTH,
    );
    assertTaskFieldWithinMaxLength(
      patch.detail.en,
      'Detalhe da tarefa (EN)',
      TASKS_LIMITS.MAX_DETAIL_LENGTH,
    );
  }

  if (patch.referenceTag) {
    assertTaskFieldWithinMaxLength(
      patch.referenceTag.pt,
      'Etiqueta de referência (PT)',
      TASKS_LIMITS.MAX_TAG_LENGTH,
    );
    assertTaskFieldWithinMaxLength(
      patch.referenceTag.en,
      'Etiqueta de referência (EN)',
      TASKS_LIMITS.MAX_TAG_LENGTH,
    );
  }

  let nextProjectId = existing.projectId;
  let nextProjectCode = existing.projectCode;
  if (patch.projectId !== undefined) {
    const targetProject = getProjectById(patch.projectId);
    if (!targetProject) {
      throw new Error(
        `O projecto "${patch.projectId}" não foi encontrado na Biblioteca de Projectos.`,
      );
    }
    nextProjectId = targetProject.identity.id;
    nextProjectCode = targetProject.identity.code;
  }

  let nextDueDateIso = existing.dueDateIso;
  let nextDueLabel = existing.dueLabel;
  if (patch.dueDateIso !== undefined) {
    const trimmedDate = patch.dueDateIso.trim();
    if (!isValidIsoCalendarDate(trimmedDate)) {
      throw new Error(
        `A data limite ("${trimmedDate}") não é uma data de calendário válida (AAAA-MM-DD).`,
      );
    }
    nextDueDateIso = trimmedDate;
    nextDueLabel = formatMilestoneDateLabel(trimmedDate);
  }

  let nextAssigneeUserId = existing.assigneeUserId;
  let nextAssigneeLabel = existing.assigneeLabel;
  if (patch.assigneeUserId !== undefined) {
    const nextAssignee = findDemoUserById(patch.assigneeUserId);
    if (!nextAssignee) {
      throw new Error(
        `O colaborador "${patch.assigneeUserId}" não existe nos perfis demonstrativos.`,
      );
    }
    nextAssigneeUserId = nextAssignee.id;
    nextAssigneeLabel = nextAssignee.name.replace(' (Demo)', '');
  }

  const nextDepartmentId =
    patch.departmentId && VALID_DEPARTMENTS.has(patch.departmentId)
      ? patch.departmentId
      : existing.departmentId;

  const nextPriority =
    patch.priority && VALID_PRIORITIES.has(patch.priority)
      ? patch.priority
      : existing.priority;

  const nextStatus =
    patch.status && VALID_TASK_STATUSES.has(patch.status)
      ? patch.status
      : existing.status;

  const nextRoles = patch.primaryRoles
    ? Array.from(
        new Set(patch.primaryRoles.filter((role) => VALID_ROLES.has(role))),
      )
    : [...existing.primaryRoles];

  const nowIso = new Date().toISOString();

  const updated: CanonicalTaskRecord = {
    ...existing,
    title: patch.title
      ? sanitizeLocalizedText(patch.title, existing.title)
      : existing.title,
    detail: patch.detail
      ? sanitizeLocalizedText(patch.detail, existing.detail)
      : existing.detail,
    projectId: nextProjectId,
    projectCode: nextProjectCode,
    departmentId: nextDepartmentId,
    primaryRoles: nextRoles.length > 0 ? nextRoles : existing.primaryRoles,
    priority: nextPriority,
    status: nextStatus,
    dueDateIso: nextDueDateIso,
    dueLabel: nextDueLabel,
    assigneeUserId: nextAssigneeUserId,
    assigneeLabel: nextAssigneeLabel,
    referenceTag: patch.referenceTag
      ? sanitizeLocalizedText(patch.referenceTag, existing.referenceTag)
      : existing.referenceTag,
    archived:
      patch.archived !== undefined ? Boolean(patch.archived) : existing.archived,
    updatedAt: nowIso,
  };

  persistMutatedTask(updated);
  return updated;
}

export function transitionTaskStatus(
  id: string,
  nextStatus: DeskTaskStatus,
): { task: CanonicalTaskRecord; transition: TaskStatusTransition } | null {
  if (!VALID_TASK_STATUSES.has(nextStatus)) {
    throw new Error(`Estado de tarefa inválido: "${String(nextStatus)}".`);
  }
  const existing = getTaskById(id);
  if (!existing) {
    return null;
  }
  const updated = updateLocalTask(existing.id, { status: nextStatus });
  if (!updated) {
    return null;
  }
  return {
    task: updated,
    transition: {
      taskId: updated.id,
      fromStatus: existing.status,
      toStatus: nextStatus,
      transitionedAt: updated.updatedAt,
    },
  };
}

export function resetTasksLocalState(): CanonicalTaskRecord[] {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(TASKS_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors
    }
  }
  cachedSnapshot = buildTasksSnapshot(emptyEnvelope());
  emitTasksUpdated();
  return [...cachedSnapshot.allTasks];
}

export function subscribeTasksChanges(listener: () => void): () => void {
  taskSubscribers.add(listener);
  return () => {
    taskSubscribers.delete(listener);
  };
}
