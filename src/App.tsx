import { Routes, Route, useLocation, type Location } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import PortfolioProjectModal from './components/home/PortfolioProjectModal';
import DocumentHead from './seo/DocumentHead';
import { getLanguageFromPathname } from './seo/routes';

interface LocationState {
    backgroundLocation?: Location;
}

// ScrollToTop component with hash anchor support and modal-return scroll preservation
const ScrollToTop = ({ isModalOpen }: { isModalOpen: boolean }) => {
    const { pathname, hash } = useLocation();
    const wasModalOpenRef = useRef(false);
    const savedScrollYRef = useRef(0);
    const prevRestorationRef = useRef<ScrollRestoration>('auto');

    useEffect(() => {
        if (isModalOpen) {
            if (!wasModalOpenRef.current) {
                savedScrollYRef.current = window.scrollY;
                if ('scrollRestoration' in window.history) {
                    prevRestorationRef.current = window.history.scrollRestoration;
                    window.history.scrollRestoration = 'manual';
                }
            }
            wasModalOpenRef.current = true;
            return;
        }

        if (wasModalOpenRef.current) {
            wasModalOpenRef.current = false;
            const targetY = savedScrollYRef.current;
            const restore = () => window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
            restore();
            const frame = requestAnimationFrame(restore);
            const timer = window.setTimeout(() => {
                restore();
                if ('scrollRestoration' in window.history) {
                    window.history.scrollRestoration = prevRestorationRef.current;
                }
            }, 60);
            return () => {
                cancelAnimationFrame(frame);
                window.clearTimeout(timer);
            };
        }

        if (hash && hash !== '#top') {
            const targetId = hash.slice(1);
            const frame = requestAnimationFrame(() => {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            return () => cancelAnimationFrame(frame);
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [pathname, hash, isModalOpen]);

    return null;
};

function App() {
    const location = useLocation();
    const { i18n } = useTranslation();
    const state = location.state as LocationState | null;
    const backgroundLocation = state?.backgroundLocation;
    const displayLocation = backgroundLocation ?? location;

    // Keep active language aligned with route language prefix
    useEffect(() => {
        const routeLang = getLanguageFromPathname(location.pathname);
        if (routeLang !== i18n.resolvedLanguage) {
            i18n.changeLanguage(routeLang);
        }
    }, [location.pathname, i18n]);

    return (
        <div className="flex flex-col min-h-screen bg-black-900 text-white">
            <DocumentHead />
            <ScrollToTop isModalOpen={Boolean(backgroundLocation)} />
            <Header />

            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes location={displayLocation} key={displayLocation.pathname}>
                        <Route path="/" element={<Home />} />
                        <Route path="/en" element={<Home />} />
                        <Route path="/pt" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/en/about" element={<About />} />
                        <Route path="/pt/about" element={<About />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/en/projects" element={<Projects />} />
                        <Route path="/pt/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/en/projects/:id" element={<ProjectDetail />} />
                        <Route path="/pt/projects/:id" element={<ProjectDetail />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AnimatePresence>

                {backgroundLocation && (
                    <Routes>
                        <Route path="/projects/:id" element={<PortfolioProjectModal />} />
                        <Route path="/en/projects/:id" element={<PortfolioProjectModal />} />
                        <Route path="/pt/projects/:id" element={<PortfolioProjectModal />} />
                    </Routes>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default App;
