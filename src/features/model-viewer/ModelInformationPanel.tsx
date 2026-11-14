import {
  FileBox,
  FolderOpen,
  Info,
  Layers,
  RotateCcw,
  Ruler,
  ShieldCheck,
} from 'lucide-react';
import type { AppLanguage } from '../../data/types';
import type {
  ArchitecturalModelSource,
  LoadedModelTelemetry,
  ModelViewerStatus,
} from './contracts';
import { formatByteSize } from './glbInspector';
import { getModelViewerDictionary } from './i18n';

export interface ModelInformationPanelProps {
  language?: AppLanguage;
  status: ModelViewerStatus;
  source: ArchitecturalModelSource | null;
  telemetry: LoadedModelTelemetry | null;
  onTriggerLocalFilePicker: () => void;
  onRestoreDemoModel?: () => void;
  isShowingLocalFile: boolean;
}

export function ModelInformationPanel({
  language = 'pt',
  status,
  source,
  telemetry,
  onTriggerLocalFilePicker,
  onRestoreDemoModel,
  isShowingLocalFile,
}: ModelInformationPanelProps) {
  const dict = getModelViewerDictionary(language);

  const statusLabel =
    !source || status === 'empty'
      ? dict.panel.statusEmpty
      : source.origin === 'local_temporary'
        ? dict.panel.statusLocalTemporary
        : source.origin === 'project_reference'
          ? dict.panel.statusProjectReference
          : dict.panel.statusDemo;

  const unitSuffix = telemetry?.verifiedUnit
    ? telemetry.verifiedUnit
    : dict.panel.sceneUnitsSuffix;

  return (
    <aside
      aria-label={dict.panel.sectionTitle}
      className="w-full bg-[#111111] border border-white/10 p-4 sm:p-5 space-y-5 text-left"
    >
      {/* Panel Header & Session Origin Badge */}
      <div className="border-b border-white/10 pb-3.5">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#CE826D] mb-1">
          {dict.panel.sectionTitle}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[#BDBDBD]">{dict.panel.statusHeading}</span>
          <span
            data-testid="model-origin-status-badge"
            className={`px-2 py-0.5 text-[11px] font-mono uppercase tracking-[0.12em] border ${
              source?.origin === 'local_temporary'
                ? 'border-[#CE826D]/60 bg-[#221714] text-[#CE826D]'
                : 'border-white/15 bg-[#181818] text-[#E0E0E0]'
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* File Identity */}
      {source && (
        <section className="space-y-2.5 border-b border-white/10 pb-4">
          <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#9E9E9E] flex items-center gap-1.5">
            <FileBox size={13} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.panel.modelIdentityHeading}</span>
          </h3>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div className="col-span-2">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.panel.fileLabel}
              </dt>
              <dd
                data-testid="model-info-filename"
                className="font-mono text-white break-all"
              >
                {source.fileName}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.panel.formatLabel}
              </dt>
              <dd className="font-mono uppercase text-[#E0E0E0]">
                .{source.format} (glTF 2.0)
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.panel.fileSizeLabel}
              </dt>
              <dd className="font-mono text-[#E0E0E0]">
                {formatByteSize(source.fileSizeBytes)}
              </dd>
            </div>
            {source.versionLabel && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.panel.versionLabel}
                </dt>
                <dd className="text-[#E0E0E0]">{source.versionLabel}</dd>
              </div>
            )}
            {source.authorLabel && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.panel.authorLabel}
                </dt>
                <dd className="text-[#E0E0E0]">{source.authorLabel}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Loaded Geometry & Reliable Dimensions */}
      {status === 'loaded' && telemetry && (
        <>
          <section className="space-y-2.5 border-b border-white/10 pb-4">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#9E9E9E] flex items-center gap-1.5">
              <Layers size={13} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.panel.geometryHeading}</span>
            </h3>
            <dl className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#181818] border border-white/8 p-2.5">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.panel.meshesLabel}
                </dt>
                <dd
                  data-testid="model-telemetry-meshes"
                  className="font-mono text-sm text-white mt-0.5"
                >
                  {telemetry.meshCount}
                </dd>
              </div>
              <div className="bg-[#181818] border border-white/8 p-2.5">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.panel.trianglesLabel}
                </dt>
                <dd
                  data-testid="model-telemetry-triangles"
                  className="font-mono text-sm text-white mt-0.5"
                >
                  {telemetry.triangleCount}
                </dd>
              </div>
              <div className="bg-[#181818] border border-white/8 p-2.5">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.panel.verticesLabel}
                </dt>
                <dd className="font-mono text-sm text-white mt-0.5">
                  {telemetry.vertexCount}
                </dd>
              </div>
              <div className="bg-[#181818] border border-white/8 p-2.5">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.panel.materialsLabel}
                </dt>
                <dd className="font-mono text-sm text-white mt-0.5">
                  {telemetry.materialCount}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-2.5 border-b border-white/10 pb-4">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#9E9E9E] flex items-center gap-1.5">
              <Ruler size={13} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.panel.dimensionsHeading}</span>
            </h3>
            <dl className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#181818] border border-white/8 p-2">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#9E9E9E]">
                  X
                </dt>
                <dd
                  data-testid="model-dimension-width"
                  className="font-mono text-white mt-0.5"
                >
                  {telemetry.dimensions.width} {unitSuffix}
                </dd>
              </div>
              <div className="bg-[#181818] border border-white/8 p-2">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#9E9E9E]">
                  Y
                </dt>
                <dd
                  data-testid="model-dimension-height"
                  className="font-mono text-white mt-0.5"
                >
                  {telemetry.dimensions.height} {unitSuffix}
                </dd>
              </div>
              <div className="bg-[#181818] border border-white/8 p-2">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#9E9E9E]">
                  Z
                </dt>
                <dd
                  data-testid="model-dimension-depth"
                  className="font-mono text-white mt-0.5"
                >
                  {telemetry.dimensions.depth} {unitSuffix}
                </dd>
              </div>
            </dl>
            {telemetry.verifiedScale && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#9E9E9E]">{dict.panel.scaleLabel}:</span>
                <span className="font-mono text-white">{telemetry.verifiedScale}</span>
              </div>
            )}
            <p
              data-testid="model-unit-reliability-note"
              className="text-[11px] text-[#BDBDBD] leading-relaxed"
            >
              {telemetry.verifiedUnit
                ? dict.panel.verifiedUnitNote
                : dict.panel.unverifiedUnitNote}
            </p>
          </section>
        </>
      )}

      {/* Local .glb / .gltf File Inspection Control */}
      <section className="space-y-3 border-b border-white/10 pb-4">
        <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D] flex items-center gap-1.5">
          <FolderOpen size={13} strokeWidth={1.6} aria-hidden="true" />
          <span>{dict.panel.localFileHeading}</span>
        </h3>
        <p className="text-xs text-[#BDBDBD] leading-relaxed">
          {dict.panel.localFileDescription}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onTriggerLocalFilePicker}
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#181818] hover:border-[#A65D4A] border border-white/20 text-white text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FolderOpen size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.panel.selectLocalFileCta}</span>
          </button>

          {isShowingLocalFile && onRestoreDemoModel && (
            <button
              type="button"
              onClick={onRestoreDemoModel}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#141414] hover:border-white/40 border border-white/15 text-[#E0E0E0] text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.panel.restoreDemoModelCta}</span>
            </button>
          )}
        </div>
      </section>

      {/* Honest SketchUp (.skp) Explanation */}
      <section
        data-testid="model-skp-honest-note"
        className="space-y-1.5 bg-[#181818] border border-white/10 p-3.5"
      >
        <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-white flex items-center gap-1.5">
          <Info size={13} strokeWidth={1.6} className="text-[#CE826D]" aria-hidden="true" />
          <span>{dict.panel.skpOriginTitle}</span>
        </h3>
        <p className="text-xs text-[#BDBDBD] leading-relaxed">
          {dict.panel.skpOriginNote}
        </p>
      </section>

      {/* License & Provenance */}
      {source?.licenseNote && (
        <section className="space-y-1 pt-1">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E9E9E] flex items-center gap-1.5">
            <ShieldCheck size={12} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.panel.licenseHeading}</span>
          </h3>
          <p className="text-[11px] text-[#9E9E9E] leading-relaxed">
            {source.licenseNote[language]}
          </p>
        </section>
      )}
    </aside>
  );
}
