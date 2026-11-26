import type { ReactNode } from 'react';
import { DemoBadge } from './DemoBadge';

interface PlateHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  demoBadgeLabel?: string;
  badgeSlot?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Canonical O+A editorial plate header (PRANCHA 01..11 / PLATE 01..11).
 * Keeps eyebrow and demo badge cleanly separated without orphan middots.
 */
export function PlateHeader({
  eyebrow,
  title,
  subtitle,
  demoBadgeLabel,
  badgeSlot,
  actions,
  className = '',
}: PlateHeaderProps) {
  return (
    <header className={`pb-6 oa-hairline-b space-y-2.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-mono font-medium uppercase tracking-[0.20em] text-[#CE826D]">
          {eyebrow}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {demoBadgeLabel && <DemoBadge label={demoBadgeLabel} />}
          {badgeSlot}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-[#BDBDBD] max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
