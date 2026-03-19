import type { Project, Marker } from '../components/home/CategoryMapSection';

export const ARCHITECTURE_PROJECTS: Project[] = [
    {
        id: "milan",
        title: "Milan Cultural Hub",
        category: "Public Sector",
        location: "Milan, Italy",
        year: "2025",
        mapPosition: { top: "45%", left: "48%" },
        mainImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600",
        description: "A state-of-the-art facility designed to foster creativity and community engagement. The hub features flexible performance spaces, art galleries, and modern architectural elements that blend seamlessly with the historic Milanese landscape.",
        scope: ["Architectural Design", "Urban Planning", "Sustainability Consulting"],
        area: "12,500 sqm"
    },
    {
        id: "karlatornet",
        title: "Karlatornet",
        category: "Mixed-Use",
        location: "Gothenburg, Sweden",
        year: "2023",
        mapPosition: { top: "25%", left: "50%" },
        mainImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
        description: "Currently the tallest building in the Nordic countries, Karlatornet is a symbol of Gothenburg's modern evolution. It integrates luxury residential units with world-class amenities and observation decks.",
        scope: ["Skyscraper Engineering", "Luxury Interiors", "Public Observation"],
        area: "95,000 sqm"
    },
    {
        id: "carmichael",
        title: "Carmichael Residences",
        category: "Residential",
        location: "Mumbai, India",
        year: "2022",
        mapPosition: { top: "60%", left: "75%" },
        mainImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
        description: "A collection of ultra-exclusive residences in the heart of Mumbai. The design focuses on vertical greenery and sustainable living, providing a sanctuary away from the city's bustling energy.",
        scope: ["Biophilic Architecture", "High-End Residential", "Structural Innovation"],
        area: "8,200 sqm"
    },
    {
        id: "rivage",
        title: "Rivage Bal Harbour",
        category: "Residential",
        location: "Florida, United States",
        year: "2024",
        mapPosition: { top: "50%", left: "15%" },
        mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600",
        description: "Oceanfront luxury redefined. Rivage Bal Harbour offers unparalleled views of the Atlantic, with expansive terraces and a design that emphasizes transparency and light.",
        scope: ["Oceanfront Design", "Landscape Integration", "Material Excellence"],
        area: "15,000 sqm"
    }
];

export const URBANISM_PROJECTS: Project[] = [
    {
        id: "singapore-green",
        title: "Singapore Green Corridor",
        category: "Urban Vision",
        location: "Singapore",
        year: "2026",
        mapPosition: { top: "65%", left: "82%" },
        mainImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=600",
        description: "A comprehensive urban strategy to transform disused rail corridors into a continuous park system, integrating transit with ecology.",
        scope: ["Master Planning", "Public Domain", "Sustainable Mobility"],
        area: "24,000 sqm"
    },
    {
        id: "milan-urban",
        title: "Milan Urban Forest",
        category: "Environmental Strategy",
        location: "Milan, Italy",
        year: "2024",
        mapPosition: { top: "44%", left: "47%" },
        mainImage: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=600",
        description: "Structural plan for mass afforestation within the urban core to mitigate heat island effects and enhance air quality.",
        scope: ["Urban Ecology", "Strategic Planning", "Landscape Policy"],
        area: "50,000 sqm"
    },
    {
        id: "vancouver-waterfront",
        title: "Waterfront Resilience",
        category: "Strategic Vision",
        location: "Vancouver, Canada",
        year: "2025",
        mapPosition: { top: "35%", left: "12%" },
        mainImage: "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=600",
        description: "Redesigning the urban coastline to withstand rising sea levels while creating high-quality public space and cultural nodes.",
        scope: ["Coastal Engineering", "Urban Design", "Public Infrastructure"],
        area: "32,000 sqm"
    },
    {
        id: "london-smart",
        title: "London Smart Quarter",
        category: "Zone Development",
        location: "London, UK",
        year: "2023",
        mapPosition: { top: "38%", left: "40%" },
        mainImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
        description: "A pilot project for data-driven urbanism, utilizing smart grids and adaptive streetscapes to optimize energy and mobility.",
        scope: ["Tech Integration", "Zoning Reform", "Adaptive Design"],
        area: "18,500 sqm"
    }
];

export const RESEARCH_PROJECTS: Project[] = [
    {
        id: "modular-sanitation",
        title: "Modular WASH Hub",
        category: "WASH",
        location: "Beira, Mozambique",
        year: "2024",
        mapPosition: { top: "75%", left: "55%" },
        mainImage: "https://images.unsplash.com/photo-1583339522870-0d9f28cef33f?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1583339522870-0d9f28cef33f?auto=format&fit=crop&q=80&w=600",
        description: "Rapidly deployable sanitation modules designed for low-resource environments and flood-prone urban settlements.",
        scope: ["System Prototype", "Material Research", "Modular Logic"],
        area: "N/A"
    },
    {
        id: "drr-resilience",
        title: "Coastal DRR Strategy",
        category: "DRR",
        location: "Da Nang, Vietnam",
        year: "2025",
        mapPosition: { top: "55%", left: "85%" },
        mainImage: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=600",
        description: "Design conscious of risks: developing construction guidelines for cyclone-resistant schools and clinics.",
        scope: ["Risk Mapping", "Technical Standards", "Local Training"],
        area: "N/A"
    },
    {
        id: "urban-heat-lab",
        title: "Urban Heat Laboratory",
        category: "Field Research",
        location: "Madrid, Spain",
        year: "2023",
        mapPosition: { top: "48%", left: "42%" },
        mainImage: "https://images.unsplash.com/photo-1493238792000-811347057630?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1493238792000-811347057630?auto=format&fit=crop&q=80&w=600",
        description: "In-situ performance testing of passive cooling facades and material emissivity in dense urban fabrics.",
        scope: ["Data Collection", "Facade Prototype", "Performance Analysis"],
        area: "N/A"
    },
    {
        id: "resilient-housing",
        title: "Adaptive Housing Kit",
        category: "Global Research",
        location: "Santiago, Chile",
        year: "2026",
        mapPosition: { top: "80%", left: "28%" },
        mainImage: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=600",
        description: "A research-led housing system that grows with its occupants, designed to adapt to seismic activity.",
        scope: ["Seismic Design", "Incremental Logic", "Community Pilot"],
        area: "4,500 sqm"
    }
];

export const COMMON_MARKERS: Marker[] = [
    { top: "40%", left: "42%" },
    { top: "35%", left: "44%" },
    { top: "48%", left: "38%" },
    { top: "55%", left: "35%" },
    { top: "55%", left: "58%" },
    { top: "50%", left: "62%" },
    { top: "38%", left: "52%" },
    { top: "32%", left: "46%" },
    { top: "42%", left: "54%" },
];
