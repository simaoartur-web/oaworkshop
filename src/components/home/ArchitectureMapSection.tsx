import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X, ArrowRight } from 'lucide-react';

const ARCHITECTURE_PROJECTS = [
    {
        id: "milan",
        title: "Milan Cultural Hub",
        category: "Public Sector",
        location: "Milan, Italy",
        year: "2025",
        mapPosition: { top: "45%", left: "48%" },
        mainImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600",
        description: "A state-of-the-art facility designed to foster creativity and community engagement. The hub features flexible performance spaces, art galleries, and modern architectural elements that blend seamlessly with the historic Milanese landscape.",
        scope: ["Architectural Design", "Urban Planning", "Sustainability Consulting"],
        area: "12,500 sqm"
    },
    {
        id: "karlatornet",
        title: "Karlatornet",
        category: "Mixed-Use",
        location: "Gothenburg, Sweden",
        year: "2023",
        mapPosition: { top: "25%", left: "50%" },
        mainImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
        description: "Currently the tallest building in the Nordic countries, Karlatornet is a symbol of Gothenburg's modern evolution. It integrates luxury residential units with world-class amenities and observation decks.",
        scope: ["Skyscraper Engineering", "Luxury Interiors", "Public Observation"],
        area: "95,000 sqm"
    },
    {
        id: "carmichael",
        title: "Carmichael Residences",
        category: "Residential",
        location: "Mumbai, India",
        year: "2022",
        mapPosition: { top: "60%", left: "75%" },
        mainImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
        description: "A collection of ultra-exclusive residences in the heart of Mumbai. The design focuses on vertical greenery and sustainable living, providing a sanctuary away from the city's bustling energy.",
        scope: ["Biophilic Architecture", "High-End Residential", "Structural Innovation"],
        area: "8,200 sqm"
    },
    {
        id: "rivage",
        title: "Rivage Bal Harbour",
        category: "Residential",
        location: "Florida, United States",
        year: "2024",
        mapPosition: { top: "50%", left: "15%" },
        mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600",
        description: "Oceanfront luxury redefined. Rivage Bal Harbour offers unparalleled views of the Atlantic, with expansive terraces and a design that emphasizes transparency and light.",
        scope: ["Oceanfront Design", "Landscape Integration", "Material Excellence"],
        area: "15,000 sqm"
    }
];

const DUMMY_MARKERS = [
    { top: "40%", left: "42%" },
    { top: "35%", left: "44%" },
    { top: "48%", left: "38%" },
    { top: "55%", left: "35%" },
    { top: "55%", left: "58%" },
    { top: "50%", left: "62%" },
    { top: "38%", left: "52%" },
    { top: "32%", left: "46%" },
    { top: "42%", left: "54%" },
];

