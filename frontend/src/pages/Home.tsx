import HeroSection from '../components/home/HeroSection';
import WorkshopSection from '../components/home/WorkshopSection';
import ExpertiseSection from '../components/home/ExpertiseSection';
import ContactSection from '../components/home/ContactSection';

const Home = () => {
    return (
        <div className="w-full">
            <HeroSection />
            <WorkshopSection />
            <ExpertiseSection />
            <ContactSection />
        </div>
    );
};

export default Home;
