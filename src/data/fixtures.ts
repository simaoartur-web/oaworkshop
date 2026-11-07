import type {
  DemoUser,
  Department,
  DepartmentId,
  FeaturedStudyProject,
  LocalizedText,
  Role,
} from './types';

export const DEMO_ACCESS_KEY_HINT = 'oa-demo';

export const DEPARTMENTS: Record<DepartmentId, Department> = {
  direction: {
    id: 'direction',
    code: 'DIR',
    name: { pt: 'Direcção do Atelier', en: 'Studio Direction' },
    focus: {
      pt: 'Visão transversal, critérios de projecto e aprovação editorial final.',
      en: 'Cross-studio direction, design review criteria, and final editorial sign-off.',
    },
  },
  architecture: {
    id: 'architecture',
    code: 'ARQ',
    name: { pt: 'Arquitectura', en: 'Architecture' },
    focus: {
      pt: 'Concepção espacial, pranchas técnicas, maquetes e modelos 3D.',
      en: 'Spatial design, technical drawings, physical maquettes, and 3D models.',
    },
  },
  urbanism: {
    id: 'urbanism',
    code: 'URB',
    name: { pt: 'Urbanismo e Território', en: 'Urbanism & Territory' },
    focus: {
      pt: 'Planos territoriais, sistemas públicos e resiliência urbana.',
      en: 'Territorial masterplans, public systems, and urban resilience.',
    },
  },
  interiors: {
    id: 'interiors',
    code: 'INT',
    name: { pt: 'Interiores e Matéria', en: 'Interiors & Materiality' },
    focus: {
      pt: 'Amostras materiais, pormenorização construtiva e mobiliário fixo.',
      en: 'Material samples, constructive detailing, and bespoke joinery.',
    },
  },
  research: {
    id: 'research',
    code: 'INV',
    name: { pt: 'Investigação Aplicada', en: 'Applied Research' },
    focus: {
      pt: 'Estudos climáticos, sistemas vernaculares contemporâneos e arquivo.',
      en: 'Climatic studies, contemporary vernacular systems, and archive.',
    },
  },
  project_management: {
    id: 'project_management',
    code: 'GPR',
    name: { pt: 'Gestão de Projectos', en: 'Project Management' },
    focus: {
      pt: 'Planeamento de fases, coordenação de especialidades e marcos.',
      en: 'Phase scheduling, engineering coordination, and milestones.',
    },
  },
  communications: {
    id: 'communications',
    code: 'COM',
    name: { pt: 'Comunicação e Curadoria', en: 'Communications & Curation' },
    focus: {
      pt: 'Edição bilingue PT/EN, cadernos de apresentação e fila de portfólio.',
      en: 'Bilingual PT/EN editing, presentation monographs, and portfolio queue.',
    },
  },
  finance: {
    id: 'finance',
    code: 'ADM',
    name: { pt: 'Administração (Demo)', en: 'Administration (Demo)' },
    focus: {
      pt: 'Estimativas exemplificativas de horas e fases em modo demonstrativo.',
      en: 'Illustrative phase and hour estimates in demonstration mode.',
    },
  },
  hr: {
    id: 'hr',
    code: 'RHU',
    name: { pt: 'Pessoas e Estrutura (Demo)', en: 'People & Structure (Demo)' },
    focus: {
      pt: 'Directório fictício e alocação equilibrada por equipa.',
      en: 'Fictive directory and balanced team allocation.',
    },
  },
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr-dir-01',
    code: 'DIR-01',
    name: 'Helena Mondlane (Demo)',
    initials: 'HM',
    email: 'direccao.demo@oa-workspace.local',
    demoAccessKey: DEMO_ACCESS_KEY_HINT,
    role: 'director',
    departmentId: 'direction',
    studioBase: 'Maputo',
    roleLabel: {
      pt: 'Direcção · Revisão Crítica & Editorial',
      en: 'Direction · Design Critique & Editorial',
    },
    scopeSummary: {
      pt: 'Visão integrada dos departamentos, revisão de dossiers e autorização final de publicação.',
      en: 'Cross-department oversight, dossier critique, and final publication sign-off.',
    },
    welcomePriorities: [
      {
        id: 'pri-dir-1',
        code: 'REV · 01',
        category: { pt: 'Revisão de Corte', en: 'Section Review' },
        summary: {
          pt: 'Pavilhão Cívico da Baía — validar cota de sombra da galeria nascente',
          en: 'Bay Civic Pavilion — validate east gallery shade datum',
        },
        meta: { pt: 'Arquitectura · Fase de Revisão', en: 'Architecture · Design Review' },
      },
      {
        id: 'pri-dir-2',
        code: 'PUB · 02',
        category: { pt: 'Fila Editorial (Demo)', en: 'Editorial Queue (Demo)' },
        summary: {
          pt: '2 cadernos aguardam decisão antes de pré-visualização local',
          en: '2 monographs awaiting decision prior to local preview',
        },
        meta: { pt: 'Privado por omissão', en: 'Private by default' },
      },
      {
        id: 'pri-dir-3',
        code: 'MRC · 03',
        category: { pt: 'Coordenação Milão–Maputo', en: 'Milan–Maputo Sync' },
        summary: {
          pt: 'Alinhamento semanal de estudos territoriais e caderno de matérias',
          en: 'Weekly alignment on territorial studies and materiality log',
        },
        meta: { pt: 'Quinta-feira · 15:00 CAT', en: 'Thursday · 15:00 CAT' },
      },
    ],
  },
  {
    id: 'usr-arq-02',
    code: 'ARQ-02',
    name: 'Mateo Conti (Demo)',
    initials: 'MC',
    email: 'arquitectura.demo@oa-workspace.local',
    demoAccessKey: DEMO_ACCESS_KEY_HINT,
    role: 'architect',
    departmentId: 'architecture',
    studioBase: 'Milão',
    roleLabel: {
      pt: 'Arquitecto Sénior · Projecto & Modelos',
      en: 'Senior Architect · Design & Models',
    },
    scopeSummary: {
      pt: 'Desenvolvimento de dossiers, versões técnicas, maquetes e modelos Web 3D (.glb).',
      en: 'Dossier authoring, technical versions, scale models, and Web 3D (.glb) assets.',
    },
    welcomePriorities: [
      {
        id: 'pri-arq-1',
        code: 'MOD · 01',
        category: { pt: 'Maquete & GLB', en: 'Maquette & GLB' },
        summary: {
          pt: 'Actualizar exportação .glb leve (v04) da cobertura em madeira laminada',
          en: 'Update lightweight .glb export (v04) of the laminated timber roof',
        },
        meta: { pt: 'OA-26-014 · Pavilhão da Baía', en: 'OA-26-014 · Bay Pavilion' },
      },
      {
        id: 'pri-arq-2',
        code: 'DES · 02',
        category: { pt: 'Prancha 1:50', en: '1:50 Sheet' },
        summary: {
          pt: 'Detalhe de encontro entre taipa pigmentada e espelho de água',
          en: 'Junction detail between pigmented rammed earth and water court',
        },
        meta: { pt: 'Entrega interna · Sexta-feira', en: 'Internal issue · Friday' },
      },
    ],
  },
  {
    id: 'usr-gpr-03',
    code: 'GPR-03',
    name: 'Inês Macamo (Demo)',
    initials: 'IM',
    email: 'gestao.demo@oa-workspace.local',
    demoAccessKey: DEMO_ACCESS_KEY_HINT,
    role: 'project_manager',
    departmentId: 'project_management',
    studioBase: 'Maputo',
    roleLabel: {
      pt: 'Gestão de Projectos · Planeamento & Marcos',
      en: 'Project Manager · Planning & Milestones',
    },
    scopeSummary: {
      pt: 'Coordenação de entregas, dependências entre equipas, calendário e sínteses.',
      en: 'Deliverable coordination, cross-team dependencies, calendar, and summaries.',
    },
    welcomePriorities: [
      {
        id: 'pri-gpr-1',
        code: 'PLN · 01',
        category: { pt: 'Marco Semanal', en: 'Weekly Milestone' },
        summary: {
          pt: 'Confirmar fecho do estudo prévio em 3 frentes departamentais',
          en: 'Confirm schematic design sign-off across 3 department tracks',
        },
        meta: { pt: 'Sem atrasos críticos (Demo)', en: 'No critical blockers (Demo)' },
      },
      {
        id: 'pri-gpr-2',
        code: 'EQP · 02',
        category: { pt: 'Atribuições', en: 'Allocations' },
        summary: {
          pt: 'Distribuir revisão acústica e térmica com Investigação Aplicada',
          en: 'Assign acoustic and thermal review with Applied Research',
        },
        meta: { pt: '4 tarefas em curso', en: '4 tasks in progress' },
      },
    ],
  },
  {
    id: 'usr-dep-04',
    code: 'URB-04',
    name: 'Tomás Nhantumbo (Demo)',
    initials: 'TN',
    email: 'urbanismo.demo@oa-workspace.local',
    demoAccessKey: DEMO_ACCESS_KEY_HINT,
    role: 'department_lead',
    departmentId: 'urbanism',
    studioBase: 'Maputo',
    roleLabel: {
      pt: 'Coordenação de Urbanismo · Estudos Territoriais',
      en: 'Urbanism Lead · Territorial Studies',
    },
    scopeSummary: {
      pt: 'Organização do espaço departamental de Urbanismo, cartografia de estudo e revisões.',
      en: 'Urbanism department workspace organization, study cartography, and reviews.',
    },
    welcomePriorities: [
      {
        id: 'pri-dep-1',
        code: 'TER · 01',
        category: { pt: 'Frente Ribeirinha', en: 'Waterfront Study' },
        summary: {
          pt: 'Rever permeabilidade pedonal e corredores de sombra arbórea (escala 1:500)',
          en: 'Review pedestrian permeability and tree-canopy shade corridors (1:500)',
        },
        meta: { pt: 'Estudo Urbano Demo', en: 'Demo Urban Study' },
      },
    ],
  },
  {
    id: 'usr-com-05',
    code: 'COM-05',
    name: 'Clara Ferraz (Demo)',
    initials: 'CF',
    email: 'editorial.demo@oa-workspace.local',
    demoAccessKey: DEMO_ACCESS_KEY_HINT,
    role: 'communications',
    departmentId: 'communications',
    studioBase: 'Milão',
    roleLabel: {
      pt: 'Comunicação & Curadoria · Portfólio Bilingue',
      en: 'Communications & Curation · Bilingual Portfolio',
    },
    scopeSummary: {
      pt: 'Preparação editorial PT/EN, verificação de créditos e pré-visualização local.',
      en: 'PT/EN editorial preparation, credit verification, and local preview.',
    },
    welcomePriorities: [
      {
        id: 'pri-com-1',
        code: 'EDT · 01',
        category: { pt: 'Paridade PT / EN', en: 'PT / EN Parity' },
        summary: {
          pt: 'Rever memória descritiva e legendas acessíveis antes de submeter à Direcção',
          en: 'Review descriptive text and accessible captions prior to Direction sign-off',
        },
        meta: { pt: 'Pré-visualização local', en: 'Local preview only' },
      },
    ],
  },
  {
    id: 'usr-eqp-06',
    code: 'INV-06',
    name: 'Diogo Tembe (Demo)',
    initials: 'DT',
    email: 'investigacao.demo@oa-workspace.local',
    demoAccessKey: DEMO_ACCESS_KEY_HINT,
    role: 'staff',
    departmentId: 'research',
    studioBase: 'Maputo',
    roleLabel: {
      pt: 'Investigação & Arquivo · Materiais e Clima',
      en: 'Research & Archive · Materials & Climate',
    },
    scopeSummary: {
      pt: 'Documentação técnica, biblioteca de amostras minerais e tarefas atribuídas.',
      en: 'Technical documentation, mineral sample library, and assigned tasks.',
    },
    welcomePriorities: [
      {
        id: 'pri-eqp-1',
        code: 'MAT · 01',
        category: { pt: 'Caderno de Amostras', en: 'Sample Dossier' },
        summary: {
          pt: 'Catalogar ensaio de inércia térmica em blocos de terra comprimida (Demo)',
          en: 'Catalog thermal inertia trial on compressed earth blocks (Demo)',
        },
        meta: { pt: 'Biblioteca Técnica', en: 'Technical Library' },
      },
    ],
  },
];

