import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import type { DepartmentId } from '../../data/types';
import { useDialogFocusTrap } from '../../design-system/useDialogFocusTrap';
import type {
  ProjectCreationDraftPayload,
  ProjectCreationWizardDraft,
  ProjectCreationWizardProps,
  WizardInitialPhaseChoice,
  WizardStepErrors,
} from './contracts';
import { pickText, suggestNextProjectCode } from './helpers';
import { getProjectExperienceDictionary } from './i18n';

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LIST: readonly WizardStep[] = [1, 2, 3, 4];
const PHASE_CHOICES: readonly WizardInitialPhaseChoice[] = [
  'concept',
  'design',
  'in_progress',
];
const CUSTOM_DISCIPLINE_KEY = '__custom__';

const ASSIGNABLE_DEPARTMENTS: readonly DepartmentId[] = [
  'architecture',
  'urbanism',
  'interiors',
  'research',
  'project_management',
  'communications',
  'direction',
];

function buildInitialState(
  collaborators: ProjectCreationWizardProps['collaborators'],
  initialDraft?: Partial<ProjectCreationWizardDraft>,
): ProjectCreationWizardDraft {
  const defaultLead = collaborators?.[1] ?? collaborators?.[0] ?? DEMO_USERS[0];
  return {
    titlePt: initialDraft?.titlePt ?? '',
    titleEn: initialDraft?.titleEn ?? '',
    summaryPt: initialDraft?.summaryPt ?? '',
    summaryEn: initialDraft?.summaryEn ?? '',
    discipline: initialDraft?.discipline ?? '',
    departmentId:
      initialDraft?.departmentId ?? defaultLead?.departmentId ?? 'architecture',
    leadUserId: initialDraft?.leadUserId ?? defaultLead?.id ?? 'usr-arq-02',
    studioBase:
      initialDraft?.studioBase ?? defaultLead?.studioBase ?? 'Maputo',
    contributorUserIds:
      initialDraft?.contributorUserIds ??
      (defaultLead ? [defaultLead.id] : []),
    initialPhaseChoice: initialDraft?.initialPhaseChoice ?? 'concept',
    nextMilestoneTitle: initialDraft?.nextMilestoneTitle ?? '',
    nextMilestoneDateIso: initialDraft?.nextMilestoneDateIso ?? '2026-11-24',
  };
}

