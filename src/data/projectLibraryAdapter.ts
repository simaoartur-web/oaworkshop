import { findDemoUserById } from './fixtures';
import { STUDIO_DESK_PROJECTS } from './studioDeskFixtures';
import type { StudioDeskProject } from './studioDeskTypes';
import type {
  CanonicalProjectRecord,
  ProjectFileReference,
  ProjectRevisionEntry,
} from './projectLibraryTypes';

export function slugifyProjectIdentifier(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SEED_DATES_BY_PROJECT_ID: Record<
  string,
  { createdAtIso: string; updatedAtIso: string }
> = {
  'sd-proj-oa-26-101': {
    createdAtIso: '2026-09-14T08:30:00.000Z',
    updatedAtIso: '2026-11-10T14:20:00.000Z',
  },
  'sd-proj-oa-26-108': {
    createdAtIso: '2026-09-22T09:15:00.000Z',
    updatedAtIso: '2026-11-09T17:40:00.000Z',
  },
  'sd-proj-oa-26-112': {
    createdAtIso: '2026-10-03T10:00:00.000Z',
    updatedAtIso: '2026-11-10T11:05:00.000Z',
  },
  'sd-proj-oa-26-119': {
    createdAtIso: '2026-10-18T11:10:00.000Z',
    updatedAtIso: '2026-11-07T15:30:00.000Z',
  },
  'sd-proj-oa-25-084': {
    createdAtIso: '2025-11-05T09:00:00.000Z',
    updatedAtIso: '2026-10-28T16:00:00.000Z',
  },
};

function buildInitialSeedFiles(project: StudioDeskProject): ProjectFileReference[] {
  const lead = findDemoUserById(project.leadUserId);
  const dates = SEED_DATES_BY_PROJECT_ID[project.id] ?? {
    createdAtIso: '2026-10-01T09:00:00.000Z',
    updatedAtIso: '2026-11-01T12:00:00.000Z',
  };

  const deliverableFiles: ProjectFileReference[] = project.deliverables.map(
    (deliverable, index) => ({
      id: `file-${project.id}-${index + 1}`,
      code: deliverable.code,
      fileName: `${deliverable.code.toLowerCase()}-sheet.pdf`,
      kind: index === 0 ? 'drawing' : 'specification',
      formatLabel: 'PDF · Meta Demo',
      versionLabel: `v0${index + 1}`,
      sizeHint: 'Referência fictícia local',
      addedAtIso: dates.updatedAtIso,
      addedByUserId: project.leadUserId,
      addedByName: lead?.name ?? project.leadAuthorName,
      note: deliverable.label,
    }),
  );

  // Honest Phase 04 placeholder metadata (.skp / .glb) — zero binary file loaded
  const sourceModelRef: ProjectFileReference = {
    id: `file-${project.id}-src3d`,
    code: `${project.code}-3D`,
    fileName: `${project.code.toLowerCase()}-study-model.skp`,
    kind: 'source_skp',
    formatLabel: 'SKP · Fase 04',
    versionLabel: 'r01',
    sizeHint: 'Metadado de modelo futuro (Fase 04)',
    addedAtIso: dates.createdAtIso,
    addedByUserId: project.leadUserId,
    addedByName: lead?.name ?? project.leadAuthorName,
    note: {
      pt: 'Registo documental de modelo nativo .skp (visualizador Web 3D .glb reservado à Fase 04).',
      en: 'Documented native .skp reference (Web 3D .glb viewer deferred to Phase 04).',
    },
  };

  return [...deliverableFiles, sourceModelRef];
}

function buildInitialSeedRevisions(
  project: StudioDeskProject,
): ProjectRevisionEntry[] {
  const lead = findDemoUserById(project.leadUserId);
  const dates = SEED_DATES_BY_PROJECT_ID[project.id] ?? {
    createdAtIso: '2026-10-01T09:00:00.000Z',
    updatedAtIso: '2026-11-01T12:00:00.000Z',
  };

  return [
    {
      id: `rev-${project.id}-01`,
      code: `REV-${project.code}-01`,
      versionLabel: 'v01 · Base',
      summary: {
        pt: `Registo técnico inicial hidratado na Biblioteca (${project.phase.pt}).`,
        en: `Initial technical record hydrated into Library (${project.phase.en}).`,
      },
      authorUserId: project.leadUserId,
      authorName: lead?.name ?? project.leadAuthorName,
      createdAtIso: dates.updatedAtIso,
      reviewState: project.reviewState,
    },
  ];
}

export function studioDeskProjectToCanonical(
  project: StudioDeskProject,
): CanonicalProjectRecord {
  const dates = SEED_DATES_BY_PROJECT_ID[project.id] ?? {
    createdAtIso: '2026-10-01T09:00:00.000Z',
    updatedAtIso: '2026-11-01T12:00:00.000Z',
  };

  return {
    identity: {
      id: project.id,
      code: project.code,
      slug: slugifyProjectIdentifier(`${project.code}-${project.title.pt}`),
    },
    editorial: {
      title: { ...project.title },
      subtitle: { ...project.subtitle },
      dossierNotes: { ...project.dossierNotes },
      imageSrc: project.imageSrc,
      imageAlt: { ...project.imageAlt },
    },
    classification: {
      departmentId: project.departmentId,
      discipline: { ...project.discipline },
      scale: project.scale,
      areaSqm: project.areaSqm,
      elevationDatum: project.elevationDatum,
    },
    ownership: {
      leadUserId: project.leadUserId,
      leadAuthorCode: project.leadAuthorCode,
      leadAuthorName: project.leadAuthorName,
      contributorUserIds: [...project.contributorUserIds],
      assignedRoles: [...project.assignedRoles],
    },
    location: {
      studioBase: project.studioBase,
    },
    lifecycle: {
      phase: { ...project.phase },
      projectStatus: project.projectStatus,
      priorityRank: project.priorityRank,
    },
    schedule: {
      nextMilestone: {
        title: { ...project.nextMilestone.title },
        dateIso: project.nextMilestone.dateIso,
        dateLabel: { ...project.nextMilestone.dateLabel },
      },
      milestonesCompleted: project.milestonesCompleted,
      milestonesTotal: project.milestonesTotal,
    },
    review: {
      reviewState: project.reviewState,
      roleFocalNote: { ...project.roleFocalNote },
    },
    deliverables: project.deliverables.map((item) => ({
      ...item,
      label: { ...item.label },
    })),
    files: buildInitialSeedFiles(project),
    revisions: buildInitialSeedRevisions(project),
    publication: {
      publicationStatus: project.publicationStatus,
    },
    metadata: {
      origin: 'seed-fixture',
      isArchived: project.projectStatus === 'archived',
      createdAtIso: dates.createdAtIso,
      updatedAtIso: dates.updatedAtIso,
      createdByUserId: project.leadUserId,
      updatedByUserId: project.leadUserId,
    },
  };
}

/**
 * Converts any canonical project record back into the `StudioDeskProject` visual shape
 * expected by Studio Desk and Agente B presentation components (`project-experience`).
 */
export function canonicalToStudioDeskProject(
  record: CanonicalProjectRecord,
): StudioDeskProject {
  return {
    id: record.identity.id,
    code: record.identity.code,
    title: { ...record.editorial.title },
    subtitle: { ...record.editorial.subtitle },
    discipline: { ...record.classification.discipline },
    departmentId: record.classification.departmentId,
    studioBase: record.location.studioBase,
    phase: { ...record.lifecycle.phase },
    projectStatus: record.lifecycle.projectStatus,
    publicationStatus: record.publication.publicationStatus,
    reviewState: record.review.reviewState,
    priorityRank: record.lifecycle.priorityRank,
    nextMilestone: {
      title: { ...record.schedule.nextMilestone.title },
      dateIso: record.schedule.nextMilestone.dateIso,
      dateLabel: { ...record.schedule.nextMilestone.dateLabel },
    },
    milestonesCompleted: record.schedule.milestonesCompleted,
    milestonesTotal: record.schedule.milestonesTotal,
    scale: record.classification.scale,
    areaSqm: record.classification.areaSqm,
    elevationDatum: record.classification.elevationDatum,
    leadAuthorCode: record.ownership.leadAuthorCode,
    leadAuthorName: record.ownership.leadAuthorName,
    leadUserId: record.ownership.leadUserId,
    contributorUserIds: [...record.ownership.contributorUserIds],
    assignedRoles: [...record.ownership.assignedRoles],
    imageSrc: record.editorial.imageSrc,
    imageAlt: { ...record.editorial.imageAlt },
    dossierNotes: { ...record.editorial.dossierNotes },
    deliverables: record.deliverables.map((item) => ({
      ...item,
      label: { ...item.label },
    })),
    roleFocalNote: { ...record.review.roleFocalNote },
  };
}

export function getSeedCanonicalProjects(): CanonicalProjectRecord[] {
  return STUDIO_DESK_PROJECTS.map(studioDeskProjectToCanonical);
}
