import {
  ChevronDown,
  Compass,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import { LanguageToggle } from '../../design-system/LanguageToggle';
import { OABrandMark } from '../../design-system/OABrandMark';
import { pickLocalized } from '../../locales';
import { formatStudioClocks } from '../../utils/timeGreeting';
import { NotificationsPopover } from './NotificationsPopover';
import type { DemoNotificationItem } from './shellDemoState';
import type { WorkspaceNavItem } from './shellNavigation';

interface ContextualHeaderProps {
  activeItem?: WorkspaceNavItem;
  mobileMenuTriggerRef: RefObject<HTMLButtonElement | null>;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  notifications: DemoNotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onAnnounce: (message: string) => void;
}

export function ContextualHeader({
  activeItem,
  mobileMenuTriggerRef,
  onOpenMobileMenu,
  onOpenSearch,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onAnnounce,
}: ContextualHeaderProps) {
  const { currentUser, language, t, setLanguage, signOut } =
    useWorkspaceSession();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuContainerRef = useRef<HTMLDivElement | null>(null);
  const userMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const userMenuId = useId();

  useEffect(() => {
    if (!userMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setUserMenuOpen(false);
        userMenuTriggerRef.current?.focus();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (
        userMenuContainerRef.current &&
        event.target instanceof Node &&
        !userMenuContainerRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [userMenuOpen]);

  if (!currentUser) {
    return null;
  }

  const department = DEPARTMENTS[currentUser.departmentId];
  const clocks = formatStudioClocks();
  const activeRouteLabel = activeItem
    ? pickLocalized(activeItem.label, language)
    : t.shell.breadcrumbsRoot;

  const handleLogout = () => {
    setUserMenuOpen(false);
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0A0A] oa-hairline-b px-3 sm:px-5 lg:px-7 h-16 flex items-center justify-between gap-3">
      {/* Left Cluster: Mobile Menu + O+A Brand + Contextual Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
        <button
          ref={mobileMenuTriggerRef}
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={t.shell.openNavMenu}
          className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 bg-[#141414] hover:border-[#A65D4A] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <Menu size={18} strokeWidth={1.35} aria-hidden="true" />
        </button>

        <Link
          to="/workspace"
          className="inline-flex items-center py-1 shrink-0 focus-visible:outline-2"
          aria-label={`O+A ${t.common.workspaceTitle}`}
        >
          <OABrandMark
            subtitle={t.common.workspaceTitle}
            size="sm"
            hideDetailsOnMobile
          />
        </Link>

        {/* Contextual Navigation Breadcrumb (>= 1280px) */}
        <nav
          aria-label={t.shell.breadcrumbsRoot}
          className="hidden xl:flex items-center gap-2 min-w-0 pl-3 border-l border-white/14 overflow-hidden"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#A65D4A] whitespace-nowrap shrink-0">
            {department.code}
          </span>
          <span aria-hidden="true" className="text-white/25 shrink-0">
            /
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-white truncate">
            {activeRouteLabel}
          </span>
        </nav>
      </div>

      {/* Right Cluster: Studio Clock, Search, Bell, PT/EN, User Profile & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Dual Studio Axis Clocks on wide viewports (>= 1536px) */}
        <div
          aria-label={t.shell.header.studioClockLabel}
          className="hidden 2xl:flex items-center gap-2 px-2.5 py-1.5 border border-white/10 bg-[#111111] text-[11px] font-mono tracking-[0.10em] whitespace-nowrap"
        >
          <span
            className={
              currentUser.studioBase === 'Maputo'
                ? 'text-white font-medium'
                : 'text-[#9E9E9E]'
            }
          >
            MAP {clocks.maputo}
          </span>
          <span aria-hidden="true" className="text-white/20">
            ·
          </span>
          <span
            className={
              currentUser.studioBase === 'Milão'
                ? 'text-white font-medium'
                : 'text-[#9E9E9E]'
            }
          >
            MIL {clocks.milan}
          </span>
        </div>

        {/* Global Search Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label={t.shell.search.triggerAria}
          className="min-h-[44px] min-w-[44px] xl:px-3 border border-white/14 bg-[#141414] hover:border-[#A65D4A] text-xs uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Search size={15} strokeWidth={1.35} aria-hidden="true" />
          <span className="hidden xl:inline">{t.shell.search.triggerLabel}</span>
          <kbd className="hidden 2xl:inline-block border border-white/14 bg-[#0B0B0B] px-1.5 py-0.5 text-[10px] font-mono text-[#9E9E9E]">
            {t.shell.search.triggerShortcut}
          </kbd>
        </button>

        {/* Notifications Popover */}
        <NotificationsPopover
          items={notifications}
          onMarkRead={onMarkNotificationRead}
          onMarkAllRead={onMarkAllNotificationsRead}
          onAnnounce={onAnnounce}
        />

        {/* Language Toggle (>= 640px directly visible; also inside Mobile Drawer & User Menu) */}
        <div className="hidden sm:inline-flex">
          <LanguageToggle
            language={language}
            onChange={setLanguage}
            ptAriaLabel={t.common.switchToPt}
            enAriaLabel={t.common.switchToEn}
          />
        </div>

        {/* Demo Collaborator Context Menu */}
        <div ref={userMenuContainerRef} className="relative">
          <button
            ref={userMenuTriggerRef}
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-controls={userMenuId}
            aria-label={t.shell.header.userMenuAria}
            className={`min-h-[44px] px-2 sm:px-2.5 border inline-flex items-center gap-2 transition-colors cursor-pointer ${
              userMenuOpen
                ? 'border-[#A65D4A] bg-[#1C1C1C] text-white'
                : 'border-white/14 bg-[#141414] text-white hover:border-white/30'
            }`}
          >
            <span className="h-7 w-7 border border-[#A65D4A]/70 bg-[#A65D4A]/16 inline-flex items-center justify-center text-[11px] font-semibold tracking-wider text-white shrink-0">
              {currentUser.initials}
            </span>
            <span className="hidden xl:flex flex-col items-start leading-tight max-w-[125px]">
              <span className="text-xs font-medium text-white truncate max-w-full">
                {currentUser.name.replace(' (Demo)', '')}
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#BDBDBD] truncate max-w-full">
                {currentUser.code} · {currentUser.studioBase}
              </span>
            </span>
            <ChevronDown
              size={14}
              strokeWidth={1.4}
              className="hidden sm:inline text-[#9E9E9E]"
              aria-hidden="true"
            />
          </button>

          {userMenuOpen && (
            <div
              id={userMenuId}
              role="menu"
              aria-label={t.shell.header.userMenuAria}
              className="fixed inset-x-3 top-[68px] sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80 z-40 border border-white/20 bg-[#111111] text-white shadow-2xl"
            >
              <div className="px-4 py-3.5 bg-[#0A0A0A] oa-hairline-b space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#A65D4A]">
                  {currentUser.code} · {t.common.demoBadge}
                </p>
                <p className="text-sm font-medium text-white">
                  {currentUser.name}
                </p>
                <p className="text-xs text-[#BDBDBD]">
                  {pickLocalized(currentUser.roleLabel, language)}
                </p>
                <p className="text-[11px] text-[#9E9E9E]">
                  {t.shell.header.activeDepartmentLabel}:{' '}
                  {pickLocalized(department.name, language)} ({currentUser.studioBase})
                </p>
              </div>

              <div className="p-2 space-y-1">
                <Link
                  to="/workspace/settings"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2 flex items-center gap-2.5 text-xs uppercase tracking-[0.14em] text-[#E0E0E0] hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <SlidersHorizontal size={14} strokeWidth={1.35} aria-hidden="true" />
                  <span>{t.shell.header.preferencesAction}</span>
                </Link>

                <Link
                  to="/welcome"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2 flex items-center gap-2.5 text-xs uppercase tracking-[0.14em] text-[#E0E0E0] hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <Compass size={14} strokeWidth={1.35} aria-hidden="true" />
                  <span>{t.shell.header.welcomeAction}</span>
                </Link>

                <div className="sm:hidden px-3 py-2 oa-hairline-t">
                  <LanguageToggle
                    language={language}
                    onChange={setLanguage}
                    ptAriaLabel={t.common.switchToPt}
                    enAriaLabel={t.common.switchToEn}
                  />
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full min-h-[44px] px-3 py-2 flex items-center gap-2.5 oa-hairline-t text-left text-xs uppercase tracking-[0.14em] text-[#E58573] hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <LogOut size={14} strokeWidth={1.4} aria-hidden="true" />
                  <span>{t.common.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Logout Icon Action on Tablet/Desktop (>= 768px) */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label={t.common.logout}
          title={t.common.logout}
          className="hidden md:inline-flex min-h-[44px] min-w-[44px] px-2.5 border border-white/14 bg-transparent hover:border-[#A65D4A] text-xs uppercase tracking-[0.12em] text-[#BDBDBD] hover:text-white items-center justify-center transition-colors cursor-pointer"
        >
          <LogOut size={15} strokeWidth={1.35} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
