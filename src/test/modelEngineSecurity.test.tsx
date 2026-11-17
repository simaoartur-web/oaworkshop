import fs from 'node:fs';
import path from 'node:path';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import {
  useWorkspaceSession,
  WorkspaceSessionProvider,
} from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import {
  clearAllSessionModels,
  createMinimalValidGlbBytes,
  getSessionModelForProject,
  isAllowedEmbeddedDataUri,
  selectSessionModelFile,
  validateGltfManifestText,
  validateModelFileSelection,
} from '../data/modelAssetRepository';
import { MAX_MODEL_FILE_SIZE_BYTES } from '../data/modelAssetTypes';
import {
  clearProjectLibraryLocalState,
  createProject,
} from '../data/projectLibraryRepository';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';
import * as glbInspectorModule from '../features/model-viewer/glbInspector';

const PAVILION_GLB_PATH = path.resolve(
  process.cwd(),
  'public/assets/models/oa-ponta-vermelha-pavilion-demo.glb',
);
const pavilionBytes = fs.readFileSync(PAVILION_GLB_PATH);

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const copy = new Uint8Array(buf.byteLength);
  copy.set(buf);
  return copy.buffer;
}

function buildCustomGlbBytes(
  jsonText: string,
  binPayload: Uint8Array = new Uint8Array(8),
): ArrayBuffer {
  const jsonBytes = new TextEncoder().encode(jsonText);
  const paddedJsonLength = Math.ceil(jsonBytes.byteLength / 4) * 4;
  const paddedBinLength = Math.ceil(binPayload.byteLength / 4) * 4;
  const totalLength = 12 + 8 + paddedJsonLength + 8 + paddedBinLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  view.setUint32(0, 0x46546c67, true); // 'glTF'
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);

  view.setUint32(12, paddedJsonLength, true);
  view.setUint32(16, 0x4e4f534a, true); // 'JSON'

  const bytes = new Uint8Array(buffer);
  bytes.set(jsonBytes, 20);
  for (let i = 20 + jsonBytes.byteLength; i < 20 + paddedJsonLength; i++) {
    bytes[i] = 0x20;
  }

  const binHeaderOffset = 20 + paddedJsonLength;
  view.setUint32(binHeaderOffset, paddedBinLength, true);
  view.setUint32(binHeaderOffset + 4, 0x004e4942, true); // 'BIN\0'
  bytes.set(binPayload, binHeaderOffset + 8);
  return buffer;
}

function buildCustomGlbFile(
  manifest: Record<string, unknown>,
  fileName = 'adversarial-test.glb',
): File {
  const bytes = buildCustomGlbBytes(JSON.stringify(manifest));
  return new File([bytes], fileName, { type: 'model/gltf-binary' });
}

function createManifest(overrides: Record<string, unknown> = {}) {
  return {
    asset: { version: '2.0' },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [
      {
        byteLength: 4,
        uri: 'data:application/octet-stream;base64,AAAAAA==',
      },
    ],
    ...overrides,
  };
}

function SessionSignOutProbe() {
  const { signOut, session } = useWorkspaceSession();
  return (
    <div>
      <span data-testid="probe-session-state">
        {session ? 'active' : 'signed-out'}
      </span>
      <button type="button" onClick={signOut}>
        Probe SignOut
      </button>
    </div>
  );
}

