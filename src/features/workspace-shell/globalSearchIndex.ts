import {
  DEMO_USERS,
  DEPARTMENTS,
  FEATURED_STUDY_PROJECT,
} from '../../data/fixtures';
import {
  getProjectLibrarySnapshot,
  subscribeProjectLibraryChanges,
} from '../../data/projectLibraryRepository';
import {
  getPublicationAuditSnapshot,
  subscribePublications,
} from '../../data/publicationsRepository';
import {
  getTasksSnapshot,
  subscribeTasksChanges,
} from '../../data/tasksRepository';
import {
  getTechnicalLibrarySnapshot,
  subscribeTechnicalLibraryChanges,
} from '../../data/technicalLibraryRepository';
import type { AppLanguage, Role } from '../../data/types';
import { pickLocalized } from '../../locales';
import { WORKSPACE_NAV_ITEMS } from './shellNavigation';

export type SearchResultCategory =
  | 'route'
  | 'profile'
  | 'department'
  | 'study'
  | 'project';

export interface WorkspaceSearchEntry {
  id: string;
  category: SearchResultCategory;
  code: string;
  title: string;
  subtitle: string;
  targetPath: string;
  switchToRole?: Role;
  taskId?: string;
  memberId?: string;
  techRefId?: string;
  publicationProjectId?: string;
  searchText: string;
  isPlannedRoute?: boolean;
}

interface IndexedWorkspaceSearchEntry extends WorkspaceSearchEntry {
  normCode: string;
  normTitle: string;
}

interface CachedDynamicSearchBucket {
  libraryVersion: number;
  tasksVersion: number;
  techLibraryVersion: number;
  publicationsVersion: number;
  language: AppLanguage;
  entries: readonly IndexedWorkspaceSearchEntry[];
}

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function withNormalizedMeta(
  entry: WorkspaceSearchEntry,
): IndexedWorkspaceSearchEntry {
  return {
    ...entry,
    normCode: normalizeForSearch(entry.code),
    normTitle: normalizeForSearch(entry.title),
  };
}

interface StaticSearchBuckets {
  routeEntries: readonly IndexedWorkspaceSearchEntry[];
  profileEntries: readonly IndexedWorkspaceSearchEntry[];
  studyAndDepartmentEntries: readonly IndexedWorkspaceSearchEntry[];
}

const staticBucketsByLanguage = new Map<AppLanguage, StaticSearchBuckets>();
const dynamicBucketsByLanguage = new Map<
  AppLanguage,
  CachedDynamicSearchBucket
>();

subscribeProjectLibraryChanges(() => {
  dynamicBucketsByLanguage.clear();
});

subscribeTasksChanges(() => {
  dynamicBucketsByLanguage.clear();
});

subscribeTechnicalLibraryChanges(() => {
  dynamicBucketsByLanguage.clear();
});

subscribePublications(() => {
  dynamicBucketsByLanguage.clear();
});

export function clearWorkspaceSearchIndexCache(): void {
  dynamicBucketsByLanguage.clear();
}

