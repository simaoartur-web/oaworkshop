import {
  DEMO_USERS,
  DEPARTMENTS,
  FEATURED_STUDY_PROJECT,
} from '../../data/fixtures';
import type { AppLanguage, Role } from '../../data/types';
import { pickLocalized } from '../../locales';
import { WORKSPACE_NAV_ITEMS } from './shellNavigation';

export type SearchResultCategory = 'route' | 'profile' | 'department' | 'study';

export interface WorkspaceSearchEntry {
  id: string;
  category: SearchResultCategory;
  code: string;
  title: string;
  subtitle: string;
  targetPath: string;
  switchToRole?: Role;
  searchText: string;
}

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function buildWorkspaceSearchEntries(
  language: AppLanguage,
): WorkspaceSearchEntry[] {
  const routeEntries: WorkspaceSearchEntry[] = WORKSPACE_NAV_ITEMS.map(
    (item) => ({
      id: `route-${item.id}`,
      category: 'route',
      code: `${item.plateNumber} · ${item.shortTag}`,
      title: pickLocalized(item.label, language),
      subtitle: `${pickLocalized(item.description, language)} (${pickLocalized(
        item.targetPhase,
        language,
      )})`,
      targetPath: item.path,
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

  const profileEntries: WorkspaceSearchEntry[] = DEMO_USERS.map((user) => {
    const dept = DEPARTMENTS[user.departmentId];
    return {
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
    };
  });

  const departmentEntries: WorkspaceSearchEntry[] = Object.values(
    DEPARTMENTS,
  ).map((dept) => ({
    id: `dept-${dept.id}`,
    category: 'department',
    code: dept.code,
    title: pickLocalized(dept.name, language),
    subtitle: pickLocalized(dept.focus, language),
    targetPath: '/workspace/departments',
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
  }));

  const studyEntry: WorkspaceSearchEntry = {
    id: `study-${FEATURED_STUDY_PROJECT.id}`,
    category: 'study',
    code: FEATURED_STUDY_PROJECT.code,
    title: pickLocalized(FEATURED_STUDY_PROJECT.title, language),
    subtitle: `${pickLocalized(
      FEATURED_STUDY_PROJECT.discipline,
      language,
    )} · ${FEATURED_STUDY_PROJECT.scale}`,
    targetPath: '/workspace/projects',
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
  };

  return [studyEntry, ...routeEntries, ...profileEntries, ...departmentEntries];
}

export function searchWorkspaceDemo(
  query: string,
  language: AppLanguage,
): WorkspaceSearchEntry[] {
  const entries = buildWorkspaceSearchEntries(language);
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) {
    // Curated immediate entries when query is empty (Study + Primary Routes + first 2 profiles)
    return entries.filter((entry) =>
      [
        'study-proj-oa-26-014',
        'route-desk',
        'route-projects',
        'route-departments',
        'route-settings',
        'profile-usr-dir-01',
        'profile-usr-arq-02',
      ].includes(entry.id),
    );
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return entries
    .map((entry) => {
      const matchesAll = terms.every((term) => entry.searchText.includes(term));
      if (!matchesAll) {
        return null;
      }
      const normTitle = normalizeForSearch(entry.title);
      const normCode = normalizeForSearch(entry.code);
      let score = 1;
      if (normCode.startsWith(normalizedQuery) || normTitle.startsWith(normalizedQuery)) {
        score = 3;
      } else if (normTitle.includes(normalizedQuery)) {
        score = 2;
      }
      return { entry, score };
    })
    .filter((item): item is { entry: WorkspaceSearchEntry; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => item.entry);
}
