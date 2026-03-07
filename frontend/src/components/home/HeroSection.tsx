import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const IMAGES = [
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1628159807538-4e8c56fa2b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1545648588-bb71842eb552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
];

const HeroSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
        }, 7000); // 7 seconds per slide for a premium slow feel
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-black-900">
            {/* Background Media Slider with Slow Zoom Effect */}
            <div className="absolute inset-0 z-0 bg-black-900">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentIndex}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            opacity: { duration: 2, ease: "easeInOut" },
                            scale: { duration: 10, ease: "linear" }
                        }}
                    >
                        <img
                            src={IMAGES[currentIndex]}
                            alt="Modern Architecture"
                            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                        />
                    </motion.div>
                </AnimatePresence>
                {/* Fixed gradient overlay on top of all slides */}
                <div className="absolute inset-0 bg-gradient-to-b from-black-900/60 via-transparent to-black-900/90 mix-blend-multiply z-0 pointer-events-none" />
            </div>

            {/* Content Content Constraints */}
            <div className="flex-1 flex flex-col justify-center container-custom relative z-10 text-white pt-32 pb-16 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="max-w-4xl"
                >
                    <div className="text-xs tracking-[0.3em] uppercase mb-6 opacity-80 border-l border-white pl-4">
                        O+A Architects and Planners
                    </div>

                    <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-8">
                        Projetando lugares que funcionam <br />
                        <span className="font-semibold">hoje e amanhã</span>
                    </h1>

                    <p className="text-lg md:text-xl font-light text-gray-300 max-w-2xl mb-12 leading-relaxed">
                        Arquitetura, planeamento urbano e infraestrutura resiliente, com uma abordagem pragmática
                        para a entrega, impacto na comunidade e manutenção a longo prazo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <a href="#expertise" className="bg-white text-black-900 px-8 py-4 uppercase text-xs tracking-widest font-medium hover:bg-gray-200 transition-colors inline-block text-center">
                            Nossa Expertise
                        </a>
                        <a href="#projects" className="border border-white/30 text-white px-8 py-4 uppercase text-xs tracking-widest font-medium hover:bg-white/10 transition-colors inline-block text-center">
                            Ver Projectos
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Stats Bar at bottom */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="relative z-10 w-full bg-black-900/80 backdrop-blur-md border-t border-white/10 py-6 mt-auto"
            >
                <div className="container-custom grid grid-cols-3 gap-4 md:gap-12 divide-x divide-white/10">
                    <div className="text-center px-4">
                        <div className="text-2xl md:text-4xl font-light text-white mb-1">15+</div>
                        <div className="text-[10px] md:text-xs tracking-widest uppercase text-gray-400">Anos de Experiência</div>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-2xl md:text-4xl font-light text-white mb-1">50+</div>
                        <div className="text-[10px] md:text-xs tracking-widest uppercase text-gray-400">Projectos Concluídos</div>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-2xl md:text-4xl font-light text-white mb-1">2</div>
                        <div className="text-[10px] md:text-xs tracking-widest uppercase text-gray-400">Continentes</div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
