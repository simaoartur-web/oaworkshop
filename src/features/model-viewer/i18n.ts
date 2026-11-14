import type { AppLanguage } from '../../data/types';

export interface ModelViewerDictionary {
  header: {
    eyebrow: string;
    demoBadge: string;
    localBadge: string;
    referenceBadge: string;
    backToDossier: string;
    backToProjects: string;
    modelSelectorLabel: string;
    uploadLocalButton: string;
    clearModelButton: string;
  };
  controls: {
    toolbarLabel: string;
    cameraGroupLabel: string;
    isometricView: string;
    topView: string;
    frontView: string;
    sideView: string;
    actionsGroupLabel: string;
    recenterModel: string;
    resetInitialView: string;
    zoomIn: string;
    zoomOut: string;
    spatialGroupLabel: string;
    toggleGrid: string;
    toggleAxes: string;
    toggleWireframe: string;
    toggleHelp: string;
    helpTitle: string;
    helpRotate: string;
    helpZoom: string;
    helpPan: string;
    helpKeyboard: string;
  };
  stage: {
    ariaLabel: string;
    activeCameraBadge: string;
    gridStateOn: string;
    gridStateOff: string;
    axesStateOn: string;
    axesStateOff: string;
    wireframeStateOn: string;
    wireframeStateOff: string;
    demoWatermark: string;
    localTemporaryWatermark: string;
    onDemandRenderingNote: string;
  };
  panel: {
    sectionTitle: string;
    statusHeading: string;
    statusDemo: string;
    statusLocalTemporary: string;
    statusProjectReference: string;
    statusEmpty: string;
    modelIdentityHeading: string;
    fileLabel: string;
    formatLabel: string;
    versionLabel: string;
    authorLabel: string;
    fileSizeLabel: string;
    geometryHeading: string;
    meshesLabel: string;
    trianglesLabel: string;
    verticesLabel: string;
    materialsLabel: string;
    dimensionsHeading: string;
    widthLabel: string;
    heightLabel: string;
    depthLabel: string;
    scaleLabel: string;
    verifiedUnitNote: string;
    unverifiedUnitNote: string;
    sceneUnitsSuffix: string;
    localFileHeading: string;
    localFileDescription: string;
    selectLocalFileCta: string;
    restoreDemoModelCta: string;
    skpOriginTitle: string;
    skpOriginNote: string;
    licenseHeading: string;
  };
  states: {
    emptyTitle: string;
    emptyBody: string;
    emptyNextAction: string;
    loadDemoAction: string;
    loadingTitle: string;
    loadingBody: string;
    errorFormatTitle: string;
    errorFormatSkpBody: string;
    errorFormatGenericBody: string;
    errorFormatNextAction: string;
    errorInvalidTitle: string;
    errorInvalidBody: string;
    errorInvalidMissingDepsBody: string;
    errorInvalidNextAction: string;
    errorTooLargeTitle: string;
    errorTooLargeBody: string;
    errorTooLargeNextAction: string;
    webglUnavailableTitle: string;
    webglUnavailableBody: string;
    webglUnavailableNextAction: string;
    retryAction: string;
  };
}

