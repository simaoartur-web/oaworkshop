import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();
    const [isEntering, setIsEntering] = useState(false);
    const enterTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (enterTimerRef.current !== null) {
                window.clearTimeout(enterTimerRef.current);
            }
        };
    }, []);

    const enterWebsite = () => {
        setIsEntering(true);
        if (enterTimerRef.current !== null) {
            window.clearTimeout(enterTimerRef.current);
        }
        enterTimerRef.current = window.setTimeout(() => {
            setIsEntering(false);
        }, 900);

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
            data-entering={isEntering}
            className="relative min-h-screen h-dvh w-full flex flex-col items-center justify-center overflow-hidden bg-hero-bg font-sans text-white selection:bg-white/20 px-5 sm:px-6"
        >
            {/* Central Composition: Elements A, B (with Diffuse Radiating Heartglow + Heartbeat), C */}
            <motion.div
                initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center text-center pb-[6vh]"
            >
                {/* Element A — "WE ARE" */}
                <p className="relative z-10 text-[length:var(--text-hero-greeting)] font-light uppercase tracking-[var(--tracking-hero-greeting)] pl-[var(--tracking-hero-greeting)] leading-none text-white mb-[clamp(1.35rem,4.5vh,2.75rem)]">
                    {t('hero.weAre')}
                </p>

                {/* Element B — O+A Logo with Diffuse White Heartglow & Synchronized Heartbeat */}
                <div className="relative flex items-center justify-center">
                    <button
                        type="button"
                        onClick={enterWebsite}
                        aria-label={t('hero.enterAriaLabel')}
                        className="group relative z-10 cursor-pointer rounded-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-8 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                    >
                        {/* Outer diffuse radiating glow (commit 4fa4aee reference, no circular border) */}
                        <div
                            aria-hidden="true"
                            className="hero-heartglow-outer absolute inset-0 rounded-full pointer-events-none z-0"
                        />

                        {/* Inner soft breathing glow (commit 4fa4aee reference, no circular border) */}
                        <div
                            aria-hidden="true"
                            className="hero-heartglow-inner absolute inset-0 rounded-full pointer-events-none z-0"
                        />

                        {/* Steady ambient blur backdrop */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-white/5 blur-[90px] rounded-full scale-150 group-hover:bg-white/10 transition-colors duration-1000 pointer-events-none z-0"
                        />

                        <img
                            src="/logo.png"
                            alt={t('hero.logoAlt')}
                            width={692}
                            height={511}
                            className="hero-heartbeat relative z-10 w-[clamp(10rem,44vw,15rem)] md:w-[clamp(14rem,19.7vw,17.75rem)] max-h-[25vh] h-auto object-contain select-none brightness-105"
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                        />
                    </button>
                </div>

                {/* Element C — "ARCHITECTS AND PLANNERS" */}
                <h1 className="relative z-10 mt-[clamp(1.2rem,4vh,2.25rem)] text-[length:var(--text-hero-discipline)] font-light uppercase tracking-[var(--tracking-hero-discipline)] pl-[var(--tracking-hero-discipline)] leading-none text-white m-0">
                    <span className="sr-only">{t('common.brand')} — </span>
                    {t('common.discipline')}
                </h1>
            </motion.div>

            {/* Bottom Region: Element D ("Click on O+A to start") & Element E (Minimalist Chevron Indicator) */}
            <motion.div
                initial={{ opacity: reducedMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.75, delay: reducedMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-[clamp(1.25rem,5vh,3.25rem)] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-[clamp(0.5rem,2.2vh,1.5rem)]"
            >
                {/* Element D — "Click on O+A to start" */}
                <button
                    type="button"
                    onClick={enterWebsite}
                    className="min-h-[44px] px-4 py-1.5 inline-flex items-center justify-center whitespace-nowrap cursor-pointer rounded-sm text-[length:var(--text-hero-prompt)] font-light tracking-[var(--tracking-hero-prompt)] pl-[var(--tracking-hero-prompt)] leading-snug text-white transition-opacity duration-200 hover:opacity-85 active:opacity-75 focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 motion-reduce:transition-none"
                >
                    <span>
                        {t('hero.startPromptPrefix')}
                        <strong className="font-semibold">{t('hero.startPromptBrand')}</strong>
                        {t('hero.startPromptSuffix')}
                    </span>
                </button>

                {/* Element E — Downward Scroll Indicator */}
                <button
                    type="button"
                    onClick={enterWebsite}
                    aria-label={t('hero.scrollAriaLabel')}
                    className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center cursor-pointer rounded-sm text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
                >
                    <ChevronDown size={20} strokeWidth={1.25} className="hero-chevron-float" aria-hidden="true" />
                </button>
            </motion.div>
        </section>
    );
};

export default HeroSection;
