import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

const SLIDE_IMAGES = [
    {
        id: "architecture",
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    },
    {
        id: "urbanism",
        img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    },
    {
        id: "research",
        img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    }
];

const SLIDE_ACTIONS: Record<string, { href: string }> = {
    architecture: { href: '#architecture' },
    urbanism: { href: '#urbanism' },
    research: { href: '#research' },
};

type State = 'FILLING' | 'RESETTING';

const WorkshopSection = () => {
    const { t } = useTranslation();
    const slides = t('workshop.slides', { returnObjects: true }) as Array<{ id: string; label: string; title: string; desc: string; cta: string }>;
    const [state, setState] = useState<State>('FILLING');
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const startReset = useCallback(() => {
        setState('RESETTING');
        setProgress(100);
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (state === 'FILLING') {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        if (activeIndex < slides.length - 1) {
                            setActiveIndex(activeIndex + 1);
                            return 0;
                        } else {
                            startReset();
                            return 100;
                        }
                    }
                    return prev + 0.35;
                });
            }, 16);
        } else if (state === 'RESETTING') {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev <= 0) {
                        if (activeIndex > 0) {
                            setActiveIndex(activeIndex - 1);
                            return 100;
                        } else {
                            setState('FILLING');
                            return 0;
                        }
                    }
                    return prev - 1.2;
                });
            }, 16);
        }

        return () => clearInterval(interval);
    }, [state, activeIndex, startReset, slides.length]);

    const handleSlideSelect = (idx: number) => {
        setActiveIndex(idx);
        setState('FILLING');
        setProgress(0);
    };

    const activeSlide = slides[activeIndex];
    const activeAction = SLIDE_ACTIONS[activeSlide.id] ?? { href: `#${activeSlide.id}` };
    const activeTitle = activeSlide.title.replace(/^\+\s*/, '');
    const isLongTitle = activeTitle.length > 11;

    return (
        <section id="workshop" className="relative flex min-h-[620px] flex-col justify-center overflow-hidden border-t border-white/5 bg-black-900 py-10 sm:min-h-[680px] lg:min-h-[86vh] lg:py-14">
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 0.85, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <img
                            src={SLIDE_IMAGES[activeIndex].img}
                            alt={activeSlide.title}
                            className="h-full w-full scale-105 object-cover opacity-70 blur-[7px] saturate-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black-900/95 via-black-900/68 to-black-900/28" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,rgba(166,93,74,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%,rgba(0,0,0,0.58))]" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom gradient for smooth section transition */}
            <div className="absolute bottom-0 left-0 right-0 h-36 z-10 pointer-events-none bg-gradient-to-t from-black-900 to-transparent" />

            <div className="relative z-20 mx-auto flex h-full w-full max-w-[1500px] flex-col px-6 pb-8 pt-8 md:px-10 lg:px-14">
                {/* Main Content Area - Refined for Organization & Premium Feel */}
                <div className="relative grid min-h-[420px] flex-grow items-center gap-10 md:min-h-[480px] md:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.78fr)] lg:min-h-[54vh] lg:gap-16 xl:grid-cols-[minmax(0,0.86fr)_minmax(360px,0.74fr)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="relative z-30 flex w-full flex-col items-start"
                        >
                            <div className="flex w-full max-w-[690px] flex-col items-start text-left">
                                <div className="flex w-full flex-col gap-6">
                                    <div className="grid w-full max-w-md grid-cols-[3.5rem_1fr] items-center gap-x-5">
                                        <span className="text-sm font-bold tracking-[0.28em] text-terracota md:text-base">0{activeIndex + 1}</span>
                                        <div className="flex min-w-0 items-center gap-5">
                                            <div className="h-px w-10 bg-terracota/50" />
                                            <span className="truncate text-[10px] font-bold uppercase tracking-[0.36em] text-white/58 md:text-[11px]">{activeSlide.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex min-h-[7.25rem] w-full max-w-[44rem] items-end sm:min-h-[8rem] md:min-h-[9.5rem] lg:min-h-[10.5rem]">
                                        <h3 className={`grid w-full grid-cols-[0.72em_minmax(0,1fr)] items-baseline gap-x-3 font-medium leading-[0.94] tracking-tight text-white ${isLongTitle ? 'max-w-[41rem] text-[3.35rem] sm:text-[4.2rem] md:text-[4.65rem] lg:text-[4.8rem]' : 'max-w-[36rem] text-5xl sm:text-6xl md:text-7xl lg:text-[5.45rem]'}`}>
                                            <span className="text-[1.04em] leading-none text-terracota">+</span>
                                            <span className="min-w-0 text-balance">{activeTitle}</span>
                                        </h3>
                                    </div>
                                    <p className="min-h-[4.75rem] max-w-[30rem] text-base font-light leading-relaxed text-white/58 md:min-h-[5.25rem] md:text-lg">
                                        {activeSlide.desc}
                                    </p>
                                    <a
                                        href={activeAction.href}
                                        className="group mt-1 inline-flex w-fit max-w-full items-center gap-3 overflow-hidden border border-white/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/75 transition-all duration-500 hover:border-terracota/65 hover:bg-terracota/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-terracota/60 md:px-5 md:py-3 md:text-[11px]"
                                    >
                                        <span>{activeSlide.cta}</span>
                                        <ArrowRight size={15} strokeWidth={1.5} className="text-terracota transition-transform duration-500 group-hover:translate-x-1" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative z-20 hidden min-h-[300px] items-center md:flex">
                        <div className="relative ml-auto aspect-[4/3] w-full max-w-[500px] overflow-hidden border border-white/10 bg-white/[0.025] shadow-[0_32px_90px_rgba(0,0,0,0.38)] backdrop-blur-sm lg:max-w-[560px]">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={`preview-${activeIndex}`}
                                    src={SLIDE_IMAGES[activeIndex].img}
                                    alt=""
                                    initial={{ opacity: 0, scale: 1.07 }}
                                    animate={{ opacity: 0.32, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                                    className="h-full w-full object-cover blur-[4px] saturate-50"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-r from-black-900/38 via-black-900/8 to-black-900/52" />
                            <div className="absolute inset-x-7 top-7 h-px bg-gradient-to-r from-transparent via-white/26 to-transparent" />
                            <div className="absolute inset-y-7 left-7 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <div className="absolute bottom-7 right-7 h-12 w-12 border-b border-r border-terracota/42" />
                        </div>
                    </div>
                </div>

                {/* Slider Navigation - Moved to the bottom */}
                <div className="relative mt-8 grid w-full grid-cols-1 gap-4 pt-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent md:mt-10 md:grid-cols-3 md:gap-7 lg:gap-12">
                    {slides.map((slide, idx) => {
                        const isFilled = (state === 'FILLING' && idx < activeIndex) || 
                                         (state === 'RESETTING' && idx < activeIndex);
                        const isCurrent = activeIndex === idx;
                        const currentProgress = isCurrent ? progress : (isFilled ? 100 : 0);
                        const label = slide.label.replace(/^\+\s*/, '');

                        return (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => handleSlideSelect(idx)}
                                className={`group relative grid w-full min-w-0 cursor-pointer grid-rows-[auto_1px] gap-4 py-3 text-left transition-all duration-500 focus:outline-none focus:ring-1 focus:ring-terracota/50 ${isCurrent ? 'opacity-100' : 'opacity-[0.58] hover:opacity-[0.82]'}`}
                            >
                                <span className="grid min-w-0 grid-cols-[3.3rem_1.8rem_1fr] items-baseline gap-2 md:grid-cols-[3.6rem_2.1rem_1fr] lg:grid-cols-[4rem_2.4rem_1fr]">
                                    <span className="text-[10px] font-bold tracking-[0.28em] text-white/36">0{idx + 1}</span>
                                    <span className={`text-3xl font-light leading-none transition-colors duration-500 md:text-4xl ${isCurrent ? 'text-terracota' : 'text-white/46 group-hover:text-terracota/80'}`}>+</span>
                                    <span className={`min-w-0 text-[11px] font-bold uppercase leading-tight tracking-[0.2em] transition-colors duration-700 md:text-[12px] md:tracking-[0.28em] xl:tracking-[0.34em] ${isCurrent || isFilled ? 'text-white' : 'text-white/50 group-hover:text-white/76'}`}>
                                        <span className="block truncate">{label}</span>
                                    </span>
                                </span>
                                <div className="relative h-[1px] w-full overflow-hidden bg-white/8">
                                    <motion.div 
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-terracota via-white/70 to-terracota"
                                        animate={{ width: `${currentProgress}%` }}
                                        transition={{ duration: 0.1, ease: "linear" }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WorkshopSection;
