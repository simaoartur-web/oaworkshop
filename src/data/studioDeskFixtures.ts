import type { Role } from './types';
import type {
  RoleDeskConfig,
  StudioDeskActivityEntry,
  StudioDeskLocalState,
  StudioDeskProject,
  StudioDeskTask,
} from './studioDeskTypes';

/**
 * Isolated Studio Desk local state key (`localStorage`).
 * Contains only non-sensitive fictive task statuses, per-role presentation preference,
 * and datum grid toggle — zero credentials or personal data.
 *
 * Integration note for Argon A: remove `STUDIO_DESK_STORAGE_KEY` (or call
 * `clearStudioDeskLocalState()`) inside global `resetDemoWorkspaceState()`.
 */
export const STUDIO_DESK_STORAGE_KEY = 'oa_workspace_studio_desk_v1';

const VALID_DESK_ROLES: ReadonlySet<Role> = new Set([
  'director',
  'architect',
  'project_manager',
  'department_lead',
  'communications',
  'staff',
]);

export const STUDIO_DESK_PROJECTS: StudioDeskProject[] = [
  {
    id: 'sd-proj-oa-26-101',
    code: 'OA-26-101',
    title: {
      pt: 'Galeria Cívica & Pátio da Ponta Vermelha',
      en: 'Ponta Vermelha Civic Gallery & Courtyard',
    },
    subtitle: {
      pt: 'Estudo fictício para espaço cultural em betão cofrado escuro, brise-soleil em madeira e núcleo de taipa pigmentada.',
      en: 'Fictive cultural pavilion study in dark board-formed concrete, timber louvers, and pigmented rammed-earth core.',
    },
    discipline: {
      pt: 'Arquitectura Pública',
      en: 'Public Architecture',
    },
    departmentId: 'architecture',
    studioBase: 'Maputo',
    phase: {
      pt: 'Anteprojecto · Pranchas 1:50',
      en: 'Design Development · 1:50 Sheets',
    },
    projectStatus: 'review',
    publicationStatus: 'private',
    reviewState: 'in_technical_review',
    priorityRank: 1,
    nextMilestone: {
      title: {
        pt: 'Validação do corte AA e encontro da cobertura nascente',
        en: 'Validate section AA and east roof junction',
      },
      dateIso: '2026-11-12',
      dateLabel: {
        pt: '12 Nov 2026',
        en: '12 Nov 2026',
      },
    },
    milestonesCompleted: 3,
    milestonesTotal: 5,
    scale: '1 : 100',
    areaSqm: '2 840 m²',
    elevationDatum: '+6.40 m NMM',
    leadAuthorCode: 'ARQ-02',
    leadAuthorName: 'Mateo Conti',
    leadUserId: 'usr-arq-02',
    contributorUserIds: ['usr-dir-01', 'usr-arq-02', 'usr-dep-04', 'usr-com-05'],
    assignedRoles: ['director', 'architect', 'project_manager', 'communications'],
    imageSrc: '/assets/studio-desk/featured-atelier-maquette.webp',
    imageAlt: {
      pt: 'Maquete arquitectónica de estudo à escala 1:100 com coberturas em consola escuras, ripado de madeira e núcleo em terra terracota sobre mesa de trabalho.',
      en: '1:100 architectural study maquette with dark cantilevered slabs, vertical timber louvers, and terracotta earth core on a studio workbench.',
    },
    dossierNotes: {
      pt: 'Dossier interno fictício em revisão crítica conjunta Maputo–Milão. Ficheiros nativos .skp e modelo Web 3D (.glb) previstos apenas na Fase 04.',
      en: 'Fictive internal dossier under joint Maputo–Milan design critique. Native .skp files and Web 3D (.glb) viewer deferred to Phase 04.',
    },
    deliverables: [
      {
        id: 'del-101-a',
        code: 'PR-101-AA',
        label: {
          pt: 'Corte longitudinal AA · Versão 04',
          en: 'Longitudinal section AA · Version 04',
        },
        ready: true,
      },
      {
        id: 'del-101-b',
        code: 'MAQ-101-02',
        label: {
          pt: 'Registo fotográfico da maquete física 1:100',
          en: '1:100 physical maquette photographic log',
        },
        ready: true,
      },
      {
        id: 'del-101-c',
        code: 'DET-101-07',
        label: {
          pt: 'Pormenor construtivo de pingadeira e taipa',
          en: 'Drip edge and rammed-earth constructive detail',
        },
        ready: false,
      },
    ],
    roleFocalNote: {
      director: {
        pt: 'Foco Direcção: confirmar critério espacial da galeria nascente antes da passagem a projecto de execução.',
        en: 'Direction focus: confirm spatial alignment of the east gallery prior to technical execution phase.',
      },
      architect: {
        pt: 'Foco Arquitectura: verificar espessura dos montantes de madeira e cota de sombra no corte AA (v04).',
        en: 'Architecture focus: verify timber mullion depth and shade datum on section AA (v04).',
      },
      project_manager: {
        pt: 'Foco Gestão: entrega dependente da revisão de conforto térmico prevista para 12 Nov.',
        en: 'PM focus: deliverable depends on thermal comfort review scheduled for 12 Nov.',
      },
      communications: {
        pt: 'Foco Editorial: manter em estado privado por omissão; preparar memória descritiva bilingue preliminar.',
        en: 'Editorial focus: keep private by default; draft preliminary bilingual project statement.',
      },
    },
  },
  {
    id: 'sd-proj-oa-26-108',
    code: 'OA-26-108',
    title: {
      pt: 'Corredor Pedonal & Terrários da Costa',
      en: 'Coastal Pedestrian Promenade & Terraces',
    },
    subtitle: {
      pt: 'Plano urbano fictício de borda costeira com socalcos drenantes, eixos arborizados e praças cívicas.',
      en: 'Fictive coastal urban masterplan featuring permeable terraces, shaded tree corridors, and civic plazas.',
    },
    discipline: {
      pt: 'Urbanismo & Território',
      en: 'Urbanism & Territory',
    },
    departmentId: 'urbanism',
    studioBase: 'Maputo',
    phase: {
      pt: 'Estudo Territorial · 1:500',
      en: 'Territorial Study · 1:500',
    },
    projectStatus: 'in_progress',
    publicationStatus: 'private',
    reviewState: 'awaiting_review',
    priorityRank: 2,
    nextMilestone: {
      title: {
        pt: 'Alinhamento interdepartamental de drenagem e sombra',
        en: 'Cross-department drainage and canopy shade review',
      },
      dateIso: '2026-11-14',
      dateLabel: {
        pt: '14 Nov 2026',
        en: '14 Nov 2026',
      },
    },
    milestonesCompleted: 2,
    milestonesTotal: 5,
    scale: '1 : 500',
    areaSqm: '14 200 m²',
    elevationDatum: '+2.15 m NMM',
    leadAuthorCode: 'URB-04',
    leadAuthorName: 'Tomás Nhantumbo',
    leadUserId: 'usr-dep-04',
    contributorUserIds: ['usr-dep-04', 'usr-gpr-03', 'usr-dir-01'],
    assignedRoles: ['project_manager', 'department_lead', 'director', 'architect'],
    imageSrc: '/assets/studio-desk/urban-waterfront-study.webp',
    imageAlt: {
      pt: 'Maquete topográfica urbana à escala 1:500 em camadas escuras recortadas com volumes em madeira e dois marcos terracota junto à linha de água.',
      en: '1:500 dark laser-cut urban contour maquette with timber urban blocks and two terracotta civic markers along the waterfront edge.',
    },
    dossierNotes: {
      pt: 'Estudo demonstrativo coordenado entre Urbanismo e Gestão de Projectos para equilibrar marcos de entrega e carga técnica.',
      en: 'Demonstrative study coordinated between Urbanism and Project Management to balance milestones and technical capacity.',
    },
    deliverables: [
      {
        id: 'del-108-a',
        code: 'URB-108-01',
        label: {
          pt: 'Planta de permeabilidade e escoamento 1:500',
          en: '1:500 permeability and runoff plan',
        },
        ready: true,
      },
      {
        id: 'del-108-b',
        code: 'URB-108-03',
        label: {
          pt: 'Matriz de dependências com especialidade hidráulica',
          en: 'Dependency matrix with hydraulic engineering',
        },
        ready: false,
      },
    ],
    roleFocalNote: {
      project_manager: {
        pt: 'Foco Cronograma: 2 frentes em curso; confirmar dependência hidráulica até 14 Nov para evitar bloqueio.',
        en: 'Schedule focus: 2 active tracks; confirm hydraulic dependency by 14 Nov to avoid blockage.',
      },
      department_lead: {
        pt: 'Foco Coordenação: distribuir revisão dos perfis topográficos entre 2 arquitectos de urbanismo.',
        en: 'Department focus: allocate topographic section review across 2 urbanism team members.',
      },
      director: {
        pt: 'Foco Direcção: validar posição dos dois volumes cívicos na frente marítima.',
        en: 'Direction focus: validate placement of the two civic waterfront markers.',
      },
    },
  },
  {
    id: 'sd-proj-oa-26-112',
    code: 'OA-26-112',
    title: {
      pt: 'Arquivo de Matéria & Inércia Climática',
      en: 'Materiality & Thermal Inertia Archive',
    },
    subtitle: {
      pt: 'Caderno técnico fictício que documenta betão cofrado, blocos de terra comprimida e ensaios solares PT/EN.',
      en: 'Fictive technical monograph documenting board-formed concrete, compressed-earth blocks, and PT/EN solar trials.',
    },
    discipline: {
      pt: 'Investigação & Curadoria',
      en: 'Research & Curation',
    },
    departmentId: 'research',
    studioBase: 'Milão',
    phase: {
      pt: 'Documentação & Paridade Bilingue',
      en: 'Documentation & Bilingual Parity',
    },
    projectStatus: 'design',
    publicationStatus: 'requested',
    reviewState: 'revision_requested',
    priorityRank: 3,
    nextMilestone: {
      title: {
        pt: 'Fecho da revisão editorial PT/EN e créditos de amostra',
        en: 'Close PT/EN editorial review and sample credits',
      },
      dateIso: '2026-11-13',
      dateLabel: {
        pt: '13 Nov 2026',
        en: '13 Nov 2026',
      },
    },
    milestonesCompleted: 4,
    milestonesTotal: 5,
    scale: '1 : 20',
    areaSqm: '480 m²',
    elevationDatum: '±0.00 m',
    leadAuthorCode: 'INV-06',
    leadAuthorName: 'Diogo Tembe',
    leadUserId: 'usr-eqp-06',
    contributorUserIds: ['usr-eqp-06', 'usr-com-05', 'usr-dir-01'],
    assignedRoles: ['communications', 'staff', 'department_lead', 'director'],
    imageSrc: '/assets/studio-desk/materials-climate-study.webp',
    imageAlt: {
      pt: 'Composição ortogonal de amostras materiais sobre ardósia escura com bloco de betão, tijolo de terra terracota, régua de madeira e escala anodizada.',
      en: 'Orthogonal material palette on dark slate showing board-formed concrete block, terracotta compressed earth brick, oak batten, and matte black scale bar.',
    },
    dossierNotes: {
      pt: 'Pedido demonstrativo de curadoria interna: a pré-visualização editorial permanece local até futura implementação da Fase 06.',
      en: 'Demonstrative internal curation request: editorial preview remains strictly local until future Phase 06 delivery.',
    },
    deliverables: [
      {
        id: 'del-112-a',
        code: 'MAT-112-PT',
        label: {
          pt: 'Fichas técnicas de inércia térmica (PT-MZ)',
          en: 'Thermal inertia technical sheets (PT-MZ)',
        },
        ready: true,
      },
      {
        id: 'del-112-b',
        code: 'MAT-112-EN',
        label: {
          pt: 'Tradução revista e legendas acessíveis (EN)',
          en: 'Reviewed translation and accessible captions (EN)',
        },
        ready: false,
      },
    ],
    roleFocalNote: {
      communications: {
        pt: 'Foco Comunicação: rever paridade PT/EN e texto alternativo das 4 amostras antes de submeter à Direcção.',
        en: 'Comms focus: audit PT/EN parity and alt text across the 4 material plates prior to Direction sign-off.',
      },
      staff: {
        pt: 'Foco Equipa Técnica: completar tabela de condutividade térmica nas fichas MAT-04 e MAT-05.',
        en: 'Technical staff focus: complete thermal conductivity table on sheets MAT-04 and MAT-05.',
      },
      director: {
        pt: 'Foco Direcção: pedido de pré-visualização local registado; sem publicação externa nesta fase.',
        en: 'Direction focus: local preview request logged; no external website publishing in this phase.',
      },
    },
  },
  {
    id: 'sd-proj-oa-26-119',
    code: 'OA-26-119',
    title: {
      pt: 'Oficina de Leitura em Terra Compactada',
      en: 'Rammed-Earth Reading Workshop',
    },
    subtitle: {
      pt: 'Estudo conceptual fictício de pequena biblioteca comunitária com cobertura ventilada e pátio sombreado.',
      en: 'Fictive schematic study for a neighborhood reading room with ventilated timber roof and shaded court.',
    },
    discipline: {
      pt: 'Interiores & Matéria',
      en: 'Interiors & Materiality',
    },
    departmentId: 'interiors',
    studioBase: 'Maputo',
    phase: {
      pt: 'Estudo Prévio · Conceito',
      en: 'Concept Design · Schematic',
    },
    projectStatus: 'concept',
    publicationStatus: 'private',
    reviewState: 'approved_internal',
    priorityRank: 4,
    nextMilestone: {
      title: {
        pt: 'Definição da modulação de estantes e mobiliário fixo',
        en: 'Define shelving module and bespoke joinery grid',
      },
      dateIso: '2026-11-18',
      dateLabel: {
        pt: '18 Nov 2026',
        en: '18 Nov 2026',
      },
    },
    milestonesCompleted: 1,
    milestonesTotal: 4,
    scale: '1 : 200',
    areaSqm: '1 650 m²',
    elevationDatum: '+3.80 m NMM',
    leadAuthorCode: 'ARQ-02',
    leadAuthorName: 'Mateo Conti',
    leadUserId: 'usr-arq-02',
    contributorUserIds: ['usr-arq-02', 'usr-gpr-03', 'usr-eqp-06'],
    assignedRoles: ['architect', 'staff', 'project_manager'],
    imageSrc: '/assets/studies/welcome-maquette-study.webp',
    imageAlt: {
      pt: 'Maquete de estudo em madeira e terracota sobre base topográfica escura em degraus.',
      en: 'Timber and terracotta study maquette resting on a dark stepped topographic plinth.',
    },
    dossierNotes: {
      pt: 'Conceito aprovado internamente para iniciar modelação espacial preliminar.',
      en: 'Concept approved internally to initiate preliminary spatial modeling.',
    },
    deliverables: [
      {
        id: 'del-119-a',
        code: 'CON-119-01',
        label: {
          pt: 'Caderno de implantação e ventilação cruzada',
          en: 'Site orientation and cross-ventilation brief',
        },
        ready: true,
      },
    ],
    roleFocalNote: {
      architect: {
        pt: 'Foco Arquitectura: estudar ritmo das vigas de madeira para reduzir vão central.',
        en: 'Architecture focus: study timber beam cadence to optimize central span.',
      },
      staff: {
        pt: 'Foco Equipa Técnica: recolher referências de acústica para sala de leitura silenciosa.',
        en: 'Technical staff focus: gather acoustic benchmarks for the quiet reading room.',
      },
    },
  },
  {
    id: 'sd-proj-oa-25-084',
    code: 'OA-25-084',
    title: {
      pt: 'Pátio de Sombra & Espelho do Estuário',
      en: 'Estuary Shade Court & Reflecting Basin',
    },
    subtitle: {
      pt: 'Registo fictício concluído de arquivo interno sobre paredes monolíticas e controlo solar passivo.',
      en: 'Completed fictive internal archive record examining monolithic walls and passive solar control.',
    },
    discipline: {
      pt: 'Arquitectura & Paisagem',
      en: 'Architecture & Landscape',
    },
    departmentId: 'architecture',
    studioBase: 'Milão',
    phase: {
      pt: 'Arquivo Técnico Concluído',
      en: 'Completed Technical Archive',
    },
    projectStatus: 'completed',
    publicationStatus: 'private',
    reviewState: 'approved_internal',
    priorityRank: 5,
    nextMilestone: {
      title: {
        pt: 'Dossier encerrado para consulta interna de referência',
        en: 'Dossier closed for internal studio reference',
      },
      dateIso: '2026-10-28',
      dateLabel: {
        pt: '28 Out 2026',
        en: '28 Oct 2026',
      },
    },
    milestonesCompleted: 5,
    milestonesTotal: 5,
    scale: '1 : 100',
    areaSqm: '1 180 m²',
    elevationDatum: '±0.00 m NMM',
    leadAuthorCode: 'DIR-01',
    leadAuthorName: 'Helena Mondlane',
    leadUserId: 'usr-dir-01',
    contributorUserIds: ['usr-dir-01', 'usr-com-05', 'usr-eqp-06'],
    assignedRoles: ['director', 'communications', 'staff'],
    imageSrc: '/assets/studies/login-spatial-study.webp',
    imageAlt: {
      pt: 'Estudo espacial de paredes monolíticas em betão cofrado e plano de taipa terracota sobre espelho de água.',
      en: 'Spatial study of monolithic board-formed concrete walls and terracotta rammed-earth plane above a still water basin.',
    },
    dossierNotes: {
      pt: 'Peça de referência interna utilizada para calibrar sombras rasantes e cotas de água nos projectos actuais.',
      en: 'Internal reference piece used to calibrate raking light shadows and water datums across active studies.',
    },
    deliverables: [
      {
        id: 'del-084-a',
        code: 'ARC-084-FIN',
        label: {
          pt: 'Caderno final de arquivo interno (Privado)',
          en: 'Final internal archive monograph (Private)',
        },
        ready: true,
      },
    ],
    roleFocalNote: {
      director: {
        pt: 'Referência de linguagem tectónica preservada no arquivo privado do atelier.',
        en: 'Tectonic language reference preserved in the studio private archive.',
      },
      communications: {
        pt: 'Base fotográfica de referência interna; não publicada externamente.',
        en: 'Internal photographic reference; not published externally.',
      },
    },
  },
];

