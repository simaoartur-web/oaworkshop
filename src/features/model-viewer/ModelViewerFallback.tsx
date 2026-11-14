import {
  AlertTriangle,
  Box,
  Cpu,
  FileWarning,
  FolderOpen,
  HardDrive,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type {
  AppLanguage,
} from '../../data/types';
import type {
  ModelViewerErrorDetail,
  ModelViewerProjectContext,
  ModelViewerStatus,
} from './contracts';
import { getModelViewerDictionary } from './i18n';

export interface ModelViewerFallbackProps {
  status: Exclude<ModelViewerStatus, 'loaded'>;
  language?: AppLanguage;
  errorDetail?: ModelViewerErrorDetail | null;
  project?: ModelViewerProjectContext;
  onRestoreDemoModel?: () => void;
  onTriggerLocalFilePicker?: () => void;
  onBackToDossier?: () => void;
}

export function ModelViewerFallback({
  status,
  language = 'pt',
  errorDetail,
  project,
  onRestoreDemoModel,
  onTriggerLocalFilePicker,
  onBackToDossier,
}: ModelViewerFallbackProps) {
  const dict = getModelViewerDictionary(language);
  const isError =
    status === 'error_format' ||
    status === 'error_invalid' ||
    status === 'error_too_large' ||
    status === 'webgl_unavailable';

  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="model-viewer-loading-state"
        className="w-full h-full min-h-[360px] bg-[#050505] border border-white/10 flex flex-col items-center justify-center p-6 sm:p-10 text-center"
      >
        <div className="w-12 h-12 border border-[#A65D4A]/60 bg-[#111111] flex items-center justify-center mb-5 text-[#CE826D]">
          <Loader2
            size={22}
            strokeWidth={1.5}
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#CE826D] mb-2">
          {dict.header.eyebrow}
        </p>
        <h2 className="text-lg sm:text-xl font-light text-white mb-2">
          {dict.states.loadingTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-md leading-relaxed">
          {dict.states.loadingBody}
        </p>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="model-viewer-empty-state"
        className="w-full h-full min-h-[360px] bg-[#050505] border border-white/10 flex flex-col items-center justify-center p-6 sm:p-10 text-center"
      >
        <div className="w-12 h-12 border border-white/15 bg-[#111111] flex items-center justify-center mb-5 text-[#E0E0E0]">
          <Box size={22} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9E9E9E] mb-2">
          {project ? `${project.code} · ${project.title[language]}` : dict.header.eyebrow}
        </p>
        <h2 className="text-lg sm:text-xl font-light text-white mb-2">
          {dict.states.emptyTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#E0E0E0] max-w-lg leading-relaxed mb-3">
          {dict.states.emptyBody}
        </p>
        <p className="text-xs text-[#BDBDBD] max-w-md mb-6">
          {dict.states.emptyNextAction}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onRestoreDemoModel && (
            <button
              type="button"
              onClick={onRestoreDemoModel}
              className="min-h-[44px] px-4 py-2.5 bg-[#A65D4A] hover:bg-[#B86B57] text-white text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Box size={15} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.states.loadDemoAction}</span>
            </button>
          )}
          {onTriggerLocalFilePicker && (
            <button
              type="button"
              onClick={onTriggerLocalFilePicker}
              className="min-h-[44px] px-4 py-2.5 bg-[#141414] hover:border-[#A65D4A] border border-white/20 text-white text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FolderOpen size={15} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.panel.selectLocalFileCta}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const titleText =
    errorDetail?.title[language] ??
    (status === 'error_format'
      ? dict.states.errorFormatTitle
      : status === 'error_too_large'
        ? dict.states.errorTooLargeTitle
        : status === 'webgl_unavailable'
          ? dict.states.webglUnavailableTitle
          : dict.states.errorInvalidTitle);

  const bodyText =
    errorDetail?.message[language] ??
    (status === 'error_format'
      ? dict.states.errorFormatGenericBody
      : status === 'error_too_large'
        ? dict.states.errorTooLargeBody
        : status === 'webgl_unavailable'
          ? dict.states.webglUnavailableBody
          : dict.states.errorInvalidBody);

  const nextActionText =
    errorDetail?.nextAction[language] ??
    (status === 'error_format'
      ? dict.states.errorFormatNextAction
      : status === 'error_too_large'
        ? dict.states.errorTooLargeNextAction
        : status === 'webgl_unavailable'
          ? dict.states.webglUnavailableNextAction
          : dict.states.errorInvalidNextAction);

  const StatusIcon =
    status === 'webgl_unavailable'
      ? Cpu
      : status === 'error_too_large'
        ? HardDrive
        : status === 'error_format'
          ? FileWarning
          : AlertTriangle;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live="assertive"
      data-testid={`model-viewer-fallback-${status}`}
      className="w-full h-full min-h-[360px] bg-[#050505] border border-[#E07A68]/45 flex flex-col items-center justify-center p-6 sm:p-10 text-center"
    >
      <div className="w-12 h-12 border border-[#E07A68]/60 bg-[#181210] flex items-center justify-center mb-5 text-[#E07A68]">
        <StatusIcon size={22} strokeWidth={1.6} aria-hidden="true" />
      </div>

      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E07A68] mb-2">
        {errorDetail?.fileName ? `${status.toUpperCase()} · ${errorDetail.fileName}` : status.toUpperCase()}
      </p>

      <h2 className="text-lg sm:text-xl font-light text-white max-w-xl mb-3">
        {titleText}
      </h2>

      <p className="text-xs sm:text-sm text-[#E0E0E0] max-w-xl leading-relaxed mb-4">
        {bodyText}
      </p>

      <div className="max-w-xl w-full bg-[#111111] border border-white/10 px-4 py-3 mb-6 text-left">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D] mb-1">
          {language === 'en' ? 'RECOMMENDED NEXT STEP' : 'PRÓXIMO PASSO RECOMENDADO'}
        </p>
        <p className="text-xs text-[#E0E0E0] leading-relaxed">{nextActionText}</p>
        {project && status === 'webgl_unavailable' && (
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                {language === 'en' ? 'Project' : 'Projecto'}
              </span>
              <span className="font-mono text-white">{project.code}</span>
            </div>
            {project.scale && (
              <div>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                  {language === 'en' ? 'Scale' : 'Escala'}
                </span>
                <span className="font-mono text-white">{project.scale}</span>
              </div>
            )}
            {project.areaSqm && (
              <div>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                  {language === 'en' ? 'Area' : 'Área'}
                </span>
                <span className="font-mono text-white">{project.areaSqm}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRestoreDemoModel && (
          <button
            type="button"
            onClick={onRestoreDemoModel}
            className="min-h-[44px] px-4 py-2.5 bg-[#A65D4A] hover:bg-[#B86B57] text-white text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.states.retryAction}</span>
          </button>
        )}
        {onTriggerLocalFilePicker && status !== 'webgl_unavailable' && (
          <button
            type="button"
            onClick={onTriggerLocalFilePicker}
            className="min-h-[44px] px-4 py-2.5 bg-[#141414] hover:border-[#A65D4A] border border-white/20 text-white text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FolderOpen size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.panel.selectLocalFileCta}</span>
          </button>
        )}
        {onBackToDossier && (
          <button
            type="button"
            onClick={onBackToDossier}
            className="min-h-[44px] px-4 py-2.5 bg-[#111111] hover:border-white/40 border border-white/15 text-[#E0E0E0] text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{dict.header.backToDossier}</span>
          </button>
        )}
      </div>
    </div>
  );
}
