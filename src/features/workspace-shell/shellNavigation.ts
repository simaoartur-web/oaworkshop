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
    targetPhase: { pt: 'Disponível agora (Fase 02)', en: 'Available now (Phase 02)' },
    shortTag: 'DESK',
    icon: Compass,
    label: { pt: 'Studio Desk', en: 'Studio Desk' },
    description: {
      pt: 'Mesa principal de trabalho do colaborador e síntese operacional diária.',
      en: 'Primary studio desk and daily collaborator operational overview.',
    },
  },
  {
    id: 'projects',
    plateNumber: '02',
    path: '/workspace/projects',
    group: 'atelier',
    status: 'active-shell',
    targetPhase: {
      pt: 'Disponível agora (Fases 02–03)',
      en: 'Available now (Phases 02–03)',
    },
    shortTag: 'PRJ',
    icon: FolderKanban,
    label: { pt: 'Projectos', en: 'Projects' },
    description: {
      pt: 'Catálogo técnico de projectos, criação local e dossiers vivos do atelier.',
      en: 'Technical project catalog, local creation, and live studio dossiers.',
    },
  },
  {
    id: 'settings',
    plateNumber: '11',
    path: '/workspace/settings',
    group: 'atelier',
    status: 'active-shell',
    targetPhase: { pt: 'Disponível agora (Fase 02)', en: 'Available now (Phase 02)' },
    shortTag: 'CFG',
    icon: SlidersHorizontal,
    label: { pt: 'Definições', en: 'Settings' },
    description: {
      pt: 'Preferências locais da sessão demo, idioma, movimento reduzido e prancha lateral.',
      en: 'Local demo session preferences, language, reduced motion, and rail state.',
    },
  },
  {
    id: 'tasks',
    plateNumber: '03',
    path: '/workspace/tasks',
    group: 'structure',
    status: 'planned',
    targetPhase: { pt: 'Fase 05 (Em breve)', en: 'Phase 05 (Coming soon)' },
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
    group: 'structure',
    status: 'planned',
    targetPhase: { pt: 'Fase 05 (Em breve)', en: 'Phase 05 (Coming soon)' },
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
    targetPhase: { pt: 'Fase 05 (Em breve)', en: 'Phase 05 (Coming soon)' },
    shortTag: 'F05',
    icon: Building2,
    label: { pt: 'Departamentos', en: 'Departments' },
    description: {
      pt: 'Disciplinas internas, frentes técnicas e unidades de investigação.',
      en: 'Internal disciplines, technical tracks, and research units.',
    },
  },
  {
    id: 'team',
    plateNumber: '06',
    path: '/workspace/team',
    group: 'structure',
    status: 'planned',
    targetPhase: { pt: 'Fase 05 (Em breve)', en: 'Phase 05 (Coming soon)' },
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
    targetPhase: { pt: 'Fase 05 (Em breve)', en: 'Phase 05 (Coming soon)' },
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
    targetPhase: { pt: 'Fase 06 (Em breve)', en: 'Phase 06 (Coming soon)' },
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
    targetPhase: { pt: 'Fases 05–06 (Em breve)', en: 'Phases 05–06 (Coming soon)' },
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
    targetPhase: { pt: 'Fase 06 (Em breve)', en: 'Phase 06 (Coming soon)' },
    shortTag: 'F06',
    icon: BarChart3,
    label: { pt: 'Relatórios', en: 'Reports' },
    description: {
      pt: 'Sínteses operacionais e indicadores demonstrativos de estado por fase.',
      en: 'Operational summaries and illustrative stage progress overviews.',
    },
  },
];

export function isNavItemAvailable(item: WorkspaceNavItem): boolean {
  return item.status !== 'planned';
}

export function isNavItemActive(pathname: string, item: WorkspaceNavItem): boolean {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (item.path === '/workspace') {
    return cleanPath === '/workspace';
  }
  return cleanPath === item.path || cleanPath.startsWith(`${item.path}/`);
}

export function resolveActiveNavItem(pathname: string): WorkspaceNavItem | undefined {
  const cleanPath = pathname.split('?')[0];
  return WORKSPACE_NAV_ITEMS.find((item) => isNavItemActive(cleanPath, item));
}
