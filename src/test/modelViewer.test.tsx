import fs from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ArchitecturalModelViewer,
  OA_DEMO_MODEL_SOURCES,
  getModelViewerDictionary,
  type DisposalSummary,
  type LoadedModelTelemetry,
  type ModelViewerErrorDetail,
} from '../features/model-viewer';

const PAVILION_GLB_PATH = path.resolve(
  process.cwd(),
  'public/assets/models/oa-ponta-vermelha-pavilion-demo.glb',
);
const COSTA_GLB_PATH = path.resolve(
  process.cwd(),
  'public/assets/models/oa-costa-terraces-massing-demo.glb',
);

const pavilionBytes = fs.readFileSync(PAVILION_GLB_PATH);
const costaBytes = fs.readFileSync(COSTA_GLB_PATH);

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const copy = new Uint8Array(buf.byteLength);
  copy.set(buf);
  return copy.buffer;
}

/**
 * Builds a minimal valid binary .glb without declaredUnit in asset.extras
 * so we can test honest unverified unit handling on local file imports.
 */
function buildMinimalUnitlessGlb(): ArrayBuffer {
  const positions = new Float32Array([
    0, 0, 0,
    4, 0, 0,
    0, 3, 0,
  ]);
  const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0]); // 6 bytes + 2 pad = 8 bytes

  const posBytes = Buffer.from(positions.buffer);
  const normBytes = Buffer.from(normals.buffer);
  const idxBytes = Buffer.from(indices.buffer);
  const binChunk = Buffer.concat([posBytes, normBytes, idxBytes]);

  const gltf = {
    asset: { version: '2.0', generator: 'UnitTestLocalGlb' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: 'Local_Study_Prism', mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        min: [0, 0, 0],
        max: [4, 3, 0],
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        min: [0, 0, 1],
        max: [0, 0, 1],
      },
      {
        bufferView: 2,
        componentType: 5123,
        count: 3,
        type: 'SCALAR',
        min: [0],
        max: [2],
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 72, byteLength: 6, target: 34963 },
    ],
    buffers: [{ byteLength: binChunk.length }],
  };

  const jsonRaw = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = (4 - (jsonRaw.length % 4)) % 4;
  const jsonChunk =
    jsonPad > 0 ? Buffer.concat([jsonRaw, Buffer.alloc(jsonPad, 0x20)]) : jsonRaw;

  const totalLen = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonHdr = Buffer.alloc(8);
  jsonHdr.writeUInt32LE(jsonChunk.length, 0);
  jsonHdr.writeUInt32LE(0x4e4f534a, 4);

  const binHdr = Buffer.alloc(8);
  binHdr.writeUInt32LE(binChunk.length, 0);
  binHdr.writeUInt32LE(0x004e4942, 4);

  return toArrayBuffer(
    Buffer.concat([header, jsonHdr, jsonChunk, binHdr, binChunk]),
  );
}

