import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  DEMO_ACCESS_KEY_HINT,
  DEMO_USERS,
  DEPARTMENTS,
  LOGIN_SPATIAL_STUDY,
} from '../../data/fixtures';
import type { DemoUser } from '../../data/types';
import { ArchitecturalSectionDrawing } from '../../design-system/ArchitecturalSectionDrawing';
import { DemoNoticeDialog } from '../../design-system/DemoNoticeDialog';
import { LanguageToggle } from '../../design-system/LanguageToggle';
import { OABrandMark } from '../../design-system/OABrandMark';
import { pickLocalized } from '../../locales';
import { formatStudioClocks } from '../../utils/timeGreeting';

type VisualMode = 'photo' | 'section';

export function LoginPage() {
  const {
    session,
    preferences,
    language,
    t,
    signInWithCredentials,
    signInAsDemoUser,
    setLanguage,
  } = useWorkspaceSession();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion =
    prefersReducedMotion || preferences.reduceMotionOverride === 'reduce';

  const defaultProfile = DEMO_USERS[0];
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    defaultProfile.id,
  );
  const [email, setEmail] = useState<string>(defaultProfile.email);
  const [password, setPassword] = useState<string>(DEMO_ACCESS_KEY_HINT);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<VisualMode>('photo');
  const [forgotDialogOpen, setForgotDialogOpen] = useState<boolean>(false);
  const [emailErrorKey, setEmailErrorKey] = useState<
    'required' | 'invalidFormat' | 'unknownDemoAccount' | null
  >(null);
  const [passwordErrorKey, setPasswordErrorKey] = useState<
    'required' | 'invalidDemoKey' | null
  >(null);

  const emailInputId = useId();
  const emailErrorId = useId();
  const passwordInputId = useId();
  const passwordErrorId = useId();

  const clocks = formatStudioClocks();

  useEffect(() => {
    if (!session) {
      document.title = t.login.pageTitle;
    }
  }, [session, t.login.pageTitle]);

  if (session) {
    return (
      <Navigate
        to={preferences.skipWelcomeOnLogin ? '/workspace' : '/welcome'}
        replace
      />
    );
  }

  const handleSelectProfileToFill = (profile: DemoUser) => {
    setSelectedProfileId(profile.id);
    setEmail(profile.email);
    setPassword(profile.demoAccessKey);
    setEmailErrorKey(null);
    setPasswordErrorKey(null);
  };

  const handleDirectProfileEnter = (profile: DemoUser) => {
    signInAsDemoUser(profile);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signInWithCredentials(email, password);
    if (!result.ok) {
      setEmailErrorKey(result.fieldErrors.email ?? null);
      setPasswordErrorKey(result.fieldErrors.password ?? null);
      return;
    }
    setEmailErrorKey(null);
    setPasswordErrorKey(null);
  };

  const resolveEmailErrorText = (): string | null => {
    if (!emailErrorKey) return null;
    if (emailErrorKey === 'required') return t.login.errors.emailRequired;
    if (emailErrorKey === 'invalidFormat')
      return t.login.errors.emailInvalidFormat;
    return t.login.errors.unknownDemoAccount;
  };

  const resolvePasswordErrorText = (): string | null => {
    if (!passwordErrorKey) return null;
    if (passwordErrorKey === 'required') return t.login.errors.passwordRequired;
    return t.login.errors.invalidDemoKey;
  };

  const emailErrorText = resolveEmailErrorText();
  const passwordErrorText = resolvePasswordErrorText();

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden w-full bg-[#111111] text-white flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
      <a
        href="#login-main-chamber"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#A65D4A] focus:px-4 focus:py-2.5 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-white"
      >
        {t.common.skipToMain}
      </a>

      {/* SINGLE SEMANTIC HEADER — Row 1 on Mobile/Tablet; Right Chamber Top Bar on Desktop */}
      <header className="lg:col-start-8 lg:col-span-5 lg:row-start-1 flex items-center justify-between gap-3 px-4 sm:px-8 lg:px-9 py-3.5 lg:py-4 bg-[#0E0E0E] oa-hairline-b">
        <OABrandMark subtitle={t.common.workspaceTitle} size="md" />
        <LanguageToggle
          language={language}
          onChange={setLanguage}
          ptAriaLabel={t.common.switchToPt}
          enAriaLabel={t.common.switchToEn}
        />
      </header>

      {/* ZONE A — ARCHITECTURAL SPATIAL STAGE (58% Left Full-Height Desktop / Row 2 Mobile & Tablet) */}
      <aside
        aria-label={t.login.plateCode}
        className="relative lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2 bg-[#050505] lg:h-dvh flex flex-col justify-between overflow-hidden oa-hairline-b lg:border-b-0 lg:oa-hairline-r"
      >
        {/* Top Datum & Mode Bar */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 lg:px-10 py-3.5 lg:py-5 bg-[#050505]/85 oa-hairline-b">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 bg-[#A65D4A]"
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#E0E0E0]">
              {t.login.plateCode}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-[#BDBDBD]">
            <span>MAPUTO {clocks.maputo}</span>
            <span aria-hidden="true" className="text-white/25">
              /
            </span>
            <span>MILÃO {clocks.milan}</span>
          </div>

          {/* Interactive Spatial Photograph vs 1:100 Section Toggle */}
          <div
            role="group"
            aria-label={t.login.plateCode}
            className="inline-flex items-center border border-white/15 bg-[#101010]"
          >
            <button
              type="button"
              onClick={() => setVisualMode('photo')}
              aria-pressed={visualMode === 'photo'}
              className={`min-h-[44px] px-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                visualMode === 'photo'
                  ? 'bg-white/12 text-white border-b-2 border-[#A65D4A]'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              <Layers size={14} strokeWidth={1.35} aria-hidden="true" />
              <span>{t.login.viewPhoto}</span>
            </button>
            <span aria-hidden="true" className="h-5 w-px bg-white/12" />
            <button
              type="button"
              onClick={() => setVisualMode('section')}
              aria-pressed={visualMode === 'section'}
              className={`min-h-[44px] px-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                visualMode === 'section'
                  ? 'bg-white/12 text-white border-b-2 border-[#A65D4A]'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              <Compass size={14} strokeWidth={1.35} aria-hidden="true" />
              <span>{t.login.viewSection}</span>
            </button>
          </div>
        </div>

        {/* Central Spatial Canvas */}
        <div className="relative flex-1 min-h-[210px] sm:min-h-[300px] lg:min-h-0 flex flex-col justify-end">
          {visualMode === 'photo' ? (
            <motion.div
              key="spatial-photo"
              initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >
              <img
                src={LOGIN_SPATIAL_STUDY.imageSrc}
                alt={pickLocalized(LOGIN_SPATIAL_STUDY.imageAlt, language)}
                className="h-full w-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
              {/* Controlled architectural vignette — preserves contrast for editorial plinth */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-[#050505]/55"
              />
              {/* Subtle vertical datum hairlines */}
              <div
                aria-hidden="true"
                className="hidden md:block absolute inset-y-0 left-10 w-px bg-white/[0.08]"
              />
              <div
                aria-hidden="true"
                className="hidden md:block absolute inset-y-0 right-10 w-px bg-white/[0.08]"
              />
            </motion.div>
          ) : (
            <motion.div
              key="spatial-section"
              initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex-1 flex items-center justify-center min-h-[240px] sm:min-h-[340px] lg:min-h-full"
            >
              <ArchitecturalSectionDrawing
                ariaLabel={t.login.sectionSvgAria}
                language={language}
              />
            </motion.div>
          )}

          {/* Editorial Lower Plinth */}
          <div className="relative z-20 px-4 sm:px-8 lg:px-12 py-5 sm:py-7 lg:py-10 bg-gradient-to-t from-[#050505] via-[#050505]/92 to-transparent">
            <div className="max-w-xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#A65D4A]">
                {t.common.axisLabel}
              </p>
              <p className="mt-2 font-serif italic text-xl sm:text-2xl lg:text-[2rem] leading-snug text-white">
                {pickLocalized(LOGIN_SPATIAL_STUDY.title, language)}
              </p>
              <p className="mt-2.5 text-xs sm:text-[13px] tracking-wide text-[#BDBDBD]">
                {pickLocalized(LOGIN_SPATIAL_STUDY.caption, language)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ZONE B — AUTHENTICATION & STUDIO ROLE CHAMBER (42% Right Desktop / Row 3 Mobile & Tablet) */}
      <main
        id="login-main-chamber"
        className="lg:col-start-8 lg:col-span-5 lg:row-start-2 bg-[#111111] flex flex-col justify-between lg:overflow-y-auto"
      >
        {/* Form & Demo Role Index */}
        <div className="flex-1 px-4 sm:px-8 lg:px-9 py-6 sm:py-7 lg:py-6 flex flex-col justify-center">
          {/* Chamber Identification */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#BDBDBD]">
              {t.login.chamberLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 border border-[#A65D4A]/55 bg-[#A65D4A]/12 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 bg-[#A65D4A]"
              />
              {t.common.demoBadge}
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-[1.75rem] font-light tracking-tight leading-snug text-white">
            {t.login.heading}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#BDBDBD]">
            {t.login.subheading}
          </p>

          {/* Authentication Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-6 space-y-5 pb-7 oa-hairline-b"
          >
            <div>
              <label
                htmlFor={emailInputId}
                className="block text-xs font-medium uppercase tracking-[0.18em] text-[#E0E0E0]"
              >
                {t.login.emailLabel}
              </label>
              <input
                id={emailInputId}
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailErrorKey) setEmailErrorKey(null);
                }}
                placeholder={t.login.emailPlaceholder}
                aria-invalid={emailErrorText ? 'true' : 'false'}
                aria-describedby={emailErrorText ? emailErrorId : undefined}
                className="oa-field-input mt-1"
              />
              {emailErrorText && (
                <p
                  id={emailErrorId}
                  role="alert"
                  className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-[#E58573]"
                >
                  <AlertCircle
                    size={15}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{emailErrorText}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={passwordInputId}
                  className="block text-xs font-medium uppercase tracking-[0.18em] text-[#E0E0E0]"
                >
                  {t.login.passwordLabel}
                </label>
                <span className="text-[11px] font-mono tracking-wider text-[#BDBDBD]">
                  {t.login.demoKeyBadge}
                </span>
              </div>

              <div className="relative mt-1 flex items-center">
                <input
                  id={passwordInputId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordErrorKey) setPasswordErrorKey(null);
                  }}
                  placeholder={t.login.passwordPlaceholder}
                  aria-invalid={passwordErrorText ? 'true' : 'false'}
                  aria-describedby={
                    passwordErrorText ? passwordErrorId : undefined
                  }
                  className="oa-field-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? t.login.hidePassword : t.login.showPassword
                  }
                  aria-pressed={showPassword}
                  className="absolute right-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#BDBDBD] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={17} strokeWidth={1.35} />
                  ) : (
                    <Eye size={17} strokeWidth={1.35} />
                  )}
                </button>
              </div>

              {passwordErrorText && (
                <p
                  id={passwordErrorId}
                  role="alert"
                  className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-[#E58573]"
                >
                  <AlertCircle
                    size={15}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{passwordErrorText}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setForgotDialogOpen(true)}
                className="min-h-[44px] inline-flex items-center text-xs text-[#BDBDBD] underline underline-offset-4 decoration-white/25 hover:text-white hover:decoration-[#A65D4A] transition-colors cursor-pointer"
              >
                {t.login.forgotPasswordTrigger}
              </button>

              <button
                type="submit"
                className="min-h-[48px] px-6 py-3 bg-[#A65D4A] hover:bg-[#B86B57] active:bg-[#96513F] text-xs font-medium uppercase tracking-[0.22em] text-white inline-flex items-center justify-center gap-3 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <span>{t.login.submitAction}</span>
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Explicit Studio Demo Profiles Ledger */}
          <section
            aria-labelledby="demo-profiles-heading"
            className="mt-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
              <h2
                id="demo-profiles-heading"
                className="text-xs font-medium uppercase tracking-[0.22em] text-white"
              >
                {t.login.profilesHeading}
              </h2>
              <span className="text-xs text-[#9E9E9E]">
                {t.login.profilesHint}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
              {DEMO_USERS.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                const dept = DEPARTMENTS[profile.departmentId];
                return (
                  <div
                    key={profile.id}
                    className={`flex items-stretch justify-between border transition-colors ${
                      isSelected
                        ? 'border-[#A65D4A] bg-white/[0.04]'
                        : 'border-white/10 bg-[#161616] hover:border-white/24'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectProfileToFill(profile)}
                      aria-pressed={isSelected}
                      className="flex-1 min-w-0 min-h-[54px] px-3 py-2 text-left flex flex-col justify-center cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-semibold tracking-[0.14em] text-[#A65D4A] whitespace-nowrap shrink-0">
                          {profile.code}
                        </span>
                        <span className="text-xs sm:text-[13px] font-medium text-white truncate">
                          {profile.name}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#BDBDBD] truncate">
                        <span className="truncate">{pickLocalized(dept.name, language)}</span>
                        <span aria-hidden="true" className="text-white/25 shrink-0">
                          ·
                        </span>
                        <span className="shrink-0">{profile.studioBase}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectProfileEnter(profile)}
                      aria-label={`${t.login.profileQuickEnter} ${profile.name}`}
                      className="min-h-[54px] min-w-[68px] px-2.5 border-l border-white/10 text-[10px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0] hover:bg-[#A65D4A] hover:text-white inline-flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <span>{language === 'pt' ? 'Entrar' : 'Enter'}</span>
                      <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Transparent Security & Demo Footer */}
        <footer className="px-4 sm:px-8 lg:px-10 py-4 bg-[#0B0B0B] oa-hairline-t">
          <p className="text-xs leading-relaxed text-[#9E9E9E]">
            {t.login.demoDisclaimer}
          </p>
        </footer>
      </main>

      <DemoNoticeDialog
        open={forgotDialogOpen}
        onClose={() => setForgotDialogOpen(false)}
        code={t.login.forgotDialog.code}
        title={t.login.forgotDialog.title}
        body={t.login.forgotDialog.body}
        instruction={t.login.forgotDialog.instruction}
        confirmLabel={t.login.forgotDialog.confirmButton}
        closeAriaLabel={t.common.closeDialog}
      />
    </div>
  );
}
