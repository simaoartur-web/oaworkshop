import type { ActivityDomain } from '../../data/editorialReportsTypes';
import type {
  AppLanguage,
  ProjectStatus,
  PublicationStatus,
} from '../../data/types';

export interface EditorialControlDictionary {
  common: {
    localSavedBadge: string;
    localPreviewBadge: string;
    allOption: string;
    resetFilters: string;
    closeDialog: string;
    openDossier: string;
    openDepartment: string;
    openMember: string;
    openReference: string;
  };
  publicationStatuses: Record<PublicationStatus, string>;
  publicationActions: Record<PublicationStatus, string>;
  projectStatuses: Record<ProjectStatus, string>;
  activityDomains: Record<ActivityDomain, string>;
  publications: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    demoBoundaryNotice: string;
    activeRolePrefix: string;
    filters: {
      searchLabel: string;
      searchPlaceholder: string;
      statusLabel: string;
      departmentLabel: string;
      projectLabel: string;
    };
    showingPrefix: string;
    card: {
      previewCta: string;
      noteLabel: string;
      notePlaceholder: string;
      lastDecisionLabel: string;
      noHistoryYet: string;
      historyCountLabel: (count: number) => string;
      archivedTag: string;
      actionsLabel: string;
    };
    emptyTitle: string;
    emptyBody: string;
    transitionAnnouncement: string;
  };
  preview: {
    code: string;
    title: string;
    warningBanner: string;
    langToggleAria: string;
    scaleLabel: string;
    areaLabel: string;
    datumLabel: string;
    studioBaseLabel: string;
    editorialNoteLabel: string;
    privateNotice: string;
  };
  activity: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    filters: {
      domainAria: string;
      searchLabel: string;
      searchPlaceholder: string;
      departmentLabel: string;
      memberLabel: string;
      projectLabel: string;
    };
    showingPrefix: string;
    eventsCountLabel: (count: number) => string;
    openPublicationsLink: string;
    emptyTitle: string;
    emptyBody: string;
  };
  reports: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    honestBanner: string;
    exportJsonCta: string;
    printCta: string;
    exportAnnouncement: string;
    totals: {
      projects: string;
      activeProjects: string;
      tasks: string;
      techRefs: string;
      editorialQueue: string;
      auditEvents: string;
    };
    sections: {
      lifecycleTitle: string;
      studioBaseTitle: string;
      departmentsTitle: string;
      editorialFunnelTitle: string;
    };
    studioBase: {
      membersLabel: string;
      projectsLabel: string;
      milestonesLabel: string;
      progressLabel: string;
    };
    table: {
      department: string;
      members: string;
      projects: string;
      tasks: string;
      techRefs: string;
      editorial: string;
    };
    viewProjectsLink: string;
    viewTasksLink: string;
    viewQueueLink: string;
  };
}

