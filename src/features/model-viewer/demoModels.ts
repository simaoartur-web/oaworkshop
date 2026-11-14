import { MAX_MODEL_FILE_SIZE_BYTES } from '../../data/modelAssetTypes';
import type {
  ArchitecturalModelSource,
  ModelViewerProjectContext,
} from './contracts';

export const DEFAULT_MAX_MODEL_FILE_SIZE_BYTES = MAX_MODEL_FILE_SIZE_BYTES; // 50 MB

export const OA_DEMO_MODEL_SOURCES: readonly ArchitecturalModelSource[] = [
  {
    id: 'model-oa-26-101-pavilion',
    code: 'MOD-OA-101-V3',
    title: {
      pt: 'Galeria Cívica & Pátio da Ponta Vermelha — Estudo Volumétrico',
      en: 'Ponta Vermelha Civic Gallery & Courtyard — Volumetric Study',
    },
    subtitle: {
      pt: 'Maquete espacial demonstrativa com embasamento em travertino, pátio sombreado, núcleo em taipa pigmentada e colunata brise-soleil.',
      en: 'Demonstrative spatial maquette featuring travertine plinth, shaded courtyard, pigmented rammed-earth core, and brise-soleil colonnade.',
    },
    url: '/assets/models/oa-ponta-vermelha-pavilion-demo.glb',
    fileName: 'oa-ponta-vermelha-pavilion-demo.glb',
    format: 'glb',
    origin: 'demo',
    fileSizeBytes: 24116,
    versionLabel: 'v3.0 · Estudo 1:100',
    authorLabel: 'Mateo Conti · ARQ-02 (Demo)',
    updatedAtIso: '2026-11-12',
    declaredUnit: 'm',
    declaredScale: '1:100',
    licenseNote: {
      pt: 'Modelo demonstrativo original gerado proceduralmente para o O+A Workspace (CC0-1.0). Não representa uma obra construída.',
      en: 'Original demonstrative model procedurally generated for O+A Workspace (CC0-1.0). Does not represent a built work.',
    },
    isDemoModel: true,
  },
  {
    id: 'model-oa-26-108-costa',
    code: 'MOD-OA-108-V2',
    title: {
      pt: 'Corredor Pedonal & Terrários da Costa — Implantação Territorial',
      en: 'Coastal Pedestrian Corridor & Terraces — Territorial Massing',
    },
    subtitle: {
      pt: 'Estudo volumétrico de frente marítima com socalcos drenantes, canal de retenção e pérgolas de ensombramento.',
      en: 'Waterfront volumetric study with draining terraces, retention channel, and shading pergolas.',
    },
    url: '/assets/models/oa-costa-terraces-massing-demo.glb',
    fileName: 'oa-costa-terraces-massing-demo.glb',
    format: 'glb',
    origin: 'demo',
    fileSizeBytes: 13000,
    versionLabel: 'v2.1 · Implantação 1:250',
    authorLabel: 'Tomás Nhantumbo · URB-01 (Demo)',
    updatedAtIso: '2026-11-10',
    declaredUnit: 'm',
    declaredScale: '1:250',
    licenseNote: {
      pt: 'Modelo demonstrativo original gerado proceduralmente para o O+A Workspace (CC0-1.0). Não representa levantamento topográfico real.',
      en: 'Original demonstrative model procedurally generated for O+A Workspace (CC0-1.0). Does not represent a real topographic survey.',
    },
    isDemoModel: true,
  },
];

export const DEFAULT_DEMO_PROJECT_CONTEXT: ModelViewerProjectContext = {
  id: 'proj-oa-26-101',
  code: 'OA-26-101',
  title: {
    pt: 'Galeria Cívica & Pátio da Ponta Vermelha',
    en: 'Ponta Vermelha Civic Gallery & Courtyard',
  },
  subtitle: {
    pt: 'Estudo fictício para espaço cultural em betão cofrado escuro, brise-soleil em madeira e núcleo de taipa pigmentada.',
    en: 'Fictional study for a cultural space in dark board-formed concrete, timber brise-soleil, and pigmented rammed-earth core.',
  },
  discipline: {
    pt: 'Arquitectura Pública',
    en: 'Public Architecture',
  },
  studioBase: 'Maputo',
  phase: {
    pt: 'Anteprojecto · Pranchas 1:50',
    en: 'Schematic Design · 1:50 Plates',
  },
  leadAuthorName: 'Mateo Conti',
  scale: '1:100',
  areaSqm: '2 840 m²',
  elevationDatum: '+6.40 m NMM',
  publicationStatusLabel: {
    pt: 'Privado no Atelier',
    en: 'Private in Studio',
  },
};

export function findDemoModelForProject(
  projectIdOrCode?: string | null,
): ArchitecturalModelSource | null {
  if (!projectIdOrCode) {
    return null;
  }
  const normalized = projectIdOrCode.trim().toLowerCase();
  if (normalized.includes('101') || normalized.includes('ponta-vermelha')) {
    return OA_DEMO_MODEL_SOURCES[0];
  }
  if (normalized.includes('108') || normalized.includes('costa')) {
    return OA_DEMO_MODEL_SOURCES[1];
  }
  return null;
}
