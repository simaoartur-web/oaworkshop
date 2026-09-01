import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t, i18n } = useTranslation();
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
        const closeMenus = window.setTimeout(() => {
            setIsMenuOpen(false);
            setIsMenuAnimDone(false);
            setIsSearchOpen(false);
        }, 0);

        return () => window.clearTimeout(closeMenus);
    }, [location]);

    const activeLanguage = i18n.resolvedLanguage === 'pt' ? 'pt' : 'en';

    const changeLanguage = (lng: 'en' | 'pt') => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <motion.header
                style={{ opacity: headerOpacity }}
                animate={{ y: isHidden ? "-100%" : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 w-full z-[80] py-4 bg-[#050505]/45 backdrop-blur-sm md:backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
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
                        <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-medium mr-1 md:mr-2">
                            <button
                                type="button"
                                onClick={() => changeLanguage('en')}
                                aria-label={t('common.switchToEnglish')}
                                aria-pressed={activeLanguage === 'en'}
                                className={`transition-colors ${activeLanguage === 'en' ? 'text-terracota' : 'text-white/40 hover:text-white'}`}
                            >
                                ENG
                            </button>
                            <span className="text-white/10">|</span>
                            <button
                                type="button"
                                onClick={() => changeLanguage('pt')}
                                aria-label={t('common.switchToPortuguese')}
                                aria-pressed={activeLanguage === 'pt'}
                                className={`transition-colors ${activeLanguage === 'pt' ? 'text-terracota' : 'text-white/40 hover:text-white'}`}
                            >
                                PT
                            </button>
                        </div>

                        {/* Expandable Search Input */}
                        <div className="flex items-center">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.input
                                        initial={{ maxWidth: 0, opacity: 0 }}
                                        animate={{ maxWidth: 300, opacity: 1 }}
                                        exit={{ maxWidth: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        autoFocus
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder={t('common.searchPlaceholder')}
                                        className="bg-transparent border-b border-white/20 text-[11px] tracking-widest font-light text-white focus:outline-none focus:border-white placeholder-white/30 truncate py-1 w-[35vw] md:w-[220px]"
                                    />
                                )}
                            </AnimatePresence>
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                aria-label={isSearchOpen ? t('common.closeSearch') : t('common.openSearch')}
                                aria-expanded={isSearchOpen}
                                className="text-white/70 hover:text-white transition-colors p-2 ml-2"
                            >
                                {isSearchOpen ? <X size={18} strokeWidth={1.2} /> : <Search size={18} strokeWidth={1.2} />}
                            </button>
                        </div>

                        {/* Expandable Menu "+" Button */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label={t('common.openMenu')}
                            aria-expanded={isMenuOpen}
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
                                        <div className="flex flex-col">
                                            <span className="font-light tracking-[0.3em] text-[11px] md:text-[12px] text-white uppercase">{t('common.discipline')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                                <button type="button" aria-label={t('common.closeMenu')} onClick={() => setIsMenuOpen(false)} className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-terracota hover:border-terracota transition-all duration-500 shadow-xl group">
                                    <X size={28} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* Navigation List */}
                            <nav className="flex-grow flex flex-col justify-start px-10 md:px-16 lg:px-20 py-8 gap-8 md:gap-10">
                                <Link to="/#workshop" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">01.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">{t('nav.workshop')}</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-terracota/80 group-hover:text-terracota group-hover:translate-x-4 transition-all duration-700">{t('nav.exploreStudio')}</span>
                                </Link>

                                <Link to="/#expertise" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">02.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">{t('nav.expertise')}</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-terracota/80 group-hover:text-terracota group-hover:translate-x-4 transition-all duration-700">{t('nav.ourSkills')}</span>
                                </Link>

                                <Link to="/projects" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">03.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">{t('nav.projects')}</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-terracota/80 group-hover:text-terracota group-hover:translate-x-4 transition-all duration-700">{t('nav.portfolio')}</span>
                                </Link>

                                <Link to="/#contact" className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-sm md:text-base font-bold tracking-widest text-white/20 group-hover:text-terracota transition-colors duration-500">04.</span>
                                        <span className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/50 group-hover:text-white transition-all duration-700">{t('nav.contact')}</span>
                                    </div>
                                    <span className="ml-8 md:ml-16 text-xl md:text-3xl lg:text-5xl italic text-white/20 group-hover:text-white group-hover:translate-x-4 transition-all duration-700">{t('nav.letsTalk')}</span>
                                </Link>
                            </nav>

                            {/* Menu Footer */}
                            <div className="p-10 md:p-14 lg:p-16 flex justify-between items-center border-t border-white/5 bg-black/40 mt-auto">
                                <div className="flex gap-8 text-[11px] tracking-[0.3em] font-medium">
                                    <button type="button" aria-label={t('common.switchToPortuguese')} aria-pressed={activeLanguage === 'pt'} onClick={(e) => { e.preventDefault(); changeLanguage('pt'); }} className={activeLanguage === 'pt' ? "text-terracota scale-110" : "opacity-30 hover:opacity-100 transition-all"}>PT</button>
                                    <button type="button" aria-label={t('common.switchToEnglish')} aria-pressed={activeLanguage === 'en'} onClick={(e) => { e.preventDefault(); changeLanguage('en'); }} className={activeLanguage === 'en' ? "text-terracota scale-110" : "opacity-30 hover:opacity-100 transition-all"}>EN</button>
                                </div>
                                <div className="text-[10px] tracking-[0.4em] uppercase opacity-10 hidden sm:block">
                                    {t('common.studioName')}
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
