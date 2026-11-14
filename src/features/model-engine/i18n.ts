import type { AppLanguage } from '../../data/types';

export interface ModelEngineDictionary {
  eyebrow: string;
  pageTitleSuffix: string;
  backToDossier: string;
  backToCatalog: string;
  backToDesk: string;
  notFoundTitle: string;
  notFoundBody: string;
  archivedBannerTitle: string;
  archivedBannerBody: string;
  privateBadge: string;
  fictiveStudyBadge: string;
  sessionModelBadge: string;
  metadataOnlyBadge: string;
  skpReferenceBadge: string;
  controls: {
    selectLocalFileCta: string;
    replaceLocalFileCta: string;
    clearSessionFileCta: string;
    fileInputAriaLabel: string;
    supportedFormatsHint: string;
    switchDemoStudyLabel: string;
    inspectEmptyStateCta: string;
    restoreDemoStudyCta: string;
  };
  categories: {
    sectionTitle: string;
    sectionSubtitle: string;
    demoTitle: string;
    demoSubtitle: string;
    demoEmpty: string;
    sessionTitle: string;
    sessionSubtitle: string;
    sessionEmpty: string;
    docRefTitle: string;
    docRefSubtitle: string;
    docRefEmpty: string;
    skpGroupTitle: string;
    metadata3DGroupTitle: string;
    sheetsGroupTitle: string;
  };
  stage: {
    slotEyebrow: string;
    slotReadyHeading: string;
    slotEmptyHeading: string;
    slotEmptyBody: string;
    slotErrorHeading: string;
    originLabel: string;
    formatLabel: string;
    fileLabel: string;
    uriLabel: string;
    loadStateLabel: string;
    privacyLabel: string;
    origins: {
      'demo-asset': string;
      'session-file': string;
      'document-reference': string;
      none: string;
    };
    loadStates: {
      idle: string;
      loading: string;
      ready: string;
      error: string;
    };
    availability: {
      available: string;
      'metadata-only': string;
      'unsupported-skp': string;
      'invalid-file': string;
      unavailable: string;
    };
  };
  dossierStrip: {
    eyebrow: string;
    title: string;
    openModelRouteCta: string;
    demoAvailableSummary: string;
    sessionActiveSummary: string;
    noLoadableModelSummary: string;
    skpCountLabel: (count: number) => string;
    meta3DCountLabel: (count: number) => string;
  };
}

