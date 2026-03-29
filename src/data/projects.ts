import type { Project, MapMarker } from '../components/home/CategoryMapSection';

export const ARCHITECTURE_PROJECTS: Project[] = [
    {
        id: "milan",
        title: "Milan Cultural Hub",
        category: "Public Sector",
        location: "Milan, Italy",
        year: "2025",
        mapPosition: { lat: 45.4642, lng: 9.1900 },
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
        mapPosition: { lat: 57.7089, lng: 11.9746 },
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
        mapPosition: { lat: 18.9750, lng: 72.8258 },
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
        mapPosition: { lat: 25.8925, lng: -80.1234 },
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
        mapPosition: { lat: 1.3521, lng: 103.8198 },
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
        mapPosition: { lat: 45.4642, lng: 9.1900 },
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
        mapPosition: { lat: 49.2827, lng: -123.1207 },
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
        mapPosition: { lat: 51.5074, lng: -0.1278 },
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
        mapPosition: { lat: -19.8436, lng: 34.8389 },
        mainImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
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
        mapPosition: { lat: 16.0544, lng: 108.2022 },
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
        mapPosition: { lat: 40.4168, lng: -3.7038 },
        mainImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
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
        mapPosition: { lat: -33.4489, lng: -70.6693 },
        mainImage: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=2000",
        thumbnail: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=600",
        description: "A research-led housing system that grows with its occupants, designed to adapt to seismic activity.",
        scope: ["Seismic Design", "Incremental Logic", "Community Pilot"],
        area: "4,500 sqm"
    }
];

export const COMMON_MARKERS: MapMarker[] = [
    { lat: 40.7128, lng: -74.0060 },  // New York
    { lat: 35.6762, lng: 139.6503 },  // Tokyo
    { lat: -33.8688, lng: 151.2093 }, // Sydney
    { lat: -33.9249, lng: 18.4241 },  // Cape Town
    { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
    { lat: 25.2048, lng: 55.2708 },   // Dubai
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    { lat: 52.5200, lng: 13.4050 },   // Berlin
    { lat: 30.0444, lng: 31.2357 },   // Cairo
];
