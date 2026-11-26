import { formatPublicationStatusLabel } from '../utils/editorialFormatting';
import { findDemoUserById } from './fixtures';
import type {
  PublicationActionResult,
  PublicationAuditEntry,
  PublicationsSnapshot,
} from './editorialReportsTypes';
import {
  assertWithinMaxLength,
  getProjectById,
  PROJECT_LIBRARY_UPDATED_EVENT,
  updateProjectPublicationStatus,
} from './projectLibraryRepository';
import type {
  DepartmentId,
  LocalizedText,
  PublicationStatus,
  Role,
} from './types';

export const PUBLICATIONS_STORAGE_KEY = 'oa_workspace_publications_v1';
export const PUBLICATIONS_UPDATED_EVENT = 'oa:publications-updated';

export const PUBLICATIONS_LIMITS = {
  MAX_LOCAL_PUBLICATION_EVENTS: 150,
  MAX_NOTE_LENGTH: 600,
} as const;

export const ALLOWED_PUBLICATION_TRANSITIONS: Readonly<
  Record<PublicationStatus, readonly PublicationStatus[]>
> = Object.freeze({
  private: Object.freeze<readonly PublicationStatus[]>(['requested']),
  requested: Object.freeze<readonly PublicationStatus[]>([
    'approved',
    'rejected',
    'private',
  ]),
  approved: Object.freeze<readonly PublicationStatus[]>([
    'published-demo',
    'unpublished',
    'private',
  ]),
  'published-demo': Object.freeze<readonly PublicationStatus[]>([
    'unpublished',
    'private',
  ]),
  rejected: Object.freeze<readonly PublicationStatus[]>(['requested', 'private']),
  unpublished: Object.freeze<readonly PublicationStatus[]>([
    'requested',
    'private',
  ]),
});

const VALID_PUBLICATION_STATUSES = new Set<PublicationStatus>([
  'private',
  'requested',
  'approved',
  'published-demo',
  'rejected',
  'unpublished',
]);

const VALID_ROLES = new Set<Role>([
  'director',
  'project_manager',
  'architect',
  'department_lead',
  'communications',
  'staff',
]);

export const SEED_PUBLICATION_AUDIT_ENTRIES: readonly PublicationAuditEntry[] =
  Object.freeze([
    Object.freeze({
      id: 'pub-seed-oa-26-112-req',
      projectId: 'sd-proj-oa-26-112',
      projectCode: 'OA-26-112',
      projectTitle: Object.freeze({
        pt: 'Arquivo de Matéria & Inércia Climática',
        en: 'Materiality & Thermal Inertia Archive',
      }),
      fromStatus: 'private',
      toStatus: 'requested',
      actorUserId: 'usr-com-05',
      actorName: 'Clara Ferraz (Demo)',
      actorRole: 'communications',
      departmentId: 'research',
      note: Object.freeze({
        pt: 'Pedido demonstrativo de curadoria bilingue PT/EN submetido para revisão da Direcção (apenas pré-visualização local).',
        en: 'Demonstrative bilingual PT/EN curation request submitted for Direction review (local preview only).',
      }),
      timestampIso: '2026-11-10T09:10:00.000Z',
      origin: 'seed-fixture',
    }),
  ]);

interface StoredPublicationsEnvelope {
  version: 1;
  createdEntries: PublicationAuditEntry[];
}

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

function deepFreezeValue<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreezeValue(nested);
    }
  }
  return value;
}

