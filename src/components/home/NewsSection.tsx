import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const NEWS = [
    {
        id: 1,
        tag: "Journal",
        date: "07 June 2024",
        title: "Meetings with the Massingir Government",
        excerpt: "Discussions surrounding the new infrastructure development plan and integration with local environmental objectives.",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: 2,
        tag: "Article",
        date: "14 June 2024",
        title: "Preparation for the Nairobi Biennale",
        excerpt: "Our team finalizing the exhibition materials and conceptual models for the upcoming international architecture showcase.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: 3,
        tag: "Press Release",
        date: "12 July 2024",
        title: "New Office Opening in Lisbon",
        excerpt: "Expanding our European presence with a new central studio focused on sustainable urban innovation and historic retrofits.",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
    }
];

const NewsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const startTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % NEWS.length);
        }, 6000);
    };

    useEffect(() => {
        if (!isHovered) {
            startTimer();
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isHovered, currentIndex]);

    const handleManualSelect = (index: number) => {
        setCurrentIndex(index);
        startTimer();
    };

    // Auto-scroll the carousel when currentIndex changes (e.g. from autoplay)
    useEffect(() => {
        if (carouselRef.current) {
            const activeElement = document.getElementById(`news-thumb-${currentIndex}`);
            if (activeElement) {
                // Ensure it scrolls inside the container by simply passing the element's relative offset
                carouselRef.current.scrollTo({
                    left: activeElement.offsetLeft - carouselRef.current.offsetLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentIndex]);

    const activeNews = NEWS[currentIndex];

    // Calculate segments for progress bar markers
    const segmentWidth = 100 / NEWS.length;

    return (
        <section className="w-full bg-[#050505] text-white pt-24 pb-32 overflow-hidden border-t border-white/5 relative">
            <div className="container-custom flex flex-col gap-8 md:gap-12">
                
                {/* Header Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex justify-between items-end border-b border-white/10 pb-6"
                >
                    <h2 className="text-3xl md:text-5xl font-light tracking-tight">JOURNAL</h2>
                    <div className="text-terracota font-bold tracking-[0.3em] text-sm md:text-base">
                        0{currentIndex + 1} <span className="text-white/30 font-light">/ 0{NEWS.length}</span>
                    </div>
                </motion.div>

                {/* Featured Hero Image */}
                <div 
                    className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-[#111] rounded-sm overflow-hidden group cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={activeNews.id}
                            src={activeNews.image}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1.03,
                                transition: { opacity: { duration: 0.6 }, scale: { duration: 6, ease: "linear" } }
                            }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 w-full h-full object-cover origin-center"
                        />
                    </AnimatePresence>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col items-start z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`content-${activeNews.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="max-w-3xl flex flex-col gap-3 md:gap-4"
                            >
                                <div className="flex items-center gap-3 md:gap-4">
                                    <span className="bg-terracota text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-[2px]">
                                        {activeNews.tag}
                                    </span>
                                    <span className="text-white/60 text-[10px] md:text-[11px] uppercase tracking-widest">
                                        {activeNews.date}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-white mb-2">
                                    {activeNews.title}
                                </h3>
                                
                                <p className="text-white/70 text-[13px] md:text-base font-light leading-relaxed max-w-xl md:mb-4">
                                    {activeNews.excerpt}
                                </p>

                                <div className="flex items-center gap-3 text-[11px] md:text-xs uppercase font-bold tracking-widest text-white group-hover:text-terracota transition-colors mt-2">
                                    Read Article <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                    <motion.div
                        key={currentIndex}
                        initial={{ width: "0%" }}
                        animate={{ width: isHovered ? "0%" : "100%" }}
                        transition={{ duration: isHovered ? 0 : 6, ease: "linear" }}
                        className="h-full bg-terracota absolute left-0 top-0"
                    />
                    {/* Segment Markers */}
                    <div className="absolute inset-0 pointer-events-none w-full">
                        {NEWS.slice(0, -1).map((_, i) => (
                            <div key={i} className="absolute top-0 bottom-0 w-[2px] bg-[#050505]" style={{ left: `${(i + 1) * segmentWidth}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Card Strip */}
                <div 
                    ref={carouselRef}
                    className="flex overflow-x-auto gap-3 md:gap-6 w-full pb-6 md:pb-0 mt-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {NEWS.map((item, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div 
                                key={item.id}
                                id={`news-thumb-${idx}`}
                                onClick={() => handleManualSelect(idx)}
                                className={`w-[calc(33.333%-8px)] min-w-[110px] md:min-w-[240px] md:max-w-[300px] snap-center md:snap-start shrink-0 group flex flex-col gap-2 md:gap-4 cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-80 grayscale hover:grayscale-0'}`}
                            >
                                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-sm bg-[#111]">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} 
                                    />
                                    {isActive && (
                                        <div className="absolute inset-x-0 bottom-0 h-[2px] md:h-[3px] bg-terracota z-10" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 px-1">
                                    <span className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-terracota' : 'text-white/40 group-hover:text-terracota'} transition-colors whitespace-nowrap overflow-hidden text-ellipsis`}>
                                        {item.tag} / {item.date}
                                    </span>
                                    <h4 className="text-xs md:text-sm font-medium leading-[1.2] text-white line-clamp-2">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default NewsSection;