export const FEATURED_STUDY_PROJECT: FeaturedStudyProject = {
  id: 'proj-oa-26-014',
  code: 'OA-26-014 · DEMO',
  title: {
    pt: 'Pavilhão Cívico e Arquivo da Baía',
    en: 'Bay Civic Pavilion & Archive',
  },
  subtitle: {
    pt: 'Estudo espacial demonstrativo sobre sombra profunda, ventilação cruzada e topografia em degraus.',
    en: 'Demonstrative spatial study on deep shade, cross-ventilation, and stepped topography.',
  },
  discipline: {
    pt: 'Arquitectura Pública & Paisagem',
    en: 'Public Architecture & Landscape',
  },
  location: {
    pt: 'Estudo Costeiro · Eixo Índico (Fictício / Demo)',
    en: 'Coastal Study · Indian Ocean Axis (Fictive / Demo)',
  },
  year: 2026,
  scale: '1 : 200',
  areaSqm: '3 420 m² (Demo)',
  elevationDatum: '+4.20 m NMM',
  projectStatus: 'review',
  publicationStatus: 'private',
  leadDepartmentId: 'architecture',
  maquetteImageSrc: '/assets/studies/welcome-maquette-study.webp',
  maquetteImageAlt: {
    pt: 'Maquete arquitectónica de estudo à escala 1:200 com base topográfica escura em degraus e volumes em madeira e terracota sob luz rasante.',
    en: '1:200 architectural study maquette with dark stepped topographic base and timber and terracotta volumes under raking studio light.',
  },
  editorialNote: {
    pt: 'Construir começa na clareza com que organizamos o espaço de pensar: cada linha, corte e decisão tem lugar próprio.',
    en: 'Building begins with the clarity with which we organize the space for thought: every line, section, and decision holds its proper place.',
  },
};

