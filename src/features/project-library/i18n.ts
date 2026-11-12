import type { DeskReviewState } from '../../data/studioDeskTypes';
import type {
  AppLanguage,
  ProjectStatus,
  PublicationStatus,
} from '../../data/types';
import type { ProjectFileKind } from '../../data/projectLibraryTypes';

export interface ProjectLibraryDictionary {
  catalog: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    newProjectCta: string;
    studioDeskLink: string;
    honestDemoNotice: string;
    searchLabel: string;
    searchPlaceholder: string;
    clearSearchAria: string;
    scopeAll: string;
    scopeMine: string;
    departmentLabel: string;
    departmentAll: string;
    statusLabel: string;
    statusAllActive: string;
    statusAllWithArchived: string;
    phaseLabel: string;
    phaseAll: string;
    sortLabel: string;
    sortOptions: {
      priority: string;
      code: string;
      updated: string;
      milestone: string;
    };
    resetFilters: string;
    emptyTitle: string;
    emptyBody: string;
    countLabel: string;
    archivedCountSuffix: string;
    tableAriaLabel: string;
    columns: {
      code: string;
      project: string;
      classification: string;
      status: string;
      publication: string;
      milestone: string;
      actions: string;
    };
    openDossier: string;
    openInDesk: string;
    originSeed: string;
    originLocal: string;
  };
  create: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    backToCatalog: string;
    privacyBannerTitle: string;
    privacyBannerBody: string;
    fields: {
      code: string;
      codeHint: string;
      titlePt: string;
      titleEn: string;
      subtitlePt: string;
      subtitleEn: string;
      department: string;
      disciplinePt: string;
      studioBase: string;
      phasePt: string;
      projectStatus: string;
      leadUser: string;
      scale: string;
      areaSqm: string;
      elevationDatum: string;
      milestoneTitlePt: string;
      milestoneDate: string;
      initialFileName: string;
      initialFileKind: string;
      dossierNotesPt: string;
    };
    errors: {
      titleRequired: string;
      subtitleRequired: string;
      milestoneRequired: string;
    };
    submitCta: string;
    cancelCta: string;
  };
  dossier: {
    pageTitlePrefix: string;
    eyebrow: string;
    notFoundTitle: string;
    notFoundBody: string;
    backToCatalog: string;
    createProjectLink: string;
    openInDesk: string;
    openModelFuture: string;
    privacyIndependenceNote: string;
    metadataSectionTitle: string;
    editMetadataCta: string;
    cancelEditCta: string;
    saveMetadataCta: string;
    savedBanner: string;
    archiveCta: string;
    restoreCta: string;
    archivedBadge: string;
    originSeedLabel: string;
    originLocalLabel: string;
    labels: {
      department: string;
      studioBase: string;
      phase: string;
      status: string;
      publication: string;
      reviewState: string;
      lead: string;
      scaleArea: string;
      milestone: string;
      updatedAt: string;
      notes: string;
    };
    revisionsTitle: string;
    addRevisionCta: string;
    revisionVersionLabel: string;
    revisionSummaryLabel: string;
    revisionReviewLabel: string;
    filesTitle: string;
    filesHonestNote: string;
    addFileCta: string;
    fileNameLabel: string;
    fileKindLabel: string;
    fileVersionLabel: string;
    fileNoteLabel: string;
    deliverablesTitle: string;
  };
  enums: {
    projectStatus: Record<ProjectStatus, string>;
    publicationStatus: Record<PublicationStatus, string>;
    reviewState: Record<DeskReviewState, string>;
    fileKind: Record<ProjectFileKind, string>;
  };
}

export const PROJECT_LIBRARY_I18N: Record<
  AppLanguage,
  ProjectLibraryDictionary
