import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import StatsSection from './StatsSection';
import SectionOverlayStatus from '../common/SectionOverlayStatus';

const SLIDES = [
    {
        id: "architecture",
        label: "ARCHITECTURE",
        title: "International Architecture",
        desc: "Excellence in sustainable design and innovative technical implementation across global scales.",
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    },
    {
        id: "urbanism",
        label: "URBAN PLANNING",
        title: "Urbanism Strategy",
        desc: "Research-driven planning solutions for the resilient cities and communities of tomorrow.",
        img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    },
    {
        id: "research",
        label: "RESEARCH",
        title: "Experimental Research",
        desc: "Pushing boundaries in material science and sustainable construction methodologies.",
        img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    }
];


type State = 'FILLING' | 'RESETTING';

const WorkshopSection = () => {
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
                        if (activeIndex < SLIDES.length - 1) {
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
    }, [state, activeIndex, startReset]);

    return (
        <section id="workshop" className="min-h-[60vh] bg-black-900 border-t border-white/5 overflow-hidden relative flex flex-col justify-center py-8">
            <SectionOverlayStatus
                title="Under Construction"
                subtitle="This section is currently being refined and will be available soon."
                variant="under-construction"
                blurIntensity="medium"
            />
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
                            src={SLIDES[activeIndex].img}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black-900/80 via-transparent to-transparent" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom gradient for smooth section transition */}
            <div className="absolute bottom-0 left-0 right-0 h-36 z-10 pointer-events-none bg-gradient-to-t from-black-900 to-transparent" />

            <div className="w-full px-6 md:px-10 relative z-20 h-full flex flex-col pt-8 pb-8 pointer-events-none blur-[5px] saturate-50 opacity-55 select-none">
                {/* Main Content Area - Refined for Organization & Premium Feel */}
                <div className="relative flex-grow flex items-center min-h-[40vh]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="relative z-30 w-full flex flex-col items-start"
                        >
                            <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col items-start text-left gap-10">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-6">
                                        <span className="text-terracota font-bold text-lg md:text-xl tracking-widest">0{activeIndex + 1}</span>
                                        <div className="h-[2px] w-12 bg-terracota/50" />
                                        <span className="text-white/60 text-[11px] font-bold tracking-[0.4em] uppercase">{SLIDES[activeIndex].label}</span>
                                    </div>
                                    <h3 className="text-4xl md:text-6xl lg:text-[4.5rem] font-medium text-white leading-none tracking-tight">
                                        {SLIDES[activeIndex].title}
                                    </h3>
                                </div>

                                <div className="flex flex-col items-start gap-8 w-full">
                                    <p className="text-base md:text-lg text-white/50 font-light leading-relaxed max-w-md">
                                        {SLIDES[activeIndex].desc}
                                    </p>
                                    
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        className="group flex items-center justify-center border border-white/20 px-8 py-4 hover:bg-white hover:border-white transition-all duration-500 whitespace-nowrap"
                                    >
                                        <span className="text-white group-hover:text-black uppercase tracking-[0.3em] text-[10px] font-bold transition-colors">
                                            Explore Projects
                                        </span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Slider Navigation - Moved to the bottom */}
                <div className="flex flex-row justify-between items-end gap-2 md:gap-12 w-full mt-12 border-t border-white/10 pt-8">
                    {SLIDES.map((slide, idx) => {
                        const isFilled = (state === 'FILLING' && idx < activeIndex) || 
                                         (state === 'RESETTING' && idx < activeIndex);
                        const isCurrent = activeIndex === idx;
                        const currentProgress = isCurrent ? progress : (isFilled ? 100 : 0);

                        return (
                            <div key={slide.id} className="relative flex flex-col gap-3 md:gap-6 flex-1 group cursor-pointer w-full">
                                <span className={`text-[7px] md:text-[12px] font-bold tracking-[0.1em] md:tracking-[0.35em] uppercase whitespace-nowrap transition-colors duration-700 truncate text-center md:text-left ${isCurrent || isFilled ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>
                                    {slide.label}
                                </span>
                                <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
                                    <motion.div 
                                        className="absolute top-0 left-0 h-full bg-terracota"
                                        animate={{ width: `${currentProgress}%` }}
                                        transition={{ duration: 0.1, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Section Integrated */}
                <StatsSection />
            </div>
        </section>
    );
};

export default WorkshopSection;