describe('Phase 04 Hardening · Agent A Security & Integrity (P0.1–P0.4 + P1.5)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
    clearAllSessionModels();

    vi.spyOn(glbInspectorModule, 'detectWebGLSupport').mockReturnValue(true);

    const originalFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.startsWith('data:')) {
        return originalFetch(input, init);
      }
      if (url.includes('oa-ponta-vermelha-pavilion-demo.glb')) {
        return new Response(toArrayBuffer(pavilionBytes), {
          status: 200,
          headers: { 'Content-Type': 'model/gltf-binary' },
        });
      }
      return new Response('Not found', { status: 404 });
    });
  });

  afterEach(() => {
    clearAllSessionModels();
    vi.restoreAllMocks();
  });

  it('P0.1/P0.2: enforces strict case-insensitive data: MIME allowlist on buffers and images', () => {
    expect(
      isAllowedEmbeddedDataUri(
        'DATA:APPLICATION/OCTET-STREAM;base64,AAAAAA==',
        'buffer',
      ),
    ).toBe(true);
    expect(
      isAllowedEmbeddedDataUri(
        'data:application/gltf-buffer;base64,AAAAAA==',
        'buffer',
      ),
    ).toBe(true);
    expect(
      isAllowedEmbeddedDataUri('DATA:IMAGE/PNG;base64,iVBORw0K', 'image'),
    ).toBe(true);
    expect(
      isAllowedEmbeddedDataUri('data:image/jpeg;base64,/9j/4AAQ', 'image'),
    ).toBe(true);
    expect(
      isAllowedEmbeddedDataUri('data:image/webp;base64,UklGRh4=', 'image'),
    ).toBe(true);

    // Cross-kind MIME mismatch rejected
    expect(
      isAllowedEmbeddedDataUri('data:image/png;base64,iVBORw0K', 'buffer'),
    ).toBe(false);
    expect(
      isAllowedEmbeddedDataUri(
        'data:application/octet-stream;base64,AAAAAA==',
        'image',
      ),
    ).toBe(false);

    // SVG, HTML, JS, parameter smuggling, and empty MIME rejected
    const disallowed = [
      'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      'DATA:IMAGE/SVG+XML,<svg onload=alert(1)></svg>',
      'data:text/html,<script>alert(1)</script>',
      'data:application/javascript,alert(1)',
      'data:text/javascript;base64,YWxlcnQoMSk=',
      'data:,raw-payload',
      'data:image/png;html,<script>,AA==',
      'data:image/png',
    ];
    for (const uri of disallowed) {
      expect(isAllowedEmbeddedDataUri(uri, 'image')).toBe(false);
      expect(isAllowedEmbeddedDataUri(uri, 'buffer')).toBe(false);
    }
  });

  it('P0.3: rejects SVG, HTML, JavaScript, external schemes, and relative paths in .gltf manifests', async () => {
    const validGltfText = JSON.stringify(
      createManifest({
        buffers: [
          {
            byteLength: 4,
            uri: 'DATA:APPLICATION/GLTF-BUFFER;base64,AAAAAA==',
          },
        ],
        images: [{ uri: 'DATA:IMAGE/WEBP;base64,UklGRh4=' }],
      }),
    );
    expect(validateGltfManifestText(validGltfText).ok).toBe(true);

    const unsafeUris = [
      { target: 'images', uri: 'data:image/svg+xml;base64,PHN2Zz4=' },
      { target: 'images', uri: 'DATA:IMAGE/SVG+XML,<svg></svg>' },
      { target: 'images', uri: 'data:text/html;base64,PHNjcmlwdD4=' },
      { target: 'buffers', uri: 'data:application/javascript,alert(1)' },
      { target: 'buffers', uri: 'data:text/javascript;base64,YWxlcnQoMSk=' },
    ] as const;

    for (const sample of unsafeUris) {
      const payload = createManifest({
        [sample.target]: [{ byteLength: 4, uri: sample.uri }],
      });
      const file = new File([JSON.stringify(payload)], 'evil-data.gltf', {
        type: 'model/gltf+json',
      });
      const result = await validateModelFileSelection(file);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorCode).toBe('UNSAFE_EMBEDDED_DATA_URI');
      }
    }

    const externalOrRelativeUris = [
      'https://attacker.example/buffer.bin',
      'http://localhost:8080/leak',
      '//cdn.attacker.example/a.png',
      'ftp://files.example/mesh.bin',
      'file:///etc/passwd',
      'javascript:alert(1)',
      'blob:https://app.example/123',
      '../secrets/hidden.bin',
      './textures/wall.png',
      'mesh.bin',
      'sub\\tex.png',
    ];

    for (const badUri of externalOrRelativeUris) {
      const payload = createManifest({
        images: [{ uri: badUri }],
      });
      const file = new File([JSON.stringify(payload)], 'external-ref.gltf', {
        type: 'model/gltf+json',
      });
      const result = await validateModelFileSelection(file);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorCode).toBe('GLTF_EXTERNAL_RESOURCES_MISSING');
      }
    }
  });

  it('P0.1/P0.3/P0.4: inspects .glb JSON chunks and rejects disallowed data: URIs, external schemes, relative paths, and corrupt JSON before ObjectURL or 3D loader', async () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL');

    const maliciousGlbCases: Array<{
      file: File;
      expectedCode: string;
    }> = [
      {
        file: buildCustomGlbFile(
          createManifest({
            buffers: [{ byteLength: 4 }],
            images: [{ uri: 'data:image/svg+xml;base64,PHN2Zz4=' }],
          }),
          'svg-in-glb.glb',
        ),
        expectedCode: 'UNSAFE_EMBEDDED_DATA_URI',
      },
      {
        file: buildCustomGlbFile(
          createManifest({
            buffers: [{ byteLength: 4, uri: 'data:text/html,<b>x</b>' }],
          }),
          'html-in-glb.glb',
        ),
        expectedCode: 'UNSAFE_EMBEDDED_DATA_URI',
      },
      {
        file: buildCustomGlbFile(
          createManifest({
            buffers: [{ byteLength: 4 }],
            images: [{ uri: 'https://evil.example/track.png' }],
          }),
          'https-in-glb.glb',
        ),
        expectedCode: 'GLTF_EXTERNAL_RESOURCES_MISSING',
      },
      {
        file: buildCustomGlbFile(
          createManifest({
            buffers: [{ byteLength: 4, uri: '../relative.bin' }],
          }),
          'relative-in-glb.glb',
        ),
        expectedCode: 'GLTF_EXTERNAL_RESOURCES_MISSING',
      },
      {
        file: new File(
          [buildCustomGlbBytes('{corrupt-json-chunk')],
          'corrupt-json-chunk.glb',
          { type: 'model/gltf-binary' },
        ),
        expectedCode: 'INVALID_GLTF_JSON',
      },
    ];

    for (const testCase of maliciousGlbCases) {
      const outcome = await selectSessionModelFile(
        'sd-proj-oa-26-101',
        testCase.file,
      );
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        expect(outcome.errorCode).toBe(testCase.expectedCode);
      }
      expect(getSessionModelForProject('sd-proj-oa-26-101')).toBeNull();
    }

    // Also verify oversized > 50 MB file is rejected without ObjectURL creation
    const oversized = {
      name: 'gigantic.glb',
      size: MAX_MODEL_FILE_SIZE_BYTES + 1,
      slice: () => new Blob([]),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as File;
    const oversizedResult = await selectSessionModelFile(
      'sd-proj-oa-26-101',
      oversized,
    );
    expect(oversizedResult.ok).toBe(false);
    if (!oversizedResult.ok) {
      expect(oversizedResult.errorCode).toBe('FILE_TOO_LARGE');
    }

    // None of the rejected files may allocate a temporary blob: ObjectURL
    expect(createObjectUrlSpy).not.toHaveBeenCalled();

    // Clean .glb JSON chunk passes inspection
    const cleanGlb = buildCustomGlbFile(
      createManifest({
        buffers: [{ byteLength: 8 }],
        images: [{ uri: 'DATA:IMAGE/PNG;base64,iVBORw0K' }],
      }),
      'clean-embedded.glb',
    );
    const cleanResult = await validateModelFileSelection(cleanGlb);
    expect(cleanResult.ok).toBe(true);
  });

  it('P0.4: prevents rejected .glb and .gltf files uploaded in UI from reaching parseGlbSceneAndTelemetry (3D loader)', async () => {
    const actor = DEMO_USERS[1];
    persistDemoSessionForUser(actor);
    const user = userEvent.setup();
    const parseSpy = vi.spyOn(glbInspectorModule, 'parseGlbSceneAndTelemetry');

    const emptyProject = createProject(
      {
        titlePt: 'Projecto Sem Modelo Demo',
        subtitlePt: 'Verifica bloqueio antes do carregador 3D.',
        departmentId: 'architecture',
        disciplinePt: 'Arquitectura',
        studioBase: 'Maputo',
        projectStatus: 'concept',
        phasePt: 'Estudo Prévio',
        nextMilestoneTitlePt: 'Entrega inicial',
        nextMilestoneDateIso: '2026-12-10',
        leadUserId: actor.id,
      },
      actor,
    );

    render(
      <MemoryRouter
        initialEntries={[`/workspace/projects/${emptyProject.identity.id}/model`]}
      >
        <WorkspaceSessionProvider>
          <AppRoutes />
        </WorkspaceSessionProvider>
      </MemoryRouter>,
    );

    const fileInput = (await screen.findByTestId(
      'model-engine-file-input',
    )) as HTMLInputElement;
    expect(parseSpy).not.toHaveBeenCalled();

    // 1. Upload malicious .gltf with data:image/svg+xml
    const maliciousGltf = new File(
      [
        JSON.stringify(
          createManifest({
            images: [{ uri: 'data:image/svg+xml;base64,PHN2Zz4=' }],
          }),
        ),
      ],
      'evil-svg.gltf',
      { type: 'model/gltf+json' },
    );
    await user.upload(fileInput, maliciousGltf);

    await waitFor(() => {
      expect(
        screen.getByTestId('model-engine-error-alert'),
      ).toHaveTextContent(/disallowed data:|URIs data: não permitidos/i);
    });
    expect(parseSpy).not.toHaveBeenCalled();

    // 2. Upload malicious .glb whose JSON chunk references https:// URL
    const maliciousGlb = buildCustomGlbFile(
      createManifest({
        buffers: [{ byteLength: 4 }],
        images: [{ uri: 'https://evil.example/pwn.png' }],
      }),
      'evil-external.glb',
    );
    await user.upload(fileInput, maliciousGlb);

    await waitFor(() => {
      expect(
        screen.getByTestId('model-engine-error-alert'),
      ).toHaveTextContent(/https:\/\/evil\.example\/pwn\.png/i);
    });
    expect(parseSpy).not.toHaveBeenCalled();
  });

  it('P1.5: clears sessionModelsByProjectId and revokes temporary ObjectURLs on signOut()', async () => {
    const actor = DEMO_USERS[1];
    persistDemoSessionForUser(actor);
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

    const validGlb = new File(
      [createMinimalValidGlbBytes()],
      'session-temp-model.glb',
      { type: 'model/gltf-binary' },
    );
    const registered = await selectSessionModelFile(
      'sd-proj-oa-26-101',
      validGlb,
    );
    expect(registered.ok).toBe(true);
    expect(getSessionModelForProject('sd-proj-oa-26-101')).not.toBeNull();
    const allocatedUrl = getSessionModelForProject('sd-proj-oa-26-101')!.objectUrl;

    render(
      <WorkspaceSessionProvider>
        <SessionSignOutProbe />
      </WorkspaceSessionProvider>,
    );

    expect(screen.getByTestId('probe-session-state')).toHaveTextContent(
      'active',
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Probe SignOut' }));
    });

    expect(screen.getByTestId('probe-session-state')).toHaveTextContent(
      'signed-out',
    );
    expect(getSessionModelForProject('sd-proj-oa-26-101')).toBeNull();
    expect(revokeSpy).toHaveBeenCalledWith(allocatedUrl);
  });
});
