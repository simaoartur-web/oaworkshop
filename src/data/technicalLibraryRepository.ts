import { DEPARTMENTS } from './fixtures';
import {
  getProjectById,
  PROJECT_LIBRARY_UPDATED_EVENT,
} from './projectLibraryRepository';
import type {
  CreateTechnicalReferenceInput,
  TechnicalLibraryCategory,
  TechnicalLibrarySnapshot,
  TechnicalReferenceRecord,
} from './studioStructureTypes';
import type { DepartmentId, LocalizedText } from './types';

export const TECHNICAL_LIBRARY_STORAGE_KEY =
  'oa_workspace_technical_library_v1';
export const TECHNICAL_LIBRARY_UPDATED_EVENT = 'oa:technical-library-updated';

export const TECHNICAL_LIBRARY_LIMITS = {
  MAX_LOCAL_TECH_REFS: 100,
  MAX_CODE_LENGTH: 32,
  MAX_TITLE_LENGTH: 160,
  MAX_SUMMARY_LENGTH: 1200,
  MAX_SPECS_LENGTH: 2000,
  MAX_SHORT_FIELD_LENGTH: 120,
  MAX_CITATION_LENGTH: 400,
  MAX_RELATED_PROJECTS: 20,
} as const;

interface StoredTechnicalLibraryEnvelope {
  version: 1;
  createdReferences: TechnicalReferenceRecord[];
}

const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

const VALID_CATEGORIES = new Set<TechnicalLibraryCategory>([
  'material',
  'constructive_system',
  'technical_study',
]);

const CATEGORY_CODE_PREFIX: Record<TechnicalLibraryCategory, string> = {
  material: 'MAT',
  constructive_system: 'SYS',
  technical_study: 'EST',
};

const SEED_CREATED_AT = '2026-10-15T09:00:00.000Z';
const SEED_UPDATED_AT = '2026-11-10T12:00:00.000Z';