const PT_DICTIONARY: ModelViewerDictionary = {
  header: {
    eyebrow: 'MESA DE EXPLORAÇÃO ESPACIAL 3D · GLTF 2.0',
    demoBadge: 'Modelo demonstrativo',
    localBadge: 'Visualização temporária local',
    referenceBadge: 'Referência do dossier',
    backToDossier: 'Voltar ao dossier',
    backToProjects: 'Catálogo de projectos',
    modelSelectorLabel: 'Estudo volumétrico activo',
    uploadLocalButton: 'Abrir .glb / .gltf local',
    clearModelButton: 'Limpar cena',
  },
  controls: {
    toolbarLabel: 'Controlos de câmara e leitura espacial',
    cameraGroupLabel: 'Vistas ortogonais e axonométricas',
    isometricView: 'Vista isométrica',
    topView: 'Vista superior',
    frontView: 'Vista frontal',
    sideView: 'Vista lateral',
    actionsGroupLabel: 'Enquadramento e zoom',
    recenterModel: 'Recentrar modelo',
    resetInitialView: 'Repor vista inicial',
    zoomIn: 'Aproximar vista',
    zoomOut: 'Afastar vista',
    spatialGroupLabel: 'Leitura técnica',
    toggleGrid: 'Grelha',
    toggleAxes: 'Eixos',
    toggleWireframe: 'Contorno / malha',
    toggleHelp: 'Ajuda de navegação',
    helpTitle: 'Como explorar o modelo 3D',
    helpRotate: 'Rodar: arraste com o botão esquerdo do rato ou com um dedo.',
    helpZoom: 'Aproximar / afastar: rode a roda do rato, faça pinça ou use os botões + / −.',
    helpPan: 'Deslocar vista: arraste com o botão direito (ou Shift + arrasto) ou dois dedos.',
    helpKeyboard: 'Teclado: use os botões de vista (Isométrica, Superior, Frontal, Lateral), Recentrar e Repor vista.',
  },
  stage: {
    ariaLabel: 'Palco tridimensional interactivo do estudo arquitectónico',
    activeCameraBadge: 'Câmara activa',
    gridStateOn: 'Grelha activa',
    gridStateOff: 'Grelha oculta',
    axesStateOn: 'Eixos XYZ activos',
    axesStateOff: 'Eixos ocultos',
    wireframeStateOn: 'Modo malha (wireframe)',
    wireframeStateOff: 'Modo superfícies',
    demoWatermark: 'MODELO DE DEMONSTRAÇÃO · NÃO CORRESPONDE A OBRA CONSTRUÍDA',
    localTemporaryWatermark: 'FICHEIRO LOCAL TEMPORÁRIO · NÃO ENVIADO PARA SERVIDOR',
    onDemandRenderingNote: 'Renderização por demanda activa',
  },
  panel: {
    sectionTitle: 'FICHA TÉCNICA DO MODELO',
    statusHeading: 'Estado da sessão 3D',
    statusDemo: 'Modelo demonstrativo do atelier',
    statusLocalTemporary: 'Visualização temporária local neste navegador',
    statusProjectReference: 'Modelo associado ao projecto',
    statusEmpty: 'Sem modelo carregado',
    modelIdentityHeading: 'Identificação do ficheiro',
    fileLabel: 'Ficheiro',
    formatLabel: 'Formato',
    versionLabel: 'Versão / Escala',
    authorLabel: 'Autoria',
    fileSizeLabel: 'Tamanho',
    geometryHeading: 'Geometria carregada',
    meshesLabel: 'Malhas (meshes)',
    trianglesLabel: 'Triângulos',
    verticesLabel: 'Vértices',
    materialsLabel: 'Materiais PBR',
    dimensionsHeading: 'Dimensões e envolvente',
    widthLabel: 'Largura (eixo X)',
    heightLabel: 'Altura (eixo Y)',
    depthLabel: 'Profundidade (eixo Z)',
    scaleLabel: 'Escala de referência',
    verifiedUnitNote: 'Unidades métricas declaradas nos metadados do ficheiro.',
    unverifiedUnitNote:
      'Este ficheiro não declara unidades explícitas; valores exibidos em unidades brutas da cena sem assumir metros.',
    sceneUnitsSuffix: 'unid.',
    localFileHeading: 'Inspecionar ficheiro local (.glb / .gltf)',
    localFileDescription:
      'Seleccione um ficheiro .glb ou .gltf autocontido do seu computador. O modelo é lido apenas na memória deste navegador e nunca é enviado para um servidor.',
    selectLocalFileCta: 'Seleccionar ficheiro .glb / .gltf',
    restoreDemoModelCta: 'Repor modelo demonstrativo',
    skpOriginTitle: 'Nota sobre ficheiros SketchUp (.skp)',
    skpOriginNote:
      'O formato .skp serve como ficheiro de trabalho de origem no SketchUp, mas não pode ser aberto directamente no navegador. Para visualizar aqui, exporte o estudo a partir do SketchUp como glTF 2.0 (.glb). Não existe conversão automática nesta fase.',
    licenseHeading: 'Origem e licença',
  },
  states: {
    emptyTitle: 'Sem modelo 3D carregado na prancha',
    emptyBody:
      'A mesa de exploração espacial está pronta. Pode carregar o estudo demonstrativo do projecto ou seleccionar um ficheiro .glb / .gltf local no seu computador.',
    emptyNextAction:
      'Carregue o modelo demonstrativo ou escolha um ficheiro .glb local para iniciar a leitura volumétrica.',
    loadDemoAction: 'Carregar modelo demonstrativo',
    loadingTitle: 'A carregar e centrar o modelo 3D…',
    loadingBody:
      'A ler a geometria glTF 2.0, calcular os limites reais do volume e ajustar a câmara inicial.',
    errorFormatTitle: 'Formato de ficheiro não suportado pelo visualizador 3D',
    errorFormatSkpBody:
      'Seleccionou um ficheiro SketchUp (.skp). Os ficheiros .skp são registados no dossier como origem de trabalho, mas o navegador requer um ficheiro exportado em .glb ou .gltf.',
    errorFormatGenericBody:
      'O ficheiro seleccionado não é um modelo glTF 2.0 (.glb ou .gltf).',
    errorFormatNextAction:
      'Exporte o modelo como .glb (binário glTF 2.0) na sua ferramenta de modelação ou carregue o modelo demonstrativo.',
    errorInvalidTitle: 'Ficheiro inválido, corrompido ou com dependências em falta',
    errorInvalidBody:
      'Não foi possível construir uma cena 3D válida a partir deste ficheiro. O cabeçalho binário glTF pode estar incompleto ou a estrutura JSON não contém malhas válidas.',
    errorInvalidMissingDepsBody:
      'Este ficheiro .gltf referencia ficheiros externos (.bin ou texturas) que não estão embutidos. No carregamento local individual, utilize um ficheiro .glb único ou .gltf com recursos embutidos.',
    errorInvalidNextAction:
      'Verifique a exportação em formato .glb autocontido ou regresse ao modelo demonstrativo do atelier.',
    errorTooLargeTitle: 'Modelo demasiado grande para visualização imediata no navegador',
    errorTooLargeBody:
      'O ficheiro excede o limite seguro definido para leitura local fluída sem bloquear a memória gráfica.',
    errorTooLargeNextAction:
      'Simplifique a malha ou exporte apenas a volumetria arquitectónica essencial em .glb (até 50 MB).',
    webglUnavailableTitle: 'Contexto gráfico WebGL indisponível neste dispositivo',
    webglUnavailableBody:
      'O navegador ou placa gráfica não permitiu inicializar o motor 3D WebGL (ou o contexto gráfico foi interrompido). Os metadados técnicos do projecto permanecem acessíveis para consulta.',
    webglUnavailableNextAction:
      'Active a aceleração por hardware no navegador, tente restabelecer a vista ou regresse ao dossier técnico do projecto.',
    retryAction: 'Tentar novamente com o modelo demonstrativo',
  },
};

