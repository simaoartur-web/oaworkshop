import {
  DEMO_USERS,
  DEPARTMENTS,
  FEATURED_STUDY_PROJECT,
} from '../../data/fixtures';
import { STUDIO_DESK_PROJECTS } from '../../data/studioDeskFixtures';
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
  searchText: string;
  isPlannedRoute?: boolean;
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

  const projectEntries: WorkspaceSearchEntry[] = STUDIO_DESK_PROJECTS.map(
    (project) => ({
      id: `project-${project.id}`,
      category: 'project',
      code: `${project.code} · ${project.studioBase}`,
      title: pickLocalized(project.title, language),
      subtitle: `${pickLocalized(project.discipline, language)} · ${project.scale} · ${project.leadAuthorName}`,
      targetPath: `/workspace?project=${project.id}`,
      isPlannedRoute: false,
      searchText: normalizeForSearch(
        [
          project.code,
          project.id,
          project.studioBase,
          project.leadAuthorName,
          project.leadAuthorCode,
          project.scale,
          project.areaSqm,
          project.elevationDatum,
          project.title.pt,
          project.title.en,
          project.subtitle.pt,
          project.subtitle.en,
          project.discipline.pt,
          project.discipline.en,
          project.phase.pt,
          project.phase.en,
          ...project.deliverables.flatMap((d) => [d.code, d.label.pt, d.label.en]),
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
    isPlannedRoute: true,
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
    code: `${FEATURED_STUDY_PROJECT.code} · Welcome`,
    title: pickLocalized(FEATURED_STUDY_PROJECT.title, language),
    subtitle: `${pickLocalized(
      FEATURED_STUDY_PROJECT.discipline,
      language,
    )} · ${FEATURED_STUDY_PROJECT.scale} · (Fases 03–04)`,
    targetPath: '/workspace/projects',
    isPlannedRoute: true,
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

  return [
    ...routeEntries,
    ...profileEntries,
    ...projectEntries,
    studyEntry,
    ...departmentEntries,
  ];
}

export function searchWorkspaceDemo(
  query: string,
  language: AppLanguage,
): WorkspaceSearchEntry[] {
  const entries = buildWorkspaceSearchEntries(language);
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) {
    // Curated immediate entries when query is empty:
    // Featured Projects + Primary Routes + Key profiles
    return entries.filter((entry) =>
      [
        'project-sd-proj-oa-26-101',
        'project-sd-proj-oa-26-108',
        'route-desk',
        'route-projects',
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
    .slice(0, 14)
    .map((item) => item.entry);
}
