import type { CanonicalTaskRecord } from './operationsTypes';
import type { StudioDeskProject } from './studioDeskTypes';
import type {
  DemoUser,
  Department,
  DepartmentId,
  LocalizedText,
} from './types';

export type TechnicalLibraryCategory =
  | 'material'
  | 'constructive_system'
  | 'technical_study';

export type TechnicalReferenceOrigin = 'seed-fixture' | 'local-created';

/**
 * Public collaborator profile stripped of `demoAccessKey` for safe consumption
 * across Departments, Team, and operational views.
 */
export type PublicTeamMember = Omit<DemoUser, 'demoAccessKey'>;

export interface TechnicalReferenceRecord {
  id: string;
  code: string;
  category: TechnicalLibraryCategory;
  title: LocalizedText;
  summary: LocalizedText;
  technicalSpecs: LocalizedText;
  originRegion: LocalizedText;
  standardsTag: string;
  departmentId: DepartmentId;
  relatedProjectIds: string[];
  referenceCitation: LocalizedText;
  origin: TechnicalReferenceOrigin;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicalReferenceInput {
  code?: string;
  category: TechnicalLibraryCategory;
  titlePt: string;
  titleEn?: string;
  summaryPt: string;
  summaryEn?: string;
  technicalSpecsPt: string;
  technicalSpecsEn?: string;
  originRegionPt: string;
  originRegionEn?: string;
  standardsTag: string;
  departmentId: DepartmentId;
  relatedProjectIds?: string[];
  referenceCitationPt: string;
  referenceCitationEn?: string;
}

export interface TechnicalLibrarySnapshot {
  version: number;
  allReferences: readonly TechnicalReferenceRecord[];
  lookupMap: ReadonlyMap<string, TechnicalReferenceRecord>;
}

export interface DepartmentOperationalProfile {
  department: Department;
  members: readonly PublicTeamMember[];
  projects: readonly StudioDeskProject[];
  activeProjectsCount: number;
  archivedProjectsCount: number;
  tasks: readonly CanonicalTaskRecord[];
  pendingTasksCount: number;
  inProgressTasksCount: number;
  completedTasksCount: number;
  technicalReferences: readonly TechnicalReferenceRecord[];
}

export interface TeamMemberOperationalProfile {
  user: PublicTeamMember;
  department: Department;
  ledProjects: readonly StudioDeskProject[];
  contributedProjects: readonly StudioDeskProject[];
  roleMatchedProjects: readonly StudioDeskProject[];
  allRelatedProjects: readonly StudioDeskProject[];
  assignedTasks: readonly CanonicalTaskRecord[];
  openTasksCount: number;
  completedTasksCount: number;
}
