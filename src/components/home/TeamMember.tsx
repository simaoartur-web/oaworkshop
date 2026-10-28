import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTeamInitials, type TeamMember as Member } from '../../data/team';
import TeamAvatar from './TeamAvatar';

interface Props {
    member: Member;
    onOpen: (id: string, trigger: HTMLButtonElement) => void;
}

const TeamMember = ({ member, onOpen }: Props) => {
    const { t } = useTranslation();
    const initials = getTeamInitials(member.name);
    const roleLines = t(`team.roles.${member.role}`).split(' · ');

    if (member.leadership) {
        return (
            <article className="team-member team-member--leadership relative min-w-0">
                <TeamAvatar
                    name={member.name}
                    image={member.image}
                    className="team-avatar--leadership"
                />
                <div className="team-member-body team-member-body--leadership min-w-0">
                    <span aria-hidden="true" className="team-member-initials team-member-initials--leadership">
                        {initials}
                    </span>
                    <h4 className="team-member-name team-member-name--leadership">
                        {member.name}
                    </h4>
                    <div className="team-member-role team-member-role--leadership">
                        {roleLines.map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                    <span aria-hidden="true" className="team-member-divider" />
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        aria-label={t('team.openProfile', { name: member.name })}
                        onClick={(event) => onOpen(member.id, event.currentTarget)}
                        className="team-profile-trigger inline-flex min-h-11 items-center gap-2.5 text-xs font-normal tracking-[0.03em] text-gray-200"
                    >
                        <span>{t('team.viewProfile')}</span>
                        <ArrowUpRight
                            size={15}
                            strokeWidth={1.6}
                            aria-hidden="true"
                            className="team-profile-arrow"
                        />
                    </button>
                </div>
            </article>
        );
    }

    return (
        <article className="team-member team-member--collaborator relative flex h-full min-w-0 flex-col items-start">
            <TeamAvatar
                name={member.name}
                image={member.image}
                className="team-avatar--collaborator"
            />
            <div className="team-member-body team-member-body--collaborator flex w-full min-w-0 flex-1 flex-col items-start">
                <span aria-hidden="true" className="team-member-initials team-member-initials--collaborator">
                    {initials}
                </span>
                <h4 className="team-member-name team-member-name--collaborator">
                    {member.name}
                </h4>
                <div className="team-member-role team-member-role--collaborator">
                    {roleLines.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={t('team.openProfile', { name: member.name })}
                    onClick={(event) => onOpen(member.id, event.currentTarget)}
                    className="team-profile-trigger mt-auto inline-flex min-h-11 items-center gap-2 pt-2 text-xs font-normal tracking-[0.03em] text-gray-200"
                >
                    <span>{t('team.viewProfile')}</span>
                    <ArrowUpRight
                        size={14}
                        strokeWidth={1.6}
                        aria-hidden="true"
                        className="team-profile-arrow"
                    />
                </button>
            </div>
        </article>
    );
};

export default TeamMember;
