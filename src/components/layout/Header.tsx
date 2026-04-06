import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuAnimDone, setIsMenuAnimDone] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const location = useLocation();
    const { scrollY } = useScroll();
    const [isHidden, setIsHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setIsHidden(true);
        } else {
            setIsHidden(false);
        }
    });

    // Visibility transition based on scroll
    const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

    // Close menus on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsMenuAnimDone(false);
        setIsSearchOpen(false);
    }, [location]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <motion.header
                style={{ opacity: headerOpacity }}
                animate={{ y: isHidden ? "-100%" : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 w-full z-50 py-4 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
            >
                <div className="w-full px-6 md:px-10 flex justify-between items-center h-18 md:h-20">
                    {/* Logo Section - Minimal and Clean */}
                    <motion.div layoutId="main-logo-area">
                        <Link to="/" className="flex items-center gap-3 md:gap-6 group shrink-0">
                            <img
                                src="/logo.png"
                                alt="O+A"
                                className="w-20 h-20 md:w-24 md:h-24 object-contain brightness-110 group-hover:scale-105 transition-transform duration-500"
                            />
                        </Link>
                    </motion.div>

                    {/* Actions: Search & Menu */}
                    <div className="flex items-center gap-2 md:gap-6">
                        {/* Language Switch */}
                        <div className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.3em] font-medium mr-2">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`transition-colors ${i18n.language === 'en' ? 'text-terracota' : 'text-white/40 hover:text-white'}`}
                            >
                                ENG
                            </button>
                            <span className="text-white/10">|</span>
                            <button
                                onClick={() => changeLanguage('pt')}
                                className={`transition-colors ${i18n.language === 'pt' ? 'text-terracota' : 'text-white/40 hover:text-white'}`}
                            >
                                PT
                            </button>
                        </div>

                        {/* Expandable Search Input */}
                        <div className="flex items-center">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.input
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 220, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        autoFocus
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder="Search..."
                                        className="bg-transparent border-b border-white/20 text-[11px] tracking-widest font-light text-white focus:outline-none focus:border-white placeholder-white/30 truncate py-1"
                                    />
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="text-white/70 hover:text-white transition-colors p-2 ml-2"
                            >
                                {isSearchOpen ? <X size={18} strokeWidth={1.2} /> : <Search size={18} strokeWidth={1.2} />}
                            </button>
                        </div>

                        {/* Expandable Menu "+" Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="text-white/70 hover:text-white transition-colors p-2"
                        >
                            <Plus size={22} strokeWidth={1} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Overlays: Menu and Search */}
            <AnimatePresence>
                {/* Sidebar Navigation Overlay */}
                {isMenuOpen && (
                    <>
                        {/* Backdrop to close the menu */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-md"
                        ></motion.div>

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            onAnimationComplete={() => setIsMenuAnimDone(true)}
                            transition={{ type: 'tween', duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                boxShadow: isMenuAnimDone ? 'inset 0 0 40px rgba(196, 85, 50, 0.2), -10px 0 50px rgba(0, 0, 0, 0.5)' : 'none'
                            }}
                            className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-[42%] z-[60] bg-[#080808]/70 backdrop-blur-3xl border-l border-white/10 text-white flex flex-col transition-shadow duration-1000 overflow-y-auto`}
                        >
                            {/* Inner Glow Border */}
                            <AnimatePresence>
                                {isMenuAnimDone && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 border-l border-terracota/30 pointer-events-none z-10"
                                    ></motion.div>
                                )}
                            </AnimatePresence>

                            {/* Menu Header with Logo and Close Button */}
                            <div className="p-10 md:p-14 lg:p-16 flex justify-between items-start">
                                <motion.div
                                    layoutId="main-logo-area"
                                    transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="flex flex-col items-start gap-6">
                                        <img
                                            src="/logo.png"
                                            alt="O+A"
                                            className="w-20 h-20 md:w-28 md:h-28 object-contain brightness-150 contrast-125"
                                        />
                                        <div className="flex flex-col space-y-2">
                                            <span className="font-light tracking-[0.3em] text-[11px] md:text-[12px] text-white uppercase">ARCHITECTS AND PLANNERS</span>
                                            <span className="text-[9px] tracking-[0.4em] uppercase opacity-30 text-white italic">Workshop • Design • Research</span>
                                        </div>
                                    </div>
                                </motion.div>
                                <button onClick={() => setIsMenuOpen(false)} className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-terracota hover:border-terracota transition-all duration-500 shadow-xl group">
                                    <X size={28} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* Navigation List */}
                            <nav className="flex-grow flex flex-col justify-start px-10 md:px-16 lg:px-20 py-8 gap-8 md:gap-10">
                                <Link to="/#workshop" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">01.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">Workshop</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-terracota/80 group-hover:text-terracota group-hover:translate-x-4 transition-all duration-700">Explore Studio</span>
                                </Link>

                                <Link to="/#expertise" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">02.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">Expertise</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-terracota/80 group-hover:text-terracota group-hover:translate-x-4 transition-all duration-700">Our Skills</span>
                                </Link>

                                <Link to="/projects" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">03.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">Projects</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-terracota/80 group-hover:text-terracota group-hover:translate-x-4 transition-all duration-700">Portfolio</span>
                                </Link>

                                <Link to="/#contact" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">04.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">Contact</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-white/20 group-hover:text-white group-hover:translate-x-4 transition-all duration-700">Let's Talk</span>
                                </Link>
                            </nav>

                            {/* Menu Footer */}
                            <div className="p-10 md:p-14 lg:p-16 flex justify-between items-center border-t border-white/5 bg-black/40 mt-auto">
                                <div className="flex gap-8 text-[11px] tracking-[0.3em] font-medium">
                                    <button onClick={(e) => { e.preventDefault(); changeLanguage('pt'); }} className={i18n.language === 'pt' ? "text-terracota scale-110" : "opacity-30 hover:opacity-100 transition-all"}>PT</button>
                                    <button onClick={(e) => { e.preventDefault(); changeLanguage('en'); }} className={i18n.language === 'en' ? "text-terracota scale-110" : "opacity-30 hover:opacity-100 transition-all"}>EN</button>
                                </div>
                                <div className="text-[10px] tracking-[0.4em] uppercase opacity-10 hidden sm:block">
                                    O + A • Architects and Planners
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
