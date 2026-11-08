import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { ArchitecturalRail } from './ArchitecturalRail';
import { ContextualHeader } from './ContextualHeader';
import { GlobalSearchDialog } from './GlobalSearchDialog';
import {
  loadDemoNotifications,
  loadRailCompactPreference,
  markAllDemoNotificationsRead,
  markDemoNotificationRead,
  saveRailCompactPreference,
  type DemoNotificationItem,
} from './shellDemoState';
import { resolveActiveNavItem } from './shellNavigation';
import { WorkspaceShellUiContext } from './shellUiContext';

interface WorkspaceShellProps {
  children?: ReactNode;
}

/**
 * Reusable architectural container for all authenticated O+A Workspace views.
 * Owns chrome only: navigation rail, contextual header, global demo search,
 * demo notifications, and accessible skip/main framing around operational slots.
 */
export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const { currentUser, t } = useWorkspaceSession();
  const location = useLocation();

  const [railCompact, setRailCompactState] = useState<boolean>(() =>
    loadRailCompactPreference(),
  );
  const [mobileDrawerPath, setMobileDrawerPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<DemoNotificationItem[]>(
    () => loadDemoNotifications(),
  );
  const [liveStatus, setLiveStatus] = useState<string>('');

  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const activeNavItem = resolveActiveNavItem(location.pathname);
  const mobileDrawerOpen = mobileDrawerPath === location.pathname;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMobileDrawerPath(null);
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const setRailCompact = useCallback((compact: boolean) => {
    saveRailCompactPreference(compact);
    setRailCompactState(compact);
  }, []);

  const handleToggleRailCompact = useCallback(() => {
    setRailCompactState((prev) => {
      const next = !prev;
      saveRailCompactPreference(next);
      return next;
    });
  }, []);

  const handleMarkNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => markDemoNotificationRead(prev, id));
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => markAllDemoNotificationsRead(prev));
  }, []);

  const openSearch = useCallback(() => {
    setMobileDrawerPath(null);
    setSearchOpen(true);
  }, []);

  const shellUiValue = useMemo(
    () => ({
      railCompact,
      setRailCompact,
      openSearch,
    }),
    [railCompact, setRailCompact, openSearch],
  );

  return (
    <WorkspaceShellUiContext.Provider value={shellUiValue}>
      <div className="min-h-dvh w-full bg-[#111111] text-white flex">
        <a
          href="#workspace-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#A65D4A] focus:px-4 focus:py-2.5 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-white"
        >
          {t.common.skipToMain}
        </a>

        {/* Architectural Navigation Rail (Desktop Expanded/Compact + Mobile Drawer) */}
        <ArchitecturalRail
          compact={railCompact}
          onToggleCompact={handleToggleRailCompact}
          mobileOpen={mobileDrawerOpen}
          onCloseMobile={() => setMobileDrawerPath(null)}
        />

        {/* Main Column Frame */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ContextualHeader
            activeItem={activeNavItem}
            mobileMenuTriggerRef={mobileMenuTriggerRef}
            onOpenMobileMenu={() => setMobileDrawerPath(location.pathname)}
            onOpenSearch={openSearch}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onAnnounce={setLiveStatus}
          />

          {/* Screen-reader live region for shell-triggered state changes */}
          <p role="status" aria-live="polite" className="sr-only">
            {liveStatus}
          </p>

          {/* Main Architectural Canvas Slot */}
          <main
            id="workspace-main-content"
            tabIndex={-1}
            className="flex-1 min-w-0 w-full focus:outline-none"
          >
            {children ?? <Outlet />}
          </main>

          {/* Subtle Technical Colophon */}
          <footer className="px-4 sm:px-6 lg:px-10 py-3 oa-hairline-t bg-[#0C0C0C] flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-[#9E9E9E]">
            <span>
              {t.common.studioName} · {t.common.axisLabel}
            </span>
            <span>
              {currentUser?.code ?? 'O+A'} · {t.shell.header.sessionFooterBadge}
            </span>
          </footer>
        </div>

        {/* Global Search Modal (Demo) */}
        <GlobalSearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onAnnounce={setLiveStatus}
        />
      </div>
    </WorkspaceShellUiContext.Provider>
  );
}
