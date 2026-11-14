import {
  AlertTriangle,
  Box,
  CheckCircle2,
  FileUp,
  Info,
  Layers,
  Trash2,
} from 'lucide-react';
import { useRef } from 'react';
import { pickLocalized } from '../../locales';
import { MODEL_ENGINE_I18N } from './i18n';
import type { ModelViewerIntegrationProps } from './modelViewerContract';

export function ModelEngineStageSlot({
  source,
  context,
  loadState,
  errorMessage,
  resolution,
  callbacks,
}: ModelViewerIntegrationProps) {
  const dict = MODEL_ENGINE_I18N[context.language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section
      aria-label={dict.stage.slotEyebrow}
      data-oa-model-stage-slot="true"
      data-oa-model-load-state={loadState}
      data-oa-model-origin={resolution.origin}
      className="border border-white/16 bg-[#0E0E0E] p-5 sm:p-7 space-y-6"
    >
      {/* Top Bar: Eyebrow + Load State Badge */}
      <div className="pb-4 oa-hairline-b flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D]">
            {dict.stage.slotEyebrow}
          </p>
          <h2 className="text-lg sm:text-xl font-light text-white">
            {source ? dict.stage.slotReadyHeading : dict.stage.slotEmptyHeading}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="model-engine-load-state-badge"
            className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] border ${
              loadState === 'ready'
                ? 'border-[#A65D4A] bg-[#A65D4A]/18 text-white'
                : loadState === 'error'
                  ? 'border-[#E58573] bg-[#24110E] text-[#F5C2B8]'
                  : 'border-white/18 bg-[#161616] text-[#D8D8D8]'
            }`}
          >
            {dict.stage.loadStates[loadState]}
          </span>

          <span className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] border border-white/16 bg-[#141414] text-[#D8D8D8]">
            {dict.stage.availability[resolution.availabilityStatus]}
          </span>
        </div>
      </div>

      {/* Validation or Viewer Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          data-testid="model-engine-error-alert"
          className="border border-[#A65D4A] bg-[#21100E] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#F5C2B8]"
        >
          <AlertTriangle
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className="text-[#E58573] shrink-0 mt-0.5"
          />
          <div className="space-y-1 flex-1">
            <p className="font-medium text-white">
              {dict.stage.slotErrorHeading}
            </p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Mandatory Fictive Demonstrative Study Disclaimer when origin === 'demo-asset' */}
      {source && source.origin === 'demo-asset' && source.fictiveDisclaimer && (
        <div
          role="note"
          data-testid="model-engine-fictive-study-notice"
          className="border-l-2 border-[#A65D4A] border border-white/14 bg-[#141211] p-4 flex items-start gap-3 text-xs sm:text-sm"
        >
          <Info
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className="text-[#CE826D] shrink-0 mt-0.5"
          />
          <div className="space-y-1">
            <p className="font-medium text-white uppercase tracking-[0.12em] text-xs">
              {dict.fictiveStudyBadge}
            </p>
            <p className="text-[#D8D8D8] leading-relaxed">
              {pickLocalized(source.fictiveDisclaimer, context.language)}
            </p>
          </div>
        </div>
      )}

      {/* Temporary Session File Notice when origin === 'session-file' */}
      {source && source.origin === 'session-file' && (
        <div
          role="status"
          data-testid="model-engine-session-file-notice"
          className="border-l-2 border-[#A65D4A] border border-white/14 bg-[#121614] p-4 flex items-start gap-3 text-xs sm:text-sm"
        >
          <CheckCircle2
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className="text-[#CE826D] shrink-0 mt-0.5"
          />
          <div className="space-y-1">
            <p className="font-medium text-white uppercase tracking-[0.12em] text-xs">
              {dict.sessionModelBadge}
            </p>
            <p className="text-[#D8D8D8] leading-relaxed">
              {pickLocalized(resolution.statusMessage, context.language)}
            </p>
          </div>
        </div>
      )}

      {/* Main Chamber Body: Ready Source Telemetry vs Honest Empty State */}
      {source ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-[#141414] border border-white/12 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.stage.originLabel}
              </p>
              <p className="mt-1.5 text-white font-medium">
                {dict.stage.origins[source.origin]}
              </p>
            </div>

            <div className="bg-[#141414] border border-white/12 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.stage.fileLabel}
              </p>
              <p className="mt-1.5 text-white font-mono text-xs break-all">
                {source.fileName}
              </p>
            </div>

            <div className="bg-[#141414] border border-white/12 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.stage.formatLabel}
              </p>
              <p className="mt-1.5 text-[#CE826D] font-mono uppercase text-xs">
                .{source.format} · {source.sizeLabel}
                {source.scale ? ` · ${source.scale}` : ''}
              </p>
            </div>

            <div className="bg-[#141414] border border-white/12 p-4 md:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.stage.uriLabel}
              </p>
              <p
                data-testid="model-engine-resolved-uri"
                className="mt-1.5 text-[#D8D8D8] font-mono text-xs break-all"
              >
                {source.url}
              </p>
            </div>

            <div className="bg-[#141414] border border-white/12 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.stage.privacyLabel}
              </p>
              <p className="mt-1.5 text-white text-xs">
                {context.publicationStatus === 'private'
                  ? dict.privateBadge
                  : context.publicationStatus}
              </p>
            </div>
          </div>

          {/* Architectural Orthographic Framing Plate (Replaced by Agent B Canvas on Integration) */}
          <div className="border border-white/14 bg-[#090909] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 border border-[#A65D4A]/60 bg-[#171210] flex items-center justify-center text-[#CE826D]">
                <Box size={22} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#CE826D]">
                  {context.projectCode} · {context.scale} · {context.elevationDatum}
                </p>
                <p className="text-base sm:text-lg font-light text-white">
                  {pickLocalized(context.projectTitle, context.language)}
                </p>
                <p className="text-xs text-[#BDBDBD] max-w-2xl leading-relaxed">
                  {dict.stage.contractNotice}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  callbacks.onModelLoaded({
                    triangleCount: 1240,
                    meshCount: 4,
                    loadDurationMs: 42,
                  })
                }
                className="min-h-[40px] px-3.5 py-2 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.13em] text-white cursor-pointer"
              >
                {dict.stage.simulateReadyCta}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          data-testid="model-engine-empty-state"
          className="border border-dashed border-white/20 bg-[#121212] p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-start gap-3.5">
            <Layers
              size={20}
              strokeWidth={1.4}
              aria-hidden="true"
              className="text-[#CE826D] shrink-0 mt-0.5"
            />
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium text-white">
                {dict.stage.slotEmptyHeading}
              </p>
              <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
                {pickLocalized(resolution.statusMessage, context.language)}
              </p>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                {dict.stage.slotEmptyBody}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar: Select Local .glb/.gltf, Clear Session File, Back to Dossier */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            aria-label={dict.controls.fileInputAriaLabel}
            data-testid="model-engine-file-input"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              if (chosen) {
                void callbacks.onSelectLocalFile(chosen);
              }
              event.target.value = '';
            }}
            className="sr-only"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 py-2.5 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#914E3D] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileUp size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>
              {resolution.sessionModel
                ? dict.controls.replaceLocalFileCta
                : dict.controls.selectLocalFileCta}
            </span>
          </button>

          {resolution.sessionModel && (
            <button
              type="button"
              onClick={callbacks.onClearLocalFile}
              className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#151515] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-[#E6E6E6] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>{dict.controls.clearSessionFileCta}</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-[#9E9E9E]">
          {dict.controls.supportedFormatsHint}
        </p>
      </div>
    </section>
  );
}
