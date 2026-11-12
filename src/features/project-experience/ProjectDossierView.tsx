import {
  ArrowLeft,
  ArrowRight,
  Box,
  CheckCircle2,
  Clock,
  Eye,
  FileCode2,
  FileText,
  Info,
  Lock,
  Plus,
  Users,
} from 'lucide-react';
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import {
  getTodayIsoDate,
  isValidIsoCalendarDate,
} from '../../data/projectLibraryRepository';
import type { DeskReviewState } from '../../data/studioDeskTypes';
import type { ProjectStatus } from '../../data/types';
import type {
  DossierSectionId,
  ProjectDocumentReference,
  ProjectDossierMetadataPatch,
  ProjectDossierViewProps,
  ProjectFileFormat,
  ProjectFileReviewState,
  ProjectRevisionDraftInput,
} from './contracts';
import {
  deriveDefaultProjectDocuments,
  deriveProjectRevisionHistory,
  formatIsoDateShort,
  isSkpFormat,
  isWeb3DFormat,
  pickText,
  resolveCollaboratorsForProject,
  resolveDepartmentName,
} from './helpers';
import { getProjectExperienceDictionary } from './i18n';

const DOSSIER_SECTION_ORDER: readonly DossierSectionId[] = [
  'identity',
  'team',
  'development',
  'documentation',
  'history',
  'visibility',
];

const FILE_FORMAT_OPTIONS: readonly ProjectFileFormat[] = [
  'pdf',
  'dwg',
  'skp',
  'glb',
  'gltf',
  'webp',
  'xlsx',
];

const FILE_REVIEW_OPTIONS: readonly ProjectFileReviewState[] = [
  'draft',
  'in_review',
  'approved',
  'superseded',
];

