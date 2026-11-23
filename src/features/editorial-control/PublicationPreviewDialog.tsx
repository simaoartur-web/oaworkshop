import { Eye, Lock, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PublicationQueueItem } from '../../data/editorialReportsTypes';
import type { AppLanguage } from '../../data/types';
import { useDialogFocusTrap } from '../../design-system/useDialogFocusTrap';
import { pickLocalized } from '../../locales';
import { EDITORIAL_CONTROL_I18N } from './i18n';

interface PublicationPreviewDialogProps {
  open: boolean;
  item: PublicationQueueItem | null;
  initialLanguage: AppLanguage;
  onClose: () => void;
}

function PublicationPreviewDialogContent({
  item,
  initialLanguage,
  onClose,
}: {
  item: PublicationQueueItem;
  initialLanguage: AppLanguage;
  onClose: () => void;
}) {
  const [previewLang, setPreviewLang] = useState<AppLanguage>(initialLanguage);
  const dict = EDITORIAL_CONTROL_I18N[previewLang];
  const titleId = useId();
  const portalRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusTrap({
    open: true,
    containerRef: dialogRef,
    portalRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  const { canonicalRecord, project, publicationStatus } = item;

  return createPortal(
    <div
      ref={portalRef}
      data-oa-dialog-portal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-3 sm:px-6 py-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-testid="publication-preview-dialog"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl max-h-[90dvh] overflow-y-auto border border-white/20 bg-[#0B0B0B] text-white shadow-2xl focus:outline-none"
      >
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-[#050505] oa-hairline-b">
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D] inline-flex items-center gap-1.5">
              <Eye size={13} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.preview.code}</span>
            </p>
            <h2 id={titleId} className="text-base sm:text-lg font-light text-white">
              {dict.preview.title} · {canonicalRecord.identity.code}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label={dict.preview.langToggleAria}
              className="inline-flex border border-white/16 bg-[#141414]"
            >
              <button
                type="button"
                onClick={() => setPreviewLang('pt')}
                aria-pressed={previewLang === 'pt'}
                className={`min-h-[40px] px-3 text-xs font-mono uppercase tracking-[0.14em] cursor-pointer ${
                  previewLang === 'pt'
                    ? 'bg-[#A65D4A] text-white font-semibold'
                    : 'text-[#BDBDBD] hover:text-white'
                }`}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                aria-pressed={previewLang === 'en'}
                className={`min-h-[40px] px-3 text-xs font-mono uppercase tracking-[0.14em] border-l border-white/14 cursor-pointer ${
                  previewLang === 'en'
                    ? 'bg-[#A65D4A] text-white font-semibold'
                    : 'text-[#BDBDBD] hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={dict.common.closeDialog}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 text-[#BDBDBD] hover:text-white hover:border-white/40 transition-colors cursor-pointer"
            >
              <X size={17} strokeWidth={1.35} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mandatory Honest Boundary Notice */}
        <div
          role="note"
          className="px-5 sm:px-6 py-3 bg-[#16110F] oa-hairline-b text-xs text-[#F5C2B8] leading-relaxed"
        >
          {dict.preview.warningBanner}
        </div>

        {/* Simulated O+A Portfolio Sheet */}
        <div className="p-5 sm:p-7 space-y-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#050505] border border-white/12">
            <img
              src={project.imageSrc}
              alt={pickLocalized(project.imageAlt, previewLang)}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
              <span className="bg-[#050505]/90 border border-[#A65D4A] px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] text-white">
                {dict.common.localPreviewBadge}
              </span>
              <span className="bg-[#050505]/90 border border-white/18 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] text-[#E0E0E0] inline-flex items-center gap-1">
                {publicationStatus === 'private' && (
                  <Lock size={11} strokeWidth={1.6} aria-hidden="true" />
                )}
                <span>{dict.publicationStatuses[publicationStatus]}</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
              {canonicalRecord.identity.code} ·{' '}
              {pickLocalized(canonicalRecord.classification.discipline, previewLang)}
            </p>
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              {pickLocalized(canonicalRecord.editorial.title, previewLang)}
            </h3>
            <p className="text-sm sm:text-base text-[#CCCCCC] leading-relaxed">
              {pickLocalized(canonicalRecord.editorial.subtitle, previewLang)}
            </p>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 oa-hairline-t oa-hairline-b text-xs">
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
                {dict.preview.studioBaseLabel}
              </dt>
              <dd className="mt-1 text-sm text-white">
                {canonicalRecord.location.studioBase}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
                {dict.preview.scaleLabel}
              </dt>
              <dd className="mt-1 text-sm font-mono text-white">
                {canonicalRecord.classification.scale}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
                {dict.preview.areaLabel}
              </dt>
              <dd className="mt-1 text-sm font-mono text-white">
                {canonicalRecord.classification.areaSqm}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
                {dict.preview.datumLabel}
              </dt>
              <dd className="mt-1 text-sm font-mono text-white">
                {canonicalRecord.classification.elevationDatum}
              </dd>
            </div>
          </dl>

          <blockquote className="border-l-2 border-[#A65D4A] pl-4 py-1 space-y-1.5">
            <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
              {dict.preview.editorialNoteLabel}
            </p>
            <p className="font-serif italic text-base sm:text-lg leading-relaxed text-[#F5F5F5]">
              “{pickLocalized(canonicalRecord.editorial.dossierNotes, previewLang)}”
            </p>
          </blockquote>

          {publicationStatus === 'private' && (
            <p className="text-xs text-[#BDBDBD] border border-white/14 bg-[#141414] px-3.5 py-2.5">
              {dict.preview.privateNotice}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function PublicationPreviewDialog({
  open,
  item,
  initialLanguage,
  onClose,
}: PublicationPreviewDialogProps) {
  if (!open || !item) {
    return null;
  }
  return (
    <PublicationPreviewDialogContent
      key={`${item.canonicalRecord.identity.id}:${initialLanguage}`}
      item={item}
      initialLanguage={initialLanguage}
      onClose={onClose}
    />
  );
}
