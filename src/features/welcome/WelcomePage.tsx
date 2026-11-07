import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Grid,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  DEMO_USERS,
  DEPARTMENTS,
  FEATURED_STUDY_PROJECT,
} from '../../data/fixtures';
import { LanguageToggle } from '../../design-system/LanguageToggle';
import { OABrandMark } from '../../design-system/OABrandMark';
import { pickLocalized } from '../../locales';
import {
  formatEditorialDate,
  formatGreetingForTime,
  formatStudioClocks,
} from '../../utils/timeGreeting';

export function WelcomePage() {
  const {
    session,
    currentUser,
    preferences,
    language,
    t,
    switchRole,
    signOut,
    setLanguage,
    setSkipWelcomeOnLogin,
  } = useWorkspaceSession();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion =
    prefersReducedMotion || preferences.reduceMotionOverride === 'reduce';

  const [showPlanOverlay, setShowPlanOverlay] = useState<boolean>(true);
  const skipPrefInputId = useId();

  useEffect(() => {
    document.title = t.welcome.pageTitle;
  }, [t.welcome.pageTitle]);

  if (!session || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const department = DEPARTMENTS[currentUser.departmentId];
  const greeting = formatGreetingForTime(t);
  const formattedDate = formatEditorialDate(language);
  const clocks = formatStudioClocks();

  const handleEnterWorkspace = () => {
    navigate('/workspace');
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh w-full bg-[#111111] text-white flex flex-col">
      <a
        href="#welcome-main-sheet"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#A65D4A] focus:px-4 focus:py-2.5 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-white"
      >
        {t.common.skipToMain}
      </a>

      {/* TOP ARCHITECTURAL DATUM BAR — Fast-track & Session Controls immediately reachable */}
      <header className="w-full bg-[#0A0A0A] oa-hairline-b px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <OABrandMark subtitle={t.common.workspaceTitle} size="sm" />
            <span
              aria-hidden="true"
              className="hidden md:inline-block h-4 w-px bg-white/15"
            />
            <span className="hidden md:inline-block text-[11px] font-medium uppercase tracking-[0.22em] text-[#BDBDBD]">
              {t.welcome.sheetCode}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleEnterWorkspace}
              aria-label={t.welcome.fastTrackCta}
              className="min-h-[44px] px-3 sm:px-3.5 py-2 border border-white/18 bg-[#161616] hover:border-[#A65D4A] hover:text-white text-xs font-medium uppercase tracking-[0.16em] text-[#E0E0E0] inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">{t.welcome.fastTrackCta}</span>
              <span className="sm:hidden">Workspace</span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="text-[#A65D4A]"
                aria-hidden="true"
              />
            </button>

            <LanguageToggle
              language={language}
              onChange={setLanguage}
              ptAriaLabel={t.common.switchToPt}
              enAriaLabel={t.common.switchToEn}
            />

            <button
              type="button"
              onClick={handleSignOut}
              aria-label={t.common.logout}
              className="min-h-[44px] px-3 border border-white/14 bg-transparent hover:border-white/35 text-xs uppercase tracking-[0.16em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={15} strokeWidth={1.35} aria-hidden="true" />
              <span className="hidden sm:inline">{t.common.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN THRESHOLD SHEET */}
      <main
        id="welcome-main-sheet"
        className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-9 lg:py-11 flex flex-col justify-between gap-8"
      >
        {/* Editorial Greeting & Collaborator Context Header */}
        <motion.section
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 10,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="pb-6 sm:pb-8 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-5"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#A65D4A]">
              <span>{department.code}</span>
              <span aria-hidden="true" className="text-white/25">
                ·
              </span>
              <span>{pickLocalized(department.name, language)}</span>
              <span aria-hidden="true" className="text-white/25">
                ·
              </span>
              <span className="text-[#BDBDBD]">
                {t.welcome.studioBasePrefix}: {currentUser.studioBase}
              </span>
            </div>

            <h1 className="mt-2.5 text-3xl sm:text-4xl lg:text-[2.75rem] font-light tracking-tight leading-[1.12] text-white">
              {greeting},{' '}
              <span className="font-normal text-white">{currentUser.name}</span>
            </h1>

            <p className="mt-2.5 text-sm sm:text-base text-[#BDBDBD] max-w-2xl">
              {pickLocalized(currentUser.scopeSummary, language)}
            </p>
          </div>

          <div className="flex flex-col sm:items-start lg:items-end gap-1.5 text-xs text-[#BDBDBD] shrink-0">
            <span className="uppercase tracking-[0.18em] text-white font-medium">
              {formattedDate}
            </span>
            <span className="tracking-[0.14em] text-[#9E9E9E]">
              MAPUTO {clocks.maputo} · MILÃO {clocks.milan}
            </span>
            <span className="inline-flex items-center gap-1.5 border border-white/14 bg-[#181818] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#E0E0E0] mt-1">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 bg-[#A65D4A]"
              />
              {t.common.localSavedBadge}
            </span>
          </div>
        </motion.section>

        {/* ASYMMETRIC 12-COLUMN EDITORIAL WORKSHEET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT 7 COLUMNS — Featured Studio Study & Croquis Overlay */}
          <motion.section
            initial={{
              opacity: shouldReduceMotion ? 1 : 0,
              y: shouldReduceMotion ? 0 : 12,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-labelledby="featured-study-heading"
            className="lg:col-span-7 flex flex-col border border-white/12 bg-[#080808]"
          >
            {/* Plate Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3.5 oa-hairline-b bg-[#0D0D0D]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A65D4A]">
                  {FEATURED_STUDY_PROJECT.code}
                </span>
                <span aria-hidden="true" className="text-white/25">
                  ·
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#BDBDBD]">
                  {t.welcome.featuredLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowPlanOverlay((prev) => !prev)}
                aria-pressed={showPlanOverlay}
                className="min-h-[44px] px-3 border border-white/14 bg-[#141414] hover:border-white/30 text-[11px] uppercase tracking-[0.16em] text-[#E0E0E0] inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Grid size={13} strokeWidth={1.4} aria-hidden="true" />
                <span>
                  {showPlanOverlay
                    ? t.welcome.planOverlayToggleOn
                    : t.welcome.planOverlayToggleOff}
                </span>
              </button>
            </div>

            {/* Maquette Photograph + Technical Architectural Datum Overlay */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050505]">
              <img
                src={FEATURED_STUDY_PROJECT.maquetteImageSrc}
                alt={pickLocalized(
                  FEATURED_STUDY_PROJECT.maquetteImageAlt,
                  language,
                )}
                className="h-full w-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#050505]/45"
              />

              {showPlanOverlay && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 800 500"
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  fill="none"
                >
                  {/* Structural Datum Crosshairs */}
                  <line
                    x1="64"
                    y1="0"
                    x2="64"
                    y2="500"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <line
                    x1="736"
                    y1="0"
                    x2="736"
                    y2="500"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <line
                    x1="0"
                    y1="92"
                    x2="800"
                    y2="92"
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="1"
                  />
                  {/* North Indicator & Elevation Callout */}
                  <g transform="translate(692, 48)">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
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
                    <text
                      x="18"
                      y="46"
                      textAnchor="middle"
                      fill="#E0E0E0"
                      fontSize="9"
                      fontFamily="Outfit, sans-serif"
                      letterSpacing="2"
                    >
                      N · 00°
                    </text>
                  </g>
                  <g transform="translate(80, 68)">
                    <text
                      x="0"
                      y="0"
                      fill="#E0E0E0"
                      fontSize="10"
                      fontFamily="Outfit, sans-serif"
                      letterSpacing="2"
                    >
                      {language === 'en' ? 'DATUM' : 'COTA'}{' '}
                      {FEATURED_STUDY_PROJECT.elevationDatum} ·{' '}
                      {language === 'en' ? 'SCALE' : 'ESCALA'}{' '}
                      {FEATURED_STUDY_PROJECT.scale}
                    </text>
                  </g>
                </svg>
              )}

              {/* Status Badges Overlay on >=640px so 375px mobile maquette remains unobstructed */}
              <div className="hidden sm:flex absolute bottom-3 left-6 right-4 flex-wrap items-center gap-2">
                <span className="bg-[#111111]/90 border border-white/18 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                  {t.welcome.reviewPhaseBadge}
                </span>
                <span className="bg-[#111111]/90 border border-[#A65D4A]/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]">
                  {t.welcome.privateDefaultBadge}
                </span>
              </div>
            </div>

            {/* Mobile Status Strip (<640px) — keeps maquette photograph 100% clear */}
            <div className="sm:hidden flex flex-wrap items-center gap-2 px-4 py-3 bg-[#0C0C0C] oa-hairline-b">
              <span className="border border-white/18 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white">
                {t.welcome.reviewPhaseBadge}
              </span>
              <span className="border border-[#A65D4A]/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#E0E0E0]">
                {t.welcome.privateDefaultBadge}
              </span>
            </div>

            {/* Study Details & Architectural Reflection */}
            <div className="p-5 sm:p-7 space-y-5">
              <div>
                <h2
                  id="featured-study-heading"
                  className="text-xl sm:text-2xl font-light tracking-tight text-white"
                >
                  {pickLocalized(FEATURED_STUDY_PROJECT.title, language)}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#BDBDBD]">
                  {pickLocalized(FEATURED_STUDY_PROJECT.subtitle, language)}
                </p>
              </div>

              {/* Technical Spec Strip */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 oa-hairline-t oa-hairline-b">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
                    {t.welcome.metadataScale}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white">
                    {FEATURED_STUDY_PROJECT.scale}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
                    {t.welcome.metadataArea}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white">
                    {FEATURED_STUDY_PROJECT.areaSqm}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
                    {t.welcome.metadataDatum}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white">
                    {FEATURED_STUDY_PROJECT.elevationDatum}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
                    {t.welcome.metadataDiscipline}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white">
                    {pickLocalized(FEATURED_STUDY_PROJECT.discipline, language)}
                  </dd>
                </div>
              </dl>

              {/* Editorial Studio Quote */}
              <blockquote className="border-l-2 border-[#A65D4A] pl-4 py-0.5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#A65D4A] mb-1.5">
                  {t.welcome.editorialQuoteLabel}
                </p>
                <p className="font-serif italic text-lg sm:text-xl leading-relaxed text-[#F5F5F5]">
                  “{pickLocalized(FEATURED_STUDY_PROJECT.editorialNote, language)}”
                </p>
              </blockquote>
            </div>
          </motion.section>

          {/* RIGHT 5 COLUMNS — Role Briefing, Entry CTA & Local Welcome Preference */}
          <motion.section
            initial={{
              opacity: shouldReduceMotion ? 1 : 0,
              y: shouldReduceMotion ? 0 : 12,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-labelledby="role-briefing-heading"
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Primary Action Plinth — Positioned high on mobile & desktop for effortless entry */}
            <div className="border border-white/14 bg-[#161616] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-2 pb-4 oa-hairline-b">
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#E0E0E0]">
                  {pickLocalized(currentUser.roleLabel, language)}
                </span>
                <Compass
                  size={16}
                  strokeWidth={1.35}
                  className="text-[#A65D4A] shrink-0"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleEnterWorkspace}
                  className="w-full min-h-[52px] px-6 py-3.5 bg-[#A65D4A] hover:bg-[#B86B57] active:bg-[#96513F] text-xs sm:text-[13px] font-medium uppercase tracking-[0.22em] text-white inline-flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{t.welcome.primaryEnterCta}</span>
                  <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={handleEnterWorkspace}
                  className="w-full min-h-[44px] px-4 py-2.5 border border-white/16 bg-transparent hover:border-white/35 text-xs font-medium uppercase tracking-[0.18em] text-[#E0E0E0] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  {t.welcome.secondaryDirectCta}
                </button>
              </div>

              {/* Persistent Local Skip-Welcome Preference */}
              <div className="mt-5 pt-4 oa-hairline-t">
                <label
                  htmlFor={skipPrefInputId}
                  className="min-h-[44px] flex items-start gap-3 cursor-pointer select-none"
                >
                  <input
                    id={skipPrefInputId}
                    type="checkbox"
                    checked={preferences.skipWelcomeOnLogin}
                    onChange={(event) =>
                      setSkipWelcomeOnLogin(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-[#A65D4A] cursor-pointer shrink-0"
                  />
                  <span className="text-xs leading-relaxed text-[#E0E0E0]">
                    <span className="block font-medium text-white">
                      {t.welcome.skipWelcomeLabel}
                    </span>
                    <span className="mt-0.5 block text-[#9E9E9E]">
                      {t.welcome.skipWelcomeHelper}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Role-Specific Studio Briefing */}
            <div className="border border-white/12 bg-[#141414] p-5 sm:p-7">
              <h2
                id="role-briefing-heading"
                className="text-xs font-medium uppercase tracking-[0.22em] text-white"
              >
                {t.welcome.briefingHeading}
              </h2>

              <ul className="mt-4 divide-y divide-white/10">
                {currentUser.welcomePriorities.map((item) => (
                  <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em]">
                      <span className="font-semibold text-[#A65D4A]">
                        {item.code}
                      </span>
                      <span className="text-[#9E9E9E]">
                        {pickLocalized(item.category, language)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-white">
                      {pickLocalized(item.summary, language)}
                    </p>
                    <p className="mt-1 text-xs text-[#BDBDBD]">
                      {pickLocalized(item.meta, language)}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-4 pt-3.5 oa-hairline-t text-xs leading-relaxed text-[#9E9E9E]">
                {t.welcome.roleDisclaimer}
              </p>
            </div>

            {/* Quick Demo Role Switcher right inside /welcome */}
            <div className="border border-white/10 bg-[#0E0E0E] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD] mb-3">
                <SlidersHorizontal
                  size={13}
                  strokeWidth={1.4}
                  className="text-[#A65D4A]"
                  aria-hidden="true"
                />
                <span>{t.welcome.switchProfileLabel}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {DEMO_USERS.map((userOption) => {
                  const active = userOption.id === currentUser.id;
                  return (
                    <button
                      key={userOption.id}
                      type="button"
                      onClick={() => switchRole(userOption.role)}
                      aria-pressed={active}
                      className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.12em] border transition-colors cursor-pointer ${
                        active
                          ? 'border-[#A65D4A] bg-[#A65D4A]/20 text-white font-medium'
                          : 'border-white/12 bg-[#161616] text-[#BDBDBD] hover:text-white hover:border-white/30'
                      }`}
                    >
                      {userOption.code}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
