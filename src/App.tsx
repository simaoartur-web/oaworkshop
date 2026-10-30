import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import DocumentHead from './seo/DocumentHead';
import { getLanguageFromPathname } from './seo/routes';

// ScrollToTop component with hash anchor support
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();
    useEffect(() => {
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
    }, [pathname, hash]);
    return null;
};

function App() {
    const location = useLocation();
    const { i18n } = useTranslation();

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
            <ScrollToTop />
            <Header />

            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Home />} />
                        <Route path="/en" element={<Home />} />
                        <Route path="/pt" element={<Home />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/en/projects" element={<Projects />} />
                        <Route path="/pt/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/en/projects/:id" element={<ProjectDetail />} />
                        <Route path="/pt/projects/:id" element={<ProjectDetail />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}

export default App;
