import type { TechnicalLibraryCategory } from '../../data/studioStructureTypes';
import type { AppLanguage, Role } from '../../data/types';

export interface StudioStructureDictionary {
  common: {
    localSavedBadge: string;
    demoDirectoryNotice: string;
    allOption: string;
    resetFilters: string;
    cancel: string;
    closeDialog: string;
    openDossier: string;
    openTask: string;
    openDepartment: string;
    openLibraryFiltered: string;
    openMemberProfile: string;
    clearHighlightAria: string;
  };
  roles: Record<Role, string>;
  categories: Record<TechnicalLibraryCategory, string>;
  departments: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    directoryHeading: string;
    counters: {
      members: string;
      activeProjects: string;
      archivedProjects: string;
      openTasks: string;
      completedTasks: string;
      technicalRefs: string;
    };
    sections: {
      membersTitle: string;
      projectsTitle: string;
      tasksTitle: string;
      refsTitle: string;
    };
    empty: {
      members: string;
      projects: string;
      tasks: string;
      refs: string;
    };
    zeroActivityNote: string;
  };
  team: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    honestBanner: string;
    filters: {
      searchLabel: string;
      searchPlaceholder: string;
      roleLabel: string;
      departmentLabel: string;
      studioBaseLabel: string;
      studioBases: {
        all: string;
        Maputo: string;
        Milão: string;
      };
    };
    showingPrefix: string;
    profile: {
      eyebrow: string;
      departmentLabel: string;
      baseLabel: string;
      emailLabel: string;
      scopeLabel: string;
      ledProjectsTitle: string;
      contributedProjectsTitle: string;
      assignedTasksTitle: string;
      openTasksLabel: string;
      completedTasksLabel: string;
      noLedProjects: string;
      noContributedProjects: string;
      noAssignedTasks: string;
    };
    emptyFilterTitle: string;
    emptyFilterBody: string;
  };
  library: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    distinctNotice: string;
    newReferenceCta: string;
    filters: {
      categoryAria: string;
      searchLabel: string;
      searchPlaceholder: string;
      departmentLabel: string;
      projectLabel: string;
    };
    showingPrefix: string;
    card: {
      specsLabel: string;
      originLabel: string;
      standardsLabel: string;
      citationLabel: string;
      relatedProjectsLabel: string;
      noRelatedProjects: string;
      localCreatedBadge: string;
      seedReferenceBadge: string;
    };
    spotlight: {
      tag: string;
      invalidNotice: string;
    };
    emptyTitle: string;
    emptyBody: string;
    createdAnnouncement: string;
  };
  dialog: {
    code: string;
    title: string;
    honestNotice: string;
    fieldCategory: string;
    fieldCode: string;
    fieldCodePlaceholder: string;
    fieldTitle: string;
    fieldTitlePlaceholder: string;
    fieldSummary: string;
    fieldSummaryPlaceholder: string;
    fieldSpecs: string;
    fieldSpecsPlaceholder: string;
    fieldOrigin: string;
    fieldOriginPlaceholder: string;
    fieldStandards: string;
    fieldStandardsPlaceholder: string;
    fieldDepartment: string;
    fieldRelatedProject: string;
    noLinkedProjectOption: string;
    fieldCitation: string;
    fieldCitationPlaceholder: string;
    submitCta: string;
    validationTitle: string;
    validationSummary: string;
    validationSpecs: string;
    validationOrigin: string;
    validationStandards: string;
    validationCitation: string;
    errorFallback: string;
  };
}