export const STUDIO_DESK_TASKS: StudioDeskTask[] = [
  {
    id: 'task-dir-01',
    code: 'REV · 01',
    title: {
      pt: 'Emitir parecer final sobre corte AA da Galeria Cívica',
      en: 'Issue final critique on Civic Gallery section AA',
    },
    detail: {
      pt: 'Validar cota +6.40m da consola nascente e relação entre o pátio sombreado e a rua cívica.',
      en: 'Validate +6.40m east cantilever datum and spatial link between shaded court and civic street.',
    },
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    departmentId: 'direction',
    primaryRoles: ['director', 'architect'],
    priority: 'high',
    status: 'pending',
    dueDateIso: '2026-11-12',
    dueLabel: { pt: '12 Nov 2026 · 11:00 CAT', en: '12 Nov 2026 · 11:00 CAT' },
    assigneeUserId: 'usr-dir-01',
    assigneeLabel: 'Helena Mondlane',
    referenceTag: { pt: 'Decisão Editorial', en: 'Editorial Sign-off' },
  },
  {
    id: 'task-arq-02',
    code: 'PRN · 02',
    title: {
      pt: 'Fechar pormenor de encontro taipa–vidro na prancha 1:50',
      en: 'Finalize rammed-earth to glazing junction on 1:50 sheet',
    },
    detail: {
      pt: 'Ajustar pingadeira metálica anodizada e folga de dilatação antes da revisão semanal.',
      en: 'Adjust anodized drip profile and expansion joint prior to weekly design critique.',
    },
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    departmentId: 'architecture',
    primaryRoles: ['architect', 'director'],
    priority: 'high',
    status: 'in_progress',
    dueDateIso: '2026-11-13',
    dueLabel: { pt: '13 Nov 2026 · 17:00 CET', en: '13 Nov 2026 · 17:00 CET' },
    assigneeUserId: 'usr-arq-02',
    assigneeLabel: 'Mateo Conti',
    referenceTag: { pt: 'Prancha 1:50 · v04', en: '1:50 Sheet · v04' },
  },
  {
    id: 'task-gpr-03',
    code: 'MRC · 03',
    title: {
      pt: 'Confirmar dependência hidráulica do Corredor da Costa',
      en: 'Confirm hydraulic dependency for Coastal Promenade',
    },
    detail: {
      pt: 'Alinhar janela de entrega entre Urbanismo e consultoria externa para o marco de 14 Nov.',
      en: 'Align handover window between Urbanism and external engineering track ahead of 14 Nov milestone.',
    },
    projectId: 'sd-proj-oa-26-108',
    projectCode: 'OA-26-108',
    departmentId: 'project_management',
    primaryRoles: ['project_manager', 'department_lead', 'director'],
    priority: 'high',
    status: 'pending',
    dueDateIso: '2026-11-14',
    dueLabel: { pt: '14 Nov 2026 · 10:00 CAT', en: '14 Nov 2026 · 10:00 CAT' },
    assigneeUserId: 'usr-gpr-03',
    assigneeLabel: 'Inês Macamo',
    referenceTag: { pt: 'Dependência Crítica', en: 'Critical Dependency' },
  },
  {
    id: 'task-dep-04',
    code: 'EQP · 04',
    title: {
      pt: 'Equilibrar alocação de Urbanismo para os perfis 1:500',
      en: 'Balance Urbanism allocation for 1:500 coastal sections',
    },
    detail: {
      pt: 'Distribuir verificação de cotas pedonais entre estúdio de Maputo e apoio técnico de Milão.',
      en: 'Distribute pedestrian datum verification between Maputo studio and Milan technical desk.',
    },
    projectId: 'sd-proj-oa-26-108',
    projectCode: 'OA-26-108',
    departmentId: 'urbanism',
    primaryRoles: ['department_lead', 'project_manager'],
    priority: 'high',
    status: 'in_progress',
    dueDateIso: '2026-11-14',
    dueLabel: { pt: '14 Nov 2026 · 15:00 CAT', en: '14 Nov 2026 · 15:00 CAT' },
    assigneeUserId: 'usr-dep-04',
    assigneeLabel: 'Tomás Nhantumbo',
    referenceTag: { pt: 'Alocação Departamental', en: 'Department Allocation' },
  },
  {
    id: 'task-com-05',
    code: 'EDT · 05',
    title: {
      pt: 'Auditar paridade PT/EN do Arquivo de Matéria & Clima',
      en: 'Audit PT/EN parity for Materiality & Climate Archive',
    },
    detail: {
      pt: 'Garantir correspondência terminológica entre fichas MAT-01..05 e legendas de acessibilidade.',
      en: 'Verify terminology parity across MAT-01..05 sheets and accessible photographic captions.',
    },
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    departmentId: 'communications',
    primaryRoles: ['communications', 'director'],
    priority: 'high',
    status: 'pending',
    dueDateIso: '2026-11-13',
    dueLabel: { pt: '13 Nov 2026 · 16:00 CET', en: '13 Nov 2026 · 16:00 CET' },
    assigneeUserId: 'usr-com-05',
    assigneeLabel: 'Clara Ferraz',
    referenceTag: { pt: 'Fila Editorial', en: 'Editorial Queue' },
  },
  {
    id: 'task-eqp-06',
    code: 'MAT · 06',
    title: {
      pt: 'Compilar tabela de atraso térmico em terra comprimida',
      en: 'Compile thermal lag table for compressed earth blocks',
    },
    detail: {
      pt: 'Anexar leituras de ensaio demonstrativo à ficha técnica da biblioteca interna.',
      en: 'Attach demonstrative trial readings to the internal technical library dossier.',
    },
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    departmentId: 'research',
    primaryRoles: ['staff', 'architect', 'communications'],
    priority: 'high',
    status: 'pending',
    dueDateIso: '2026-11-15',
    dueLabel: { pt: '15 Nov 2026 · 12:00 CAT', en: '15 Nov 2026 · 12:00 CAT' },
    assigneeUserId: 'usr-eqp-06',
    assigneeLabel: 'Diogo Tembe',
    referenceTag: { pt: 'Documentação Técnica', en: 'Technical Documentation' },
  },
  {
    id: 'task-arq-07',
    code: 'MAQ · 07',
    title: {
      pt: 'Catalogar fotografias da maquete 1:100 sob luz rasante',
      en: 'Catalog 1:100 maquette raking-light photographs',
    },
    detail: {
      pt: 'Organizar ângulos de pátio e galeria poente para o caderno interno da Fase 03.',
      en: 'Organize courtyard and west gallery angles for the upcoming Phase 03 internal dossier.',
    },
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    departmentId: 'architecture',
    primaryRoles: ['architect', 'communications', 'staff'],
    priority: 'medium',
    status: 'completed',
    dueDateIso: '2026-11-07',
    dueLabel: { pt: '07 Nov 2026', en: '07 Nov 2026' },
    assigneeUserId: 'usr-arq-02',
    assigneeLabel: 'Mateo Conti',
    referenceTag: { pt: 'Arquivo Maquete', en: 'Maquette Archive' },
  },
  {
    id: 'task-gpr-08',
    code: 'CRN · 08',
    title: {
      pt: 'Rever sequência de marcos Q4 entre Maputo e Milão',
      en: 'Review Q4 milestone cadence across Maputo and Milan',
    },
    detail: {
      pt: 'Confirmar datas internas de entrega antes da síntese mensal da Direcção.',
      en: 'Confirm internal issue dates ahead of the monthly Direction synthesis.',
    },
    projectId: 'sd-proj-oa-26-119',
    projectCode: 'OA-26-119',
    departmentId: 'project_management',
    primaryRoles: ['project_manager', 'department_lead', 'director'],
    priority: 'medium',
    status: 'in_progress',
    dueDateIso: '2026-11-18',
    dueLabel: { pt: '18 Nov 2026', en: '18 Nov 2026' },
    assigneeUserId: 'usr-gpr-03',
    assigneeLabel: 'Inês Macamo',
    referenceTag: { pt: 'Cronograma Q4', en: 'Q4 Schedule' },
  },
  {
    id: 'task-eqp-09',
    code: 'REF · 09',
    title: {
      pt: 'Indexar referências acústicas para oficina de leitura',
      en: 'Index acoustic benchmarks for reading workshop',
    },
    detail: {
      pt: 'Registar tempos de reverberação recomendados em bibliotecas com cobertura em madeira.',
      en: 'Record recommended reverberation targets for timber-roofed reading rooms.',
    },
    projectId: 'sd-proj-oa-26-119',
    projectCode: 'OA-26-119',
    departmentId: 'research',
    primaryRoles: ['staff', 'architect', 'department_lead'],
    priority: 'base',
    status: 'completed',
    dueDateIso: '2026-11-06',
    dueLabel: { pt: '06 Nov 2026', en: '06 Nov 2026' },
    assigneeUserId: 'usr-eqp-06',
    assigneeLabel: 'Diogo Tembe',
    referenceTag: { pt: 'Normas & Referências', en: 'Standards & Refs' },
  },
  {
    id: 'task-dir-10',
    code: 'CUR · 10',
    title: {
      pt: 'Aprovar estrutura do caderno bilingue de Matéria & Clima',
      en: 'Approve bilingual monograph structure for Materiality & Climate',
    },
    detail: {
      pt: 'Validar sequência editorial das 4 amostras e critérios de citação técnica interna.',
      en: 'Validate editorial ordering of the 4 material samples and internal technical citation notes.',
    },
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    departmentId: 'direction',
    primaryRoles: ['director', 'communications'],
    priority: 'medium',
    status: 'in_progress',
    dueDateIso: '2026-11-16',
    dueLabel: { pt: '16 Nov 2026', en: '16 Nov 2026' },
    assigneeUserId: 'usr-dir-01',
    assigneeLabel: 'Helena Mondlane',
    referenceTag: { pt: 'Revisão Editorial', en: 'Editorial Review' },
  },
  {
    id: 'task-dep-11',
    code: 'LIM · 11',
    title: {
      pt: 'Coordenar soleira urbana da Galeria Cívica com passeio poente',
      en: 'Coordinate Civic Gallery urban threshold with west promenade',
    },
    detail: {
      pt: 'Ajustar transição de pavimento drenante e rampa acessível entre lote cívico e via arborizada.',
      en: 'Align permeable paving transition and accessible ramp between civic plot and shaded avenue.',
    },
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    departmentId: 'urbanism',
    primaryRoles: ['department_lead', 'architect'],
    priority: 'medium',
    status: 'pending',
    dueDateIso: '2026-11-17',
    dueLabel: { pt: '17 Nov 2026', en: '17 Nov 2026' },
    assigneeUserId: 'usr-dep-04',
    assigneeLabel: 'Tomás Nhantumbo',
    referenceTag: { pt: 'Transição Urbana', en: 'Urban Threshold' },
  },
  {
    id: 'task-com-12',
    code: 'TXT · 12',
    title: {
      pt: 'Consolidar nota descritiva privada da Galeria Ponta Vermelha',
      en: 'Consolidate private descriptive note for Ponta Vermelha Gallery',
    },
    detail: {
      pt: 'Preparar rascunho bilingue interno sem publicação externa, alinhado com as cotas do corte AA.',
      en: 'Prepare internal bilingual draft aligned with section AA datums while remaining private by default.',
    },
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    departmentId: 'communications',
    primaryRoles: ['communications', 'architect'],
    priority: 'medium',
    status: 'in_progress',
    dueDateIso: '2026-11-19',
    dueLabel: { pt: '19 Nov 2026', en: '19 Nov 2026' },
    assigneeUserId: 'usr-com-05',
    assigneeLabel: 'Clara Ferraz',
    referenceTag: { pt: 'Nota Descritiva', en: 'Project Note' },
  },
];

