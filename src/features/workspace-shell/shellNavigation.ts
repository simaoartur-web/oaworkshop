import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  Compass,
  FileText,
  FolderKanban,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { LocalizedText } from '../../data/types';

export type WorkspaceNavGroupId = 'atelier' | 'structure' | 'control';

export type WorkspaceRouteId =
  | 'desk'
  | 'projects'
  | 'tasks'
  | 'calendar'
  | 'departments'
  | 'team'
  | 'library'
  | 'publications'
  | 'activity'
  | 'reports'
  | 'settings';

export type ModulePhaseStatus = 'active-slot' | 'active-shell' | 'planned';

export interface WorkspaceNavItem {
  id: WorkspaceRouteId;
  plateNumber: string;
  path: string;
  group: WorkspaceNavGroupId;
  status: ModulePhaseStatus;
  targetPhase: LocalizedText;
  shortTag: string;
  icon: LucideIcon;
  label: LocalizedText;
  description: LocalizedText;
}

export const WORKSPACE_NAV_GROUPS: WorkspaceNavGroupId[] = [
  'atelier',
  'structure',
  'control',
];

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  {
    id: 'desk',
    plateNumber: '01',
    path: '/workspace',
    group: 'atelier',
    status: 'active-slot',
    targetPhase: { pt: 'Fase 02 (Argon B)', en: 'Phase 02 (Argon B)' },
    shortTag: 'DESK',
    icon: Compass,
    label: { pt: 'Studio Desk', en: 'Studio Desk' },
    description: {
      pt: 'Mesa principal de trabalho do colaborador e síntese diária.',
      en: 'Primary studio desk and daily collaborator overview.',
    },
  },
  {
    id: 'projects',
    plateNumber: '02',
    path: '/workspace/projects',
    group: 'atelier',
    status: 'planned',
    targetPhase: { pt: 'Fases 03–04', en: 'Phases 03–04' },
    shortTag: 'F03',
    icon: FolderKanban,
    label: { pt: 'Projectos', en: 'Projects' },
    description: {
      pt: 'Arquivo técnico de projectos, dossiers vivos e modelos Web 3D (.glb).',
      en: 'Technical project archive, live dossiers, and Web 3D (.glb) models.',
    },
  },
  {
    id: 'tasks',
    plateNumber: '03',
    path: '/workspace/tasks',
    group: 'atelier',
    status: 'planned',
    targetPhase: { pt: 'Fase 05', en: 'Phase 05' },
    shortTag: 'F05',
    icon: CheckSquare,
    label: { pt: 'Tarefas', en: 'Tasks' },
    description: {
      pt: 'Lista técnica e quadro acessível de entregáveis por departamento.',
      en: 'Technical checklist and accessible deliverable board by department.',
    },
  },
  {
    id: 'calendar',
    plateNumber: '04',
    path: '/workspace/calendar',
    group: 'atelier',
    status: 'planned',
    targetPhase: { pt: 'Fase 05', en: 'Phase 05' },
    shortTag: 'F05',
    icon: Calendar,
    label: { pt: 'Calendário', en: 'Calendar' },
    description: {
      pt: 'Marcos de entrega, revisões de corte e coordenação Milão–Maputo.',
      en: 'Milestone dates, design reviews, and Milan–Maputo coordination.',
    },
  },
  {
    id: 'departments',
    plateNumber: '05',
    path: '/workspace/departments',
    group: 'structure',
    status: 'planned',
    targetPhase: { pt: 'Fase 05', en: 'Phase 05' },
    shortTag: 'F05',
    icon: Building2,
    label: { pt: 'Departamentos', en: 'Departments' },
    description: {
      pt: 'Disciplinas internas, frentes técnicas e frentes de investigação.',
      en: 'Internal disciplines, technical tracks, and research units.',
    },
  },
  {
    id: 'team',
    plateNumber: '06',
    path: '/workspace/team',
    group: 'structure',
    status: 'planned',
    targetPhase: { pt: 'Fase 05', en: 'Phase 05' },
    shortTag: 'F05',
    icon: Users,
    label: { pt: 'Equipa', en: 'Team' },
    description: {
      pt: 'Directório demonstrativo de colaboradores fictícios entre Maputo e Milão.',
      en: 'Demonstrative directory of fictive studio profiles across Maputo and Milan.',
    },
  },
  {
    id: 'library',
    plateNumber: '07',
    path: '/workspace/library',
    group: 'structure',
    status: 'planned',
    targetPhase: { pt: 'Fase 05', en: 'Phase 05' },
    shortTag: 'F05',
    icon: BookOpen,
    label: { pt: 'Biblioteca', en: 'Library' },
    description: {
      pt: 'Caderno de matérias, sistemas construtivos e referências de clima.',
      en: 'Materiality index, constructive details, and climate studies.',
    },
  },
  {
    id: 'publications',
    plateNumber: '08',
    path: '/workspace/publications',
    group: 'control',
    status: 'planned',
    targetPhase: { pt: 'Fase 06', en: 'Phase 06' },
    shortTag: 'F06',
    icon: FileText,
    label: { pt: 'Publicações', en: 'Publications' },
    description: {
      pt: 'Fila editorial privada por omissão com revisão PT/EN e pré-visualização local.',
      en: 'Private-by-default editorial queue with PT/EN review and local preview.',
    },
  },
  {
    id: 'activity',
    plateNumber: '09',
    path: '/workspace/activity',
    group: 'control',
    status: 'planned',
    targetPhase: { pt: 'Fases 05–06', en: 'Phases 05–06' },
    shortTag: 'F05',
    icon: Activity,
    label: { pt: 'Actividade', en: 'Activity' },
    description: {
      pt: 'Histórico demonstrativo de revisões técnicas e decisões internas.',
      en: 'Demonstrative timeline of technical reviews and studio decisions.',
    },
  },
  {
    id: 'reports',
    plateNumber: '10',
    path: '/workspace/reports',
    group: 'control',
    status: 'planned',
    targetPhase: { pt: 'Fase 06', en: 'Phase 06' },
    shortTag: 'F06',
    icon: BarChart3,
    label: { pt: 'Relatórios', en: 'Reports' },
    description: {
      pt: 'Sínteses operacionais e indicadores demonstrativos de estado por fase.',
      en: 'Operational summaries and illustrative stage progress overviews.',
    },
  },
  {
    id: 'settings',
    plateNumber: '11',
    path: '/workspace/settings',
    group: 'control',
    status: 'active-shell',
    targetPhase: { pt: 'Fase 02A', en: 'Phase 02A' },
    shortTag: 'CFG',
    icon: SlidersHorizontal,
    label: { pt: 'Definições', en: 'Settings' },
    description: {
      pt: 'Preferências locais da sessão demo, idioma, movimento reduzido e prancha lateral.',
      en: 'Local demo session preferences, language, reduced motion, and rail state.',
    },
  },
];

export function isNavItemActive(pathname: string, item: WorkspaceNavItem): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (item.path === '/workspace') {
    return normalized === '/workspace';
  }
  return normalized === item.path || normalized.startsWith(`${item.path}/`);
}

export function resolveActiveNavItem(pathname: string): WorkspaceNavItem | undefined {
  return WORKSPACE_NAV_ITEMS.find((item) => isNavItemActive(pathname, item));
}
