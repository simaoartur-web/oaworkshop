import type {
  AppLanguage,
  DemoUser,
  Department,
  DepartmentId,
  LocalizedText,
} from '../../data/types';
import {
  getTodayIsoDate,
  suggestNextAvailableProjectCode,
} from '../../data/projectLibraryRepository';
import type {
  StudioDeskActivityEntry,
  StudioDeskProject,
} from '../../data/studioDeskTypes';
import type {
  ProjectDocumentReference,
  ProjectFileFormat,
  ProjectRevisionEntry,
} from './contracts';

const MONTH_ABBR: Record<AppLanguage, readonly string[]> = {
  pt: [
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
  ],
  en: [
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
  ],
};

export function pickText(text: LocalizedText, language: AppLanguage): string {
  return language === 'en' ? text.en : text.pt;
}

export function normalizeSearchQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function formatIsoDateShort(isoDate: string): LocalizedText {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return { pt: isoDate, en: isoDate };
  }
  const [, year, monthStr, dayStr] = match;
  const monthIdx = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (monthIdx < 0 || monthIdx > 11 || Number.isNaN(day)) {
    return { pt: isoDate, en: isoDate };
  }
  return {
    pt: `${day} ${MONTH_ABBR.pt[monthIdx]} ${year}`,
    en: `${day} ${MONTH_ABBR.en[monthIdx]} ${year}`,
  };
}

export function resolveDepartmentName(
  departmentId: DepartmentId,
  departments: Partial<Record<DepartmentId, Department>> | undefined,
  language: AppLanguage,
): string {
  const found = departments?.[departmentId];
  if (found) {
    return pickText(found.name, language);
  }
  return departmentId;
}

export function resolveCollaboratorsForProject(
  project: StudioDeskProject,
  collaborators: readonly DemoUser[],
): { leadUser: DemoUser | undefined; teamMembers: DemoUser[] } {
  const leadUser =
    collaborators.find((u) => u.id === project.leadUserId) ??
    collaborators.find((u) => u.code === project.leadAuthorCode);

  const memberIds = new Set<string>(project.contributorUserIds);
  if (leadUser) {
    memberIds.add(leadUser.id);
  }

  const teamMembers = collaborators.filter((u) => memberIds.has(u.id));
  return { leadUser, teamMembers };
}

/**
 * Generates an honest next code (e.g. `OA-26-125`) avoiding existing project codes.
 */
export function suggestNextProjectCode(existingCodes: readonly string[]): string {
  return suggestNextAvailableProjectCode([...existingCodes]);
}

/**
 * Derives structured architectural file-cycle references when a project dossier
 * comes directly from `StudioDeskProject` without an external document array.
 * Explicitly separates `.skp` source references and Phase 04 `.glb` targets.
 */
export function deriveDefaultProjectDocuments(
  project: StudioDeskProject,
): ProjectDocumentReference[] {
  const slug = project.code.toLowerCase();
  const baseDate = project.nextMilestone.dateIso || getTodayIsoDate();

  const deliverableDocs: ProjectDocumentReference[] = project.deliverables.map(
    (item, idx) => {
      const ext: ProjectFileFormat =
        idx % 2 === 0 ? 'pdf' : 'dwg';
      const version = item.ready ? 'v04' : 'v02';
      return {
        id: `${project.id}-doc-${item.id}`,
        code: item.code,
        fileName: `${item.code}_${version}.${ext}`,
        extension: ext,
        version,
        authorName: project.leadAuthorName,
        authorCode: project.leadAuthorCode,
        dateIso: baseDate,
        dateLabel: project.nextMilestone.dateLabel,
        reviewState: item.ready ? 'approved' : 'in_review',
        relationSummary: item.label,
      };
    },
  );

  const sourceSkpDoc: ProjectDocumentReference = {
    id: `${project.id}-doc-skp-src`,
    code: `${project.code}-SKP`,
    fileName: `${slug}-massing-source_v03.skp`,
    extension: 'skp',
    version: 'v03',
    authorName: project.leadAuthorName,
    authorCode: project.leadAuthorCode,
    dateIso: baseDate,
    dateLabel: project.nextMilestone.dateLabel,
    reviewState: 'in_review',
    relationSummary: {
      pt: 'Modelo de estudo original do atelier (arquivo de trabalho)',
      en: 'Original studio massing model (source archive)',
    },
    note: {
      pt: 'Ficheiro nativo SketchUp registado apenas por referência.',
      en: 'Native SketchUp file logged for reference only.',
    },
  };

  const targetGlbDoc: ProjectDocumentReference = {
    id: `${project.id}-doc-glb-target`,
    code: `${project.code}-3D`,
    fileName: `${slug}-preview-mesh_v01.glb`,
    extension: 'glb',
    version: 'v01',
    authorName: project.leadAuthorName,
    authorCode: project.leadAuthorCode,
    dateIso: baseDate,
    dateLabel: project.nextMilestone.dateLabel,
    reviewState: 'draft',
    relationSummary: {
      pt: 'Exportação Web 3D preparada para visualização interactiva futura',
      en: 'Web 3D export prepared for upcoming interactive viewing',
    },
  };

  return [...deliverableDocs, sourceSkpDoc, targetGlbDoc];
}

/**
 * Derives a clean chronological revision log from workspace activity entries
 * matching the project or synthesizes honest baseline entries from the project milestone.
 */
export function deriveProjectRevisionHistory(
  project: StudioDeskProject,
  activityEntries: readonly StudioDeskActivityEntry[] = [],
): ProjectRevisionEntry[] {
  const matched = activityEntries
    .filter((entry) => entry.projectId === project.id || entry.projectCode === project.code)
    .map<ProjectRevisionEntry>((entry, index) => ({
      id: entry.id,
      versionTag: `rev.${String(index + 1).padStart(2, '0')}`,
      kind: entry.kind,
      authorName: entry.originLabel,
      dateIso: entry.timestampIso,
      dateLabel: entry.dateLabel,
      summary: entry.summary,
    }));

  if (matched.length > 0) {
    return matched;
  }

  return [
    {
      id: `${project.id}-rev-baseline`,
      versionTag: 'rev.01',
      kind: 'phase_change',
      authorName: `${project.leadAuthorName} · ${project.leadAuthorCode}`,
      dateIso: project.nextMilestone.dateIso,
      dateLabel: project.nextMilestone.dateLabel,
      summary: {
        pt: `Dossier registado na fase «${project.phase.pt}» com próximo marco em ${project.nextMilestone.dateLabel.pt}.`,
        en: `Dossier registered in phase "${project.phase.en}" with next milestone on ${project.nextMilestone.dateLabel.en}.`,
      },
      decisionNote: project.dossierNotes,
    },
  ];
}

export function isSkpFormat(extension: ProjectFileFormat): boolean {
  return extension === 'skp';
}

export function isWeb3DFormat(extension: ProjectFileFormat): boolean {
  return extension === 'glb' || extension === 'gltf';
}
