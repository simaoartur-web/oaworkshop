import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './portfolio.css';

export type PortfolioFilterKey =
    | 'all'
    | 'architecture'
    | 'urbanPlanning'
    | 'competitions'
    | 'interiorDesign'
    | 'landscaping'
    | 'furniture'
    | 'heritage';

interface PortfolioCardMeta {
    id: string;
    imageSrc?: string;
    isPlaceholder?: boolean;
    categories: readonly PortfolioFilterKey[];
}

interface PortfolioTranslatedItem {
    id: string;
    title: string;
    location: string;
    imageAlt: string;
}

const FILTER_KEYS: readonly PortfolioFilterKey[] = [
    'all',
    'architecture',
    'urbanPlanning',
    'competitions',
    'interiorDesign',
    'landscaping',
    'furniture',
    'heritage',
];

const PORTFOLIO_CARDS: readonly PortfolioCardMeta[] = [
    {
        id: 'professor-house',
        imageSrc: `${import.meta.env.BASE_URL}images/portfolio/professor-house.jpg`,
        categories: ['architecture'],
    },
    {
        id: 'metita-house',
        imageSrc: `${import.meta.env.BASE_URL}images/portfolio/metita-house.jpg`,
        categories: ['architecture', 'landscaping'],
    },
    {
        id: 'nelson-house',
        imageSrc: `${import.meta.env.BASE_URL}images/portfolio/nelson-house.jpg`,
        categories: ['architecture', 'interiorDesign'],
    },
    {
        id: 'wagner-house-1',
        imageSrc: `${import.meta.env.BASE_URL}images/portfolio/wagner-house.jpg`,
        categories: ['architecture', 'landscaping', 'interiorDesign'],
    },
    {
        id: 'wagner-house-2',
        imageSrc: `${import.meta.env.BASE_URL}images/portfolio/wagner-house-2.jpg`,
        categories: ['architecture', 'landscaping', 'interiorDesign'],
    },
    {
        id: 'wagner-house-3',
        isPlaceholder: true,
        categories: [
            'architecture',
            'urbanPlanning',
            'competitions',
            'interiorDesign',
            'landscaping',
            'furniture',
            'heritage',
        ],
    },
];

const ProjectsSection = () => {
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();
    const [activeFilter, setActiveFilter] = useState<PortfolioFilterKey>('all');

    const translatedItems = t('portfolio.items', {
        returnObjects: true,
    }) as PortfolioTranslatedItem[];

    const visibleCards =
        activeFilter === 'all'
            ? PORTFOLIO_CARDS
            : PORTFOLIO_CARDS.filter((card) =>
                  card.categories.includes(activeFilter)
              );

    return (
        <section
            id="portfolio"
            className="portfolio-section"
            aria-label={t('portfolio.sectionLabel')}
        >
            <div className="portfolio-shell">
                <header className="portfolio-header">
                    <h2 className="portfolio-heading">
                        <span className="portfolio-heading-plus" aria-hidden="true">
                            +
                        </span>
                        <span>{t('portfolio.title')}</span>
                    </h2>

                    <div
                        className="portfolio-filters"
                        role="toolbar"
                        aria-label={t('portfolio.filterAriaLabel')}
                    >
                        {FILTER_KEYS.map((key, index) => (
                            <span key={key} className="portfolio-filter-group">
                                <button
                                    type="button"
                                    className="portfolio-filter-btn"
                                    aria-pressed={activeFilter === key}
                                    onClick={() => setActiveFilter(key)}
                                >
                                    {t(`portfolio.filters.${key}`)}
                                </button>
                                {index < FILTER_KEYS.length - 1 && (
                                    <span
                                        className="portfolio-filter-sep"
                                        aria-hidden="true"
                                    >
                                        /
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </header>

                <div className="portfolio-grid">
                    {visibleCards.map((card) => {
                        const copy =
                            translatedItems.find((item) => item.id === card.id) ??
                            translatedItems[0];

                        return (
                            <motion.article
                                key={card.id}
                                layout={!reducedMotion}
                                initial={{
                                    opacity: reducedMotion ? 1 : 0,
                                    y: reducedMotion ? 0 : 12,
                                }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: reducedMotion ? 0 : 0.32,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="portfolio-card"
                            >
                                <div className="portfolio-card-media">
                                    {card.isPlaceholder ? (
                                        <div
                                            className="portfolio-card-placeholder"
                                            role="img"
                                            aria-label={`${copy.title} — ${t('portfolio.placeholderLabel')}`}
                                        >
                                            <div
                                                className="portfolio-placeholder-badge"
                                                aria-hidden="true"
                                            >
                                                <span className="portfolio-placeholder-mark">
                                                    ?
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={card.imageSrc}
                                            alt={copy.imageAlt}
                                            width={960}
                                            height={600}
                                            loading="lazy"
                                            decoding="async"
                                            className="portfolio-card-img"
                                        />
                                    )}
                                </div>

                                <div className="portfolio-card-caption">
                                    <h3 className="portfolio-card-title">
                                        {copy.title}
                                    </h3>
                                    <p className="portfolio-card-location">
                                        {copy.location}
                                    </p>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProjectsSection;
