import { DEPARTMENTS, DEMO_USERS, findDemoUserById } from './fixtures';
import {
  canonicalToStudioDeskProject,
  getSeedCanonicalProjects,
  slugifyProjectIdentifier,
} from './projectLibraryAdapter';
import type {
  AddProjectFileReferenceInput,
  AddProjectRevisionInput,
  CanonicalProjectRecord,
  CreateCanonicalProjectInput,
  ProjectFileKind,
  ProjectFileReference,
  ProjectRevisionEntry,
  ProjectStudioBase,
  UpdateCanonicalProjectInput,
} from './projectLibraryTypes';
import type {
  DeskReviewState,
  StudioDeskDeliverable,
  StudioDeskProject,
} from './studioDeskTypes';
import type {
  DemoUser,
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
  Role,
} from './types';

export const PROJECT_LIBRARY_STORAGE_KEY = 'oa_workspace_project_library_v1';
export const PROJECT_LIBRARY_UPDATED_EVENT = 'oa:project-library-updated';

export const PROJECT_LIBRARY_LIMITS = {
  MAX_LOCAL_PROJECTS: 50,
  MAX_FILES_PER_PROJECT: 100,
  MAX_REVISIONS_PER_PROJECT: 100,
  MAX_TITLE_LENGTH: 160,
  MAX_CODE_LENGTH: 40,
  MAX_SHORT_FIELD_LENGTH: 120,
  MAX_FILENAME_LENGTH: 180,
  MAX_TEXT_LENGTH: 2000,
} as const;

interface StoredLibraryEnvelope {
  version: 1;
  overridesById: Record<string, CanonicalProjectRecord>;
  createdRecords: CanonicalProjectRecord[];
}

const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

const VALID_PROJECT_STATUSES = new Set<ProjectStatus>([
  'concept',
  'design',
  'in_progress',
  'review',
  'completed',
  'archived',
]);

const VALID_PUBLICATION_STATUSES = new Set<PublicationStatus>([
  'private',
  'requested',
  'approved',
  'published-demo',
  'rejected',
  'unpublished',
]);

const VALID_REVIEW_STATES = new Set<DeskReviewState>([
  'awaiting_review',
  'in_technical_review',
  'revision_requested',
  'approved_internal',
]);

const VALID_STUDIO_BASES = new Set<ProjectStudioBase>(['Maputo', 'Milão']);

const VALID_FILE_KINDS = new Set<ProjectFileKind>([
  'drawing',
  'model_3d',
  'source_skp',
  'specification',
  'photographic_log',
]);

const VALID_ROLES = new Set<Role>([
  'director',
  'project_manager',
  'architect',
  'department_lead',
  'communications',
  'staff',
]);

