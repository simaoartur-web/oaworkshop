import type { AppLanguage } from '../data/types';

interface LanguageToggleProps {
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
  ptAriaLabel: string;
  enAriaLabel: string;
}

export function LanguageToggle({
  language,
  onChange,
  ptAriaLabel,
  enAriaLabel,
}: LanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className="inline-flex items-center border border-white/14 bg-[#161616]"
    >
      <button
        type="button"
        onClick={() => onChange('pt')}
        aria-label={ptAriaLabel}
        aria-pressed={language === 'pt'}
        className={`min-h-[44px] min-w-[44px] px-3 text-xs font-medium uppercase tracking-[0.22em] transition-colors cursor-pointer ${
          language === 'pt'
            ? 'bg-[#A65D4A] text-white'
            : 'text-[#BDBDBD] hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        PT
      </button>
      <span aria-hidden="true" className="h-5 w-px bg-white/12" />
      <button
        type="button"
        onClick={() => onChange('en')}
        aria-label={enAriaLabel}
        aria-pressed={language === 'en'}
        className={`min-h-[44px] min-w-[44px] px-3 text-xs font-medium uppercase tracking-[0.22em] transition-colors cursor-pointer ${
          language === 'en'
            ? 'bg-[#A65D4A] text-white'
            : 'text-[#BDBDBD] hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
