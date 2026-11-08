import { PanelLeftClose, PanelLeftOpen, X, LogOut } from 'lucide-react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { LanguageToggle } from '../../design-system/LanguageToggle';
import { OABrandMark } from '../../design-system/OABrandMark';
import { useDialogFocusTrap } from '../../design-system/useDialogFocusTrap';
import { pickLocalized } from '../../locales';
import {
  WORKSPACE_NAV_GROUPS,
  WORKSPACE_NAV_ITEMS,
  isNavItemActive,
} from './shellNavigation';

interface ArchitecturalRailProps {
  compact: boolean;
  onToggleCompact: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function ArchitecturalRail({
  compact,
  onToggleCompact,
  mobileOpen,
  onCloseMobile,
}: ArchitecturalRailProps) {
  const { language, t, setLanguage, signOut } = useWorkspaceSession();
  const location = useLocation();
  const navigate = useNavigate();

  const mobilePortalRef = useRef<HTMLDivElement | null>(null);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const mobileCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusTrap({
    open: mobileOpen,
    containerRef: mobileDrawerRef,
    portalRef: mobilePortalRef,
    initialFocusRef: mobileCloseBtnRef,
    onClose: onCloseMobile,
  });

  const handleMobileSignOut = () => {
    onCloseMobile();
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* DESKTOP ARCHITECTURAL NAVIGATION RAIL (>= 1024px) */}
      <aside
        aria-label={t.shell.navAriaLabel}
        data-rail-mode={compact ? 'compact' : 'expanded'}
        className={`hidden lg:flex flex-col shrink-0 bg-[#090909] oa-hairline-r sticky top-0 h-dvh select-none transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          compact ? 'w-[72px]' : 'w-[264px]'
        }`}
      >
        {/* Rail Plate Datum Block */}
        <div
          className={`h-16 shrink-0 flex items-center oa-hairline-b ${
            compact ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          {compact ? (
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center border border-[#A65D4A]/65 bg-[#A65D4A]/12 text-[11px] font-semibold tracking-[0.16em] text-white"
            >
              O+A
            </span>
          ) : (
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#A65D4A] truncate">
                {t.common.axisLabel}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-[#E0E0E0] truncate">
                {t.shell.railHeaderTitle}
              </p>
            </div>
          )}
        </div>

        {/* Technical Sheet Index List */}
        <nav
          aria-label={t.shell.navAriaLabel}
          className="flex-1 overflow-y-auto py-4 space-y-5"
        >
          {WORKSPACE_NAV_GROUPS.map((groupId, groupIdx) => {
            const groupItems = WORKSPACE_NAV_ITEMS.filter(
              (item) => item.group === groupId,
            );
            return (
              <div
                key={groupId}
                className={groupIdx > 0 ? 'pt-4 oa-hairline-t' : ''}
              >
                {!compact && (
                  <p className="px-5 mb-2 text-[11px] font-medium uppercase tracking-[0.20em] text-[#9E9E9E]">
                    {t.shell.groups[groupId]}
                  </p>
                )}

                <ul className="space-y-0.5 px-2">
                  {groupItems.map((item) => {
                    const active = isNavItemActive(location.pathname, item);
                    const Icon = item.icon;
                    const label = pickLocalized(item.label, language);
                    const phase = pickLocalized(item.targetPhase, language);

                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          aria-current={active ? 'page' : undefined}
                          aria-label={
                            compact
                              ? `${item.plateNumber} · ${label} (${phase})`
                              : undefined
                          }
                          title={compact ? `${item.plateNumber} · ${label}` : undefined}
                          className={`group relative min-h-[44px] flex items-center border-l-2 transition-colors ${
                            compact
                              ? 'flex-col justify-center gap-0.5 px-1 py-1.5'
                              : 'gap-3 px-3 py-2'
                          } ${
                            active
                              ? 'border-[#A65D4A] bg-[#161616] text-white'
                              : 'border-transparent text-[#BDBDBD] hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          {!compact && (
                            <span
                              aria-hidden="true"
                              className={`w-5 font-mono text-[11px] shrink-0 ${
                                active ? 'text-[#A65D4A]' : 'text-[#9E9E9E]'
                              }`}
                            >
                              {item.plateNumber}
                            </span>
                          )}

                          <Icon
                            size={16}
                            strokeWidth={active ? 1.6 : 1.25}
                            className={`shrink-0 ${
                              active
                                ? 'text-[#A65D4A]'
                                : 'text-[#BDBDBD] group-hover:text-white'
                            }`}
                            aria-hidden="true"
                          />

                          {compact ? (
                            <span
                              aria-hidden="true"
                              className={`text-[9px] font-mono leading-none ${
                                active ? 'text-white' : 'text-[#9E9E9E]'
                              }`}
                            >
                              {item.plateNumber}
                            </span>
                          ) : (
                            <>
                              <span className="flex-1 truncate text-[13px] font-normal tracking-wide">
                                {label}
                              </span>
                              <span
                                className={`text-[10px] font-mono tracking-wider shrink-0 ${
                                  item.status === 'planned'
                                    ? 'text-[#9E9E9E]'
                                    : 'text-[#A65D4A]'
                                }`}
                              >
                                {item.shortTag}
                              </span>
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse / Expand Orthogonal Footer */}
        <div className="shrink-0 oa-hairline-t p-2 bg-[#070707]">
          <button
            type="button"
            onClick={onToggleCompact}
            aria-expanded={!compact}
            aria-label={compact ? t.shell.expandRail : t.shell.collapseRail}
            className={`w-full min-h-[44px] flex items-center text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer ${
              compact ? 'justify-center px-1' : 'justify-between px-3'
            }`}
          >
            {!compact && (
              <span className="truncate">{t.shell.collapseRail}</span>
            )}
            {compact ? (
              <PanelLeftOpen size={17} strokeWidth={1.35} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={17} strokeWidth={1.35} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE & TABLET ARCHITECTURAL DRAWER (< 1024px) */}
      {mobileOpen &&
        createPortal(
          <div
            ref={mobilePortalRef}
            data-oa-dialog-portal="true"
            className="fixed inset-0 z-50 flex lg:hidden bg-black/80"
            onClick={onCloseMobile}
          >
            <div
              ref={mobileDrawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.shell.navAriaLabel}
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[320px] h-full bg-[#090909] border-r border-white/16 text-white flex flex-col shadow-2xl focus:outline-none"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3.5 oa-hairline-b bg-[#0D0D0D]">
                <OABrandMark subtitle={t.shell.mobileDrawerTitle} size="sm" />
                <button
                  ref={mobileCloseBtnRef}
                  type="button"
                  onClick={onCloseMobile}
                  aria-label={t.shell.closeNavMenu}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 text-[#BDBDBD] hover:text-white hover:border-white/35 transition-colors cursor-pointer"
                >
                  <X size={18} strokeWidth={1.35} aria-hidden="true" />
                </button>
              </div>

              <nav
                aria-label={t.shell.navAriaLabel}
                className="flex-1 overflow-y-auto py-4 space-y-5"
              >
                {WORKSPACE_NAV_GROUPS.map((groupId, groupIdx) => {
                  const groupItems = WORKSPACE_NAV_ITEMS.filter(
                    (item) => item.group === groupId,
                  );
                  return (
                    <div
                      key={groupId}
                      className={groupIdx > 0 ? 'pt-4 oa-hairline-t' : ''}
                    >
                      <p className="px-4 mb-2 text-[11px] font-medium uppercase tracking-[0.20em] text-[#9E9E9E]">
                        {t.shell.groups[groupId]}
                      </p>
                      <ul className="space-y-0.5 px-2">
                        {groupItems.map((item) => {
                          const active = isNavItemActive(location.pathname, item);
                          const Icon = item.icon;
                          const label = pickLocalized(item.label, language);
                          return (
                            <li key={item.id}>
                              <Link
                                to={item.path}
                                onClick={onCloseMobile}
                                aria-current={active ? 'page' : undefined}
                                className={`min-h-[44px] flex items-center gap-3 px-3 py-2 border-l-2 transition-colors ${
                                  active
                                    ? 'border-[#A65D4A] bg-[#161616] text-white'
                                    : 'border-transparent text-[#BDBDBD] hover:text-white hover:bg-white/[0.03]'
                                }`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`w-5 font-mono text-[11px] shrink-0 ${
                                    active ? 'text-[#A65D4A]' : 'text-[#9E9E9E]'
                                  }`}
                                >
                                  {item.plateNumber}
                                </span>
                                <Icon
                                  size={16}
                                  strokeWidth={active ? 1.6 : 1.25}
                                  className={active ? 'text-[#A65D4A]' : 'text-[#BDBDBD]'}
                                  aria-hidden="true"
                                />
                                <span className="flex-1 truncate text-sm">
                                  {label}
                                </span>
                                <span
                                  className={`text-[10px] font-mono ${
                                    item.status === 'planned'
                                      ? 'text-[#9E9E9E]'
                                      : 'text-[#A65D4A]'
                                  }`}
                                >
                                  {item.shortTag}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>

              {/* Drawer Footer Utilities (Language & Logout comfortably reachable at 375px) */}
              <div className="p-4 oa-hairline-t bg-[#070707] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <LanguageToggle
                    language={language}
                    onChange={setLanguage}
                    ptAriaLabel={t.common.switchToPt}
                    enAriaLabel={t.common.switchToEn}
                  />
                  <button
                    type="button"
                    onClick={handleMobileSignOut}
                    className="min-h-[44px] px-3 border border-white/14 bg-[#141414] hover:border-[#A65D4A] text-xs uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} strokeWidth={1.35} aria-hidden="true" />
                    <span>{t.common.logout}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