function getStaticBuckets(language: AppLanguage): StaticSearchBuckets {
  const existing = staticBucketsByLanguage.get(language);
  if (existing) {
    return existing;
  }

  const routeEntries: IndexedWorkspaceSearchEntry[] = WORKSPACE_NAV_ITEMS.map(
    (item) =>
      withNormalizedMeta({
        id: `route-${item.id}`,
        category: 'route',
        code: `${item.plateNumber} · ${item.shortTag}`,
        title: pickLocalized(item.label, language),
        subtitle: pickLocalized(item.description, language),
        targetPath: item.path,
        isPlannedRoute: item.status === 'planned',
        searchText: normalizeForSearch(
          [
            item.plateNumber,
            item.shortTag,
            item.path,
            item.label.pt,
            item.label.en,
            item.description.pt,
            item.description.en,
            item.targetPhase.pt,
            item.targetPhase.en,
          ].join(' '),
        ),
      }),
  );

  const profileEntries: IndexedWorkspaceSearchEntry[] = DEMO_USERS.map(
    (user) => {
      const dept = DEPARTMENTS[user.departmentId];
      return withNormalizedMeta({
        id: `profile-${user.id}`,
        category: 'profile',
        code: `${user.code} · ${user.studioBase}`,
        title: user.name,
        subtitle: `${pickLocalized(user.roleLabel, language)} · ${pickLocalized(
          dept.name,
          language,
        )}`,
        targetPath: '/workspace',
        switchToRole: user.role,
        isPlannedRoute: false,
        searchText: normalizeForSearch(
          [
            user.code,
            user.name,
            user.email,
            user.studioBase,
            user.role,
            user.roleLabel.pt,
            user.roleLabel.en,
            dept.name.pt,
            dept.name.en,
          ].join(' '),
        ),
      });
    },
  );

  const departmentEntries: IndexedWorkspaceSearchEntry[] = Object.values(
    DEPARTMENTS,
  ).map((dept) =>
    withNormalizedMeta({
      id: `dept-${dept.id}`,
      category: 'department',
      code: dept.code,
      title: pickLocalized(dept.name, language),
      subtitle: pickLocalized(dept.focus, language),
      targetPath: `/workspace/departments?dept=${dept.id}`,
      isPlannedRoute: false,
      searchText: normalizeForSearch(
        [
          dept.code,
          dept.id,
          dept.name.pt,
          dept.name.en,
          dept.focus.pt,
          dept.focus.en,
        ].join(' '),
      ),
    }),
  );

  const teamDirectoryEntries: IndexedWorkspaceSearchEntry[] = DEMO_USERS.map(
    (user) => {
      const dept = DEPARTMENTS[user.departmentId];
      return withNormalizedMeta({
        id: `team-${user.id}`,
        category: 'route',
        code: `${language === 'pt' ? 'EQUIPA' : 'TEAM'} · ${user.code}`,
        title: `${user.name} · ${language === 'pt' ? 'Directório' : 'Directory'}`,
        subtitle: `${pickLocalized(dept.name, language)} · ${user.studioBase}`,
        targetPath: `/workspace/team?member=${user.id}`,
        memberId: user.id,
        isPlannedRoute: false,
        searchText: normalizeForSearch(
          [
            'equipa',
            'team',
            'colaborador',
            'member',
            user.id,
            user.code,
            user.name,
            user.studioBase,
            user.role,
            user.roleLabel.pt,
            user.roleLabel.en,
            dept.code,
            dept.name.pt,
            dept.name.en,
          ].join(' '),
        ),
      });
    },
  );

  const studyEntry: IndexedWorkspaceSearchEntry = withNormalizedMeta({
    id: `study-${FEATURED_STUDY_PROJECT.id}`,
    category: 'study',
    code: `${FEATURED_STUDY_PROJECT.code} · Welcome`,
    title: pickLocalized(FEATURED_STUDY_PROJECT.title, language),
    subtitle: `${pickLocalized(
      FEATURED_STUDY_PROJECT.discipline,
      language,
    )} · ${FEATURED_STUDY_PROJECT.scale}`,
    targetPath: '/workspace/projects',
    isPlannedRoute: false,
    searchText: normalizeForSearch(
      [
        FEATURED_STUDY_PROJECT.code,
        FEATURED_STUDY_PROJECT.title.pt,
        FEATURED_STUDY_PROJECT.title.en,
        FEATURED_STUDY_PROJECT.subtitle.pt,
        FEATURED_STUDY_PROJECT.subtitle.en,
        FEATURED_STUDY_PROJECT.discipline.pt,
        FEATURED_STUDY_PROJECT.discipline.en,
        FEATURED_STUDY_PROJECT.location.pt,
        FEATURED_STUDY_PROJECT.location.en,
      ].join(' '),
    ),
  });

  const bucket: StaticSearchBuckets = {
    routeEntries,
    profileEntries,
    studyAndDepartmentEntries: [
      studyEntry,
      ...departmentEntries,
      ...teamDirectoryEntries,
    ],
  };
  staticBucketsByLanguage.set(language, bucket);
  return bucket;
}

