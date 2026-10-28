import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEAM_MEMBERS } from '../../data/team';
import TeamMember from './TeamMember';
import TeamProfilePanel from './TeamProfilePanel';
import './team.css';

const TeamSection = () => {
    const { t } = useTranslation();
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const returnFocusRef = useRef<HTMLButtonElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const selectedMember = TEAM_MEMBERS.find((member) => member.id === selectedMemberId);
    const dismiss = useCallback(() => setSelectedMemberId(null), []);
    const openProfile = (id: string, trigger: HTMLButtonElement) => {
        returnFocusRef.current = trigger;
        setSelectedMemberId(id);
    };

    return (
        <section id="team" aria-labelledby="team-title" className="scroll-mt-24 bg-[#0b0b0b] py-16 md:py-28 text-white">
            <div className="container-custom">
                <header className="mb-12 md:mb-14 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-3 md:mb-4 text-xs uppercase tracking-[0.2em] text-gray-400">{t('team.eyebrow')}</p>
                        <h2 ref={headingRef} tabIndex={-1} id="team-title" className="text-3xl sm:text-4xl font-light tracking-tight focus-visible:outline-2 focus-visible:outline-terracota md:text-6xl">{t('team.title')}</h2>
                    </div>
                    <p className="max-w-sm text-sm sm:text-base font-light leading-relaxed text-gray-400">{t('team.intro')}</p>
                </header>
                <h3 id="team-leadership" className="mb-6 md:mb-8 text-xs uppercase tracking-[0.18em] text-gray-400">{t('team.leadership')}</h3>
                <ul aria-labelledby="team-leadership" className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 md:gap-12">
                    {TEAM_MEMBERS.filter((member) => member.leadership).map((member) => (
                        <li key={member.id} className="min-w-0"><TeamMember member={member} onOpen={openProfile} /></li>
                    ))}
                </ul>
                <div className="mb-8 mt-10 flex items-center gap-5 md:mb-10 md:mt-14 md:gap-6">
                    <h3 id="team-practice" className="shrink-0 text-xs uppercase tracking-[0.18em] text-gray-400">{t('team.practice')}</h3>
                    <span aria-hidden="true" className="h-px flex-1 bg-white/12" />
                </div>
                <ul aria-labelledby="team-practice" className="grid grid-cols-1 gap-x-8 gap-y-8 sm:gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                    {TEAM_MEMBERS.filter((member) => !member.leadership).map((member) => (
                        <li key={member.id} className="min-w-0"><TeamMember member={member} onOpen={openProfile} /></li>
                    ))}
                </ul>
            </div>
            {selectedMember && <TeamProfilePanel member={selectedMember} onDismiss={dismiss} returnFocusRef={returnFocusRef} fallbackFocusRef={headingRef} />}
        </section>
    );
};

export default TeamSection;
