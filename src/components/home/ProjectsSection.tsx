import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    PORTFOLIO_FILTER_KEYS,
    PORTFOLIO_PROJECTS,
    type PortfolioFilterKey,
} from '../../data/projects';
import { getLocalizedInternalLink } from '../../seo/routes';
import './portfolio.css';

interface PortfolioTranslatedItem {
    id: string;
    title: string;
    location: string;
    imageAlt: string;
}

const ProjectsSection = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const reducedMotion = useReducedMotion();
    const [activeFilter, setActiveFilter] = useState<PortfolioFilterKey>('all');

    const translatedItems = t('portfolio.items', {
        returnObjects: true,
    }) as PortfolioTranslatedItem[];

    const visibleCards =
        activeFilter === 'all'
            ? PORTFOLIO_PROJECTS
            : PORTFOLIO_PROJECTS.filter((card) =>
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
                        {PORTFOLIO_FILTER_KEYS.map((key, index) => (
                            <span key={key} className="portfolio-filter-group">
                                <button
                                    type="button"
                                    className="portfolio-filter-btn"
                                    aria-pressed={activeFilter === key}
                                    onClick={() => setActiveFilter(key)}
                                >
                                    {t(`portfolio.filters.${key}`)}
                                </button>
                                {index < PORTFOLIO_FILTER_KEYS.length - 1 && (
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

                {visibleCards.length === 0 ? (
                    <p className="py-12 text-base font-light text-gray-400">
                        {t('portfolio.emptyCategory')}
                    </p>
                ) : (
                    <div className="portfolio-grid">
                        {visibleCards.map((card) => {
                            const copy =
                                translatedItems.find((item) => item.id === card.id) ??
                                translatedItems[0];
                            const projectUrl = getLocalizedInternalLink(
                                `/projects/${card.id}`,
                                location.pathname
                            );

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
                                    <Link
                                        to={projectUrl}
                                        state={{ backgroundLocation: location }}
                                        aria-label={t('portfolio.openProject', {
                                            title: copy.title,
                                        })}
                                        className="portfolio-card-link group"
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
                                                <picture>
                                                    {card.imageWebp && (
                                                        <source
                                                            srcSet={card.imageWebp}
                                                            type="image/webp"
                                                        />
                                                    )}
                                                    <img
                                                        src={card.mainImage}
                                                        alt={copy.imageAlt}
                                                        width={960}
                                                        height={600}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="portfolio-card-img"
                                                    />
                                                </picture>
                                            )}
                                            <span
                                                aria-hidden="true"
                                                className="portfolio-card-open-badge"
                                            >
                                                <ArrowUpRight size={16} strokeWidth={1.75} />
                                            </span>
                                        </div>

                                        <div className="portfolio-card-caption">
                                            <h3 className="portfolio-card-title">
                                                {copy.title}
                                            </h3>
                                            <p className="portfolio-card-location">
                                                {copy.location}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectsSection;