export const LOGIN_SPATIAL_STUDY = {
  code: 'ESTUDO · PRANCHA 00',
  imageSrc: '/assets/studies/login-spatial-study.webp',
  imageAlt: {
    pt: 'Estudo espacial demonstrativo de pátio monolítico em betão cofrado escuro e plano de taipa terracota sobre espelho de água tranquilo.',
    en: 'Demonstrative spatial study of a monolithic courtyard in dark board-formed concrete and terracotta rammed earth above a still water plane.',
  },
  title: {
    pt: 'Matéria, luz rasante e silêncio estrutural.',
    en: 'Materiality, raking light, and structural stillness.',
  } satisfies LocalizedText,
  caption: {
    pt: 'Estudo Espacial Interno (Demo) · Betão cofrado, terra compactada e plano de água · Cota +0.00',
    en: 'Internal Spatial Study (Demo) · Board-formed concrete, rammed earth & water plane · Datum +0.00',
  } satisfies LocalizedText,
};

export function findDemoUserById(userId: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === userId);
}

export function findDemoUserByEmail(email: string): DemoUser | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find((user) => user.email.toLowerCase() === normalized);
}

export function findDemoUserByRole(role: Role): DemoUser {
  return DEMO_USERS.find((user) => user.role === role) ?? DEMO_USERS[0];
}
