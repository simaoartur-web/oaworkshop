import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

interface DemoNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  code: string;
  title: string;
  body: string;
  instruction: string;
  confirmLabel: string;
  closeAriaLabel: string;
}

export function DemoNoticeDialog({
  open,
  onClose,
  code,
  title,
  body,
  instruction,
  confirmLabel,
  closeAriaLabel,
}: DemoNoticeDialogProps) {
  const titleId = useId();
  const descId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg border border-white/18 bg-[#111111] p-6 sm:p-8 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 pb-4 oa-hairline-b">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#A65D4A]">
              {code}
            </p>
            <h2
              id={titleId}
              className="mt-2 text-xl sm:text-2xl font-light tracking-tight text-white"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeAriaLabel}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/12 text-[#BDBDBD] hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.25} />
          </button>
        </div>

        <div id={descId} className="mt-5 space-y-3.5 text-sm leading-relaxed text-[#E0E0E0]">
          <p>{body}</p>
          <p className="border-l-2 border-[#A65D4A] bg-white/[0.03] pl-3.5 py-2 text-[#BDBDBD]">
            {instruction}
          </p>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.20em] text-white transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