const PT_MONTH_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const EN_MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetIsoDate(offsetDays: number): string {
  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidIsoCalendarDate(dateIso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function formatMilestoneDateLabel(dateIso: string): LocalizedText {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!match) {
    return { pt: dateIso || 'Por definir', en: dateIso || 'To be scheduled' };
  }
  const year = match[1];
  const monthIdx = Math.max(0, Math.min(11, Number(match[2]) - 1));
  const day = String(Number(match[3]));
  return {
    pt: `${day} ${PT_MONTH_SHORT[monthIdx]} ${year}`,
    en: `${day} ${EN_MONTH_SHORT[monthIdx]} ${year}`,
  };
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

function sanitizeLocalizedText(
  value: unknown,
  fallback: LocalizedText,
): LocalizedText {
  if (!isObjectRecord(value)) {
    return fallback;
  }
  const pt =
    typeof value.pt === 'string' && value.pt.trim().length > 0
      ? value.pt.trim()
      : fallback.pt;
  const en =
    typeof value.en === 'string' && value.en.trim().length > 0
      ? value.en.trim()
      : pt;
  return { pt, en };
}

function isValidDeliverable(value: unknown): value is StudioDeskDeliverable {
  return (
    isObjectRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.code === 'string' &&
    isLocalizedText(value.label) &&
    typeof value.ready === 'boolean'
  );
}

function isValidFileReference(value: unknown): value is ProjectFileReference {
  return (
    isObjectRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.code === 'string' &&
    typeof value.fileName === 'string' &&
    value.fileName.trim().length > 0 &&
    typeof value.kind === 'string' &&
    VALID_FILE_KINDS.has(value.kind as ProjectFileKind) &&
    typeof value.formatLabel === 'string' &&
    typeof value.versionLabel === 'string' &&
    typeof value.sizeHint === 'string' &&
    typeof value.addedAtIso === 'string' &&
    typeof value.addedByUserId === 'string' &&
    typeof value.addedByName === 'string' &&
    (value.reviewState === undefined ||
      (typeof value.reviewState === 'string' &&
        VALID_REVIEW_STATES.has(value.reviewState as DeskReviewState))) &&
    isLocalizedText(value.note)
  );
}

function isValidRevisionEntry(value: unknown): value is ProjectRevisionEntry {
  return (
    isObjectRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.code === 'string' &&
    typeof value.versionLabel === 'string' &&
    isLocalizedText(value.summary) &&
    typeof value.authorUserId === 'string' &&
    typeof value.authorName === 'string' &&
    typeof value.createdAtIso === 'string' &&
    typeof value.reviewState === 'string' &&
    VALID_REVIEW_STATES.has(value.reviewState as DeskReviewState)
  );
}

function validateCanonicalRecord(raw: unknown): CanonicalProjectRecord | null {
  if (!isObjectRecord(raw)) {
    return null;
  }

  const {
    identity,
    editorial,
    classification,
    ownership,
    location,
    lifecycle,
    schedule,
    review,
    deliverables,
    files,
    revisions,
    publication,
    metadata,
  } = raw;

  if (
    !isObjectRecord(identity) ||
    typeof identity.id !== 'string' ||
    identity.id.trim().length === 0 ||
    typeof identity.code !== 'string' ||
    identity.code.trim().length === 0 ||
    typeof identity.slug !== 'string'
  ) {
    return null;
  }

  if (
    !isObjectRecord(editorial) ||
    !isLocalizedText(editorial.title) ||
    !isLocalizedText(editorial.subtitle) ||
    !isLocalizedText(editorial.dossierNotes) ||
    typeof editorial.imageSrc !== 'string' ||
    !isLocalizedText(editorial.imageAlt)
  ) {
    return null;
  }

  if (
    !isObjectRecord(classification) ||
    typeof classification.departmentId !== 'string' ||
    !VALID_DEPARTMENTS.has(classification.departmentId as DepartmentId) ||
    !isLocalizedText(classification.discipline) ||
    typeof classification.scale !== 'string' ||
    typeof classification.areaSqm !== 'string' ||
    typeof classification.elevationDatum !== 'string'
  ) {
    return null;
  }

  if (
    !isObjectRecord(ownership) ||
    typeof ownership.leadUserId !== 'string' ||
    typeof ownership.leadAuthorCode !== 'string' ||
    typeof ownership.leadAuthorName !== 'string' ||
    !Array.isArray(ownership.contributorUserIds) ||
    !Array.isArray(ownership.assignedRoles)
  ) {
    return null;
  }

  if (
    !isObjectRecord(location) ||
    typeof location.studioBase !== 'string' ||
    !VALID_STUDIO_BASES.has(location.studioBase as ProjectStudioBase)
  ) {
    return null;
  }

  if (
    !isObjectRecord(lifecycle) ||
    !isLocalizedText(lifecycle.phase) ||
    typeof lifecycle.projectStatus !== 'string' ||
    !VALID_PROJECT_STATUSES.has(lifecycle.projectStatus as ProjectStatus) ||
    typeof lifecycle.priorityRank !== 'number'
  ) {
    return null;
  }

  if (
    !isObjectRecord(schedule) ||
    !isObjectRecord(schedule.nextMilestone) ||
    !isLocalizedText(schedule.nextMilestone.title) ||
    typeof schedule.nextMilestone.dateIso !== 'string' ||
    !isLocalizedText(schedule.nextMilestone.dateLabel) ||
    typeof schedule.milestonesCompleted !== 'number' ||
    typeof schedule.milestonesTotal !== 'number'
  ) {
    return null;
  }

  if (
    !isObjectRecord(review) ||
    typeof review.reviewState !== 'string' ||
    !VALID_REVIEW_STATES.has(review.reviewState as DeskReviewState) ||
    !isObjectRecord(review.roleFocalNote)
  ) {
    return null;
  }

  if (
    !isObjectRecord(publication) ||
    typeof publication.publicationStatus !== 'string' ||
    !VALID_PUBLICATION_STATUSES.has(
      publication.publicationStatus as PublicationStatus,
    )
  ) {
    return null;
  }

  if (
    !isObjectRecord(metadata) ||
    (metadata.origin !== 'seed-fixture' && metadata.origin !== 'local-created') ||
    typeof metadata.isArchived !== 'boolean' ||
    typeof metadata.createdAtIso !== 'string' ||
    typeof metadata.updatedAtIso !== 'string' ||
    typeof metadata.createdByUserId !== 'string' ||
    typeof metadata.updatedByUserId !== 'string'
  ) {
    return null;
  }

  const cleanContributors = ownership.contributorUserIds.filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0,
  );
  const cleanRoles = ownership.assignedRoles.filter(
    (entry): entry is Role =>
      typeof entry === 'string' && VALID_ROLES.has(entry as Role),
  );

  // Guard privacy invariant for locally created projects even if storage was tampered with
  const safePublicationStatus: PublicationStatus =
    metadata.origin === 'local-created'
      ? 'private'
      : (publication.publicationStatus as PublicationStatus);

  return {
    identity: {
      id: identity.id.trim(),
      code: identity.code.trim(),
      slug:
        identity.slug.trim() ||
        slugifyProjectIdentifier(`${identity.code}-${editorial.title.pt}`),
    },
    editorial: {
      title: sanitizeLocalizedText(editorial.title, editorial.title),
      subtitle: sanitizeLocalizedText(editorial.subtitle, editorial.subtitle),
      dossierNotes: sanitizeLocalizedText(
        editorial.dossierNotes,
        editorial.dossierNotes,
      ),
      imageSrc: editorial.imageSrc,
      imageAlt: sanitizeLocalizedText(editorial.imageAlt, editorial.imageAlt),
    },
    classification: {
      departmentId: classification.departmentId as DepartmentId,
      discipline: sanitizeLocalizedText(
        classification.discipline,
        classification.discipline,
      ),
      scale: classification.scale,
      areaSqm: classification.areaSqm,
      elevationDatum: classification.elevationDatum,
    },
    ownership: {
      leadUserId: ownership.leadUserId,
      leadAuthorCode: ownership.leadAuthorCode,
      leadAuthorName: ownership.leadAuthorName,
      contributorUserIds: cleanContributors,
      assignedRoles: cleanRoles,
    },
    location: {
      studioBase: location.studioBase as ProjectStudioBase,
    },
    lifecycle: {
      phase: sanitizeLocalizedText(lifecycle.phase, lifecycle.phase),
      projectStatus: lifecycle.projectStatus as ProjectStatus,
      priorityRank: lifecycle.priorityRank,
    },
    schedule: {
      nextMilestone: {
        title: sanitizeLocalizedText(
          schedule.nextMilestone.title,
          schedule.nextMilestone.title,
        ),
        dateIso: schedule.nextMilestone.dateIso,
        dateLabel: sanitizeLocalizedText(
          schedule.nextMilestone.dateLabel,
          schedule.nextMilestone.dateLabel,
        ),
      },
      milestonesCompleted: schedule.milestonesCompleted,
      milestonesTotal: Math.max(1, schedule.milestonesTotal),
    },
    review: {
      reviewState: review.reviewState as DeskReviewState,
      roleFocalNote: review.roleFocalNote as Partial<Record<Role, LocalizedText>>,
    },
    deliverables: Array.isArray(deliverables)
      ? deliverables.filter(isValidDeliverable)
      : [],
    files: Array.isArray(files) ? files.filter(isValidFileReference) : [],
    revisions: Array.isArray(revisions)
      ? revisions.filter(isValidRevisionEntry)
      : [],
    publication: {
      publicationStatus: safePublicationStatus,
    },
    metadata: {
      origin: metadata.origin,
      isArchived:
        metadata.isArchived || lifecycle.projectStatus === 'archived',
      archivedAtIso:
        typeof metadata.archivedAtIso === 'string'
          ? metadata.archivedAtIso
          : undefined,
      createdAtIso: metadata.createdAtIso,
      updatedAtIso: metadata.updatedAtIso,
      createdByUserId: metadata.createdByUserId,
      updatedByUserId: metadata.updatedByUserId,
    },
  };
}

function emptyEnvelope(): StoredLibraryEnvelope {
  return {
    version: 1,
    overridesById: {},
    createdRecords: [],
  };
}

export interface ProjectLibrarySnapshot {
  version: number;
  envelope: StoredLibraryEnvelope;
  allRecords: readonly CanonicalProjectRecord[];
  activeRecords: readonly CanonicalProjectRecord[];
  lookupMap: ReadonlyMap<string, CanonicalProjectRecord>;
  studioDeskAll: readonly StudioDeskProject[];
  studioDeskActive: readonly StudioDeskProject[];
}

let cachedSnapshot: ProjectLibrarySnapshot | null = null;
let cacheVersionCounter = 0;
let isInternalEventEmit = false;
const librarySubscribers = new Set<() => void>();

function deepFreezeValue<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreezeValue(nested);
    }
  }
  return value;
}

