import type en from '../locales/en';
import type pt from '../locales/pt';

type TeamRole = keyof typeof en.team.roles & keyof typeof pt.team.roles;
type TeamCategory = keyof typeof en.team.categories & keyof typeof pt.team.categories;
type TeamBio = keyof typeof en.team.bios & keyof typeof pt.team.bios;
export type TeamProfilePlatform = keyof typeof en.team.socialPlatforms & keyof typeof pt.team.socialPlatforms;

export interface TeamImage {
    readonly src: string;
    readonly objectPosition?: string;
}

export interface TeamProfileLink {
    readonly id: string;
    readonly platform: TeamProfilePlatform;
    readonly url: string;
}

export interface TeamMember {
    readonly id: string;
    readonly name: string;
    readonly role: TeamRole;
    readonly category: TeamCategory;
    readonly leadership: boolean;
    readonly image: TeamImage | null;
    readonly bio: TeamBio | null;
    readonly links: readonly TeamProfileLink[];
}

export const getSafeTeamProfileUrl = (value: string): string | null => {
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || url.username || url.password) return null;
        return url.href;
    } catch {
        return null;
    }
};

// Array order is the public editorial order within each organisational level.
export const TEAM_MEMBERS: readonly TeamMember[] = [
    { id: 'osvaldo-luis', name: 'Osvaldo Luís', leadership: true, role: 'managingDirector', category: 'architectureUrbanism', image: null, bio: null, links: [] },
    { id: 'artur-simao', name: 'Artur Simão', leadership: true, role: 'technicalDirector', category: 'architectureUrbanism', image: null, bio: null, links: [] },
    { id: 'mivas-massingue', name: 'Mivas Massingue', leadership: false, role: 'juniorArchitect', category: 'architecture', image: null, bio: null, links: [] },
    { id: 'edson-camba', name: 'Edson Camba', leadership: false, role: 'constructionTechnician', category: 'construction', image: null, bio: null, links: [] },
    { id: 'leticia-muguambe', name: 'Letícia Muguambe', leadership: false, role: 'geographer', category: 'geography', image: null, bio: null, links: [] },
    { id: 'maxime-zabrodin', name: 'Maxime Zabrodin', leadership: false, role: 'seniorArchitect', category: 'architecture', image: null, bio: null, links: [] },
    { id: 'neide', name: 'Neide', leadership: false, role: 'juniorArchitectFemale', category: 'architecture', image: null, bio: null, links: [] },
    { id: 'imran-jafar', name: 'Imran Jafar', leadership: false, role: 'itMarketing', category: 'itMarketing', image: null, bio: null, links: [] },
];
