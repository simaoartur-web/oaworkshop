import type { TFunction } from 'i18next';

export type ProjectDiscipline = 'architecture' | 'urbanism' | 'research';

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
}

export interface LocalizedProject extends Project {
    title: string;
    category: string;
    location: string;
    description: string;
    scope: string[];
    area: string;
}

const project = (
    discipline: ProjectDiscipline,
    contentIndex: number,
    data: Omit<Project, 'discipline' | 'contentIndex'>,
): Project => ({ discipline, contentIndex, ...data });

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
        mainImage: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=2000',
        thumbnail: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=600',
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

export const localizeProject = (source: Project, t: TFunction): LocalizedProject => {
    const content = t(`categorySections.projects.${source.discipline}.${source.contentIndex}`, {
        returnObjects: true,
    }) as Pick<LocalizedProject, 'title' | 'category' | 'location' | 'description' | 'scope' | 'area'>;

    return { ...source, ...content };
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