const pt: StudioStructureDictionary = {
  common: {
    localSavedBadge: 'Guardado neste navegador (demo)',
    demoDirectoryNotice:
      'Directório demonstrativo local com perfis fictícios (sem autenticação real nem servidor).',
    allOption: 'Todos',
    resetFilters: 'Limpar filtros',
    cancel: 'Cancelar',
    closeDialog: 'Fechar diálogo',
    openDossier: 'Abrir dossier',
    openTask: 'Abrir tarefa',
    openDepartment: 'Ver departamento',
    openLibraryFiltered: 'Ver na Biblioteca Técnica',
    openMemberProfile: 'Ver perfil',
    clearHighlightAria: 'Limpar destaque',
  },
  roles: {
    director: 'Direcção Conjunta',
    architect: 'Arquitectura & Urbanismo',
    project_manager: 'Gestão de Projectos',
    department_lead: 'Coordenação Departamental',
    communications: 'Comunicação & Editorial',
    staff: 'Equipa Técnica & Investigação',
  },
  categories: {
    material: 'Matéria & Acabamento',
    constructive_system: 'Sistema Construtivo',
    technical_study: 'Estudo Técnico & Clima',
  },
  departments: {
    pageTitle: 'Departamentos — O+A Workspace',
    eyebrow: 'FOLHA 05 · DEPARTAMENTOS · MODO DEMO',
    heading: 'Departamentos',
    subtitle:
      'Estrutura disciplinar canónica do atelier (9 frentes entre Maputo e Milão) com contadores 100% derivados dos projectos, tarefas e fichas técnicas activas.',
    directoryHeading: 'Unidades disciplinares (9)',
    counters: {
      members: 'Colaboradores',
      activeProjects: 'Projectos activos',
      archivedProjects: 'Arquivados',
      openTasks: 'Tarefas abertas',
      completedTasks: 'Concluídas',
      technicalRefs: 'Fichas técnicas',
    },
    sections: {
      membersTitle: 'Equipa associada',
      projectsTitle: 'Projectos do departamento',
      tasksTitle: 'Tarefas operacionais',
      refsTitle: 'Referências da Biblioteca Técnica',
    },
    empty: {
      members: 'Sem colaboradores demonstrativos atribuídos nesta fase.',
      projects: 'Sem projectos associados nos dados demonstrativos actuais.',
      tasks: 'Sem tarefas operacionais atribuídas a este departamento.',
      refs: 'Sem fichas técnicas associadas a este departamento.',
    },
    zeroActivityNote:
      'Departamento sem registos demonstrativos seed nesta fase — contadores apresentados honestamente a 0.',
  },
  team: {
    pageTitle: 'Equipa — O+A Workspace',
    eyebrow: 'FOLHA 06 · EQUIPA · MODO DEMO',
    heading: 'Equipa do Atelier',
    subtitle:
      'Perfis operacionais fictícios do eixo Maputo–Milão ligados aos projectos e tarefas canónicas do workspace.',
    honestBanner:
      'Directório demonstrativo local com 6 perfis fictícios — independente de autenticação real e sem credenciais expostas.',
    filters: {
      searchLabel: 'Pesquisar colaborador',
      searchPlaceholder: 'Nome, código, função ou departamento…',
      roleLabel: 'Função',
      departmentLabel: 'Departamento',
      studioBaseLabel: 'Base de Estúdio',
      studioBases: {
        all: 'Todas as bases',
        Maputo: 'Maputo',
        Milão: 'Milão',
      },
    },
    showingPrefix: 'A mostrar',
    profile: {
      eyebrow: 'FICHA DE COLABORADOR (DEMO)',
      departmentLabel: 'Departamento',
      baseLabel: 'Base de estúdio',
      emailLabel: 'Correio demo',
      scopeLabel: 'Âmbito operacional',
      ledProjectsTitle: 'Projectos liderados',
      contributedProjectsTitle: 'Contribuições em projectos',
      assignedTasksTitle: 'Tarefas atribuídas',
      openTasksLabel: 'Abertas',
      completedTasksLabel: 'Concluídas',
      noLedProjects: 'Sem projectos liderados directamente nos dados actuais.',
      noContributedProjects: 'Sem contribuições secundárias registadas.',
      noAssignedTasks: 'Sem tarefas atribuídas directamente.',
    },
    emptyFilterTitle: 'Nenhum colaborador corresponde aos filtros activos',
    emptyFilterBody:
      'Ajuste a função, departamento, base de estúdio ou termo de pesquisa.',
  },
  library: {
    pageTitle: 'Biblioteca Técnica — O+A Workspace',
    eyebrow: 'FOLHA 07 · BIBLIOTECA TÉCNICA · MODO DEMO',
    heading: 'Biblioteca Técnica',
    subtitle:
      'Caderno de matérias, sistemas construtivos e estudos climáticos do atelier — módulo técnico autónomo e distinto do catálogo de projectos.',
    distinctNotice:
      'Indexação apenas de metadados e especificações técnicas (sem upload binário nem armazenamento remoto).',
    newReferenceCta: 'Registar referência técnica (demo)',
    filters: {
      categoryAria: 'Filtrar por categoria técnica',
      searchLabel: 'Pesquisar fichas técnicas',
      searchPlaceholder: 'Código, matéria, norma ou especificação…',
      departmentLabel: 'Departamento',
      projectLabel: 'Projecto associado',
    },
    showingPrefix: 'A mostrar',
    card: {
      specsLabel: 'Especificação técnica',
      originLabel: 'Origem / Clima',
      standardsLabel: 'Norma / Referência',
      citationLabel: 'Citação interna',
      relatedProjectsLabel: 'Projectos associados',
      noRelatedProjects: 'Referência transversal sem projecto específico.',
      localCreatedBadge: 'Registo local (demo)',
      seedReferenceBadge: 'Catálogo base (demo)',
    },
    spotlight: {
      tag: 'FICHA TÉCNICA EM DESTAQUE · LINK DIRECTO',
      invalidNotice:
        'A referência técnica indicada no URL não foi encontrada nesta demonstração',
    },
    emptyTitle: 'Nenhuma ficha técnica corresponde aos filtros activos',
    emptyBody:
      'Limpe os filtros ou registe uma nova ficha de metadados técnicos neste navegador.',
    createdAnnouncement:
      'Nova referência técnica registada neste navegador (demo).',
  },
  dialog: {
    code: 'BIB-07 · NOVA REFERÊNCIA TÉCNICA (DEMO)',
    title: 'Registar referência técnica (somente metadados)',
    honestNotice:
      'Registo exclusivamente textual de metadados técnicos guardado neste navegador (localStorage). Sem upload de ficheiros nem envio a servidor.',
    fieldCategory: 'Categoria técnica',
    fieldCode: 'Código (opcional)',
    fieldCodePlaceholder: 'Ex.: MAT-010 (gerado se vazio)',
    fieldTitle: 'Título da ficha técnica',
    fieldTitlePlaceholder: 'Ex.: Argamassa de Cal Hidráulica Natural NHL 3.5',
    fieldSummary: 'Resumo operacional',
    fieldSummaryPlaceholder: 'Aplicação arquitectónica e desempenho esperado…',
    fieldSpecs: 'Especificações técnicas',
    fieldSpecsPlaceholder: 'Dosagem, espessura, classe de exposição ou desempenho…',
    fieldOrigin: 'Região / Origem climática',
    fieldOriginPlaceholder: 'Ex.: Maputo / Clima costeiro húmido',
    fieldStandards: 'Normas / Etiqueta técnica',
    fieldStandardsPlaceholder: 'Ex.: EN 459-1 · NP EN 998-1',
    fieldDepartment: 'Departamento responsável',
    fieldRelatedProject: 'Projecto associado (opcional)',
    noLinkedProjectOption: 'Sem projecto específico',
    fieldCitation: 'Citação / Fonte documental',
    fieldCitationPlaceholder: 'Ex.: Caderno de Matérias O+A · Prateleira M-10',
    submitCta: 'Guardar referência técnica',
    validationTitle: 'Indique o título da ficha técnica.',
    validationSummary: 'Indique o resumo operacional da referência.',
    validationSpecs: 'Indique as especificações técnicas.',
    validationOrigin: 'Indique a região ou origem climática.',
    validationStandards: 'Indique a norma ou etiqueta técnica.',
    validationCitation: 'Indique a citação ou fonte documental.',
    errorFallback: 'Não foi possível guardar a referência técnica neste navegador.',
  },
};

