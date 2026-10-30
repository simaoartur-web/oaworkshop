import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEAM_MEMBERS } from '../../data/team';
import TeamMember from './TeamMember';
import TeamProfilePanel from './TeamProfilePanel';
import './team.css';

const LEADERSHIP_MEMBERS = TEAM_MEMBERS.filter((member) => member.leadership);
const COLLABORATOR_MEMBERS = TEAM_MEMBERS.filter((member) => !member.leadership);

const TeamSection = () => {
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isTeamExpanded, setIsTeamExpanded] = useState(false);
    const returnFocusRef = useRef<HTMLButtonElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const selectedMember = TEAM_MEMBERS.find((member) => member.id === selectedMemberId);
    const visionLines = t('team.visionLines', { returnObjects: true }) as string[];
    const archBackdropSrc = `${import.meta.env.BASE_URL}images/architecture.webp`;

    const dismiss = useCallback(() => setSelectedMemberId(null), []);
    const openProfile = (id: string, trigger: HTMLButtonElement) => {
        returnFocusRef.current = trigger;
        setSelectedMemberId(id);
    };

    return (
        <section
            id="team"
            aria-labelledby="team-title"
            className="team-section scroll-mt-24 text-white"
        >
            {/* Discreet architectural backdrop & warm O+A lighting */}
            <div aria-hidden="true" className="team-backdrop">
                <div
                    className="team-backdrop-photo team-backdrop-photo--top"
                    style={{ backgroundImage: `url("${archBackdropSrc}")` }}
                />
                <div
                    className="team-backdrop-photo team-backdrop-photo--bottom"
                    style={{ backgroundImage: `url("${archBackdropSrc}")` }}
                />
                <div className="team-backdrop-glow team-backdrop-glow--top" />
                <div className="team-backdrop-glow team-backdrop-glow--center" />
                <div className="team-backdrop-glow team-backdrop-glow--bottom" />
                <div className="team-arch-line team-arch-line--top" />
                <div className="team-arch-line team-arch-line--bottom" />
            </div>

            <div className="container-custom relative z-10">
                {/* Editorial Header: Title + Vision Statement */}
                <header className="team-header">
                    <div className="team-header-main">
                        <p className="team-eyebrow">{t('team.eyebrow')}</p>
                        <h2
                            ref={headingRef}
                            tabIndex={-1}
                            id="team-title"
                            className="team-title focus-visible:outline-2 focus-visible:outline-terracota"
                        >
                            {t('team.title')}
                        </h2>
                        <p className="team-intro">{t('team.intro')}</p>
                        <span aria-hidden="true" className="team-intro-accent" />
                    </div>

                    <div className="team-vision" aria-label={visionLines.join(' ')}>
                        <span aria-hidden="true" className="team-vision-divider" />
                        <div className="team-vision-content">
                            <span aria-hidden="true" className="team-vision-dash" />
                            <p className="team-vision-text">
                                {Array.isArray(visionLines) &&
                                    visionLines.map((line, index) => (
                                        <span key={index} className="block">
                                            {line}
                                        </span>
                                    ))}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Joint Leadership — Always Visible */}
                <div className="team-leadership-block">
                    <div className="team-subheading-row">
                        <h3 id="team-leadership" className="team-subheading">
                            {t('team.leadership')}
                        </h3>
                        <span aria-hidden="true" className="team-subheading-line" />
                    </div>

                    <ul
                        aria-labelledby="team-leadership"
                        className="team-leadership-grid"
                    >
                        {LEADERSHIP_MEMBERS.map((member) => (
                            <li key={member.id} className="min-w-0">
                                <TeamMember member={member} onOpen={openProfile} />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Centered Interactive Toggle Button: Discover our team */}
                <div className="team-discover-hub">
                    <span aria-hidden="true" className="team-discover-wing team-discover-wing--left" />
                    <div className="team-discover-center">
                        <span aria-hidden="true" className="team-discover-ring team-discover-ring--outer" />
                        <span aria-hidden="true" className="team-discover-ring team-discover-ring--inner" />
                        <button
                            type="button"
                            aria-expanded={isTeamExpanded}
                            aria-controls="team-collaborators-panel"
                            onClick={() => setIsTeamExpanded((prev) => !prev)}
                            className="team-discover-btn"
                        >
                            <span>
                                {isTeamExpanded ? t('team.closeTeam') : t('team.discoverTeam')}
                            </span>
                            <ArrowDown
                                size={16}
                                strokeWidth={1.6}
                                aria-hidden="true"
                                className={`team-discover-icon ${isTeamExpanded ? 'is-expanded' : ''}`}
                            />
                        </button>
                    </div>
                    <span aria-hidden="true" className="team-discover-wing team-discover-wing--right" />
                </div>

                {/* Expandable Multidisciplinary Team (Collaborators Only) */}
                <AnimatePresence initial={false}>
                    {isTeamExpanded && (
                        <motion.div
                            id="team-collaborators-panel"
                            key="team-collaborators-panel"
                            initial={
                                reducedMotion
                                    ? { opacity: 1 }
                                    : { opacity: 0, height: 0, y: -8 }
                            }
                            animate={
                                reducedMotion
                                    ? { opacity: 1 }
                                    : { opacity: 1, height: 'auto', y: 0 }
                            }
                            exit={
                                reducedMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, height: 0, y: -8 }
                            }
                            transition={{
                                duration: reducedMotion ? 0 : 0.42,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="team-collaborators-collapse overflow-hidden"
                        >
                            <div className="team-collaborators-stem-wrap" aria-hidden="true">
                                <span className="team-collaborators-stem" />
                            </div>

                            <div className="team-collaborators-box">
                                <div className="team-box-header">
                                    <h3
                                        id="team-practice"
                                        className="team-box-label team-box-label--accent"
                                    >
                                        {t('team.collaboratorsLeft')}
                                    </h3>
                                    <span aria-hidden="true" className="team-subheading-line" />
                                    <p className="team-box-label team-box-label--muted">
                                        {t('team.collaboratorsRight')}
                                    </p>
                                </div>

                                <ul
                                    aria-labelledby="team-practice"
                                    className="team-collaborators-grid"
                                >
                                    {COLLABORATOR_MEMBERS.map((member, index) => (
                                        <motion.li
                                            key={member.id}
                                            initial={
                                                reducedMotion
                                                    ? { opacity: 1, y: 0 }
                                                    : { opacity: 0, y: 14 }
                                            }
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: reducedMotion ? 0 : 0.34,
                                                delay: reducedMotion ? 0 : index * 0.045,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            className="min-w-0"
                                        >
                                            <TeamMember member={member} onOpen={openProfile} />
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {selectedMember && (
                <TeamProfilePanel
                    member={selectedMember}
                    onDismiss={dismiss}
                    returnFocusRef={returnFocusRef}
                    fallbackFocusRef={headingRef}
                />
            )}
        </section>
    );
};

export default TeamSection;