function createImmutableReadonlyMap<K, V>(
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

function validateStoredAuditEntry(raw: unknown): PublicationAuditEntry | null {
  if (!isObjectRecord(raw)) {
    return null;
  }
  if (
    typeof raw.id !== 'string' ||
    raw.id.trim().length === 0 ||
    typeof raw.projectId !== 'string' ||
    raw.projectId.trim().length === 0 ||
    typeof raw.projectCode !== 'string' ||
    raw.projectCode.trim().length === 0 ||
    !isLocalizedText(raw.projectTitle) ||
    typeof raw.fromStatus !== 'string' ||
    !VALID_PUBLICATION_STATUSES.has(raw.fromStatus as PublicationStatus) ||
    typeof raw.toStatus !== 'string' ||
    !VALID_PUBLICATION_STATUSES.has(raw.toStatus as PublicationStatus) ||
    typeof raw.actorUserId !== 'string' ||
    raw.actorUserId.trim().length === 0 ||
    typeof raw.actorName !== 'string' ||
    raw.actorName.trim().length === 0 ||
    typeof raw.actorRole !== 'string' ||
    !VALID_ROLES.has(raw.actorRole as Role) ||
    typeof raw.departmentId !== 'string' ||
    !isLocalizedText(raw.note) ||
    raw.note.pt.trim().length > PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH ||
    raw.note.en.trim().length > PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH ||
    typeof raw.timestampIso !== 'string' ||
    raw.timestampIso.trim().length === 0 ||
    (raw.origin !== 'seed-fixture' && raw.origin !== 'local-created')
  ) {
    return null;
  }

  return {
    id: raw.id.trim(),
    projectId: raw.projectId.trim(),
    projectCode: raw.projectCode.trim(),
    projectTitle: {
      pt: raw.projectTitle.pt.trim(),
      en: raw.projectTitle.en.trim(),
    },
    fromStatus: raw.fromStatus as PublicationStatus,
    toStatus: raw.toStatus as PublicationStatus,
    actorUserId: raw.actorUserId.trim(),
    actorName: raw.actorName.trim(),
    actorRole: raw.actorRole as Role,
    departmentId: raw.departmentId as DepartmentId,
    note: {
      pt: raw.note.pt.trim(),
      en: raw.note.en.trim(),
    },
    timestampIso: raw.timestampIso.trim(),
    origin: raw.origin,
  };
}

function emptyEnvelope(): StoredPublicationsEnvelope {
  return {
    version: 1,
    createdEntries: [],
  };
}

let cachedSnapshot:
  | (PublicationsSnapshot & { envelope: StoredPublicationsEnvelope })
  | null = null;
let cacheVersionCounter = 0;
let isInternalEventEmit = false;
const subscribers = new Set<() => void>();

function notifySubscribers(): void {
  for (const listener of Array.from(subscribers)) {
    listener();
  }
}

function emitPublicationsUpdated(): void {
  notifySubscribers();
  if (typeof window === 'undefined') {
    return;
  }
  isInternalEventEmit = true;
  try {
    window.dispatchEvent(new CustomEvent(PUBLICATIONS_UPDATED_EVENT));
  } finally {
    isInternalEventEmit = false;
  }
}

export function invalidatePublicationsCache(): void {
  cachedSnapshot = null;
  cacheVersionCounter += 1;
}

function loadEnvelopeFromStorage(): StoredPublicationsEnvelope {
  if (typeof window === 'undefined') {
    return emptyEnvelope();
  }
  try {
    const raw = window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY);
    if (!raw) {
      return emptyEnvelope();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isObjectRecord(parsed) || parsed.version !== 1) {
      window.localStorage.removeItem(PUBLICATIONS_STORAGE_KEY);
      return emptyEnvelope();
    }

    const seenIds = new Set<string>();
    const createdEntries: PublicationAuditEntry[] = [];
    if (Array.isArray(parsed.createdEntries)) {
      for (const entry of parsed.createdEntries) {
        const validated = validateStoredAuditEntry(entry);
        if (
          validated &&
          validated.origin === 'local-created' &&
          !seenIds.has(validated.id)
        ) {
          seenIds.add(validated.id);
          createdEntries.push(validated);
        }
      }
    }

    return {
      version: 1,
      createdEntries,
    };
  } catch {
    try {
      window.localStorage.removeItem(PUBLICATIONS_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors in restricted browsing modes
    }
    return emptyEnvelope();
  }
}

function buildPublicationsSnapshot(
  envelope: StoredPublicationsEnvelope,
): PublicationsSnapshot & { envelope: StoredPublicationsEnvelope } {
  const allEntries = [
    ...envelope.createdEntries,
    ...SEED_PUBLICATION_AUDIT_ENTRIES,
  ]
    .map((entry) =>
      deepFreezeValue({
        ...entry,
        projectTitle: { ...entry.projectTitle },
        note: { ...entry.note },
      }),
    )
    .sort((a, b) => {
      const tsDiff = b.timestampIso.localeCompare(a.timestampIso);
      return tsDiff !== 0 ? tsDiff : a.id.localeCompare(b.id);
    });

  const grouped = new Map<string, PublicationAuditEntry[]>();
  for (const entry of allEntries) {
    const list = grouped.get(entry.projectId);
    if (list) {
      list.push(entry);
    } else {
      grouped.set(entry.projectId, [entry]);
    }
  }
  const frozenMap = new Map<string, readonly PublicationAuditEntry[]>();
  for (const [projectId, list] of grouped.entries()) {
    frozenMap.set(projectId, Object.freeze(list));
  }

  cacheVersionCounter += 1;

  return Object.freeze({
    version: cacheVersionCounter,
    envelope: deepFreezeValue<StoredPublicationsEnvelope>({
      version: 1,
      createdEntries: [...envelope.createdEntries],
    }),
    allEntries: Object.freeze(allEntries),
    entriesByProjectId: createImmutableReadonlyMap(frozenMap),
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === null || event.key === PUBLICATIONS_STORAGE_KEY) {
      invalidatePublicationsCache();
      notifySubscribers();
    }
  });
  window.addEventListener(PUBLICATIONS_UPDATED_EVENT, () => {
    if (!isInternalEventEmit) {
      try {
        if (window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY) === null) {
          cachedSnapshot = buildPublicationsSnapshot(emptyEnvelope());
        } else {
          invalidatePublicationsCache();
        }
      } catch {
        invalidatePublicationsCache();
      }
      notifySubscribers();
    }
  });
  window.addEventListener(PROJECT_LIBRARY_UPDATED_EVENT, () => {
    try {
      if (window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY) === null) {
        if (
          cachedSnapshot === null ||
          cachedSnapshot.envelope.createdEntries.length > 0
        ) {
          cachedSnapshot = buildPublicationsSnapshot(emptyEnvelope());
          notifySubscribers();
        }
      }
    } catch {
      // Ignore storage access errors in restricted browsing modes
    }
  });
}

