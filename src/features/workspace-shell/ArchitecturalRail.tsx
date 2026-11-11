import { PanelLeftClose, PanelLeftOpen, X, LogOut } from 'lucide-react';
import { useRef, useState } from 'react';
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
  isNavItemAvailable,
  type WorkspaceNavItem,
} from './shellNavigation';

interface ArchitecturalRailProps {
  compact: boolean;
  onToggleCompact: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface CompactTooltipState {
  label: string;
  availability: string;
  available: boolean;
  top: number;
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
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const [compactTooltip, setCompactTooltip] =
    useState<CompactTooltipState | null>(null);

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

  const showCompactTooltip = (
    element: HTMLElement,
    item: WorkspaceNavItem,
  ) => {
    if (!compact) {
      return;
    }
    const rect = element.getBoundingClientRect();
    const available = isNavItemAvailable(item);
    setCompactTooltip({
      label: pickLocalized(item.label, language),
      availability: available
        ? t.shell.availability.activeModuleAria
        : t.shell.availability.unavailableModuleAria,
      available,
      top: rect.top + rect.height / 2,
    });
  };

  const renderNavGroups = (mode: 'desktop' | 'mobile') => {
    const isCompactDesktop = mode === 'desktop' && compact;

    return WORKSPACE_NAV_GROUPS.map((groupId, groupIdx) => {
      const groupItems = WORKSPACE_NAV_ITEMS.filter(
        (item) => item.group === groupId,
      );
      const isAvailableGroup = groupId === 'atelier';

      return (
        <div
          key={groupId}
          className={groupIdx > 0 ? 'pt-3.5 oa-hairline-t' : ''}
        >
          {!isCompactDesktop && (
            <div
              className={`flex items-center gap-2 mb-2 ${
                mode === 'mobile' ? 'px-4' : 'px-4'
              }`}
            >
              {isAvailableGroup && (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 bg-[#A65D4A] shrink-0"
                />
              )}
              <p
                className={`text-[11px] font-medium uppercase tracking-[0.16em] ${
                  isAvailableGroup ? 'text-[#CE826D]' : 'text-[#B8B8B8]'
                }`}
              >
                {t.shell.groups[groupId]}
              </p>
            </div>
          )}

          <ul className="space-y-1 px-2">
            {groupItems.map((item) => {
              const active = isNavItemActive(location.pathname, item);
              const available = isNavItemAvailable(item);
              const Icon = item.icon;
              const label = pickLocalized(item.label, language);
              const availabilityText = available
                ? t.shell.availability.activeModuleAria
                : t.shell.availability.unavailableModuleAria;
              const compactAria = `${item.plateNumber} · ${label} (${availabilityText})`;
              const desktopAria = available
                ? undefined
                : `${label} — ${t.shell.availability.unavailableModuleAria}`;

              const itemStateClasses = active
                ? available
                  ? 'border-[#A65D4A] bg-[#1C1615] text-white font-medium'
                  : 'border-white/55 bg-[#161616] text-white font-medium'
                : available
                  ? 'border-transparent text-[#ECECEC] hover:text-white hover:bg-white/[0.05] hover:border-white/30'
                  : 'border-transparent text-[#B8B8B8] hover:text-white hover:bg-white/[0.03] hover:border-white/20';

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={
                      mode === 'mobile'
                        ? onCloseMobile
                        : () => setCompactTooltip(null)
                    }
                    onMouseEnter={
                      isCompactDesktop
                        ? (event) => showCompactTooltip(event.currentTarget, item)
                        : undefined
                    }
                    onMouseLeave={
                      isCompactDesktop
                        ? () => setCompactTooltip(null)
                        : undefined
                    }
                    onFocus={
                      isCompactDesktop
                        ? (event) => showCompactTooltip(event.currentTarget, item)
                        : undefined
                    }
                    onBlur={
                      isCompactDesktop
                        ? () => setCompactTooltip(null)
                        : undefined
                    }
                    aria-current={active ? 'page' : undefined}
                    aria-label={isCompactDesktop ? compactAria : desktopAria}
                    title={isCompactDesktop ? compactAria : undefined}
                    className={`group relative min-h-[44px] flex items-center border-l-[3px] transition-colors focus-visible:bg-white/[0.06] ${
                      isCompactDesktop
                        ? 'flex-col justify-center gap-1 px-1 py-1.5'
                        : 'gap-2 px-2 py-2'
                    } ${itemStateClasses}`}
                  >
                    {!isCompactDesktop && (
                      <span
                        aria-hidden="true"
                        className={`w-4 font-mono text-[11px] shrink-0 ${
                          active
                            ? available
                              ? 'text-[#CE826D]'
                              : 'text-white'
                            : available
                              ? 'text-[#CE826D]'
                              : 'text-[#B0B0B0]'
                        }`}
                      >
                        {item.plateNumber}
                      </span>
                    )}

                    <div className="relative shrink-0 inline-flex items-center justify-center">
                      <Icon
                        size={15}
                        strokeWidth={active || available ? 1.6 : 1.25}
                        className={
                          active
                            ? available
                              ? 'text-[#CE826D]'
                              : 'text-white'
                            : available
                              ? 'text-[#CE826D] group-hover:text-white'
                              : 'text-[#B0B0B0] group-hover:text-white'
                        }
                        aria-hidden="true"
                      />
                      {isCompactDesktop && available && (
                        <span
                          aria-hidden="true"
                          className="absolute -top-1 -right-1.5 h-1.5 w-1.5 bg-[#A65D4A]"
                        />
                      )}
                    </div>

                    {isCompactDesktop ? (
                      <span
                        aria-hidden="true"
                        className={`text-[11px] font-mono leading-none ${
                          active
                            ? 'text-white font-semibold'
                            : available
                              ? 'text-[#E0E0E0]'
                              : 'text-[#B0B0B0]'
                        }`}
                      >
                        {item.plateNumber}
                      </span>
                    ) : (
                      <>
                        <span
                          className={`flex-1 min-w-0 truncate ${
                            mode === 'mobile' ? 'text-sm' : 'text-[13px]'
                          }`}
                        >
                          {label}
                        </span>

                        {available ? (
                          <span
                            className={`text-[11px] font-medium px-1.5 py-0.5 leading-none shrink-0 ${
                              active
                                ? 'border border-[#A65D4A]/70 bg-[#A65D4A]/22 text-white'
                                : 'text-[#CE826D]'
                            }`}
                          >
                            {active
                              ? t.shell.availability.currentTag
                              : t.shell.availability.activeNow}
                          </span>
                        ) : (
                          <span className="inline-flex items-center border border-dashed border-white/20 bg-white/[0.02] px-1.5 py-0.5 text-[11px] leading-none text-[#B8B8B8] shrink-0">
                            {t.shell.availability.unavailableTag}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      );
    });
  };

  return (
    <>
      {/* DESKTOP ARCHITECTURAL NAVIGATION RAIL (>= 1024px) */}
      <aside
        aria-label={t.shell.navAriaLabel}
        data-rail-mode={compact ? 'compact' : 'expanded'}
        className={`hidden lg:flex flex-col shrink-0 lg:h-full bg-[#090909] oa-hairline-r select-none transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          compact ? 'w-[72px]' : 'w-[264px]'
        }`}
      >
        {/* Rail Plate Datum Block */}
        <div
          className={`h-16 shrink-0 flex items-center oa-hairline-b ${
            compact ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {compact ? (
            <Link
              to="/workspace"
              aria-label={t.shell.availability.returnToDeskAria}
              title={`O+A · ${t.shell.availability.returnToDeskAction}`}
              className="inline-flex h-10 w-10 items-center justify-center border border-[#A65D4A]/70 bg-[#A65D4A]/15 text-xs font-semibold tracking-[0.14em] text-white hover:border-[#CE826D] transition-colors"
            >
              O+A
            </Link>
          ) : (
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#CE826D] truncate">
                {t.common.axisLabel}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.15em] text-[#E6E6E6] truncate">
                {t.shell.railHeaderTitle}
              </p>
            </div>
          )}
        </div>

        {/* Independent Scrolling Navigation List */}
        <nav
          ref={desktopNavRef}
          aria-label={t.shell.navAriaLabel}
          onScroll={() => setCompactTooltip(null)}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3.5 space-y-4"
        >
          {renderNavGroups('desktop')}
        </nav>

        {/* Collapse / Expand Orthogonal Footer */}
        <div className="shrink-0 oa-hairline-t p-2 bg-[#070707]">
          <button
            type="button"
            onClick={() => {
              setCompactTooltip(null);
              onToggleCompact();
            }}
            aria-expanded={!compact}
            aria-label={compact ? t.shell.expandRail : t.shell.collapseRail}
            className={`w-full min-h-[44px] flex items-center text-[11px] font-medium uppercase tracking-[0.12em] text-[#D4D4D4] hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer ${
              compact ? 'justify-center px-1' : 'justify-between px-3'
            }`}
          >
            {!compact && (
              <span className="truncate">{t.shell.collapseRail}</span>
            )}
            {compact ? (
              <PanelLeftOpen size={17} strokeWidth={1.4} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={17} strokeWidth={1.4} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* Non-clipped Visual Label Tooltip for Collapsed Rail (hover & keyboard focus) */}
      {compact && compactTooltip && (
        <div
          aria-hidden="true"
          style={{ top: `${compactTooltip.top}px` }}
          className="hidden lg:flex fixed left-[80px] -translate-y-1/2 z-40 pointer-events-none flex-col border border-white/22 bg-[#141414] px-3 py-2 shadow-2xl min-w-[180px]"
        >
          <span className="text-xs font-medium text-white whitespace-nowrap">
            {compactTooltip.label}
          </span>
          <span
            className={`mt-0.5 text-[11px] whitespace-nowrap ${
              compactTooltip.available ? 'text-[#CE826D]' : 'text-[#BDBDBD]'
            }`}
          >
            {compactTooltip.availability}
          </span>
        </div>
      )}

      {/* MOBILE & TABLET ARCHITECTURAL DRAWER (< 1024px) */}
      {mobileOpen &&
        createPortal(
          <div
            ref={mobilePortalRef}
            data-oa-dialog-portal="true"
            className="fixed inset-0 z-50 flex lg:hidden bg-black/82"
            onClick={onCloseMobile}
          >
            <div
              ref={mobileDrawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.shell.navAriaLabel}
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[320px] h-full bg-[#090909] border-r border-white/18 text-white flex flex-col shadow-2xl focus:outline-none"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3.5 oa-hairline-b bg-[#0D0D0D]">
                <OABrandMark subtitle={t.shell.mobileDrawerTitle} size="sm" />
                <button
                  ref={mobileCloseBtnRef}
                  type="button"
                  onClick={onCloseMobile}
                  aria-label={t.shell.closeNavMenu}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 text-[#E0E0E0] hover:text-white hover:border-white/40 transition-colors cursor-pointer"
                >
                  <X size={18} strokeWidth={1.35} aria-hidden="true" />
                </button>
              </div>

              <nav
                aria-label={t.shell.navAriaLabel}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3.5 space-y-4"
              >
                {renderNavGroups('mobile')}
              </nav>

              {/* Drawer Footer Utilities (Language & Logout comfortably reachable at 375px) */}
              <div className="p-4 oa-hairline-t bg-[#070707] space-y-3 shrink-0">
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
                    className="min-h-[44px] px-3 border border-white/16 bg-[#141414] hover:border-[#A65D4A] text-xs uppercase tracking-[0.12em] text-[#E6E6E6] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
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
