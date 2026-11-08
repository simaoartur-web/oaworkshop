import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

const NON_INTERACTIVE_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE']);

export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      if (element.hasAttribute('disabled') || element.closest('[hidden]')) {
        return false;
      }
      if (element.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    },
  );
}

interface BackgroundSnapshot {
  element: HTMLElement;
  hadInertAttr: boolean;
  previousInertAttr: string | null;
  previousAriaHidden: string | null;
}

interface UseDialogFocusTrapOptions {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  portalRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
}

/**
 * Provides WCAG 2.2 AA modal focus management:
 * - Captures opener focus once on transition from closed -> open
 * - Traps Tab and Shift+Tab strictly inside the dialog
 * - Handles Escape to dismiss
 * - Marks background siblings under document.body as inert & aria-hidden while open
 * - Restores background accessibility and returns focus to opener on close
 */
export function useDialogFocusTrap({
  open,
  containerRef,
  portalRef,
  initialFocusRef,
  onClose,
}: UseDialogFocusTrapOptions) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const activeOnOpen = document.activeElement;
    previousFocusRef.current =
      activeOnOpen instanceof HTMLElement ? activeOnOpen : null;

    const snapshots: BackgroundSnapshot[] = [];
    for (const child of Array.from(document.body.children)) {
      if (
        !(child instanceof HTMLElement) ||
        child === portalRef.current ||
        NON_INTERACTIVE_TAGS.has(child.tagName)
      ) {
        continue;
      }
      if (child.dataset.oaDialogPortal === 'true') {
        continue;
      }

      snapshots.push({
        element: child,
        hadInertAttr: child.hasAttribute('inert'),
        previousInertAttr: child.getAttribute('inert'),
        previousAriaHidden: child.getAttribute('aria-hidden'),
      });

      child.setAttribute('aria-hidden', 'true');
      child.setAttribute('inert', '');
      if ('inert' in child) {
        (child as HTMLElement & { inert: boolean }).inert = true;
      }
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusInitialTarget = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const focusables = getFocusableElements(container);
      const preferred =
        initialFocusRef?.current && container.contains(initialFocusRef.current)
          ? initialFocusRef.current
          : null;
      const target = preferred ?? focusables[0] ?? container;
      target.focus();
    };

    // Focus immediately if portal is already committed, or on next frame as fallback
    focusInitialTarget();
    const rafId = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container && !container.contains(document.activeElement)) {
        focusInitialTarget();
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !container.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey) {
        if (active === first || active === container) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      if (event.target instanceof Node && !container.contains(event.target)) {
        const focusables = getFocusableElements(container);
        (focusables[0] ?? container).focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn, true);
      document.body.style.overflow = previousBodyOverflow;

      // Restore background inert/aria-hidden BEFORE restoring focus so opener is focusable
      for (const snap of snapshots) {
        if (snap.hadInertAttr) {
          snap.element.setAttribute('inert', snap.previousInertAttr ?? '');
        } else {
          snap.element.removeAttribute('inert');
        }
        if ('inert' in snap.element) {
          (snap.element as HTMLElement & { inert: boolean }).inert =
            snap.hadInertAttr;
        }

        if (snap.previousAriaHidden === null) {
          snap.element.removeAttribute('aria-hidden');
        } else {
          snap.element.setAttribute('aria-hidden', snap.previousAriaHidden);
        }
      }

      const opener = previousFocusRef.current;
      if (opener && document.contains(opener)) {
        opener.focus();
      }
    };
  }, [open, containerRef, portalRef, initialFocusRef]);
}
