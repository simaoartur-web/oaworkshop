import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { AppLanguage } from '../../data/types';
import type {
  ArchitecturalModelSource,
  LoadedModelTelemetry,
  ModelStageViewSettings,
} from './contracts';
import {
  computeCameraPoseForPreset,
  detectWebGLSupport,
  type CameraPose,
} from './glbInspector';
import { getModelViewerDictionary } from './i18n';

export interface ModelViewerStageProps {
  language?: AppLanguage;
  source: ArchitecturalModelSource;
  scene: THREE.Group;
  telemetry: LoadedModelTelemetry;
  settings: ModelStageViewSettings;
  reduceMotion?: boolean;
  onWebGLContextLost?: () => void;
}

interface StageControllerProps {
  scene: THREE.Group;
  telemetry: LoadedModelTelemetry;
  settings: ModelStageViewSettings;
  onWebGLContextLost?: () => void;
}

function applyPoseToThreeCamera(
  cam: THREE.Camera,
  pose: CameraPose,
  controls: OrbitControlsImpl | null,
): void {
  cam.up.set(pose.up[0], pose.up[1], pose.up[2]);
  cam.position.set(pose.position[0], pose.position[1], pose.position[2]);
  if ((cam as THREE.PerspectiveCamera).isPerspectiveCamera) {
    const persp = cam as THREE.PerspectiveCamera;
    Object.assign(persp, { near: pose.near, far: pose.far });
    persp.updateProjectionMatrix();
  }
  if (controls) {
    controls.target.set(pose.target[0], pose.target[1], pose.target[2]);
    controls.update();
  } else {
    cam.lookAt(pose.target[0], pose.target[1], pose.target[2]);
  }
}

function StageSceneController({
  scene,
  telemetry,
  settings,
  onWebGLContextLost,
}: StageControllerProps) {
  const getThreeState = useThree((state) => state.get);
  const invalidate = useThree((state) => state.invalidate);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Attach WebGL context loss listener to the underlying canvas
  useEffect(() => {
    const canvas = getThreeState().gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onWebGLContextLost?.();
    };
    const handleContextRestored = () => {
      invalidate();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost, false);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
    };
  }, [getThreeState, invalidate, onWebGLContextLost]);

  // Apply wireframe mode to all materials in the loaded scene
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if ('wireframe' in mat) {
          Object.assign(mat, {
            wireframe: settings.wireframe,
            needsUpdate: true,
          });
        }
      }
    });
    invalidate();
  }, [scene, settings.wireframe, invalidate]);

  // Apply camera preset, auto-fit bounds, recenter, or reset view
  useEffect(() => {
    const pose = computeCameraPoseForPreset(
      settings.cameraPreset,
      telemetry.boundingRadius,
      telemetry.dimensions.height,
    );
    const { camera } = getThreeState();
    applyPoseToThreeCamera(camera, pose, controlsRef.current);
    invalidate();
  }, [
    getThreeState,
    invalidate,
    scene,
    telemetry.boundingRadius,
    telemetry.dimensions.height,
    settings.cameraPreset,
    settings.recenterCounter,
    settings.revisionCounter,
  ]);

  // Apply explicit zoom button steps (+ / -) for non-gesture accessibility
  useEffect(() => {
    if (settings.zoomDeltaCounter === 0 || !settings.lastZoomDirection) {
      return;
    }
    const { camera } = getThreeState();
    const target = controlsRef.current
      ? controlsRef.current.target.clone()
      : new THREE.Vector3(0, telemetry.dimensions.height * 0.38, 0);

    const offset = camera.position.clone().sub(target);
    const minDistance = Math.max(telemetry.boundingRadius * 0.35, 1.0);
    const maxDistance = Math.max(telemetry.boundingRadius * 8.0, 80.0);
    const factor = settings.lastZoomDirection === 'in' ? 0.8 : 1.25;
    const nextLength = THREE.MathUtils.clamp(
      offset.length() * factor,
      minDistance,
      maxDistance,
    );

    if (offset.lengthSq() > 0.0001) {
      offset.setLength(nextLength);
      camera.position.copy(target).add(offset);
      camera.updateProjectionMatrix();
      controlsRef.current?.update();
      invalidate();
    }
  }, [
    getThreeState,
    invalidate,
    settings.zoomDeltaCounter,
    settings.lastZoomDirection,
    telemetry.boundingRadius,
    telemetry.dimensions.height,
  ]);

  const gridSize = useMemo(() => {
    const span = Math.max(
      telemetry.dimensions.width,
      telemetry.dimensions.depth,
      16,
    );
    return Math.ceil(span * 1.8);
  }, [telemetry.dimensions.width, telemetry.dimensions.depth]);

  const axesSize = useMemo(
    () => Math.max(Number((telemetry.boundingRadius * 0.75).toFixed(1)), 4),
    [telemetry.boundingRadius],
  );

  const minDistance = Math.max(telemetry.boundingRadius * 0.35, 1.0);
  const maxDistance = Math.max(telemetry.boundingRadius * 8.0, 80.0);

  return (
    <>
      <color attach="background" args={['#050505']} />

      {/* Neutral Architectural Studio Lighting — no heavy shadows or bloom */}
      <hemisphereLight args={['#F5EFE6', '#1B1A18', 0.95]} />
      <directionalLight position={[18, 28, 22]} intensity={1.35} color="#FFFBF5" />
      <directionalLight position={[-16, 14, -14]} intensity={0.55} color="#D8E2EB" />
      <directionalLight position={[0, 12, -20]} intensity={0.35} color="#EBD4C8" />

      {settings.showGrid && (
        <gridHelper
          args={[gridSize, Math.min(Math.max(Math.round(gridSize), 16), 40), '#A65D4A', '#222222']}
          position={[0, -0.01, 0]}
        />
      )}

      {settings.showAxes && (
        <axesHelper args={[axesSize]} position={[0, 0.02, 0]} />
      )}

      <primitive object={scene} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping={false}
        enablePan
        enableZoom
        enableRotate
        minDistance={minDistance}
        maxDistance={maxDistance}
        onChange={() => invalidate()}
      />
    </>
  );
}

