import HeroSection from '../components/home/HeroSection';
import WorkshopSection from '../components/home/WorkshopSection';
import ProjectsSection from '../components/home/ProjectsSection';
import ContactSection from '../components/home/ContactSection';
import CategoryMapSection from '../components/home/CategoryMapSection';
import NewsSection from '../components/home/NewsSection';

import { ARCHITECTURE_PROJECTS, URBANISM_PROJECTS, RESEARCH_PROJECTS, COMMON_MARKERS } from '../data/projects';

const Home = () => {
    return (
        <div className="w-full">
            <HeroSection />
            <WorkshopSection />
            <ProjectsSection />
            
            <CategoryMapSection 
                id="architecture"
                accentTitle="+"
                title=" ARCHITECTURE"
                projects={ARCHITECTURE_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <CategoryMapSection 
                id="urbanism"
                accentTitle="+"
                title=" URBAN PLANNING"
                projects={URBANISM_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />

            <CategoryMapSection 
                id="research"
                accentTitle="+"
                title=" RESEARCH"
                projects={RESEARCH_PROJECTS}
                dummyMarkers={COMMON_MARKERS}
            />
            
            <NewsSection />


            <ContactSection />
        </div>
    );
};

export default Home;
