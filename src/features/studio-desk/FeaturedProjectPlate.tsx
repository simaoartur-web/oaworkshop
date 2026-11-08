import { ArrowUpRight, Grid } from 'lucide-react';
import { pickLocalized } from '../../locales';
import type { StudioDeskProject } from '../../data/studioDeskTypes';
import type { AppLanguage, Role } from '../../data/types';
import type { StudioDeskDictionary } from './i18n';

interface FeaturedProjectPlateProps {
  project: StudioDeskProject;
  activeRole: Role;
  language: AppLanguage;
  deskDict: StudioDeskDictionary;
  showDatumOverlay: boolean;
  onToggleDatumOverlay: () => void;
  onInspectDossier: (project: StudioDeskProject) => void;
}

export function FeaturedProjectPlate({
  project,
  activeRole,
  language,
  deskDict,
  showDatumOverlay,
  onToggleDatumOverlay,
  onInspectDossier,
}: FeaturedProjectPlateProps) {
  const roleFocalNote = project.roleFocalNote[activeRole];

  return (
    <section
      aria-labelledby="featured-desk-project-title"
      className="border border-white/12 bg-[#080808]"
    >
      {/* Top Drafting Plate Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-[#0D0D0D] oa-hairline-b">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] uppercase tracking-[0.20em]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 bg-[#A65D4A] inline-block"
          />
          <span className="font-semibold text-white">{project.code}</span>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span className="text-[#BDBDBD]">{deskDict.featured.sectionLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-[#A65D4A]/65 bg-[#161616] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-[#F5F5F5]">
            {deskDict.featured.demoTag}
          </span>
          <button
            type="button"
            onClick={onToggleDatumOverlay}
            aria-pressed={showDatumOverlay}
            className="min-h-[44px] px-3 border border-white/14 bg-[#141414] hover:border-white/35 text-[11px] uppercase tracking-[0.15em] text-[#E0E0E0] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Grid size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>
              {showDatumOverlay
                ? deskDict.featured.toggleDatumOn
                : deskDict.featured.toggleDatumOff}
            </span>
          </button>
        </div>
      </div>

      {/* Asymmetric 12-Column Architectural Plate */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Columns: Optimized Architectural Image + Toggleable Datum Overlay */}
        <div className="lg:col-span-7 relative bg-[#050505] lg:border-r border-white/10">
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <img
              src={project.imageSrc}
              alt={pickLocalized(project.imageAlt, language)}
              className="h-full w-full object-cover object-center"
              loading="eager"
              decoding="sync"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#050505]/45"
            />

            {showDatumOverlay && (
              <svg
                aria-hidden="true"
                viewBox="0 0 800 500"
                className="absolute inset-0 h-full w-full pointer-events-none"
                fill="none"
              >
                <line
                  x1="60"
                  y1="0"
                  x2="60"
                  y2="500"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <line
                  x1="740"
                  y1="0"
                  x2="740"
                  y2="500"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <line
                  x1="0"
                  y1="88"
                  x2="800"
                  y2="88"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="1"
                />
                <g transform="translate(696, 42)">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="1"
                  />
                  <line
                    x1="18"
                    y1="18"
                    x2="18"
                    y2="4"
                    stroke="#A65D4A"
                    strokeWidth="2"
                  />
                </g>
                <text
                  x="76"
                  y="66"
                  fill="#F5F5F5"
                  fontSize="10.5"
                  fontFamily="Outfit, sans-serif"
                  letterSpacing="2"
                >
                  {project.elevationDatum} · {deskDict.featured.scaleLabel.toUpperCase()}{' '}
                  {project.scale} · {project.studioBase.toUpperCase()}
                </text>
              </svg>
            )}

            {/* Desktop/Tablet Status Strip anchored cleanly above gradient scrim */}
            <div className="hidden sm:flex absolute bottom-3.5 left-5 right-5 flex-wrap items-center gap-2">
              <span className="bg-[#111111]/92 border border-white/20 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white">
                {deskDict.overview.reviewStateLabels[project.reviewState]}
              </span>
              <span className="bg-[#111111]/92 border border-[#A65D4A]/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E0E0E0]">
                {deskDict.overview.publicationLabels[project.publicationStatus]}
              </span>
            </div>
          </div>

          {/* Mobile Status Strip below photo (<640px) */}
          <div className="sm:hidden flex flex-wrap items-center gap-2 px-4 py-3 bg-[#0D0D0D] oa-hairline-t oa-hairline-b">
            <span className="border border-white/20 bg-[#141414] px-2.5 py-1 text-[11px] uppercase tracking-[0.13em] text-white">
              {deskDict.overview.reviewStateLabels[project.reviewState]}
            </span>
            <span className="border border-[#A65D4A]/70 bg-[#141414] px-2.5 py-1 text-[11px] uppercase tracking-[0.13em] text-[#E0E0E0]">
              {deskDict.overview.publicationLabels[project.publicationStatus]}
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Technical Dossier Summary & Role Focal Callout */}
        <div className="lg:col-span-5 min-w-0 p-5 sm:p-7 flex flex-col justify-between gap-5 bg-[#0D0D0D]">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
                {pickLocalized(project.discipline, language)} · {project.studioBase}
              </p>
              <h2
                id="featured-desk-project-title"
                className="mt-1.5 text-xl sm:text-2xl font-light tracking-tight leading-snug text-white"
              >
                {pickLocalized(project.title, language)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#BDBDBD]">
                {pickLocalized(project.subtitle, language)}
              </p>
            </div>

            {/* Key Project Metrics Ledger (Tabular Numbers, Hairline Grid) */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 py-4 oa-hairline-t oa-hairline-b">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                  {deskDict.featured.phaseLabel}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-medium text-white">
                  {pickLocalized(project.phase, language)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                  {deskDict.featured.reviewStateLabel}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-medium text-white">
                  {deskDict.overview.reviewStateLabels[project.reviewState]}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                  {deskDict.featured.scaleLabel} / {deskDict.featured.areaLabel}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-medium text-[#E0E0E0] tabular-nums">
                  {project.scale} · {project.areaSqm}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-[#9E9E9E]">
                  {deskDict.featured.leadLabel}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-medium text-[#E0E0E0]">
                  {project.leadAuthorName}
                </dd>
              </div>
            </dl>

            {/* Next Milestone Strip */}
            <div className="border border-white/12 bg-[#141414] px-3.5 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em]">
                <span className="text-[#BDBDBD]">
                  {deskDict.featured.nextMilestoneLabel}
                </span>
                <span className="font-medium text-white tabular-nums">
                  {pickLocalized(project.nextMilestone.dateLabel, language)}
                </span>
              </div>
              <p className="mt-1 text-sm text-white leading-snug">
                {pickLocalized(project.nextMilestone.title, language)}
              </p>
            </div>

            {/* Role-Specific Editorial Note */}
            {roleFocalNote && (
              <div className="border-l-2 border-[#A65D4A] bg-white/[0.025] pl-3.5 py-2">
                <p className="text-xs sm:text-[13px] leading-relaxed text-[#E0E0E0]">
                  {pickLocalized(roleFocalNote, language)}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onInspectDossier(project)}
            className="w-full min-h-[48px] px-5 py-3 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.18em] text-white inline-flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>{deskDict.featured.openDetailsCta}</span>
            <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
