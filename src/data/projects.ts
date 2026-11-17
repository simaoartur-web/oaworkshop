import type { TFunction } from 'i18next';

export type ProjectDiscipline = 'architecture' | 'urbanism' | 'research';
export type EditorialStatus = 'demo' | 'verified';

export type PortfolioFilterKey =
    | 'all'
    | 'architecture'
    | 'urbanPlanning'
    | 'competitions'
    | 'interiorDesign'
    | 'landscaping'
    | 'furniture'
    | 'heritage';

export const PORTFOLIO_FILTER_KEYS: readonly PortfolioFilterKey[] = [
    'all',
    'architecture',
    'urbanPlanning',
    'competitions',
    'interiorDesign',
    'landscaping',
    'furniture',
    'heritage',
];

export interface MapMarker {
    lat: number;
    lng: number;
}

export interface Project {
    id: string;
    discipline: ProjectDiscipline;
    contentIndex: number;
    year: string;
    mapPosition: MapMarker;
    mainImage: string;
    thumbnail: string;
    imageIsPlaceholder?: boolean;
    editorialStatus?: EditorialStatus;
}

export interface LocalizedProject extends Project {
    title: string;
    category: string;
    location: string;
    description: string;
    scope: string[];
    area: string;
}

export interface PortfolioProjectItem {
    id: string;
    categories: readonly Exclude<PortfolioFilterKey, 'all'>[];
    mainImage: string;
    imageWebp?: string;
    thumbnail: string;
    date?: string;
    client?: string;
    area?: string;
    isPlaceholder?: boolean;
    editorialStatus: EditorialStatus;
}

export interface ResolvedProjectDetail {
    id: string;
    title: string;
    location?: string;
    date?: string;
    client?: string;
    area?: string;
    category?: string;
    description?: string;
    scope?: string[];
    mainImage: string;
    imageWebp?: string;
    imageAlt: string;
    imageIsPlaceholder?: boolean;
    editorialStatus?: EditorialStatus;
    categories?: readonly Exclude<PortfolioFilterKey, 'all'>[];
}

const project = (
    discipline: ProjectDiscipline,
    contentIndex: number,
    data: Omit<Project, 'discipline' | 'contentIndex'>,
): Project => ({ discipline, contentIndex, editorialStatus: 'demo', ...data });

export const ARCHITECTURE_PROJECTS: Project[] = [
    project('architecture', 0, {
        id: 'milan', year: '2025', mapPosition: { lat: 45.4642, lng: 9.19 },
        mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600',
    }),
    project('architecture', 1, {
        id: 'karlatornet', year: '2023', mapPosition: { lat: 57.7089, lng: 11.9746 },
        mainImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    }),
    project('architecture', 2, {
        id: 'carmichael', year: '2022', mapPosition: { lat: 18.975, lng: 72.8258 },
        mainImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
    }),
    project('architecture', 3, {
        id: 'rivage', year: '2024', mapPosition: { lat: 25.8925, lng: -80.1234 },
        mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    }),
];

export const URBANISM_PROJECTS: Project[] = [
    project('urbanism', 0, {
        id: 'singapore-green', year: '2026', mapPosition: { lat: 1.3521, lng: 103.8198 },
        mainImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=600',
    }),
    project('urbanism', 1, {
        id: 'milan-urban', year: '2024', mapPosition: { lat: 45.4642, lng: 9.19 },
        mainImage: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=600',
    }),
    project('urbanism', 2, {
        id: 'vancouver-waterfront', year: '2025', mapPosition: { lat: 49.2827, lng: -123.1207 },
        mainImage: '/images/project-placeholder.png',
        thumbnail: '/images/project-placeholder.png',
        imageIsPlaceholder: true,
    }),
    project('urbanism', 3, {
        id: 'london-smart', year: '2023', mapPosition: { lat: 51.5074, lng: -0.1278 },
        mainImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    }),
];

export const RESEARCH_PROJECTS: Project[] = [
    project('research', 0, {
        id: 'modular-sanitation', year: '2024', mapPosition: { lat: -19.8436, lng: 34.8389 },
        mainImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
    }),
    project('research', 1, {
        id: 'drr-resilience', year: '2025', mapPosition: { lat: 16.0544, lng: 108.2022 },
        mainImage: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=600',
    }),
    project('research', 2, {
        id: 'urban-heat-lab', year: '2023', mapPosition: { lat: 40.4168, lng: -3.7038 },
        mainImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    }),
    project('research', 3, {
        id: 'resilient-housing', year: '2026', mapPosition: { lat: -33.4489, lng: -70.6693 },
        mainImage: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=600',
    }),
];

export const PROJECT_GROUPS: Record<ProjectDiscipline, Project[]> = {
    architecture: ARCHITECTURE_PROJECTS,
    urbanism: URBANISM_PROJECTS,
    research: RESEARCH_PROJECTS,
};

export const ALL_PROJECTS = Object.values(PROJECT_GROUPS).flat();

/**
 * Homepage + PORTFOLIO showcase items (single typed source of truth).
 * Metadata not yet confirmed by the studio (client, area, full descriptions) is omitted rather than fabricated.
 */
