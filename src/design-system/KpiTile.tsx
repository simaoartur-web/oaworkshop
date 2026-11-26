interface KpiTileProps {
  label: string;
  value: string | number;
  meta?: string;
  accent?: boolean;
  className?: string;
}

/**
 * Canonical O+A tectonic KPI tile with tabular numerals and consistent rhythm.
 */
export function KpiTile({
  label,
  value,
  meta,
  accent = false,
  className = '',
}: KpiTileProps) {
  return (
    <div
      className={`border px-4 py-3.5 flex flex-col justify-between gap-1.5 ${
        accent
          ? 'border-[#A65D4A]/45 bg-[#191413]'
          : 'border-white/12 bg-[#141414]'
      } ${className}`}
    >
      <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] leading-snug">
        {label}
      </span>
      <span
        className={`text-2xl font-light tabular-nums leading-none ${
          accent ? 'text-[#CE826D]' : 'text-white'
        }`}
      >
        {value}
      </span>
      {meta && (
        <span className="text-[11px] text-[#9E9E9E] leading-snug">{meta}</span>
      )}
    </div>
  );
}