const EN_DICTIONARY: ModelViewerDictionary = {
  header: {
    eyebrow: '3D SPATIAL EXPLORATION DESK · GLTF 2.0',
    demoBadge: 'Demonstrative model',
    localBadge: 'Temporary local preview',
    referenceBadge: 'Dossier reference',
    backToDossier: 'Back to dossier',
    backToProjects: 'Projects catalog',
    modelSelectorLabel: 'Active volumetric study',
    uploadLocalButton: 'Open local .glb / .gltf',
    clearModelButton: 'Clear stage',
  },
  controls: {
    toolbarLabel: 'Camera and spatial reading controls',
    cameraGroupLabel: 'Orthogonal and axonometric views',
    isometricView: 'Isometric view',
    topView: 'Top view',
    frontView: 'Front view',
    sideView: 'Side view',
    actionsGroupLabel: 'Framing and zoom',
    recenterModel: 'Recenter model',
    resetInitialView: 'Reset initial view',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    spatialGroupLabel: 'Technical reading',
    toggleGrid: 'Grid',
    toggleAxes: 'Axes',
    toggleWireframe: 'Edges / wireframe',
    toggleHelp: 'Navigation help',
    helpTitle: 'How to explore the 3D model',
    helpRotate: 'Rotate: drag with the left mouse button or one finger.',
    helpZoom: 'Zoom in / out: scroll the mouse wheel, pinch, or use the + / − buttons.',
    helpPan: 'Pan view: drag with the right mouse button (or Shift + drag) or two fingers.',
    helpKeyboard: 'Keyboard: use the view buttons (Isometric, Top, Front, Side), Recenter, and Reset view.',
  },
  stage: {
    ariaLabel: 'Interactive three-dimensional architectural study stage',
    activeCameraBadge: 'Active camera',
    gridStateOn: 'Grid active',
    gridStateOff: 'Grid hidden',
    axesStateOn: 'XYZ axes active',
    axesStateOff: 'Axes hidden',
    wireframeStateOn: 'Wireframe mode',
    wireframeStateOff: 'Solid surfaces mode',
    demoWatermark: 'DEMONSTRATION MODEL · DOES NOT REPRESENT A BUILT WORK',
    localTemporaryWatermark: 'TEMPORARY LOCAL FILE · NEVER UPLOADED TO A SERVER',
    onDemandRenderingNote: 'On-demand rendering active',
  },
  panel: {
    sectionTitle: 'MODEL TECHNICAL SHEET',
    statusHeading: '3D session state',
    statusDemo: 'Studio demonstrative model',
    statusLocalTemporary: 'Temporary local preview in this browser',
    statusProjectReference: 'Project-linked model',
    statusEmpty: 'No model loaded',
    modelIdentityHeading: 'File identification',
    fileLabel: 'File',
    formatLabel: 'Format',
    versionLabel: 'Version / Scale',
    authorLabel: 'Authorship',
    fileSizeLabel: 'File size',
    geometryHeading: 'Loaded geometry',
    meshesLabel: 'Meshes',
    trianglesLabel: 'Triangles',
    verticesLabel: 'Vertices',
    materialsLabel: 'PBR materials',
    dimensionsHeading: 'Dimensions and bounding box',
    widthLabel: 'Width (X axis)',
    heightLabel: 'Height (Y axis)',
    depthLabel: 'Depth (Z axis)',
    scaleLabel: 'Reference scale',
    verifiedUnitNote: 'Metric units explicitly declared in file metadata.',
    unverifiedUnitNote:
      'This file does not declare explicit units; values are shown in raw scene units without assuming meters.',
    sceneUnitsSuffix: 'units',
    localFileHeading: 'Inspect local file (.glb / .gltf)',
    localFileDescription:
      'Select a self-contained .glb or .gltf file from your computer. The model is read only in this browser memory and is never uploaded to a server.',
    selectLocalFileCta: 'Select .glb / .gltf file',
    restoreDemoModelCta: 'Restore demonstrative model',
    skpOriginTitle: 'Note on SketchUp (.skp) files',
    skpOriginNote:
      'The .skp format serves as a working SketchUp source file, but cannot be opened directly in the browser. To inspect it here, export the study from SketchUp as glTF 2.0 (.glb). No automatic conversion is performed in this phase.',
    licenseHeading: 'Origin and license',
  },
  states: {
    emptyTitle: 'No 3D model loaded on the stage',
    emptyBody:
      'The spatial exploration desk is ready. You can load the project demonstrative study or select a local .glb / .gltf file from your computer.',
    emptyNextAction:
      'Load the demonstrative model or choose a local .glb file to begin volumetric inspection.',
    loadDemoAction: 'Load demonstrative model',
    loadingTitle: 'Loading and framing 3D model…',
    loadingBody:
      'Reading glTF 2.0 geometry, computing real volume bounds, and fitting the initial camera.',
    errorFormatTitle: 'File format not supported by the 3D viewer',
    errorFormatSkpBody:
      'You selected a SketchUp (.skp) file. SketchUp files are logged in the dossier as working sources, but the browser viewer requires an exported .glb or .gltf file.',
    errorFormatGenericBody:
      'The selected file is not a glTF 2.0 model (.glb or .gltf).',
    errorFormatNextAction:
      'Export the model as .glb (binary glTF 2.0) in your modeling tool or load the demonstrative model.',
    errorInvalidTitle: 'Invalid, corrupted, or incomplete model file',
    errorInvalidBody:
      'Could not construct a valid 3D scene from this file. The binary glTF header may be truncated or the JSON structure contains no valid meshes.',
    errorInvalidMissingDepsBody:
      'This .gltf file references external files (.bin buffers or textures) that are not embedded. For single-file local preview, use a self-contained .glb or embedded .gltf.',
    errorInvalidNextAction:
      'Check your export settings for a self-contained .glb file or return to the studio demonstrative model.',
    errorTooLargeTitle: 'Model file is too large for immediate browser preview',
    errorTooLargeBody:
      'The file exceeds the safe threshold configured for responsive local inspection without exhausting GPU memory.',
    errorTooLargeNextAction:
      'Simplify the mesh or export only the essential architectural massing in .glb (up to 50 MB).',
    webglUnavailableTitle: 'WebGL graphics context unavailable on this device',
    webglUnavailableBody:
      'The browser or graphics adapter could not initialize the WebGL 3D engine (or the graphics context was lost). Project technical metadata remains accessible for review.',
    webglUnavailableNextAction:
      'Enable hardware acceleration in your browser, try restoring the view, or return to the project technical dossier.',
    retryAction: 'Retry with demonstrative model',
  },
};

export function getModelViewerDictionary(
  language: AppLanguage = 'pt',
): ModelViewerDictionary {
  return language === 'en' ? EN_DICTIONARY : PT_DICTIONARY;
}
