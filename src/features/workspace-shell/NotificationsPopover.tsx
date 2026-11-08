import { ArrowUpRight, Bell, Check, CheckCheck, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { pickLocalized } from '../../locales';
import type { DemoNotificationItem } from './shellDemoState';

interface NotificationsPopoverProps {
  items: DemoNotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onAnnounce: (message: string) => void;
}

export function NotificationsPopover({
  items,
  onMarkRead,
  onMarkAllRead,
  onAnnounce,
}: NotificationsPopoverProps) {
  const { language, t } = useWorkspaceSession();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  const unreadCount = items.filter((item) => !item.read).length;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleMarkSingle = (id: string) => {
    onMarkRead(id);
    onAnnounce(t.shell.notifications.markedReadAnnouncement);
  };

  const handleMarkAll = () => {
    onMarkAllRead();
    onAnnounce(t.shell.notifications.markedAllReadAnnouncement);
  };

  const handleNavigate = (path: string, id: string, alreadyRead: boolean) => {
    if (!alreadyRead) {
      onMarkRead(id);
    }
    setOpen(false);
    navigate(path);
  };

  const triggerLabel =
    unreadCount > 0
      ? `${t.shell.notifications.triggerAria} (${unreadCount} ${t.shell.notifications.unreadSrSuffix})`
      : t.shell.notifications.triggerAria;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={triggerLabel}
        className={`relative min-h-[44px] min-w-[44px] px-2.5 border inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          open
            ? 'border-[#A65D4A] bg-[#1C1C1C] text-white'
            : 'border-white/14 bg-[#141414] text-[#E0E0E0] hover:border-white/30 hover:text-white'
        }`}
      >
        <Bell size={16} strokeWidth={1.35} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center bg-[#A65D4A] text-[10px] font-semibold leading-none text-white"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-label={t.shell.notifications.heading}
          className="fixed inset-x-3 top-[68px] sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[390px] z-40 border border-white/20 bg-[#111111] text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-4 py-3.5 bg-[#0A0A0A] oa-hairline-b">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.20em] text-white">
                {t.shell.notifications.heading}
              </h2>
              <p className="mt-1 text-[11px] text-[#9E9E9E]">
                {t.shell.notifications.subheading}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label={t.shell.notifications.closeLabel}
              className="min-h-[44px] min-w-[44px] -my-1.5 -mr-1.5 inline-flex items-center justify-center text-[#BDBDBD] hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={1.35} aria-hidden="true" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[#141414] oa-hairline-b">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#A65D4A]">
              {unreadCount > 0
                ? `${unreadCount} ${t.shell.notifications.unreadSrSuffix}`
                : t.shell.notifications.empty}
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="min-h-[36px] px-2.5 py-1 border border-white/14 bg-[#181818] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCheck size={13} strokeWidth={1.4} aria-hidden="true" />
                <span>{t.shell.notifications.markAllRead}</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <ul className="max-h-[55dvh] overflow-y-auto divide-y divide-white/10">
            {items.map((item) => (
              <li
                key={item.id}
                className={`relative px-4 py-3.5 transition-colors ${
                  item.read ? 'bg-[#111111]' : 'bg-[#161616]'
                }`}
              >
                {!item.read && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0.5 bg-[#A65D4A]"
                  />
                )}

                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em]">
                  <span
                    className={
                      item.read
                        ? 'font-mono text-[#9E9E9E]'
                        : 'font-mono font-semibold text-[#A65D4A]'
                    }
                  >
                    {item.code} · {pickLocalized(item.category, language)}
                  </span>
                  <span className="text-[#9E9E9E]">
                    {pickLocalized(item.timestampLabel, language)}
                  </span>
                </div>

                <p className="mt-1.5 text-sm font-medium text-white leading-snug">
                  {pickLocalized(item.title, language)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#BDBDBD]">
                  {pickLocalized(item.detail, language)}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {item.studioTag}
                  </span>

                  <div className="flex items-center gap-2">
                    {!item.read ? (
                      <button
                        type="button"
                        onClick={() => handleMarkSingle(item.id)}
                        className="min-h-[36px] px-2.5 border border-white/16 bg-[#111111] hover:border-[#A65D4A] text-[11px] uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check size={12} strokeWidth={1.6} aria-hidden="true" />
                        <span>{t.shell.notifications.markOneRead}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                        {t.shell.notifications.readLabel}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(item.targetPath, item.id, item.read)
                      }
                      aria-label={`${t.shell.notifications.openRelated}: ${pickLocalized(
                        item.title,
                        language,
                      )}`}
                      className="min-h-[36px] px-2.5 border border-white/14 bg-transparent hover:border-white/35 text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{t.shell.notifications.openRelated}</span>
                      <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Honest Demo Footer */}
          <div className="px-4 py-2.5 bg-[#0A0A0A] oa-hairline-t">
            <p className="text-[11px] leading-relaxed text-[#9E9E9E]">
              {t.shell.notifications.honestFooter}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
