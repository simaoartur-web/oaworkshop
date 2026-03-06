import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
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
        setMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container-custom flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-black-900 text-white flex items-center justify-center font-bold text-xl group-hover:bg-black-700 transition-colors">
                            O+A
                        </div>
                        <div className={`hidden md:block transition-opacity duration-300 ${isScrolled ? 'opacity-100 text-black-900' : 'opacity-100 text-white drop-shadow-md'}`}>
                            <div className="font-semibold tracking-wide text-sm">ARCHITECTS AND PLANNERS</div>
                            <div className="text-[10px] tracking-widest uppercase opacity-70">For a changing world</div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className={`hidden md:flex items-center gap-8 text-sm tracking-widest uppercase font-medium ${isScrolled ? 'text-black-900' : 'text-white drop-shadow-md'}`}>
                        <Link to="/#workshop" className="hover:opacity-60 transition-opacity">Workshop</Link>
                        <Link to="/#expertise" className="hover:opacity-60 transition-opacity">Expertise</Link>
                        <Link to="/projects" className="hover:opacity-60 transition-opacity">Projectos</Link>
                        <Link to="/#contact" className="hover:opacity-60 transition-opacity">Contactos</Link>

                        <div className="flex items-center gap-2 ml-4 text-xs">
                            <button className="font-bold">PT</button>
                            <span className="opacity-30">|</span>
                            <button className="opacity-50 hover:opacity-100">EN</button>
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
                            <Link to="/#workshop" className="hover:pl-4 transition-all">01. Workshop</Link>
                            <Link to="/#expertise" className="hover:pl-4 transition-all">02. Expertise</Link>
                            <Link to="/projects" className="hover:pl-4 transition-all">03. Projectos</Link>
                            <Link to="/#contact" className="hover:pl-4 transition-all">04. Contactos</Link>
                        </nav>

                        <div className="p-12 mb-8 flex gap-6 text-sm tracking-widest opacity-60">
                            <button className="text-white">PT</button>
                            <button>EN</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
