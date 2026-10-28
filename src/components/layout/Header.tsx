import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { buildLocalizedPath, getHomePrefix, getLocalizedInternalLink } from '../../seo/routes';

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
    const homePrefix = getHomePrefix(location.pathname);
    const homeLink = homePrefix;
    const projectsLink = getLocalizedInternalLink('/projects', location.pathname);
    const targetEnPath = buildLocalizedPath(location.pathname, 'en', location.hash);
    const targetPtPath = buildLocalizedPath(location.pathname, 'pt', location.hash);

    const changeLanguage = (lng: 'en' | 'pt') => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <motion.header
                style={{ opacity: headerOpacity }}
                animate={{ y: isHidden ? "-100%" : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 w-full z-[80] py-2.5 md:py-4 bg-[#070707]/60 backdrop-blur-md border-b border-white/[0.06] shadow-lg shadow-black/20"
            >
                <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-10 flex justify-between items-center h-14 sm:h-16 md:h-20">
                    {/* Logo Section - Minimal and Clean */}
                    <motion.div layoutId="main-logo-area">
                        <Link to={homeLink} className="flex items-center gap-3 md:gap-6 group shrink-0">
                            <img
                                src="/logo.png"
                                alt="O+A"
                                className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 object-contain brightness-110 group-hover:scale-105 transition-transform duration-500"
                            />
                        </Link>
                    </motion.div>

                    {/* Actions: Search & Menu */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-5">
                        {/* Language Switch */}
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] tracking-[0.2em] md:tracking-[0.28em] font-medium mr-0.5 md:mr-2">
                            <Link
                                to={targetEnPath}
                                onClick={() => changeLanguage('en')}
                                aria-label={t('common.switchToEnglish')}
                                aria-current={activeLanguage === 'en' ? 'page' : undefined}
                                className={`min-h-[36px] px-1.5 inline-flex items-center justify-center transition-colors ${activeLanguage === 'en' ? 'text-terracota font-semibold' : 'text-white/50 hover:text-white'}`}
                            >
                                ENG
                            </Link>
                            <span className="text-white/15 select-none">|</span>
                            <Link
                                to={targetPtPath}
                                onClick={() => changeLanguage('pt')}
                                aria-label={t('common.switchToPortuguese')}
                                aria-current={activeLanguage === 'pt' ? 'page' : undefined}
                                className={`min-h-[36px] px-1.5 inline-flex items-center justify-center transition-colors ${activeLanguage === 'pt' ? 'text-terracota font-semibold' : 'text-white/50 hover:text-white'}`}
                            >
                                PT
                            </Link>
                        </div>

                        {/* Expandable Search Input */}
                        <div className="flex items-center">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.input
                                        initial={{ maxWidth: 0, opacity: 0 }}
                                        animate={{ maxWidth: 240, opacity: 1 }}
                                        exit={{ maxWidth: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        autoFocus
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder={t('common.searchPlaceholder')}
                                        className="bg-transparent border-b border-white/25 text-[11px] tracking-widest font-light text-white focus:outline-none focus:border-white placeholder-white/35 truncate py-1 w-[28vw] sm:w-[160px] md:w-[220px]"
                                    />
                                )}
                            </AnimatePresence>
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                aria-label={isSearchOpen ? t('common.closeSearch') : t('common.openSearch')}
                                aria-expanded={isSearchOpen}
                                className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center text-white/75 hover:text-white transition-colors p-2 ml-0.5"
                            >
                                {isSearchOpen ? <X size={18} strokeWidth={1.25} /> : <Search size={18} strokeWidth={1.25} />}
                            </button>
                        </div>

                        {/* Expandable Menu "+" Button */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label={t('common.openMenu')}
                            aria-expanded={isMenuOpen}
                            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center text-white/80 hover:text-white transition-colors p-2"
                        >
                            <Plus size={22} strokeWidth={1.15} />
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
                            transition={{ type: 'tween', duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                boxShadow: isMenuAnimDone ? 'inset 0 0 40px rgba(196, 85, 50, 0.16), -10px 0 50px rgba(0, 0, 0, 0.5)' : 'none'
                            }}
                            className="fixed top-0 right-0 h-dvh w-full md:w-1/2 lg:w-[42%] z-[90] bg-[#080808]/90 backdrop-blur-3xl border-l border-white/10 text-white flex flex-col transition-shadow duration-1000 overflow-y-auto"
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
                            <div className="p-6 sm:p-10 md:p-14 lg:p-16 flex justify-between items-start">
                                <motion.div
                                    layoutId="main-logo-area"
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="flex flex-col items-start gap-4 sm:gap-6">
                                        <img
                                            src="/logo.png"
                                            alt="O+A"
                                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain brightness-150 contrast-125"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-light tracking-[0.28em] text-[10px] sm:text-[11px] md:text-[12px] text-white/85 uppercase">{t('common.discipline')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                                <button type="button" aria-label={t('common.closeMenu')} onClick={() => setIsMenuOpen(false)} className="p-3.5 sm:p-4 bg-white/5 border border-white/10 rounded-full hover:bg-terracota hover:border-terracota transition-all duration-500 shadow-xl group">
                                    <X size={24} strokeWidth={1.1} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* Navigation List */}
                            <nav className="flex-grow flex flex-col justify-start px-6 sm:px-10 md:px-16 lg:px-20 py-4 sm:py-8 gap-6 sm:gap-8 md:gap-10">
                                <Link to={`${homePrefix}#workshop`} onClick={() => setIsMenuOpen(false)} className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-3 sm:gap-4">
                                        <span className="text-xs sm:text-sm md:text-base font-bold tracking-widest text-white/25 group-hover:text-terracota transition-colors duration-500">01.</span>
                                        <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/60 group-hover:text-white transition-all duration-500">{t('nav.workshop')}</span>
                                    </div>
                                    <span className="ml-7 sm:ml-10 md:ml-16 text-lg sm:text-xl md:text-3xl lg:text-4xl italic text-terracota/85 group-hover:text-terracota group-hover:translate-x-3 transition-all duration-500">{t('nav.exploreStudio')}</span>
                                </Link>

                                <Link to={`${homePrefix}#portfolio`} onClick={() => setIsMenuOpen(false)} className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-3 sm:gap-4">
                                        <span className="text-xs sm:text-sm md:text-base font-bold tracking-widest text-white/25 group-hover:text-terracota transition-colors duration-500">02.</span>
                                        <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/60 group-hover:text-white transition-all duration-500">{t('nav.expertise')}</span>
                                    </div>
                                    <span className="ml-7 sm:ml-10 md:ml-16 text-lg sm:text-xl md:text-3xl lg:text-4xl italic text-terracota/85 group-hover:text-terracota group-hover:translate-x-3 transition-all duration-500">{t('nav.ourSkills')}</span>
                                </Link>

                                <Link to={projectsLink} onClick={() => setIsMenuOpen(false)} className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-3 sm:gap-4">
                                        <span className="text-xs sm:text-sm md:text-base font-bold tracking-widest text-white/25 group-hover:text-terracota transition-colors duration-500">03.</span>
                                        <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/60 group-hover:text-white transition-all duration-500">{t('nav.projects')}</span>
                                    </div>
                                    <span className="ml-7 sm:ml-10 md:ml-16 text-lg sm:text-xl md:text-3xl lg:text-4xl italic text-terracota/85 group-hover:text-terracota group-hover:translate-x-3 transition-all duration-500">{t('nav.portfolio')}</span>
                                </Link>

                                <Link to={`${homePrefix}#contact`} onClick={() => setIsMenuOpen(false)} className="group flex flex-col items-start gap-1">
                                    <div className="flex items-baseline gap-3 sm:gap-4">
                                        <span className="text-xs sm:text-sm md:text-base font-bold tracking-widest text-white/25 group-hover:text-terracota transition-colors duration-500">04.</span>
                                        <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/60 group-hover:text-white transition-all duration-500">{t('nav.contact')}</span>
                                    </div>
                                    <span className="ml-7 sm:ml-10 md:ml-16 text-lg sm:text-xl md:text-3xl lg:text-4xl italic text-white/30 group-hover:text-white group-hover:translate-x-3 transition-all duration-500">{t('nav.letsTalk')}</span>
                                </Link>
                            </nav>

                            {/* Menu Footer */}
                            <div className="p-6 sm:p-10 md:p-14 lg:p-16 flex justify-between items-center border-t border-white/5 bg-black/40 mt-auto">
                                <div className="flex gap-6 sm:gap-8 text-[11px] tracking-[0.3em] font-medium">
                                    <Link to={targetPtPath} aria-label={t('common.switchToPortuguese')} aria-current={activeLanguage === 'pt' ? 'page' : undefined} onClick={() => changeLanguage('pt')} className={`min-h-[36px] px-2 inline-flex items-center ${activeLanguage === 'pt' ? "text-terracota scale-110 font-semibold" : "opacity-40 hover:opacity-100 transition-all"}`}>PT</Link>
                                    <Link to={targetEnPath} aria-label={t('common.switchToEnglish')} aria-current={activeLanguage === 'en' ? 'page' : undefined} onClick={() => changeLanguage('en')} className={`min-h-[36px] px-2 inline-flex items-center ${activeLanguage === 'en' ? "text-terracota scale-110 font-semibold" : "opacity-40 hover:opacity-100 transition-all"}`}>EN</Link>
                                </div>
                                <div className="text-[10px] tracking-[0.4em] uppercase opacity-20 hidden sm:block">
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
