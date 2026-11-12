import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  Edit3,
  FilePlus2,
  GitCommitHorizontal,
  Lock,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import type {
  ProjectFileKind,
  ProjectStudioBase,
} from '../../data/projectLibraryTypes';
import type { DeskReviewState } from '../../data/studioDeskTypes';
import type { DepartmentId, ProjectStatus } from '../../data/types';
import { pickLocalized } from '../../locales';
import { PROJECT_LIBRARY_I18N } from './i18n';
import { useProjectLibrary } from './useProjectLibrary';

const EDITABLE_STATUSES: Exclude<ProjectStatus, 'archived'>[] = [
  'concept',
  'design',
  'in_progress',
  'review',
  'completed',
];

const REVIEW_STATES: DeskReviewState[] = [
  'awaiting_review',
  'in_technical_review',
  'revision_requested',
  'approved_internal',
];

const FILE_KINDS: ProjectFileKind[] = [
  'drawing',
  'model_3d',
  'source_skp',
  'specification',
  'photographic_log',
];

export function ProjectDossierShellPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, language } = useWorkspaceSession();
  const {
    getProject,
    updateMetadata,
    archive,
    restore,
    addRevision,
    addFileReference,
  } = useProjectLibrary();

  const dict = PROJECT_LIBRARY_I18N[language];
  const record = getProject(id);

  const [isEditing, setIsEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Metadata Edit State
  const [editTitlePt, setEditTitlePt] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editSubtitlePt, setEditSubtitlePt] = useState('');
  const [editSubtitleEn, setEditSubtitleEn] = useState('');
  const [editDepartmentId, setEditDepartmentId] =
    useState<DepartmentId>('architecture');
  const [editStudioBase, setEditStudioBase] =
    useState<ProjectStudioBase>('Maputo');
  const [editPhasePt, setEditPhasePt] = useState('');
  const [editPhaseEn, setEditPhaseEn] = useState('');
  const [editStatus, setEditStatus] =
    useState<Exclude<ProjectStatus, 'archived'>>('in_progress');
  const [editReviewState, setEditReviewState] =
    useState<DeskReviewState>('in_technical_review');
  const [editLeadUserId, setEditLeadUserId] = useState('usr-arq-02');
  const [editScale, setEditScale] = useState('');
  const [editAreaSqm, setEditAreaSqm] = useState('');
  const [editMilestoneTitlePt, setEditMilestoneTitlePt] = useState('');
  const [editMilestoneDateIso, setEditMilestoneDateIso] = useState('');
  const [editNotesPt, setEditNotesPt] = useState('');

  // Revision Form State
  const [revVersion, setRevVersion] = useState('');
  const [revSummary, setRevSummary] = useState('');
  const [revReviewState, setRevReviewState] = useState<DeskReviewState>(
    'in_technical_review',
  );

  // File Reference Form State
  const [fileName, setFileName] = useState('');
  const [fileKind, setFileKind] = useState<ProjectFileKind>('drawing');
  const [fileVersion, setFileVersion] = useState('v01');
  const [fileNote, setFileNote] = useState('');

  useEffect(() => {
    if (!record) {
      document.title = `${dict.dossier.notFoundTitle} — O+A Workspace`;
      return;
    }
    document.title = `${record.identity.code} · ${pickLocalized(record.editorial.title, language)} — O+A Workspace`;
  }, [record, language, dict.dossier.notFoundTitle]);

  const startEditing = () => {
    if (!record) {
      return;
    }
    setEditTitlePt(record.editorial.title.pt);
    setEditTitleEn(record.editorial.title.en);
    setEditSubtitlePt(record.editorial.subtitle.pt);
    setEditSubtitleEn(record.editorial.subtitle.en);
    setEditDepartmentId(record.classification.departmentId);
    setEditStudioBase(record.location.studioBase);
    setEditPhasePt(record.lifecycle.phase.pt);
    setEditPhaseEn(record.lifecycle.phase.en);
    setEditStatus(
      record.lifecycle.projectStatus === 'archived'
        ? 'in_progress'
        : record.lifecycle.projectStatus,
    );
    setEditReviewState(record.review.reviewState);
    setEditLeadUserId(record.ownership.leadUserId);
    setEditScale(record.classification.scale);
    setEditAreaSqm(record.classification.areaSqm);
    setEditMilestoneTitlePt(record.schedule.nextMilestone.title.pt);
    setEditMilestoneDateIso(record.schedule.nextMilestone.dateIso);
    setEditNotesPt(record.editorial.dossierNotes.pt);
    setSavedNotice(false);
    setIsEditing(true);
  };

  if (!currentUser) {
    return null;
  }

  if (!record) {
    return (
      <div className="w-full max-w-[920px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
          404 · {dict.dossier.eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-light text-white">
          {dict.dossier.notFoundTitle}
        </h1>
        <p className="text-sm text-[#CCCCCC]">{dict.dossier.notFoundBody}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/workspace/projects"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.dossier.backToCatalog}</span>
          </Link>
          <Link
            to="/workspace/projects/new"
            className="min-h-[44px] px-4 py-2.5 border border-[#A65D4A] bg-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-[#050505] inline-flex items-center transition-colors"
          >
            {dict.dossier.createProjectLink}
          </Link>
        </div>
      </div>
    );
  }

  const department = DEPARTMENTS[record.classification.departmentId];
  const isArchived =
    record.metadata.isArchived ||
    record.lifecycle.projectStatus === 'archived';

  const handleSaveMetadata = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMetadata(record.identity.id, {
      title: {
        pt: editTitlePt.trim() || record.editorial.title.pt,
        en: editTitleEn.trim() || editTitlePt.trim() || record.editorial.title.en,
      },
      subtitle: {
        pt: editSubtitlePt.trim() || record.editorial.subtitle.pt,
        en:
          editSubtitleEn.trim() ||
          editSubtitlePt.trim() ||
          record.editorial.subtitle.en,
      },
      departmentId: editDepartmentId,
      studioBase: editStudioBase,
      phase: {
        pt: editPhasePt.trim() || record.lifecycle.phase.pt,
        en: editPhaseEn.trim() || editPhasePt.trim() || record.lifecycle.phase.en,
      },
      projectStatus: isArchived ? 'archived' : editStatus,
      reviewState: editReviewState,
      leadUserId: editLeadUserId,
      scale: editScale.trim() || record.classification.scale,
      areaSqm: editAreaSqm.trim() || record.classification.areaSqm,
      nextMilestone: {
        title: {
          pt:
            editMilestoneTitlePt.trim() ||
            record.schedule.nextMilestone.title.pt,
          en:
            editMilestoneTitlePt.trim() ||
            record.schedule.nextMilestone.title.en,
        },
        dateIso: editMilestoneDateIso || record.schedule.nextMilestone.dateIso,
      },
      dossierNotes: {
        pt: editNotesPt.trim(),
        en: editNotesPt.trim() || record.editorial.dossierNotes.en,
      },
    });
    setIsEditing(false);
    setSavedNotice(true);
  };

  const handleAddRevision = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!revSummary.trim()) {
      return;
    }
    addRevision(record.identity.id, {
      versionLabel: revVersion.trim() || `v0${record.revisions.length + 1}`,
      summaryPt: revSummary.trim(),
      reviewState: revReviewState,
    });
    setRevVersion('');
    setRevSummary('');
  };

  const handleAddFileReference = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fileName.trim()) {
      return;
    }
    addFileReference(record.identity.id, {
      fileName: fileName.trim(),
      kind: fileKind,
      versionLabel: fileVersion.trim() || 'v01',
      notePt: fileNote.trim() || undefined,
    });
    setFileName('');
    setFileNote('');
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-8">
      {/* Top Return & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/workspace/projects"
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-[#CCCCCC] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>{dict.dossier.backToCatalog}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {record.metadata.origin === 'seed-fixture' && (
            <Link
              to={`/workspace?project=${record.identity.id}`}
              className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#121212] hover:border-[#A65D4A] text-xs font-mono uppercase tracking-[0.12em] text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{dict.dossier.openInDesk}</span>
              <ArrowUpRight size={13} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}

          <Link
            to={`/workspace/projects/${record.identity.id}/model`}
            className="min-h-[44px] px-3.5 py-2 border border-dashed border-white/25 bg-[#121212] hover:border-[#CE826D] text-xs font-mono uppercase tracking-[0.12em] text-[#CCCCCC] hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            <Box size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.dossier.openModelFuture}</span>
          </Link>
        </div>
      </div>

      {/* Dossier Header */}
      <header className="pb-6 oa-hairline-b space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.16em]">
          <span className="text-[#CE826D] font-semibold">
            {record.identity.code}
          </span>
          <span className="border border-white/16 bg-[#141414] px-2 py-0.5 text-[#D8D8D8]">
            {record.metadata.origin === 'local-created'
              ? dict.dossier.originLocalLabel
              : dict.dossier.originSeedLabel}
          </span>
          <span className="border border-white/16 bg-[#141414] px-2 py-0.5 text-[#D8D8D8]">
            {dict.enums.projectStatus[record.lifecycle.projectStatus]}
          </span>
          <span className="border border-[#A65D4A]/45 bg-[#1B1210] px-2 py-0.5 text-[#F0D3CA] inline-flex items-center gap-1">
            <Lock size={11} strokeWidth={1.5} aria-hidden="true" />
            <span>
              {dict.enums.publicationStatus[record.publication.publicationStatus]}
            </span>
          </span>
          {isArchived && (
            <span className="border border-white/25 bg-[#1C1C1C] px-2 py-0.5 text-white">
              {dict.dossier.archivedBadge}
            </span>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight">
          {pickLocalized(record.editorial.title, language)}
        </h1>
        <p className="text-sm text-[#CCCCCC] max-w-[76ch] leading-relaxed">
          {pickLocalized(record.editorial.subtitle, language)}
        </p>
        <p className="text-xs text-[#9E9E9E]">
          {dict.dossier.privacyIndependenceNote}
        </p>
      </header>

      {savedNotice && (
        <div
          role="status"
          className="border border-[#3E6B52] bg-[#101C16] px-4 py-3 text-xs text-[#C6E8D5] flex items-center gap-2"
        >
          <Check size={14} strokeWidth={2} aria-hidden="true" />
          <span>{dict.dossier.savedBanner}</span>
        </div>
      )}

      {/* Metadata & Operations Section */}
      <section
        aria-labelledby="dossier-metadata-heading"
        className="border border-white/14 bg-[#101010] p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="dossier-metadata-heading"
            className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4D4D4]"
          >
            {dict.dossier.metadataSectionTitle}
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#151515] hover:border-[#A65D4A] text-xs font-mono uppercase tracking-[0.12em] text-white inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit3 size={13} strokeWidth={1.5} aria-hidden="true" />
                <span>{dict.dossier.editMetadataCta}</span>
              </button>
            )}

            {isArchived ? (
              <button
                type="button"
                onClick={() => restore(record.identity.id, 'in_progress')}
                className="min-h-[44px] px-4 py-2 border border-[#3E6B52] bg-[#101C16] hover:bg-[#16281F] text-xs font-mono uppercase tracking-[0.12em] text-[#C6E8D5] inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArchiveRestore size={14} strokeWidth={1.5} aria-hidden="true" />
                <span>{dict.dossier.restoreCta}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => archive(record.identity.id)}
                className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#151515] hover:border-[#CE826D] text-xs font-mono uppercase tracking-[0.12em] text-[#E0E0E0] inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Archive size={14} strokeWidth={1.5} aria-hidden="true" />
                <span>{dict.dossier.archiveCta}</span>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveMetadata} className="space-y-4 pt-2 oa-hairline-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="oa-edit-title-pt"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.titlePt}
                </label>
                <input
                  id="oa-edit-title-pt"
                  type="text"
                  value={editTitlePt}
                  onChange={(e) => setEditTitlePt(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>
              <div>
                <label
                  htmlFor="oa-edit-title-en"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.titleEn}
                </label>
                <input
                  id="oa-edit-title-en"
                  type="text"
                  value={editTitleEn}
                  onChange={(e) => setEditTitleEn(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>
              <div>
                <label
                  htmlFor="oa-edit-subtitle-pt"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.subtitlePt}
                </label>
                <input
                  id="oa-edit-subtitle-pt"
                  type="text"
                  value={editSubtitlePt}
                  onChange={(e) => setEditSubtitlePt(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>
              <div>
                <label
                  htmlFor="oa-edit-subtitle-en"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.subtitleEn}
                </label>
                <input
                  id="oa-edit-subtitle-en"
                  type="text"
                  value={editSubtitleEn}
                  onChange={(e) => setEditSubtitleEn(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-edit-department"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.department}
                </label>
                <select
                  id="oa-edit-department"
                  value={editDepartmentId}
                  onChange={(e) =>
                    setEditDepartmentId(e.target.value as DepartmentId)
                  }
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                >
                  {Object.values(DEPARTMENTS).map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} · {pickLocalized(dept.name, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-edit-base"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.studioBase}
                </label>
                <select
                  id="oa-edit-base"
                  value={editStudioBase}
                  onChange={(e) =>
                    setEditStudioBase(e.target.value as ProjectStudioBase)
                  }
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                >
                  <option value="Maputo">Maputo</option>
                  <option value="Milão">Milão</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-edit-phase"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.phase} (PT)
                </label>
                <input
                  id="oa-edit-phase"
                  type="text"
                  value={editPhasePt}
                  onChange={(e) => setEditPhasePt(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-edit-status"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.status}
                </label>
                <select
                  id="oa-edit-status"
                  disabled={isArchived}
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value as Exclude<ProjectStatus, 'archived'>,
                    )
                  }
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white disabled:opacity-60 focus:outline-none focus:border-[#CE826D]"
                >
                  {EDITABLE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {dict.enums.projectStatus[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-edit-review"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.reviewState}
                </label>
                <select
                  id="oa-edit-review"
                  value={editReviewState}
                  onChange={(e) =>
                    setEditReviewState(e.target.value as DeskReviewState)
                  }
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                >
                  {REVIEW_STATES.map((state) => (
                    <option key={state} value={state}>
                      {dict.enums.reviewState[state]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-edit-lead"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.lead}
                </label>
                <select
                  id="oa-edit-lead"
                  value={editLeadUserId}
                  onChange={(e) => setEditLeadUserId(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                >
                  {DEMO_USERS.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.code} · {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-edit-milestone-title"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.milestone}
                </label>
                <input
                  id="oa-edit-milestone-title"
                  type="text"
                  value={editMilestoneTitlePt}
                  onChange={(e) => setEditMilestoneTitlePt(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-edit-milestone-date"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.milestoneDate}
                </label>
                <input
                  id="oa-edit-milestone-date"
                  type="date"
                  value={editMilestoneDateIso}
                  onChange={(e) => setEditMilestoneDateIso(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs font-mono text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-edit-scale"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.scale}
                </label>
                <input
                  id="oa-edit-scale"
                  type="text"
                  value={editScale}
                  onChange={(e) => setEditScale(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs font-mono text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-edit-area"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.create.fields.areaSqm}
                </label>
                <input
                  id="oa-edit-area"
                  type="text"
                  value={editAreaSqm}
                  onChange={(e) => setEditAreaSqm(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs font-mono text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="oa-edit-notes"
                  className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
                >
                  {dict.dossier.labels.notes}
                </label>
                <textarea
                  id="oa-edit-notes"
                  rows={3}
                  value={editNotesPt}
                  onChange={(e) => setEditNotesPt(e.target.value)}
                  className="w-full px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#141414] text-xs font-mono uppercase tracking-[0.14em] text-[#E0E0E0] cursor-pointer"
              >
                {dict.dossier.cancelEditCta}
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#B86A56] text-xs font-mono uppercase tracking-[0.14em] text-[#050505] font-medium cursor-pointer"
              >
                {dict.dossier.saveMetadataCta}
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 oa-hairline-t text-xs">
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.department}
              </dt>
              <dd className="text-white mt-1">
                {department.code} · {pickLocalized(department.name, language)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.studioBase}
              </dt>
              <dd className="text-white mt-1">{record.location.studioBase}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.phase}
              </dt>
              <dd className="text-white mt-1">
                {pickLocalized(record.lifecycle.phase, language)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.status}
              </dt>
              <dd className="text-white mt-1">
                {dict.enums.projectStatus[record.lifecycle.projectStatus]}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.publication}
              </dt>
              <dd className="text-[#F0D3CA] mt-1">
                {
                  dict.enums.publicationStatus[
                    record.publication.publicationStatus
                  ]
                }
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.reviewState}
              </dt>
              <dd className="text-white mt-1">
                {dict.enums.reviewState[record.review.reviewState]}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.lead}
              </dt>
              <dd className="text-white mt-1">
                {record.ownership.leadAuthorCode} ·{' '}
                {record.ownership.leadAuthorName}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.scaleArea}
              </dt>
              <dd className="text-white font-mono mt-1">
                {record.classification.scale} · {record.classification.areaSqm} ·{' '}
                {record.classification.elevationDatum}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.milestone}
              </dt>
              <dd className="text-white mt-1">
                {pickLocalized(record.schedule.nextMilestone.title, language)} (
                {record.schedule.nextMilestone.dateIso})
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 pt-2 oa-hairline-t">
              <dt className="text-[11px] font-mono uppercase text-[#9E9E9E]">
                {dict.dossier.labels.notes}
              </dt>
              <dd className="text-[#E0E0E0] mt-1 leading-relaxed">
                {pickLocalized(record.editorial.dossierNotes, language)}
              </dd>
            </div>
          </dl>
        )}
      </section>

      {/* Revisions & File References Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revisions History + Add Revision */}
        <section
          aria-labelledby="dossier-revisions-heading"
          className="border border-white/14 bg-[#101010] p-5 space-y-5"
        >
          <h2
            id="dossier-revisions-heading"
            className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4D4D4] flex items-center gap-2"
          >
            <GitCommitHorizontal
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-[#CE826D]"
            />
            <span>{dict.dossier.revisionsTitle}</span>
          </h2>

          <ul className="space-y-3">
            {record.revisions.map((rev) => (
              <li
                key={rev.id}
                className="border border-white/12 bg-[#0B0B0B] p-3 space-y-1.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-[#CE826D] font-semibold">
                    {rev.versionLabel}
                  </span>
                  <span className="text-[#9E9E9E]">
                    {dict.enums.reviewState[rev.reviewState]}
                  </span>
                </div>
                <p className="text-[#E6E6E6]">
                  {pickLocalized(rev.summary, language)}
                </p>
                <p className="text-[11px] text-[#9E9E9E] font-mono">
                  {rev.authorName} · {rev.createdAtIso.slice(0, 10)}
                </p>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleAddRevision}
            className="pt-4 oa-hairline-t space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="oa-rev-version"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
                >
                  {dict.dossier.revisionVersionLabel}
                </label>
                <input
                  id="oa-rev-version"
                  type="text"
                  value={revVersion}
                  onChange={(e) => setRevVersion(e.target.value)}
                  placeholder={`v0${record.revisions.length + 1}`}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs font-mono text-white placeholder:text-[#787878] focus:outline-none focus:border-[#CE826D]"
                />
              </div>
              <div>
                <label
                  htmlFor="oa-rev-review"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
                >
                  {dict.dossier.revisionReviewLabel}
                </label>
                <select
                  id="oa-rev-review"
                  value={revReviewState}
                  onChange={(e) =>
                    setRevReviewState(e.target.value as DeskReviewState)
                  }
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                >
                  {REVIEW_STATES.map((state) => (
                    <option key={state} value={state}>
                      {dict.enums.reviewState[state]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="oa-rev-summary"
                className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
              >
                {dict.dossier.revisionSummaryLabel}
              </label>
              <input
                id="oa-rev-summary"
                type="text"
                value={revSummary}
                onChange={(e) => setRevSummary(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
              />
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#161616] hover:border-[#A65D4A] text-xs font-mono uppercase tracking-[0.14em] text-white cursor-pointer transition-colors"
            >
              {dict.dossier.addRevisionCta}
            </button>
          </form>
        </section>

        {/* Fictive File References + Add File Metadata */}
        <section
          aria-labelledby="dossier-files-heading"
          className="border border-white/14 bg-[#101010] p-5 space-y-5"
        >
          <div className="space-y-1">
            <h2
              id="dossier-files-heading"
              className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4D4D4] flex items-center gap-2"
            >
              <FilePlus2
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className="text-[#CE826D]"
              />
              <span>{dict.dossier.filesTitle}</span>
            </h2>
            <p className="text-[11px] text-[#9E9E9E]">
              {dict.dossier.filesHonestNote}
            </p>
          </div>

          <ul className="space-y-3">
            {record.files.map((file) => (
              <li
                key={file.id}
                className="border border-white/12 bg-[#0B0B0B] p-3 space-y-1 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-white font-medium">{file.fileName}</span>
                  <span className="text-[#CE826D]">
                    {file.formatLabel} · {file.versionLabel}
                  </span>
                </div>
                <p className="text-[11px] text-[#BDBDBD]">
                  {dict.enums.fileKind[file.kind]} · {file.addedByName}
                </p>
                <p className="text-[11px] text-[#9E9E9E]">
                  {pickLocalized(file.note, language)}
                </p>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleAddFileReference}
            className="pt-4 oa-hairline-t space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="oa-file-name"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
                >
                  {dict.dossier.fileNameLabel}
                </label>
                <input
                  id="oa-file-name"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="planta-terreo-v03.pdf"
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs font-mono text-white placeholder:text-[#787878] focus:outline-none focus:border-[#CE826D]"
                />
              </div>
              <div>
                <label
                  htmlFor="oa-file-kind"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
                >
                  {dict.dossier.fileKindLabel}
                </label>
                <select
                  id="oa-file-kind"
                  value={fileKind}
                  onChange={(e) =>
                    setFileKind(e.target.value as ProjectFileKind)
                  }
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                >
                  {FILE_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {dict.enums.fileKind[kind]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="oa-file-version"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
                >
                  {dict.dossier.fileVersionLabel}
                </label>
                <input
                  id="oa-file-version"
                  type="text"
                  value={fileVersion}
                  onChange={(e) => setFileVersion(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs font-mono text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>
              <div>
                <label
                  htmlFor="oa-file-note"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8] mb-1"
                >
                  {dict.dossier.fileNoteLabel}
                </label>
                <input
                  id="oa-file-note"
                  type="text"
                  value={fileNote}
                  onChange={(e) => setFileNote(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#161616] hover:border-[#A65D4A] text-xs font-mono uppercase tracking-[0.14em] text-white cursor-pointer transition-colors"
            >
              {dict.dossier.addFileCta}
            </button>
          </form>
        </section>
      </div>

      {/* Deliverables Section */}
      {record.deliverables.length > 0 && (
        <section
          aria-labelledby="dossier-deliverables-heading"
          className="border border-white/14 bg-[#101010] p-5 space-y-4"
        >
          <h2
            id="dossier-deliverables-heading"
            className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4D4D4]"
          >
            {dict.dossier.deliverablesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {record.deliverables.map((deliv) => (
              <div
                key={deliv.id}
                className="border border-white/12 bg-[#0B0B0B] p-3 space-y-1 text-xs"
              >
                <p className="text-[11px] font-mono text-[#CE826D]">
                  {deliv.code}
                </p>
                <p className="text-white font-medium">
                  {pickLocalized(deliv.label, language)}
                </p>
                <p className="text-[11px] text-[#9E9E9E] uppercase font-mono">
                  {deliv.ready
                    ? language === 'pt'
                      ? 'Pronto'
                      : 'Ready'
                    : language === 'pt'
                      ? 'Em curso'
                      : 'In progress'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