export function ModelViewerStage({
  language = 'pt',
  source,
  scene,
  telemetry,
  settings,
  onWebGLContextLost,
}: ModelViewerStageProps) {
  const dict = getModelViewerDictionary(language);
  const hasNativeWebGLContext = useMemo(() => detectWebGLSupport(), []);

  // Ensure wireframe flag is always synchronized on the Three.js scene meshes
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if ('wireframe' in mat) {
          Object.assign(mat, {
            wireframe: settings.wireframe,
            needsUpdate: true,
          });
        }
      }
    });
  }, [scene, settings.wireframe]);

  const activePose = useMemo(
    () =>
      computeCameraPoseForPreset(
        settings.cameraPreset,
        telemetry.boundingRadius,
        telemetry.dimensions.height,
      ),
    [settings.cameraPreset, telemetry.boundingRadius, telemetry.dimensions.height],
  );

  const presetLabel =
    settings.cameraPreset === 'top'
      ? dict.controls.topView
      : settings.cameraPreset === 'front'
        ? dict.controls.frontView
        : settings.cameraPreset === 'side'
          ? dict.controls.sideView
          : dict.controls.isometricView;

  return (
    <div
      role="region"
      aria-label={dict.stage.ariaLabel}
      data-testid="model-viewer-stage"
      data-model-code={source.code}
      data-camera-preset={settings.cameraPreset}
      data-camera-position={activePose.position.join(',')}
      data-grid-visible={String(settings.showGrid)}
      data-axes-visible={String(settings.showAxes)}
      data-wireframe={String(settings.wireframe)}
      data-recenter-count={String(settings.recenterCounter)}
      data-revision-count={String(settings.revisionCounter)}
      data-zoom-count={String(settings.zoomDeltaCounter)}
      className="relative w-full h-[340px] sm:h-[420px] lg:h-[470px] bg-[#050505] border border-white/10 overflow-hidden select-none"
    >
      {/* Top Overlay: Active Camera & Spatial Mode */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            data-testid="stage-active-camera-badge"
            className="px-2.5 py-1 bg-[#111111]/90 border border-white/15 text-[11px] font-mono uppercase tracking-[0.14em] text-white"
          >
            {dict.stage.activeCameraBadge}: {presetLabel}
          </span>
          <span className="px-2 py-1 bg-[#111111]/85 border border-white/10 text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
            {settings.showGrid ? dict.stage.gridStateOn : dict.stage.gridStateOff}
          </span>
          {settings.showAxes && (
            <span className="px-2 py-1 bg-[#111111]/85 border border-white/10 text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D]">
              {dict.stage.axesStateOn}
            </span>
          )}
          {settings.wireframe && (
            <span className="px-2 py-1 bg-[#111111]/85 border border-[#A65D4A]/60 text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D]">
              {dict.stage.wireframeStateOn}
            </span>
          )}
        </div>

        <span className="px-2.5 py-1 bg-[#111111]/90 border border-white/15 text-[10px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
          {source.code} · {telemetry.meshCount} MESHES
        </span>
      </div>

      {/* Interactive R3F Canvas — On-Demand Render Loop & Capped DPR */}
      {hasNativeWebGLContext && (
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{
            position: activePose.position,
            fov: 42,
            near: activePose.near,
            far: activePose.far,
          }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
          }}
        >
          <StageSceneController
            scene={scene}
            telemetry={telemetry}
            settings={settings}
            onWebGLContextLost={onWebGLContextLost}
          />
        </Canvas>
      )}

      {/* Bottom Overlay: Honest Provenance Watermark & On-Demand Note */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <span
          data-testid="stage-provenance-watermark"
          className="px-2.5 py-1 bg-[#111111]/90 border border-white/12 text-[10px] font-mono uppercase tracking-[0.16em] text-[#CE826D]"
        >
          {source.origin === 'local_temporary'
            ? dict.stage.localTemporaryWatermark
            : dict.stage.demoWatermark}
        </span>
        <span className="hidden sm:inline-block px-2 py-1 bg-[#111111]/80 border border-white/10 text-[10px] font-mono uppercase tracking-[0.14em] text-[#9E9E9E]">
          {dict.stage.onDemandRenderingNote}
        </span>
      </div>
    </div>
  );
}

export default ModelViewerStage;
