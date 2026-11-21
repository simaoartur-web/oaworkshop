import { AlertCircle, X } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { DEPARTMENTS } from '../../data/fixtures';
import type { CanonicalProjectRecord } from '../../data/projectLibraryTypes';
import type {
  CreateTechnicalReferenceInput,
  TechnicalLibraryCategory,
} from '../../data/studioStructureTypes';
import { TECHNICAL_LIBRARY_LIMITS } from '../../data/technicalLibraryRepository';
import type { AppLanguage, DepartmentId } from '../../data/types';
import { useDialogFocusTrap } from '../../design-system/useDialogFocusTrap';
import { pickLocalized } from '../../locales';
import { STUDIO_STRUCTURE_I18N } from './i18n';

interface TechnicalReferenceDialogProps {
  open: boolean;
  projects: readonly CanonicalProjectRecord[];
  defaultDepartmentId?: DepartmentId;
  language: AppLanguage;
  onCreate: (input: CreateTechnicalReferenceInput) => void;
  onClose: () => void;
}

function TechnicalReferenceDialogContent({
  projects,
  defaultDepartmentId = 'architecture',
  language,
  onCreate,
  onClose,
}: Omit<TechnicalReferenceDialogProps, 'open'>) {
  const dict = STUDIO_STRUCTURE_I18N[language];
  const titleId = useId();
  const portalRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const [category, setCategory] = useState<TechnicalLibraryCategory>('material');
  const [code, setCode] = useState('');
  const [titleText, setTitleText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [originText, setOriginText] = useState('');
  const [standardsTag, setStandardsTag] = useState('');
  const [departmentId, setDepartmentId] =
    useState<DepartmentId>(defaultDepartmentId);
  const [relatedProjectId, setRelatedProjectId] = useState<string>('');
  const [citationText, setCitationText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useDialogFocusTrap({
    open: true,
    containerRef: dialogRef,
    portalRef,
    initialFocusRef: titleInputRef,
    onClose,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = titleText.trim();
    const trimmedSummary = summaryText.trim();
    const trimmedSpecs = specsText.trim();
    const trimmedOrigin = originText.trim();
    const trimmedStandards = standardsTag.trim();
    const trimmedCitation = citationText.trim();

    if (!trimmedTitle) {
      setErrorMessage(dict.dialog.validationTitle);
      titleInputRef.current?.focus();
      return;
    }
    if (!trimmedSummary) {
      setErrorMessage(dict.dialog.validationSummary);
      return;
    }
    if (!trimmedSpecs) {
      setErrorMessage(dict.dialog.validationSpecs);
      return;
    }
    if (!trimmedOrigin) {
      setErrorMessage(dict.dialog.validationOrigin);
      return;
    }
    if (!trimmedStandards) {
      setErrorMessage(dict.dialog.validationStandards);
      return;
    }
    if (!trimmedCitation) {
      setErrorMessage(dict.dialog.validationCitation);
      return;
    }

    try {
      onCreate({
        code: code.trim() || undefined,
        category,
        titlePt: trimmedTitle,
        titleEn: trimmedTitle,
        summaryPt: trimmedSummary,
        summaryEn: trimmedSummary,
        technicalSpecsPt: trimmedSpecs,
        technicalSpecsEn: trimmedSpecs,
        originRegionPt: trimmedOrigin,
        originRegionEn: trimmedOrigin,
        standardsTag: trimmedStandards,
        departmentId,
        relatedProjectIds: relatedProjectId ? [relatedProjectId] : [],
        referenceCitationPt: trimmedCitation,
        referenceCitationEn: trimmedCitation,
      });
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : dict.dialog.errorFallback,
      );
    }
  };

  const departmentEntries = Object.values(DEPARTMENTS);

  return createPortal(
    <div
      ref={portalRef}
      data-oa-dialog-portal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-3 sm:px-6 py-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto border border-white/20 bg-[#111111] text-white shadow-2xl focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 bg-[#0A0A0A] oa-hairline-b">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
              {dict.dialog.code}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg sm:text-xl font-light tracking-tight text-white"
            >
              {dict.dialog.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.closeDialog}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 text-[#BDBDBD] hover:text-white hover:border-white/35 transition-colors cursor-pointer shrink-0"
          >
            <X size={17} strokeWidth={1.35} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-5">
          <p className="text-xs text-[#BDBDBD] border-l-2 border-[#A65D4A] bg-[#161616] px-3.5 py-2">
            {dict.dialog.honestNotice}
          </p>

          {errorMessage && (
            <div
              role="alert"
              data-testid="tech-ref-dialog-error"
              className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#F5C2B8]"
            >
              <AlertCircle
                size={16}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-[#E58573] shrink-0 mt-0.5"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="oa-tech-category"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.dialog.fieldCategory}
                </label>
                <select
                  id="oa-tech-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as TechnicalLibraryCategory)
                  }
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  <option value="material" className="bg-[#111111]">
                    {dict.categories.material}
                  </option>
                  <option value="constructive_system" className="bg-[#111111]">
                    {dict.categories.constructive_system}
                  </option>
                  <option value="technical_study" className="bg-[#111111]">
                    {dict.categories.technical_study}
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-tech-code"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.dialog.fieldCode}
                </label>
                <input
                  id="oa-tech-code"
                  type="text"
                  maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_CODE_LENGTH}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={dict.dialog.fieldCodePlaceholder}
                  className="oa-field-input mt-1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="oa-tech-title"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.dialog.fieldTitle}
              </label>
              <input
                ref={titleInputRef}
                id="oa-tech-title"
                type="text"
                required
                maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_TITLE_LENGTH}
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder={dict.dialog.fieldTitlePlaceholder}
                className="oa-field-input mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="oa-tech-summary"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.dialog.fieldSummary}
              </label>
              <textarea
                id="oa-tech-summary"
                rows={2}
                required
                maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_SUMMARY_LENGTH}
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder={dict.dialog.fieldSummaryPlaceholder}
                className="w-full mt-1.5 bg-[#0B0B0B] border border-white/18 px-3 py-2 text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="oa-tech-specs"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.dialog.fieldSpecs}
              </label>
              <textarea
                id="oa-tech-specs"
                rows={2}
                required
                maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_SPECS_LENGTH}
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                placeholder={dict.dialog.fieldSpecsPlaceholder}
                className="w-full mt-1.5 bg-[#0B0B0B] border border-white/18 px-3 py-2 text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="oa-tech-origin"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.dialog.fieldOrigin}
                </label>
                <input
                  id="oa-tech-origin"
                  type="text"
                  required
                  maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH}
                  value={originText}
                  onChange={(e) => setOriginText(e.target.value)}
                  placeholder={dict.dialog.fieldOriginPlaceholder}
                  className="oa-field-input mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-tech-standards"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.dialog.fieldStandards}
                </label>
                <input
                  id="oa-tech-standards"
                  type="text"
                  required
                  maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH}
                  value={standardsTag}
                  onChange={(e) => setStandardsTag(e.target.value)}
                  placeholder={dict.dialog.fieldStandardsPlaceholder}
                  className="oa-field-input mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-tech-department"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.dialog.fieldDepartment}
                </label>
                <select
                  id="oa-tech-department"
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(e.target.value as DepartmentId)
                  }
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  {departmentEntries.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="bg-[#111111]"
                    >
                      {dept.code} · {pickLocalized(dept.name, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-tech-project"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.dialog.fieldRelatedProject}
                </label>
                <select
                  id="oa-tech-project"
                  value={relatedProjectId}
                  onChange={(e) => setRelatedProjectId(e.target.value)}
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  <option value="" className="bg-[#111111]">
                    {dict.dialog.noLinkedProjectOption}
                  </option>
                  {projects.map((proj) => (
                    <option
                      key={proj.identity.id}
                      value={proj.identity.id}
                      className="bg-[#111111]"
                    >
                      {proj.identity.code} ·{' '}
                      {pickLocalized(proj.editorial.title, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="oa-tech-citation"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.dialog.fieldCitation}
              </label>
              <input
                id="oa-tech-citation"
                type="text"
                required
                maxLength={TECHNICAL_LIBRARY_LIMITS.MAX_CITATION_LENGTH}
                value={citationText}
                onChange={(e) => setCitationText(e.target.value)}
                placeholder={dict.dialog.fieldCitationPlaceholder}
                className="oa-field-input mt-1"
              />
            </div>
          </div>

          <div className="pt-4 oa-hairline-t flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 border border-white/18 bg-transparent hover:border-white/40 text-xs font-medium uppercase tracking-[0.16em] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer"
            >
              {dict.common.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors cursor-pointer"
            >
              {dict.dialog.submitCta}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function TechnicalReferenceDialog(props: TechnicalReferenceDialogProps) {
  if (!props.open) {
    return null;
  }
  return (
    <TechnicalReferenceDialogContent
      projects={props.projects}
      defaultDepartmentId={props.defaultDepartmentId}
      language={props.language}
      onCreate={props.onCreate}
      onClose={props.onClose}
    />
  );
}
