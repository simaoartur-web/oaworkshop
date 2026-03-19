import HeroSection from '../components/home/HeroSection';
import WorkshopSection from '../components/home/WorkshopSection';
import ArchitectureMapSection from '../components/home/ArchitectureMapSection';
import ProjectsSection from '../components/home/ProjectsSection';
import ContactSection from '../components/home/ContactSection';

const Home = () => {
    return (
        <div className="w-full">
            <HeroSection />
            <WorkshopSection />
            <ProjectsSection />
            <ArchitectureMapSection />
            <ContactSection />
        </div>
    );
};

export default Home;