function notifyLibrarySubscribers(): void {
  for (const listener of Array.from(librarySubscribers)) {
    listener();
  }
}

function emitLibraryUpdated(): void {
  notifyLibrarySubscribers();
  if (typeof window === 'undefined') {
    return;
  }
  isInternalEventEmit = true;
  try {
    window.dispatchEvent(new CustomEvent(PROJECT_LIBRARY_UPDATED_EVENT));
  } finally {
    isInternalEventEmit = false;
  }
}

export function invalidateProjectLibraryCache(): void {
  cachedSnapshot = null;
  cacheVersionCounter += 1;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === null || event.key === PROJECT_LIBRARY_STORAGE_KEY) {
      invalidateProjectLibraryCache();
      notifyLibrarySubscribers();
    }
  });
  window.addEventListener(PROJECT_LIBRARY_UPDATED_EVENT, () => {
    if (!isInternalEventEmit) {
      invalidateProjectLibraryCache();
      notifyLibrarySubscribers();
    }
  });
}

function loadEnvelopeFromStorage(): StoredLibraryEnvelope {
  if (typeof window === 'undefined') {
    return emptyEnvelope();
  }
  try {
    const raw = window.localStorage.getItem(PROJECT_LIBRARY_STORAGE_KEY);
    if (!raw) {
      return emptyEnvelope();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isObjectRecord(parsed) || parsed.version !== 1) {
      window.localStorage.removeItem(PROJECT_LIBRARY_STORAGE_KEY);
      return emptyEnvelope();
    }

    const overridesById: Record<string, CanonicalProjectRecord> = {};
    if (isObjectRecord(parsed.overridesById)) {
      for (const [id, entry] of Object.entries(parsed.overridesById)) {
        const validated = validateCanonicalRecord(entry);
        if (validated && validated.identity.id === id) {
          overridesById[id] = validated;
        }
      }
    }

    const seenCreatedIds = new Set<string>();
    const createdRecords: CanonicalProjectRecord[] = [];
    if (Array.isArray(parsed.createdRecords)) {
      for (const entry of parsed.createdRecords) {
        const validated = validateCanonicalRecord(entry);
        if (
          validated &&
          validated.metadata.origin === 'local-created' &&
          !seenCreatedIds.has(validated.identity.id)
        ) {
          seenCreatedIds.add(validated.identity.id);
          createdRecords.push(validated);
        }
      }
    }

    return {
      version: 1,
      overridesById,
      createdRecords,
    };
  } catch {
    try {
      window.localStorage.removeItem(PROJECT_LIBRARY_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors in restricted browsing modes
    }
    return emptyEnvelope();
  }
}

function buildLibrarySnapshot(
  envelope: StoredLibraryEnvelope,
): ProjectLibrarySnapshot {
  const seeds = getSeedCanonicalProjects();
  const resolvedSeeds = seeds.map(
    (seed) => envelope.overridesById[seed.identity.id] ?? seed,
  );
  const allRecords = [...envelope.createdRecords, ...resolvedSeeds].map(
    deepFreezeValue,
  );
  const activeRecords = allRecords.filter(
    (record) =>
      !record.metadata.isArchived &&
      record.lifecycle.projectStatus !== 'archived',
  );

  const lookupMap = new Map<string, CanonicalProjectRecord>();
  const registerKey = (key: string, record: CanonicalProjectRecord) => {
    const normalized = key.trim().toLowerCase();
    if (normalized && !lookupMap.has(normalized)) {
      lookupMap.set(normalized, record);
    }
  };
  for (const record of allRecords) {
    registerKey(record.identity.id, record);
    registerKey(record.identity.code, record);
    registerKey(record.identity.slug, record);
  }

  const studioDeskAll = allRecords.map((record) =>
    deepFreezeValue(canonicalToStudioDeskProject(record)),
  );
  const studioDeskActive = studioDeskAll.filter(
    (project) => project.projectStatus !== 'archived',
  );

  cacheVersionCounter += 1;

  return Object.freeze({
    version: cacheVersionCounter,
    envelope: deepFreezeValue<StoredLibraryEnvelope>({
      version: 1,
      overridesById: { ...envelope.overridesById },
      createdRecords: [...envelope.createdRecords],
    }),
    allRecords: Object.freeze(allRecords),
    activeRecords: Object.freeze(activeRecords),
    lookupMap,
    studioDeskAll: Object.freeze(studioDeskAll),
    studioDeskActive: Object.freeze(studioDeskActive),
  });
}

export function getProjectLibrarySnapshot(): ProjectLibrarySnapshot {
  if (cachedSnapshot === null) {
    cachedSnapshot = buildLibrarySnapshot(loadEnvelopeFromStorage());
  }
  return cachedSnapshot;
}

export function getProjectLibraryVersion(): number {
  return getProjectLibrarySnapshot().version;
}

function loadEnvelope(): StoredLibraryEnvelope {
  return getProjectLibrarySnapshot().envelope;
}

function saveEnvelope(envelope: StoredLibraryEnvelope): void {
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(envelope);
    try {
      window.localStorage.setItem(PROJECT_LIBRARY_STORAGE_KEY, serialized);
      const verified = window.localStorage.getItem(PROJECT_LIBRARY_STORAGE_KEY);
      if (verified === null) {
        throw new Error(
          'Não foi possível confirmar a gravação local dos dados neste navegador.',
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
          'Limite de armazenamento local do navegador atingido (QuotaExceededError). Exporte ou arquive projectos antigos antes de guardar novas alterações.',
          { cause: error },
        );
        quotaError.name = 'QuotaExceededError';
        throw quotaError;
      }
      const detail =
        error instanceof Error && error.message ? ` (${error.message})` : '';
      throw new Error(
        `Falha ao guardar os dados da biblioteca no armazenamento local do navegador.${detail}`,
        { cause: error },
      );
    }
  }
  // Update the in-memory cache ONLY after persistence succeeds.
  cachedSnapshot = buildLibrarySnapshot(envelope);
  emitLibraryUpdated();
}

