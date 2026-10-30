import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import WorkshopTabs from './WorkshopTabs';
import './workshop.css';

export type WorkshopAreaId = 'architecture' | 'urbanism' | 'research';

interface WorkshopArea {
    id: WorkshopAreaId;
    order: number;
    targetId: WorkshopAreaId;
    imageSrc: string;
    imageWebp: string;
    objectPosition: string;
}

interface WorkshopCopy {
    id: WorkshopAreaId;
    label: string;
    title: string;
    tag?: string;
    desc: string;
    cta: string;
}

const AREAS: readonly WorkshopArea[] = [
    {
        id: 'architecture',
        order: 1,
        targetId: 'architecture',
        imageSrc: `${import.meta.env.BASE_URL}images/workshop-architecture.jpg`,
        imageWebp: `${import.meta.env.BASE_URL}images/workshop-architecture.webp`,
        objectPosition: '50% 48%',
    },
    {
        id: 'urbanism',
        order: 2,
        targetId: 'urbanism',
        imageSrc: `${import.meta.env.BASE_URL}images/workshop-urbanism.jpg`,
        imageWebp: `${import.meta.env.BASE_URL}images/workshop-urbanism.webp`,
        objectPosition: '50% 52%',
    },
    {
        id: 'research',
        order: 3,
        targetId: 'research',
        imageSrc: `${import.meta.env.BASE_URL}images/workshop-research.jpg`,
        imageWebp: `${import.meta.env.BASE_URL}images/workshop-research.webp`,
        objectPosition: '50% 45%',
    },
];

const SLIDE_DURATION_MS = 8000;
const withoutPlus = (text: string) => text.replace(/^\+\s*/, '');

function focusSection(sectionId: string, reducedMotion: boolean) {
    const destination = document.getElementById(sectionId);
    if (!destination) return;
    const heading = destination.querySelector<HTMLElement>('h2') ?? destination;
    const previousTabIndex = heading.getAttribute('tabindex');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.addEventListener(
        'blur',
        () => {
            if (previousTabIndex === null) heading.removeAttribute('tabindex');
            else heading.setAttribute('tabindex', previousTabIndex);
        },
        { once: true }
    );
    const header = document.querySelector('header');
    const offset = (header?.getBoundingClientRect().height ?? 0) + 24;
    window.scrollTo({
        top: destination.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reducedMotion ? 'instant' : 'smooth',
    });
}

