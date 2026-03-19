import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
    const { scrollY } = useScroll();

    // Transform values for scroll animations
    const overlayOpacity = useTransform(scrollY, [0, 500], [0, 0.95]);
    const logoScale = useTransform(scrollY, [0, 500], [1, 0.6]);
    const logoY = useTransform(scrollY, [0, 500], [0, -100]);
    const nameOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const weAreOpacity = useTransform(scrollY, [0, 200], [1, 0]);

    const scrollToNext = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-terracota selection:bg-white/20">
            {/* Grain Texture Overlay for a premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-[5]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")' }}></div>
            
            {/* Dark Overlay that appears on scroll */}
            <motion.div
                style={{ opacity: overlayOpacity }}
                className="absolute inset-0 bg-black-900 z-10 pointer-events-none"
            />

            {/* Central Composition */}
            <div className="relative z-20 flex flex-col items-center text-center px-6">
                {/* WE ARE */}
                <motion.div
                    style={{ opacity: weAreOpacity }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-xs md:text-sm tracking-[0.8em] md:tracking-[1em] uppercase text-white/80 mb-6 md:mb-10 font-medium"
                >
                    We Are
                </motion.div>

                {/* Logo */}
                <motion.button
                    onClick={scrollToNext}
                    style={{ scale: logoScale, y: logoY }}
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8 md:mb-14 cursor-pointer focus:outline-none relative group"
                >
                    <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full scale-125 group-hover:bg-white/10 transition-colors duration-700"></div>
                    <img
                        src="/logo.png"
                        alt="O+A Logo"
                        className="w-[45vw] max-w-[250px] md:max-w-none md:w-[24rem] max-h-[35vh] object-contain relative z-10 brightness-110 contrast-[1.05]"
                    />
                </motion.button>

                {/* Names with Premium Typography */}
                <motion.div
                    style={{ opacity: nameOpacity }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col md:flex-row items-center gap-4 md:gap-16"
                >
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-white font-extralight italic font-serif text-3xl md:text-[2.75rem] tracking-tight leading-none mb-1">Osvaldo Luís</span>
                    </div>

                    <div className="hidden md:flex h-12 w-[1px] bg-white/10 relative overflow-hidden">
                        <motion.div 
                            initial={{ top: '-100%' }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white/40 to-transparent"
                        />
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-white font-extralight italic font-serif text-3xl md:text-[2.75rem] tracking-tight leading-none mb-1">Artur Simão</span>
                    </div>
                </motion.div>

                {/* Company Information */}
                <motion.div
                    style={{ opacity: nameOpacity }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center mt-6 md:mt-8 gap-y-1"
                >
                    <span className="text-white/60 text-[10px] md:text-xs tracking-[0.4em] uppercase font-medium">Architects and Planners</span>
                    <span className="text-white/40 text-[10px] tracking-[0.15em] font-light">Workshop • Design • Research</span>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2.5 }}
                className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 md:gap-3 cursor-pointer group"
                onClick={scrollToNext}
            >
                <motion.div 
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-white/40 group-hover:text-white transition-colors duration-500 mt-2"
                >
                    <ChevronDown size={28} strokeWidth={1} />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
