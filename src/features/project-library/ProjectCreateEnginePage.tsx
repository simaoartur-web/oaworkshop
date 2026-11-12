import { ArrowLeft, Lock, Plus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import type {
  ProjectFileKind,
  ProjectStudioBase,
} from '../../data/projectLibraryTypes';
import type { DepartmentId, ProjectStatus } from '../../data/types';
import { pickLocalized } from '../../locales';
import { PROJECT_LIBRARY_I18N } from './i18n';
import { useProjectLibrary } from './useProjectLibrary';

const INITIAL_STATUSES: Exclude<ProjectStatus, 'archived'>[] = [
  'concept',
  'design',
  'in_progress',
  'review',
  'completed',
];

const FILE_KINDS: ProjectFileKind[] = [
  'drawing',
  'model_3d',
  'source_skp',
  'specification',
  'photographic_log',
];

export function ProjectCreateEnginePage() {
  const { currentUser, language } = useWorkspaceSession();
  const { create } = useProjectLibrary();
  const navigate = useNavigate();
  const dict = PROJECT_LIBRARY_I18N[language];

  const [code, setCode] = useState('');
  const [titlePt, setTitlePt] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitlePt, setSubtitlePt] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>(
    currentUser?.departmentId ?? 'architecture',
  );
  const [disciplinePt, setDisciplinePt] = useState('Arquitectura');
  const [studioBase, setStudioBase] = useState<ProjectStudioBase>(
    currentUser?.studioBase ?? 'Maputo',
  );
  const [phasePt, setPhasePt] = useState('Estudo Prévio');
  const [projectStatus, setProjectStatus] =
    useState<Exclude<ProjectStatus, 'archived'>>('concept');
  const [leadUserId, setLeadUserId] = useState(
    currentUser?.id ?? DEMO_USERS[0].id,
  );
  const [scale, setScale] = useState('1:100');
  const [areaSqm, setAreaSqm] = useState('1 200 m²');
  const [elevationDatum, setElevationDatum] = useState('+8.0 m');
  const [milestoneTitlePt, setMilestoneTitlePt] = useState('');
  const [milestoneDateIso, setMilestoneDateIso] = useState('2026-06-15');
  const [initialFileName, setInitialFileName] = useState('');
  const [initialFileKind, setInitialFileKind] =
    useState<ProjectFileKind>('drawing');
  const [dossierNotesPt, setDossierNotesPt] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = dict.create.pageTitle;
  }, [dict.create.pageTitle]);

  if (!currentUser) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!titlePt.trim()) {
      setErrorMessage(dict.create.errors.titleRequired);
      return;
    }
    if (!subtitlePt.trim()) {
      setErrorMessage(dict.create.errors.subtitleRequired);
      return;
    }
    if (!milestoneTitlePt.trim()) {
      setErrorMessage(dict.create.errors.milestoneRequired);
      return;
    }

    const created = create({
      code: code.trim() || undefined,
      titlePt: titlePt.trim(),
      titleEn: titleEn.trim() || undefined,
      subtitlePt: subtitlePt.trim(),
      subtitleEn: subtitleEn.trim() || undefined,
      departmentId,
      disciplinePt: disciplinePt.trim() || 'Arquitectura',
      studioBase,
      phasePt: phasePt.trim() || 'Estudo Prévio',
      projectStatus,
      leadUserId,
      scale: scale.trim() || '1:100',
      areaSqm: areaSqm.trim() || '—',
      elevationDatum: elevationDatum.trim() || '—',
      nextMilestoneTitlePt: milestoneTitlePt.trim(),
      nextMilestoneDateIso: milestoneDateIso || '2026-06-15',
      initialFileName: initialFileName.trim() || undefined,
      initialFileKind,
      dossierNotesPt: dossierNotesPt.trim() || undefined,
    });

    navigate(`/workspace/projects/${created.identity.id}`);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
      <div>
        <Link
          to="/workspace/projects"
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-[#CCCCCC] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>{dict.create.backToCatalog}</span>
        </Link>
      </div>

      <header className="pb-5 oa-hairline-b space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
          {dict.create.eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight">
          {dict.create.heading}
        </h1>
        <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
          {dict.create.subtitle}
        </p>
      </header>

      {/* Privacy Enforcement Banner */}
      <aside
        aria-label={dict.create.privacyBannerTitle}
        className="border border-[#A65D4A]/45 bg-[#1B1210] p-4 flex items-start gap-3"
      >
        <Lock
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className="text-[#CE826D] shrink-0 mt-0.5"
        />
        <div className="space-y-1 text-xs">
          <p className="font-mono uppercase tracking-[0.14em] text-[#F0D3CA]">
            {dict.create.privacyBannerTitle}
          </p>
          <p className="text-[#E0E0E0] leading-relaxed">
            {dict.create.privacyBannerBody}
          </p>
        </div>
      </aside>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="border border-white/14 bg-[#101010] p-5 sm:p-6 space-y-6"
      >
        {errorMessage && (
          <div
            role="alert"
            className="border border-[#CE826D] bg-[#241310] px-4 py-3 text-xs text-[#F5D2C7]"
          >
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="oa-create-code"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.code}
            </label>
            <input
              id="oa-create-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="OA-26-124"
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm font-mono text-white placeholder:text-[#787878] focus:outline-none focus:border-[#CE826D]"
            />
            <p className="text-[11px] text-[#9E9E9E] mt-1">
              {dict.create.fields.codeHint}
            </p>
          </div>

          <div>
            <label
              htmlFor="oa-create-title-pt"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.titlePt}
            </label>
            <input
              id="oa-create-title-pt"
              type="text"
              required
              value={titlePt}
              onChange={(event) => setTitlePt(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-title-en"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.titleEn}
            </label>
            <input
              id="oa-create-title-en"
              type="text"
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-subtitle-pt"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.subtitlePt}
            </label>
            <input
              id="oa-create-subtitle-pt"
              type="text"
              required
              value={subtitlePt}
              onChange={(event) => setSubtitlePt(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-subtitle-en"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.subtitleEn}
            </label>
            <input
              id="oa-create-subtitle-en"
              type="text"
              value={subtitleEn}
              onChange={(event) => setSubtitleEn(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-department"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.department}
            </label>
            <select
              id="oa-create-department"
              value={departmentId}
              onChange={(event) =>
                setDepartmentId(event.target.value as DepartmentId)
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
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
              htmlFor="oa-create-discipline"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.disciplinePt}
            </label>
            <input
              id="oa-create-discipline"
              type="text"
              value={disciplinePt}
              onChange={(event) => setDisciplinePt(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-base"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.studioBase}
            </label>
            <select
              id="oa-create-base"
              value={studioBase}
              onChange={(event) =>
                setStudioBase(event.target.value as ProjectStudioBase)
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            >
              <option value="Maputo">Maputo</option>
              <option value="Milão">Milão</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="oa-create-phase"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.phasePt}
            </label>
            <input
              id="oa-create-phase"
              type="text"
              value={phasePt}
              onChange={(event) => setPhasePt(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-status"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.projectStatus}
            </label>
            <select
              id="oa-create-status"
              value={projectStatus}
              onChange={(event) =>
                setProjectStatus(
                  event.target.value as Exclude<ProjectStatus, 'archived'>,
                )
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            >
              {INITIAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {dict.enums.projectStatus[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="oa-create-lead"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.leadUser}
            </label>
            <select
              id="oa-create-lead"
              value={leadUserId}
              onChange={(event) => setLeadUserId(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            >
              {DEMO_USERS.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.code} · {member.name} ({member.studioBase})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scale / Area / Datum */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 oa-hairline-t">
          <div>
            <label
              htmlFor="oa-create-scale"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.scale}
            </label>
            <input
              id="oa-create-scale"
              type="text"
              value={scale}
              onChange={(event) => setScale(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>
          <div>
            <label
              htmlFor="oa-create-area"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.areaSqm}
            </label>
            <input
              id="oa-create-area"
              type="text"
              value={areaSqm}
              onChange={(event) => setAreaSqm(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>
          <div>
            <label
              htmlFor="oa-create-datum"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.elevationDatum}
            </label>
            <input
              id="oa-create-datum"
              type="text"
              value={elevationDatum}
              onChange={(event) => setElevationDatum(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>
        </div>

        {/* Next Milestone & Initial Fictive File Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 oa-hairline-t">
          <div>
            <label
              htmlFor="oa-create-milestone-title"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.milestoneTitlePt}
            </label>
            <input
              id="oa-create-milestone-title"
              type="text"
              required
              value={milestoneTitlePt}
              onChange={(event) => setMilestoneTitlePt(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-milestone-date"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.milestoneDate}
            </label>
            <input
              id="oa-create-milestone-date"
              type="date"
              value={milestoneDateIso}
              onChange={(event) => setMilestoneDateIso(event.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-file-name"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.initialFileName}
            </label>
            <input
              id="oa-create-file-name"
              type="text"
              value={initialFileName}
              onChange={(event) => setInitialFileName(event.target.value)}
              placeholder="corte-estudo-v01.pdf"
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm font-mono text-white placeholder:text-[#787878] focus:outline-none focus:border-[#CE826D]"
            />
          </div>

          <div>
            <label
              htmlFor="oa-create-file-kind"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.initialFileKind}
            </label>
            <select
              id="oa-create-file-kind"
              value={initialFileKind}
              onChange={(event) =>
                setInitialFileKind(event.target.value as ProjectFileKind)
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            >
              {FILE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {dict.enums.fileKind[kind]}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="oa-create-notes"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] mb-1.5"
            >
              {dict.create.fields.dossierNotesPt}
            </label>
            <textarea
              id="oa-create-notes"
              rows={3}
              value={dossierNotesPt}
              onChange={(event) => setDossierNotesPt(event.target.value)}
              className="w-full px-3 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white focus:outline-none focus:border-[#CE826D]"
            />
          </div>
        </div>

        <div className="pt-4 oa-hairline-t flex flex-wrap items-center justify-end gap-3">
          <Link
            to="/workspace/projects"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] inline-flex items-center transition-colors"
          >
            {dict.create.cancelCta}
          </Link>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#B86A56] text-xs font-medium uppercase tracking-[0.14em] text-[#050505] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            <span>{dict.create.submitCta}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
