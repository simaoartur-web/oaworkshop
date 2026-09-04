import { useTranslation } from 'react-i18next';
import { TEAM_MEMBERS } from '../../data/team';

const LEVELS = ['leadership', 'practice'] as const;

const TeamSection = () => {
    const { t } = useTranslation();

    return (
        <section id="team" aria-labelledby="team-title" className="scroll-mt-32 border-t border-white/10 bg-black-900 py-24 text-white md:py-32">
            <div className="container-custom">
                <header className="mb-16 flex flex-col gap-6 border-b border-white/15 pb-10 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-400">{t('team.eyebrow')}</p>
                        <h2 id="team-title" className="text-4xl font-light tracking-tight md:text-6xl">{t('team.title')}</h2>
                    </div>
                    <p className="max-w-sm text-base font-light leading-relaxed text-gray-400">{t('team.intro')}</p>
                </header>

                {LEVELS.map((level, levelIndex) => (
                    <div key={level}>
                        {levelIndex > 0 && (
                            <div aria-hidden="true" className="mx-auto hidden h-16 w-px bg-white/20 md:block" />
                        )}
                        <div className={levelIndex > 0 ? 'mt-12 md:mt-0' : ''}>
                            <h3 id={`team-${level}`} className="mb-8 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-gray-400">
                                <span aria-hidden="true" className="h-px w-8 bg-terracota" />
                                {t(`team.${level}`)}
                            </h3>
                            <ul aria-labelledby={`team-${level}`} className={`grid grid-cols-1 border-t border-white/20 ${level === 'leadership' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                                {TEAM_MEMBERS.filter((member) => member.level === level).map((member) => (
                                    <li key={member.id} className="relative min-w-0 border-b border-white/15 py-8 md:px-6 md:py-10">
                                        <span aria-hidden="true" className="absolute left-6 top-0 hidden h-5 w-px bg-terracota md:block" />
                                        <h4 className={`mb-3 break-words font-light tracking-tight ${level === 'leadership' ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{member.name}</h4>
                                        <p className="max-w-xs text-sm font-light leading-relaxed text-gray-400">{t(`team.roles.${member.role}`)}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TeamSection;
