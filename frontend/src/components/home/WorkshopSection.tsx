import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import StatsSection from './StatsSection';

const SLIDES = [
    {
        id: "architecture",
        label: "ARChitecture",
        title: <>International <span className="italic font-serif font-extralight text-white/90">Architecture</span></>,
        desc: "Excellence in sustainable design and innovative technical implementation across global scales.",
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    },
    {
        id: "urbanism",
        label: "URBan Planning",
        title: <>Urbanism <span className="italic font-serif font-extralight text-white/90">Strategy</span></>,
        desc: "Research-driven planning solutions for the resilient cities and communities of tomorrow.",
        img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    },
    {
        id: "research",
        label: "RESearch",
        title: <>Experimental <span className="italic font-serif font-extralight text-white/90">Research</span></>,
        desc: "Pushing boundaries in material science and sustainable construction methodologies.",
        img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
    }
];

const PRESENTATION_IMG = "https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80";

type State = 'FILLING' | 'FULL' | 'RESETTING';

const WorkshopSection = () => {
    const [state, setState] = useState<State>('FILLING');
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const startReset = useCallback(() => {
        setState('RESETTING');
        setProgress(100);
    }, []);

    useEffect(() => {
        let interval: any;

        if (state === 'FILLING') {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        if (activeIndex < SLIDES.length - 1) {
                            setActiveIndex(activeIndex + 1);
                            return 0;
                        } else {
                            setState('FULL');
                            return 100;
                        }
                    }
                    return prev + 0.35;
                });
            }, 16);
        } else if (state === 'FULL') {
            const timeout = setTimeout(startReset, 5000);
            return () => clearTimeout(timeout);
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
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={state === 'FULL' ? 'presentation' : activeIndex}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 0.55, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <img
                            src={state === 'FULL' ? PRESENTATION_IMG : SLIDES[activeIndex].img}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black-900 via-black-900/30 to-transparent" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="container-custom relative z-20 h-full flex flex-col pt-8 pb-8">
                {/* Main Content Area - Refined for Organization & Premium Feel */}
                <div className="relative flex-grow flex items-center min-h-[40vh]">
                    <AnimatePresence mode="wait">
                        {state === 'FULL' ? (
                            <motion.div
                                key="hero-content"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                className="relative z-30 flex flex-col items-start text-left max-w-3xl"
                            >
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-4 mb-6"
                                >
                                    <span className="h-px w-8 bg-terracota" />
                                    <span className="text-terracota text-[10px] tracking-[0.5em] uppercase font-bold">The Philosophy</span>
                                </motion.div>

                                <h3 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1] mb-10">
                                    Crafting <br />
                                    <span className="italic font-serif font-extralight text-white/90">Human Spaces</span>
                                </h3>

                                <div className="grid grid-cols-1 gap-10 items-start w-full">
                                    <p className="text-base md:text-lg text-white/50 font-light leading-relaxed max-w-xl">
                                        We are an international workshop focus on sustainable architecture, defining the future of urbanism since 2025.
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-8 items-center">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-10 py-5 bg-white text-black text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-terracota hover:text-white transition-all duration-500 shadow-2xl shadow-white/5"
                                        >
                                            View Profile
                                        </motion.button>
                                        <button className="flex items-center gap-4 group text-[10px] uppercase tracking-[0.4em] text-white/50 hover:text-white transition-all">
                                            <span>The Studio</span>
                                            <div className="w-12 h-px bg-white/20 group-hover:w-20 group-hover:bg-terracota transition-all duration-700" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                                className="relative z-30 w-full flex flex-col items-start"
                            >
                                <div className="max-w-3xl space-y-12">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-6 mb-4">
                                            <span className="text-terracota font-serif italic text-2xl">0{activeIndex + 1}</span>
                                            <div className="h-px w-12 bg-white/20" />
                                            <span className="text-white/40 text-[10px] tracking-[0.5em] uppercase">{SLIDES[activeIndex].label}</span>
                                        </div>
                                        <h3 className="text-5xl md:text-7xl font-light text-white leading-[1] tracking-tighter">
                                            {SLIDES[activeIndex].title}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-end">
                                        <p className="text-base md:text-lg text-white/40 font-light leading-relaxed max-w-lg border-l border-white/10 pl-8">
                                            {SLIDES[activeIndex].desc}
                                        </p>
                                        
                                        <motion.button 
                                            whileHover={{ x: 10 }}
                                            className="group flex items-center gap-8 text-white uppercase tracking-[0.4em] text-[10px] font-bold"
                                        >
                                            <span className="px-10 py-5 border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                                Explore Projects
                                            </span>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Slider Navigation - Moved to the bottom */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 w-full mt-12 border-t border-white/10 pt-8">
                    {SLIDES.map((slide, idx) => {
                        const isFilled = (state === 'FILLING' && idx < activeIndex) || 
                                         (state === 'FULL') || 
                                         (state === 'RESETTING' && idx < activeIndex);
                        const isCurrent = activeIndex === idx;
                        const currentProgress = isCurrent ? progress : (isFilled ? 100 : 0);

                        return (
                            <div key={slide.id} className="relative flex flex-col gap-6 flex-1 group cursor-pointer w-full">
                                <span className={`text-xl md:text-2xl font-light tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-1000 ${isCurrent || isFilled ? 'text-white' : 'text-white/20'}`}>
                                    {slide.label.split('').map((char, charIdx) => {
                                        const charThreshold = (charIdx / slide.label.length) * 100;
                                        const isCharFilled = currentProgress > charThreshold;
                                        return (
                                            <span 
                                                key={charIdx}
                                                className="transition-colors duration-700"
                                                style={{ color: isCharFilled ? '#A65D4A' : 'inherit' }}
                                            >
                                                {char}
                                            </span>
                                        );
                                    })}
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
