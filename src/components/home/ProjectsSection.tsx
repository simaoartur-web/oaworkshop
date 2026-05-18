import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import SectionOverlayStatus from '../common/SectionOverlayStatus';

const SERVICES = [
    { 
        title: "We Listen", 
        description: "Understanding your vision and constraints to establish a solid foundation." 
    },
    { 
        title: "We Research", 
        description: "Analysis of material sciences and urban fabric for data-driven solutions." 
    },
    { 
        title: "We Design", 
        description: "Creating innovative spaces prioritizing human experience and elegance." 
    },
    { 
        title: "We Deliver", 
        description: "Managing execution phases with rigorous technical precision." 
    },
    { 
        title: "We Support", 
        description: "Continuous commitment to post-occupancy performance and integrity." 
    }
];

const PROJECTS = [
    {
        year: "2022",
        title: "Adaptive Reuse Cultural Center",
        subtitle: "Transformation of Old Silos",
        description: "Conceptual Design, Structural Assessment, and Community Integration Planning.",
        location: "Milan"
    },
    {
        year: "2023",
        title: "Eco-District Masterplan",
        subtitle: "Sustainable Urban Expansion",
        description: "Comprehensive Urban Planning, Architectural Strategy, and Environmental Impact Assessment.",
        location: "Innovation Valley"
    },
    {
        year: "2024",
        title: "Restoration of the Urban Forest",
        subtitle: "Development of the North Park",
        description: "Final and Executive Design, Health & Safety Coordination, and precise Site Supervision.",
        location: "Municipality of Pescara"
    },
    {
        year: "2025",
        title: "Coastal Resilience Hub",
        subtitle: "Marine Research Facility",
        description: "Advanced environmental engineering, sustainable material integration, and execution management.",
        location: "Lisbon Port"
    },
    {
        year: "2026",
        title: "Vertical Green Tower",
        subtitle: "Mixed-Use Residential",
        description: "Parametric Facade Design, Energy Efficiency Modeling, and Landscape Architecture.",
        location: "Luanda"
    }
];