export const STUDIO_DESK_ACTIVITIES: StudioDeskActivityEntry[] = [
  {
    id: 'act-01',
    kind: 'review',
    actorUserId: 'usr-arq-02',
    originLabel: 'Mateo Conti · ARQ · Milão',
    departmentId: 'architecture',
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    timestampIso: '2026-11-10T12:20:00Z',
    dateLabel: { pt: '10 Nov 2026 · 14:20 CAT', en: '10 Nov 2026 · 14:20 CAT' },
    summary: {
      pt: 'Submetida revisão v04 do corte longitudinal AA com ajuste dos brise-soleil da fachada nascente.',
      en: 'Submitted longitudinal section AA revision v04 with adjusted east facade timber louvers.',
    },
    relevantRoles: ['director', 'architect', 'department_lead'],
  },
  {
    id: 'act-02',
    kind: 'editorial',
    actorUserId: 'usr-com-05',
    originLabel: 'Clara Ferraz · COM · Milão',
    departmentId: 'communications',
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    timestampIso: '2026-11-10T09:05:00Z',
    dateLabel: { pt: '10 Nov 2026 · 11:05 CAT', en: '10 Nov 2026 · 11:05 CAT' },
    summary: {
      pt: 'Sinalizada revisão terminológica PT/EN nos cadernos de amostras minerais (fila editorial local).',
      en: 'Flagged PT/EN terminology pass on mineral sample sheets (local editorial queue).',
    },
    relevantRoles: ['communications', 'director', 'staff'],
  },
  {
    id: 'act-03',
    kind: 'phase_change',
    actorUserId: 'usr-gpr-03',
    originLabel: 'Inês Macamo · GPR · Maputo',
    departmentId: 'project_management',
    projectId: 'sd-proj-oa-26-108',
    projectCode: 'OA-26-108',
    timestampIso: '2026-11-09T15:40:00Z',
    dateLabel: { pt: '09 Nov 2026 · 17:40 CAT', en: '09 Nov 2026 · 17:40 CAT' },
    summary: {
      pt: 'Marco de permeabilidade costeira reajustado para 14 Nov após consolidação das cotas de maré.',
      en: 'Coastal permeability milestone aligned to 14 Nov after tidal datum consolidation.',
    },
    relevantRoles: ['project_manager', 'department_lead', 'director'],
  },
  {
    id: 'act-04',
    kind: 'delivery',
    actorUserId: 'usr-dep-04',
    originLabel: 'Tomás Nhantumbo · URB · Maputo',
    departmentId: 'urbanism',
    projectId: 'sd-proj-oa-26-108',
    projectCode: 'OA-26-108',
    timestampIso: '2026-11-09T07:50:00Z',
    dateLabel: { pt: '09 Nov 2026 · 09:50 CAT', en: '09 Nov 2026 · 09:50 CAT' },
    summary: {
      pt: 'Entregue planta 1:500 de sombreamento arbóreo para verificação interdepartamental.',
      en: 'Issued 1:500 tree-canopy shade plan for cross-department verification.',
    },
    relevantRoles: ['department_lead', 'project_manager', 'architect'],
  },
  {
    id: 'act-05',
    kind: 'documentation',
    actorUserId: 'usr-eqp-06',
    originLabel: 'Diogo Tembe · INV · Maputo',
    departmentId: 'research',
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    timestampIso: '2026-11-08T14:15:00Z',
    dateLabel: { pt: '08 Nov 2026 · 16:15 CAT', en: '08 Nov 2026 · 16:15 CAT' },
    summary: {
      pt: 'Catalogadas 4 amostras materiais (betão, taipa, carvalho e régua térmica) no arquivo interno.',
      en: 'Cataloged 4 material specimens (concrete, rammed earth, oak, and thermal bar) in internal archive.',
    },
    relevantRoles: ['staff', 'communications', 'architect'],
  },
  {
    id: 'act-06',
    kind: 'review',
    actorUserId: 'usr-dir-01',
    originLabel: 'Helena Mondlane · DIR · Maputo',
    departmentId: 'direction',
    projectId: 'sd-proj-oa-26-119',
    projectCode: 'OA-26-119',
    timestampIso: '2026-11-07T13:30:00Z',
    dateLabel: { pt: '07 Nov 2026 · 15:30 CAT', en: '07 Nov 2026 · 15:30 CAT' },
    summary: {
      pt: 'Aprovado estudo conceptual da Oficina de Leitura em Terra para avançar à fase de mobiliário.',
      en: 'Approved Rammed-Earth Reading Workshop schematic study to proceed toward joinery layout.',
    },
    relevantRoles: ['director', 'architect', 'project_manager', 'staff'],
  },
];

