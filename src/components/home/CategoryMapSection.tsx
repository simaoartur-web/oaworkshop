import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Plus, Minus, X, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker as LeafletMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SectionOverlayStatus from '../common/SectionOverlayStatus';
export interface Project {
    id: string;
    title: string;
    category: string;
    location: string;
    year: string;
    mapPosition: { lat: number; lng: number };
    mainImage: string;
    thumbnail: string;
    description: string;
    scope: string[];
    area: string;
}

export interface MapMarker {
    lat: number;
    lng: number;
}

const createCustomIcon = (isActive: boolean) => L.divIcon({
    className: 'bg-transparent border-none',
    html: isActive 
        ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' height='24' width='24'><circle cx='12' cy='12' r='8' fill='#C45532' stroke='white' stroke-width='3' /></svg>`
        : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' height='16' width='16'><circle cx='8' cy='8' r='5' fill='rgba(255,255,255,0.7)' /></svg>`,
    iconSize: isActive ? [24, 24] : [16, 16],
    iconAnchor: isActive ? [12, 12] : [8, 8]
});

const dummyIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' height='8' width='8'><circle cx='4' cy='4' r='3' fill='rgba(255,255,255,0.3)' /></svg>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4]
});

// Component to handle flying to an active marker
const MapController = ({ center }: { center: { lat: number, lng: number } }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.flyTo([center.lat, center.lng], 4, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

// Custom Zoom Control to match the previous aesthetic
const CustomZoomControl = () => {
    const map = useMap();
    return (
        <div className="absolute bottom-4 left-4 flex flex-col border border-white/10 rounded-sm bg-black/80 backdrop-blur-md overflow-hidden z-[400] shadow-xl pointer-events-auto">
            <button className="p-2.5 text-white hover:bg-white/20 transition-colors cursor-pointer active:scale-95 outline-none" onClick={() => map.zoomIn()}>
                <Plus size={18} strokeWidth={1.5} />
            </button>
            <button className="p-2.5 text-white hover:bg-white/20 border-t border-white/10 transition-colors cursor-pointer active:scale-95 outline-none" onClick={() => map.zoomOut()}>
                <Minus size={18} strokeWidth={1.5} />
            </button>
        </div>
    );
};

interface CategoryMapSectionProps {
    id?: string;
    title: string;
    accentTitle: string;
    projects: Project[];
    dummyMarkers?: MapMarker[];
}

const SECTION_COPY: Record<string, string> = {
    architecture: "Excellence in sustainable design and innovative technical implementation across global scales.",
    urbanism: "Research-driven planning solutions for the resilient cities and communities of tomorrow.",
    research: "Pushing boundaries in material science and sustainable construction methodologies.",
};

const CategoryMapSection = ({ id, title, accentTitle, projects, dummyMarkers = [] }: CategoryMapSectionProps) => {
    const sectionCopy = SECTION_COPY[id ?? ''] ?? "This section is currently being refined for publication.";
    
    const [activeProject, setActiveProject] = useState(projects[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const mapContainerRef = useRef(null);
    const isMapInView = useInView(mapContainerRef, { once: true, margin: "200px" });


    return (
        <section id={id} className="relative w-full bg-[#080808] text-white pt-10 pb-16 md:pt-14 md:pb-24 px-6 md:px-10 overflow-hidden border-t border-white/5">
            
            {/* Title above the content for better vertical alignment within the grid */}
            <div className="mb-10 md:mb-14">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-none uppercase">
                    <span className="text-terracota">{(accentTitle + title).slice(0, 5)}</span>
                    {(accentTitle + title).slice(5)}
                </h2>
                <p className="mt-5 max-w-2xl text-sm md:text-base text-white/50 font-light leading-relaxed">
                    {sectionCopy}
                </p>
            </div>

            {/* Two-column grid that stretches both columns to equal height */}
            <div className="relative">
                <SectionOverlayStatus
                    title="Under Construction"
                    subtitle="This section is currently being refined and will be available soon."
                    variant="under-construction"
                    blurIntensity="strong"
                />
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-[38%_1fr] gap-10 lg:gap-14 xl:gap-16 items-stretch pointer-events-none blur-[5px] saturate-50 opacity-45 select-none">

                {/* Left Column: Map */}
                <div className="relative w-full h-[350px] md:h-[400px] lg:h-auto lg:min-h-0 p-[2px] rounded-[6px] overflow-hidden group">
                    
                    {/* Rotating "Meteor" Glow Background */}
                    <div className="hidden md:block absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,#C45532_340deg,#C45532_360deg)] animate-[spin_10s_linear_infinite]"></div>
                    <div className="hidden md:block absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,rgba(196,85,50,0.4)_300deg,rgba(196,85,50,0.8)_360deg)] animate-[spin_10s_linear_infinite] blur-[25px] opacity-70"></div>
                    
                    <div className="relative w-full h-full bg-[#050505] rounded-[4px] overflow-hidden border border-white/10" ref={mapContainerRef}>
                        <div className="w-full h-full relative" style={{ zIndex: 0 }}>
                            {isMapInView && (
                            <MapContainer 
                                center={[activeProject.mapPosition.lat, activeProject.mapPosition.lng]} 
                                zoom={4} 
                                zoomControl={false}
                                attributionControl={false}
                                className="w-full h-full bg-[#050505]"
                                style={{ background: '#050505' }}
                            >
                                {/* CARTO Dark Matter TileLayer (No API Key Required) */}
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    maxZoom={19}
                                />
                                
                                <MapController center={activeProject.mapPosition} />
                                <CustomZoomControl />

                                {dummyMarkers.map((pos, i) => (
                                    <LeafletMarker 
                                        key={`dummy-${i}`} 
                                        position={[pos.lat, pos.lng]}
                                        icon={dummyIcon}
                                        interactive={false}
                                    />
                                ))}

                                {projects.map((proj) => {
                                    const isActive = activeProject.id === proj.id;
                                    return (
                                        <LeafletMarker 
                                            key={proj.id} 
                                            position={[proj.mapPosition.lat, proj.mapPosition.lng]}
                                            icon={createCustomIcon(isActive)}
                                            zIndexOffset={isActive ? 1000 : 0}
                                            eventHandlers={{
                                                click: () => setActiveProject(proj)
                                            }}
                                        />
                                    );
                                })}
                            </MapContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Display + Grid Thumbnails */}
                <div className="flex flex-col">
                    
                    {/* Main Interactive Display */}
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mb-12 items-stretch">
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full md:w-[78%] aspect-[16/10] bg-[#111] relative overflow-hidden rounded-[4px] shadow-2xl group border border-white/5 cursor-pointer flex-shrink-0"
                        >
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={activeProject.id}
                                    src={activeProject.mainImage}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                                    alt={activeProject.title}
                                    loading="lazy"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-20"></div>
                            
                            {/* Interactive Hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 bg-black/20 md:bg-black/40 backdrop-blur-[1px] md:backdrop-blur-[2px]">
                                <div className="bg-white/10 border border-white/20 px-4 md:px-6 py-2 md:py-3 rounded-full flex items-center gap-2 md:gap-3 active:scale-95 group/btn">
                                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white">Full Details</span>
                                    <Plus size={16} className="text-terracota transition-transform duration-300 md:group-hover/btn:rotate-90" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Metadata column */}
                        <div className="w-full md:flex-grow flex flex-col justify-end pb-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeProject.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex md:flex-col gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
                                >
                                    <div className="flex-shrink-0">
                                        <span className="block text-[10px] uppercase font-bold text-terracota tracking-[0.3em] mb-2">Expertise</span>
                                        <span className="text-sm lg:text-base text-white font-medium leading-tight">{activeProject.category}</span>
                                    </div>
                                    
                                    <div className="flex-shrink-0">
                                        <span className="block text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] mb-2">Location</span>
                                        <span className="text-sm lg:text-base text-white/90 font-medium leading-relaxed">{activeProject.location}</span>
                                    </div>
                                    
                                    <div className="flex-shrink-0 pt-0 md:pt-4 md:border-t md:border-white/10">
                                        <span className="block text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] mb-2">Completion</span>
                                        <span className="text-2xl text-white font-bold tracking-tighter">{activeProject.year}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sub-projects Grid */}
                    <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4 opacity-40">
                            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white">Project Library</span>
                            <div className="h-[1px] flex-grow mx-4 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5">
                            {projects.map((proj) => (
                                <motion.div 
                                    key={proj.id} 
                                    onClick={() => setActiveProject(proj)}
                                    whileHover={{ y: -4 }}
                                    className="flex flex-col group cursor-pointer"
                                >
                                    <div className={`relative aspect-[4/3] overflow-hidden rounded-[3px] transition-all duration-500 border 
                                        ${activeProject.id === proj.id ? 'border-terracota shadow-[0_10px_30px_rgba(196,85,50,0.25)]' : 'border-white/5 opacity-50 group-hover:opacity-100'}`}>
                                        <img 
                                            src={proj.thumbnail} 
                                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 
                                                ${activeProject.id === proj.id ? 'grayscale-0 scale-105' : 'grayscale group-hover:grayscale-0'}`}
                                            alt={proj.title}
                                            loading="lazy"
                                        />
                                        {activeProject.id === proj.id && (
                                            <div className="absolute inset-0 border-[2px] border-terracota/50 pointer-events-none"></div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <h4 className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors leading-tight
                                            ${activeProject.id === proj.id ? 'text-terracota' : 'text-white/40 group-hover:text-white'}`}>
                                            {proj.title}
                                        </h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Premium Project Details Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-8">
                        {/* Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm md:backdrop-blur-xl"
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
                                className="absolute top-5 right-5 z-50 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/50 border border-white/10 rounded-full text-white hover:bg-terracota hover:border-terracota transition-all duration-300 active:scale-90 shadow-2xl"
                            >
                                <X size={20} />
                            </button>

                            {/* Modal Left: Image */}
                            <div className="w-full md:w-[55%] relative min-h-[250px] md:min-h-0">
                                <img 
                                    src={activeProject.mainImage} 
                                    className="w-full h-full object-cover" 
                                    alt={activeProject.title} 
                                    loading="lazy"
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

export default CategoryMapSection;