const pt: EditorialControlDictionary = {
  common: {
    localSavedBadge: 'Guardado neste navegador (demo)',
    localPreviewBadge: 'Pré-visualização local (demo)',
    allOption: 'Todos',
    resetFilters: 'Limpar filtros',
    closeDialog: 'Fechar diálogo',
    openDossier: 'Abrir dossier',
    openDepartment: 'Departamento',
    openMember: 'Colaborador',
    openReference: 'Abrir referência',
  },
  publicationStatuses: {
    private: 'Privado interno',
    requested: 'Pedido de publicação',
    approved: 'Aprovado internamente',
    'published-demo': 'Publicado (pré-visualização local)',
    rejected: 'Devolvido para revisão',
    unpublished: 'Retirado da pré-visualização',
  },
  publicationActions: {
    private: 'Voltar a Privado',
    requested: 'Pedir revisão editorial',
    approved: 'Aprovar editorialmente',
    'published-demo': 'Publicar (pré-visualização local)',
    rejected: 'Devolver para revisão',
    unpublished: 'Retirar pré-visualização',
  },
  projectStatuses: {
    concept: 'Conceito',
    design: 'Projecto',
    in_progress: 'Em curso',
    review: 'Em revisão',
    completed: 'Concluído',
    archived: 'Arquivado',
  },
  activityDomains: {
    project: 'Projectos',
    task: 'Tarefas',
    technical_library: 'Biblioteca Técnica',
    publication: 'Publicações',
  },
  publications: {
    pageTitle: 'Publicações — O+A Workspace',
    eyebrow: 'PRANCHA 08 · FILA EDITORIAL · MODO DEMO',
    heading: 'Fila Editorial & Pré-visualização',
    subtitle:
      'Governação editorial privada por omissão com revisão bilingue PT/EN e pré-visualização local de portfólio — sem ligação nem alteração ao website público oaworkshop.',
    demoBoundaryNotice:
      'Operação 100% demonstrativa neste navegador: os papéis alteram apenas a perspectiva de demonstração e nenhuma acção publica no site público real (oa-workshop.com).',
    activeRolePrefix: 'Papel demo activo',
    filters: {
      searchLabel: 'Pesquisar projectos na fila',
      searchPlaceholder: 'Código, título, disciplina ou nota editorial…',
      statusLabel: 'Estado editorial',
      departmentLabel: 'Departamento',
      projectLabel: 'Projecto',
    },
    showingPrefix: 'A mostrar',
    card: {
      previewCta: 'Pré-visualizar portfólio (local)',
      noteLabel: 'Nota editorial opcional (PT/EN)',
      notePlaceholder: 'Registar critério de curadoria ou observação de revisão…',
      lastDecisionLabel: 'Último registo editorial',
      noHistoryYet: 'Sem transições editoriais registadas (privado por omissão).',
      historyCountLabel: (count) =>
        count === 1 ? '1 registo' : `${count} registos`,
      archivedTag: 'Dossier arquivado',
      actionsLabel: 'Transições editoriais permitidas',
    },
    emptyTitle: 'Nenhum projecto corresponde aos filtros editoriais',
    emptyBody:
      'Ajuste o estado editorial, departamento, projecto ou termo de pesquisa.',
    transitionAnnouncement:
      'Estado editorial actualizado e registado localmente (demo).',
  },
  preview: {
    code: 'PRÉ-VISUALIZAÇÃO LOCAL (DEMO) · PORTFÓLIO O+A',
    title: 'Pré-visualização editorial local',
    warningBanner:
      'Pré-visualização local (demo): esta ficha simula a composição editorial do portfólio e nunca modifica o website público real oaworkshop.',
    langToggleAria: 'Idioma da pré-visualização local',
    scaleLabel: 'Escala',
    areaLabel: 'Área',
    datumLabel: 'Cota de referência',
    studioBaseLabel: 'Base do atelier',
    editorialNoteLabel: 'Nota editorial',
    privateNotice:
      'Estado actual: privado interno — não elegível para publicação externa.',
  },
  activity: {
    pageTitle: 'Actividade — O+A Workspace',
    eyebrow: 'PRANCHA 09 · ACTIVIDADE UNIFICADA · MODO DEMO',
    heading: 'Linha de Actividade do Atelier',
    subtitle:
      'Registo cronológico unificado e 100% derivado das revisões de projectos, tarefas, fichas da biblioteca técnica e decisões editoriais locais.',
    filters: {
      domainAria: 'Filtrar actividade por domínio',
      searchLabel: 'Pesquisar actividade',
      searchPlaceholder: 'Código, título, autor ou resumo…',
      departmentLabel: 'Departamento',
      memberLabel: 'Colaborador',
      projectLabel: 'Projecto',
    },
    showingPrefix: 'A mostrar',
    eventsCountLabel: (count) =>
      count === 1 ? '1 evento' : `${count} eventos`,
    openPublicationsLink: 'Fila editorial',
    emptyTitle: 'Nenhum evento corresponde aos filtros activos',
    emptyBody:
      'Limpe os filtros ou ajuste o domínio, departamento, colaborador ou projecto.',
  },
  reports: {
    pageTitle: 'Relatórios — O+A Workspace',
    eyebrow: 'PRANCHA 10 · RELATÓRIOS DERIVADOS · MODO DEMO',
    heading: 'Relatórios & Síntese Operacional',
    subtitle:
      'Indicadores 100% derivados dos repositórios locais do O+A Workspace — zero métricas inventadas, departamentos vazios apresentados honestamente a 0.',
    honestBanner:
      'Síntese demonstrativa local (mode: local-demo). A exportação JSON e a impressão utilizam apenas os dados guardados neste navegador.',
    exportJsonCta: 'Exportar JSON (demo)',
    printCta: 'Imprimir síntese',
    exportAnnouncement: 'Síntese JSON demonstrativa exportada localmente.',
    totals: {
      projects: 'Projectos totais',
      activeProjects: 'Activos',
      tasks: 'Tarefas activas',
      techRefs: 'Fichas técnicas',
      editorialQueue: 'Em revisão / pub. demo',
      auditEvents: 'Registos editoriais',
    },
    sections: {
      lifecycleTitle: 'Portfólio por Estado de Projecto',
      studioBaseTitle: 'Síntese por Base (Maputo · Milão)',
      departmentsTitle: 'Carga Operacional por Departamento (9)',
      editorialFunnelTitle: 'Funil Editorial (Privado por Omissão)',
    },
    studioBase: {
      membersLabel: 'Colaboradores',
      projectsLabel: 'Projectos activos',
      milestonesLabel: 'Marcos concluídos',
      progressLabel: 'Progresso médio de marcos',
    },
    table: {
      department: 'Departamento',
      members: 'Equipa',
      projects: 'Projectos',
      tasks: 'Tarefas (P/C/✓)',
      techRefs: 'Fichas Téc.',
      editorial: 'Editorial (Ped./Demo)',
    },
    viewProjectsLink: 'Ver projectos',
    viewTasksLink: 'Ver tarefas',
    viewQueueLink: 'Ver fila',
  },
};

