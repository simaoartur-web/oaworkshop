import HeroSection from '../components/home/HeroSection';
import WorkshopSection from '../components/home/WorkshopSection';
import ProjectsSection from '../components/home/ProjectsSection';
import ContactSection from '../components/home/ContactSection';
import CategoryMapSection from '../components/home/CategoryMapSection';
import NewsSection from '../components/home/NewsSection';
import { motion } from 'framer-motion';
import { ARCHITECTURE_PROJECTS, URBANISM_PROJECTS, RESEARCH_PROJECTS, COMMON_MARKERS } from '../data/projects';

const Home = () => {
    return (
        <motion.div 
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <HeroSection />
            <WorkshopSection />
            <ProjectsSection />
            
            <CategoryMapSection 
                id="architecture"
                accentTitle="+"
                projects={ARCHITECTURE_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <CategoryMapSection 
                id="urbanism"
                accentTitle="+"
                projects={URBANISM_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <CategoryMapSection 
                id="research"
                accentTitle="+"
                projects={RESEARCH_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />
            
            <NewsSection />


            <ContactSection />
        </motion.div>
    );
};

export default Home;
