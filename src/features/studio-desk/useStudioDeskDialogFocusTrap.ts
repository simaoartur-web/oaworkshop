import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_ELEMENT_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

function isElementFocusableAndVisible(element: HTMLElement): boolean {
  if (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.closest('[hidden]') !== null ||
    element.closest('[inert]') !== null
  ) {
    return false;
  }

  const computed = window.getComputedStyle(element);
  if (computed.display === 'none' || computed.visibility === 'hidden') {
    return false;
  }

  return true;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR),
  );
  return candidates.filter(isElementFocusableAndVisible);
}

interface SiblingAccessibilitySnapshot {
  element: HTMLElement;
  hadInert: boolean;
  previousAriaHidden: string | null;
}

export interface UseStudioDeskDialogFocusTrapOptions {
  /** Whether the modal dialog is currently open. */
  isOpen: boolean;
  /** Element with role="dialog" containing focusable modal controls. */
  dialogRef: RefObject<HTMLElement | null>;
  /** Preferred initial focus target when the modal opens (defaults to first focusable control). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Top-level portal overlay element excluded when marking background siblings inert. */
  portalRootRef: RefObject<HTMLElement | null>;
  /** Callback invoked on Escape (stored in a ref so inline callbacks do not reset focus). */
  onClose: () => void;
}

/**
 * Isolated WAI-ARIA modal focus trap, background sibling blocker (`inert` / `aria-hidden`),
 * and document scroll lock for `ProjectDossierDialog` during parallel Phase 02B work.
 *
 * Integration note for Argon A (`codex/f02-integration-preview`):
 * This hook is intentionally self-contained in `src/features/studio-desk/` so
 * `codex/f02-studio-desk` compiles and tests independently of `codex/f02-shell-hardening`.
 * Once merged with `useDialogFocusTrap`, `ProjectDossierDialog.tsx` can swap directly to the
 * shared `useDialogFocusTrap` hook with the same lifecycle contract:
 *  - `isOpen`, `containerRef: dialogRef`, `initialFocusRef`, `onClose`
 *  - `portalRootRef` exclusion from `document.body` sibling `inert` / `aria-hidden`
 *  - body scroll lock + scrollbar compensation + restoring background `inert` BEFORE calling
 *    `previousFocus.focus({ preventScroll: true })`.
 */
export function useStudioDeskDialogFocusTrap({
  isOpen,
  dialogRef,
  initialFocusRef,
  portalRootRef,
  onClose,
}: UseStudioDeskDialogFocusTrapOptions): void {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialogElement = dialogRef.current;
    if (!dialogElement) {
      return;
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // 1. Lock body scroll and compensate for any desktop scrollbar width to prevent layout shift.
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    );

    if (scrollbarWidth > 0) {
      const computedPaddingRight =
        Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    // 2. Mark direct children of document.body outside the modal portal as inert + aria-hidden.
    const overlayElement = portalRootRef.current ?? dialogElement;
    const siblingSnapshots: SiblingAccessibilitySnapshot[] = [];

    for (const child of Array.from(document.body.children)) {
      if (
        !(child instanceof HTMLElement) ||
        child === overlayElement ||
        child.contains(overlayElement) ||
        child.tagName === 'SCRIPT' ||
        child.tagName === 'STYLE' ||
        child.tagName === 'NOSCRIPT'
      ) {
        continue;
      }

      siblingSnapshots.push({
        element: child,
        hadInert: child.hasAttribute('inert'),
        previousAriaHidden: child.getAttribute('aria-hidden'),
      });

      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
    }

    // 3. Move initial focus inside the modal cleanly without forcing internal scroll jumps.
    const focusableOnOpen = getFocusableElements(dialogElement);
    const preferredTarget =
      initialFocusRef?.current &&
      dialogElement.contains(initialFocusRef.current) &&
      isElementFocusableAndVisible(initialFocusRef.current)
        ? initialFocusRef.current
        : (focusableOnOpen[0] ?? dialogElement);

    preferredTarget.focus({ preventScroll: true });

    // 4. Trap Tab / Shift+Tab and handle Escape close.
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentDialog = dialogRef.current;
      if (!currentDialog) {
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

      const focusable = getFocusableElements(currentDialog);
      if (focusable.length === 0) {
        event.preventDefault();
        currentDialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (!active || !currentDialog.contains(active) || active === currentDialog) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // 5. Fallback containment guard: if focus ever escapes outside the dialog, pull it back inside.
    const handleFocusIn = (event: FocusEvent) => {
      const currentDialog = dialogRef.current;
      if (!currentDialog) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && !currentDialog.contains(target)) {
        const focusable = getFocusableElements(currentDialog);
        (focusable[0] ?? currentDialog).focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn, true);

      // Restore background DOM siblings FIRST so `.focus()` below is not ignored on an inert subtree.
      for (const snapshot of siblingSnapshots) {
        if (!snapshot.hadInert) {
          snapshot.element.removeAttribute('inert');
        }
        if (snapshot.previousAriaHidden === null) {
          snapshot.element.removeAttribute('aria-hidden');
        } else {
          snapshot.element.setAttribute('aria-hidden', snapshot.previousAriaHidden);
        }
      }

      // Restore body scroll styling cleanly.
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;

      // Restore focus to invoking trigger only if it remains mounted in the document.
      if (
        previousFocus &&
        previousFocus.isConnected &&
        document.contains(previousFocus)
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [dialogRef, initialFocusRef, isOpen, portalRootRef]);
}
