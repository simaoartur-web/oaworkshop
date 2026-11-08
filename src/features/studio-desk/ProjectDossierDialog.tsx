import { Check, Clock, X } from 'lucide-react';
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { pickLocalized } from '../../locales';
import type { StudioDeskProject } from '../../data/studioDeskTypes';
import type { AppLanguage } from '../../data/types';
import type { StudioDeskDictionary } from './i18n';
import { useStudioDeskDialogFocusTrap } from './useStudioDeskDialogFocusTrap';

export type StudioDeskDialogState =
  | { type: 'closed' }
  | { type: 'dossier'; project: StudioDeskProject }
  | { type: 'future'; capability: 'viewer' | 'publish' };

interface ProjectDossierDialogProps {
  state: StudioDeskDialogState;
  onClose: () => void;
  language: AppLanguage;
  deskDict: StudioDeskDictionary;
}

export function ProjectDossierDialog({
  state,
  onClose,
  language,
  deskDict,
}: ProjectDossierDialogProps) {
  const titleId = useId();
  const descId = useId();
  const portalRootRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeIconButtonRef = useRef<HTMLButtonElement | null>(null);

  const isOpen = state.type !== 'closed';

  // Isolated focus trap + body scroll lock; ready to swap for Argon A's shared `useDialogFocusTrap`.
  useStudioDeskDialogFocusTrap({
    isOpen,
    dialogRef,
    initialFocusRef: closeIconButtonRef,
    portalRootRef,
    onClose,
  });

  if (state.type === 'closed' || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={portalRootRef}
      data-studio-desk-dialog-portal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-4 py-6 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl border border-white/18 bg-[#111111] p-5 sm:p-8 text-white max-h-[90dvh] overflow-y-auto overscroll-contain focus:outline-none"
      >
        {state.type === 'dossier' ? (
          <>
            <div className="flex items-start justify-between gap-4 pb-4 oa-hairline-b">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#E0E0E0]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 bg-[#A65D4A] mr-2 align-middle"
                  />
                  {state.project.code} · {deskDict.dialog.dossierCode}
                </p>
                <h2
                  id={titleId}
                  className="mt-2 text-xl sm:text-2xl font-light tracking-tight text-white"
                >
                  {pickLocalized(state.project.title, language)}
                </h2>
              </div>

              <button
                ref={closeIconButtonRef}
                type="button"
                onClick={onClose}
                aria-label={deskDict.dialog.closeAria}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 text-[#BDBDBD] hover:text-white hover:border-white/35 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} strokeWidth={1.3} aria-hidden="true" />
              </button>
            </div>

            <div id={descId} className="mt-5 space-y-5">
              <p className="text-sm leading-relaxed text-[#E0E0E0]">
                {pickLocalized(state.project.dossierNotes, language)}
              </p>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 oa-hairline-t oa-hairline-b text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                    {deskDict.featured.disciplineLabel}
                  </dt>
                  <dd className="mt-1 font-medium text-white">
                    {pickLocalized(state.project.discipline, language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                    {deskDict.featured.scaleLabel}
                  </dt>
                  <dd className="mt-1 font-medium text-white tabular-nums">
                    {state.project.scale}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                    {deskDict.featured.areaLabel}
                  </dt>
                  <dd className="mt-1 font-medium text-white tabular-nums">
                    {state.project.areaSqm}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                    {deskDict.featured.datumLabel}
                  </dt>
                  <dd className="mt-1 font-medium text-white tabular-nums">
                    {state.project.elevationDatum}
                  </dd>
                </div>
              </dl>

              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#BDBDBD] mb-3">
                  {deskDict.dialog.deliverablesTitle}
                </h3>
                <ul className="divide-y divide-white/10 border border-white/12 bg-[#0D0D0D]">
                  {state.project.deliverables.map((item) => (
                    <li
                      key={item.id}
                      className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-semibold text-[#E0E0E0] tabular-nums shrink-0">
                          {item.code}
                        </span>
                        <span className="text-white">
                          {pickLocalized(item.label, language)}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 border border-white/16 bg-[#161616] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#E0E0E0] shrink-0">
                        {item.ready ? (
                          <Check
                            size={12}
                            strokeWidth={1.8}
                            className="text-[#E0E0E0]"
                            aria-hidden="true"
                          />
                        ) : (
                          <Clock
                            size={12}
                            strokeWidth={1.6}
                            className="text-[#E58573]"
                            aria-hidden="true"
                          />
                        )}
                        <span>
                          {item.ready
                            ? deskDict.dialog.deliverableReady
                            : deskDict.dialog.deliverablePending}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="border-l-2 border-[#A65D4A] bg-white/[0.03] pl-3.5 py-2.5 text-xs leading-relaxed text-[#BDBDBD]">
                {deskDict.dialog.honestDemoNote}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 pb-4 oa-hairline-b">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#E0E0E0]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 bg-[#A65D4A] mr-2 align-middle"
                  />
                  {deskDict.dialog.futureCode}
                </p>
                <h2
                  id={titleId}
                  className="mt-2 text-xl sm:text-2xl font-light tracking-tight text-white"
                >
                  {state.capability === 'viewer'
                    ? deskDict.dialog.futureViewerTitle
                    : deskDict.dialog.futurePublishTitle}
                </h2>
              </div>

              <button
                ref={closeIconButtonRef}
                type="button"
                onClick={onClose}
                aria-label={deskDict.dialog.closeAria}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 text-[#BDBDBD] hover:text-white hover:border-white/35 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} strokeWidth={1.3} aria-hidden="true" />
              </button>
            </div>

            <div
              id={descId}
              className="mt-5 space-y-3.5 text-sm leading-relaxed text-[#E0E0E0]"
            >
              <p>
                {state.capability === 'viewer'
                  ? deskDict.dialog.futureViewerBody
                  : deskDict.dialog.futurePublishBody}
              </p>
              <p className="border-l-2 border-[#A65D4A] bg-white/[0.03] pl-3.5 py-2.5 text-[#BDBDBD]">
                {state.capability === 'viewer'
                  ? deskDict.dialog.futureViewerNote
                  : deskDict.dialog.futurePublishNote}
              </p>
            </div>
          </>
        )}

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors cursor-pointer"
          >
            {deskDict.dialog.closeButton}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