export const SEED_TECHNICAL_REFERENCES: readonly TechnicalReferenceRecord[] = [
  {
    id: 'tech-mat-001',
    code: 'MAT-001',
    category: 'material',
    title: {
      pt: 'Betão Aparente Cofrado com Inertes Locais',
      en: 'Board-Formed Exposed Concrete with Local Aggregates',
    },
    summary: {
      pt: 'Betão arquitectónico pigmentado em massa de cinza escuro com cofragem de tábuas de pinho tratado para fachadas costeiras de baixa manutenção.',
      en: 'Mass-pigmented dark grey architectural concrete cast in treated pine formwork for low-maintenance coastal facades.',
    },
    technicalSpecs: {
      pt: 'Classe C30/37 · Exposição XS1 (ambiente marítimo) · Recobrimento mínimo 45 mm · Hidrofugação silano-siloxano mate.',
      en: 'Class C30/37 · Exposure XS1 (coastal environment) · Minimum cover 45 mm · Matte silane-siloxane water repellent.',
    },
    originRegion: {
      pt: 'Maputo / Sul de Moçambique (Demo)',
      en: 'Maputo / Southern Mozambique (Demo)',
    },
    standardsTag: 'EN 206 · NP EN 1992-1-1',
    departmentId: 'architecture',
    relatedProjectIds: ['sd-proj-oa-26-101', 'sd-proj-oa-25-084'],
    referenceCitation: {
      pt: 'Caderno Interno de Matéria O+A · Ficha MAT-001 (Referência Demonstrativa).',
      en: 'O+A Internal Materiality Log · Sheet MAT-001 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-mat-002',
    code: 'MAT-002',
    category: 'material',
    title: {
      pt: 'Madeira Certificada Umbila e Chacate',
      en: 'Certified Umbila & Chacate Hardwood',
    },
    summary: {
      pt: 'Espécies folhosas regionais de elevada estabilidade dimensional aplicadas em ripados exteriores, mobiliário fixo e caixilharias sombreadas.',
      en: 'Regional hardwood species with high dimensional stability used in exterior louvers, bespoke joinery, and shaded frames.',
    },
    technicalSpecs: {
      pt: 'Densidade 650–850 kg/m³ · Humidade de equilíbrio 10–12% · Acabamento a óleo natural UV com manutenção trienal.',
      en: 'Density 650–850 kg/m³ · Equilibrium moisture 10–12% · Natural UV oil finish with 3-year maintenance cycle.',
    },
    originRegion: {
      pt: 'Moçambique · Origem Florestal Certificada (Demo)',
      en: 'Mozambique · Certified Forestry Origin (Demo)',
    },
    standardsTag: 'FSC · EN 338 · Classe D40',
    departmentId: 'interiors',
    relatedProjectIds: ['sd-proj-oa-26-101', 'sd-proj-oa-26-119'],
    referenceCitation: {
      pt: 'Arquivo de Amostras O+A · Prateleira M-02 (Referência Demonstrativa).',
      en: 'O+A Sample Archive · Shelf M-02 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-mat-003',
    code: 'MAT-003',
    category: 'material',
    title: {
      pt: 'Blocos de Terra Comprimida Pigmentada (BTC)',
      en: 'Pigmented Compressed Earth Blocks (CEB)',
    },
    summary: {
      pt: 'Alvenaria maciça de terra estabilizada com pigmento mineral terracota para inércia térmica passiva e regulação higrotérmica interior.',
      en: 'Solid stabilized earth masonry with mineral terracotta pigment for passive thermal inertia and indoor hygrothermal buffering.',
    },
    technicalSpecs: {
      pt: 'Resistência à compressão ≥ 5 MPa · Estabilização 6% cimento/cal · Condutividade λ ≈ 0,85 W/m·K · Desfasamento térmico ~10 h.',
      en: 'Compressive strength ≥ 5 MPa · 6% cement/lime stabilization · Thermal conductivity λ ≈ 0.85 W/m·K · ~10 h thermal lag.',
    },
    originRegion: {
      pt: 'Bacia de Maputo / Ensaio Laboratorial (Demo)',
      en: 'Maputo Basin / Lab Trial (Demo)',
    },
    standardsTag: 'ARS 674 · XP P13-901',
    departmentId: 'research',
    relatedProjectIds: ['sd-proj-oa-26-112', 'sd-proj-oa-26-119'],
    referenceCitation: {
      pt: 'Ensaio Climático O+A · Caderno MAT-04/05 (Referência Demonstrativa).',
      en: 'O+A Climatic Trial · Monograph MAT-04/05 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-sys-001',
    code: 'SYS-001',
    category: 'constructive_system',
    title: {
      pt: 'Cobertura Ventilada de Duplo Plano',
      en: 'Double-Skin Ventilated Roof System',
    },
    summary: {
      pt: 'Sistema de sobre-cobertura metálica ou em madeira laminada com câmara de ar contínua de 240 mm para dissipação de radiação solar directa.',
      en: 'Over-roof assembly in metal or glulam with a continuous 240 mm ventilated air cavity to dissipate direct solar gain.',
    },
    technicalSpecs: {
      pt: 'Câmara ventilada ≥ 240 mm · Barreira radiante alumínio · Inclinação mínima 4% · Pingadeira perimetral anodizada.',
      en: 'Ventilated cavity ≥ 240 mm · Reflective radiant barrier · Minimum slope 4% · Anodized perimeter drip profile.',
    },
    originRegion: {
      pt: 'Clima Subtropical Costeiro · Maputo (Demo)',
      en: 'Coastal Subtropical Climate · Maputo (Demo)',
    },
    standardsTag: 'ISO 6946 · EN 1991-1-4',
    departmentId: 'architecture',
    relatedProjectIds: ['sd-proj-oa-26-101', 'sd-proj-oa-26-119'],
    referenceCitation: {
      pt: 'Padrões Construtivos O+A · Detalhe DET-101-07 (Referência Demonstrativa).',
      en: 'O+A Constructive Standards · Detail DET-101-07 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-sys-002',
    code: 'SYS-002',
    category: 'constructive_system',
    title: {
      pt: 'Brise-Soleil Vertical em Ripado de Madeira e Aço',
      en: 'Vertical Timber & Steel Louver Brise-Soleil',
    },
    summary: {
      pt: 'Sistema modular de sombreamento orientado para fachadas nascente/poente com montantes ocultos em aço galvanizado a quente.',
      en: 'Modular shading screen oriented for east/west facades with concealed hot-dip galvanized steel mullions.',
    },
    technicalSpecs: {
      pt: 'Secção de ripa 45 × 140 mm · Passo 180 mm · Factor solar g_tot ≤ 0,18 · Fixação desmontável em inox A4.',
      en: 'Louver section 45 × 140 mm · 180 mm pitch · Solar factor g_tot ≤ 0.18 · Demountable A4 stainless steel fixings.',
    },
    originRegion: {
      pt: 'Eixo Maputo–Milão (Demo)',
      en: 'Maputo–Milan Axis (Demo)',
    },
    standardsTag: 'EN 13561 · ISO 15099',
    departmentId: 'architecture',
    relatedProjectIds: ['sd-proj-oa-26-101'],
    referenceCitation: {
      pt: 'Revisão Técnica Corte AA · v04 (Referência Demonstrativa).',
      en: 'Section AA Technical Review · v04 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-sys-003',
    code: 'SYS-003',
    category: 'constructive_system',
    title: {
      pt: 'Pavimento Permeável e Socalcos de Retenção Pluvial',
      en: 'Permeable Paving & Stormwater Retention Terraces',
    },
    summary: {
      pt: 'Camadas drenantes em lajeta de betão poroso e valas bioretentoras arborizadas para controlo de escoamento superficial em frentes costeiras.',
      en: 'Permeable concrete pavers and planted bioretention swales engineered for surface runoff attenuation along coastal edges.',
    },
    technicalSpecs: {
      pt: 'Taxa de infiltração ≥ 1 800 mm/h · Sub-base brita graduada 300 mm · Geotêxtil filtrante 200 g/m² · Bordo acessível ≤ 2%.',
      en: 'Infiltration rate ≥ 1,800 mm/h · 300 mm open-graded crushed stone sub-base · 200 g/m² geotextile · Accessible slope ≤ 2%.',
    },
    originRegion: {
      pt: 'Frente Costeira · Maputo (Demo)',
      en: 'Coastal Waterfront · Maputo (Demo)',
    },
    standardsTag: 'SUDS C753 · EN 1338',
    departmentId: 'urbanism',
    relatedProjectIds: ['sd-proj-oa-26-108'],
    referenceCitation: {
      pt: 'Plano Territorial URB-108-01 · Nota Hidráulica (Referência Demonstrativa).',
      en: 'Territorial Plan URB-108-01 · Hydraulic Note (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-est-001',
    code: 'EST-001',
    category: 'technical_study',
    title: {
      pt: 'Ventilação Cruzada em Clima Tropical Costeiro (Maputo)',
      en: 'Cross-Ventilation in Coastal Tropical Climate (Maputo)',
    },
    summary: {
      pt: 'Estudo paramétrico de orientação de pátios, efeito chaminé e relação de vãos opostos sob brisas predominantes de sudeste.',
      en: 'Parametric study of courtyard orientation, stack effect, and opposing aperture ratios under prevailing southeast sea breezes.',
    },
    technicalSpecs: {
      pt: 'Área útil de abertura ≥ 18% da planta · Profundidade máxima de compartimento 5× pé-direito · Velocidade alvo 0,4–0,8 m/s.',
      en: 'Effective opening area ≥ 18% of floor plate · Max room depth 5× ceiling height · Target air velocity 0.4–0.8 m/s.',
    },
    originRegion: {
      pt: 'Maputo · Clima Aw/Cwa (Demo)',
      en: 'Maputo · Aw/Cwa Climate (Demo)',
    },
    standardsTag: 'ASHRAE 55 · CIBSE AM10',
    departmentId: 'research',
    relatedProjectIds: ['sd-proj-oa-26-101', 'sd-proj-oa-26-119'],
    referenceCitation: {
      pt: 'Investigação Aplicada O+A · Caderno Climático 01 (Referência Demonstrativa).',
      en: 'O+A Applied Research · Climatic Dossier 01 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-est-002',
    code: 'EST-002',
    category: 'technical_study',
    title: {
      pt: 'Conforto Higrotérmico e Inércia Solar (Maputo–Milão)',
      en: 'Hygrothermal Comfort & Solar Inertia (Maputo–Milan)',
    },
    summary: {
      pt: 'Comparação de desempenho entre paredes monolíticas de alta massa térmica em Verão mediterrânico e humidade subtropical costeira.',
      en: 'Comparative study of high-thermal-mass monolithic walls across Mediterranean summers and coastal subtropical humidity.',
    },
    technicalSpecs: {
      pt: 'Amortecimento térmico ≤ 0,15 · Desfasamento ≥ 9 h · Ventilação nocturna assistida para descarga de calor sensível.',
      en: 'Decrement factor ≤ 0.15 · Phase shift ≥ 9 h · Assisted night-purge ventilation for sensible heat discharge.',
    },
    originRegion: {
      pt: 'Milão / Maputo · Estudo Comparativo (Demo)',
      en: 'Milan / Maputo · Comparative Study (Demo)',
    },
    standardsTag: 'EN ISO 13786 · UNI/TS 11300',
    departmentId: 'research',
    relatedProjectIds: ['sd-proj-oa-26-112', 'sd-proj-oa-25-084'],
    referenceCitation: {
      pt: 'Arquivo de Matéria & Clima · Relatório Síntese (Referência Demonstrativa).',
      en: 'Materiality & Climate Archive · Synthesis Report (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: 'tech-est-003',
    code: 'EST-003',
    category: 'technical_study',
    title: {
      pt: 'Pormenorização de Juntas Acústicas em Salas de Leitura',
      en: 'Acoustic Joint Detailing for Reading Rooms',
    },
    summary: {
      pt: 'Critérios de absorção sonora em coberturas de madeira ripada e encontro de estantes fixas com paredes de taipa para ambientes silenciosos.',
      en: 'Sound absorption criteria for slatted timber ceilings and fixed shelving junctions against rammed-earth walls in quiet spaces.',
    },
    technicalSpecs: {
      pt: 'Tempo de reverberação alvo RT60 0,5–0,7 s · Lã mineral reciclada 50 mm sob ripado · Ruído de fundo ≤ 32 dB(A).',
      en: 'Target reverberation time RT60 0.5–0.7 s · 50 mm recycled mineral wool behind slats · Background noise ≤ 32 dB(A).',
    },
    originRegion: {
      pt: 'Estúdio de Interiores · Maputo (Demo)',
      en: 'Interiors Studio · Maputo (Demo)',
    },
    standardsTag: 'ISO 3382-2 · DIN 18041',
    departmentId: 'interiors',
    relatedProjectIds: ['sd-proj-oa-26-119'],
    referenceCitation: {
      pt: 'Referências Acústicas O+A · Nota REF-09 (Referência Demonstrativa).',
      en: 'O+A Acoustic Benchmarks · Note REF-09 (Demonstrative Reference).',
    },
    origin: 'seed-fixture',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return (
    isObjectRecord(value) &&
    typeof value.pt === 'string' &&
    value.pt.trim().length > 0 &&
    typeof value.en === 'string' &&
    value.en.trim().length > 0
  );
}

function assertWithinLength(
  value: string,
  fieldLabel: string,
  maxLength: number,
): string {
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(
      `O campo "${fieldLabel}" excede o limite de ${maxLength} caracteres (${trimmed.length}).`,
    );
  }
  return trimmed;
}

function deepFreezeValue<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreezeValue(nested);
    }
  }
  return value;
}

function createImmutableLookupMap<K, V>(
  source: Map<K, V>,
): ReadonlyMap<K, V> {
  const readonlyView: ReadonlyMap<K, V> = {
    get size() {
      return source.size;
    },
    get(key: K) {
      return source.get(key);
    },
    has(key: K) {
      return source.has(key);
    },
    forEach(
      callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
      thisArg?: unknown,
    ) {
      source.forEach((value, key) => {
        callbackfn.call(thisArg, value, key, readonlyView);
      });
    },
    entries() {
      return source.entries();
    },
    keys() {
      return source.keys();
    },
    values() {
      return source.values();
    },
    [Symbol.iterator]() {
      return source[Symbol.iterator]();
    },
  };
  return Object.freeze(readonlyView);
}

function validateStoredTechReference(
  raw: unknown,
): TechnicalReferenceRecord | null {
  if (!isObjectRecord(raw)) {
    return null;
  }

  if (
    typeof raw.id !== 'string' ||
    raw.id.trim().length === 0 ||
    typeof raw.code !== 'string' ||
    raw.code.trim().length === 0 ||
    raw.code.trim().length > TECHNICAL_LIBRARY_LIMITS.MAX_CODE_LENGTH ||
    typeof raw.category !== 'string' ||
    !VALID_CATEGORIES.has(raw.category as TechnicalLibraryCategory) ||
    !isLocalizedText(raw.title) ||
    raw.title.pt.trim().length > TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH ||
    raw.title.en.trim().length > TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH ||
    !isLocalizedText(raw.summary) ||
    raw.summary.pt.trim().length > TECHNICAL_LIBRARY_LIMITS.MAX_SUMMARY_LENGTH ||
    raw.summary.en.trim().length > TECHNICAL_LIBRARY_LIMITS.MAX_SUMMARY_LENGTH ||
    !isLocalizedText(raw.technicalSpecs) ||
    raw.technicalSpecs.pt.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_SPECS_LENGTH ||
    raw.technicalSpecs.en.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_SPECS_LENGTH ||
    !isLocalizedText(raw.originRegion) ||
    raw.originRegion.pt.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH ||
    raw.originRegion.en.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH ||
    typeof raw.standardsTag !== 'string' ||
    raw.standardsTag.trim().length === 0 ||
    raw.standardsTag.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH ||
    typeof raw.departmentId !== 'string' ||
    !VALID_DEPARTMENTS.has(raw.departmentId as DepartmentId) ||
    !Array.isArray(raw.relatedProjectIds) ||
    !isLocalizedText(raw.referenceCitation) ||
    raw.referenceCitation.pt.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_CITATION_LENGTH ||
    raw.referenceCitation.en.trim().length >
      TECHNICAL_LIBRARY_LIMITS.MAX_CITATION_LENGTH ||
    (raw.origin !== 'seed-fixture' && raw.origin !== 'local-created') ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string'
  ) {
    return null;
  }

  const cleanRelatedIds = Array.from(
    new Set(
      raw.relatedProjectIds
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim()),
    ),
  ).slice(0, TECHNICAL_LIBRARY_LIMITS.MAX_RELATED_PROJECTS);

  return {
    id: raw.id.trim(),
    code: raw.code.trim(),
    category: raw.category as TechnicalLibraryCategory,
    title: { pt: raw.title.pt.trim(), en: raw.title.en.trim() },
    summary: { pt: raw.summary.pt.trim(), en: raw.summary.en.trim() },
    technicalSpecs: {
      pt: raw.technicalSpecs.pt.trim(),
      en: raw.technicalSpecs.en.trim(),
    },
    originRegion: {
      pt: raw.originRegion.pt.trim(),
      en: raw.originRegion.en.trim(),
    },
    standardsTag: raw.standardsTag.trim(),
    departmentId: raw.departmentId as DepartmentId,
    relatedProjectIds: cleanRelatedIds,
    referenceCitation: {
      pt: raw.referenceCitation.pt.trim(),
      en: raw.referenceCitation.en.trim(),
    },
    origin: raw.origin,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function emptyEnvelope(): StoredTechnicalLibraryEnvelope {
  return {
    version: 1,
    createdReferences: [],
  };
}

let cachedSnapshot:
  | (TechnicalLibrarySnapshot & { envelope: StoredTechnicalLibraryEnvelope })
  | null = null;
let cacheVersionCounter = 0;
let isInternalEventEmit = false;
const subscribers = new Set<() => void>();

function notifySubscribers(): void {
  for (const listener of Array.from(subscribers)) {
    listener();
  }
}

function emitTechnicalLibraryUpdated(): void {
  notifySubscribers();
  if (typeof window === 'undefined') {
    return;
  }
  isInternalEventEmit = true;
  try {
    window.dispatchEvent(new CustomEvent(TECHNICAL_LIBRARY_UPDATED_EVENT));
  } finally {
    isInternalEventEmit = false;
  }
}

export function invalidateTechnicalLibraryCache(): void {
  cachedSnapshot = null;
  cacheVersionCounter += 1;
}

function loadEnvelopeFromStorage(): StoredTechnicalLibraryEnvelope {
  if (typeof window === 'undefined') {
    return emptyEnvelope();
  }
  try {
    const raw = window.localStorage.getItem(TECHNICAL_LIBRARY_STORAGE_KEY);
    if (!raw) {
      return emptyEnvelope();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isObjectRecord(parsed) || parsed.version !== 1) {
      window.localStorage.removeItem(TECHNICAL_LIBRARY_STORAGE_KEY);
      return emptyEnvelope();
    }

    const seenIds = new Set<string>();
    const createdReferences: TechnicalReferenceRecord[] = [];
    if (Array.isArray(parsed.createdReferences)) {
      for (const entry of parsed.createdReferences) {
        const validated = validateStoredTechReference(entry);
        if (
          validated &&
          validated.origin === 'local-created' &&
          !seenIds.has(validated.id)
        ) {
          seenIds.add(validated.id);
          createdReferences.push(validated);
        }
      }
    }

    return {
      version: 1,
      createdReferences,
    };
  } catch {
    try {
      window.localStorage.removeItem(TECHNICAL_LIBRARY_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors in restricted browsing modes
    }
    return emptyEnvelope();
  }
}

function buildTechnicalLibrarySnapshot(
  envelope: StoredTechnicalLibraryEnvelope,
): TechnicalLibrarySnapshot & { envelope: StoredTechnicalLibraryEnvelope } {
  const allReferences = [
    ...envelope.createdReferences,
    ...SEED_TECHNICAL_REFERENCES,
  ].map((entry) =>
    deepFreezeValue({
      ...entry,
      title: { ...entry.title },
      summary: { ...entry.summary },
      technicalSpecs: { ...entry.technicalSpecs },
      originRegion: { ...entry.originRegion },
      relatedProjectIds: [...entry.relatedProjectIds],
      referenceCitation: { ...entry.referenceCitation },
    }),
  );

  const internalLookup = new Map<string, TechnicalReferenceRecord>();
  const registerKey = (key: string, record: TechnicalReferenceRecord) => {
    const normalized = key.trim().toLowerCase();
    if (normalized && !internalLookup.has(normalized)) {
      internalLookup.set(normalized, record);
    }
  };
  for (const ref of allReferences) {
    registerKey(ref.id, ref);
    registerKey(ref.code, ref);
  }

  cacheVersionCounter += 1;

  return Object.freeze({
    version: cacheVersionCounter,
    envelope: deepFreezeValue<StoredTechnicalLibraryEnvelope>({
      version: 1,
      createdReferences: [...envelope.createdReferences],
    }),
    allReferences: Object.freeze(allReferences),
    lookupMap: createImmutableLookupMap(internalLookup),
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === null || event.key === TECHNICAL_LIBRARY_STORAGE_KEY) {
      invalidateTechnicalLibraryCache();
      notifySubscribers();
    }
  });
  window.addEventListener(TECHNICAL_LIBRARY_UPDATED_EVENT, () => {
    if (!isInternalEventEmit) {
      try {
        if (window.localStorage.getItem(TECHNICAL_LIBRARY_STORAGE_KEY) === null) {
          cachedSnapshot = buildTechnicalLibrarySnapshot(emptyEnvelope());
        } else {
          invalidateTechnicalLibraryCache();
        }
      } catch {
        invalidateTechnicalLibraryCache();
      }
      notifySubscribers();
    }
  });
  window.addEventListener(PROJECT_LIBRARY_UPDATED_EVENT, () => {
    try {
      if (window.localStorage.getItem(TECHNICAL_LIBRARY_STORAGE_KEY) === null) {
        cachedSnapshot = buildTechnicalLibrarySnapshot(emptyEnvelope());
        notifySubscribers();
      }
    } catch {
      // Ignore storage access errors in restricted browsing modes
    }
  });
}

function getInternalSnapshot(): TechnicalLibrarySnapshot & {
  envelope: StoredTechnicalLibraryEnvelope;
} {
  if (cachedSnapshot === null) {
    cachedSnapshot = buildTechnicalLibrarySnapshot(loadEnvelopeFromStorage());
  }
  return cachedSnapshot;
}

export function getTechnicalLibrarySnapshot(): TechnicalLibrarySnapshot {
  return getInternalSnapshot();
}

export function getTechnicalLibraryVersion(): number {
  return getInternalSnapshot().version;
}

export function listTechnicalReferences(): TechnicalReferenceRecord[] {
  return [...getInternalSnapshot().allReferences];
}

export function getTechnicalReferenceById(
  idOrCode: string | undefined | null,
): TechnicalReferenceRecord | null {
  const query = idOrCode?.trim().toLowerCase();
  if (!query) {
    return null;
  }
  return getInternalSnapshot().lookupMap.get(query) ?? null;
}

function saveEnvelope(envelope: StoredTechnicalLibraryEnvelope): void {
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(envelope);
    try {
      window.localStorage.setItem(TECHNICAL_LIBRARY_STORAGE_KEY, serialized);
      const verified = window.localStorage.getItem(
        TECHNICAL_LIBRARY_STORAGE_KEY,
      );
      if (verified === null) {
        throw new Error(
          'Não foi possível confirmar a gravação local da Biblioteca Técnica neste navegador.',
        );
      }
    } catch (error) {
      const isQuotaError =
        (error instanceof Error && error.name === 'QuotaExceededError') ||
        (typeof DOMException !== 'undefined' &&
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            error.code === 22 ||
            error.code === 1014));
      if (isQuotaError) {
        const quotaError = new Error(
          'Limite de armazenamento local do navegador atingido (QuotaExceededError). Limpe dados locais antes de registar novas referências técnicas.',
          { cause: error },
        );
        quotaError.name = 'QuotaExceededError';
        throw quotaError;
      }
      const detail =
        error instanceof Error && error.message ? ` (${error.message})` : '';
      throw new Error(
        `Falha ao guardar a referência técnica no armazenamento local do navegador.${detail}`,
        { cause: error },
      );
    }
  }
  // Update in-memory cache ONLY after persistence succeeds.
  cachedSnapshot = buildTechnicalLibrarySnapshot(envelope);
  emitTechnicalLibraryUpdated();
}

function generateNextCode(
  category: TechnicalLibraryCategory,
  existing: readonly TechnicalReferenceRecord[],
): string {
  const prefix = CATEGORY_CODE_PREFIX[category];
  const used = new Set(existing.map((item) => item.code.trim().toUpperCase()));
  let num = 1;
  while (used.has(`${prefix}-${String(num).padStart(3, '0')}`)) {
    num += 1;
  }
  return `${prefix}-${String(num).padStart(3, '0')}`;
}

/**
 * Registers a local metadata-only technical reference in `oa_workspace_technical_library_v1`.
 * Strictly metadata — zero binary file uploads or remote storage.
 */
export function createTechnicalReference(
  input: CreateTechnicalReferenceInput,
): TechnicalReferenceRecord {
  const snapshot = getInternalSnapshot();
  if (
    snapshot.envelope.createdReferences.length >=
    TECHNICAL_LIBRARY_LIMITS.MAX_LOCAL_TECH_REFS
  ) {
    throw new Error(
      `Limite máximo de ${TECHNICAL_LIBRARY_LIMITS.MAX_LOCAL_TECH_REFS} referências técnicas locais atingido nesta demonstração.`,
    );
  }

  if (!VALID_CATEGORIES.has(input.category)) {
    throw new Error(`Categoria técnica inválida: "${String(input.category)}".`);
  }

  if (!VALID_DEPARTMENTS.has(input.departmentId)) {
    throw new Error(
      `Departamento inválido: "${String(input.departmentId)}".`,
    );
  }

  const titlePt = assertWithinLength(
    input.titlePt,
    'Título da referência (PT)',
    TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
  );
  const titleEn =
    assertWithinLength(
      input.titleEn ?? '',
      'Título da referência (EN)',
      TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH,
    ) || titlePt;
  if (!titlePt) {
    throw new Error('O título da referência técnica é obrigatório.');
  }

  const summaryPt = assertWithinLength(
    input.summaryPt,
    'Resumo técnico (PT)',
    TECHNICAL_LIBRARY_LIMITS.MAX_SUMMARY_LENGTH,
  );
  const summaryEn =
    assertWithinLength(
      input.summaryEn ?? '',
      'Resumo técnico (EN)',
      TECHNICAL_LIBRARY_LIMITS.MAX_SUMMARY_LENGTH,
    ) || summaryPt;
  if (!summaryPt) {
    throw new Error('O resumo técnico é obrigatório.');
  }

  const technicalSpecsPt = assertWithinLength(
    input.technicalSpecsPt,
    'Especificações técnicas (PT)',
    TECHNICAL_LIBRARY_LIMITS.MAX_SPECS_LENGTH,
  );
  const technicalSpecsEn =
    assertWithinLength(
      input.technicalSpecsEn ?? '',
      'Especificações técnicas (EN)',
      TECHNICAL_LIBRARY_LIMITS.MAX_SPECS_LENGTH,
    ) || technicalSpecsPt;
  if (!technicalSpecsPt) {
    throw new Error('As especificações técnicas são obrigatórias.');
  }

  const originRegionPt = assertWithinLength(
    input.originRegionPt,
    'Origem / Contexto climático (PT)',
    TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
  );
  const originRegionEn =
    assertWithinLength(
      input.originRegionEn ?? '',
      'Origem / Contexto climático (EN)',
      TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
    ) || originRegionPt;
  if (!originRegionPt) {
    throw new Error('A região ou contexto climático é obrigatório.');
  }

  const standardsTag = assertWithinLength(
    input.standardsTag,
    'Norma / Etiqueta técnica',
    TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH,
  );
  if (!standardsTag) {
    throw new Error('A norma ou etiqueta de referência é obrigatória.');
  }

  const referenceCitationPt = assertWithinLength(
    input.referenceCitationPt,
    'Fonte / Citação técnica (PT)',
    TECHNICAL_LIBRARY_LIMITS.MAX_CITATION_LENGTH,
  );
  const referenceCitationEn =
    assertWithinLength(
      input.referenceCitationEn ?? '',
      'Fonte / Citação técnica (EN)',
      TECHNICAL_LIBRARY_LIMITS.MAX_CITATION_LENGTH,
    ) || referenceCitationPt;
  if (!referenceCitationPt) {
    throw new Error('A citação ou origem documental é obrigatória.');
  }

  const rawCode = input.code
    ? assertWithinLength(
        input.code,
        'Código técnico',
        TECHNICAL_LIBRARY_LIMITS.MAX_CODE_LENGTH,
      ).toUpperCase()
    : '';
  if (
    rawCode &&
    snapshot.allReferences.some(
      (item) => item.code.trim().toUpperCase() === rawCode,
    )
  ) {
    throw new Error(
      `O código "${rawCode}" já existe na Biblioteca Técnica.`,
    );
  }
  const code =
    rawCode || generateNextCode(input.category, snapshot.allReferences);

  const requestedProjectIds = Array.from(
    new Set(
      (input.relatedProjectIds ?? [])
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, TECHNICAL_LIBRARY_LIMITS.MAX_RELATED_PROJECTS);

  const validatedProjectIds: string[] = [];
  for (const projectId of requestedProjectIds) {
    const project = getProjectById(projectId);
    if (!project) {
      throw new Error(
        `O projecto associado "${projectId}" não foi encontrado na Biblioteca de Projectos.`,
      );
    }
    validatedProjectIds.push(project.identity.id);
  }

  const nowIso = new Date().toISOString();
  const timeStamp = Date.now().toString(36);
  const existingIds = new Set(snapshot.allReferences.map((r) => r.id));
  let id = `tech-loc-${timeStamp}`;
  let suffix = 1;
  while (existingIds.has(id)) {
    suffix += 1;
    id = `tech-loc-${timeStamp}-${suffix}`;
  }

  const record: TechnicalReferenceRecord = {
    id,
    code,
    category: input.category,
    title: { pt: titlePt, en: titleEn },
    summary: { pt: summaryPt, en: summaryEn },
    technicalSpecs: { pt: technicalSpecsPt, en: technicalSpecsEn },
    originRegion: { pt: originRegionPt, en: originRegionEn },
    standardsTag,
    departmentId: input.departmentId,
    relatedProjectIds: validatedProjectIds,
    referenceCitation: { pt: referenceCitationPt, en: referenceCitationEn },
    origin: 'local-created',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  saveEnvelope({
    version: 1,
    createdReferences: [record, ...snapshot.envelope.createdReferences],
  });

  return record;
}

export function resetTechnicalLibraryLocalState(): TechnicalReferenceRecord[] {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(TECHNICAL_LIBRARY_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors
    }
  }
  cachedSnapshot = buildTechnicalLibrarySnapshot(emptyEnvelope());
  emitTechnicalLibraryUpdated();
  return [...cachedSnapshot.allReferences];
}

export function subscribeTechnicalLibraryChanges(
  listener: () => void,
): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}
