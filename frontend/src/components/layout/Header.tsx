import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        // eslint-disable-next-line
        setMobileMenuOpen(false);
    }, [location]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black-900/95 backdrop-blur-sm border-b border-white/10 py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container-custom flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-4 group">
                        <img src="/logo.png" alt="O+A" className="w-12 h-12 object-contain" />
                        <div className={`hidden md:block transition-opacity duration-300 text-white`}>
                            <div className="font-semibold tracking-wide text-sm">ARCHITECTS AND PLANNERS</div>
                            <div className="text-[10px] tracking-widest uppercase opacity-70">{t('hero.subtitle')}</div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className={`hidden md:flex items-center gap-8 text-sm tracking-widest uppercase font-medium text-white`}>
                        <Link to="/#workshop" className="hover:opacity-60 transition-opacity">{t('nav.workshop')}</Link>
                        <Link to="/#expertise" className="hover:opacity-60 transition-opacity">{t('nav.expertise')}</Link>
                        <Link to="/projects" className="hover:opacity-60 transition-opacity">{t('nav.projects')}</Link>
                        <Link to="/#contact" className="hover:opacity-60 transition-opacity">{t('nav.contact')}</Link>

                        <div className="flex items-center gap-2 ml-4 text-xs font-bold">
                            <button
                                onClick={() => changeLanguage('pt')}
                                className={`transition-opacity ${i18n.language === 'pt' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            >PT</button>
                            <span className="opacity-30">|</span>
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`transition-opacity ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            >EN</button>
                        </div>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`md:hidden ${isScrolled ? 'text-black-900' : 'text-white'}`}
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.4 }}
                        className="fixed inset-0 z-[60] bg-black-900 text-white flex flex-col"
                    >
                        <div className="p-6 flex justify-end">
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X size={32} strokeWidth={1} />
                            </button>
                        </div>

                        <nav className="flex-grow flex flex-col justify-center px-12 gap-8 text-3xl font-light tracking-tight">
                            <Link to="/#workshop" className="hover:pl-4 transition-all">01. {t('nav.workshop')}</Link>
                            <Link to="/#expertise" className="hover:pl-4 transition-all">02. {t('nav.expertise')}</Link>
                            <Link to="/projects" className="hover:pl-4 transition-all">03. {t('nav.projects')}</Link>
                            <Link to="/#contact" className="hover:pl-4 transition-all">04. {t('nav.contact')}</Link>
                        </nav>

                        <div className="p-12 mb-8 flex gap-6 text-sm tracking-widest opacity-60">
                            <button onClick={() => changeLanguage('pt')} className={i18n.language === 'pt' ? "text-white opacity-100" : "opacity-60"}>PT</button>
                            <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? "text-white opacity-100" : "opacity-60"}>EN</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