const ArchitectureMapSection = () => {
    const [activeProject, setActiveProject] = useState(ARCHITECTURE_PROJECTS[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const mapRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.4, 3.5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.4, 1));

    return (
        <section className="relative w-full flex flex-col lg:flex-row bg-[#080808] text-white min-h-[90vh] py-16 md:py-24 px-4 md:px-8 xl:px-16 gap-12 lg:gap-16 overflow-hidden">
            
            {/* Left Column: Map with Rotating Meteor Glow Border */}
            <div className="w-full lg:w-[42%] flex flex-col justify-start">
                <div className="relative w-full aspect-[4/5] md:aspect-[5/6] lg:aspect-[4/5] p-[2px] rounded-[6px] overflow-hidden group">
                    
                    {/* Rotating "Meteor" Glow Background */}
                    <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,#C45532_340deg,#C45532_360deg)] animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,rgba(196,85,50,0.4)_300deg,rgba(196,85,50,0.8)_360deg)] animate-[spin_10s_linear_infinite] blur-[25px] opacity-70"></div>
                    
                    <div className="relative w-full h-full bg-[#050505] rounded-[4px] overflow-hidden border border-white/10" ref={mapRef}>
                        <motion.div 
                            drag
                            dragConstraints={mapRef}
                            animate={{ scale }}
                            transition={{ type: "spring", stiffness: 200, damping: 30 }}
                            className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] touch-none cursor-grab active:cursor-grabbing"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop" 
                                className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen pointer-events-none select-none contrast-125 bg-black"
                                alt="Map Base"
                                draggable={false}
                            />

                            {DUMMY_MARKERS.map((pos, i) => (
                                <div 
                                    key={`dummy-${i}`} 
                                    className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-30 shadow-[0_0_8px_white] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={pos}
                                ></div>
                            ))}

                            {ARCHITECTURE_PROJECTS.map((proj) => {
                                const isActive = activeProject.id === proj.id;
                                return (
                                    <div 
                                        key={proj.id} 
                                        onClick={(e) => { e.stopPropagation(); setActiveProject(proj); }}
                                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 z-10 
                                            ${isActive ? 'w-[18px] h-[18px] bg-white border-[4px] border-terracota scale-125 shadow-[0_0_20px_#C45532]' : 'w-3 h-3 bg-white hover:scale-150 hover:bg-terracota shadow-[0_0_15px_white]'}`}
                                        style={proj.mapPosition}
                                    ></div>
                                );
                            })}
                        </motion.div>

                        {/* Map Zoom Controls */}
                        <div className="absolute bottom-6 right-6 flex flex-col border border-white/10 rounded-sm bg-black/80 backdrop-blur-md overflow-hidden z-20 shadow-xl">
                            <button className="p-3 text-white hover:bg-white/20 transition-colors cursor-pointer active:scale-95" onClick={handleZoomIn}>
                                <Plus size={20} strokeWidth={1.5} />
                            </button>
                            <button className="p-3 text-white hover:bg-white/20 border-t border-white/10 transition-colors cursor-pointer active:scale-95" onClick={handleZoomOut}>
                                <Minus size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Title + Main Display + Grid Thumbnails */}
            <div className="w-full lg:w-[58%] flex flex-col">
                
                {/* Title with Terracota + ARC */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] font-bold text-white mb-10 tracking-tight leading-none">
                    <span className="text-terracota whitespace-nowrap">+ ARC</span>hitecture
                </h2>

                {/* Main Interactive Display - LARGER IMAGE as requested */}
                <div className="flex flex-col md:flex-row gap-8 lg:gap-10 mb-14 items-start">
                    <div 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-[78%] aspect-video bg-[#111] relative overflow-hidden rounded-[4px] shadow-2xl group border border-white/5 cursor-pointer"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={activeProject.id}
                                src={activeProject.mainImage}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                                alt={activeProject.title}
                            />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-20"></div>
                        
                        {/* Interactive Hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-[2px]">
                            <div className="bg-white/10 border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 active:scale-95 group/btn">
                                <span className="text-sm font-bold uppercase tracking-widest text-white">Full Details</span>
                                <Plus size={18} className="text-terracota transition-transform duration-300 group-hover/btn:rotate-90" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Metadata column - Smaller width as background is larger */}
                    <div className="w-full md:w-[22%] flex flex-col pt-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeProject.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col space-y-7"
                            >
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-terracota tracking-[0.3em] mb-4">Expertise</span>
                                    <span className="text-lg text-white font-medium leading-tight">{activeProject.category}</span>
                                </div>
                                
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] mb-4">Location</span>
                                    <span className="text-[13px] text-white/80 font-medium leading-relaxed">{activeProject.location}</span>
                                </div>
                                
                                <div className="pt-6 border-t border-white/10">
                                    <span className="block text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] mb-2">Completion</span>
                                    <span className="text-2xl text-white font-bold tracking-tighter">{activeProject.year}</span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sub-projects Grid */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-8 opacity-40">
                        <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white">Project Library</span>
                        <div className="h-[1px] flex-grow mx-8 bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                        {ARCHITECTURE_PROJECTS.map((proj) => (
                            <motion.div 
                                key={proj.id} 
                                onClick={() => setActiveProject(proj)}
                                whileHover={{ y: -6 }}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div className={`relative aspect-square overflow-hidden rounded-[3px] transition-all duration-500 border 
                                    ${activeProject.id === proj.id ? 'border-terracota shadow-[0_15px_40px_rgba(196,85,50,0.3)]' : 'border-white/5 opacity-50 group-hover:opacity-100'}`}>
                                    <img 
                                        src={proj.thumbnail} 
                                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 
                                            ${activeProject.id === proj.id ? 'grayscale-0 scale-105' : 'grayscale group-hover:grayscale-0'}`}
                                        alt={proj.title}
                                    />
                                    {activeProject.id === proj.id && (
                                        <div className="absolute inset-0 border-[2px] border-terracota/50 pointer-events-none"></div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <h4 className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors 
                                        ${activeProject.id === proj.id ? 'text-terracota' : 'text-white/40 group-hover:text-white'}`}>
                                        {proj.title}
                                    </h4>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Project Details Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        {/* Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl"
                        ></motion.div>

                        {/* Modal Content */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.9)]"
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-5 right-5 z-50 p-2 bg-black/50 border border-white/10 rounded-full text-white hover:bg-terracota hover:border-terracota transition-all duration-300 active:scale-90 shadow-2xl"
                            >
                                <X size={20} />
                            </button>

                            {/* Modal Left: Image */}
                            <div className="w-full md:w-[55%] relative min-h-[250px] md:min-h-0">
                                <img 
                                    src={activeProject.mainImage} 
                                    className="w-full h-full object-cover" 
                                    alt={activeProject.title} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none"></div>
                            </div>

                            {/* Modal Right: Content */}
                            <div className="w-full md:w-[45%] p-6 md:p-10 flex flex-col justify-center">
                                <span className="inline-block px-2.5 py-0.5 bg-terracota/10 border border-terracota/20 rounded-full text-[9px] font-bold text-terracota uppercase tracking-widest mb-4 w-fit">
                                    {activeProject.category}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight leading-none">
                                    {activeProject.title}
                                </h3>
                                
                                <p className="text-white/50 text-[13px] md:text-sm leading-relaxed mb-8 font-light italic">
                                    "{activeProject.description}"
                                </p>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1.5 ">Location</span>
                                        <span className="text-[13px] text-white/90 font-medium">{activeProject.location}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1.5">Area</span>
                                        <span className="text-[13px] text-white/90 font-medium">{activeProject.area}</span>
                                    </div>
                                    <div className="col-span-2 border-t border-white/5 pt-5">
                                        <span className="block text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] mb-3">Scope of Work</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {activeProject.scope.map((tag, i) => (
                                                <span key={i} className="text-[10px] text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-[1px]">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors mt-auto pt-6 border-t border-white/5 w-fit">
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Inquire</span>
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-terracota group-hover:bg-terracota">
                                        <ArrowRight size={14} />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </section>
    );
};

export default ArchitectureMapSection;
