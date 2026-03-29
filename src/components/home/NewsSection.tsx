import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Plus } from 'lucide-react';

const NEWS = [
    {
        id: 1,
        category: "Journal / Article / 07 June 2024",
        title: "Meetings with the Massingir Goverment",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: 2,
        category: "Journal / Article / 07 June 2024",
        title: "Preparation for the Nairobi Bienale",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: 3,
        category: "Press Release / 12 July 2024",
        title: "New Office Opening in Lisbon",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
    }
];

const NewsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const nextNews = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % NEWS.length);
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            nextNews();
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const activeNews = NEWS[currentIndex];
    const nextItem = NEWS[(currentIndex + 1) % NEWS.length];

    // Variants for the "closing" and entering animation
    const imageVariants: Variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] }
        })
    };

    const textVariants: Variants = {
        enter: { opacity: 0, y: 20 },
        center: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <section className="w-full bg-[#050505] text-white py-20 md:py-32 px-6 md:px-10 overflow-hidden border-t border-white/5 relative">
            
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-12 lg:gap-20">
                
                {/* Left Side: Featured News */}
                <div className="w-full md:w-[60%] flex flex-col relative">
                    <div className="relative aspect-[16/10] overflow-hidden mb-6 bg-[#111]">
                        <AnimatePresence custom={direction} mode="popLayout">
                            <motion.img
                                key={activeNews.id}
                                src={activeNews.image}
                                custom={direction}
                                variants={imageVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeNews.id}
                            variants={textVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="flex items-start gap-4"
                        >
                            <Plus size={24} strokeWidth={3} className="text-white shrink-0 mt-1" />
                            <div className="flex flex-col gap-2">
                                <span className="text-sm md:text-base font-bold underline decoration-2 underline-offset-4">
                                    {activeNews.category}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold underline decoration-2 underline-offset-4 leading-tight">
                                    {activeNews.title}
                                </h3>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Next News Preview & Navigation */}
                <div className="w-full md:w-[40%] flex flex-col justify-center gap-8 md:pl-10 relative">
                    
                    <div className="flex items-center gap-4 mb-4">
                        <Plus size={32} strokeWidth={4} className="text-white" />
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">NEWs</h2>
                    </div>

                    {/* Preview Image */}
                    <div className="relative aspect-[4/3] w-full max-w-[350px] overflow-hidden bg-[#111] mb-6 cursor-pointer" onClick={nextNews}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={nextItem.id}
                                src={nextItem.image}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Preview Text */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={nextItem.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex items-start gap-4"
                        >
                            <Plus size={20} className="text-white shrink-0 mt-1" />
                            <div className="flex flex-col gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={nextNews}>
                                <span className="text-xs md:text-sm font-bold underline decoration-2 underline-offset-4">
                                    {nextItem.category}
                                </span>
                                <h4 className="text-lg md:text-xl font-bold underline decoration-2 underline-offset-4 leading-tight">
                                    {nextItem.title}
                                </h4>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Manual Navigation (Far Right) */}
                    <button 
                        onClick={nextNews}
                        className="absolute right-0 top-1/2 -translate-y-1/2 md:-right-10 hidden lg:flex p-4 hover:scale-110 hover:text-terracota transition-all duration-300"
                    >
                        <Plus size={40} strokeWidth={3} />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default NewsSection;