export const ROLE_DESK_CONFIGS: Record<Role, RoleDeskConfig> = {
  director: {
    role: 'director',
    deskSubtitle: {
      pt: 'Visão transversal de direcção, pareceres críticos e critério editorial.',
      en: 'Cross-studio direction view, design critique, and editorial judgment.',
    },
    editorialLine: {
      pt: 'Decidir onde o desenho ganha clareza antes de multiplicar pranchas.',
      en: 'Decide where drawing gains clarity before multiplying sheets.',
    },
    focalLensLabel: {
      pt: 'Lente Direcção · Decisão & Portfólio',
      en: 'Direction Lens · Decisions & Portfolio',
    },
    featuredProjectId: 'sd-proj-oa-26-101',
    defaultPresentationMode: 'editorial',
    sectionOrder: ['priorities', 'featured', 'overview', 'activity'],
    overviewFocusNote: {
      pt: 'Projectos ordenados por impacto estratégico e estado de revisão interna.',
      en: 'Projects ordered by strategic relevance and internal review status.',
    },
    quickFocusLabel: {
      pt: 'Foco Direcção',
      en: 'Direction Focus',
    },
    prioritiesLeadNote: {
      pt: 'Pareceres críticos, validações de fase e decisões editoriais pendentes.',
      en: 'Pending design critiques, phase approvals, and editorial decisions.',
    },
    activityLeadNote: {
      pt: 'Movimentos recentes entre departamentos com impacto de decisão.',
      en: 'Recent cross-department movements requiring executive visibility.',
    },
  },
  architect: {
    role: 'architect',
    deskSubtitle: {
      pt: 'Pranchas em revisão técnica, maquetes físicas e próximas entregas de desenho.',
      en: 'Sheets under technical review, physical maquettes, and upcoming drawing issues.',
    },
    editorialLine: {
      pt: 'Cada cota rigorosa protege a intenção espacial até ao estaleiro.',
      en: 'Every precise datum protects spatial intent all the way to site.',
    },
    focalLensLabel: {
      pt: 'Lente Arquitectura · Dossiers & Pranchas',
      en: 'Architecture Lens · Dossiers & Sheets',
    },
    featuredProjectId: 'sd-proj-oa-26-101',
    defaultPresentationMode: 'editorial',
    sectionOrder: ['priorities', 'featured', 'overview', 'activity'],
    overviewFocusNote: {
      pt: 'Dossiers activos com destaque para entregas 1:50, 1:100 e referências de maquete.',
      en: 'Active dossiers highlighting 1:50, 1:100 issues and maquette references.',
    },
    quickFocusLabel: {
      pt: 'Foco Projecto',
      en: 'Design Focus',
    },
    prioritiesLeadNote: {
      pt: 'Pormenorização construtiva, cortes em revisão e entregas de atelier.',
      en: 'Constructive detailing, sections in review, and studio issues.',
    },
    activityLeadNote: {
      pt: 'Registo técnico de revisões de pranchas e documentação espacial.',
      en: 'Technical log of drawing revisions and spatial documentation.',
    },
  },
  project_manager: {
    role: 'project_manager',
    deskSubtitle: {
      pt: 'Marcos semanais, dependências entre equipas e controlo de cadência.',
      en: 'Weekly milestones, cross-team dependencies, and schedule cadence.',
    },
    editorialLine: {
      pt: 'Previsibilidade de entregas sem sacrificar o tempo necessário ao projecto.',
      en: 'Reliable delivery cadence without compressing essential design time.',
    },
    focalLensLabel: {
      pt: 'Lente Gestão · Cronogramas & Marcos',
      en: 'PM Lens · Schedules & Milestones',
    },
    featuredProjectId: 'sd-proj-oa-26-108',
    defaultPresentationMode: 'technical',
    sectionOrder: ['priorities', 'featured', 'overview', 'activity'],
    overviewFocusNote: {
      pt: 'Lista operacional com marcos próximos, responsáveis e proporção de entregas.',
      en: 'Operational register showing upcoming milestones, leads, and deliverable ratios.',
    },
    quickFocusLabel: {
      pt: 'Foco Marcos',
      en: 'Milestone Focus',
    },
    prioritiesLeadNote: {
      pt: 'Dependências críticas, prazos próximos e coordenação de frentes.',
      en: 'Critical dependencies, upcoming due dates, and multi-track coordination.',
    },
    activityLeadNote: {
      pt: 'Mudanças de fase, actualizações de calendário e entregas registadas.',
      en: 'Phase updates, schedule adjustments, and logged deliveries.',
    },
  },
  department_lead: {
    role: 'department_lead',
    deskSubtitle: {
      pt: 'Supervisão departamental, revisões internas e distribuição equilibrada da equipa.',
      en: 'Departmental oversight, internal reviews, and balanced team allocation.',
    },
    editorialLine: {
      pt: 'Coordenar frentes paralelas com critérios partilhados entre Maputo e Milão.',
      en: 'Coordinate parallel tracks with shared standards across Maputo and Milan.',
    },
    focalLensLabel: {
      pt: 'Lente Coordenação · Equipa & Revisões',
      en: 'Lead Lens · Team & Reviews',
    },
    featuredProjectId: 'sd-proj-oa-26-108',
    defaultPresentationMode: 'technical',
    sectionOrder: ['priorities', 'featured', 'overview', 'activity'],
    overviewFocusNote: {
      pt: 'Acompanhamento de projectos atribuídos ao departamento e estado de revisão.',
      en: 'Tracking of projects assigned to the department and review states.',
    },
    quickFocusLabel: {
      pt: 'Foco Equipa',
      en: 'Team Focus',
    },
    prioritiesLeadNote: {
      pt: 'Alocações de carga, revisões técnicas pendentes e apoio interdisciplinar.',
      en: 'Workload allocations, pending technical reviews, and interdisciplinary support.',
    },
    activityLeadNote: {
      pt: 'Submissões recentes da equipa, entregas e pedidos de validação.',
      en: 'Recent team submissions, issues, and validation requests.',
    },
  },
  communications: {
    role: 'communications',
    deskSubtitle: {
      pt: 'Curadoria bilingue PT/EN, materiais gráficos e fila editorial demonstrativa.',
      en: 'Bilingual PT/EN curation, visual materials, and demonstrative editorial queue.',
    },
    editorialLine: {
      pt: 'Documentar a obra com precisão factual antes de qualquer exposição pública.',
      en: 'Document the work with factual rigor prior to any public presentation.',
    },
    focalLensLabel: {
      pt: 'Lente Comunicação · Curadoria PT/EN',
      en: 'Comms Lens · PT/EN Curation',
    },
    featuredProjectId: 'sd-proj-oa-26-112',
    defaultPresentationMode: 'editorial',
    sectionOrder: ['priorities', 'featured', 'overview', 'activity'],
    overviewFocusNote: {
      pt: 'Projectos com estado editorial privado por omissão ou em curadoria local.',
      en: 'Projects with private-by-default status or under local editorial curation.',
    },
    quickFocusLabel: {
      pt: 'Foco Editorial',
      en: 'Editorial Focus',
    },
    prioritiesLeadNote: {
      pt: 'Paridade bilingue PT/EN, legendas acessíveis e pré-visualização local.',
      en: 'PT/EN parity, accessible captions, and local preview preparation.',
    },
    activityLeadNote: {
      pt: 'Registo de materiais catalogados, créditos e pedidos de revisão editorial.',
      en: 'Log of cataloged materials, credits, and editorial review requests.',
    },
  },
  staff: {
    role: 'staff',
    deskSubtitle: {
      pt: 'Tarefas atribuídas, cadernos de documentação e referências técnicas.',
      en: 'Assigned tasks, documentation dossiers, and technical benchmarks.',
    },
    editorialLine: {
      pt: 'Organizar matéria, ensaios e referências para sustentar cada decisão de projecto.',
      en: 'Organize materials, trials, and references supporting every design decision.',
    },
    focalLensLabel: {
      pt: 'Lente Equipa Técnica · Tarefas & Arquivo',
      en: 'Staff Lens · Tasks & Archive',
    },
    featuredProjectId: 'sd-proj-oa-26-112',
    defaultPresentationMode: 'technical',
    sectionOrder: ['priorities', 'featured', 'overview', 'activity'],
    overviewFocusNote: {
      pt: 'Projectos com documentação activa e dossiers de referência técnica.',
      en: 'Projects with active documentation and technical reference dossiers.',
    },
    quickFocusLabel: {
      pt: 'As Minhas Tarefas',
      en: 'My Tasks',
    },
    prioritiesLeadNote: {
      pt: 'Entregas individuais atribuídas, fichas técnicas e normas em curso.',
      en: 'Assigned individual deliverables, technical sheets, and ongoing benchmarks.',
    },
    activityLeadNote: {
      pt: 'Actualizações da biblioteca técnica e decisões recentes sobre os projectos.',
      en: 'Technical library updates and recent project decisions.',
    },
  },
};