function getIndexedSearchEntries(
  language: AppLanguage,
): readonly IndexedWorkspaceSearchEntry[] {
  const staticBuckets = getStaticBuckets(language);
  const snapshot = getProjectLibrarySnapshot();
  const tasksSnapshot = getTasksSnapshot();
  const techSnapshot = getTechnicalLibrarySnapshot();
  const pubSnapshot = getPublicationAuditSnapshot();
  const cachedDynamic = dynamicBucketsByLanguage.get(language);

  if (
    cachedDynamic &&
    cachedDynamic.libraryVersion === snapshot.version &&
    cachedDynamic.tasksVersion === tasksSnapshot.version &&
    cachedDynamic.techLibraryVersion === techSnapshot.version &&
    cachedDynamic.publicationsVersion === pubSnapshot.version
  ) {
    return cachedDynamic.entries;
  }

  const projectEntries: IndexedWorkspaceSearchEntry[] = snapshot.allRecords.map(
    (record) => {
      const dept = DEPARTMENTS[record.classification.departmentId];
      const targetPath =
        record.metadata.origin === 'seed-fixture'
          ? `/workspace?project=${record.identity.id}`
          : `/workspace/projects/${record.identity.id}`;
      return withNormalizedMeta({
        id: `project-${record.identity.id}`,
        category: 'project',
        code: `${record.identity.code} · ${record.location.studioBase}`,
        title: pickLocalized(record.editorial.title, language),
        subtitle: `${pickLocalized(record.classification.discipline, language)} · ${record.classification.scale} · ${record.ownership.leadAuthorName}`,
        targetPath,
        isPlannedRoute: false,
        searchText: normalizeForSearch(
          [
            record.identity.code,
            record.identity.id,
            record.identity.slug,
            dept.code,
            dept.name.pt,
            dept.name.en,
            record.location.studioBase,
            record.ownership.leadAuthorName,
            record.ownership.leadAuthorCode,
            record.classification.scale,
            record.classification.areaSqm,
            record.classification.elevationDatum,
            record.editorial.title.pt,
            record.editorial.title.en,
            record.editorial.subtitle.pt,
            record.editorial.subtitle.en,
            record.classification.discipline.pt,
            record.classification.discipline.en,
            record.lifecycle.phase.pt,
            record.lifecycle.phase.en,
            record.lifecycle.projectStatus,
            ...record.deliverables.flatMap((d) => [d.code, d.label.pt, d.label.en]),
            ...record.files.map((f) => f.fileName),
          ].join(' '),
        ),
      });
    },
  );

  const taskEntries: IndexedWorkspaceSearchEntry[] = tasksSnapshot.activeTasks.map(
    (task) => {
      const dept = DEPARTMENTS[task.departmentId];
      return withNormalizedMeta({
        id: `task-${task.id}`,
        category: 'route',
        code: `${task.code} · ${task.projectCode}`,
        title: pickLocalized(task.title, language),
        subtitle: `${task.assigneeLabel} · ${pickLocalized(task.dueLabel, language)} · ${pickLocalized(task.referenceTag, language)}`,
        targetPath: `/workspace/tasks?task=${task.id}`,
        taskId: task.id,
        isPlannedRoute: false,
        searchText: normalizeForSearch(
          [
            task.id,
            task.code,
            task.projectCode,
            task.title.pt,
            task.title.en,
            task.detail.pt,
            task.detail.en,
            task.assigneeLabel,
            task.dueDateIso,
            task.dueLabel.pt,
            task.dueLabel.en,
            task.referenceTag.pt,
            task.referenceTag.en,
            task.priority,
            task.status,
            dept.code,
            dept.name.pt,
            dept.name.en,
          ].join(' '),
        ),
      });
    },
  );

  const techRefEntries: IndexedWorkspaceSearchEntry[] =
    techSnapshot.allReferences.map((ref) => {
      const dept = DEPARTMENTS[ref.departmentId];
      return withNormalizedMeta({
        id: `techref-${ref.id}`,
        category: 'route',
        code: `${ref.code} · ${dept.code}`,
        title: pickLocalized(ref.title, language),
        subtitle: `${ref.standardsTag} · ${pickLocalized(ref.originRegion, language)}`,
        targetPath: `/workspace/library?ref=${ref.id}`,
        techRefId: ref.id,
        isPlannedRoute: false,
        searchText: normalizeForSearch(
          [
            ref.id,
            ref.code,
            ref.category,
            ref.standardsTag,
            ref.title.pt,
            ref.title.en,
            ref.summary.pt,
            ref.summary.en,
            ref.technicalSpecs.pt,
            ref.technicalSpecs.en,
            ref.originRegion.pt,
            ref.originRegion.en,
            ref.referenceCitation.pt,
            ref.referenceCitation.en,
            dept.code,
            dept.name.pt,
            dept.name.en,
          ].join(' '),
        ),
      });
    });

  // Index only projects actively in the editorial publication queue (non-private),
  // avoiding duplicate search hits for private-by-default projects.
  const publicationEntries: IndexedWorkspaceSearchEntry[] = snapshot.allRecords
    .filter((record) => record.publication.publicationStatus !== 'private')
    .map((record) => {
      const dept = DEPARTMENTS[record.classification.departmentId];
      const latestAudit =
        pubSnapshot.entriesByProjectId.get(record.identity.id)?.[0] ?? null;
      return withNormalizedMeta({
        id: `pub-${record.identity.id}`,
        category: 'route',
        code: `PUB · ${record.identity.code}`,
        title: `${language === 'pt' ? 'Publicação' : 'Publication'} · ${pickLocalized(record.editorial.title, language)}`,
        subtitle: `${record.publication.publicationStatus} · ${pickLocalized(dept.name, language)}`,
        targetPath: `/workspace/publications?project=${record.identity.id}`,
        publicationProjectId: record.identity.id,
        isPlannedRoute: false,
        searchText: normalizeForSearch(
          [
            'publicacao',
            'publicacoes',
            'publications',
            'editorial',
            'portfolio',
            record.identity.id,
            record.identity.code,
            record.editorial.title.pt,
            record.editorial.title.en,
            record.publication.publicationStatus,
            dept.code,
            dept.name.pt,
            dept.name.en,
            latestAudit?.note.pt ?? '',
            latestAudit?.note.en ?? '',
          ].join(' '),
        ),
      });
    });

  const combinedEntries: readonly IndexedWorkspaceSearchEntry[] = [
    ...staticBuckets.routeEntries,
    ...staticBuckets.profileEntries,
    ...projectEntries,
    ...taskEntries,
    ...techRefEntries,
    ...publicationEntries,
    ...staticBuckets.studyAndDepartmentEntries,
  ];

  dynamicBucketsByLanguage.set(language, {
    libraryVersion: snapshot.version,
    tasksVersion: tasksSnapshot.version,
    techLibraryVersion: techSnapshot.version,
    publicationsVersion: pubSnapshot.version,
    language,
    entries: combinedEntries,
  });

  return combinedEntries;
}