function ProjectDossierViewInner({
  project,
  language = 'pt',
  collaborators = DEMO_USERS,
  departments = DEPARTMENTS,
  documents,
  revisions,
  activityEntries = [],
  initialSection = 'identity',
  isArchived = project.projectStatus === 'archived',
  onBackToProjects,
  onRegisterDocumentMetadata,
  onUpdateMetadata,
  onArchiveProject,
  onRestoreProject,
  onAddRevision,
  onOpenPhase04Model,
  onOpenInStudioDesk,
  onOpen3DPlaceholderNote,
  className = '',
}: ProjectDossierViewProps) {
  const dict = getProjectExperienceDictionary(language);
  const [activeSection, setActiveSection] =
    useState<DossierSectionId>(initialSection);
  const [localExtraDocs, setLocalExtraDocs] = useState<
    Record<string, ProjectDocumentReference[]>
  >({});
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [preview3DMessage, setPreview3DMessage] = useState<string | null>(null);
  const [metadataFeedback, setMetadataFeedback] = useState<string | null>(null);
  const [docSubmitError, setDocSubmitError] = useState<string | null>(null);

  // Integrated metadata edit state (Section 1 · Identity)
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editPhasePt, setEditPhasePt] = useState(project.phase.pt);
  const [editStudioBase, setEditStudioBase] = useState<'Maputo' | 'Milão'>(
    project.studioBase,
  );
  const [editStatus, setEditStatus] = useState<
    Exclude<ProjectStatus, 'archived'>
  >(
    project.projectStatus === 'archived'
      ? 'in_progress'
      : project.projectStatus,
  );
  const [editReviewState, setEditReviewState] = useState<DeskReviewState>(
    project.reviewState,
  );
  const [editMilestoneTitlePt, setEditMilestoneTitlePt] = useState(
    project.nextMilestone.title.pt,
  );
  const [editMilestoneDateIso, setEditMilestoneDateIso] = useState(
    project.nextMilestone.dateIso,
  );
  const [editNotesPt, setEditNotesPt] = useState(project.dossierNotes.pt);
  const [metadataEditStatus, setMetadataEditStatus] = useState<string | null>(
    null,
  );
  const [metadataEditError, setMetadataEditError] = useState<string | null>(
    null,
  );

  // Integrated revision form state (Section 5 · History)
  const [isAddRevisionOpen, setIsAddRevisionOpen] = useState(false);
  const [revVersion, setRevVersion] = useState(
    `rev.${String((revisions?.length ?? 1) + 1).padStart(2, '0')}`,
  );
  const [revSummary, setRevSummary] = useState('');
  const [revReviewState, setRevReviewState] = useState<DeskReviewState>(
    project.reviewState,
  );
  const [revFeedback, setRevFeedback] = useState<string | null>(null);
  const [revError, setRevError] = useState<string | null>(null);

  // Form state for adding file metadata without real upload
  const [docCode, setDocCode] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docExtension, setDocExtension] = useState<ProjectFileFormat>('pdf');
  const [docVersion, setDocVersion] = useState('v01');
  const [docAuthor, setDocAuthor] = useState(project.leadAuthorName);
  const [docReviewState, setDocReviewState] =
    useState<ProjectFileReviewState>('draft');
  const [docRelation, setDocRelation] = useState('');
  const [docErrors, setDocErrors] = useState<{
    fileName?: string;
    relation?: string;
  }>({});

  const tabRefs = useRef<Partial<Record<DossierSectionId, HTMLButtonElement | null>>>(
    {},
  );
  const fileNameInputRef = useRef<HTMLInputElement | null>(null);
  const relationInputRef = useRef<HTMLInputElement | null>(null);

  const { leadUser, teamMembers } = useMemo(
    () => resolveCollaboratorsForProject(project, collaborators),
    [project, collaborators],
  );

  const departmentName = useMemo(
    () => resolveDepartmentName(project.departmentId, departments, language),
    [project.departmentId, departments, language],
  );

  const departmentFocus = useMemo(() => {
    const dept = departments[project.departmentId];
    return dept ? pickText(dept.focus, language) : null;
  }, [departments, project.departmentId, language]);

  const resolvedDocuments = useMemo(() => {
    if (documents !== undefined) {
      return [...documents];
    }
    const base = deriveDefaultProjectDocuments(project);
    const localAdded = localExtraDocs[project.id] ?? [];
    return [...base, ...localAdded];
  }, [documents, project, localExtraDocs]);

  const resolvedRevisions = useMemo(() => {
    if (revisions !== undefined) {
      return revisions;
    }
    return deriveProjectRevisionHistory(project, activityEntries);
  }, [revisions, project, activityEntries]);

  const pendingDeliverablesCount = useMemo(
    () => project.deliverables.filter((item) => !item.ready).length,
    [project.deliverables],
  );

  const progressRatio =
    project.milestonesTotal > 0
      ? Math.min(
          100,
          Math.round(
            (project.milestonesCompleted / project.milestonesTotal) * 100,
          ),
        )
      : 0;

  const activeSectionIndex = DOSSIER_SECTION_ORDER.indexOf(activeSection);
  const nextSectionId =
    activeSectionIndex >= 0 &&
    activeSectionIndex < DOSSIER_SECTION_ORDER.length - 1
      ? DOSSIER_SECTION_ORDER[activeSectionIndex + 1]
      : null;

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % DOSSIER_SECTION_ORDER.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex =
        (currentIndex - 1 + DOSSIER_SECTION_ORDER.length) %
        DOSSIER_SECTION_ORDER.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = DOSSIER_SECTION_ORDER.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const targetSection = DOSSIER_SECTION_ORDER[nextIndex];
    setActiveSection(targetSection);
    tabRefs.current[targetSection]?.focus();
  };

  const handleJumpToDocumentation = () => {
    setActiveSection('documentation');
    setIsAddFormOpen(true);
    setMetadataFeedback(null);
  };

  const handleAddMetadataSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setDocSubmitError(null);
    setMetadataFeedback(null);

    const trimmedFile = docFileName.trim();
    const trimmedRelation = docRelation.trim();
    const nextErrors: { fileName?: string; relation?: string } = {};

    if (!trimmedFile) {
      nextErrors.fileName = dict.dossier.documentation.validationFileName;
    }
    if (!trimmedRelation) {
      nextErrors.relation = dict.dossier.documentation.validationRelation;
    }

    if (Object.keys(nextErrors).length > 0) {
      setDocErrors(nextErrors);
      if (nextErrors.fileName) {
        fileNameInputRef.current?.focus();
      } else if (nextErrors.relation) {
        relationInputRef.current?.focus();
      }
      return;
    }

    const todayIso = getTodayIsoDate();
    const cleanCode =
      docCode.trim().toUpperCase() ||
      `${project.code}-DOC-${String(resolvedDocuments.length + 1).padStart(2, '0')}`;

    const entryPayload: Omit<ProjectDocumentReference, 'id'> = {
      code: cleanCode,
      fileName: trimmedFile,
      extension: docExtension,
      version: docVersion.trim() || 'v01',
      authorName: docAuthor.trim() || project.leadAuthorName,
      dateIso: todayIso,
      dateLabel: formatIsoDateShort(todayIso),
      reviewState: docReviewState,
      relationSummary: {
        pt: trimmedRelation,
        en: trimmedRelation,
      },
    };

    try {
      if (onRegisterDocumentMetadata) {
        await onRegisterDocumentMetadata(project.id, entryPayload);
      }

      if (documents === undefined) {
        setLocalExtraDocs((prev) => ({
          ...prev,
          [project.id]: [
            ...(prev[project.id] ?? []),
            {
              ...entryPayload,
              id: `${project.id}-local-doc-${Date.now()}`,
            },
          ],
        }));
      }

      setDocCode('');
      setDocFileName('');
      setDocVersion('v01');
      setDocRelation('');
      setDocErrors({});
      setIsAddFormOpen(false);
      setMetadataFeedback(dict.dossier.documentation.feedbackAdded);
    } catch (error) {
      setDocSubmitError(
        error instanceof Error && error.message
          ? error.message
          : dict.dossier.documentation.validationErrorFallback,
      );
    }
  };

  const handleSaveMetadataEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!onUpdateMetadata) {
      return;
    }
    setMetadataEditError(null);
    setMetadataEditStatus(null);

    const dateCandidate = editMilestoneDateIso.trim();
    if (!isValidIsoCalendarDate(dateCandidate)) {
      setMetadataEditError(dict.wizard.errors.nextMilestoneDate);
      return;
    }

    const patch: ProjectDossierMetadataPatch = {
      phasePt: editPhasePt.trim() || project.phase.pt,
      phaseEn: editPhasePt.trim() || project.phase.en,
      studioBase: editStudioBase,
      projectStatus: editStatus,
      reviewState: editReviewState,
      nextMilestoneTitlePt:
        editMilestoneTitlePt.trim() || project.nextMilestone.title.pt,
      nextMilestoneTitleEn:
        editMilestoneTitlePt.trim() || project.nextMilestone.title.en,
      nextMilestoneDateIso: dateCandidate,
      dossierNotesPt: editNotesPt.trim() || project.dossierNotes.pt,
      dossierNotesEn: editNotesPt.trim() || project.dossierNotes.en,
    };

    try {
      await onUpdateMetadata(patch);
      setIsEditingMetadata(false);
      setMetadataEditStatus(dict.dossier.identity.metadataSaved);
    } catch (error) {
      setMetadataEditError(
        error instanceof Error && error.message
          ? error.message
          : dict.wizard.errors.nextMilestoneDate,
      );
    }
  };

  const handleAddRevisionSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!onAddRevision) {
      return;
    }
    setRevError(null);
    setRevFeedback(null);

    if (!revSummary.trim()) {
      setRevError(dict.dossier.history.validationSummary);
      return;
    }

    const payload: ProjectRevisionDraftInput = {
      versionLabel: revVersion.trim() || `rev.${resolvedRevisions.length + 1}`,
      summaryPt: revSummary.trim(),
      summaryEn: revSummary.trim(),
      reviewState: revReviewState,
    };

    try {
      await onAddRevision(payload);
      setRevVersion(
        `rev.${String(resolvedRevisions.length + 2).padStart(2, '0')}`,
      );
      setRevSummary('');
      setIsAddRevisionOpen(false);
      setRevFeedback(dict.dossier.history.revisionAdded);
    } catch (error) {
      setRevError(
        error instanceof Error && error.message
          ? error.message
          : dict.dossier.history.validationSummary,
      );
    }
  };

  return (
    <article
      aria-labelledby="dossier-project-heading"
      className={`w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 ${className}`}
    >
      {/* Top Return & Contextual Action Bar */}
      <div className="pb-4 oa-hairline-b flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          {onBackToProjects && (
            <button
              type="button"
              onClick={onBackToProjects}
              className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.common.backToProjects}</span>
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#BDBDBD]">
            <span className="text-[#CE826D] font-semibold">
              {dict.dossier.headerEyebrow}
            </span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="text-white font-semibold tabular-nums">
              {project.code}
            </span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span>{project.studioBase}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 border border-white/18 bg-[#141414] text-[11px] uppercase tracking-[0.12em] text-[#E0E0E0] inline-flex items-center gap-1.5">
            <Lock size={12} strokeWidth={1.6} aria-hidden="true" />
            <span>
              {project.publicationStatus === 'private'
                ? dict.common.privateDefaultNote
                : dict.publicationStates[project.publicationStatus]}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setActiveSection('development')}
            className="min-h-[44px] px-3.5 py-2 border border-white/16 bg-[#141414] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye size={13} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.common.viewRevision}</span>
          </button>

          <button
            type="button"
            onClick={handleJumpToDocumentation}
            className="min-h-[44px] px-3.5 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-[11px] font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.common.addInfo}</span>
          </button>

          {onOpenInStudioDesk && (
            <button
              type="button"
              onClick={onOpenInStudioDesk}
              className="min-h-[44px] px-3 py-2 border border-white/16 bg-[#141414] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{dict.dossier.identity.openDeskCta}</span>
            </button>
          )}

          {onOpenPhase04Model && (
            <button
              type="button"
              onClick={onOpenPhase04Model}
              className="min-h-[44px] px-3 py-2 border border-white/16 bg-[#141414] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Box size={13} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.dossier.identity.openModelRouteCta}</span>
            </button>
          )}
        </div>
      </div>

      {isArchived && (
        <div
          role="status"
          className="border border-white/20 bg-[#181412] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#E0E0E0]"
        >
          <span>{dict.dossier.identity.archivedBanner}</span>
          {onRestoreProject && (
            <button
              type="button"
              onClick={() => void onRestoreProject('in_progress')}
              className="min-h-[40px] px-3.5 py-1.5 border border-[#A65D4A] bg-[#A65D4A]/20 hover:bg-[#A65D4A]/35 text-xs font-medium uppercase tracking-[0.13em] text-white cursor-pointer"
            >
              {dict.dossier.identity.restoreCta}
            </button>
          )}
        </div>
      )}

      {/* Editorial Opening & "Where am I / What is Pending / What Next" Grid */}
      <header className="bg-[#141414] border border-white/12 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 relative bg-[#050505] aspect-[16/10] lg:aspect-auto lg:min-h-[300px] overflow-hidden oa-hairline-b lg:border-b-0 lg:border-r lg:border-white/10">
          <img
            src={project.imageSrc}
            alt={pickText(project.imageAlt, language)}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-x-0 bottom-0 px-4 py-2.5 bg-gradient-to-t from-black/85 to-transparent flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#E0E0E0] tabular-nums">
            <span>
              {project.scale} · {project.areaSqm}
            </span>
            <span>{project.elevationDatum}</span>
          </div>
        </div>

        <div className="lg:col-span-6 p-5 sm:p-7 flex flex-col justify-between gap-6 min-w-0">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
              <span className="text-[#CE826D] font-medium">
                {pickText(project.discipline, language)}
              </span>
              <span aria-hidden="true" className="text-white/25">
                ·
              </span>
              <span className="text-[#BDBDBD]">{departmentName}</span>
            </div>

            <h1
              id="dossier-project-heading"
              className="text-2xl sm:text-3xl font-light tracking-tight leading-[1.15] text-white"
            >
              {pickText(project.title, language)}
            </h1>

            <p className="text-sm text-[#D8D8D8] leading-relaxed">
              {pickText(project.subtitle, language)}
            </p>
          </div>

          {/* Pending / Next Action Box */}
          <div className="border border-white/14 bg-[#0D0D0D] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#CE826D]">
                {dict.dossier.pendingSummaryTitle}
              </p>
              <span className="text-[11px] text-white font-medium tabular-nums">
                {dict.statuses[project.projectStatus]} ·{' '}
                {dict.reviewStates[project.reviewState]}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-[#F5F5F5] space-y-1">
              <p>
                <span className="text-[#9E9E9E]">
                  {dict.gallery.nextMilestoneLabel}:{' '}
                </span>
                {pickText(project.nextMilestone.title, language)} (
                <span className="tabular-nums text-white">
                  {pickText(project.nextMilestone.dateLabel, language)}
                </span>
                )
              </p>
              <p className="text-xs text-[#BDBDBD]">
                {pendingDeliverablesCount > 0
                  ? `${dict.dossier.pendingDeliverablesPrefix}: ${pendingDeliverablesCount}`
                  : dict.dossier.noPendingDeliverables}{' '}
                · {dict.common.milestonesProgress}:{' '}
                <span className="tabular-nums text-white">
                  {project.milestonesCompleted}/{project.milestonesTotal}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Comprehensible Section Navigation (Accessible Tablist) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <p className="text-xs text-[#BDBDBD]">
            {dict.dossier.sectionOrderHint}
          </p>
          <p className="text-[11px] text-[#9E9E9E]">
            {dict.common.localDemoNotice}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={dict.dossier.sectionNavLabel}
          className="flex overflow-x-auto border border-white/14 bg-[#101010] divide-x divide-white/10"
        >
          {DOSSIER_SECTION_ORDER.map((sectionId, idx) => {
            const isSelected = activeSection === sectionId;
            return (
              <button
                key={sectionId}
                ref={(el) => {
                  tabRefs.current[sectionId] = el;
                }}
                id={`dossier-tab-${sectionId}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`dossier-panel-${sectionId}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveSection(sectionId)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`min-h-[46px] px-4 sm:px-5 py-2.5 text-xs uppercase tracking-[0.14em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#A65D4A]/20 text-white font-medium border-b-2 border-[#A65D4A]'
                    : 'text-[#BDBDBD] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {idx + 1}. {dict.dossier.sections[sectionId]}
              </button>
            );
          })}
        </div>

        {/* Section Panels */}
        <section
          id={`dossier-panel-${activeSection}`}
          role="tabpanel"
          aria-labelledby={`dossier-tab-${activeSection}`}
          className="bg-[#141414] border border-white/12 p-5 sm:p-7 space-y-6"
        >
          {/* 1. IDENTITY */}
          {activeSection === 'identity' && (
            <div className="space-y-6">
              <div className="pb-3 oa-hairline-b flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-normal text-white">
                  {dict.dossier.identity.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#CE826D] tabular-nums">
                    {project.code}
                  </span>
                  {onUpdateMetadata && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingMetadata((prev) => !prev);
                        setMetadataEditError(null);
                        setMetadataEditStatus(null);
                      }}
                      aria-expanded={isEditingMetadata}
                      className="min-h-[40px] px-3 py-1.5 border border-white/18 bg-[#101010] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.13em] text-white cursor-pointer"
                    >
                      {isEditingMetadata
                        ? dict.dossier.identity.cancelEditCta
                        : dict.dossier.identity.editMetadataCta}
                    </button>
                  )}
                  {!isArchived && onArchiveProject && (
                    <button
                      type="button"
                      onClick={() => void onArchiveProject()}
                      className="min-h-[40px] px-3 py-1.5 border border-white/16 bg-[#101010] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.13em] text-[#BDBDBD] hover:text-white cursor-pointer"
                    >
                      {dict.dossier.identity.archiveCta}
                    </button>
                  )}
                </div>
              </div>

              {metadataEditStatus && (
                <div
                  role="status"
                  className="border border-[#A65D4A]/65 bg-[#A65D4A]/14 px-4 py-3 text-xs sm:text-sm text-white"
                >
                  {metadataEditStatus}
                </div>
              )}

              {metadataEditError && (
                <div
                  role="alert"
                  className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 text-xs sm:text-sm text-[#F5C2B8]"
                >
                  <strong>{dict.dossier.identity.errorBannerTitle}</strong>{' '}
                  {metadataEditError}
                </div>
              )}

              {isEditingMetadata && onUpdateMetadata && (
                <form
                  onSubmit={handleSaveMetadataEdit}
                  noValidate
                  className="bg-[#101010] border border-[#A65D4A]/55 p-4 sm:p-5 space-y-4"
                >
                  <h3 className="text-sm font-medium text-white">
                    {dict.dossier.identity.editHeading}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="dossier-edit-phase"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldPhase}
                      </label>
                      <input
                        id="dossier-edit-phase"
                        type="text"
                        value={editPhasePt}
                        onChange={(e) => setEditPhasePt(e.target.value)}
                        className="oa-field-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dossier-edit-base"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldStudioBase}
                      </label>
                      <select
                        id="dossier-edit-base"
                        value={editStudioBase}
                        onChange={(e) =>
                          setEditStudioBase(
                            e.target.value as 'Maputo' | 'Milão',
                          )
                        }
                        className="oa-field-input bg-[#101010]"
                      >
                        <option value="Maputo" className="bg-[#111111]">
                          Maputo
                        </option>
                        <option value="Milão" className="bg-[#111111]">
                          Milão
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="dossier-edit-status"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldStatus}
                      </label>
                      <select
                        id="dossier-edit-status"
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(
                            e.target.value as Exclude<
                              ProjectStatus,
                              'archived'
                            >,
                          )
                        }
                        className="oa-field-input bg-[#101010]"
                      >
                        {(
                          [
                            'concept',
                            'design',
                            'in_progress',
                            'review',
                            'completed',
                          ] as const
                        ).map((st) => (
                          <option key={st} value={st} className="bg-[#111111]">
                            {dict.statuses[st]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="dossier-edit-review"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldReviewState}
                      </label>
                      <select
                        id="dossier-edit-review"
                        value={editReviewState}
                        onChange={(e) =>
                          setEditReviewState(e.target.value as DeskReviewState)
                        }
                        className="oa-field-input bg-[#101010]"
                      >
                        {(
                          [
                            'awaiting_review',
                            'in_technical_review',
                            'revision_requested',
                            'approved_internal',
                          ] as const
                        ).map((rv) => (
                          <option key={rv} value={rv} className="bg-[#111111]">
                            {dict.reviewStates[rv]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="dossier-edit-milestone-title"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldMilestoneTitle}
                      </label>
                      <input
                        id="dossier-edit-milestone-title"
                        type="text"
                        value={editMilestoneTitlePt}
                        onChange={(e) =>
                          setEditMilestoneTitlePt(e.target.value)
                        }
                        className="oa-field-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dossier-edit-milestone-date"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldMilestoneDate}
                      </label>
                      <input
                        id="dossier-edit-milestone-date"
                        type="date"
                        value={editMilestoneDateIso}
                        onChange={(e) =>
                          setEditMilestoneDateIso(e.target.value)
                        }
                        className="oa-field-input"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label
                        htmlFor="dossier-edit-notes"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.identity.fieldNotes}
                      </label>
                      <input
                        id="dossier-edit-notes"
                        type="text"
                        value={editNotesPt}
                        onChange={(e) => setEditNotesPt(e.target.value)}
                        className="oa-field-input"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingMetadata(false)}
                      className="min-h-[44px] px-4 py-2 border border-white/16 text-xs uppercase tracking-[0.13em] text-[#D8D8D8] hover:text-white cursor-pointer"
                    >
                      {dict.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] px-5 py-2 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#914e3d] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
                    >
                      {dict.dossier.identity.saveMetadataCta}
                    </button>
                  </div>
                </form>
              )}

              <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
                <div className="bg-[#101010] border border-white/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.namePtLabel}
                  </dt>
                  <dd className="mt-1.5 text-white font-normal">
                    {project.title.pt}
                  </dd>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.nameEnLabel}
                  </dt>
                  <dd className="mt-1.5 text-white font-normal">
                    {project.title.en}
                  </dd>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.disciplineLabel}
                  </dt>
                  <dd className="mt-1.5 text-[#E0E0E0]">
                    {pickText(project.discipline, language)}
                  </dd>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.locationLabel}
                  </dt>
                  <dd className="mt-1.5 text-[#E0E0E0]">
                    {project.studioBase}
                  </dd>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.scaleLabel}
                  </dt>
                  <dd className="mt-1.5 text-[#E0E0E0] tabular-nums">
                    {project.scale} · {project.areaSqm}
                  </dd>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.datumLabel}
                  </dt>
                  <dd className="mt-1.5 text-[#E0E0E0] tabular-nums">
                    {project.elevationDatum}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="border-l-2 border-[#A65D4A] pl-4 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.descriptionLabel}
                  </p>
                  <p className="text-sm text-[#E0E0E0] leading-relaxed">
                    {pickText(project.subtitle, language)}
                  </p>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.identity.notesLabel}
                  </p>
                  <p className="text-sm text-[#D8D8D8] leading-relaxed">
                    {pickText(project.dossierNotes, language)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. TEAM */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="pb-3 oa-hairline-b flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-normal text-white">
                  {dict.dossier.team.title}
                </h2>
                <span className="text-xs text-[#BDBDBD] inline-flex items-center gap-1.5 tabular-nums">
                  <Users size={14} aria-hidden="true" />
                  <span>
                    {teamMembers.length > 0 ? teamMembers.length : 1}{' '}
                    {dict.dossier.team.contributorCountLabel}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#101010] border border-[#A65D4A]/45 p-4 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#CE826D]">
                    {dict.dossier.team.leadHeading}
                  </p>
                  <p className="text-base font-medium text-white">
                    {project.leadAuthorName}{' '}
                    <span className="text-xs font-normal text-[#BDBDBD] tabular-nums">
                      ({project.leadAuthorCode})
                    </span>
                  </p>
                  <p className="text-xs text-[#BDBDBD]">
                    {leadUser
                      ? pickText(leadUser.roleLabel, language)
                      : departmentName}{' '}
                    · {dict.dossier.team.studioBasePrefix}:{' '}
                    {leadUser?.studioBase ?? project.studioBase}
                  </p>
                </div>

                <div className="bg-[#101010] border border-white/12 p-4 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.team.departmentHeading}
                  </p>
                  <p className="text-base font-medium text-white">
                    {departmentName}
                  </p>
                  {departmentFocus && (
                    <p className="text-xs text-[#BDBDBD]">{departmentFocus}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-[#BDBDBD]">
                  {dict.dossier.team.contributorsHeading}
                </h3>
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-[#BDBDBD]">
                    {dict.dossier.team.noAdditionalContributors}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-[#101010] border border-white/12 p-3.5 flex items-start gap-3"
                      >
                        <span
                          aria-hidden="true"
                          className="h-9 w-9 shrink-0 bg-[#1B1B1B] border border-white/16 flex items-center justify-center text-xs font-semibold text-white"
                        >
                          {member.initials}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-[#CE826D] tabular-nums">
                            {member.code} · {member.studioBase}
                          </p>
                          <p className="text-xs text-[#BDBDBD] truncate">
                            {pickText(member.roleLabel, language)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. DEVELOPMENT */}
          {activeSection === 'development' && (
            <div className="space-y-6">
              <div className="pb-3 oa-hairline-b flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-normal text-white">
                  {dict.dossier.development.title}
                </h2>
                <span className="text-xs text-white font-medium tabular-nums">
                  {project.milestonesCompleted} / {project.milestonesTotal}{' '}
                  {dict.common.milestonesProgress}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-[#101010] border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.development.currentPhaseLabel}
                  </p>
                  <p className="mt-1.5 text-white">
                    {pickText(project.phase, language)}
                  </p>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.development.projectStatusLabel}
                  </p>
                  <p className="mt-1.5 text-[#CE826D] font-medium">
                    {dict.statuses[project.projectStatus]}
                  </p>
                </div>

                <div className="bg-[#101010] border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.dossier.development.reviewStateLabel}
                  </p>
                  <p className="mt-1.5 text-white">
                    {dict.reviewStates[project.reviewState]}
                  </p>
                </div>
              </div>

              <div className="bg-[#101010] border border-white/12 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]">
                    {dict.dossier.development.nextMilestoneLabel}
                  </p>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {pickText(project.nextMilestone.dateLabel, language)}
                  </span>
                </div>
                <p className="text-sm text-white">
                  {pickText(project.nextMilestone.title, language)}
                </p>
                <div
                  aria-label={`${dict.dossier.development.milestonesProgressLabel}: ${progressRatio}%`}
                  className="h-1 w-full bg-white/10 overflow-hidden"
                >
                  <div
                    className="h-full bg-[#A65D4A]"
                    style={{ width: `${progressRatio}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-[#BDBDBD]">
                  {dict.dossier.development.deliverablesHeading}
                </h3>
                {project.deliverables.length === 0 ? (
                  <p className="text-sm text-[#BDBDBD]">
                    {dict.dossier.development.noDeliverables}
                  </p>
                ) : (
                  <ul className="divide-y divide-white/10 border border-white/12 bg-[#101010]">
                    {project.deliverables.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.ready ? (
                            <CheckCircle2
                              size={16}
                              className="text-[#CE826D] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <Clock
                              size={16}
                              className="text-[#9E9E9E] shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span className="text-xs font-semibold text-[#BDBDBD] tabular-nums shrink-0">
                            {item.code}
                          </span>
                          <span className="text-[#F5F5F5]">
                            {pickText(item.label, language)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] border ${
                            item.ready
                              ? 'border-[#A65D4A]/60 bg-[#A65D4A]/15 text-white'
                              : 'border-white/16 bg-[#161616] text-[#BDBDBD]'
                          }`}
                        >
                          {item.ready
                            ? dict.dossier.development.deliverableDone
                            : dict.dossier.development.deliverablePending}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 4. DOCUMENTATION & FILE REVISION CYCLE */}
          {activeSection === 'documentation' && (
            <div className="space-y-6">
              <div className="pb-3 oa-hairline-b flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-normal text-white">
                  {dict.dossier.documentation.title}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFormOpen((open) => !open);
                    setMetadataFeedback(null);
                  }}
                  aria-expanded={isAddFormOpen}
                  className="min-h-[44px] px-3.5 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus size={14} strokeWidth={1.7} aria-hidden="true" />
                  <span>
                    {isAddFormOpen
                      ? dict.dossier.documentation.closeFormCta
                      : dict.dossier.documentation.addMetadataCta}
                  </span>
                </button>
              </div>

              {/* Honest No-Upload & SketchUp / 3D Clarity Banner */}
              <div className="bg-[#101010] border-l-2 border-[#A65D4A] border border-white/12 p-4 flex items-start gap-3">
                <Info
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="text-[#CE826D] shrink-0 mt-0.5"
                />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-medium text-white">
                    {dict.dossier.documentation.honestBannerTitle}
                  </p>
                  <p className="text-[#BDBDBD] leading-relaxed">
                    {dict.dossier.documentation.honestBannerBody}
                  </p>
                </div>
              </div>

              {metadataFeedback && (
                <div
                  role="status"
                  className="border border-[#A65D4A]/65 bg-[#A65D4A]/14 px-4 py-3 text-xs sm:text-sm text-white"
                >
                  {metadataFeedback}
                </div>
              )}

              {docSubmitError && (
                <div
                  role="alert"
                  className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 text-xs sm:text-sm text-[#F5C2B8]"
                >
                  {docSubmitError}
                </div>
              )}

              {preview3DMessage && (
                <div
                  role="status"
                  className="border border-white/20 bg-[#181818] px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#E0E0E0]"
                >
                  <span>{preview3DMessage}</span>
                  <button
                    type="button"
                    onClick={() => setPreview3DMessage(null)}
                    className="min-h-[36px] px-2.5 border border-white/16 text-xs text-white cursor-pointer"
                  >
                    {dict.common.close}
                  </button>
                </div>
              )}

              {/* Metadata-Only Registration Form (No Fake Binary Upload) */}
              {isAddFormOpen && (
                <form
                  onSubmit={handleAddMetadataSubmit}
                  noValidate
                  className="bg-[#101010] border border-[#A65D4A]/55 p-4 sm:p-5 space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-white">
                      {dict.dossier.documentation.formTitle}
                    </h3>
                    <p className="text-xs text-[#BDBDBD]">
                      {dict.dossier.documentation.formHint}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="doc-meta-filename"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldFileName}{' '}
                        <span className="text-[#CE826D]">*</span>
                      </label>
                      <input
                        ref={fileNameInputRef}
                        id="doc-meta-filename"
                        type="text"
                        value={docFileName}
                        onChange={(e) => {
                          setDocFileName(e.target.value);
                          if (docErrors.fileName) {
                            setDocErrors((prev) => ({
                              ...prev,
                              fileName: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(docErrors.fileName)}
                        aria-describedby={
                          docErrors.fileName
                            ? 'doc-meta-filename-error'
                            : undefined
                        }
                        placeholder="Ex.: Corte-AA_v05.pdf"
                        className="oa-field-input"
                      />
                      {docErrors.fileName && (
                        <p
                          id="doc-meta-filename-error"
                          role="alert"
                          className="mt-1 text-xs text-[#E58573]"
                        >
                          {docErrors.fileName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="doc-meta-extension"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldExtension}
                      </label>
                      <select
                        id="doc-meta-extension"
                        value={docExtension}
                        onChange={(e) =>
                          setDocExtension(e.target.value as ProjectFileFormat)
                        }
                        className="oa-field-input bg-[#101010]"
                      >
                        {FILE_FORMAT_OPTIONS.map((fmt) => (
                          <option key={fmt} value={fmt} className="bg-[#111111]">
                            .{fmt} — {dict.fileFormats[fmt]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="doc-meta-version"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldVersion}
                      </label>
                      <input
                        id="doc-meta-version"
                        type="text"
                        value={docVersion}
                        onChange={(e) => setDocVersion(e.target.value)}
                        className="oa-field-input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="doc-meta-code"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldCode}
                      </label>
                      <input
                        id="doc-meta-code"
                        type="text"
                        value={docCode}
                        onChange={(e) => setDocCode(e.target.value)}
                        placeholder={`${project.code}-DOC`}
                        className="oa-field-input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="doc-meta-author"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldAuthor}
                      </label>
                      <input
                        id="doc-meta-author"
                        type="text"
                        value={docAuthor}
                        onChange={(e) => setDocAuthor(e.target.value)}
                        className="oa-field-input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="doc-meta-review"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldReviewState}
                      </label>
                      <select
                        id="doc-meta-review"
                        value={docReviewState}
                        onChange={(e) =>
                          setDocReviewState(
                            e.target.value as ProjectFileReviewState,
                          )
                        }
                        className="oa-field-input bg-[#101010]"
                      >
                        {FILE_REVIEW_OPTIONS.map((state) => (
                          <option
                            key={state}
                            value={state}
                            className="bg-[#111111]"
                          >
                            {dict.fileReviewStates[state]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label
                        htmlFor="doc-meta-relation"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.documentation.fieldRelation}{' '}
                        <span className="text-[#CE826D]">*</span>
                      </label>
                      <input
                        ref={relationInputRef}
                        id="doc-meta-relation"
                        type="text"
                        value={docRelation}
                        onChange={(e) => {
                          setDocRelation(e.target.value);
                          if (docErrors.relation) {
                            setDocErrors((prev) => ({
                              ...prev,
                              relation: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(docErrors.relation)}
                        aria-describedby={
                          docErrors.relation
                            ? 'doc-meta-relation-error'
                            : undefined
                        }
                        placeholder="Ex.: Prancha de pormenor construtivo para revisão técnica"
                        className="oa-field-input"
                      />
                      {docErrors.relation && (
                        <p
                          id="doc-meta-relation-error"
                          role="alert"
                          className="mt-1 text-xs text-[#E58573]"
                        >
                          {docErrors.relation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
                    >
                      {dict.dossier.documentation.submitMetadataCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddFormOpen(false)}
                      className="min-h-[44px] px-4 py-2 border border-white/16 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white cursor-pointer"
                    >
                      {dict.common.cancel}
                    </button>
                  </div>
                </form>
              )}

              {/* File Revision Cycle Cards / Table */}
              {resolvedDocuments.length === 0 ? (
                <p className="text-sm text-[#BDBDBD]">
                  {dict.dossier.documentation.emptyFiles}
                </p>
              ) : (
                <div className="divide-y divide-white/12 border border-white/12 bg-[#101010]">
                  {resolvedDocuments.map((doc) => {
                    const skp = isSkpFormat(doc.extension);
                    const web3d = isWeb3DFormat(doc.extension);
                    return (
                      <div
                        key={doc.id}
                        className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {web3d ? (
                              <Box
                                size={15}
                                className="text-[#CE826D] shrink-0"
                                aria-hidden="true"
                              />
                            ) : skp ? (
                              <FileCode2
                                size={15}
                                className="text-[#BDBDBD] shrink-0"
                                aria-hidden="true"
                              />
                            ) : (
                              <FileText
                                size={15}
                                className="text-[#BDBDBD] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span className="font-semibold text-white break-all">
                              {doc.fileName}
                            </span>
                            <span className="px-2 py-0.5 bg-[#1B1B1B] border border-white/16 text-[11px] uppercase tracking-[0.1em] text-[#E0E0E0]">
                              .{doc.extension} · {doc.version}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-[#D8D8D8]">
                            {pickText(doc.relationSummary, language)}
                          </p>

                          <p className="text-[11px] text-[#9E9E9E] tabular-nums">
                            {dict.fileFormats[doc.extension]} · {doc.authorName}{' '}
                            · {pickText(doc.dateLabel, language)}
                          </p>

                          {skp && (
                            <p className="text-xs text-[#CE826D]">
                              {dict.dossier.documentation.skpNotice}
                            </p>
                          )}

                          {web3d && (
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <p className="text-xs text-[#BDBDBD]">
                                {dict.dossier.documentation.glbNotice}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  onOpen3DPlaceholderNote?.(project);
                                  setPreview3DMessage(
                                    dict.dossier.documentation.preview3DFeedback,
                                  );
                                }}
                                className="min-h-[38px] px-3 py-1 border border-white/18 bg-[#181818] hover:border-[#A65D4A] text-[11px] uppercase tracking-[0.12em] text-white cursor-pointer"
                              >
                                {dict.dossier.documentation.preview3DButton}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-1 border text-[11px] uppercase tracking-[0.12em] ${
                              doc.reviewState === 'approved'
                                ? 'border-[#A65D4A]/65 bg-[#A65D4A]/16 text-white'
                                : 'border-white/16 bg-[#161616] text-[#E0E0E0]'
                            }`}
                          >
                            {dict.fileReviewStates[doc.reviewState]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. HISTORY */}
          {activeSection === 'history' && (
            <div className="space-y-5">
              <div className="pb-3 oa-hairline-b flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-normal text-white">
                    {dict.dossier.history.title}
                  </h2>
                  <p className="text-xs text-[#BDBDBD]">
                    {dict.dossier.history.subtitle}
                  </p>
                </div>
                {onAddRevision && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddRevisionOpen((prev) => !prev);
                      setRevFeedback(null);
                      setRevError(null);
                    }}
                    aria-expanded={isAddRevisionOpen}
                    className="min-h-[44px] px-3.5 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={1.7} aria-hidden="true" />
                    <span>{dict.dossier.history.addRevisionCta}</span>
                  </button>
                )}
              </div>

              {revFeedback && (
                <div
                  role="status"
                  className="border border-[#A65D4A]/65 bg-[#A65D4A]/14 px-4 py-3 text-xs sm:text-sm text-white"
                >
                  {revFeedback}
                </div>
              )}

              {revError && (
                <div
                  role="alert"
                  className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 text-xs sm:text-sm text-[#F5C2B8]"
                >
                  {revError}
                </div>
              )}

              {isAddRevisionOpen && onAddRevision && (
                <form
                  onSubmit={handleAddRevisionSubmit}
                  noValidate
                  className="bg-[#101010] border border-[#A65D4A]/55 p-4 sm:p-5 space-y-4"
                >
                  <h3 className="text-sm font-medium text-white">
                    {dict.dossier.history.formTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rev-meta-version"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.history.fieldVersion}
                      </label>
                      <input
                        id="rev-meta-version"
                        type="text"
                        value={revVersion}
                        onChange={(e) => setRevVersion(e.target.value)}
                        className="oa-field-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="rev-meta-review-state"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.history.fieldReviewState}
                      </label>
                      <select
                        id="rev-meta-review-state"
                        value={revReviewState}
                        onChange={(e) =>
                          setRevReviewState(e.target.value as DeskReviewState)
                        }
                        className="oa-field-input bg-[#101010]"
                      >
                        {(
                          [
                            'awaiting_review',
                            'in_technical_review',
                            'revision_requested',
                            'approved_internal',
                          ] as const
                        ).map((rv) => (
                          <option key={rv} value={rv} className="bg-[#111111]">
                            {dict.reviewStates[rv]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="rev-meta-summary"
                        className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]"
                      >
                        {dict.dossier.history.fieldSummary}{' '}
                        <span className="text-[#CE826D]">*</span>
                      </label>
                      <input
                        id="rev-meta-summary"
                        type="text"
                        value={revSummary}
                        onChange={(e) => setRevSummary(e.target.value)}
                        className="oa-field-input"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddRevisionOpen(false)}
                      className="min-h-[44px] px-4 py-2 border border-white/16 text-xs uppercase tracking-[0.13em] text-[#D8D8D8] hover:text-white cursor-pointer"
                    >
                      {dict.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] px-5 py-2 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#914e3d] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
                    >
                      {dict.dossier.history.submitRevisionCta}
                    </button>
                  </div>
                </form>
              )}

              {resolvedRevisions.length === 0 ? (
                <p className="text-sm text-[#BDBDBD]">
                  {dict.dossier.history.emptyHistory}
                </p>
              ) : (
                <ol className="space-y-4 border-l border-white/14 pl-5 ml-2">
                  {resolvedRevisions.map((entry) => (
                    <li key={entry.id} className="relative space-y-1.5">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 bg-[#A65D4A] border border-[#050505]"
                      />
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em]">
                        <span className="text-[#CE826D] font-semibold">
                          {entry.versionTag} · {dict.activityKinds[entry.kind]}
                        </span>
                        <span aria-hidden="true" className="text-white/25">
                          ·
                        </span>
                        <span className="text-[#9E9E9E] tabular-nums">
                          {pickText(entry.dateLabel, language)}
                        </span>
                      </div>
                      <p className="text-sm text-[#F5F5F5] leading-relaxed">
                        {pickText(entry.summary, language)}
                      </p>
                      <p className="text-xs text-[#BDBDBD]">
                        {entry.authorName}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* 6. VISIBILITY */}
          {activeSection === 'visibility' && (
            <div className="space-y-6">
              <div className="pb-3 oa-hairline-b">
                <h2 className="text-lg font-normal text-white">
                  {dict.dossier.visibility.title}
                </h2>
              </div>

              <div className="bg-[#101010] border border-[#A65D4A]/45 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]">
                    {dict.dossier.visibility.currentStateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181818] border border-white/20 text-xs text-white">
                    <Lock size={12} strokeWidth={1.6} aria-hidden="true" />
                    <span>{dict.publicationStates[project.publicationStatus]}</span>
                  </span>
                </div>

                <p className="text-base font-medium text-white">
                  {dict.dossier.visibility.headlinePrivate}
                </p>
                <p className="text-sm text-[#D8D8D8] leading-relaxed">
                  {dict.dossier.visibility.explanation}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-[#BDBDBD]">
                  {dict.dossier.visibility.checklistHeading}
                </h3>
                <ul className="space-y-2 text-sm text-[#E0E0E0]">
                  {dict.dossier.visibility.checklistItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 bg-[#101010] border border-white/10 p-3.5"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 bg-[#A65D4A] shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Guided Next-Section Footer inside each tabpanel */}
          {nextSectionId && (
            <div className="pt-4 oa-hairline-t flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSection(nextSectionId)}
                className="min-h-[44px] px-4 py-2 border border-white/16 bg-[#101010] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {dict.dossier.nextSectionCta}:{' '}
                  {dict.dossier.sections[nextSectionId]}
                </span>
                <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

export function ProjectDossierView(props: ProjectDossierViewProps) {
  return (
    <ProjectDossierViewInner
      key={`${props.project.id}:${props.initialSection ?? 'identity'}`}
      {...props}
    />
  );
}
