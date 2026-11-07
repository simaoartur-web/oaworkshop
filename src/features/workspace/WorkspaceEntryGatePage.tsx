import { ArrowLeft, CheckCircle2, LogOut, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import { LanguageToggle } from '../../design-system/LanguageToggle';
import { OABrandMark } from '../../design-system/OABrandMark';
import { pickLocalized } from '../../locales';

/**
 * Authenticated Phase 01 Checkpoint Frame at /workspace.
 * Completes the mandatory /login -> /welcome -> /workspace journey cleanly
 * without prematurely implementing Phase 02+ modules prior to user sign-off.
 */
export function WorkspaceEntryGatePage() {
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

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  const handleResetDemo = () => {
    setResetFeedback(t.common.resetConfirmed);
    resetAllDemoData();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh w-full bg-[#111111] text-white flex flex-col">
      <header className="w-full bg-[#0A0A0A] oa-hairline-b px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <OABrandMark subtitle={t.common.workspaceTitle} size="sm" />

          <div className="flex flex-wrap items-center gap-2.5">
            <LanguageToggle
              language={language}
              onChange={setLanguage}
              ptAriaLabel={t.common.switchToPt}
              enAriaLabel={t.common.switchToEn}
            />
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] px-4 border border-white/16 bg-[#161616] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.18em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={15} strokeWidth={1.35} aria-hidden="true" />
              <span>{t.common.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="max-w-4xl space-y-8">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#A65D4A]">
              <CheckCircle2 size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>{t.workspaceGate.phaseBadge}</span>
            </p>
            <h1 className="mt-3 text-2xl sm:text-4xl font-light tracking-tight text-white">
              {t.workspaceGate.heading}
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#BDBDBD]">
              {t.workspaceGate.description}
            </p>
          </div>

          {resetFeedback && (
            <p
              role="status"
              className="border-l-2 border-[#A65D4A] bg-white/[0.04] px-4 py-3 text-xs text-white"
            >
              {resetFeedback}
            </p>
          )}

          {/* Session Diagnostics & Controls Card */}
          <section
            aria-labelledby="session-state-heading"
            className="border border-white/14 bg-[#161616] p-5 sm:p-8 space-y-6"
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

              <button
                type="button"
                onClick={() =>
                  setSkipWelcomeOnLogin(!preferences.skipWelcomeOnLogin)
                }
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {DEMO_USERS.map((item) => {
                const active = item.id === currentUser.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchRole(item.role)}
                    aria-pressed={active}
                    className={`min-h-[52px] p-3 text-left border transition-colors cursor-pointer ${
                      active
                        ? 'border-[#A65D4A] bg-[#A65D4A]/16 text-white'
                        : 'border-white/12 bg-[#101010] text-[#BDBDBD] hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A65D4A]">
                      {item.code}
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
      </main>
    </div>
  );
}