export function ProjectCreationWizard({
  language = 'pt',
  collaborators = DEMO_USERS,
  departments = DEPARTMENTS,
  existingProjectCodes = [],
  initialDraft,
  onSubmitProject,
  onCancel,
  onBackToCatalog,
  onDirtyChange,
  className = '',
}: ProjectCreationWizardProps) {
  const dict = getProjectExperienceDictionary(language);
  const baselineDraft = useMemo(
    () => buildInitialState(collaborators, initialDraft),
    [collaborators, initialDraft],
  );

  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<ProjectCreationWizardDraft>(baselineDraft);
  const [customDisciplineMode, setCustomDisciplineMode] = useState(false);
  const [errors, setErrors] = useState<WizardStepErrors>({});
  const [submittedPayload, setSubmittedPayload] =
    useState<ProjectCreationDraftPayload | null>(null);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  // Refs for focus management on validation failure
  const titlePtRef = useRef<HTMLInputElement | null>(null);
  const titleEnRef = useRef<HTMLInputElement | null>(null);
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);
  const disciplineRef = useRef<HTMLSelectElement | null>(null);
  const customDisciplineRef = useRef<HTMLInputElement | null>(null);
  const departmentRef = useRef<HTMLSelectElement | null>(null);
  const leadRef = useRef<HTMLSelectElement | null>(null);
  const milestoneTitleRef = useRef<HTMLInputElement | null>(null);
  const milestoneDateRef = useRef<HTMLInputElement | null>(null);

  // Leave confirmation modal refs & WCAG 2.2 AA focus trap
  const leavePortalRef = useRef<HTMLDivElement | null>(null);
  const leaveDialogRef = useRef<HTMLDivElement | null>(null);
  const keepEditingButtonRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusTrap({
    open: isLeaveConfirmOpen,
    containerRef: leaveDialogRef,
    portalRef: leavePortalRef,
    initialFocusRef: keepEditingButtonRef,
    onClose: () => setIsLeaveConfirmOpen(false),
  });

  const isDirty = useMemo(() => {
    if (submittedPayload) {
      return false;
    }
    return (
      draft.titlePt !== baselineDraft.titlePt ||
      draft.titleEn !== baselineDraft.titleEn ||
      draft.summaryPt !== baselineDraft.summaryPt ||
      draft.summaryEn !== baselineDraft.summaryEn ||
      draft.discipline !== baselineDraft.discipline ||
      draft.departmentId !== baselineDraft.departmentId ||
      draft.leadUserId !== baselineDraft.leadUserId ||
      draft.studioBase !== baselineDraft.studioBase ||
      draft.initialPhaseChoice !== baselineDraft.initialPhaseChoice ||
      draft.nextMilestoneTitle !== baselineDraft.nextMilestoneTitle ||
      draft.nextMilestoneDateIso !== baselineDraft.nextMilestoneDateIso ||
      draft.contributorUserIds.join(',') !==
        baselineDraft.contributorUserIds.join(',')
    );
  }, [draft, baselineDraft, submittedPayload]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const suggestedCode = useMemo(
    () => suggestNextProjectCode(existingProjectCodes),
    [existingProjectCodes],
  );

  const selectedLeadUser = useMemo(
    () =>
      collaborators.find((u) => u.id === draft.leadUserId) ?? collaborators[0],
    [collaborators, draft.leadUserId],
  );

  const selectedDisciplineObj = useMemo(() => {
    const matched = dict.wizard.disciplineOptions.find(
      (opt) => opt.pt === draft.discipline || opt.en === draft.discipline,
    );
    if (matched) {
      return matched;
    }
    const clean = draft.discipline.trim();
    return { pt: clean, en: clean };
  }, [dict.wizard.disciplineOptions, draft.discipline]);

  const validateStep = (targetStep: WizardStep): WizardStepErrors => {
    const nextErrors: WizardStepErrors = {};

    if (targetStep === 1) {
      if (draft.titlePt.trim().length < 3) {
        nextErrors.titlePt = dict.wizard.errors.titlePt;
      }
      if (draft.titleEn.trim().length < 3) {
        nextErrors.titleEn = dict.wizard.errors.titleEn;
      }
      if (draft.summaryPt.trim().length < 10) {
        nextErrors.summary = dict.wizard.errors.summary;
      }
      if (!draft.discipline.trim()) {
        nextErrors.discipline = dict.wizard.errors.discipline;
      }
    }

    if (targetStep === 2) {
      if (!draft.departmentId) {
        nextErrors.departmentId = dict.wizard.errors.department;
      }
      if (!draft.leadUserId) {
        nextErrors.leadUserId = dict.wizard.errors.leadUser;
      }
    }

    if (targetStep === 3) {
      if (draft.nextMilestoneTitle.trim().length < 4) {
        nextErrors.nextMilestoneTitle = dict.wizard.errors.nextMilestone;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.nextMilestoneDateIso.trim())) {
        nextErrors.nextMilestoneDateIso = dict.wizard.errors.nextMilestoneDate;
      }
    }

    return nextErrors;
  };

  const focusFirstError = (stepErrors: WizardStepErrors) => {
    if (stepErrors.titlePt) {
      titlePtRef.current?.focus();
    } else if (stepErrors.titleEn) {
      titleEnRef.current?.focus();
    } else if (stepErrors.summary) {
      summaryRef.current?.focus();
    } else if (stepErrors.discipline) {
      if (customDisciplineMode) {
        customDisciplineRef.current?.focus();
      } else {
        disciplineRef.current?.focus();
      }
    } else if (stepErrors.departmentId) {
      departmentRef.current?.focus();
    } else if (stepErrors.leadUserId) {
      leadRef.current?.focus();
    } else if (stepErrors.nextMilestoneTitle) {
      milestoneTitleRef.current?.focus();
    } else if (stepErrors.nextMilestoneDateIso) {
      milestoneDateRef.current?.focus();
    }
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      focusFirstError(stepErrors);
      return;
    }

    setErrors({});
    if (step < 4) {
      setStep((s) => (s + 1) as WizardStep);
    }
  };

  const handlePreviousStep = () => {
    setErrors({});
    if (step > 1) {
      setStep((s) => (s - 1) as WizardStep);
    }
  };

  const handleAttemptExit = () => {
    if (isDirty) {
      setIsLeaveConfirmOpen(true);
      return;
    }
    onCancel();
  };

  const handleConfirmDiscard = () => {
    setIsLeaveConfirmOpen(false);
    onCancel();
  };

  const handleToggleContributor = (userId: string) => {
    if (userId === draft.leadUserId) {
      return;
    }
    setDraft((prev) => {
      const exists = prev.contributorUserIds.includes(userId);
      return {
        ...prev,
        contributorUserIds: exists
          ? prev.contributorUserIds.filter((id) => id !== userId)
          : [...prev.contributorUserIds, userId],
      };
    });
  };

  const handleLeadChange = (nextLeadId: string) => {
    const foundLead = collaborators.find((u) => u.id === nextLeadId);
    setDraft((prev) => {
      const mergedContributors = Array.from(
        new Set([...prev.contributorUserIds, nextLeadId]),
      );
      return {
        ...prev,
        leadUserId: nextLeadId,
        studioBase: foundLead?.studioBase ?? prev.studioBase,
        contributorUserIds: mergedContributors,
      };
    });
    if (errors.leadUserId) {
      setErrors((prev) => ({ ...prev, leadUserId: undefined }));
    }
  };

  const handleFinalSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step !== 4) {
      handleNextStep();
      return;
    }

    const phaseMeta = dict.wizard.phaseChoices[draft.initialPhaseChoice];
    const normalizedSummaryEn =
      draft.summaryEn.trim() || draft.summaryPt.trim();
    const milestoneText = draft.nextMilestoneTitle.trim();
    const uniqueContributors = Array.from(
      new Set([draft.leadUserId, ...draft.contributorUserIds]),
    );

    const payload: ProjectCreationDraftPayload = {
      code: suggestedCode,
      title: {
        pt: draft.titlePt.trim(),
        en: draft.titleEn.trim(),
      },
      subtitle: {
        pt: draft.summaryPt.trim(),
        en: normalizedSummaryEn,
      },
      discipline: selectedDisciplineObj,
      departmentId: draft.departmentId,
      studioBase: draft.studioBase,
      leadUserId: selectedLeadUser?.id ?? draft.leadUserId,
      leadAuthorCode: selectedLeadUser?.code ?? 'ARQ-02',
      leadAuthorName: selectedLeadUser
        ? selectedLeadUser.name.replace(/\s*\(Demo\)$/i, '')
        : 'Mateo Conti',
      contributorUserIds: uniqueContributors,
      projectStatus: draft.initialPhaseChoice,
      phase: {
        pt: phaseMeta.label,
        en: phaseMeta.label,
      },
      nextMilestoneTitle: {
        pt: milestoneText,
        en: milestoneText,
      },
      nextMilestoneDateIso: draft.nextMilestoneDateIso,
      publicationStatus: 'private',
    };

    await onSubmitProject(payload);
    setSubmittedPayload(payload);
  };

  const handleCreateAnother = () => {
    setSubmittedPayload(null);
    setDraft(baselineDraft);
    setCustomDisciplineMode(false);
    setErrors({});
    setStep(1);
  };

  const errorList = Object.values(errors).filter(Boolean) as string[];
  const progressPercent = (step / STEP_LIST.length) * 100;

  if (submittedPayload) {
    return (
      <section
        aria-labelledby="wizard-success-heading"
        className={`w-full max-w-[920px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-6 ${className}`}
      >
        <div className="bg-[#141414] border border-[#A65D4A]/65 p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={22}
              strokeWidth={1.6}
              aria-hidden="true"
              className="text-[#CE826D] shrink-0 mt-0.5"
            />
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#CE826D]">
                {dict.wizard.success.eyebrow}
              </p>
              <h1
                id="wizard-success-heading"
                className="text-2xl sm:text-3xl font-light text-white"
              >
                {dict.wizard.success.title}
              </h1>
              <p className="text-sm text-[#D8D8D8] leading-relaxed">
                {dict.wizard.success.body}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/12 py-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.wizard.success.codeLabel}
              </dt>
              <dd className="mt-1 font-semibold text-white tabular-nums">
                {submittedPayload.code}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.gallery.visibilityLabel}
              </dt>
              <dd className="mt-1 text-white inline-flex items-center gap-1.5">
                <Lock size={13} aria-hidden="true" className="text-[#CE826D]" />
                <span>{dict.wizard.success.visibilityValue}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                {dict.gallery.leadLabel}
              </dt>
              <dd className="mt-1 text-[#E0E0E0]">
                {submittedPayload.leadAuthorName}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToCatalog ?? onCancel}
              className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.15em] text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>{dict.wizard.success.backToCatalog}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateAnother}
              className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#101010] hover:border-white/40 text-xs font-medium uppercase tracking-[0.15em] text-[#E0E0E0] hover:text-white cursor-pointer"
            >
              {dict.wizard.success.createAnother}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="project-wizard-heading"
      className={`w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 ${className}`}
    >
      {/* Top Bar */}
      <header className="pb-5 oa-hairline-b flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#CE826D]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 bg-[#A65D4A] inline-block shrink-0"
            />
            <span>{dict.wizard.eyebrow}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="text-white tabular-nums">
              {dict.wizard.stepCounterPrefix} {step} {dict.wizard.stepOf}{' '}
              {STEP_LIST.length}
            </span>
          </div>

          <h1
            id="project-wizard-heading"
            className="text-2xl sm:text-3xl font-light tracking-tight text-white"
          >
            {dict.wizard.title}
          </h1>

          <p className="text-sm text-[#CCCCCC] max-w-2xl leading-relaxed">
            {dict.wizard.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAttemptExit}
          className="min-h-[44px] px-3.5 py-2 border border-white/16 bg-[#141414] hover:border-white/35 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-2 self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />
          <span>{dict.common.backToProjects}</span>
        </button>
      </header>

      {/* Progress Stepper */}
      <div className="space-y-2.5">
        <div
          aria-hidden="true"
          className="h-[2px] w-full bg-white/10 overflow-hidden"
        >
          <div
            className="h-full bg-[#A65D4A] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STEP_LIST.map((num) => {
            const isCurrent = step === num;
            const isDone = step > num;
            const canJumpBack = num < step;
            return (
              <li key={num}>
                <button
                  type="button"
                  disabled={!canJumpBack}
                  onClick={() => {
                    if (canJumpBack) {
                      setErrors({});
                      setStep(num);
                    }
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`w-full min-h-[44px] px-3 py-2 border text-left flex items-center gap-2 text-xs transition-colors ${
                    isCurrent
                      ? 'border-[#A65D4A] bg-[#A65D4A]/18 text-white font-medium'
                      : isDone
                        ? 'border-white/24 bg-[#141414] text-[#E0E0E0] hover:border-[#A65D4A]/70 cursor-pointer'
                        : 'border-white/10 bg-[#101010] text-[#9E9E9E] cursor-default'
                  }`}
                >
                  <span
                    className={`h-5 w-5 shrink-0 inline-flex items-center justify-center text-[11px] border tabular-nums ${
                      isCurrent
                        ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                        : isDone
                          ? 'border-[#CE826D]/70 text-[#CE826D]'
                          : 'border-white/18 text-[#9E9E9E]'
                    }`}
                  >
                    {isDone ? <Check size={12} aria-hidden="true" /> : num}
                  </span>
                  <span className="truncate">
                    {dict.wizard.steps[num].shortTitle}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Main Step Card */}
      <form
        onSubmit={handleFinalSubmit}
        noValidate
        className="bg-[#141414] border border-white/12 p-5 sm:p-7 space-y-6"
      >
        <div className="pb-4 oa-hairline-b space-y-1">
          <h2 className="text-lg font-normal text-white">
            {dict.wizard.steps[step].title}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD]">
            {dict.wizard.steps[step].help}
          </p>
        </div>

        {/* Accessible Validation Summary */}
        {errorList.length > 0 && (
          <div
            role="alert"
            className="border border-[#E58573]/75 bg-[#231210] p-4 space-y-1.5 text-xs sm:text-sm"
          >
            <p className="font-medium text-[#F5F5F5]">
              {dict.wizard.errors.heading}
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-[#E58573]">
              {errorList.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* STEP 1 — IDENTITY */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="wiz-title-pt"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.titlePt}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <input
                  ref={titlePtRef}
                  id="wiz-title-pt"
                  type="text"
                  value={draft.titlePt}
                  onChange={(e) => {
                    setDraft((p) => ({ ...p, titlePt: e.target.value }));
                    if (errors.titlePt) {
                      setErrors((p) => ({ ...p, titlePt: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.titlePt)}
                  aria-describedby={
                    errors.titlePt ? 'wiz-title-pt-err' : undefined
                  }
                  placeholder={dict.wizard.fields.titlePtPlaceholder}
                  className="oa-field-input"
                />
                {errors.titlePt && (
                  <p
                    id="wiz-title-pt-err"
                    className="mt-1 text-xs text-[#E58573]"
                  >
                    {errors.titlePt}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="wiz-title-en"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.titleEn}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <input
                  ref={titleEnRef}
                  id="wiz-title-en"
                  type="text"
                  value={draft.titleEn}
                  onChange={(e) => {
                    setDraft((p) => ({ ...p, titleEn: e.target.value }));
                    if (errors.titleEn) {
                      setErrors((p) => ({ ...p, titleEn: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.titleEn)}
                  aria-describedby={
                    errors.titleEn ? 'wiz-title-en-err' : undefined
                  }
                  placeholder={dict.wizard.fields.titleEnPlaceholder}
                  className="oa-field-input"
                />
                {errors.titleEn && (
                  <p
                    id="wiz-title-en-err"
                    className="mt-1 text-xs text-[#E58573]"
                  >
                    {errors.titleEn}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="wiz-summary-pt"
                className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
              >
                {dict.wizard.fields.summaryPt}{' '}
                <span className="text-[#CE826D]">*</span>
              </label>
              <p
                id="wiz-summary-pt-help"
                className="mt-0.5 text-xs text-[#9E9E9E]"
              >
                {dict.wizard.fields.summaryPtHelp}
              </p>
              <textarea
                ref={summaryRef}
                id="wiz-summary-pt"
                rows={3}
                value={draft.summaryPt}
                onChange={(e) => {
                  setDraft((p) => ({ ...p, summaryPt: e.target.value }));
                  if (errors.summary) {
                    setErrors((p) => ({ ...p, summary: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.summary)}
                aria-describedby={
                  errors.summary
                    ? 'wiz-summary-pt-help wiz-summary-pt-err'
                    : 'wiz-summary-pt-help'
                }
                placeholder={dict.wizard.fields.summaryPtPlaceholder}
                className="oa-field-input mt-1 resize-y"
              />
              {errors.summary && (
                <p
                  id="wiz-summary-pt-err"
                  className="mt-1 text-xs text-[#E58573]"
                >
                  {errors.summary}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="wiz-summary-en"
                className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
              >
                {dict.wizard.fields.summaryEn}
              </label>
              <p
                id="wiz-summary-en-help"
                className="mt-0.5 text-xs text-[#9E9E9E]"
              >
                {dict.wizard.fields.summaryEnHelp}
              </p>
              <textarea
                id="wiz-summary-en"
                rows={2}
                value={draft.summaryEn}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, summaryEn: e.target.value }))
                }
                aria-describedby="wiz-summary-en-help"
                className="oa-field-input mt-1 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="wiz-discipline"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.discipline}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <select
                  ref={disciplineRef}
                  id="wiz-discipline"
                  value={
                    customDisciplineMode
                      ? CUSTOM_DISCIPLINE_KEY
                      : draft.discipline
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === CUSTOM_DISCIPLINE_KEY) {
                      setCustomDisciplineMode(true);
                      setDraft((p) => ({ ...p, discipline: '' }));
                    } else {
                      setCustomDisciplineMode(false);
                      setDraft((p) => ({ ...p, discipline: val }));
                    }
                    if (errors.discipline) {
                      setErrors((p) => ({ ...p, discipline: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.discipline)}
                  aria-describedby={
                    errors.discipline ? 'wiz-discipline-err' : undefined
                  }
                  className="oa-field-input bg-[#141414]"
                >
                  <option value="" className="bg-[#111111]">
                    —
                  </option>
                  {dict.wizard.disciplineOptions.map((opt) => {
                    const label = pickText(opt, language);
                    return (
                      <option
                        key={label}
                        value={label}
                        className="bg-[#111111]"
                      >
                        {label}
                      </option>
                    );
                  })}
                  <option value={CUSTOM_DISCIPLINE_KEY} className="bg-[#111111]">
                    {dict.wizard.fields.disciplineCustomOption}
                  </option>
                </select>
                {errors.discipline && !customDisciplineMode && (
                  <p
                    id="wiz-discipline-err"
                    className="mt-1 text-xs text-[#E58573]"
                  >
                    {errors.discipline}
                  </p>
                )}
              </div>

              {customDisciplineMode && (
                <div>
                  <label
                    htmlFor="wiz-discipline-custom"
                    className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                  >
                    {dict.wizard.fields.disciplineCustomOption}{' '}
                    <span className="text-[#CE826D]">*</span>
                  </label>
                  <input
                    ref={customDisciplineRef}
                    id="wiz-discipline-custom"
                    type="text"
                    value={draft.discipline}
                    onChange={(e) => {
                      setDraft((p) => ({ ...p, discipline: e.target.value }));
                      if (errors.discipline) {
                        setErrors((p) => ({ ...p, discipline: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.discipline)}
                    aria-describedby={
                      errors.discipline ? 'wiz-discipline-err' : undefined
                    }
                    placeholder={dict.wizard.fields.disciplineCustomPlaceholder}
                    className="oa-field-input"
                  />
                  {errors.discipline && (
                    <p
                      id="wiz-discipline-err"
                      className="mt-1 text-xs text-[#E58573]"
                    >
                      {errors.discipline}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — ORGANIZATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label
                  htmlFor="wiz-department"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.department}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <select
                  ref={departmentRef}
                  id="wiz-department"
                  value={draft.departmentId}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      departmentId: e.target.value as DepartmentId,
                    }))
                  }
                  className="oa-field-input bg-[#141414]"
                >
                  {ASSIGNABLE_DEPARTMENTS.map((deptId) => {
                    const dept = departments[deptId];
                    if (!dept) return null;
                    return (
                      <option
                        key={deptId}
                        value={deptId}
                        className="bg-[#111111]"
                      >
                        {dept.code} · {pickText(dept.name, language)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wiz-lead"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.leadUser}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <select
                  ref={leadRef}
                  id="wiz-lead"
                  value={draft.leadUserId}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  className="oa-field-input bg-[#141414]"
                >
                  {collaborators.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                      className="bg-[#111111]"
                    >
                      {user.name.replace(/\s*\(Demo\)$/i, '')} ({user.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wiz-studio-base"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.studioBase}
                </label>
                <select
                  id="wiz-studio-base"
                  value={draft.studioBase}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      studioBase: e.target.value as 'Maputo' | 'Milão',
                    }))
                  }
                  className="oa-field-input bg-[#141414]"
                >
                  <option value="Maputo" className="bg-[#111111]">
                    Maputo
                  </option>
                  <option value="Milão" className="bg-[#111111]">
                    Milão
                  </option>
                </select>
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]">
                {dict.wizard.fields.contributors}
              </legend>
              <p className="text-xs text-[#9E9E9E]">
                {dict.wizard.fields.contributorsHelp}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {collaborators.map((user) => {
                  const isLead = user.id === draft.leadUserId;
                  const checked =
                    isLead || draft.contributorUserIds.includes(user.id);
                  return (
                    <label
                      key={user.id}
                      className={`min-h-[48px] px-3.5 py-2.5 border flex items-center gap-3 transition-colors ${
                        checked
                          ? 'border-[#A65D4A]/70 bg-[#A65D4A]/12 text-white'
                          : 'border-white/12 bg-[#101010] text-[#D8D8D8] hover:border-white/28 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isLead}
                        onChange={() => handleToggleContributor(user.id)}
                        className="h-4 w-4 accent-[#A65D4A]"
                      />
                      <span className="min-w-0 flex-1 text-xs">
                        <span className="font-medium block truncate">
                          {user.name.replace(/\s*\(Demo\)$/i, '')}
                        </span>
                        <span className="text-[11px] text-[#9E9E9E]">
                          {user.code} · {user.studioBase}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {/* STEP 3 — PLANNING */}
        {step === 3 && (
          <div className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]">
                {dict.wizard.fields.initialPhase}
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PHASE_CHOICES.map((choice) => {
                  const isSelected = draft.initialPhaseChoice === choice;
                  const meta = dict.wizard.phaseChoices[choice];
                  return (
                    <label
                      key={choice}
                      className={`p-4 border cursor-pointer flex flex-col gap-1.5 transition-colors ${
                        isSelected
                          ? 'border-[#A65D4A] bg-[#A65D4A]/16 text-white'
                          : 'border-white/12 bg-[#101010] text-[#E0E0E0] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="wiz-initial-phase"
                          value={choice}
                          checked={isSelected}
                          onChange={() =>
                            setDraft((p) => ({
                              ...p,
                              initialPhaseChoice: choice,
                            }))
                          }
                          className="accent-[#A65D4A]"
                        />
                        <span className="text-sm font-medium">{meta.label}</span>
                      </div>
                      <span className="text-xs text-[#BDBDBD] leading-relaxed pl-5">
                        {meta.hint}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label
                  htmlFor="wiz-milestone-title"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.nextMilestone}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <input
                  ref={milestoneTitleRef}
                  id="wiz-milestone-title"
                  type="text"
                  value={draft.nextMilestoneTitle}
                  onChange={(e) => {
                    setDraft((p) => ({
                      ...p,
                      nextMilestoneTitle: e.target.value,
                    }));
                    if (errors.nextMilestoneTitle) {
                      setErrors((p) => ({
                        ...p,
                        nextMilestoneTitle: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(errors.nextMilestoneTitle)}
                  aria-describedby={
                    errors.nextMilestoneTitle
                      ? 'wiz-milestone-title-err'
                      : undefined
                  }
                  placeholder={dict.wizard.fields.nextMilestonePlaceholder}
                  className="oa-field-input"
                />
                {errors.nextMilestoneTitle && (
                  <p
                    id="wiz-milestone-title-err"
                    className="mt-1 text-xs text-[#E58573]"
                  >
                    {errors.nextMilestoneTitle}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="wiz-milestone-date"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                >
                  {dict.wizard.fields.nextMilestoneDate}{' '}
                  <span className="text-[#CE826D]">*</span>
                </label>
                <input
                  ref={milestoneDateRef}
                  id="wiz-milestone-date"
                  type="date"
                  value={draft.nextMilestoneDateIso}
                  onChange={(e) => {
                    setDraft((p) => ({
                      ...p,
                      nextMilestoneDateIso: e.target.value,
                    }));
                    if (errors.nextMilestoneDateIso) {
                      setErrors((p) => ({
                        ...p,
                        nextMilestoneDateIso: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(errors.nextMilestoneDateIso)}
                  aria-describedby={
                    errors.nextMilestoneDateIso
                      ? 'wiz-milestone-date-err'
                      : undefined
                  }
                  className="oa-field-input"
                />
                {errors.nextMilestoneDateIso && (
                  <p
                    id="wiz-milestone-date-err"
                    className="mt-1 text-xs text-[#E58573]"
                  >
                    {errors.nextMilestoneDateIso}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — REVIEW & PRIVACY GUARANTEE */}
        {step === 4 && (
          <div className="space-y-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-[#101010] border border-white/12 p-4 space-y-2 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.wizard.reviewCodePreviewLabel}
                  </dt>
                  <span className="text-xs font-semibold text-[#CE826D] tabular-nums">
                    {suggestedCode}
                  </span>
                </div>
                <dd className="text-lg font-normal text-white">
                  {draft.titlePt.trim()} /{' '}
                  <span className="text-[#BDBDBD]">{draft.titleEn.trim()}</span>
                </dd>
                <p className="text-xs text-[#D8D8D8]">
                  {draft.summaryPt.trim()}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#CE826D]">
                  {draft.discipline}
                </p>
              </div>

              <div className="bg-[#101010] border border-white/12 p-4 space-y-1.5">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.wizard.reviewSummaryTeamLabel}
                </dt>
                <dd className="text-white">
                  {departments[draft.departmentId]
                    ? pickText(departments[draft.departmentId]!.name, language)
                    : draft.departmentId}{' '}
                  · {draft.studioBase}
                </dd>
                <p className="text-xs text-[#BDBDBD]">
                  {dict.gallery.leadLabel}:{' '}
                  {selectedLeadUser?.name.replace(/\s*\(Demo\)$/i, '') ??
                    draft.leadUserId}{' '}
                  ·{' '}
                  <span className="tabular-nums">
                    {
                      Array.from(
                        new Set([draft.leadUserId, ...draft.contributorUserIds]),
                      ).length
                    }
                  </span>{' '}
                  {dict.dossier.team.contributorCountLabel}
                </p>
              </div>

              <div className="bg-[#101010] border border-white/12 p-4 space-y-1.5">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                  {dict.wizard.reviewSummaryPlanLabel}
                </dt>
                <dd className="text-white">
                  {dict.wizard.phaseChoices[draft.initialPhaseChoice].label}
                </dd>
                <p className="text-xs text-[#BDBDBD]">
                  {draft.nextMilestoneTitle.trim()} (
                  <span className="tabular-nums">
                    {draft.nextMilestoneDateIso}
                  </span>
                  )
                </p>
              </div>
            </dl>

            <div className="border border-[#A65D4A]/65 bg-[#191210] p-4 flex items-start gap-3">
              <Lock
                size={18}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-[#CE826D] shrink-0 mt-0.5"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {dict.wizard.reviewPrivacyBoxTitle}
                </p>
                <p className="text-xs sm:text-sm text-[#D8D8D8] leading-relaxed">
                  {dict.wizard.reviewPrivacyBoxBody}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-5 oa-hairline-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#9E9E9E]">
            {dict.wizard.stepSavedHint}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleAttemptExit}
              className="min-h-[44px] px-4 py-2 border border-white/16 bg-[#101010] hover:border-white/35 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white cursor-pointer"
            >
              {dict.common.cancel}
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="min-h-[44px] px-4 py-2 border border-white/20 bg-[#181818] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>{dict.common.previous}</span>
              </button>
            )}

            {step < 4 ? (
              <button
                key="wizard-next-button"
                type="button"
                onClick={handleNextStep}
                className="min-h-[44px] px-5 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.15em] text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{dict.common.next}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                key="wizard-submit-button"
                type="submit"
                className="min-h-[44px] px-5 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.15em] text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <Check size={14} aria-hidden="true" />
                <span>{dict.common.saveInBrowser}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Unsaved Changes Confirmation Dialog with WCAG 2.2 AA Focus Trap */}
      {isLeaveConfirmOpen &&
        createPortal(
          <div
            ref={leavePortalRef}
            data-oa-dialog-portal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          >
            <div
              ref={leaveDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="wizard-leave-confirm-title"
              aria-describedby="wizard-leave-confirm-desc"
              className="w-full max-w-md bg-[#111111] border border-white/20 p-6 space-y-5"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="text-[#CE826D] shrink-0 mt-0.5"
                />
                <div className="space-y-2">
                  <h2
                    id="wizard-leave-confirm-title"
                    className="text-lg font-normal text-white"
                  >
                    {dict.wizard.leaveConfirm.title}
                  </h2>
                  <p
                    id="wizard-leave-confirm-desc"
                    className="text-sm text-[#D0D0D0] leading-relaxed"
                  >
                    {dict.wizard.leaveConfirm.body}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 oa-hairline-t">
                <button
                  ref={keepEditingButtonRef}
                  type="button"
                  onClick={() => setIsLeaveConfirmOpen(false)}
                  className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
                >
                  {dict.wizard.leaveConfirm.keepEditing}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="min-h-[44px] px-4 py-2 border border-white/20 bg-[#181818] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white cursor-pointer"
                >
                  {dict.wizard.leaveConfirm.discardAndLeave}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
