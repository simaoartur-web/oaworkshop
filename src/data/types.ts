export type AppLanguage = 'pt' | 'en';

export type Role =
  | 'director'
  | 'project_manager'
  | 'architect'
  | 'department_lead'
  | 'communications'
  | 'staff';

export type DepartmentId =
  | 'direction'
  | 'architecture'
  | 'urbanism'
  | 'interiors'
  | 'research'
  | 'project_management'
  | 'communications'
  | 'finance'
  | 'hr';

export type ProjectStatus =
  | 'concept'
  | 'design'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'archived';

export type PublicationStatus =
  | 'private'
  | 'requested'
  | 'approved'
  | 'published-demo'
  | 'rejected'
  | 'unpublished';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface Department {
  id: DepartmentId;
  code: string;
  name: LocalizedText;
  focus: LocalizedText;
}

export interface RoleBriefItem {
  id: string;
  code: string;
  category: LocalizedText;
  summary: LocalizedText;
  meta: LocalizedText;
}

export interface DemoUser {
  id: string;
  code: string;
  name: string;
  initials: string;
  email: string;
  /** Ephemeral in-memory validation code for demo login; NEVER persisted to storage. */
  demoAccessKey: string;
  role: Role;
  departmentId: DepartmentId;
  studioBase: 'Maputo' | 'Milão';
  roleLabel: LocalizedText;
  scopeSummary: LocalizedText;
  welcomePriorities: RoleBriefItem[];
}

export interface DemoSession {
  userId: string;
  role: Role;
  authenticatedAt: string;
  mode: 'local-demo';
}

export interface UserPreferences {
  language: AppLanguage;
  skipWelcomeOnLogin: boolean;
  reduceMotionOverride: 'system' | 'reduce';
  updatedAt: string;
}

export interface FeaturedStudyProject {
  id: string;
  code: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  discipline: LocalizedText;
  location: LocalizedText;
  year: number;
  scale: string;
  areaSqm: string;
  elevationDatum: string;
  projectStatus: ProjectStatus;
  publicationStatus: PublicationStatus;
  leadDepartmentId: DepartmentId;
  maquetteImageSrc: string;
  maquetteImageAlt: LocalizedText;
  editorialNote: LocalizedText;
}