const en: EditorialControlDictionary = {
  common: {
    localSavedBadge: 'Saved in this browser (demo)',
    localPreviewBadge: 'Local preview (demo)',
    allOption: 'All',
    resetFilters: 'Reset filters',
    closeDialog: 'Close dialog',
    openDossier: 'Open dossier',
    openDepartment: 'Department',
    openMember: 'Collaborator',
    openReference: 'Open reference',
  },
  publicationStatuses: {
    private: 'Private internal',
    requested: 'Publication requested',
    approved: 'Internally approved',
    'published-demo': 'Published (local preview)',
    rejected: 'Returned for revision',
    unpublished: 'Removed from preview',
  },
  publicationActions: {
    private: 'Return to Private',
    requested: 'Request editorial review',
    approved: 'Approve editorially',
    'published-demo': 'Publish (local preview)',
    rejected: 'Return for revision',
    unpublished: 'Unpublish preview',
  },
  projectStatuses: {
    concept: 'Concept',
    design: 'Design',
    in_progress: 'In progress',
    review: 'In review',
    completed: 'Completed',
    archived: 'Archived',
  },
  activityDomains: {
    project: 'Projects',
    task: 'Tasks',
    technical_library: 'Technical Library',
    publication: 'Publications',
  },
  publications: {
    pageTitle: 'Publications — O+A Workspace',
    eyebrow: 'PLATE 08 · EDITORIAL QUEUE · DEMO MODE',
    heading: 'Editorial Queue & Preview',
    subtitle:
      'Private-by-default editorial governance with bilingual PT/EN review and local portfolio preview — never connected to or modifying the real oaworkshop public website.',
    demoBoundaryNotice:
      '100% demonstrative operation in this browser: roles switch the demo perspective only and no action publishes to the live public website (oa-workshop.com).',
    activeRolePrefix: 'Active demo role',
    filters: {
      searchLabel: 'Search queued projects',
      searchPlaceholder: 'Code, title, discipline, or editorial note…',
      statusLabel: 'Editorial status',
      departmentLabel: 'Department',
      projectLabel: 'Project',
    },
    showingPrefix: 'Showing',
    card: {
      previewCta: 'Preview portfolio (local)',
      noteLabel: 'Optional editorial note (PT/EN)',
      notePlaceholder: 'Record curation rationale or review observation…',
      lastDecisionLabel: 'Latest editorial record',
      noHistoryYet: 'No editorial transitions recorded (private by default).',
      historyCountLabel: (count) =>
        count === 1 ? '1 record' : `${count} records`,
      archivedTag: 'Archived dossier',
      actionsLabel: 'Allowed editorial transitions',
    },
    emptyTitle: 'No projects match the editorial filters',
    emptyBody:
      'Adjust the editorial status, department, project, or search query.',
    transitionAnnouncement:
      'Editorial status updated and recorded locally (demo).',
  },
  preview: {
    code: 'LOCAL PREVIEW (DEMO) · O+A PORTFOLIO',
    title: 'Local editorial preview',
    warningBanner:
      'Local preview (demo): this sheet simulates the portfolio editorial layout and never modifies the real public website oaworkshop.',
    langToggleAria: 'Local preview language',
    scaleLabel: 'Scale',
    areaLabel: 'Area',
    datumLabel: 'Elevation datum',
    studioBaseLabel: 'Studio base',
    editorialNoteLabel: 'Editorial note',
    privateNotice:
      'Current status: private internal — not eligible for external publication.',
  },
  activity: {
    pageTitle: 'Activity — O+A Workspace',
    eyebrow: 'PLATE 09 · UNIFIED ACTIVITY · DEMO MODE',
    heading: 'Studio Activity Timeline',
    subtitle:
      'Chronological ledger 100% derived from project revisions, tasks, technical library sheets, and local editorial decisions.',
    filters: {
      domainAria: 'Filter activity by domain',
      searchLabel: 'Search activity',
      searchPlaceholder: 'Code, title, actor, or summary…',
      departmentLabel: 'Department',
      memberLabel: 'Collaborator',
      projectLabel: 'Project',
    },
    showingPrefix: 'Showing',
    eventsCountLabel: (count) =>
      count === 1 ? '1 event' : `${count} events`,
    openPublicationsLink: 'Editorial queue',
    emptyTitle: 'No events match the active filters',
    emptyBody:
      'Clear filters or adjust domain, department, collaborator, or project.',
  },
  reports: {
    pageTitle: 'Reports — O+A Workspace',
    eyebrow: 'PLATE 10 · DERIVED REPORTS · DEMO MODE',
    heading: 'Operational Reports & Summary',
    subtitle:
      'Indicators 100% derived from local O+A Workspace repositories — zero invented metrics, empty departments honestly reported as 0.',
    honestBanner:
      'Local demonstrative summary (mode: local-demo). JSON export and printing use only data stored in this browser.',
    exportJsonCta: 'Export JSON (demo)',
    printCta: 'Print summary',
    exportAnnouncement: 'Demonstrative JSON report exported locally.',
    totals: {
      projects: 'Total projects',
      activeProjects: 'Active',
      tasks: 'Active tasks',
      techRefs: 'Technical refs',
      editorialQueue: 'In review / demo pub.',
      auditEvents: 'Editorial records',
    },
    sections: {
      lifecycleTitle: 'Portfolio by Project Status',
      studioBaseTitle: 'Studio Base Summary (Maputo · Milan)',
      departmentsTitle: 'Operational Load by Department (9)',
      editorialFunnelTitle: 'Editorial Funnel (Private by Default)',
    },
    studioBase: {
      membersLabel: 'Collaborators',
      projectsLabel: 'Active projects',
      milestonesLabel: 'Milestones completed',
      progressLabel: 'Average milestone progress',
    },
    table: {
      department: 'Department',
      members: 'Team',
      projects: 'Projects',
      tasks: 'Tasks (P/IP/✓)',
      techRefs: 'Tech Refs',
      editorial: 'Editorial (Req./Demo)',
    },
    viewProjectsLink: 'View projects',
    viewTasksLink: 'View tasks',
    viewQueueLink: 'View queue',
  },
};

export const EDITORIAL_CONTROL_I18N: Record<
  AppLanguage,
  EditorialControlDictionary
> = {
  pt,
  en,
};
