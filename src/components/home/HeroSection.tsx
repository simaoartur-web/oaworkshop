import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();

    const enterWebsite = () => {
        const workshopSection = document.getElementById('workshop');
        const targetTop = workshopSection
            ? workshopSection.getBoundingClientRect().top + window.scrollY
            : window.innerHeight;

        window.scrollTo({
            top: targetTop,
            behavior: reducedMotion ? 'auto' : 'smooth',
        });

        if (workshopSection) {
            const previousTabIndex = workshopSection.getAttribute('tabindex');
            workshopSection.setAttribute('tabindex', '-1');
            workshopSection.focus({ preventScroll: true });
            workshopSection.addEventListener(
                'blur',
                () => {
                    if (previousTabIndex === null) {
                        workshopSection.removeAttribute('tabindex');
                    } else {
                        workshopSection.setAttribute('tabindex', previousTabIndex);
                    }
                },
                { once: true }
            );
        }
    };

    return (
        <section
            id="top"
            className="relative min-h-screen h-dvh w-full flex flex-col items-center justify-center overflow-hidden bg-hero-bg font-sans text-white selection:bg-white/20 px-6"
        >
            {/* Central Composition: Elements A, B, C */}
            <div className="relative z-10 flex flex-col items-center text-center pb-[6.5vh]">
                {/* Element A — "we are" */}
                <p className="text-[length:var(--text-hero-greeting)] font-semibold lowercase tracking-normal leading-none text-white mb-[clamp(0.5rem,1.2vh,0.75rem)]">
                    {t('hero.weAre')}
                </p>

                {/* Element B — O+A Logo */}
                <button
                    type="button"
                    onClick={enterWebsite}
                    aria-label={t('hero.enterAriaLabel')}
                    className="cursor-pointer rounded-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-8 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                >
                    <img
                        src="/logo.png"
                        alt={t('hero.logoAlt')}
                        width={692}
                        height={511}
                        className="w-[clamp(11rem,19.2vw,17.5rem)] max-h-[26vh] h-auto object-contain select-none"
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                    />
                </button>

                {/* Element C — "ARCHITECTS AND PLANNERS" */}
                <p className="mt-[clamp(0.75rem,2.2vh,1.25rem)] text-[length:var(--text-hero-discipline)] font-normal uppercase tracking-[var(--tracking-hero-discipline)] leading-none text-white">
                    {t('common.discipline')}
                </p>
            </div>

            {/* Element D — "Click on O+A to start" */}
            <button
                type="button"
                onClick={enterWebsite}
                className="absolute bottom-[clamp(2.25rem,9.5vh,5.25rem)] left-1/2 -translate-x-1/2 z-10 min-h-[44px] px-4 py-2 inline-flex items-center justify-center whitespace-nowrap cursor-pointer rounded-sm text-[length:var(--text-hero-prompt)] font-normal tracking-[var(--tracking-hero-prompt)] leading-snug text-white transition-opacity duration-200 hover:opacity-85 active:opacity-75 focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 motion-reduce:transition-none"
            >
                <span>
                    {t('hero.startPromptPrefix')}
                    <strong className="font-bold">{t('hero.startPromptBrand')}</strong>
                    {t('hero.startPromptSuffix')}
                </span>
            </button>
        </section>
    );
};

export default HeroSection;