export function buildWorkspaceSearchEntries(
  language: AppLanguage,
): WorkspaceSearchEntry[] {
  return [...getIndexedSearchEntries(language)];
}

const DEFAULT_SUGGESTED_IDS = new Set([
  'project-sd-proj-oa-26-101',
  'project-sd-proj-oa-26-108',
  'route-desk',
  'route-projects',
  'route-settings',
  'profile-usr-dir-01',
  'profile-usr-arq-02',
]);

export function searchWorkspaceDemo(
  query: string,
  language: AppLanguage,
): WorkspaceSearchEntry[] {
  const entries = getIndexedSearchEntries(language);
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) {
    // Curated immediate entries when query is empty:
    // Featured Projects + Primary Routes + Key profiles
    return entries.filter((entry) => DEFAULT_SUGGESTED_IDS.has(entry.id));
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const scored: Array<{ entry: IndexedWorkspaceSearchEntry; score: number }> = [];

  for (const entry of entries) {
    let matchesAll = true;
    for (const term of terms) {
      if (!entry.searchText.includes(term)) {
        matchesAll = false;
        break;
      }
    }
    if (!matchesAll) {
      continue;
    }

    let score = 1;
    if (
      entry.normCode.startsWith(normalizedQuery) ||
      entry.normTitle.startsWith(normalizedQuery)
    ) {
      score = 3;
    } else if (entry.normTitle.includes(normalizedQuery)) {
      score = 2;
    }
    scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 14)
    .map((item) => item.entry);
}
