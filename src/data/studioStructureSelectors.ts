import { DEMO_USERS, DEPARTMENTS } from './fixtures';
import type { CanonicalTaskRecord } from './operationsTypes';
import type {
  DepartmentOperationalProfile,
  PublicTeamMember,
  TeamMemberOperationalProfile,
  TechnicalReferenceRecord,
} from './studioStructureTypes';
import type { StudioDeskProject } from './studioDeskTypes';
import type { DemoUser, DepartmentId } from './types';

export const CANONICAL_DEPARTMENT_ORDER: readonly DepartmentId[] = Object.freeze([
  'direction',
  'architecture',
  'urbanism',
  'interiors',
  'research',
  'project_management',
  'communications',
  'finance',
  'hr',
]);

/**
 * Strips `demoAccessKey` from a `DemoUser` record so collaborator profiles
 * exposed in Departments and Team directories never leak access keys.
 */
export function toPublicTeamMember(user: DemoUser): PublicTeamMember {
  return {
    id: user.id,
    code: user.code,
    name: user.name,
    initials: user.initials,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    studioBase: user.studioBase,
    roleLabel: user.roleLabel,
    scopeSummary: user.scopeSummary,
    welcomePriorities: user.welcomePriorities,
  };
}

/**
 * Pure derived selector returning operational profiles for all 9 canonical departments
 * in `DEPARTMENTS` order. Counts are 100% derived — departments without seed records
 * report `0` honestly with zero invented metrics.
 */
export function buildDepartmentProfiles(
  projects: readonly StudioDeskProject[],
  tasks: readonly CanonicalTaskRecord[],
  techRefs: readonly TechnicalReferenceRecord[],
): DepartmentOperationalProfile[] {
  const publicMembers = DEMO_USERS.map(toPublicTeamMember);

  return CANONICAL_DEPARTMENT_ORDER.map((departmentId) => {
    const department = DEPARTMENTS[departmentId];
    const members = publicMembers.filter(
      (member) => member.departmentId === departmentId,
    );
    const deptProjects = projects.filter(
      (project) => project.departmentId === departmentId,
    );
    let activeProjectsCount = 0;
    let archivedProjectsCount = 0;
    for (const project of deptProjects) {
      if (project.projectStatus === 'archived') {
        archivedProjectsCount += 1;
      } else {
        activeProjectsCount += 1;
      }
    }

    const deptTasks = tasks.filter(
      (task) => !task.archived && task.departmentId === departmentId,
    );
    let pendingTasksCount = 0;
    let inProgressTasksCount = 0;
    let completedTasksCount = 0;
    for (const task of deptTasks) {
      if (task.status === 'pending') {
        pendingTasksCount += 1;
      } else if (task.status === 'in_progress') {
        inProgressTasksCount += 1;
      } else if (task.status === 'completed') {
        completedTasksCount += 1;
      }
    }

    const technicalReferences = techRefs.filter(
      (ref) => ref.departmentId === departmentId,
    );

    return {
      department,
      members,
      projects: deptProjects,
      activeProjectsCount,
      archivedProjectsCount,
      tasks: deptTasks,
      pendingTasksCount,
      inProgressTasksCount,
      completedTasksCount,
      technicalReferences,
    };
  });
}

/**
 * Pure derived selector returning operational profiles for all 6 demonstrative
 * collaborators in `DEMO_USERS` without exposing `demoAccessKey`.
 * Clearly separates led projects (`leadUserId`), direct contributor projects
 * (`contributorUserIds`), and role-matched projects (`assignedRoles`).
 */
export function buildTeamMemberProfiles(
  projects: readonly StudioDeskProject[],
  tasks: readonly CanonicalTaskRecord[],
): TeamMemberOperationalProfile[] {
  return DEMO_USERS.map((rawUser) => {
    const user = toPublicTeamMember(rawUser);
    const department = DEPARTMENTS[user.departmentId];

    const ledProjects: StudioDeskProject[] = [];
    const contributedProjects: StudioDeskProject[] = [];
    const roleMatchedProjects: StudioDeskProject[] = [];
    const allRelatedProjects: StudioDeskProject[] = [];

    for (const project of projects) {
      const isLead = project.leadUserId === user.id;
      const isContributor =
        !isLead && project.contributorUserIds.includes(user.id);
      const isRoleMatched =
        !isLead &&
        !isContributor &&
        project.assignedRoles.includes(user.role);

      if (isLead) {
        ledProjects.push(project);
        allRelatedProjects.push(project);
      } else if (isContributor) {
        contributedProjects.push(project);
        allRelatedProjects.push(project);
      } else if (isRoleMatched) {
        roleMatchedProjects.push(project);
        allRelatedProjects.push(project);
      }
    }

    const assignedTasks = tasks.filter(
      (task) => !task.archived && task.assigneeUserId === user.id,
    );
    let openTasksCount = 0;
    let completedTasksCount = 0;
    for (const task of assignedTasks) {
      if (task.status === 'completed') {
        completedTasksCount += 1;
      } else {
        openTasksCount += 1;
      }
    }

    return {
      user,
      department,
      ledProjects,
      contributedProjects,
      roleMatchedProjects,
      allRelatedProjects,
      assignedTasks,
      openTasksCount,
      completedTasksCount,
    };
  });
}