export default function WorkshopSection() {
    const { t } = useTranslation();
    const { hash } = useLocation();
    const reducedMotion = useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);
    const inViewport = useInView(sectionRef, { amount: 0.15 });

    const [pageVisible, setPageVisible] = useState(() => {
        if (typeof document === 'undefined') return true;
        return !document.hidden;
    });
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [activeId, setActiveId] = useState<WorkshopAreaId>('architecture');
    const [idleTick, setIdleTick] = useState(0);

    const idleTimerRef = useRef<number | null>(null);

    const copies = t('workshop.slides', { returnObjects: true }) as WorkshopCopy[];
    const defaultTag = t('workshop.featuredTag');
    const activeIndex = AREAS.findIndex((item) => item.id === activeId);
    const copy = copies.find((item) => item.id === activeId) ?? copies[0];
    const nextId = AREAS[(activeIndex + 1) % AREAS.length].id;
    const prevId = AREAS[(activeIndex - 1 + AREAS.length) % AREAS.length].id;

    // Trigger temporary pause on user action, auto-resuming after SLIDE_DURATION_MS of idle
    const registerUserInteraction = useCallback(() => {
        if (idleTimerRef.current !== null) {
            window.clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = window.setTimeout(() => {
            setIdleTick((tick) => tick + 1);
        }, SLIDE_DURATION_MS);
    }, []);

    // Clean up idle timer on unmount
    useEffect(() => {
        return () => {
            if (idleTimerRef.current !== null) {
                window.clearTimeout(idleTimerRef.current);
            }
        };
    }, []);

    // Page Visibility listener
    useEffect(() => {
        const handleVisibility = () => setPageVisible(!document.hidden);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    // Autoplay condition: respects reducedMotion, pageVisible, viewport, user play/pause, hover, and focus
    const canAutoRotate =
        !reducedMotion && pageVisible && inViewport && isPlaying && !isHovered && !isFocused;

    useEffect(() => {
        if (!canAutoRotate) return;
        const timer = window.setTimeout(() => {
            setActiveId(nextId);
        }, SLIDE_DURATION_MS);
        return () => window.clearTimeout(timer);
    }, [canAutoRotate, nextId, idleTick]);

    // Hash navigation handling
    useEffect(() => {
        const target = AREAS.find((item) => `#${item.targetId}` === hash);
        if (!target) return;
        const frame = requestAnimationFrame(() => {
            setActiveId(target.id);
            focusSection('workshop', Boolean(reducedMotion));
        });
        return () => cancelAnimationFrame(frame);
    }, [hash, reducedMotion]);

    const selectArea = (id: WorkshopAreaId) => {
        registerUserInteraction();
        if (id === activeId) return;
        setActiveId(id);
    };

    const selectPrevious = () => {
        registerUserInteraction();
        setActiveId(prevId);
    };

    const selectNext = () => {
        registerUserInteraction();
        setActiveId(nextId);
    };

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    return (
        <section
            id="workshop"
            ref={sectionRef}
            className="workshop-section"
            aria-label={t('workshop.sectionLabel')}
            onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') {
                    setIsHovered(true);
                }
            }}
            onPointerLeave={() => {
                setIsHovered(false);
                registerUserInteraction();
            }}
            onFocusCapture={() => setIsFocused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsFocused(false);
                    registerUserInteraction();
                }
            }}
        >
            <div className="workshop-stage">
                <div className="workshop-image-stage">
                    {AREAS.map((item) => {
                        const visible = item.id === activeId;
                        return (
                            <picture
                                key={item.id}
                                className="workshop-photo-picture"
                                data-area={item.id}
                                data-visible={visible}
                            >
                                <source srcSet={item.imageWebp} type="image/webp" />
                                <img
                                    src={item.imageSrc}
                                    width={1920}
                                    height={1080}
                                    decoding="async"
                                    alt={visible ? t(`workshop.imageAlt.${item.id}`) : ''}
                                    aria-hidden={!visible}
                                    className="workshop-photo"
                                    style={{ objectPosition: item.objectPosition }}
                                />
                            </picture>
                        );
                    })}
                    <div className="workshop-stage-gradient" aria-hidden="true" />
                </div>

                <div className="workshop-stage-inner">
                    <div
                        id={`workshop-panel-${activeId}`}
                        role="tabpanel"
                        aria-labelledby={`workshop-tab-${activeId}`}
                        className="workshop-panel"
                    >
                        <motion.div
                            key={activeId}
                            className="workshop-copy"
                            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: reducedMotion ? 0 : 0.28,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <div className="workshop-featured-tag">
                                {copy.tag ?? defaultTag}
                            </div>
                            <h2 className="workshop-heading">
                                <span className="workshop-heading-plus" aria-hidden="true">
                                    +
                                </span>
                                <span className="workshop-heading-text">
                                    {withoutPlus(copy.title)}
                                </span>
                            </h2>
                            <p className="workshop-description">{copy.desc}</p>
                        </motion.div>
                    </div>

                    <div className="workshop-stage-controls">
                        <button
                            type="button"
                            className="workshop-nav-btn workshop-nav-btn-prev"
                            aria-label={t('workshop.previousArea')}
                            onClick={selectPrevious}
                        >
                            <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="workshop-nav-btn workshop-nav-btn-playback"
                            aria-label={
                                isPlaying
                                    ? t('workshop.pauseSlideshow')
                                    : t('workshop.playSlideshow')
                            }
                            aria-pressed={!isPlaying}
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? (
                                <Pause size={16} strokeWidth={2} aria-hidden="true" />
                            ) : (
                                <Play size={16} strokeWidth={2} aria-hidden="true" className="translate-x-[1px]" />
                            )}
                        </button>
                        <button
                            type="button"
                            className="workshop-nav-btn workshop-nav-btn-next"
                            aria-label={t('workshop.nextArea')}
                            onClick={selectNext}
                        >
                            <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {AREAS.filter((item) => item.id !== activeId).map((item) => (
                    <div
                        key={item.id}
                        id={`workshop-panel-${item.id}`}
                        role="tabpanel"
                        aria-labelledby={`workshop-tab-${item.id}`}
                        hidden
                    />
                ))}
            </div>

            <div className="workshop-nav-bar">
                <WorkshopTabs
                    items={AREAS.map((item) => {
                        const entry = copies.find((c) => c.id === item.id) ?? copies[0];
                        return {
                            id: item.id,
                            label: withoutPlus(entry.label),
                            tag: entry.tag ?? defaultTag,
                            desc: entry.desc,
                        };
                    })}
                    activeId={activeId}
                    label={t('workshop.navigationLabel')}
                    onSelect={selectArea}
                />
            </div>
        </section>
    );
}
