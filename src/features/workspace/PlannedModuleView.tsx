import { ArrowLeft, ArrowUpRight, FolderKanban } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  DEMO_USERS,
  DEPARTMENTS,
  FEATURED_STUDY_PROJECT,
} from '../../data/fixtures';
import { STUDIO_DESK_PROJECTS } from '../../data/studioDeskFixtures';
import { pickLocalized } from '../../locales';
import { resolveActiveNavItem } from '../workspace-shell/shellNavigation';

export function PlannedModuleView() {
  const { language, t } = useWorkspaceSession();
  const location = useLocation();
  const activeItem = resolveActiveNavItem(location.pathname);

  useEffect(() => {
    const label = activeItem
      ? pickLocalized(activeItem.label, language)
      : t.shell.planned.routeNotFoundTitle;
    document.title = `${label} — ${t.shell.planned.pageTitleSuffix}`;
  }, [activeItem, language, t.shell.planned]);

  if (!activeItem) {
    return (
      <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#A65D4A]">
          404 · {t.common.axisLabel}
        </p>
        <h1 className="text-2xl sm:text-3xl font-light text-white">
          {t.shell.planned.routeNotFoundTitle}
        </h1>
        <Link
          to="/workspace"
          className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>{t.shell.planned.backToDesk}</span>
        </Link>
      </div>
    );
  }

  const label = pickLocalized(activeItem.label, language);
  const description = pickLocalized(activeItem.description, language);
  const targetPhase = pickLocalized(activeItem.targetPhase, language);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8">
      <header className="pb-6 oa-hairline-b space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.22em] text-[#A65D4A]">
          <span>
            {t.shell.activePlatePrefix} {activeItem.plateNumber}
          </span>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span>
            {t.shell.planned.badgePrefix} ({targetPhase})
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
          {label}
        </h1>
        <p className="text-sm sm:text-base text-[#BDBDBD] max-w-2xl">
          {description}
        </p>
      </header>

      {/* Honest Roadmap Status Sheet */}
      <section
        aria-labelledby="planned-status-heading"
        className="border border-white/14 bg-[#141414] p-5 sm:p-8 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 oa-hairline-b">
          <h2
            id="planned-status-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-white"
          >
            {t.shell.planned.honestNoticeTitle}
          </h2>
          <span className="border border-[#A65D4A]/60 bg-[#A65D4A]/14 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-white">
            {t.shell.planned.targetPhaseLabel}: {targetPhase}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-[#E0E0E0]">
          {t.shell.planned.honestNoticeBody}
        </p>

        <div className="pt-2">
          <Link
            to="/workspace"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#111111] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{t.shell.planned.backToDesk}</span>
          </Link>
        </div>
      </section>

      {/* Contextual Demonstration Catalog for /workspace/projects */}
      {activeItem.id === 'projects' && (
        <section aria-labelledby="planned-projects-heading" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="planned-projects-heading"
                className="text-xs font-medium uppercase tracking-[0.20em] text-[#BDBDBD]"
              >
                {t.shell.planned.studioProjectsCatalogHeading}
              </h2>
              <p className="text-xs text-[#9E9E9E] mt-1">
                {t.shell.planned.studioProjectsCatalogDesc}
              </p>
            </div>
            <Link
              to="/workspace"
              className="min-h-[40px] px-3.5 py-2 border border-white/14 bg-[#141414] hover:border-[#A65D4A] text-xs uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors"
            >
              <FolderKanban size={13} strokeWidth={1.5} aria-hidden="true" />
              <span>{t.shell.planned.openDeskViewCta}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDIO_DESK_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="border border-white/12 bg-[#101010] p-4 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em]">
                    <span className="font-mono font-semibold text-[#A65D4A]">
                      {proj.code}
                    </span>
                    <span className="text-[#9E9E9E]">
                      {proj.studioBase} · {proj.scale}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-light text-white leading-snug">
                      {pickLocalized(proj.title, language)}
                    </h3>
                    <p className="mt-1 text-xs text-[#BDBDBD] line-clamp-2">
                      {pickLocalized(proj.subtitle, language)}
                    </p>
                  </div>

                  <p className="text-[11px] font-mono text-[#9E9E9E]">
                    {pickLocalized(proj.phase, language)} · {pickLocalized(proj.discipline, language)}
                  </p>
                </div>

                <div className="pt-3 oa-hairline-t flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#9E9E9E]">
                    {proj.leadAuthorName}
                  </span>
                  <Link
                    to={`/workspace?project=${proj.id}`}
                    className="min-h-[36px] px-3 py-1.5 border border-white/14 bg-[#161616] hover:border-[#A65D4A] text-[11px] uppercase tracking-[0.12em] text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{t.shell.planned.openProjectInDeskAction}</span>
                    <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Reference to Archive Study OA-26-014 */}
          <div className="border border-white/10 bg-[#0C0C0C] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={FEATURED_STUDY_PROJECT.maquetteImageSrc}
              alt={pickLocalized(FEATURED_STUDY_PROJECT.maquetteImageAlt, language)}
              className="w-full sm:w-48 aspect-[16/10] object-cover bg-[#050505] shrink-0"
            />
            <div className="space-y-1 text-xs">
              <p className="font-mono uppercase tracking-[0.16em] text-[#A65D4A]">
                {FEATURED_STUDY_PROJECT.code} · {t.welcome.sheetCode}
              </p>
              <h4 className="text-sm font-medium text-white">
                {pickLocalized(FEATURED_STUDY_PROJECT.title, language)}
              </h4>
              <p className="text-[#BDBDBD]">
                {pickLocalized(FEATURED_STUDY_PROJECT.subtitle, language)}
              </p>
            </div>
          </div>
        </section>
      )}

      {activeItem.id === 'departments' && (
        <section aria-labelledby="planned-ref-heading" className="space-y-4">
          <h2
            id="planned-ref-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-[#BDBDBD]"
          >
            {t.shell.planned.referenceDataLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(DEPARTMENTS).map((dept) => (
              <div
                key={dept.id}
                className="border border-white/12 bg-[#121212] p-4 space-y-1.5"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#A65D4A]">
                  {dept.code}
                </p>
                <p className="text-sm font-medium text-white">
                  {pickLocalized(dept.name, language)}
                </p>
                <p className="text-xs leading-relaxed text-[#BDBDBD]">
                  {pickLocalized(dept.focus, language)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeItem.id === 'team' && (
        <section aria-labelledby="planned-ref-heading" className="space-y-4">
          <h2
            id="planned-ref-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-[#BDBDBD]"
          >
            {t.shell.planned.referenceDataLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_USERS.map((member) => (
              <div
                key={member.id}
                className="border border-white/12 bg-[#121212] p-4 space-y-1.5"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#A65D4A]">
                  {member.code} · {member.studioBase}
                </p>
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-[#BDBDBD]">
                  {pickLocalized(member.roleLabel, language)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