describe('O+A Workspace — Phase 04B Interactive Architectural 3D Viewer', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('oa-ponta-vermelha-pavilion-demo.glb')) {
        return new Response(toArrayBuffer(pavilionBytes), {
          status: 200,
          headers: { 'Content-Type': 'model/gltf-binary' },
        });
      }
      if (url.includes('oa-costa-terraces-massing-demo.glb')) {
        return new Response(toArrayBuffer(costaBytes), {
          status: 200,
          headers: { 'Content-Type': 'model/gltf-binary' },
        });
      }
      return new Response('Not found', { status: 404 });
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('maintains 100% PT/EN dictionary key parity and clear non-technical labels', () => {
    const pt = getModelViewerDictionary('pt');
    const en = getModelViewerDictionary('en');

    expect(Object.keys(pt)).toEqual(Object.keys(en));
    expect(Object.keys(pt.header)).toEqual(Object.keys(en.header));
    expect(Object.keys(pt.controls)).toEqual(Object.keys(en.controls));
    expect(Object.keys(pt.stage)).toEqual(Object.keys(en.stage));
    expect(Object.keys(pt.panel)).toEqual(Object.keys(en.panel));
    expect(Object.keys(pt.states)).toEqual(Object.keys(en.states));

    expect(pt.controls.topView).toBe('Vista superior');
    expect(en.controls.topView).toBe('Top view');
  });

  it('loads real .glb via GLTFLoader, computes telemetry & verified units, switches models, and disposes GPU resources on swap & unmount', async () => {
    const user = userEvent.setup();
    const loadedEvents: LoadedModelTelemetry[] = [];
    const disposedEvents: DisposalSummary[] = [];

    const { unmount } = render(
      <ArchitecturalModelViewer
        webglAvailableOverride={true}
        onModelLoaded={(_source, telemetry) => loadedEvents.push(telemetry)}
        onSceneDisposed={(summary) => disposedEvents.push(summary)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('architectural-model-viewer')).toHaveAttribute(
        'data-viewer-status',
        'loaded',
      );
    });

    expect(loadedEvents).toHaveLength(1);
    expect(loadedEvents[0].meshCount).toBe(16);
    expect(loadedEvents[0].triangleCount).toBe(192);
    expect(loadedEvents[0].verifiedUnit).toBe('m');
    expect(loadedEvents[0].verifiedScale).toBe('1:100');

    expect(screen.getByTestId('model-telemetry-meshes')).toHaveTextContent('16');
    expect(screen.getByTestId('model-dimension-width')).toHaveTextContent('24 m');
    const watermark = await screen.findByTestId('stage-provenance-watermark');
    expect(watermark).toHaveTextContent(/MODELO DE DEMONSTRAÇÃO/i);

    // Switch to the second built-in .glb model (MOD-OA-108-V2)
    await user.click(
      screen.getByRole('button', { name: OA_DEMO_MODEL_SOURCES[1].code }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('model-telemetry-meshes')).toHaveTextContent('8');
    });

    // Previous 16-mesh scene must have been disposed during model switch
    expect(disposedEvents.length).toBeGreaterThanOrEqual(1);
    expect(disposedEvents[0].disposedGeometries).toBe(16);
    expect(disposedEvents[0].disposedMaterials).toBeGreaterThan(0);

    // Unmount viewer and verify second 8-mesh scene is also disposed cleanly
    const countBeforeUnmount = disposedEvents.length;
    unmount();
    expect(disposedEvents.length).toBe(countBeforeUnmount + 1);
    expect(disposedEvents[disposedEvents.length - 1].disposedGeometries).toBe(8);
  });

  it('supports camera presets, recenter, reset view, zoom buttons, grid/axes/wireframe toggles, and navigation help', async () => {
    const user = userEvent.setup();
    const cameraChanges: string[] = [];

    render(
      <ArchitecturalModelViewer
        webglAvailableOverride={true}
        onCameraPresetChange={(preset) => cameraChanges.push(preset)}
      />,
    );

    const stage = await screen.findByTestId('model-viewer-stage');
    expect(stage).toHaveAttribute('data-camera-preset', 'isometric');
    const initialPos = stage.getAttribute('data-camera-position');

    // Switch to Top view ("Vista superior")
    await user.click(screen.getByRole('button', { name: 'Vista superior' }));
    expect(stage).toHaveAttribute('data-camera-preset', 'top');
    expect(stage.getAttribute('data-camera-position')).not.toBe(initialPos);
    expect(cameraChanges).toContain('top');

    // Switch to Front view ("Vista frontal") and Side view ("Vista lateral")
    await user.click(screen.getByRole('button', { name: 'Vista frontal' }));
    expect(stage).toHaveAttribute('data-camera-preset', 'front');

    await user.click(screen.getByRole('button', { name: 'Vista lateral' }));
    expect(stage).toHaveAttribute('data-camera-preset', 'side');

    // Recenter model
    const recenterBefore = Number(stage.getAttribute('data-recenter-count'));
    await user.click(screen.getByRole('button', { name: 'Recentrar modelo' }));
    expect(Number(stage.getAttribute('data-recenter-count'))).toBe(
      recenterBefore + 1,
    );

    // Zoom in & Zoom out buttons
    await user.click(screen.getByRole('button', { name: 'Aproximar vista' }));
    expect(stage).toHaveAttribute('data-zoom-count', '1');
    await user.click(screen.getByRole('button', { name: 'Afastar vista' }));
    expect(stage).toHaveAttribute('data-zoom-count', '2');

    // Reset initial view returns to isometric
    await user.click(screen.getByRole('button', { name: 'Repor vista inicial' }));
    expect(stage).toHaveAttribute('data-camera-preset', 'isometric');

    // Toggle Grid, Axes, Wireframe
    expect(stage).toHaveAttribute('data-grid-visible', 'true');
    await user.click(screen.getByRole('button', { name: 'Grelha' }));
    expect(stage).toHaveAttribute('data-grid-visible', 'false');

    expect(stage).toHaveAttribute('data-axes-visible', 'false');
    await user.click(screen.getByRole('button', { name: 'Eixos' }));
    expect(stage).toHaveAttribute('data-axes-visible', 'true');

    expect(stage).toHaveAttribute('data-wireframe', 'false');
    await user.click(screen.getByRole('button', { name: 'Contorno / malha' }));
    expect(stage).toHaveAttribute('data-wireframe', 'true');

    // Open contextual help drawer
    await user.click(screen.getByRole('button', { name: 'Ajuda de navegação' }));
    expect(screen.getByTestId('model-viewer-help-drawer')).toBeInTheDocument();
  });

  it('imports a local .glb file temporarily in browser memory and does not invent metric units when undeclared', async () => {
    render(<ArchitecturalModelViewer webglAvailableOverride={true} />);

    await screen.findByTestId('model-viewer-stage');

    const unitlessBuffer = buildMinimalUnitlessGlb();
    const localFile = new File([unitlessBuffer], 'estudo-local-sem-escala.glb', {
      type: 'model/gltf-binary',
    });

    const input = screen.getByTestId('model-viewer-file-input');
    fireEvent.change(input, { target: { files: [localFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('model-info-filename')).toHaveTextContent(
        'estudo-local-sem-escala.glb',
      );
    });

    expect(screen.getByTestId('header-model-origin-badge')).toHaveTextContent(
      /Visualização temporária local/i,
    );
    // Must display raw scene units ("unid.") instead of inventing meters
    await waitFor(() => {
      expect(screen.getByTestId('model-dimension-width')).toHaveTextContent(
        '4 unid.',
      );
    });
    expect(screen.getByTestId(' stage-provenance-watermark'.trim())).toHaveTextContent(
      /FICHEIRO LOCAL TEMPORÁRIO · NÃO ENVIADO PARA SERVIDOR/i,
    );
    expect(screen.getByTestId('model-unit-reliability-note')).toHaveTextContent(
      /não declara unidades explícitas/i,
    );
  });

  it('handles .skp format rejection, corrupt .glb, missing external .gltf dependencies, and oversized files honestly', async () => {
    const user = userEvent.setup();
    const errors: ModelViewerErrorDetail[] = [];

    render(
      <ArchitecturalModelViewer
        webglAvailableOverride={true}
        maxFileSizeBytes={1024 * 50} // 50 KB limit for test
        onModelError={(err) => errors.push(err)}
      />,
    );

    await screen.findByTestId('model-viewer-stage');
    const input = screen.getByTestId('model-viewer-file-input');

    // 1. Reject .skp SketchUp file with clear explanation
    const skpFile = new File(['sketchup-binary'], 'maquete-origem.skp', {
      type: 'application/octet-stream',
    });
    fireEvent.change(input, { target: { files: [skpFile] } });

    const formatAlert = await screen.findByTestId(
      'model-viewer-fallback-error_format',
    );
    expect(formatAlert).toHaveTextContent(/SketchUp \(\.skp\)/i);
    expect(screen.getByTestId('architectural-model-viewer')).toHaveAttribute(
      'data-viewer-status',
      'error_format',
    );

    // 2. Reject corrupt .glb file
    const corruptGlb = new File(
      [new Uint8Array(32).fill(9)],
      'corrompido.glb',
      { type: 'model/gltf-binary' },
    );
    fireEvent.change(input, { target: { files: [corruptGlb] } });

    await screen.findByTestId('model-viewer-fallback-error_invalid');
    expect(screen.getByTestId('architectural-model-viewer')).toHaveAttribute(
      'data-viewer-status',
      'error_invalid',
    );

    // 3. Reject .gltf with external .bin dependency
    const externalDepsGltf = JSON.stringify({
      asset: { version: '2.0' },
      buffers: [{ uri: 'external-geometry.bin', byteLength: 1024 }],
    });
    const gltfWithMissingBin = new File(
      [externalDepsGltf],
      'incompleto.gltf',
      { type: 'model/gltf+json' },
    );
    fireEvent.change(input, { target: { files: [gltfWithMissingBin] } });

    await waitFor(() => {
      expect(
        screen.getByTestId('model-viewer-fallback-error_invalid'),
      ).toHaveTextContent(/referencia ficheiros externos/i);
    });

    // 4. Reject oversized file (> 50 KB test threshold)
    const oversizedFile = new File(
      [new Uint8Array(65 * 1024)],
      'modelo-pesado.glb',
      { type: 'model/gltf-binary' },
    );
    fireEvent.change(input, { target: { files: [oversizedFile] } });

    await screen.findByTestId('model-viewer-fallback-error_too_large');
    expect(screen.getByTestId('architectural-model-viewer')).toHaveAttribute(
      'data-viewer-status',
      'error_too_large',
    );

    // Recover back to demonstrative model
    await user.click(
      screen.getByRole('button', {
        name: /Tentar novamente com o modelo demonstrativo/i,
      }),
    );

    await screen.findByTestId('model-viewer-stage');
    expect(screen.getByTestId('architectural-model-viewer')).toHaveAttribute(
      'data-viewer-status',
      'loaded',
    );
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });

  it('presents an accessible fallback when WebGL is unavailable and renders cleanly in English (EN)', async () => {
    const user = userEvent.setup();
    const onBackToDossier = vi.fn();

    render(
      <ArchitecturalModelViewer
        language="en"
        webglAvailableOverride={false}
        onBackToDossier={onBackToDossier}
      />,
    );

    const fallback = await screen.findByTestId(
      'model-viewer-fallback-webgl_unavailable',
    );
    expect(fallback).toHaveTextContent(
      /WebGL graphics context unavailable on this device/i,
    );
    expect(screen.getByTestId('architectural-model-viewer')).toHaveAttribute(
      'data-viewer-status',
      'webgl_unavailable',
    );

    // Verify SketchUp (.skp) note in English
    expect(screen.getByTestId('model-skp-honest-note')).toHaveTextContent(
      /working SketchUp source file/i,
    );

    await user.click(
      screen.getAllByRole('button', { name: /Back to dossier/i })[0],
    );
    expect(onBackToDossier).toHaveBeenCalledTimes(1);
  });
});
