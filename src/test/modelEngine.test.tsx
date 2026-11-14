import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import {
  clearAllSessionModels,
  clearSessionModelForProject,
  createMinimalValidGlbBytes,
  EMBEDDED_DEMO_GLTF_JSON,
  resolveProjectModelById,
  resolveProjectModelState,
  selectSessionModelFile,
  validateModelFileSelection,
} from '../data/modelAssetRepository';
import { MAX_MODEL_FILE_SIZE_BYTES } from '../data/modelAssetTypes';
import {
  addProjectFileReference,
  archiveProject,
  clearProjectLibraryLocalState,
  createProject,
  getProjectById,
} from '../data/projectLibraryRepository';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';
import { MemoryRouter } from 'react-router-dom';

function renderWorkspaceAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

function createValidGlbFile(fileName = 'estudo-sessao-valido.glb'): File {
  const bytes = createMinimalValidGlbBytes();
  return new File([bytes], fileName, { type: 'model/gltf-binary' });
}

describe('Phase 04A · 3D Model Engine, File Contracts & Workspace Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
    clearAllSessionModels();
  });

  afterEach(() => {
    clearAllSessionModels();
    vi.restoreAllMocks();
  });

  it('distinguishes Category A (document-reference .skp & metadata-only .glb), Category B (fictive demo-asset), and Category C (session-file)', async () => {
    const actor = DEMO_USERS[1]; // Sofia Mbanza (Architect)

    // 1. Seed project OA-26-101 has a Category B demo-asset (.glb + .gltf) AND a Category A .skp reference
    const { project: proj101, resolution: res101 } =
      resolveProjectModelById('sd-proj-oa-26-101');
    expect(proj101).not.toBeNull();
    expect(res101).not.toBeNull();
    expect(res101!.hasLoadableModel).toBe(true);
    expect(res101!.origin).toBe('demo-asset');
    expect(res101!.category).toBe('demo-asset');
    expect(res101!.format).toBe('glb');
    expect(res101!.isFictiveStudy).toBe(true);
    expect(res101!.fictiveDisclaimer?.pt).toMatch(/Estudo volumétrico fictício/i);
    expect(res101!.skpReferences.length).toBeGreaterThanOrEqual(1);
    expect(res101!.skpReferences[0].category).toBe('document-reference');
    expect(res101!.skpReferences[0].isLoadableBinaryPresent).toBe(false);
    expect(res101!.skpReferences[0].availabilityStatus).toBe('unsupported-skp');

    // 2. Seed project OA-26-112 resolves a complete self-contained .gltf 2.0 demo-asset
    const { resolution: res112 } = resolveProjectModelById('sd-proj-oa-26-112');
    expect(res112!.hasLoadableModel).toBe(true);
    expect(res112!.origin).toBe('demo-asset');
    expect(res112!.format).toBe('gltf');
    expect(res112!.activeDemoAsset?.embeddedGltfJson).toBe(
      EMBEDDED_DEMO_GLTF_JSON,
    );

    // 3. Adding a .glb file reference in the Dossier on a newly created project produces ONLY a metadata-only document reference (never a fake loadable binary)
    const created = createProject(
      {
        titlePt: 'Pavilhão Sem Binário Demo',
        subtitlePt: 'Verifica distinção entre metadado .glb e modelo carregável.',
        departmentId: 'architecture',
        disciplinePt: 'Arquitectura',
        studioBase: 'Maputo',
        phasePt: 'Estudo Prévio',
        projectStatus: 'concept',
        leadUserId: actor.id,
        nextMilestoneTitlePt: 'Entrega de maquete',
        nextMilestoneDateIso: '2026-12-15',
      },
      actor,
    );

    addProjectFileReference(
      created.identity.id,
      {
        fileName: 'referencia-apenas-metadados.glb',
        kind: 'model_3d',
        versionLabel: 'v01',
        notePt: 'Apenas registo documental no dossier.',
      },
      actor,
    );

    const updatedCreated = getProjectById(created.identity.id)!;
    const resCreated = resolveProjectModelState(updatedCreated);
    expect(resCreated.hasLoadableModel).toBe(false);
    expect(resCreated.url).toBeNull();
    expect(resCreated.origin).toBe('document-reference');
    expect(resCreated.availabilityStatus).toBe('metadata-only');
    expect(resCreated.metadataOnly3DReferences).toHaveLength(1);
    expect(
      resCreated.metadataOnly3DReferences[0].isLoadableBinaryPresent,
    ).toBe(false);
  });

  it('validates .skp, unsupported extensions, empty files, oversized files (> 50 MB), invalid .glb headers, and .gltf manifests', async () => {
    // 1. Native .skp is rejected for direct WebGL loading with clear non-converter guidance
    const skpFile = new File(['SketchUp Model'], 'bloco-central.skp', {
      type: 'application/octet-stream',
    });
    const skpResult = await validateModelFileSelection(skpFile);
    expect(skpResult.ok).toBe(false);
    if (!skpResult.ok) {
      expect(skpResult.errorCode).toBe('NATIVE_SKP_UNSUPPORTED');
      expect(skpResult.message.pt).toMatch(/sem conversão automática/i);
    }

    // 2. Unsupported extension (.dwg / .obj)
    const dwgFile = new File(['AC1032'], 'planta-piso-0.dwg', {
      type: 'application/acad',
    });
    const dwgResult = await validateModelFileSelection(dwgFile);
    expect(dwgResult.ok).toBe(false);
    if (!dwgResult.ok) {
      expect(dwgResult.errorCode).toBe('UNSUPPORTED_EXTENSION');
    }

    // 3. Empty file (0 B)
    const emptyGlb = new File([], 'vazio.glb', { type: 'model/gltf-binary' });
    const emptyResult = await validateModelFileSelection(emptyGlb);
    expect(emptyResult.ok).toBe(false);
    if (!emptyResult.ok) {
      expect(emptyResult.errorCode).toBe('EMPTY_FILE');
    }

    // 4. Oversized file (> 50 MB)
    const oversizedMock = {
      name: 'cidade-inteira-pesada.glb',
      size: MAX_MODEL_FILE_SIZE_BYTES + 1024,
      slice: () => new Blob([]),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
    };
    const oversizedResult = await validateModelFileSelection(oversizedMock);
    expect(oversizedResult.ok).toBe(false);
    if (!oversizedResult.ok) {
      expect(oversizedResult.errorCode).toBe('FILE_TOO_LARGE');
      expect(oversizedResult.message.pt).toMatch(/50 MB/);
    }

    // 5. Invalid .glb binary header (text disguised as .glb)
    const fakeGlb = new File(['NOT_A_VALID_GLB_HEADER_12345'], 'falso.glb', {
      type: 'model/gltf-binary',
    });
    const fakeGlbResult = await validateModelFileSelection(fakeGlb);
    expect(fakeGlbResult.ok).toBe(false);
    if (!fakeGlbResult.ok) {
      expect(fakeGlbResult.errorCode).toBe('INVALID_GLB_HEADER');
    }

    // 6. Valid binary .glb passes
    const validGlb = createValidGlbFile('maquete-valida.glb');
    const validGlbResult = await validateModelFileSelection(validGlb);
    expect(validGlbResult.ok).toBe(true);

    // 7. Incomplete .gltf referencing external .bin without embedded data: URI is rejected honestly
    const incompleteGltf = new File(
      [
        JSON.stringify({
          asset: { version: '2.0' },
          scenes: [{ nodes: [0] }],
          nodes: [{ name: 'Root' }],
          buffers: [{ byteLength: 1024, uri: 'geometria-externa.bin' }],
        }),
      ],
      'incompleto.gltf',
      { type: 'model/gltf+json' },
    );
    const incompleteGltfResult =
      await validateModelFileSelection(incompleteGltf);
    expect(incompleteGltfResult.ok).toBe(false);
    if (!incompleteGltfResult.ok) {
      expect(incompleteGltfResult.errorCode).toBe(
        'GLTF_EXTERNAL_RESOURCES_MISSING',
      );
      expect(incompleteGltfResult.missingExternalResources).toContain(
        'geometria-externa.bin',
      );
    }

    // 8. Complete self-contained .gltf 2.0 with embedded data: URI passes
    const completeGltf = new File(
      [EMBEDDED_DEMO_GLTF_JSON],
      'estudo-completo.gltf',
      { type: 'model/gltf+json' },
    );
    const completeGltfResult = await validateModelFileSelection(completeGltf);
    expect(completeGltfResult.ok).toBe(true);
  });

  it('manages temporary session ObjectURLs, revokes on replacement/clear/global reset, and never persists blob: URLs in localStorage', async () => {
    const createUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementationOnce(() => 'blob:oa-test-session-url-1')
      .mockImplementationOnce(() => 'blob:oa-test-session-url-2');
    const revokeUrlSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    const firstFile = createValidGlbFile('primeiro-estudo.glb');
    const res1 = await selectSessionModelFile('sd-proj-oa-26-101', firstFile);
    expect(res1.ok).toBe(true);
    expect(createUrlSpy).toHaveBeenCalledTimes(1);

    // Verify no localStorage key contains "blob:"
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)!;
      expect(window.localStorage.getItem(key)).not.toContain('blob:');
    }

    // Selecting a second file for the same project revokes the first ObjectURL immediately
    const secondFile = createValidGlbFile('segundo-estudo.glb');
    const res2 = await selectSessionModelFile('sd-proj-oa-26-101', secondFile);
    expect(res2.ok).toBe(true);
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:oa-test-session-url-1');

    // Clearing the session model revokes the second ObjectURL
    const cleared = clearSessionModelForProject('sd-proj-oa-26-101');
    expect(cleared).toBe(true);
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:oa-test-session-url-2');

    // Global reset also revokes any active session ObjectURLs
    createUrlSpy.mockImplementationOnce(() => 'blob:oa-test-session-url-3');
    await selectSessionModelFile('sd-proj-oa-26-108', firstFile);
    clearProjectLibraryLocalState();
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:oa-test-session-url-3');
  });

  it('renders /workspace/projects/:id/model with 404 protection, archived preservation, private state, file selection, and Dossier navigation', async () => {
    const user = userEvent.setup();
    const actor = DEMO_USERS[1]; // Sofia Mbanza
    persistDemoSessionForUser(actor);

    // 1. Non-existent project ID -> honest 404
    const notFoundView = renderWorkspaceAt(
      '/workspace/projects/id-inexistente-999/model',
    );
    expect(
      await screen.findByRole('heading', {
        name: /Projecto não encontrado para pré-visualização 3D/i,
      }),
    ).toBeInTheDocument();
    notFoundView.unmount();

    // 2. Archived project preserves references & privacy without losing history
    archiveProject('sd-proj-oa-26-108', actor);
    const archivedView = renderWorkspaceAt(
      '/workspace/projects/sd-proj-oa-26-108/model',
    );
    expect(
      await screen.findByTestId('model-engine-archived-banner'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('model-engine-privacy-badge'),
    ).toHaveTextContent(/Privado por omissão/i);
    expect(
      screen.getByText('oa-26-108-study-model.skp'),
    ).toBeInTheDocument();
    archivedView.unmount();

    // 3. Active project OA-26-101: shows fictive study disclaimer, switches .glb <-> .gltf demo study, selects & clears local session .glb, and returns to Dossier
    renderWorkspaceAt('/workspace/projects/sd-proj-oa-26-101/model');
    expect(
      await screen.findByRole('heading', {
        name: /Galeria Cívica & Pátio da Ponta Vermelha/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('model-engine-fictive-study-notice'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('model-engine-resolved-uri')).toHaveTextContent(
      '/assets/models/oa-ponta-vermelha-massing.glb',
    );

    // Switch to the complete .gltf demonstrative study
    await user.click(
      screen.getByRole('button', {
        name: /Estudo demonstrativo activo: \.GLTF/i,
      }),
    );
    expect(screen.getByTestId('model-engine-resolved-uri')).toHaveTextContent(
      '/assets/models/oa-ponta-vermelha-section.gltf',
    );

    // Upload a temporary local .glb file in the session
    const fileInput = screen.getByTestId(
      'model-engine-file-input',
    ) as HTMLInputElement;
    const validLocalGlb = createValidGlbFile('maquete-local-sessao.glb');
    await user.upload(fileInput, validLocalGlb);

    expect(
      await screen.findByTestId('model-engine-session-file-notice'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('model-category-session-file')).getByText(
        'maquete-local-sessao.glb',
      ),
    ).toBeInTheDocument();

    // Clear session file -> returns to demo-asset
    await user.click(
      screen.getByRole('button', { name: /Limpar ficheiro da sessão/i }),
    );
    expect(
      screen.queryByTestId('model-engine-session-file-notice'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('model-engine-fictive-study-notice'),
    ).toBeInTheDocument();

    // Navigate Back to Dossier -> verifies Dossier 3D strip and return link
    await user.click(screen.getByRole('link', { name: /Voltar ao Dossier/i }));
    expect(
      await screen.findByTestId('dossier-model-engine-strip'),
    ).toBeInTheDocument();
  });

  it('supports all 6 demo profiles and switches PT/EN cleanly on /workspace/projects/:id/model', async () => {
    const user = userEvent.setup();

    for (const demoUser of DEMO_USERS) {
      persistDemoSessionForUser(demoUser);
      const view = renderWorkspaceAt(
        '/workspace/projects/sd-proj-oa-26-101/model',
      );
      expect(
        await screen.findByRole('heading', {
          name: /Galeria Cívica & Pátio da Ponta Vermelha|Civic Gallery & Ponta Vermelha Courtyard/i,
        }),
      ).toBeInTheDocument();
      view.unmount();
    }

    persistDemoSessionForUser(DEMO_USERS[0]);
    renderWorkspaceAt('/workspace/projects/sd-proj-oa-26-101/model');
    expect(
      await screen.findByText(
        /FASE 04 · MOTOR DE MODELOS 3D & CONTRATO DE FICHEIROS/i,
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Mudar idioma para inglês/i }),
    );
    expect(
      await screen.findByText(/PHASE 04 · 3D MODEL ENGINE & FILE CONTRACT/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to Dossier/i }),
    ).toBeInTheDocument();
  });
});