function persistMutatedRecord(record: CanonicalProjectRecord): void {
  const envelope = getProjectLibrarySnapshot().envelope;
  const nextOverridesById = { ...envelope.overridesById };
  const nextCreatedRecords = [...envelope.createdRecords];
  if (record.metadata.origin === 'seed-fixture') {
    nextOverridesById[record.identity.id] = record;
  } else {
    const existingIndex = nextCreatedRecords.findIndex(
      (item) => item.identity.id === record.identity.id,
    );
    if (existingIndex >= 0) {
      nextCreatedRecords[existingIndex] = record;
    } else {
      nextCreatedRecords.unshift(record);
    }
  }
  saveEnvelope({
    version: 1,
    overridesById: nextOverridesById,
    createdRecords: nextCreatedRecords,
  });
}

export function listProjects(options?: {
  includeArchived?: boolean;
}): CanonicalProjectRecord[] {
  const includeArchived = options?.includeArchived ?? true;
  const snapshot = getProjectLibrarySnapshot();
  return includeArchived
    ? [...snapshot.allRecords]
    : [...snapshot.activeRecords];
}

export function listStudioDeskCompatibleProjects(options?: {
  includeArchived?: boolean;
}): StudioDeskProject[] {
  const includeArchived = options?.includeArchived ?? true;
  const snapshot = getProjectLibrarySnapshot();
  return includeArchived
    ? [...snapshot.studioDeskAll]
    : [...snapshot.studioDeskActive];
}

export function getProjectById(
  idOrCode: string | undefined | null,
): CanonicalProjectRecord | null {
  const query = idOrCode?.trim().toLowerCase();
  if (!query) {
    return null;
  }
  return getProjectLibrarySnapshot().lookupMap.get(query) ?? null;
}

export const ALLOWED_EXTENSIONS_BY_FILE_KIND: Readonly<
  Record<ProjectFileKind, ReadonlySet<string>>
> = {
  drawing: new Set(['pdf', 'dwg', 'dxf']),
  model_3d: new Set(['glb', 'gltf']),
  source_skp: new Set(['skp']),
  specification: new Set(['pdf', 'xlsx', 'csv', 'docx', 'doc', 'txt', 'md']),
  photographic_log: new Set(['webp', 'jpg', 'jpeg', 'png']),
};

const DANGEROUS_DOCUMENT_EXTENSIONS = new Set([
  'html',
  'htm',
  'svg',
  'js',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'jsx',
  'php',
  'exe',
  'bat',
  'cmd',
  'ps1',
  'sh',
  'vbs',
]);

