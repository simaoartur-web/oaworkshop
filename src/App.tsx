import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

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
    return (
        <div className="flex flex-col min-h-screen bg-black-900 text-white">
            <ScrollToTop />
            <Header />

            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Home />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                    </Routes>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}

export default App;
