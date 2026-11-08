import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { DemoNoticeDialog } from '../design-system/DemoNoticeDialog';
import { en } from '../locales/en';
import { pt } from '../locales/pt';
import {
  formatEditorialDate,
  formatGreetingForTime,
  formatStudioClocks,
  resolveDayPeriod,
  resolveMilanTimeZoneAbbreviation,
} from '../utils/timeGreeting';

function DialogHarness() {
  const [open, setOpen] = useState(false);
  const [ticks, setTicks] = useState(0);

  return (
    <div>
      <button type="button">Before Opener</button>
      <button type="button" onClick={() => setOpen(true)}>
        Open Notice
      </button>
      <button type="button" onClick={() => setTicks((v) => v + 1)}>
        Re-render Parent ({ticks})
      </button>
      <button type="button" onClick={() => setTicks((v) => v + 1)}>
        Force Background Focus Target
      </button>

      <DemoNoticeDialog
        open={open}
        onClose={() => {
          setTicks((v) => v + 1);
          setOpen(false);
        }}
        code="TEST · MODAL"
        title="Dialog Focus Trap Verification"
        body="Body explanation."
        instruction="Additional guidance."
        confirmLabel="Confirm Close"
        closeAriaLabel="Close modal"
      />
    </div>
  );
}

describe('Phase 01 Hardening — Modal Accessibility & Studio Timezone Rules', () => {
  it('traps Tab and Shift+Tab inside DemoNoticeDialog, neutralizes background with inert, and restores opener focus on Escape', async () => {
    const user = userEvent.setup();
    const { container } = render(<DialogHarness />);

    const opener = screen.getByRole('button', { name: 'Open Notice' });
    const backgroundBtn = screen.getByRole('button', {
      name: 'Force Background Focus Target',
    });

    await user.click(opener);

    const dialog = await screen.findByRole('dialog');
    const closeBtn = within(dialog).getByRole('button', { name: 'Close modal' });
    const confirmBtn = within(dialog).getByRole('button', {
      name: 'Confirm Close',
    });

    // Background sibling wrapper under body must be inert & aria-hidden while open
    expect(container).toHaveAttribute('inert');
    expect(container).toHaveAttribute('aria-hidden', 'true');

    // Initial focus goes to Confirm button inside dialog
    await waitFor(() => {
      expect(confirmBtn).toHaveFocus();
    });

    // Tab forward from last focusable element wraps back to first focusable (Close X)
    await user.tab();
    expect(closeBtn).toHaveFocus();

    // Tab forward again returns to Confirm button (never escapes to background!)
    await user.tab();
    expect(confirmBtn).toHaveFocus();

    // Shift+Tab from Confirm goes to Close X, then Shift+Tab wraps to Confirm
    await user.tab({ shift: true });
    expect(closeBtn).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirmBtn).toHaveFocus();

    // Programmatic focus intrusion outside dialog gets pulled right back inside
    backgroundBtn.focus();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape closes modal, removes inert/aria-hidden from background FIRST, and restores opener focus
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(container).not.toHaveAttribute('inert');
    expect(container).not.toHaveAttribute('aria-hidden');
    expect(opener).toHaveFocus();
  });

  it('retains opener focus restoration across parent re-renders with new inline onClose reference', async () => {
    function ReRenderingParentHarness() {
      const [open, setOpen] = useState(false);
      const [counter, setCounter] = useState(0);

      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Trigger Modal ({counter})
          </button>
          <DemoNoticeDialog
            open={open}
            onClose={() => setOpen(false)}
            code="TEST"
            title="Rerender Safe Modal"
            body={`Ticks: ${counter}`}
            instruction="Check focus."
            confirmLabel="Done"
            closeAriaLabel="Dismiss"
          />
          {open && (
            <button type="button" onClick={() => setCounter((c) => c + 1)}>
              Background tick helper
            </button>
          )}
        </div>
      );
    }

    const user = userEvent.setup();
    render(<ReRenderingParentHarness />);

    const trigger = screen.getByRole('button', { name: /Trigger Modal/i });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Click Close button explicitly and verify focus returns strictly to trigger
    await user.click(within(dialog).getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('switches Milan CET vs CEST accurately across winter, summer, and DST transition boundaries', () => {
    const winterDate = new Date('2026-01-15T12:00:00Z');
    const summerDate = new Date('2026-07-15T12:00:00Z');

    expect(resolveMilanTimeZoneAbbreviation(winterDate)).toBe('CET');
    expect(resolveMilanTimeZoneAbbreviation(summerDate)).toBe('CEST');

    const winterClocks = formatStudioClocks(winterDate);
    expect(winterClocks).toMatchObject({
      maputo: '14:00 CAT',
      milan: '13:00 CET',
      maputoAbbreviation: 'CAT',
      milanAbbreviation: 'CET',
    });

    const summerClocks = formatStudioClocks(summerDate);
    expect(summerClocks).toMatchObject({
      maputo: '14:00 CAT',
      milan: '14:00 CEST',
      maputoAbbreviation: 'CAT',
      milanAbbreviation: 'CEST',
    });

    // Exact 2026 European DST transitions:
    // Last Sunday of March (2026-03-29 01:00 UTC) CET -> CEST
    expect(resolveMilanTimeZoneAbbreviation(new Date('2026-03-29T00:59:00Z'))).toBe('CET');
    expect(resolveMilanTimeZoneAbbreviation(new Date('2026-03-29T01:05:00Z'))).toBe('CEST');

    // Last Sunday of October (2026-10-25 01:00 UTC) CEST -> CET
    expect(resolveMilanTimeZoneAbbreviation(new Date('2026-10-25T00:59:00Z'))).toBe('CEST');
    expect(resolveMilanTimeZoneAbbreviation(new Date('2026-10-25T01:05:00Z'))).toBe('CET');
  });

  it('derives greetings and editorial dates from collaborator studioBase instead of device clock', () => {
    // At 10:30 UTC in winter: Milão is 11:30 CET (morning), Maputo is 12:30 CAT (afternoon)
    const morningSplit = new Date('2026-01-15T10:30:00Z');
    expect(resolveDayPeriod(morningSplit, 'Milão')).toBe('morning');
    expect(resolveDayPeriod(morningSplit, 'Maputo')).toBe('afternoon');
    expect(formatGreetingForTime(pt, morningSplit, 'Milão')).toBe('Bom dia');
    expect(formatGreetingForTime(pt, morningSplit, 'Maputo')).toBe('Boa tarde');
    expect(formatGreetingForTime(en, morningSplit, 'Milão')).toBe('Good morning');

    // At 17:30 UTC in winter: Milão is 18:30 CET (afternoon), Maputo is 19:30 CAT (evening)
    const eveningSplit = new Date('2026-01-15T17:30:00Z');
    expect(resolveDayPeriod(eveningSplit, 'Milão')).toBe('afternoon');
    expect(resolveDayPeriod(eveningSplit, 'Maputo')).toBe('evening');

    // Midnight rollover alignment by studio timezone (22:30Z on July 15 = July 16 00:30 in Maputo & CEST Milan)
    const lateUtc = new Date('2026-07-15T22:30:00Z');
    expect(formatEditorialDate('en', lateUtc, 'Maputo')).toContain('16 July 2026');
    expect(formatEditorialDate('en', lateUtc, 'Milão')).toContain('16 July 2026');
  });
});