const FILENAME_FORBIDDEN_CHARS = /[<>:"|?*]/;

function hasAsciiControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

export function assertWithinMaxLength(
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

export function validateProjectDocumentFileName(
  rawFileName: string,
  kind: ProjectFileKind,
): string {
  const trimmed = assertWithinMaxLength(
    rawFileName,
    'Nome do ficheiro',
    PROJECT_LIBRARY_LIMITS.MAX_FILENAME_LENGTH,
  );
  if (!trimmed) {
    throw new Error('O nome fictício do ficheiro é obrigatório.');
  }
  if (
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('..') ||
    trimmed.startsWith('.') ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ||
    hasAsciiControlChars(trimmed) ||
    FILENAME_FORBIDDEN_CHARS.test(trimmed)
  ) {
    throw new Error(
      `Nome de ficheiro documental inválido ("${trimmed}"). Use apenas o nome base com extensão sem caminhos, esquemas URL ou caracteres de controlo.`,
    );
  }
  const extMatch = /\.([a-z0-9]{1,10})$/i.exec(trimmed);
  if (!extMatch) {
    throw new Error(
      `O nome de ficheiro "${trimmed}" deve incluir uma extensão documental válida.`,
    );
  }
  const ext = extMatch[1].toLowerCase();
  if (DANGEROUS_DOCUMENT_EXTENSIONS.has(ext)) {
    throw new Error(
      `A extensão ".${ext}" não é permitida para referências documentais de arquitectura.`,
    );
  }
  const allowedForKind = ALLOWED_EXTENSIONS_BY_FILE_KIND[kind];
  if (!allowedForKind.has(ext)) {
    const allowedList = Array.from(allowedForKind)
      .map((item) => `.${item}`)
      .join(', ');
    throw new Error(
      `A extensão ".${ext}" não corresponde ao tipo documental "${kind}" (extensões aceites: ${allowedList}).`,
    );
  }
  return trimmed;
}

function deriveFileMeta(
  fileName: string,
  kind: ProjectFileKind,
): { formatLabel: string; sizeHint: string } {
  const cleanName = fileName.trim();
  const extMatch = /\.([a-z0-9]{2,5})$/i.exec(cleanName);
  const ext = extMatch ? extMatch[1].toUpperCase() : undefined;

  switch (kind) {
    case 'model_3d':
      return {
        formatLabel: `${ext ?? 'GLB'} · Fase 04`,
        sizeHint: 'Metadado 3D (sem carga binária)',
      };
    case 'source_skp':
      return {
        formatLabel: `${ext ?? 'SKP'} · Fase 04`,
        sizeHint: 'Registo documental .skp (Fase 04)',
      };
    case 'drawing':
      return {
        formatLabel: `${ext ?? 'PDF'} · Prancha`,
        sizeHint: 'Referência técnica local (demo)',
      };
    case 'photographic_log':
      return {
        formatLabel: `${ext ?? 'WEBP'} · Registo`,
        sizeHint: 'Registo visual de estudo (demo)',
      };
    case 'specification':
    default:
      return {
        formatLabel: `${ext ?? 'DOC'} · Memória`,
        sizeHint: 'Referência documental local (demo)',
      };
  }
}

export function normalizeProjectCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export function suggestNextAvailableProjectCode(
  existingCodes?: string[],
): string {
  const sourceCodes =
    existingCodes ??
    listProjects({ includeArchived: true }).map((item) => item.identity.code);
  const used = new Set(sourceCodes.map((code) => normalizeProjectCode(code)));
  let num = 125;
  while (used.has(`OA-26-${num}`)) {
    num += 1;
  }
  return `OA-26-${num}`;
}

export function isProjectCodeAvailable(
  rawCode: string,
  existing?: CanonicalProjectRecord[],
): boolean {
  const normalized = normalizeProjectCode(rawCode);
  if (!normalized) {
    return false;
  }
  const records = existing ?? listProjects({ includeArchived: true });
  return !records.some(
    (item) => normalizeProjectCode(item.identity.code) === normalized,
  );
}

function generateNextProjectCode(existing: CanonicalProjectRecord[]): string {
  return suggestNextAvailableProjectCode(
    existing.map((item) => item.identity.code),
  );
}

function pickDefaultVisualAsset(departmentId: DepartmentId): {
  imageSrc: string;
  imageAlt: LocalizedText;
} {
  if (departmentId === 'urbanism') {
    return {
      imageSrc: '/assets/studio-desk/urban-waterfront-study.webp',
      imageAlt: {
        pt: 'Maquete topográfica urbana demonstrativa sobre mesa técnica escura.',
        en: 'Demonstrative urban topographic study maquette on a dark studio table.',
      },
    };
  }
  if (departmentId === 'interiors' || departmentId === 'research') {
    return {
      imageSrc: '/assets/studio-desk/materials-climate-study.webp',
      imageAlt: {
        pt: 'Composição ortogonal de amostras materiais demonstrativas sobre base escura.',
        en: 'Orthogonal composition of demonstrative material samples on dark slate.',
      },
    };
  }
  return {
    imageSrc: '/assets/studies/login-spatial-study.webp',
    imageAlt: {
      pt: 'Estudo arquitectónico demonstrativo em betão escuro e taipa terracota.',
      en: 'Demonstrative architectural study in dark concrete and terracotta rammed earth.',
    },
  };
}

export function createProject(
  input: CreateCanonicalProjectInput,
  actorUser: DemoUser,
): CanonicalProjectRecord {
  const envelope = loadEnvelope();
  if (envelope.createdRecords.length >= PROJECT_LIBRARY_LIMITS.MAX_LOCAL_PROJECTS) {
    throw new Error(
      `Limite máximo de ${PROJECT_LIBRARY_LIMITS.MAX_LOCAL_PROJECTS} projectos locais atingido nesta demonstração.`,
    );
  }

  const titlePt = assertWithinMaxLength(
    input.titlePt,
    'Título do projecto (PT)',
    PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
  );
  const titleEn =
    assertWithinMaxLength(
      input.titleEn ?? '',
      'Título do projecto (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    ) || titlePt;
  const subtitlePt = assertWithinMaxLength(
    input.subtitlePt,
    'Resumo do projecto (PT)',
    PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
  );
  const subtitleEn =
    assertWithinMaxLength(
      input.subtitleEn ?? '',
      'Resumo do projecto (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    ) || subtitlePt;
  if (!titlePt || !subtitlePt) {
    throw new Error('Título e resumo do projecto são obrigatórios.');
  }

  const departmentId = VALID_DEPARTMENTS.has(input.departmentId)
    ? input.departmentId
    : actorUser.departmentId;
  const department = DEPARTMENTS[departmentId];
  const studioBase = VALID_STUDIO_BASES.has(input.studioBase)
    ? input.studioBase
    : actorUser.studioBase;
  const rawStatus: string = input.projectStatus;
  const projectStatus: Exclude<ProjectStatus, 'archived'> =
    rawStatus !== 'archived' &&
    VALID_PROJECT_STATUSES.has(rawStatus as ProjectStatus)
      ? (rawStatus as Exclude<ProjectStatus, 'archived'>)
      : 'concept';

  const existing = listProjects({ includeArchived: true });
  const rawCode = input.code
    ? normalizeProjectCode(
        assertWithinMaxLength(
          input.code,
          'Código do projecto',
          PROJECT_LIBRARY_LIMITS.MAX_CODE_LENGTH,
        ),
      )
    : '';
  if (rawCode && !isProjectCodeAvailable(rawCode, existing)) {
    throw new Error(
      `O código "${rawCode}" já existe na biblioteca de projectos.`,
    );
  }
  const code = rawCode || generateNextProjectCode(existing);
  const rawMilestoneDate = input.nextMilestoneDateIso.trim();
  if (rawMilestoneDate && !isValidIsoCalendarDate(rawMilestoneDate)) {
    throw new Error(
      `A data do próximo marco ("${rawMilestoneDate}") não é uma data de calendário válida (AAAA-MM-DD).`,
    );
  }
  const slugBase = slugifyProjectIdentifier(`${code}-${titlePt}`);
  const existingIds = new Set(existing.map((item) => item.identity.id));
  const timeStamp = Date.now().toString(36);
  let id = `proj-loc-${slugBase}-${timeStamp}`;
  let suffix = 1;
  while (existingIds.has(id)) {
    suffix += 1;
    id = `proj-loc-${slugBase}-${timeStamp}-${suffix}`;
  }

  const leadUser = findDemoUserById(input.leadUserId) ?? actorUser;
  const contributorSet = new Set<string>([
    leadUser.id,
    actorUser.id,
    ...(input.contributorUserIds ?? []),
  ]);
  const contributorUserIds = Array.from(contributorSet).filter((uid) =>
    Boolean(findDemoUserById(uid)),
  );
  const assignedRoles = Array.from(
    new Set<Role>(
      contributorUserIds
        .map((uid) => findDemoUserById(uid)?.role)
        .filter((role): role is Role => Boolean(role)),
    ),
  );
  if (!assignedRoles.includes(leadUser.role)) {
    assignedRoles.unshift(leadUser.role);
  }

  const nowIso = new Date().toISOString();
  const milestoneDateIso = input.nextMilestoneDateIso.trim() || getTodayIsoDate();
  const milestoneTitlePt =
    assertWithinMaxLength(
      input.nextMilestoneTitlePt,
      'Título do próximo marco',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    ) || 'Revisão preliminar de dossier';
  const milestoneTitleEn =
    assertWithinMaxLength(
      input.nextMilestoneTitleEn ?? '',
      'Título do próximo marco (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    ) || milestoneTitlePt;
  const phasePt =
    assertWithinMaxLength(
      input.phasePt,
      'Fase',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || 'Estudo Prévio';
  const phaseEn =
    assertWithinMaxLength(
      input.phaseEn ?? '',
      'Fase (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || phasePt;
  const disciplinePt =
    assertWithinMaxLength(
      input.disciplinePt,
      'Disciplina',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || department.name.pt;
  const disciplineEn =
    assertWithinMaxLength(
      input.disciplineEn ?? '',
      'Disciplina (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || department.name.en;
  const visualAsset = pickDefaultVisualAsset(departmentId);

  const dossierNotesPt =
    assertWithinMaxLength(
      input.dossierNotesPt ?? '',
      'Notas de dossier',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    ) ||
    'Registo demonstrativo criado localmente neste navegador. Sem sincronização em nuvem nem publicação externa.';
  const dossierNotesEn =
    assertWithinMaxLength(
      input.dossierNotesEn ?? '',
      'Notas de dossier (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    ) ||
    'Demonstrative record created locally in this browser. No cloud sync or external publishing.';

  const files: ProjectFileReference[] = [];
  if (input.initialFileName?.trim()) {
    const kind =
      input.initialFileKind && VALID_FILE_KINDS.has(input.initialFileKind)
        ? input.initialFileKind
        : 'drawing';
    const validatedInitialFileName = validateProjectDocumentFileName(
      input.initialFileName,
      kind,
    );
    const meta = deriveFileMeta(validatedInitialFileName, kind);
    files.push({
      id: `file-${id}-01`,
      code: `${code}-DOC-01`,
      fileName: validatedInitialFileName,
      kind,
      formatLabel: meta.formatLabel,
      versionLabel: 'v01',
      sizeHint: meta.sizeHint,
      addedAtIso: nowIso,
      addedByUserId: actorUser.id,
      addedByName: actorUser.name,
      note: {
        pt: 'Referência inicial associada na criação local.',
        en: 'Initial metadata reference attached on local creation.',
      },
    });
  }

  const record: CanonicalProjectRecord = {
    identity: {
      id,
      code,
      slug: slugBase || id,
    },
    editorial: {
      title: { pt: titlePt, en: titleEn },
      subtitle: { pt: subtitlePt, en: subtitleEn },
      dossierNotes: { pt: dossierNotesPt, en: dossierNotesEn },
      imageSrc: visualAsset.imageSrc,
      imageAlt: visualAsset.imageAlt,
    },
    classification: {
      departmentId,
      discipline: { pt: disciplinePt, en: disciplineEn },
      scale: input.scale?.trim() || '1 : 100',
      areaSqm: input.areaSqm?.trim() || 'Por definir (Demo)',
      elevationDatum: input.elevationDatum?.trim() || '±0.00 m NMM',
    },
    ownership: {
      leadUserId: leadUser.id,
      leadAuthorCode: leadUser.code,
      leadAuthorName: leadUser.name.replace(' (Demo)', ''),
      contributorUserIds,
      assignedRoles,
    },
    location: {
      studioBase,
    },
    lifecycle: {
      phase: { pt: phasePt, en: phaseEn },
      projectStatus,
      priorityRank: existing.length + 1,
    },
    schedule: {
      nextMilestone: {
        title: { pt: milestoneTitlePt, en: milestoneTitleEn },
        dateIso: milestoneDateIso,
        dateLabel: formatMilestoneDateLabel(milestoneDateIso),
      },
      milestonesCompleted: 0,
      milestonesTotal: 4,
    },
    review: {
      reviewState: 'awaiting_review',
      roleFocalNote: {},
    },
    deliverables: [
      {
        id: `del-${id}-01`,
        code: `${code}-01`,
        label: { pt: milestoneTitlePt, en: milestoneTitleEn },
        ready: false,
      },
    ],
    files,
    revisions: [
      {
        id: `rev-${id}-01`,
        code: `REV-${code}-01`,
        versionLabel: 'v01 · Inicial',
        summary: {
          pt: 'Ficha criada localmente na Biblioteca de Projectos (estado privado).',
          en: 'Project record created locally in Project Library (private status).',
        },
        authorUserId: actorUser.id,
        authorName: actorUser.name,
        createdAtIso: nowIso,
        reviewState: 'awaiting_review',
      },
    ],
    // Privacy mandate: EVERY newly created project starts strictly as 'private'
    publication: {
      publicationStatus: 'private',
    },
    metadata: {
      origin: 'local-created',
      isArchived: false,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      createdByUserId: actorUser.id,
      updatedByUserId: actorUser.id,
    },
  };

  persistMutatedRecord(record);
  return record;
}

export function updateProjectMetadata(
  id: string,
  patch: UpdateCanonicalProjectInput,
  actorUser: DemoUser,
): CanonicalProjectRecord | null {
  const existing = getProjectById(id);
  if (!existing) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const nextDepartmentId =
    patch.departmentId && VALID_DEPARTMENTS.has(patch.departmentId)
      ? patch.departmentId
      : existing.classification.departmentId;
  const nextStatus =
    patch.projectStatus && VALID_PROJECT_STATUSES.has(patch.projectStatus)
      ? patch.projectStatus
      : existing.lifecycle.projectStatus;
  const nextReviewState =
    patch.reviewState && VALID_REVIEW_STATES.has(patch.reviewState)
      ? patch.reviewState
      : existing.review.reviewState;
  const nextBase =
    patch.studioBase && VALID_STUDIO_BASES.has(patch.studioBase)
      ? patch.studioBase
      : existing.location.studioBase;

  const leadUser = patch.leadUserId
    ? findDemoUserById(patch.leadUserId) ?? findDemoUserById(existing.ownership.leadUserId)
    : findDemoUserById(existing.ownership.leadUserId);

  const contributorIds = patch.contributorUserIds
    ? Array.from(new Set([leadUser?.id ?? existing.ownership.leadUserId, ...patch.contributorUserIds])).filter((uid) =>
        Boolean(findDemoUserById(uid)),
      )
    : existing.ownership.contributorUserIds;

  const assignedRoles = Array.from(
    new Set<Role>(
      contributorIds
        .map((uid) => findDemoUserById(uid)?.role)
        .filter((r): r is Role => Boolean(r)),
    ),
  );
  if (leadUser && !assignedRoles.includes(leadUser.role)) {
    assignedRoles.unshift(leadUser.role);
  }

  const rawUpdatedMilestoneDate = patch.nextMilestone?.dateIso?.trim();
  if (
    rawUpdatedMilestoneDate &&
    !isValidIsoCalendarDate(rawUpdatedMilestoneDate)
  ) {
    throw new Error(
      `A data do próximo marco ("${rawUpdatedMilestoneDate}") não é uma data de calendário válida (AAAA-MM-DD).`,
    );
  }
  const nextMilestoneDateIso =
    rawUpdatedMilestoneDate || existing.schedule.nextMilestone.dateIso;

  if (patch.title) {
    assertWithinMaxLength(
      patch.title.pt,
      'Título do projecto (PT)',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    );
    assertWithinMaxLength(
      patch.title.en,
      'Título do projecto (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    );
  }
  if (patch.subtitle) {
    assertWithinMaxLength(
      patch.subtitle.pt,
      'Resumo do projecto (PT)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    );
    assertWithinMaxLength(
      patch.subtitle.en,
      'Resumo do projecto (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    );
  }
  if (patch.dossierNotes) {
    assertWithinMaxLength(
      patch.dossierNotes.pt,
      'Notas de dossier (PT)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    );
    assertWithinMaxLength(
      patch.dossierNotes.en,
      'Notas de dossier (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    );
  }
  if (patch.phase) {
    assertWithinMaxLength(
      patch.phase.pt,
      'Fase',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    );
    assertWithinMaxLength(
      patch.phase.en,
      'Fase (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    );
  }
  if (patch.nextMilestone?.title) {
    assertWithinMaxLength(
      patch.nextMilestone.title.pt,
      'Título do próximo marco',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    );
    assertWithinMaxLength(
      patch.nextMilestone.title.en,
      'Título do próximo marco (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    );
  }

  const nextTitle = patch.title
    ? sanitizeLocalizedText(patch.title, existing.editorial.title)
    : existing.editorial.title;

  const isArchived = nextStatus === 'archived';

  const updated: CanonicalProjectRecord = {
    ...existing,
    identity: {
      ...existing.identity,
      slug: slugifyProjectIdentifier(`${existing.identity.code}-${nextTitle.pt}`),
    },
    editorial: {
      ...existing.editorial,
      title: nextTitle,
      subtitle: patch.subtitle
        ? sanitizeLocalizedText(patch.subtitle, existing.editorial.subtitle)
        : existing.editorial.subtitle,
      dossierNotes: patch.dossierNotes
        ? sanitizeLocalizedText(
            patch.dossierNotes,
            existing.editorial.dossierNotes,
          )
        : existing.editorial.dossierNotes,
    },
    classification: {
      ...existing.classification,
      departmentId: nextDepartmentId,
      discipline: patch.discipline
        ? sanitizeLocalizedText(
            patch.discipline,
            existing.classification.discipline,
          )
        : existing.classification.discipline,
      scale: patch.scale?.trim() || existing.classification.scale,
      areaSqm: patch.areaSqm?.trim() || existing.classification.areaSqm,
      elevationDatum:
        patch.elevationDatum?.trim() || existing.classification.elevationDatum,
    },
    ownership: {
      leadUserId: leadUser?.id ?? existing.ownership.leadUserId,
      leadAuthorCode: leadUser?.code ?? existing.ownership.leadAuthorCode,
      leadAuthorName:
        leadUser?.name.replace(' (Demo)', '') ?? existing.ownership.leadAuthorName,
      contributorUserIds: contributorIds,
      assignedRoles:
        assignedRoles.length > 0 ? assignedRoles : existing.ownership.assignedRoles,
    },
    location: {
      studioBase: nextBase,
    },
    lifecycle: {
      ...existing.lifecycle,
      phase: patch.phase
        ? sanitizeLocalizedText(patch.phase, existing.lifecycle.phase)
        : existing.lifecycle.phase,
      projectStatus: nextStatus,
    },
    schedule: {
      nextMilestone: {
        title: patch.nextMilestone?.title
          ? sanitizeLocalizedText(
              patch.nextMilestone.title,
              existing.schedule.nextMilestone.title,
            )
          : existing.schedule.nextMilestone.title,
        dateIso: nextMilestoneDateIso,
        dateLabel:
          patch.nextMilestone?.dateLabel ??
          (patch.nextMilestone?.dateIso
            ? formatMilestoneDateLabel(nextMilestoneDateIso)
            : existing.schedule.nextMilestone.dateLabel),
      },
      milestonesCompleted:
        typeof patch.milestonesCompleted === 'number'
          ? Math.max(0, patch.milestonesCompleted)
          : existing.schedule.milestonesCompleted,
      milestonesTotal:
        typeof patch.milestonesTotal === 'number'
          ? Math.max(1, patch.milestonesTotal)
          : existing.schedule.milestonesTotal,
    },
    review: {
      ...existing.review,
      reviewState: nextReviewState,
    },
    // Publication state stays strictly isolated from Phase 03 metadata / archival edits
    publication: {
      publicationStatus: existing.publication.publicationStatus,
    },
    metadata: {
      ...existing.metadata,
      isArchived,
      archivedAtIso: isArchived
        ? existing.metadata.archivedAtIso ?? nowIso
        : undefined,
      updatedAtIso: nowIso,
      updatedByUserId: actorUser.id,
    },
  };

  persistMutatedRecord(updated);
  return updated;
}

export function archiveProject(
  id: string,
  actorUser: DemoUser,
): CanonicalProjectRecord | null {
  return updateProjectMetadata(
    id,
    { projectStatus: 'archived' },
    actorUser,
  );
}

export function restoreProjectFromArchive(
  id: string,
  nextStatus: Exclude<ProjectStatus, 'archived'>,
  actorUser: DemoUser,
): CanonicalProjectRecord | null {
  return updateProjectMetadata(
    id,
    { projectStatus: nextStatus },
    actorUser,
  );
}

export function addProjectRevision(
  id: string,
  input: AddProjectRevisionInput,
  actorUser: DemoUser,
): CanonicalProjectRecord | null {
  const existing = getProjectById(id);
  if (!existing) {
    return null;
  }

  if (existing.revisions.length >= PROJECT_LIBRARY_LIMITS.MAX_REVISIONS_PER_PROJECT) {
    throw new Error(
      `Limite máximo de ${PROJECT_LIBRARY_LIMITS.MAX_REVISIONS_PER_PROJECT} revisões atingido para este projecto.`,
    );
  }

  const versionLabel = assertWithinMaxLength(
    input.versionLabel,
    'Versão da revisão',
    PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
  );
  const summaryPt = assertWithinMaxLength(
    input.summaryPt,
    'Descrição da revisão',
    PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
  );
  const summaryEn =
    assertWithinMaxLength(
      input.summaryEn ?? '',
      'Descrição da revisão (EN)',
      PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
    ) || summaryPt;
  if (!versionLabel || !summaryPt) {
    throw new Error('Versão e descrição da revisão são obrigatórias.');
  }

  const nowIso = new Date().toISOString();
  const nextNumber = String(existing.revisions.length + 1).padStart(2, '0');
  const nextReviewState =
    input.reviewState && VALID_REVIEW_STATES.has(input.reviewState)
      ? input.reviewState
      : existing.review.reviewState;

  const entry: ProjectRevisionEntry = {
    id: `rev-${existing.identity.id}-${nextNumber}-${Date.now().toString(36)}`,
    code: `REV-${existing.identity.code}-${nextNumber}`,
    versionLabel,
    summary: {
      pt: summaryPt,
      en: summaryEn,
    },
    authorUserId: actorUser.id,
    authorName: actorUser.name,
    createdAtIso: nowIso,
    reviewState: nextReviewState,
  };

  const updated: CanonicalProjectRecord = {
    ...existing,
    review: {
      ...existing.review,
      reviewState: nextReviewState,
    },
    revisions: [entry, ...existing.revisions],
    metadata: {
      ...existing.metadata,
      updatedAtIso: nowIso,
      updatedByUserId: actorUser.id,
    },
  };

  persistMutatedRecord(updated);
  return updated;
}

export function addProjectFileReference(
  id: string,
  input: AddProjectFileReferenceInput,
  actorUser: DemoUser,
): CanonicalProjectRecord | null {
  const existing = getProjectById(id);
  if (!existing) {
    return null;
  }

  if (existing.files.length >= PROJECT_LIBRARY_LIMITS.MAX_FILES_PER_PROJECT) {
    throw new Error(
      `Limite máximo de ${PROJECT_LIBRARY_LIMITS.MAX_FILES_PER_PROJECT} referências documentais atingido para este projecto.`,
    );
  }

  const kind: ProjectFileKind = VALID_FILE_KINDS.has(input.kind)
    ? input.kind
    : 'drawing';
  const fileName = validateProjectDocumentFileName(input.fileName, kind);
  const versionLabel =
    assertWithinMaxLength(
      input.versionLabel,
      'Versão documental',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || 'v01';
  const code =
    assertWithinMaxLength(
      input.code ?? '',
      'Código documental',
      PROJECT_LIBRARY_LIMITS.MAX_CODE_LENGTH,
    ) || `${existing.identity.code}-DOC-${String(existing.files.length + 1).padStart(2, '0')}`;
  const authorName =
    assertWithinMaxLength(
      input.authorName ?? '',
      'Autor documental',
      PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || actorUser.name;
  const customNotePt = assertWithinMaxLength(
    input.notePt ?? '',
    'Nota documental',
    PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
  );
  const customNoteEn = assertWithinMaxLength(
    input.noteEn ?? '',
    'Nota documental (EN)',
    PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH,
  );

  const nowIso = new Date().toISOString();
  const nextNumber = String(existing.files.length + 1).padStart(2, '0');
  const meta = deriveFileMeta(fileName, kind);
  const reviewState: DeskReviewState =
    input.reviewState && VALID_REVIEW_STATES.has(input.reviewState)
      ? input.reviewState
      : 'awaiting_review';
  const addedAtIso =
    input.dateIso && isValidIsoCalendarDate(input.dateIso)
      ? `${input.dateIso.trim()}T12:00:00.000Z`
      : nowIso;
  const defaultNotePt =
    kind === 'source_skp' || kind === 'model_3d'
      ? 'Referência documental de modelo prevista para visualização Web 3D na Fase 04.'
      : 'Referência de ficheiro técnico registada localmente (metadado fictício).';
  const defaultNoteEn =
    kind === 'source_skp' || kind === 'model_3d'
      ? 'Documented 3D model metadata planned for Phase 04 Web 3D viewer.'
      : 'Technical file metadata recorded locally (fictive reference only).';

  const nextFile: ProjectFileReference = {
    id: `file-${existing.identity.id}-${nextNumber}-${Date.now().toString(36)}`,
    code,
    fileName,
    kind,
    formatLabel: meta.formatLabel,
    versionLabel,
    sizeHint: meta.sizeHint,
    addedAtIso,
    addedByUserId: actorUser.id,
    addedByName: authorName,
    reviewState,
    note: {
      pt: customNotePt || defaultNotePt,
      en: customNoteEn || customNotePt || defaultNoteEn,
    },
  };

  const updated: CanonicalProjectRecord = {
    ...existing,
    files: [nextFile, ...existing.files],
    metadata: {
      ...existing.metadata,
      updatedAtIso: nowIso,
      updatedByUserId: actorUser.id,
    },
  };

  persistMutatedRecord(updated);
  return updated;
}

export function clearProjectLibraryLocalState(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(PROJECT_LIBRARY_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors
    }
  }
  invalidateProjectLibraryCache();
  emitLibraryUpdated();
}

export function resetProjectLibraryState(): CanonicalProjectRecord[] {
  clearProjectLibraryLocalState();
  return listProjects({ includeArchived: true });
}

export function subscribeProjectLibraryChanges(
  listener: () => void,
): () => void {
  librarySubscribers.add(listener);
  return () => {
    librarySubscribers.delete(listener);
  };
}

export function isUserIndividuallyAssociatedWithProject(
  project: CanonicalProjectRecord,
  user: Pick<DemoUser, 'id'>,
): boolean {
  return (
    project.ownership.leadUserId === user.id ||
    project.ownership.contributorUserIds.includes(user.id)
  );
}

export function isUserMatchedOnlyByRole(
  project: CanonicalProjectRecord,
  user: Pick<DemoUser, 'id' | 'role'>,
): boolean {
  if (isUserIndividuallyAssociatedWithProject(project, user)) {
    return false;
  }
  return project.ownership.assignedRoles.includes(user.role);
}

export function isUserAssociatedWithProject(
  project: CanonicalProjectRecord,
  user: Pick<DemoUser, 'id' | 'role' | 'departmentId'>,
): boolean {
  return isUserIndividuallyAssociatedWithProject(project, user);
}

export function listAllDemoCollaborators(): DemoUser[] {
  return DEMO_USERS;
}