export const PORTFOLIO_PROJECTS: readonly PortfolioProjectItem[] = [
    {
        id: 'professor-house',
        categories: ['architecture'],
        mainImage: '/images/portfolio/professor-house.jpg',
        imageWebp: '/images/portfolio/professor-house.webp',
        thumbnail: '/images/portfolio/professor-house.webp',
        date: '2026',
        editorialStatus: 'demo',
    },
    {
        id: 'metita-house',
        categories: ['architecture', 'landscaping'],
        mainImage: '/images/portfolio/metita-house.jpg',
        imageWebp: '/images/portfolio/metita-house.webp',
        thumbnail: '/images/portfolio/metita-house.webp',
        date: '2026',
        editorialStatus: 'demo',
    },
    {
        id: 'nelson-house',
        categories: ['architecture', 'interiorDesign'],
        mainImage: '/images/portfolio/nelson-house.jpg',
        imageWebp: '/images/portfolio/nelson-house.webp',
        thumbnail: '/images/portfolio/nelson-house.webp',
        date: '2026',
        editorialStatus: 'demo',
    },
    {
        id: 'wagner-house-1',
        categories: ['architecture', 'landscaping', 'interiorDesign'],
        mainImage: '/images/portfolio/wagner-house.jpg',
        imageWebp: '/images/portfolio/wagner-house.webp',
        thumbnail: '/images/portfolio/wagner-house.webp',
        date: '2026',
        editorialStatus: 'demo',
    },
    {
        id: 'wagner-house-2',
        categories: ['architecture', 'landscaping', 'interiorDesign'],
        mainImage: '/images/portfolio/wagner-house-2.jpg',
        imageWebp: '/images/portfolio/wagner-house-2.webp',
        thumbnail: '/images/portfolio/wagner-house-2.webp',
        date: '2026',
        editorialStatus: 'demo',
    },
    {
        id: 'wagner-house-3',
        categories: ['architecture', 'landscaping', 'interiorDesign'],
        mainImage: '/images/portfolio/wagner-house-3.jpg',
        imageWebp: '/images/portfolio/wagner-house-3.webp',
        thumbnail: '/images/portfolio/wagner-house-3.webp',
        date: '2026',
        editorialStatus: 'demo',
    },
];

export const ALL_PROJECT_ROUTE_ENTRIES: ReadonlyArray<{
    id: string;
    mainImage: string;
    imageIsPlaceholder?: boolean;
    editorialStatus?: EditorialStatus;
}> = [...ALL_PROJECTS, ...PORTFOLIO_PROJECTS];

export const hasProjectId = (id: string): boolean =>
    ALL_PROJECT_ROUTE_ENTRIES.some((item) => item.id === id);

export const localizeProject = (source: Project, t: TFunction): LocalizedProject => {
    const content = t(`categorySections.projects.${source.discipline}.${source.contentIndex}`, {
        returnObjects: true,
    }) as Pick<LocalizedProject, 'title' | 'category' | 'location' | 'description' | 'scope' | 'area'>;

    return { ...source, ...content };
};

interface PortfolioTranslatedEntry {
    id: string;
    title: string;
    location: string;
    imageAlt: string;
    description?: string;
    client?: string;
    area?: string;
    date?: string;
}

export const resolveProjectDetail = (id: string, t: TFunction): ResolvedProjectDetail | null => {
    const portfolioSource = PORTFOLIO_PROJECTS.find((item) => item.id === id);
    if (portfolioSource) {
        const items = t('portfolio.items', { returnObjects: true }) as PortfolioTranslatedEntry[];
        const copy = Array.isArray(items) ? items.find((item) => item.id === id) : undefined;
        const categoryLabels = portfolioSource.categories
            .map((cat) => t(`portfolio.filters.${cat}`))
            .join(' · ');

        return {
            id: portfolioSource.id,
            title: copy?.title ?? portfolioSource.id,
            location: copy?.location,
            date: copy?.date ?? portfolioSource.date,
            client: copy?.client ?? portfolioSource.client,
            area: copy?.area ?? portfolioSource.area,
            category: categoryLabels,
            description: copy?.description,
            mainImage: portfolioSource.mainImage,
            imageWebp: portfolioSource.imageWebp,
            imageAlt: portfolioSource.isPlaceholder ? '' : (copy?.imageAlt ?? copy?.title ?? portfolioSource.id),
            imageIsPlaceholder: portfolioSource.isPlaceholder,
            editorialStatus: portfolioSource.editorialStatus,
            categories: portfolioSource.categories,
        };
    }

    const catalogSource = ALL_PROJECTS.find((item) => item.id === id);
    if (!catalogSource) return null;

    const localized = localizeProject(catalogSource, t);
    return {
        id: localized.id,
        title: localized.title,
        location: localized.location,
        date: localized.year,
        area: localized.area && localized.area !== 'N/A' ? localized.area : undefined,
        category: localized.category,
        description: localized.description,
        scope: localized.scope,
        mainImage: localized.mainImage,
        imageAlt: localized.imageIsPlaceholder ? '' : localized.title,
        imageIsPlaceholder: localized.imageIsPlaceholder,
        editorialStatus: localized.editorialStatus,
    };
};

export const COMMON_MARKERS: MapMarker[] = [
    { lat: 40.7128, lng: -74.006 },
    { lat: 35.6762, lng: 139.6503 },
    { lat: -33.8688, lng: 151.2093 },
    { lat: -33.9249, lng: 18.4241 },
    { lat: -22.9068, lng: -43.1729 },
    { lat: 25.2048, lng: 55.2708 },
    { lat: 34.0522, lng: -118.2437 },
    { lat: 52.52, lng: 13.405 },
    { lat: 30.0444, lng: 31.2357 },
];

export const hasVerifiedProjects = (): boolean =>
    ALL_PROJECT_ROUTE_ENTRIES.some((item) => item.editorialStatus === 'verified');
