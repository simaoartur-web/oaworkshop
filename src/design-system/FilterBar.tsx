import { RotateCcw, Search } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Shared 44px height utility classes so <input> and <select> controls inside
 * FilterBar always align to the exact same 44px vertical rhythm.
 */
export const FILTER_CONTROL_CLASS =
  'w-full h-11 min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none';

export const FILTER_SEARCH_INPUT_CLASS =
  'w-full h-11 min-h-[44px] pl-9 pr-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none';

export const FILTER_LABEL_CLASS =
  'block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1';

export interface FilterBarSearchConfig {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (nextValue: string) => void;
  colSpanClass?: string;
}

interface FilterBarProps {
  /** Optional top row for scope/category/domain pill groups */
  topSlot?: ReactNode;
  /** Filtered count summary text (e.g. "A mostrar: 5 / 9") */
  summaryText?: string;
  /** Whether any filter or search term is currently active */
  hasActiveFilters: boolean;
  /** Label for the reset button */
  resetLabel: string;
  /** Callback to reset all active filters */
  onReset: () => void;
  /** Optional built-in 44px search input */
  search?: FilterBarSearchConfig;
  /** Responsive grid classes for filter controls */
  controlsGridClass?: string;
  /** Filter <select> / control fields */
  children?: ReactNode;
  className?: string;
}

/**
 * Canonical O+A FilterBar component (R-05).
 * Enforces uniform 44px height between search inputs and selects,
 * disables & attenuates Reset when no filter is active, and wraps cleanly at 375/768/1440px.
 */
export function FilterBar({
  topSlot,
  summaryText,
  hasActiveFilters,
  resetLabel,
  onReset,
  search,
  controlsGridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
  children,
  className = '',
}: FilterBarProps) {
  return (
    <section
      className={`border border-white/12 bg-[#141414] p-4 space-y-3.5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {topSlot ? (
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {topSlot}
          </div>
        ) : summaryText ? (
          <span className="text-xs font-mono tabular-nums text-[#BDBDBD]">
            {summaryText}
          </span>
        ) : (
          <span />
        )}

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {topSlot && summaryText && (
            <span className="text-xs font-mono tabular-nums text-[#BDBDBD]">
              {summaryText}
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            aria-disabled={!hasActiveFilters}
            className={`min-h-[44px] px-3.5 py-2 border text-[11px] font-medium uppercase tracking-[0.14em] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              hasActiveFilters
                ? 'border-white/18 bg-transparent hover:border-[#A65D4A] text-[#E6E6E6] hover:text-white cursor-pointer'
                : 'border-white/8 bg-[#101010] text-[#7A7A7A] opacity-60 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={12} strokeWidth={1.5} aria-hidden="true" />
            <span>{resetLabel}</span>
          </button>
        </div>
      </div>

      {(search || children) && (
        <div className={controlsGridClass}>
          {search && (
            <div className={search.colSpanClass ?? ''}>
              <label htmlFor={search.id} className={FILTER_LABEL_CLASS}>
                {search.label}
              </label>
              <div className="relative flex items-center">
                <Search
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="absolute left-3 text-[#9E9E9E] pointer-events-none"
                />
                <input
                  id={search.id}
                  type="search"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={search.placeholder}
                  className={FILTER_SEARCH_INPUT_CLASS}
                />
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </section>
  );
}
