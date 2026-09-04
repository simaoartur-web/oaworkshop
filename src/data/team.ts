import type en from '../locales/en';
import type pt from '../locales/pt';

type TeamRole = keyof typeof en.team.roles & keyof typeof pt.team.roles;

export interface TeamMember {
    readonly id: string;
    readonly name: string;
    readonly level: 'leadership' | 'practice';
    readonly role: TeamRole;
}

// Array order is the public editorial order within each organisational level.
export const TEAM_MEMBERS = [
    { id: 'osvaldo-luis', name: 'Osvaldo Luís', level: 'leadership', role: 'managingDirector' },
    { id: 'artur-simao', name: 'Artur Simão', level: 'leadership', role: 'technicalDirector' },
    { id: 'mivas-massingue', name: 'Mivas Massingue', level: 'practice', role: 'juniorArchitect' },
    { id: 'edson-camba', name: 'Edson Camba', level: 'practice', role: 'constructionTechnician' },
    { id: 'leticia-muguambe', name: 'Letícia Muguambe', level: 'practice', role: 'geographer' },
    { id: 'maxime-zabrodin', name: 'Maxime Zabrodin', level: 'practice', role: 'seniorArchitect' },
    { id: 'neide', name: 'Neide', level: 'practice', role: 'juniorArchitectFemale' },
    { id: 'imran-jafar', name: 'Imran Jafar', level: 'practice', role: 'itMarketing' },
] as const satisfies readonly TeamMember[];
