import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TeamMember as Member } from '../../data/team';
import TeamAvatar from './TeamAvatar';

interface Props {
    member: Member;
    onOpen: (id: string, trigger: HTMLButtonElement) => void;
}

const TeamMember = ({ member, onOpen }: Props) => {
    const { t } = useTranslation();
    return (
        <article className={`team-member relative grid min-w-0 gap-5 ${member.leadership ? 'grid-cols-[5rem_1fr] md:grid-cols-1 md:gap-7' : 'grid-cols-[4rem_1fr]'}`}>
            <TeamAvatar name={member.name} image={member.image}
                className={member.leadership ? 'aspect-[4/5] w-20 text-3xl md:aspect-[5/3] md:w-full md:text-7xl' : 'aspect-[4/5] w-16 text-2xl'} />
            <div className="flex min-w-0 flex-col items-start">
                <p className="mb-2 text-xs leading-relaxed text-gray-400">{t(`team.categories.${member.category}`)}</p>
                <h4 className={`break-words font-light tracking-tight text-white ${member.leadership ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{member.name}</h4>
                <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-gray-400">{t(`team.roles.${member.role}`)}</p>
                <button type="button" aria-haspopup="dialog" aria-label={t('team.openProfile', { name: member.name })}
                    onClick={(event) => onOpen(member.id, event.currentTarget)}
                    className="team-profile-trigger mt-4 inline-flex min-h-11 items-center gap-3 text-xs text-gray-300">
                    <span>{t('team.viewProfile')}</span>
                    <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" className="text-terracota" />
                </button>
            </div>
        </article>
    );
};

export default TeamMember;