function getInternalSnapshot(): PublicationsSnapshot & {
  envelope: StoredPublicationsEnvelope;
} {
  if (cachedSnapshot === null) {
    cachedSnapshot = buildPublicationsSnapshot(loadEnvelopeFromStorage());
  }
  return cachedSnapshot;
}

export function getPublicationAuditSnapshot(): PublicationsSnapshot {
  return getInternalSnapshot();
}

export function getPublicationsVersion(): number {
  return getInternalSnapshot().version;
}

export function getAllowedNextPublicationStatuses(
  current: PublicationStatus,
): readonly PublicationStatus[] {
  return ALLOWED_PUBLICATION_TRANSITIONS[current] ?? [];
}

export function isPublicationTransitionAllowed(
  from: PublicationStatus,
  to: PublicationStatus,
): boolean {
  if (from === to) {
    return false;
  }
  return getAllowedNextPublicationStatuses(from).includes(to);
}

function saveEnvelope(envelope: StoredPublicationsEnvelope): void {
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(envelope);
    try {
      window.localStorage.setItem(PUBLICATIONS_STORAGE_KEY, serialized);
      const verified = window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY);
      if (verified === null) {
        throw new Error(
          'Não foi possível confirmar a gravação local do histórico editorial neste navegador.',
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
          'Limite de armazenamento local do navegador atingido (QuotaExceededError). Limpe dados locais antes de registar novas decisões editoriais.',
          { cause: error },
        );
        quotaError.name = 'QuotaExceededError';
        throw quotaError;
      }
      const detail =
        error instanceof Error && error.message ? ` (${error.message})` : '';
      throw new Error(
        `Falha ao guardar o registo editorial no armazenamento local do navegador.${detail}`,
        { cause: error },
      );
    }
  }
  // Update in-memory cache ONLY after persistence succeeds.
  cachedSnapshot = buildPublicationsSnapshot(envelope);
  emitPublicationsUpdated();
}

function defaultTransitionNote(
  fromStatus: PublicationStatus,
  toStatus: PublicationStatus,
): LocalizedText {
  return {
    pt: `Estado editorial actualizado localmente de "${formatPublicationStatusLabel(fromStatus, 'pt')}" para "${formatPublicationStatusLabel(toStatus, 'pt')}" (modo demonstrativo — sem alteração ao website público).`,
    en: `Editorial status updated locally from "${formatPublicationStatusLabel(fromStatus, 'en')}" to "${formatPublicationStatusLabel(toStatus, 'en')}" (demonstrative mode — no changes to the public website).`,
  };
}

