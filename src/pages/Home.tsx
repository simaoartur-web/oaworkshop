import HeroSection from '../components/home/HeroSection';
import WorkshopSection from '../components/home/WorkshopSection';
import StudioAboutSection from '../components/home/StudioAboutSection';
import ProjectsSection from '../components/home/ProjectsSection';
import TeamSection from '../components/home/TeamSection';
import ContactSection from '../components/home/ContactSection';
import { motion } from 'framer-motion';

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
            <StudioAboutSection />
            <ProjectsSection />
            <TeamSection />
            <ContactSection />
        </motion.div>
    );
};

export default Home;