const en: StudioStructureDictionary = {
  common: {
    localSavedBadge: 'Saved in this browser (demo)',
    demoDirectoryNotice:
      'Local demonstrative directory with fictive studio profiles (no real authentication or server).',
    allOption: 'All',
    resetFilters: 'Reset filters',
    cancel: 'Cancel',
    closeDialog: 'Close dialog',
    openDossier: 'Open dossier',
    openTask: 'Open task',
    openDepartment: 'View department',
    openLibraryFiltered: 'View in Technical Library',
    openMemberProfile: 'View profile',
    clearHighlightAria: 'Clear highlight',
  },
  roles: {
    director: 'Joint Direction',
    architect: 'Architecture & Urbanism',
    project_manager: 'Project Management',
    department_lead: 'Department Lead',
    communications: 'Communications & Editorial',
    staff: 'Technical Staff & Research',
  },
  categories: {
    material: 'Material & Finish',
    constructive_system: 'Constructive System',
    technical_study: 'Technical & Climate Study',
  },
  departments: {
    pageTitle: 'Departments — O+A Workspace',
    eyebrow: 'SHEET 05 · DEPARTMENTS · DEMO MODE',
    heading: 'Departments',
    subtitle:
      'Canonical studio disciplinary structure (9 tracks across Maputo and Milan) with 100% derived counters from active projects, tasks, and technical references.',
    directoryHeading: 'Disciplinary units (9)',
    counters: {
      members: 'Members',
      activeProjects: 'Active projects',
      archivedProjects: 'Archived',
      openTasks: 'Open tasks',
      completedTasks: 'Completed',
      technicalRefs: 'Technical refs',
    },
    sections: {
      membersTitle: 'Assigned team',
      projectsTitle: 'Department projects',
      tasksTitle: 'Operational tasks',
      refsTitle: 'Technical Library references',
    },
    empty: {
      members: 'No demonstrative collaborators assigned at this stage.',
      projects: 'No projects linked in the current demonstrative dataset.',
      tasks: 'No operational tasks assigned to this department.',
      refs: 'No technical references linked to this department.',
    },
    zeroActivityNote:
      'Department has no demonstrative seed records at this stage — counters honestly reported as 0.',
  },
  team: {
    pageTitle: 'Team — O+A Workspace',
    eyebrow: 'SHEET 06 · TEAM · DEMO MODE',
    heading: 'Studio Team',
    subtitle:
      'Fictive operational profiles across the Maputo–Milan axis linked to canonical workspace projects and tasks.',
    honestBanner:
      'Local demonstrative directory with 6 fictive profiles — distinct from real authentication and with zero exposed credentials.',
    filters: {
      searchLabel: 'Search collaborator',
      searchPlaceholder: 'Name, code, role, or department…',
      roleLabel: 'Role',
      departmentLabel: 'Department',
      studioBaseLabel: 'Studio Base',
      studioBases: {
        all: 'All studio bases',
        Maputo: 'Maputo',
        Milão: 'Milan',
      },
    },
    showingPrefix: 'Showing',
    profile: {
      eyebrow: 'COLLABORATOR PROFILE (DEMO)',
      departmentLabel: 'Department',
      baseLabel: 'Studio base',
      emailLabel: 'Demo email',
      scopeLabel: 'Operational scope',
      ledProjectsTitle: 'Led projects',
      contributedProjectsTitle: 'Project contributions',
      assignedTasksTitle: 'Assigned tasks',
      openTasksLabel: 'Open',
      completedTasksLabel: 'Completed',
      noLedProjects: 'No directly led projects in the current dataset.',
      noContributedProjects: 'No secondary project contributions recorded.',
      noAssignedTasks: 'No directly assigned tasks.',
    },
    emptyFilterTitle: 'No collaborators match the active filters',
    emptyFilterBody:
      'Adjust role, department, studio base, or search query.',
  },
  library: {
    pageTitle: 'Technical Library — O+A Workspace',
    eyebrow: 'SHEET 07 · TECHNICAL LIBRARY · DEMO MODE',
    heading: 'Technical Library',
    subtitle:
      'Studio index of materials, constructive systems, and climate studies — an autonomous technical module distinct from the project catalog.',
    distinctNotice:
      'Metadata-only technical specifications index (no binary file upload or remote storage).',
    newReferenceCta: 'Register technical reference (demo)',
    filters: {
      categoryAria: 'Filter by technical category',
      searchLabel: 'Search technical sheets',
      searchPlaceholder: 'Code, material, standard, or specification…',
      departmentLabel: 'Department',
      projectLabel: 'Linked project',
    },
    showingPrefix: 'Showing',
    card: {
      specsLabel: 'Technical specification',
      originLabel: 'Origin / Climate',
      standardsLabel: 'Standard / Tag',
      citationLabel: 'Internal citation',
      relatedProjectsLabel: 'Related projects',
      noRelatedProjects: 'Cross-studio reference without a specific project.',
      localCreatedBadge: 'Local record (demo)',
      seedReferenceBadge: 'Base catalog (demo)',
    },
    spotlight: {
      tag: 'HIGHLIGHTED TECHNICAL SHEET · DIRECT LINK',
      invalidNotice:
        'The technical reference specified in the URL was not found in this demonstration',
    },
    emptyTitle: 'No technical sheets match the active filters',
    emptyBody:
      'Clear filters or register a new metadata-only technical sheet in this browser.',
    createdAnnouncement:
      'New technical reference registered in this browser (demo).',
  },
  dialog: {
    code: 'LIB-07 · NEW TECHNICAL REFERENCE (DEMO)',
    title: 'Register technical reference (metadata only)',
    honestNotice:
      'Text-only technical metadata record saved in this browser (localStorage). No file uploads or server transmission.',
    fieldCategory: 'Technical category',
    fieldCode: 'Code (optional)',
    fieldCodePlaceholder: 'e.g., MAT-010 (auto-generated if blank)',
    fieldTitle: 'Technical sheet title',
    fieldTitlePlaceholder: 'e.g., Natural Hydraulic Lime Mortar NHL 3.5',
    fieldSummary: 'Operational summary',
    fieldSummaryPlaceholder: 'Architectural application and expected performance…',
    fieldSpecs: 'Technical specifications',
    fieldSpecsPlaceholder: 'Mix ratio, thickness, exposure class, or thermal values…',
    fieldOrigin: 'Region / Climate origin',
    fieldOriginPlaceholder: 'e.g., Maputo / Humid coastal climate',
    fieldStandards: 'Standards / Technical tag',
    fieldStandardsPlaceholder: 'e.g., EN 459-1 · ISO 12572',
    fieldDepartment: 'Responsible department',
    fieldRelatedProject: 'Linked project (optional)',
    noLinkedProjectOption: 'No specific project',
    fieldCitation: 'Citation / Documentary source',
    fieldCitationPlaceholder: 'e.g., O+A Materiality Log · Shelf M-10',
    submitCta: 'Save technical reference',
    validationTitle: 'Please enter a technical sheet title.',
    validationSummary: 'Please enter an operational summary.',
    validationSpecs: 'Please enter technical specifications.',
    validationOrigin: 'Please enter the region or climate origin.',
    validationStandards: 'Please enter a standard or technical tag.',
    validationCitation: 'Please enter a documentary citation.',
    errorFallback: 'Could not save the technical reference in this browser.',
  },
};

export const STUDIO_STRUCTURE_I18N: Record<
  AppLanguage,
  StudioStructureDictionary
> = {
  pt,
  en,
};