export function createInitialTaskStatusMap(): Record<string, StudioDeskTask['status']> {
  return STUDIO_DESK_TASKS.reduce<Record<string, StudioDeskTask['status']>>(
    (acc, task) => {
      acc[task.id] = task.status;
      return acc;
    },
    {},
  );
}

export function loadStudioDeskLocalState(): StudioDeskLocalState {
  const defaults: StudioDeskLocalState = {
    taskStatuses: createInitialTaskStatusMap(),
    showDatumOverlay: true,
  };
  try {
    const raw = window.localStorage.getItem(STUDIO_DESK_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<StudioDeskLocalState>;
    const sanitizedStatuses = { ...defaults.taskStatuses };
    if (parsed.taskStatuses && typeof parsed.taskStatuses === 'object') {
      for (const task of STUDIO_DESK_TASKS) {
        const candidate = parsed.taskStatuses[task.id];
        if (
          candidate === 'pending' ||
          candidate === 'in_progress' ||
          candidate === 'completed'
        ) {
          sanitizedStatuses[task.id] = candidate;
        }
      }
    }
    const sanitizedModes: StudioDeskLocalState['presentationModeByRole'] = {};
    if (
      parsed.presentationModeByRole &&
      typeof parsed.presentationModeByRole === 'object'
    ) {
      for (const roleKey of VALID_DESK_ROLES) {
        const candidateMode = parsed.presentationModeByRole[roleKey];
        if (candidateMode === 'editorial' || candidateMode === 'technical') {
          sanitizedModes[roleKey] = candidateMode;
        }
      }
    }

    return {
      taskStatuses: sanitizedStatuses,
      presentationModeByRole:
        Object.keys(sanitizedModes).length > 0 ? sanitizedModes : undefined,
      showDatumOverlay:
        typeof parsed.showDatumOverlay === 'boolean'
          ? parsed.showDatumOverlay
          : true,
    };
  } catch {
    return defaults;
  }
}

export function saveStudioDeskLocalState(state: StudioDeskLocalState): void {
  try {
    window.localStorage.setItem(STUDIO_DESK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or restricted mode errors
  }
}

export function clearStudioDeskLocalState(): StudioDeskLocalState {
  try {
    window.localStorage.removeItem(STUDIO_DESK_STORAGE_KEY);
  } catch {
    // Ignore storage removal errors
  }
  return {
    taskStatuses: createInitialTaskStatusMap(),
    showDatumOverlay: true,
  };
}
