import HeroSection from '../components/home/HeroSection';
import WorkshopSection from '../components/home/WorkshopSection';
import ProjectsSection from '../components/home/ProjectsSection';
import ContactSection from '../components/home/ContactSection';
import CategoryMapSection from '../components/home/CategoryMapSection';
import { ARCHITECTURE_PROJECTS, URBANISM_PROJECTS, RESEARCH_PROJECTS, COMMON_MARKERS } from '../data/projects';

const Home = () => {
    return (
        <div className="w-full">
            <HeroSection />
            <WorkshopSection />
            <ProjectsSection />
            
            <CategoryMapSection 
                id="architecture"
                accentTitle="+ ARC"
                title="hitecture"
                projects={ARCHITECTURE_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <CategoryMapSection 
                id="urbanism"
                accentTitle="+ URB"
                title="anism"
                projects={URBANISM_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <CategoryMapSection 
                id="research"
                accentTitle="+ RES"
                title="earch"
                projects={RESEARCH_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <ContactSection />
        </div>
    );
};

export default Home;
