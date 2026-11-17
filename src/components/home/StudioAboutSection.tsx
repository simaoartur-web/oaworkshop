import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedInternalLink } from '../../seo/routes';
import './studio-about.css';

const OFFICE_IMAGE_SRC = `${import.meta.env.BASE_URL}images/workshop-about/office-space.png`;
const OFFICE_IMAGE_WEBP = `${import.meta.env.BASE_URL}images/workshop-about/office-space.webp`;
const FOUNDERS_IMAGE_SRC = `${import.meta.env.BASE_URL}images/workshop-about/founders-portrait.png`;
const FOUNDERS_IMAGE_WEBP = `${import.meta.env.BASE_URL}images/workshop-about/founders-portrait.webp`;

const StudioAboutSection = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const reducedMotion = useReducedMotion();
    const aboutLink = getLocalizedInternalLink('/about', pathname);

    return (
        <section
            id="studio-about"
            className="studio-about-section"
            aria-label={t('studioAbout.sectionLabel')}
        >
            <div className="studio-about-shell">
                <header className="studio-about-header">
                    <h2 className="studio-about-heading">
                        <span className="studio-about-heading-plus" aria-hidden="true">
                            +
                        </span>
                        <span>{t('studioAbout.title')}</span>
                    </h2>
                </header>

                <div className="studio-about-grid">
                    <motion.figure
                        initial={{
                            opacity: reducedMotion ? 1 : 0,
                            y: reducedMotion ? 0 : 14,
                        }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: reducedMotion ? 0 : 0.45,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="studio-about-office-figure"
                    >
                        <picture>
                            <source srcSet={OFFICE_IMAGE_WEBP} type="image/webp" />
                            <img
                                src={OFFICE_IMAGE_SRC}
                                alt={t('studioAbout.officeImageAlt')}
                                width={1435}
                                height={721}
                                loading="lazy"
                                decoding="async"
                                className="studio-about-office-img"
                            />
                        </picture>
                        <div className="studio-about-office-scrim" aria-hidden="true" />
                        <figcaption className="studio-about-office-caption">
                            <Link
                                to={aboutLink}
                                aria-label={t('studioAbout.aboutAriaLabel')}
                                className="studio-about-cta"
                            >
                                <span className="studio-about-cta-plus" aria-hidden="true">
                                    +
                                </span>
                                <span className="studio-about-cta-label">
                                    {t('studioAbout.photoLabel')}
                                </span>
                                <ArrowUpRight
                                    size={16}
                                    strokeWidth={1.75}
                                    aria-hidden="true"
                                    className="studio-about-cta-arrow"
                                />
                            </Link>
                        </figcaption>
                    </motion.figure>

                    <motion.div
                        initial={{
                            opacity: reducedMotion ? 1 : 0,
                            y: reducedMotion ? 0 : 14,
                        }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: reducedMotion ? 0 : 0.45,
                            delay: reducedMotion ? 0 : 0.08,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="studio-about-aside"
                    >
                        <figure className="studio-about-founders-figure">
                            <picture>
                                <source srcSet={FOUNDERS_IMAGE_WEBP} type="image/webp" />
                                <img
                                    src={FOUNDERS_IMAGE_SRC}
                                    alt={t('studioAbout.foundersImageAlt')}
                                    width={552}
                                    height={385}
                                    loading="lazy"
                                    decoding="async"
                                    className="studio-about-founders-img"
                                />
                            </picture>
                        </figure>

                        <div className="studio-about-card">
                            <p className="studio-about-quote">
                                {t('studioAbout.quote')}
                            </p>
                            <p className="studio-about-signature">
                                {t('studioAbout.signature')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default StudioAboutSection;