/**
 * Validates and executes a local demonstrative editorial transition:
 * - Verifies allowed transition graph;
 * - Updates `publication.publicationStatus` in `projectLibraryRepository` via `updateProjectPublicationStatus`;
 * - Atomically records an immutable audit entry in `oa_workspace_publications_v1`.
 */
export function transitionProjectPublication(
  projectId: string,
  nextStatus: PublicationStatus,
  actorUserId: string,
  notePt?: string,
  noteEn?: string,
): PublicationActionResult {
  const project = getProjectById(projectId);
  if (!project) {
    return {
      ok: false,
      error: `Projecto "${projectId}" não encontrado na Biblioteca de Projectos.`,
    };
  }

  const actor = findDemoUserById(actorUserId);
  if (!actor) {
    return {
      ok: false,
      error: `Colaborador demonstrativo "${actorUserId}" não encontrado.`,
    };
  }

  const currentStatus = project.publication.publicationStatus;
  if (!isPublicationTransitionAllowed(currentStatus, nextStatus)) {
    return {
      ok: false,
      error: `Transição editorial não permitida de "${currentStatus}" para "${nextStatus}".`,
    };
  }

  const snapshot = getInternalSnapshot();
  if (
    snapshot.envelope.createdEntries.length >=
    PUBLICATIONS_LIMITS.MAX_LOCAL_PUBLICATION_EVENTS
  ) {
    throw new Error(
      `Limite máximo de ${PUBLICATIONS_LIMITS.MAX_LOCAL_PUBLICATION_EVENTS} registos editoriais locais atingido nesta demonstração.`,
    );
  }

  const cleanNotePt = assertWithinMaxLength(
    notePt ?? '',
    'Nota editorial (PT)',
    PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH,
  );
  const cleanNoteEn = assertWithinMaxLength(
    noteEn ?? '',
    'Nota editorial (EN)',
    PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH,
  );
  const fallbackNote = defaultTransitionNote(currentStatus, nextStatus);
  const note: LocalizedText = {
    pt: cleanNotePt || fallbackNote.pt,
    en: cleanNoteEn || cleanNotePt || fallbackNote.en,
  };

  const nowIso = new Date().toISOString();
  const timeStamp = Date.now().toString(36);
  const existingIds = new Set(snapshot.allEntries.map((item) => item.id));
  let id = `pub-loc-${project.identity.id}-${timeStamp}`;
  let suffix = 1;
  while (existingIds.has(id)) {
    suffix += 1;
    id = `pub-loc-${project.identity.id}-${timeStamp}-${suffix}`;
  }

  const entry: PublicationAuditEntry = {
    id,
    projectId: project.identity.id,
    projectCode: project.identity.code,
    projectTitle: { ...project.editorial.title },
    fromStatus: currentStatus,
    toStatus: nextStatus,
    actorUserId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    departmentId: project.classification.departmentId,
    note,
    timestampIso: nowIso,
    origin: 'local-created',
  };

  // Persist project publicationStatus first; if audit persistence fails (e.g., QuotaExceededError),
  // roll back project publicationStatus so both repositories remain strictly consistent.
  const updatedProject = updateProjectPublicationStatus(
    project.identity.id,
    nextStatus,
    actor.id,
  );
  if (!updatedProject) {
    return {
      ok: false,
      error: `Falha ao actualizar estado de publicação do projecto "${project.identity.code}".`,
    };
  }

  try {
    saveEnvelope({
      version: 1,
      createdEntries: [entry, ...snapshot.envelope.createdEntries],
    });
  } catch (err) {
    try {
      updateProjectPublicationStatus(
        project.identity.id,
        currentStatus,
        actor.id,
      );
    } catch {
      // Ignore rollback errors if storage is completely full
    }
    throw err;
  }

  return {
    ok: true,
    entry,
    updatedProject,
  };
}

export function clearLocalPublicationsStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(PUBLICATIONS_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors
    }
  }
  cachedSnapshot = buildPublicationsSnapshot(emptyEnvelope());
  emitPublicationsUpdated();
}

export function subscribePublications(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}
