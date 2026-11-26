interface DemoBadgeProps {
  label: string;
  tone?: 'neutral' | 'accent';
  className?: string;
}

/**
 * Canonical O+A local-demo indicator pill.
 * Self-contained with zero orphan separators so it wraps cleanly at 375px–1440px.
 */
export function DemoBadge({
  label,
  tone = 'neutral',
  className = '',
}: DemoBadgeProps) {
  const toneClasses =
    tone === 'accent'
      ? 'border-[#A65D4A]/55 bg-[#A65D4A]/14 text-white'
      : 'border-white/14 bg-[#141414] text-[#D4D4D4]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] leading-none whitespace-nowrap shrink-0 ${toneClasses} ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-[#A65D4A] shrink-0" />
      <span>{label}</span>
    </span>
  );
}
