import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import { pickLocalized } from '../../locales';
import {
  formatGreetingForTime,
  formatStudioClocks,
} from '../../utils/timeGreeting';

/**
 * Authenticated /workspace index placeholder managed by Argon A during Phase 02A.
 * Renders directly inside WorkspaceShell's <main> slot cleanly with zero duplicate
 * header/sidebar chrome. Replaced directly by Argon B's StudioDeskPage upon integration.
 */
export function WorkspaceEntryGatePage() {
  const {
    session,
    currentUser,
    preferences,
    language,
    t,
    switchRole,
    setSkipWelcomeOnLogin,
    resetAllDemoData,
  } = useWorkspaceSession();
  const navigate = useNavigate();
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  useEffect(() => {
    document.title = t.workspaceGate.pageTitle;
  }, [t.workspaceGate.pageTitle]);

  if (!session || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const department = DEPARTMENTS[currentUser.departmentId];
  const now = new Date();
  const studioGreeting = formatGreetingForTime(t, now, currentUser.studioBase);
  const clocks = formatStudioClocks(now);
  const activeStudioClock =
    currentUser.studioBase === 'Maputo' ? clocks.maputo : clocks.milan;

  const handleResetDemo = () => {
    setResetFeedback(t.common.resetConfirmed);
    resetAllDemoData();
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8">
      {/* Page Editorial Datum Header */}
      <header className="pb-6 oa-hairline-b space-y-3">
        <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#A65D4A]">
          <CheckCircle2 size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>{t.workspaceGate.phaseBadge}</span>
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
          {t.workspaceGate.heading}
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-[#BDBDBD] max-w-3xl">
          {t.workspaceGate.description}
        </p>
      </header>

      {resetFeedback && (
        <p
          role="status"
          className="border-l-2 border-[#A65D4A] bg-white/[0.04] px-4 py-3 text-xs text-white"
        >
          {resetFeedback}
        </p>
      )}

      {/* Integration Slot & Studio Time Contract Matrix */}
      <section
        aria-label={t.shell.slotPlaceholder.contractLabel}
        className="grid grid-cols-1 lg:grid-cols-12 border border-white/14 bg-[#0D0D0D]"
      >
        <div className="lg:col-span-7 p-5 sm:p-7 oa-hairline-b lg:border-b-0 lg:oa-hairline-r space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.20em] text-[#A65D4A]">
            <Compass size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{t.shell.slotPlaceholder.contractLabel}</span>
          </div>
          <p className="text-sm font-medium text-white">
            {t.shell.slotPlaceholder.contractExport}
          </p>
          <p className="text-xs font-mono text-[#BDBDBD] break-all">
            {t.shell.slotPlaceholder.contractPath}
          </p>
        </div>

        <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-3 bg-[#141414]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
              {t.shell.slotPlaceholder.greetingCheckLabel}
            </p>
            <p className="mt-1.5 text-base font-light text-white">
              {studioGreeting}, {currentUser.name}
            </p>
          </div>
          <p className="text-xs font-mono text-[#E0E0E0]">
            {t.shell.slotPlaceholder.studioTimeNowLabel}: {currentUser.studioBase} ·{' '}
            {activeStudioClock}
          </p>
        </div>
      </section>

      {/* Session Diagnostics & Controls Sheet */}
      <section
        aria-labelledby="session-state-heading"
        className="border border-white/14 bg-[#151515] p-5 sm:p-8 space-y-6"
      >
        <h2
          id="session-state-heading"
          className="text-xs font-medium uppercase tracking-[0.22em] text-white pb-3.5 oa-hairline-b"
        >
          {t.workspaceGate.sessionCardTitle}
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
              {t.workspaceGate.activeCollaborator}
            </dt>
            <dd className="mt-1 text-base font-medium text-white">
              {currentUser.code} · {currentUser.name}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
              {t.workspaceGate.activeRole}
            </dt>
            <dd className="mt-1 text-base font-medium text-white">
              {pickLocalized(currentUser.roleLabel, language)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
              {t.workspaceGate.activeDepartment}
            </dt>
            <dd className="mt-1 text-base font-medium text-white">
              {pickLocalized(department.name, language)} ({currentUser.studioBase})
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E]">
              {t.workspaceGate.welcomePrefStatus}
            </dt>
            <dd className="mt-1 text-sm text-[#E0E0E0]">
              {preferences.skipWelcomeOnLogin
                ? t.workspaceGate.welcomeSkipped
                : t.workspaceGate.welcomeEnabled}
            </dd>
          </div>
        </dl>

        <div className="pt-4 oa-hairline-t flex flex-wrap items-center gap-3">
          <Link
            to="/welcome"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#111111] hover:border-white/40 text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{t.workspaceGate.revisitWelcomeAction}</span>
          </Link>

          <Link
            to="/workspace/settings"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#111111] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{t.shell.slotPlaceholder.openSettingsCta}</span>
          </Link>

          <button
            type="button"
            onClick={() => setSkipWelcomeOnLogin(!preferences.skipWelcomeOnLogin)}
            aria-pressed={preferences.skipWelcomeOnLogin}
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#111111] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.16em] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer"
          >
            {t.workspaceGate.toggleWelcomeAction}
          </button>

          <button
            type="button"
            onClick={handleResetDemo}
            className="min-h-[44px] px-4 py-2.5 border border-white/14 bg-transparent hover:border-[#E58573] text-xs font-medium uppercase tracking-[0.16em] text-[#BDBDBD] hover:text-[#E58573] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} strokeWidth={1.4} aria-hidden="true" />
            <span>{t.common.resetDemoData}</span>
          </button>
        </div>
      </section>

      {/* Role Switcher Verification */}
      <section
        aria-labelledby="role-switch-verify-heading"
        className="border border-white/12 bg-[#141414] p-5 sm:p-7 space-y-4"
      >
        <h2
          id="role-switch-verify-heading"
          className="text-xs font-medium uppercase tracking-[0.22em] text-white"
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
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A65D4A]">
                  {item.code} · {item.studioBase}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-white truncate">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#9E9E9E]">
          {t.workspaceGate.securityReminder}
        </p>
      </section>
    </div>
  );
}