> = {
  pt: {
    catalog: {
      pageTitle: 'Projectos · Biblioteca Técnica — O+A Workspace',
      eyebrow: 'SECÇÃO 02 · BIBLIOTECA DE PROJECTOS (DEMO)',
      heading: 'Catálogo técnico de projectos.',
      subtitle:
        'Base canónica local dos estudos e dossiers do atelier entre Maputo e Milão. Registos guardados exclusivamente neste navegador.',
      newProjectCta: 'Novo Projecto',
      studioDeskLink: 'Ir para Studio Desk',
      honestDemoNotice:
        'Catálogo demonstrativo local (localStorage). Projectos criados aqui começam sempre como privados (publicationStatus: private) e não publicam para o website.',
      searchLabel: 'Pesquisar por código ou título',
      searchPlaceholder: 'Código (OA-26-101), título ou disciplina…',
      clearSearchAria: 'Limpar pesquisa',
      scopeAll: 'Todos os projectos',
      scopeMine: 'Associados ao meu papel',
      departmentLabel: 'Departamento',
      departmentAll: 'Todos os departamentos',
      statusLabel: 'Estado do projecto',
      statusAllActive: 'Activos (sem arquivados)',
      statusAllWithArchived: 'Todos (incl. arquivados)',
      phaseLabel: 'Fase',
      phaseAll: 'Todas as fases',
      sortLabel: 'Ordenar por',
      sortOptions: {
        priority: 'Prioridade',
        code: 'Código',
        updated: 'Actualização recente',
        milestone: 'Próximo marco',
      },
      resetFilters: 'Repor filtros',
      emptyTitle: 'Nenhum projecto corresponde aos filtros seleccionados.',
      emptyBody:
        'Altere a pesquisa, inclua registos arquivados ou limpe os filtros activos.',
      countLabel: 'projectos apresentados',
      archivedCountSuffix: 'arquivado(s)',
      tableAriaLabel: 'Lista técnica de projectos do O+A Workspace',
      columns: {
        code: 'Código & Origem',
        project: 'Projecto & Fase',
        classification: 'Departamento & Base',
        status: 'Estado',
        publication: 'Publicação',
        milestone: 'Próximo Marco',
        actions: 'Acções',
      },
      openDossier: 'Abrir dossier',
      openInDesk: 'Foco no Desk',
      originSeed: 'Fixture base',
      originLocal: 'Criado localmente',
    },
    create: {
      pageTitle: 'Novo Projecto (Demo) — O+A Workspace',
      eyebrow: 'BIBLIOTECA DE PROJECTOS · NOVA FICHA TÉCNICA',
      heading: 'Registar novo projecto demonstrativo.',
      subtitle:
        'Cria uma ficha local persistente na Biblioteca deste navegador. Os dados permanecem fictícios e isolados.',
      backToCatalog: 'Voltar ao Catálogo',
      privacyBannerTitle: 'Privacidade por omissão garantida',
      privacyBannerBody:
        'Todo o novo projecto nasce obrigatoriamente com estado editorial «Privado por omissão». A publicação no website público não está activa nesta etapa.',
      fields: {
        code: 'Código técnico (opcional)',
        codeHint: 'Gerado automaticamente (ex.: OA-26-124) se deixado vazio.',
        titlePt: 'Título do projecto (PT) *',
        titleEn: 'Título em inglês (EN, opcional)',
        subtitlePt: 'Resumo técnico (PT) *',
        subtitleEn: 'Resumo técnico (EN, opcional)',
        department: 'Departamento principal',
        disciplinePt: 'Disciplina / sub-área',
        studioBase: 'Base do estúdio',
        phasePt: 'Fase actual (ex.: Estudo Prévio)',
        projectStatus: 'Estado inicial do projecto',
        leadUser: 'Responsável principal (Demo)',
        scale: 'Escala de estudo',
        areaSqm: 'Área aproximada',
        elevationDatum: 'Cota de referência',
        milestoneTitlePt: 'Próximo marco previsto *',
        milestoneDate: 'Data prevista do marco',
        initialFileName: 'Referência fictícia de ficheiro inicial (opcional)',
        initialFileKind: 'Tipo de ficheiro (metadado)',
        dossierNotesPt: 'Notas iniciais do dossier',
      },
      errors: {
        titleRequired: 'Indique o título do projecto em português.',
        subtitleRequired: 'Indique um resumo técnico breve do projecto.',
        milestoneRequired: 'Indique o próximo marco previsto para o projecto.',
      },
      submitCta: 'Criar projecto na Biblioteca',
      cancelCta: 'Cancelar',
    },
    dossier: {
      pageTitlePrefix: 'Dossier Técnico',
      eyebrow: 'DOSSIER DE PROJECTO · REPOSITÓRIO LOCAL (DEMO)',
      notFoundTitle: 'Projecto não encontrado no arquivo local.',
      notFoundBody:
        'O identificador pedido não existe nas fixtures demonstrativas nem foi criado neste navegador.',
      backToCatalog: 'Voltar ao Catálogo',
      createProjectLink: 'Registar novo projecto',
      openInDesk: 'Abrir no Studio Desk',
      openModelFuture: 'Modelo 3D · Em breve (Fase 04)',
      privacyIndependenceNote:
        'O estado de publicação é independente do estado técnico do projecto e não é promovido a público nesta fase.',
      metadataSectionTitle: 'Metadados e Estado Operacional',
      editMetadataCta: 'Editar metadados',
      cancelEditCta: 'Cancelar edição',
      saveMetadataCta: 'Guardar alterações locais',
      savedBanner: 'Metadados guardados localmente neste navegador.',
      archiveCta: 'Arquivar projecto',
      restoreCta: 'Restaurar do arquivo',
      archivedBadge: 'Arquivado localmente',
      originSeedLabel: 'Base demonstrativa',
      originLocalLabel: 'Criado neste navegador',
      labels: {
        department: 'Departamento',
        studioBase: 'Estúdio',
        phase: 'Fase',
        status: 'Estado do projecto',
        publication: 'Estado de publicação',
        reviewState: 'Revisão interna',
        lead: 'Coordenação',
        scaleArea: 'Escala / Área / Cota',
        milestone: 'Próximo marco',
        updatedAt: 'Última actualização local',
        notes: 'Notas técnicas do dossier',
      },
      revisionsTitle: 'Histórico de Revisões Técnicas',
      addRevisionCta: 'Registar revisão',
      revisionVersionLabel: 'Etiqueta da versão (ex.: v02 · Corte AA)',
      revisionSummaryLabel: 'Síntese da revisão técnica',
      revisionReviewLabel: 'Estado após revisão',
      filesTitle: 'Referências de Ficheiros e Versões (Metadados)',
      filesHonestNote:
        'Apenas metadados fictícios em texto. Nenhum ficheiro binário é carregado ou enviado para servidor.',
      addFileCta: 'Adicionar referência',
      fileNameLabel: 'Nome do ficheiro fictício (ex.: corte-aa-v05.pdf)',
      fileKindLabel: 'Categoria documental',
      fileVersionLabel: 'Versão',
      fileNoteLabel: 'Nota técnica breve',
      deliverablesTitle: 'Entregáveis Associados',
    },
    enums: {
      projectStatus: {
        concept: 'Conceito',
        design: 'Anteprojecto',
        in_progress: 'Em curso',
        review: 'Em revisão',
        completed: 'Concluído',
        archived: 'Arquivado',
      },
      publicationStatus: {
        private: 'Privado por omissão',
        requested: 'Curadoria solicitada (Local)',
        approved: 'Aprovado localmente',
        'published-demo': 'Pré-visualização local',
        rejected: 'Não aprovado',
        unpublished: 'Retirado do portfólio local',
      },
      reviewState: {
        awaiting_review: 'Aguarda revisão',
        in_technical_review: 'Em revisão técnica',
        revision_requested: 'Ajustes pedidos',
        approved_internal: 'Aprovado (interno)',
      },
      fileKind: {
        drawing: 'Prancha técnica (.pdf / .dwg)',
        model_3d: 'Modelo Web 3D (.glb · Fase 04)',
        source_skp: 'Modelo nativo (.skp · Fase 04)',
        specification: 'Memória / Caderno técnico',
        photographic_log: 'Registo fotográfico de maquete',
      },
    },
  },
  en: {
    catalog: {
      pageTitle: 'Projects · Technical Library — O+A Workspace',
      eyebrow: 'SECTION 02 · PROJECT LIBRARY (DEMO)',
      heading: 'Technical project catalog.',
      subtitle:
        'Local canonical archive for Maputo and Milan studies and dossiers. Changes persist strictly in this browser.',
      newProjectCta: 'New Project',
      studioDeskLink: 'Open Studio Desk',
      honestDemoNotice:
        'Local demonstrative catalog (localStorage). Newly created projects always start as private (publicationStatus: private) and never publish to the website.',
      searchLabel: 'Search by code or title',
      searchPlaceholder: 'Code (OA-26-101), title or discipline…',
      clearSearchAria: 'Clear search',
      scopeAll: 'All projects',
      scopeMine: 'Associated with my profile',
      departmentLabel: 'Department',
      departmentAll: 'All departments',
      statusLabel: 'Project status',
      statusAllActive: 'Active (excluding archived)',
      statusAllWithArchived: 'All (incl. archived)',
      phaseLabel: 'Phase',
      phaseAll: 'All phases',
      sortLabel: 'Sort by',
      sortOptions: {
        priority: 'Priority',
        code: 'Code',
        updated: 'Recently updated',
        milestone: 'Next milestone',
      },
      resetFilters: 'Reset filters',
      emptyTitle: 'No project matches the active filters.',
      emptyBody:
        'Adjust your search, include archived items, or clear active filters.',
      countLabel: 'projects shown',
      archivedCountSuffix: 'archived',
      tableAriaLabel: 'O+A Workspace technical project list',
      columns: {
        code: 'Code & Origin',
        project: 'Project & Phase',
        classification: 'Department & Base',
        status: 'Status',
        publication: 'Publication',
        milestone: 'Next Milestone',
        actions: 'Actions',
      },
      openDossier: 'Open dossier',
      openInDesk: 'Focus in Desk',
      originSeed: 'Seed fixture',
      originLocal: 'Created locally',
    },
    create: {
      pageTitle: 'New Project (Demo) — O+A Workspace',
      eyebrow: 'PROJECT LIBRARY · NEW TECHNICAL RECORD',
      heading: 'Register demonstrative project.',
      subtitle:
        'Creates a persistent local record inside this browser Library. All data remains fictive and isolated.',
      backToCatalog: 'Back to Catalog',
      privacyBannerTitle: 'Private by default enforced',
      privacyBannerBody:
        'Every new project always starts with publicationStatus set to private. Public website publishing is inactive in this phase.',
      fields: {
        code: 'Technical code (optional)',
        codeHint: 'Auto-generated (e.g. OA-26-124) if left empty.',
        titlePt: 'Project title (PT) *',
        titleEn: 'English title (EN, optional)',
        subtitlePt: 'Technical summary (PT) *',
        subtitleEn: 'English summary (EN, optional)',
        department: 'Lead department',
        disciplinePt: 'Discipline',
        studioBase: 'Studio base',
        phasePt: 'Current phase (e.g. Concept Design)',
        projectStatus: 'Initial project status',
        leadUser: 'Project lead (Demo)',
        scale: 'Study scale',
        areaSqm: 'Approximate area',
        elevationDatum: 'Elevation datum',
        milestoneTitlePt: 'Next scheduled milestone *',
        milestoneDate: 'Milestone date',
        initialFileName: 'Initial fictive file reference (optional)',
        initialFileKind: 'Document category (metadata)',
        dossierNotesPt: 'Initial dossier notes',
      },
      errors: {
        titleRequired: 'Please enter a project title.',
        subtitleRequired: 'Please provide a brief technical summary.',
        milestoneRequired: 'Please provide the next milestone title.',
      },
      submitCta: 'Create Project in Library',
      cancelCta: 'Cancel',
    },
    dossier: {
      pageTitlePrefix: 'Technical Dossier',
      eyebrow: 'PROJECT DOSSIER · LOCAL REPOSITORY (DEMO)',
      notFoundTitle: 'Project not found in local archive.',
      notFoundBody:
        'The requested identifier is not present in the demonstrative fixtures or locally created records in this browser.',
      backToCatalog: 'Back to Catalog',
      createProjectLink: 'Register new project',
      openInDesk: 'Open in Studio Desk',
      openModelFuture: '3D Model · Coming Soon (Phase 04)',
      privacyIndependenceNote:
        'Publication status is strictly independent from project lifecycle status and cannot trigger public publishing in this phase.',
      metadataSectionTitle: 'Metadata & Operational State',
      editMetadataCta: 'Edit metadata',
      cancelEditCta: 'Cancel edit',
      saveMetadataCta: 'Save local changes',
      savedBanner: 'Metadata saved locally in this browser.',
      archiveCta: 'Archive project',
      restoreCta: 'Restore from archive',
      archivedBadge: 'Archived locally',
      originSeedLabel: 'Base seed fixture',
      originLocalLabel: 'Created in this browser',
      labels: {
        department: 'Department',
        studioBase: 'Studio Base',
        phase: 'Phase',
        status: 'Project status',
        publication: 'Publication status',
        reviewState: 'Internal review',
        lead: 'Project lead',
        scaleArea: 'Scale / Area / Datum',
        milestone: 'Next milestone',
        updatedAt: 'Last local update',
        notes: 'Technical dossier notes',
      },
      revisionsTitle: 'Technical Revision Log',
      addRevisionCta: 'Log revision',
      revisionVersionLabel: 'Version label (e.g. v02 · Section AA)',
      revisionSummaryLabel: 'Revision summary',
      revisionReviewLabel: 'Review status after update',
      filesTitle: 'File & Version References (Metadata Only)',
      filesHonestNote:
        'Fictive string metadata only. No real files are uploaded or persisted.',
      addFileCta: 'Add file reference',
      fileNameLabel: 'Fictive filename (e.g. section-aa-v05.pdf)',
      fileKindLabel: 'Document type',
      fileVersionLabel: 'Version',
      fileNoteLabel: 'Short technical note',
      deliverablesTitle: 'Associated Deliverables',
    },
    enums: {
      projectStatus: {
        concept: 'Concept',
        design: 'Design Development',
        in_progress: 'In Progress',
        review: 'In Review',
        completed: 'Completed',
        archived: 'Archived',
      },
      publicationStatus: {
        private: 'Private by default',
        requested: 'Curation requested (Local)',
        approved: 'Approved locally',
        'published-demo': 'Local preview',
        rejected: 'Not approved',
        unpublished: 'Unpublished from local portfolio',
      },
      reviewState: {
        awaiting_review: 'Awaiting review',
        in_technical_review: 'In technical review',
        revision_requested: 'Revision requested',
        approved_internal: 'Approved (internal)',
      },
      fileKind: {
        drawing: 'Technical drawing (.pdf / .dwg)',
        model_3d: 'Web 3D model (.glb · Phase 04)',
        source_skp: 'Native source (.skp · Phase 04)',
        specification: 'Technical specification',
        photographic_log: 'Maquette photo log',
      },
    },
  },
};
