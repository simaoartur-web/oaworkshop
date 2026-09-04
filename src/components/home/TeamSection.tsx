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
        <section id="team" aria-labelledby="team-title" className="scroll-mt-32 border-t border-white/10 bg-black-900 py-24 text-white md:py-32">
            <div className="container-custom">
                <header className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-400">{t('team.eyebrow')}</p>
                        <h2 ref={headingRef} tabIndex={-1} id="team-title" className="text-4xl font-light tracking-tight focus-visible:outline-2 focus-visible:outline-terracota md:text-6xl">{t('team.title')}</h2>
                    </div>
                    <p className="max-w-sm text-base font-light leading-relaxed text-gray-400">{t('team.intro')}</p>
                </header>
                <h3 id="team-leadership" className="mb-8 text-xs uppercase tracking-[0.18em] text-gray-400">{t('team.leadership')}</h3>
                <ul aria-labelledby="team-leadership" className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
                    {TEAM_MEMBERS.filter((member) => member.leadership).map((member) => (
                        <li key={member.id} className="min-w-0"><TeamMember member={member} onOpen={openProfile} /></li>
                    ))}
                </ul>
                <div aria-hidden="true" className="mx-auto my-14 hidden h-14 w-px bg-white/20 md:block" />
                <h3 id="team-practice" className="mb-10 mt-16 text-xs uppercase tracking-[0.18em] text-gray-400 md:mt-0">{t('team.practice')}</h3>
                <ul aria-labelledby="team-practice" className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
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
