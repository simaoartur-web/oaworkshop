import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  DEMO_USERS,
  DEPARTMENTS,
  FEATURED_STUDY_PROJECT,
} from '../../data/fixtures';
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
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8">
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

      {/* Contextual Local Reference Already Available in Phase 00–02A */}
      {activeItem.id === 'departments' && (
        <section
          aria-labelledby="planned-ref-heading"
          className="space-y-4"
        >
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

      {activeItem.id === 'projects' && (
        <section aria-labelledby="planned-ref-heading" className="space-y-4">
          <h2
            id="planned-ref-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-[#BDBDBD]"
          >
            {t.shell.planned.referenceDataLabel}
          </h2>
          <div className="border border-white/12 bg-[#121212] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <img
              src={FEATURED_STUDY_PROJECT.maquetteImageSrc}
              alt={pickLocalized(FEATURED_STUDY_PROJECT.maquetteImageAlt, language)}
              className="md:col-span-5 w-full aspect-[16/10] object-cover bg-[#050505]"
            />
            <div className="md:col-span-7 space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#A65D4A]">
                {FEATURED_STUDY_PROJECT.code} · {FEATURED_STUDY_PROJECT.scale}
              </p>
              <h3 className="text-xl font-light text-white">
                {pickLocalized(FEATURED_STUDY_PROJECT.title, language)}
              </h3>
              <p className="text-sm text-[#BDBDBD]">
                {pickLocalized(FEATURED_STUDY_PROJECT.subtitle, language)}
              </p>
              <p className="text-xs text-[#9E9E9E]">
                {pickLocalized(FEATURED_STUDY_PROJECT.location, language)} ·{' '}
                {FEATURED_STUDY_PROJECT.areaSqm}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
