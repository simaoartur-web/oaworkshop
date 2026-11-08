import { ArrowRight, Search, X } from 'lucide-react';
import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { useDialogFocusTrap } from '../../design-system/useDialogFocusTrap';
import {
  searchWorkspaceDemo,
  type WorkspaceSearchEntry,
} from './globalSearchIndex';

interface GlobalSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onAnnounce: (message: string) => void;
}

function GlobalSearchModalContent({
  onClose,
  onAnnounce,
}: Omit<GlobalSearchDialogProps, 'open'>) {
  const { language, t, switchRole } = useWorkspaceSession();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const portalRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const titleId = useId();
  const listboxId = useId();

  useDialogFocusTrap({
    open: true,
    containerRef: dialogRef,
    portalRef,
    initialFocusRef: inputRef,
    onClose,
  });

  const results = useMemo(
    () => searchWorkspaceDemo(query, language),
    [query, language],
  );

  const safeActiveIndex =
    results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0;

  const activateEntry = (entry: WorkspaceSearchEntry) => {
    if (entry.switchToRole) {
      switchRole(entry.switchToRole);
      onAnnounce(t.shell.search.roleSwitchedAnnouncement);
    }
    onClose();
    navigate(entry.targetPath);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (safeActiveIndex + 1) % results.length;
      setActiveIndex(next);
      resultRefs.current[next]?.scrollIntoView?.({ block: 'nearest' });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = (safeActiveIndex - 1 + results.length) % results.length;
      setActiveIndex(next);
      resultRefs.current[next]?.scrollIntoView?.({ block: 'nearest' });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const target = results[safeActiveIndex];
      if (target) {
        activateEntry(target);
      }
    }
  };

  const activeEntry = results[safeActiveIndex];
  const optionId = (entryId: string) => `${listboxId}-opt-${entryId}`;

  return createPortal(
    <div
      ref={portalRef}
      data-oa-dialog-portal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/82 px-3 sm:px-6 pt-12 sm:pt-20 pb-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl border border-white/20 bg-[#111111] text-white shadow-2xl flex flex-col max-h-[82dvh] focus:outline-none"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 bg-[#0A0A0A] oa-hairline-b">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#A65D4A]">
              {t.shell.search.dialogCode}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg sm:text-xl font-light tracking-tight text-white"
            >
              {t.shell.search.dialogTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.closeDialog}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 text-[#BDBDBD] hover:text-white hover:border-white/35 transition-colors cursor-pointer"
          >
            <X size={17} strokeWidth={1.35} aria-hidden="true" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#151515] oa-hairline-b">
          <div className="flex items-center gap-3">
            <Search
              size={18}
              strokeWidth={1.35}
              className="text-[#A65D4A] shrink-0"
              aria-hidden="true"
            />
            <label htmlFor="oa-global-search-input" className="sr-only">
              {t.shell.search.inputLabel}
            </label>
            <input
              ref={inputRef}
              id="oa-global-search-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-activedescendant={
                activeEntry ? optionId(activeEntry.id) : undefined
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={t.shell.search.inputPlaceholder}
              className="w-full min-h-[44px] bg-transparent text-sm sm:text-base text-white placeholder:text-[#9E9E9E] focus:outline-none"
            />
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveIndex(0);
                  inputRef.current?.focus();
                }}
                aria-label={t.shell.search.clearAction}
                className="min-h-[44px] px-2.5 text-[11px] uppercase tracking-[0.16em] text-[#BDBDBD] hover:text-white border border-white/12 cursor-pointer shrink-0"
              >
                {language === 'pt' ? 'Limpar' : 'Clear'}
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] text-[#9E9E9E]">
            {t.shell.search.honestNotice}
          </p>
        </div>

        {/* Results / Honest Empty State */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {results.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#BDBDBD]">
                  {query.trim()
                    ? `${t.shell.search.resultsHeading} (${results.length})`
                    : t.shell.search.suggestedHeading}
                </p>
                <span className="hidden sm:inline text-[11px] font-mono text-[#9E9E9E]">
                  {t.shell.search.keyboardHint}
                </span>
              </div>

              <ul
                id={listboxId}
                role="listbox"
                aria-label={t.shell.search.dialogTitle}
                className="divide-y divide-white/10 border border-white/12"
              >
                {results.map((entry, idx) => {
                  const isHighlighted = idx === safeActiveIndex;
                  const categoryLabel = t.shell.search.categories[entry.category];
                  const actionLabel =
                    entry.category === 'profile'
                      ? t.shell.search.actions.activateProfile
                      : entry.category === 'study'
                        ? t.shell.search.actions.viewStudy
                        : t.shell.search.actions.openRoute;

                  return (
                    <li
                      key={entry.id}
                      id={optionId(entry.id)}
                      role="option"
                      aria-selected={isHighlighted}
                    >
                      <button
                        ref={(el) => {
                          resultRefs.current[idx] = el;
                        }}
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => activateEntry(entry)}
                        className={`w-full min-h-[56px] px-4 py-3 text-left flex items-center justify-between gap-4 border-l-2 transition-colors cursor-pointer ${
                          isHighlighted
                            ? 'border-[#A65D4A] bg-[#1B1B1B] text-white'
                            : 'border-transparent bg-[#121212] text-[#E0E0E0] hover:bg-[#171717]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
                            <span className="font-mono font-semibold text-[#A65D4A]">
                              {entry.code}
                            </span>
                            <span aria-hidden="true" className="text-white/25">
                              ·
                            </span>
                            <span className="text-[#9E9E9E]">
                              {categoryLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-white truncate">
                            {entry.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#BDBDBD] truncate">
                            {entry.subtitle}
                          </p>
                        </div>

                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] shrink-0">
                          <span>{actionLabel}</span>
                          <ArrowRight
                            size={13}
                            strokeWidth={1.5}
                            className={isHighlighted ? 'text-[#A65D4A]' : ''}
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div
              role="status"
              className="border border-white/12 bg-[#141414] px-5 py-8 text-center"
            >
              <p className="text-sm font-medium text-white">
                {t.shell.search.emptyTitle}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#BDBDBD] max-w-md mx-auto">
                {t.shell.search.emptyBody}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function GlobalSearchDialog({
  open,
  onClose,
  onAnnounce,
}: GlobalSearchDialogProps) {
  if (!open) {
    return null;
  }
  return <GlobalSearchModalContent onClose={onClose} onAnnounce={onAnnounce} />;
}