export const MODEL_ENGINE_I18N: Record<AppLanguage, ModelEngineDictionary> = {
  pt: {
    eyebrow: 'FASE 04 · MOTOR DE MODELOS 3D & CONTRATO DE FICHEIROS',
    pageTitleSuffix: 'Modelo 3D — O+A Workspace',
    backToDossier: 'Voltar ao Dossier',
    backToCatalog: 'Voltar aos Projectos',
    backToDesk: 'Ir para Studio Desk',
    notFoundTitle: 'Projecto não encontrado para pré-visualização 3D',
    notFoundBody:
      'O identificador solicitado não corresponde a nenhum projecto canónico no arquivo local deste navegador.',
    archivedBannerTitle: 'Projecto arquivado · Referências 3D e documentais preservadas',
    archivedBannerBody:
      'Este projecto encontra-se arquivado. Todas as referências documentais (.skp, .glb, .pdf) e estudos demonstrativos permanecem consultáveis sem perda de histórico.',
    privateBadge: 'Privado por omissão (Demo Local)',
    fictiveStudyBadge: 'Estudo fictício demonstrativo',
    sessionModelBadge: 'Modelo seleccionado na sessão (temporário)',
    metadataOnlyBadge: 'Apenas metadados (sem binário no browser)',
    skpReferenceBadge: 'Referência nativa SketchUp (.skp · sem WebGL)',
    controls: {
      selectLocalFileCta: 'Seleccionar ficheiro .glb / .gltf local',
      replaceLocalFileCta: 'Substituir ficheiro local (.glb / .gltf)',
      clearSessionFileCta: 'Limpar ficheiro da sessão',
      fileInputAriaLabel: 'Seleccionar ficheiro 3D local (.glb ou .gltf)',
      supportedFormatsHint:
        'Formatos Web 3D aceites: .glb (binário) e .gltf 2.0 com recursos incorporados · Limite máximo: 50 MB · Ficheiros .skp mantêm-se como referência documental.',
      switchDemoStudyLabel: 'Estudo demonstrativo activo',
      inspectEmptyStateCta: 'Suspender estudo demo (ver estado sem modelo)',
      restoreDemoStudyCta: 'Reactivar estudo demonstrativo do projecto',
    },
    categories: {
      sectionTitle: 'Distinção Canónica de Ficheiros e Modelos 3D',
      sectionSubtitle:
        'O motor separa rigorosamente referências documentais do dossier, modelos demonstrativos fictícios e ficheiros locais seleccionados na sessão.',
      demoTitle: 'B · Modelo demonstrativo disponível',
      demoSubtitle:
        'Assets locais .glb / .gltf associados a estudos fictícios do atelier (não representam a obra real).',
      demoEmpty:
        'Este projecto não possui um modelo demonstrativo pré-associado nos assets locais do Workspace.',
      sessionTitle: 'C · Modelo seleccionado na sessão',
      sessionSubtitle:
        'Ficheiro .glb ou .gltf autónomo escolhido localmente neste dispositivo via ObjectURL temporário (não persiste após refresh).',
      sessionEmpty:
        'Nenhum ficheiro local foi seleccionado nesta sessão do navegador.',
      docRefTitle: 'A · Referências documentais do dossier',
      docRefSubtitle:
        'Registos de ficheiros guardados no dossier que possuem apenas metadados (sem ficheiro binário no browser).',
      docRefEmpty: 'Nenhuma referência documental registada neste dossier.',
      skpGroupTitle: 'Referências nativas SketchUp (.skp · sem conversão WebGL)',
      metadata3DGroupTitle: 'Registos 3D apenas de metadados (.glb / .gltf sem binário)',
      sheetsGroupTitle: 'Peças desenhadas e cadernos técnicos (.pdf / .dwg)',
    },
    stage: {
      slotEyebrow: 'CÂMARA DE PRÉ-VISUALIZAÇÃO 3D · CONTRATO DE INTEGRAÇÃO FASE 04',
      slotReadyHeading: 'Fonte 3D pronta para o visualizador WebGL',
      slotEmptyHeading: 'Nenhum modelo 3D carregável disponível neste momento',
      slotEmptyBody:
        'Este projecto não tem um asset .glb / .gltf carregável activo. As referências documentais do dossier (.skp ou metadados .glb) não contêm ficheiro binário no navegador. Seleccione um ficheiro .glb ou .gltf autónomo local para o pré-visualizar nesta sessão.',
      slotErrorHeading: 'Validação de ficheiro 3D recusada',
      originLabel: 'Origem da fonte',
      formatLabel: 'Formato',
      fileLabel: 'Ficheiro activo',
      uriLabel: 'Caminho / URL resolvido',
      loadStateLabel: 'Estado do motor',
      privacyLabel: 'Visibilidade do projecto',
      origins: {
        'demo-asset': 'Modelo demonstrativo disponível (Estudo fictício)',
        'session-file': 'Modelo seleccionado na sessão (ObjectURL temporário)',
        'document-reference': 'Referência documental (apenas metadados)',
        none: 'Sem modelo carregável',
      },
      loadStates: {
        idle: 'Em espera (idle)',
        loading: 'A validar / carregar (loading)',
        ready: 'Pronto a renderizar (ready)',
        error: 'Erro de validação / carregamento (error)',
      },
      availability: {
        available: 'Modelo 3D carregável disponível',
        'metadata-only': 'Apenas metadados no dossier (sem binário)',
        'unsupported-skp': 'Referência .skp documental (sem WebGL directo)',
        'invalid-file': 'Ficheiro recusado na validação',
        unavailable: 'Sem modelo carregável associado',
      },
    },
    dossierStrip: {
      eyebrow: 'MOTOR 3D · FASE 04',
      title: 'Estado de Modelos 3D e Referências Documentais',
      openModelRouteCta: 'Abrir Câmara 3D do Projecto',
      demoAvailableSummary:
        'Estudo demonstrativo fictício (.glb / .gltf) disponível para inspecção. Não representa a geometria autêntica do projecto.',
      sessionActiveSummary:
        'Ficheiro 3D local seleccionado nesta sessão (ObjectURL temporário).',
      noLoadableModelSummary:
        'Sem ficheiro binário 3D pré-carregado. Pode abrir a Câmara 3D para seleccionar um .glb / .gltf local.',
      skpCountLabel: (count) =>
        `${count} ref. SketchUp .skp (apenas metadados, sem WebGL directo)`,
      meta3DCountLabel: (count) =>
        `${count} ref. 3D documental (apenas metadados no dossier)`,
    },
  },
  en: {
    eyebrow: 'PHASE 04 · 3D MODEL ENGINE & FILE CONTRACT',
    pageTitleSuffix: '3D Model — O+A Workspace',
    backToDossier: 'Back to Dossier',
    backToCatalog: 'Back to Projects',
    backToDesk: 'Go to Studio Desk',
    notFoundTitle: 'Project not found for 3D preview',
    notFoundBody:
      'The requested identifier does not match any canonical project in this browser’s local archive.',
    archivedBannerTitle: 'Archived project · 3D & documentary references preserved',
    archivedBannerBody:
      'This project is archived. All documentary references (.skp, .glb, .pdf) and demonstrative studies remain inspectable without losing history.',
    privateBadge: 'Private by default (Local Demo)',
    fictiveStudyBadge: 'Fictive demonstrative study',
    sessionModelBadge: 'Session-selected model (temporary)',
    metadataOnlyBadge: 'Metadata only (no binary in browser)',
    skpReferenceBadge: 'Native SketchUp reference (.skp · no WebGL)',
    controls: {
      selectLocalFileCta: 'Select local .glb / .gltf file',
      replaceLocalFileCta: 'Replace local file (.glb / .gltf)',
      clearSessionFileCta: 'Clear session file',
      fileInputAriaLabel: 'Select local 3D file (.glb or .gltf)',
      supportedFormatsHint:
        'Accepted Web 3D formats: .glb (binary) and self-contained .gltf 2.0 · Max limit: 50 MB · .skp files remain documentary references.',
      switchDemoStudyLabel: 'Active demonstrative study',
      inspectEmptyStateCta: 'Suspend demo study (preview empty state)',
      restoreDemoStudyCta: 'Restore project demonstrative study',
    },
    categories: {
      sectionTitle: 'Canonical Distinction of Files & 3D Models',
      sectionSubtitle:
        'The engine strictly separates dossier documentary references, fictive demonstrative models, and temporary session-selected local files.',
      demoTitle: 'B · Available demonstrative model',
      demoSubtitle:
        'Local .glb / .gltf assets linked to fictive studio studies (do not represent the authentic built work).',
      demoEmpty:
        'This project has no pre-associated demonstrative model in the local Workspace assets.',
      sessionTitle: 'C · Session-selected model',
      sessionSubtitle:
        'Local .glb or self-contained .gltf file chosen on this device via temporary ObjectURL (does not persist across refresh).',
      sessionEmpty:
        'No local file has been selected during this browser session.',
      docRefTitle: 'A · Dossier documentary references',
      docRefSubtitle:
        'File records saved in the dossier that hold metadata only (no binary file in the browser).',
      docRefEmpty: 'No documentary references recorded in this dossier.',
      skpGroupTitle: 'Native SketchUp references (.skp · no WebGL conversion)',
      metadata3DGroupTitle: 'Metadata-only 3D records (.glb / .gltf without binary)',
      sheetsGroupTitle: 'Drawing sheets & technical books (.pdf / .dwg)',
    },
    stage: {
      slotEyebrow: '3D PREVIEW CHAMBER · PHASE 04 INTEGRATION CONTRACT',
      slotReadyHeading: '3D source ready for WebGL viewer',
      slotEmptyHeading: 'No loadable 3D model available right now',
      slotEmptyBody:
        'This project has no active loadable .glb / .gltf asset. Dossier documentary references (.skp or .glb metadata) do not store binary payloads in the browser. Select a local .glb or self-contained .gltf file to preview it in this session.',
      slotErrorHeading: '3D file validation rejected',
      originLabel: 'Source origin',
      formatLabel: 'Format',
      fileLabel: 'Active file',
      uriLabel: 'Resolved path / URL',
      loadStateLabel: 'Engine state',
      privacyLabel: 'Project visibility',
      origins: {
        'demo-asset': 'Available demonstrative model (Fictive study)',
        'session-file': 'Session-selected model (Temporary ObjectURL)',
        'document-reference': 'Documentary reference (metadata only)',
        none: 'No loadable model',
      },
      loadStates: {
        idle: 'Idle',
        loading: 'Validating / loading',
        ready: 'Ready to render',
        error: 'Validation / load error',
      },
      availability: {
        available: 'Loadable 3D model available',
        'metadata-only': 'Metadata only in dossier (no binary)',
        'unsupported-skp': 'Documentary .skp reference (no direct WebGL)',
        'invalid-file': 'File rejected during validation',
        unavailable: 'No loadable model associated',
      },
    },
    dossierStrip: {
      eyebrow: '3D ENGINE · PHASE 04',
      title: '3D Models & Documentary References Status',
      openModelRouteCta: 'Open Project 3D Chamber',
      demoAvailableSummary:
        'Fictive demonstrative study (.glb / .gltf) available for inspection. Does not represent the authentic project geometry.',
      sessionActiveSummary:
        'Local 3D file selected in this session (temporary ObjectURL).',
      noLoadableModelSummary:
        'No preloaded 3D binary file. Open the 3D Chamber to select a local .glb / .gltf file.',
      skpCountLabel: (count) =>
        `${count} SketchUp .skp ref(s) (metadata only, no direct WebGL)`,
      meta3DCountLabel: (count) =>
        `${count} documentary 3D ref(s) (metadata only in dossier)`,
    },
  },
};
