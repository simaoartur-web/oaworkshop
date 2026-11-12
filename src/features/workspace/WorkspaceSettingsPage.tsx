import { ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../../data/fixtures';
import { PROJECT_LIBRARY_STORAGE_KEY } from '../../data/projectLibraryRepository';
import { STORAGE_KEYS } from '../../data/sessionRepository';
import { STUDIO_DESK_STORAGE_KEY } from '../../data/studioDeskFixtures';
import { LanguageToggle } from '../../design-system/LanguageToggle';
import { pickLocalized } from '../../locales';
import { SHELL_STORAGE_KEYS } from '../workspace-shell/shellDemoState';
import { useOptionalWorkspaceShellUi } from '../workspace-shell/shellUiContext';

export function WorkspaceSettingsPage() {
  const {
    currentUser,
    preferences,
    language,
    t,
    setLanguage,
    setSkipWelcomeOnLogin,
    setReduceMotionOverride,
    switchRole,
    resetAllDemoData,
  } = useWorkspaceSession();
  const shellUi = useOptionalWorkspaceShellUi();
  const navigate = useNavigate();
  const skipInputId = useId();

  useEffect(() => {
    document.title = t.shell.settings.pageTitle;
  }, [t.shell.settings.pageTitle]);

  if (!currentUser) {
    return null;
  }

  const handleResetDemo = () => {
    resetAllDemoData();
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8">
      <header className="pb-6 oa-hairline-b space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#CE826D]">
            {t.shell.settings.eyebrow}
          </p>
          <Link
            to="/workspace"
            className="min-h-[40px] px-3.5 py-1.5 border border-white/16 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{t.shell.availability.returnToDeskAction}</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
          {t.shell.settings.heading}
        </h1>
        <p className="text-sm text-[#CCCCCC] max-w-2xl">
          {t.shell.settings.description}
        </p>
      </header>

      {/* Interface Preferences Matrix */}
      <section
        aria-labelledby="settings-interface-heading"
        className="border border-white/14 bg-[#141414] divide-y divide-white/10"
      >
        <div className="px-5 sm:px-7 py-4 bg-[#101010]">
          <h2
            id="settings-interface-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-white"
          >
            {t.shell.settings.interfaceSection}
          </h2>
        </div>

        {/* Language */}
        <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">
              {t.shell.settings.languageTitle}
            </h3>
            <p className="text-xs text-[#BDBDBD]">
              {t.shell.settings.languageDesc}
            </p>
          </div>
          <LanguageToggle
            language={language}
            onChange={setLanguage}
            ptAriaLabel={t.common.switchToPt}
            enAriaLabel={t.common.switchToEn}
          />
        </div>

        {/* Skip /welcome */}
        <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label
              htmlFor={skipInputId}
              className="block text-sm font-medium text-white cursor-pointer"
            >
              {t.shell.settings.welcomeToggleTitle}
            </label>
            <p className="text-xs text-[#BDBDBD]">
              {t.shell.settings.welcomeToggleDesc}
            </p>
          </div>

          <input
            id={skipInputId}
            type="checkbox"
            checked={preferences.skipWelcomeOnLogin}
            onChange={(event) => setSkipWelcomeOnLogin(event.target.checked)}
            className="h-5 w-5 accent-[#A65D4A] cursor-pointer shrink-0"
          />
        </div>

        {/* Reduced motion */}
        <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">
              {t.shell.settings.motionTitle}
            </h3>
            <p className="text-xs text-[#BDBDBD]">
              {t.shell.settings.motionDesc}
            </p>
          </div>

          <div
            role="group"
            aria-label={t.shell.settings.motionTitle}
            className="inline-flex border border-white/14 bg-[#0D0D0D]"
          >
            <button
              type="button"
              onClick={() => setReduceMotionOverride('system')}
              aria-pressed={preferences.reduceMotionOverride === 'system'}
              className={`min-h-[44px] px-3.5 text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                preferences.reduceMotionOverride === 'system'
                  ? 'bg-[#A65D4A] text-white'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              {t.shell.settings.motionSystemBtn}
            </button>
            <button
              type="button"
              onClick={() => setReduceMotionOverride('reduce')}
              aria-pressed={preferences.reduceMotionOverride === 'reduce'}
              className={`min-h-[44px] px-3.5 border-l border-white/12 text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                preferences.reduceMotionOverride === 'reduce'
                  ? 'bg-[#A65D4A] text-white'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              {t.shell.settings.motionReduceBtn}
            </button>
          </div>
        </div>

        {/* Rail state on desktop */}
        {shellUi && (
          <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-white">
                {t.shell.settings.railTitle}
              </h3>
              <p className="text-xs text-[#BDBDBD]">
                {t.shell.settings.railDesc}
              </p>
            </div>

            <div
              role="group"
              aria-label={t.shell.settings.railTitle}
              className="inline-flex border border-white/14 bg-[#0D0D0D]"
            >
              <button
                type="button"
                onClick={() => shellUi.setRailCompact(false)}
                aria-pressed={!shellUi.railCompact}
                className={`min-h-[44px] px-3.5 text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                  !shellUi.railCompact
                    ? 'bg-[#A65D4A] text-white'
                    : 'text-[#BDBDBD] hover:text-white'
                }`}
              >
                {t.shell.settings.railExpandedBtn}
              </button>
              <button
                type="button"
                onClick={() => shellUi.setRailCompact(true)}
                aria-pressed={shellUi.railCompact}
                className={`min-h-[44px] px-3.5 border-l border-white/12 text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                  shellUi.railCompact
                    ? 'bg-[#A65D4A] text-white'
                    : 'text-[#BDBDBD] hover:text-white'
                }`}
              >
                {t.shell.settings.railCompactBtn}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Active Demo Profile Simulator */}
      <section
        aria-labelledby="settings-roles-heading"
        className="border border-white/12 bg-[#141414] p-5 sm:p-7 space-y-4"
      >
        <h2
          id="settings-roles-heading"
          className="text-xs font-medium uppercase tracking-[0.20em] text-white"
        >
          {t.workspaceGate.switchRoleHeading}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DEMO_USERS.map((item) => {
            const active = item.id === currentUser.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchRole(item.role)}
                aria-pressed={active}
                className={`min-h-[54px] p-3 text-left border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#A65D4A] bg-[#A65D4A]/16 text-white'
                    : 'border-white/12 bg-[#101010] text-[#BDBDBD] hover:text-white hover:border-white/30'
                }`}
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#CE826D]">
                  {item.code} · {item.studioBase}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-white truncate">
                  {item.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-[#BDBDBD] truncate">
                  {pickLocalized(item.roleLabel, language)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Local Storage Audit & Full Demo Reset */}
      <section
        aria-labelledby="settings-storage-heading"
        className="border border-white/12 bg-[#0E0E0E] p-5 sm:p-7 space-y-4"
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.20em] text-white">
          <ShieldCheck
            size={15}
            strokeWidth={1.4}
            className="text-[#A65D4A]"
            aria-hidden="true"
          />
          <h2 id="settings-storage-heading">
            {t.shell.settings.storageAuditTitle}
          </h2>
        </div>

        <p className="text-xs text-[#E6E6E6]">
          {t.shell.settings.storageZeroPassword}
        </p>
        <p className="text-xs text-[#B8B8B8]">
          {t.shell.settings.storageResetScopeNote}
        </p>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#B8B8B8]">
            {t.shell.settings.activeStorageKeysLabel}
          </p>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono text-[#BDBDBD]">
            <li className="border border-white/10 bg-[#141414] px-3 py-2">
              {STORAGE_KEYS.SESSION}
            </li>
            <li className="border border-white/10 bg-[#141414] px-3 py-2">
              {STORAGE_KEYS.PREFERENCES}
            </li>
            <li className="border border-white/10 bg-[#141414] px-3 py-2">
              {SHELL_STORAGE_KEYS.NOTIFICATIONS}
            </li>
            <li className="border border-white/10 bg-[#141414] px-3 py-2">
              {SHELL_STORAGE_KEYS.RAIL_COMPACT}
            </li>
            <li className="border border-white/10 bg-[#141414] px-3 py-2">
              {STUDIO_DESK_STORAGE_KEY}
            </li>
            <li className="border border-white/10 bg-[#141414] px-3 py-2">
              {PROJECT_LIBRARY_STORAGE_KEY}
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="min-h-[44px] px-4 py-2.5 border border-white/16 hover:border-[#E58573] text-xs font-medium uppercase tracking-[0.16em] text-[#BDBDBD] hover:text-[#E58573] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} strokeWidth={1.4} aria-hidden="true" />
            <span>{t.common.resetDemoData}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