const ProjectsSection = () => {
    // Scroll Drag Logic - Native fluid scrolling
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Custom Cursor Logic
    const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
    
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const smoothX = useSpring(cursorX, { damping: 30, stiffness: 300, mass: 0.5 });
    const smoothY = useSpring(cursorY, { damping: 30, stiffness: 300, mass: 0.5 });

    const [isTouchDevice] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [cursorX, cursorY]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        if (scrollRef.current) {
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setScrollLeft(scrollRef.current.scrollLeft);
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsHoveringTimeline(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        if (scrollRef.current) {
            const x = e.pageX - scrollRef.current.offsetLeft;
            const walk = (x - startX) * 2.5; // Scroll speed multiplier
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (
        <section className="relative w-full overflow-hidden flex flex-col bg-black-900 border-t border-white/5">
            {/* Custom Hover/Drag Cursor Overlay */}
            {!isTouchDevice && typeof window !== 'undefined' && (
                <motion.div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        x: smoothX,
                        y: smoothY,
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: isHoveringTimeline ? 1 : 0, 
                        scale: isHoveringTimeline ? (isDragging ? 0.75 : 1) : 0 
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-20 h-20 md:w-24 md:h-24 bg-terracota border border-white/10 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold tracking-[0.3em] uppercase mix-blend-normal shadow-[0_0_30px_rgba(196,85,50,0.5)] pointer-events-none"
                >
                    {isDragging ? 'PULL' : 'DRAG'}
                </motion.div>
            )}

            {/* Top Dark Section - Methodology */}
            <div className="bg-black-900 text-white pt-24 pb-24 md:pt-32 md:pb-32 w-full z-20 relative">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                        {/* Left Column */}
                        <div className="flex flex-col pl-4 md:pl-8">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-medium mb-12 tracking-tight leading-tight"
                            >
                                Projects for the people
                            </motion.h2>
                            
                            <div className="flex flex-col">
                                {SERVICES.map((service, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -30, borderLeftColor: 'rgba(255,255,255,0)' }}
                                        whileInView={{ opacity: 1, x: 0, borderLeftColor: 'rgba(255,255,255,0.2)' }}
                                        viewport={{ once: false, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                                        className="border-l-[2px] border-white/20 pl-6 md:pl-10 pb-8 relative group"
                                    >
                                        <div className="flex items-center gap-4 cursor-default mb-2">
                                            <span className="text-terracota font-serif text-2xl leading-none -mt-1">+</span>
                                            <span className="text-xl md:text-2xl font-normal text-white group-hover:text-terracota transition-colors">{service.title}</span>
                                        </div>
                                        <p className="text-white/50 text-[13px] md:text-sm tracking-wide leading-relaxed font-light pr-4 max-w-sm">
                                            {service.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ duration: 1 }}
                            className="w-full h-full min-h-[400px] md:min-h-[500px] overflow-hidden relative group rounded-sm"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1600" 
                                alt="Planning" 
                                className="w-full h-full object-cover absolute inset-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1.5s] group-hover:scale-105 pointer-events-none"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black-900/50 to-transparent pointer-events-none"></div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Title Overlap exactly on the boundary */}
            <div className="w-full relative z-30 h-0 pointer-events-none">
                <div className="container-custom relative">
                    <motion.h2 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-[6rem] font-bold text-terracota tracking-tight uppercase absolute top-0 -translate-y-1/2 left-4 md:left-[2vw]"
                    >
                        OUR PROJECTS
                    </motion.h2>
                </div>
            </div>

            {/* Bottom Dark Timeline Section */}
            <div className="bg-black-800 w-full pt-20 pb-8 md:pt-28 md:pb-12 relative z-10 border-t border-white/10 overflow-hidden">
                <div className="container-custom">
                    <p className="max-w-xl text-sm md:text-base text-white/45 font-light leading-relaxed">
                        Our selected projects will be available soon.
                    </p>
                </div>
                {/* Full Width Native Drag Container */}
                <div className="relative mt-8 md:mt-12 w-full">
                    <SectionOverlayStatus
                        title="Coming Soon"
                        subtitle="Our selected projects will be available soon."
                        variant="coming-soon"
                        blurIntensity="strong"
                    />
                    <div className="pointer-events-none blur-[5px] saturate-50 opacity-45 select-none">
                    <div 
                        ref={scrollRef}
                        onMouseEnter={() => setIsHoveringTimeline(true)}
                        onMouseLeave={handleMouseLeave}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={`flex overflow-x-auto gap-0 relative z-10 select-none pb-8 pt-8 touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? 'scroll-auto' : 'scroll-smooth'} ${isTouchDevice ? '' : 'cursor-none'}`}
                        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                    >
                        {/* Buffer space on left to align roughly with main text container */}
                        <div className="shrink-0 w-6 md:w-12 xl:w-[calc(50vw-500px)] pointer-events-none"></div>

                        {PROJECTS.map((proj, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="min-w-[320px] md:min-w-[420px] lg:min-w-[480px] shrink-0 flex flex-col items-center text-center relative pointer-events-auto md:pointer-events-none group"
                            >
                                {/* Contiguous line segment */}
                                <div className="absolute top-[5px] left-0 right-0 h-[1px] bg-white/10 -z-10 group-hover:bg-terracota/40 transition-colors duration-500"></div>
                                
                                {/* Dot (Terracota over dark background) */}
                                <div className="absolute top-[0px] left-1/2 -translate-x-1/2 w-[12px] h-[12px] bg-[#d4af37] group-hover:bg-terracota transition-colors duration-500 rounded-full shadow-[0_0_0_6px_#1F1F1F] z-10 group-hover:scale-125"></div>
                                
                                <div className="flex flex-col items-center max-w-[85%] mt-8 opacity-75 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-y-1">
                                    <h3 className="text-white font-bold text-[15px] md:text-base leading-tight mb-2 tracking-wide uppercase">{proj.title} -</h3>
                                    <h4 className="text-white/60 font-medium text-[13px] md:text-[14px] leading-tight mb-4 tracking-wide">{proj.subtitle}</h4>
                                    <p className="text-white/40 text-[12px] md:text-[13px] leading-relaxed mb-8 font-light px-4">
                                        {proj.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-terracota text-[12px] md:text-sm font-bold tracking-widest">{proj.year}</span>
                                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                                        <span className="text-terracota/80 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">{proj.location}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        
                        {/* Buffer space on right */}
                        <div className="shrink-0 w-12 md:w-32 pointer-events-none"></div>
                    </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectsSection;
