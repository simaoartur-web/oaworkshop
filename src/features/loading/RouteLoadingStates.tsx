import type { AppLanguage } from '../../data/types';

function resolveFallbackLanguage(): AppLanguage {
  if (typeof document !== 'undefined') {
    const docLang = document.documentElement.lang?.toLowerCase();
    if (docLang === 'en') {
      return 'en';
    }
    if (docLang === 'pt') {
      return 'pt';
    }
  }
  return 'pt';
}

/**
 * Full-viewport editorial loading fallback for top-level route transitions
 * (`/login`, `/welcome`, `/workspace` bootstrap). Keeps the #050505 O+A surface
 * to prevent white flashes and uses no continuous decorative animations.
 */
export function EditorialEntryLoadingFallback({
  language,
}: {
  language?: AppLanguage;
}) {
  const activeLanguage = language ?? resolveFallbackLanguage();
  const label =
    activeLanguage === 'en'
      ? 'Preparing architectural workspace…'
      : 'A preparar o espaço de trabalho…';

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="editorial-entry-loading"
      className="min-h-dvh w-full bg-[#050505] text-white flex flex-col justify-between px-6 py-8 sm:px-10"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#CE826D]">
          O+A Workshop
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.20em] text-[#9E9E9E]">
          Milão · Maputo
        </span>
      </div>

      <div className="max-w-md space-y-3 py-12">
        <div aria-hidden="true" className="h-[2px] w-12 bg-[#A65D4A]" />
        <p className="text-sm font-light tracking-wide text-[#E6E6E6]">{label}</p>
      </div>

      <div className="border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.20em] text-[#8A8A8A]">
        O+A Architecture and Planners
      </div>
    </div>
  );
}

/**
 * In-shell route loading state rendered strictly inside `<main>` so the
 * `WorkspaceShell` sidebar, contextual header, focus, scroll container,
 * and active shell state remain mounted across module transitions.
 */
export function WorkspaceContentLoadingState({
  language,
}: {
  language?: AppLanguage;
}) {
  const activeLanguage = language ?? resolveFallbackLanguage();
  const eyebrow =
    activeLanguage === 'en'
      ? 'O+A WORKSPACE · LOADING MODULE'
      : 'O+A WORKSPACE · A CARREGAR PRANCHA';
  const body =
    activeLanguage === 'en'
      ? 'Preparing the operational sheet and preserving active session context.'
      : 'A preparar a prancha operacional preservando a sessão e a barra de navegação.';

  return (
    <section
      role="status"
      aria-live="polite"
      data-testid="workspace-content-loading"
      className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6"
    >
      <header className="pb-5 border-b border-white/12 space-y-2.5">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
          {eyebrow}
        </p>
        <div
          aria-hidden="true"
          className="h-7 w-64 max-w-full bg-[#181818] border border-white/10"
        />
        <p className="text-xs sm:text-sm text-[#BDBDBD]">{body}</p>
      </header>

      <div
        aria-hidden="true"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        <div className="lg:col-span-8 min-h-[260px] border border-white/10 bg-[#0D0D0D] p-5 flex flex-col justify-between">
          <div className="h-[2px] w-14 bg-[#A65D4A]/70" />
          <div className="space-y-2.5">
            <div className="h-4 w-3/4 bg-[#171717]" />
            <div className="h-3 w-1/2 bg-[#141414]" />
          </div>
        </div>
        <div className="lg:col-span-4 min-h-[260px] border border-white/10 bg-[#0D0D0D] p-5 space-y-3">
          <div className="h-3 w-28 bg-[#181818]" />
          <div className="h-14 w-full bg-[#131313] border border-white/8" />
          <div className="h-14 w-full bg-[#131313] border border-white/8" />
        </div>
      </div>
    </section>
  );
}
