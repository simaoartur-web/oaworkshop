import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHomePrefix, getLocalizedInternalLink } from '../seo/routes';

const OFFICE_IMAGE_SRC = `${import.meta.env.BASE_URL}images/workshop-about/office-space.png`;
const OFFICE_IMAGE_WEBP = `${import.meta.env.BASE_URL}images/workshop-about/office-space.webp`;

interface AboutPillar {
    id: string;
    title: string;
    body: string;
}

const About = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const reducedMotion = useReducedMotion();
    const homePrefix = getHomePrefix(pathname);
    const projectsLink = getLocalizedInternalLink('/projects', pathname);
    const pillars = t('aboutPage.pillars', { returnObjects: true }) as AboutPillar[];

    return (
        <motion.div
            className="min-h-screen bg-[#070707] text-white pt-28 sm:pt-32 md:pt-40 pb-24"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.4 }}
        >
            <div className="container-custom">
                {/* Return navigation */}
                <div className="mb-10 md:mb-14">
                    <Link
                        to={`${homePrefix}#studio-about`}
                        className="inline-flex min-h-[44px] items-center gap-3 text-xs uppercase tracking-[0.22em] text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#ED7D31] focus-visible:outline-offset-4"
                    >
                        <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" className="text-[#ED7D31]" />
                        <span>{t('aboutPage.backHome')}</span>
                    </Link>
                </div>

                {/* Editorial Header */}
                <header className="max-w-5xl border-b border-white/12 pb-10 md:pb-14">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#ED7D31] mb-4">
                        {t('aboutPage.eyebrow')}
                    </p>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.08] text-white">
                        {t('aboutPage.title')}
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-gray-300 max-w-4xl">
                        {t('aboutPage.lead')}
                    </p>
                </header>

                {/* Studio Workspace Visual + Founding Story */}
                <section
                    aria-labelledby="about-history-heading"
                    className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
                >
                    <div className="lg:col-span-7 overflow-hidden bg-[#111111] border border-white/10">
                        <picture>
                            <source srcSet={OFFICE_IMAGE_WEBP} type="image/webp" />
                            <img
                                src={OFFICE_IMAGE_SRC}
                                alt={t('studioAbout.officeImageAlt')}
                                width={1435}
                                height={721}
                                className="w-full h-auto aspect-[1435/721] object-cover object-left-bottom"
                            />
                        </picture>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <h2
                            id="about-history-heading"
                            className="text-xs uppercase tracking-[0.24em] text-[#ED7D31] font-medium"
                        >
                            {t('aboutPage.historyTitle')}
                        </h2>
                        <p className="text-base sm:text-lg font-light leading-relaxed text-gray-200">
                            {t('aboutPage.historyParagraph1')}
                        </p>
                        <p className="text-base sm:text-lg font-light leading-relaxed text-gray-300">
                            {t('aboutPage.historyParagraph2')}
                        </p>
                        <dl className="pt-4 border-t border-white/12 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                            <div>
                                <dt className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                    {t('aboutPage.foundedLabel')}
                                </dt>
                                <dd className="mt-1 font-light text-white">
                                    {t('aboutPage.foundedValue')}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                    {t('aboutPage.foundersLabel')}
                                </dt>
                                <dd className="mt-1 font-light text-white">
                                    Osvaldo Luís &amp; Artur Simão
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                    {t('aboutPage.mainOfficeLabel')}
                                </dt>
                                <dd className="mt-1 font-light text-gray-200">
                                    Maputo, Mozambique
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                    {t('aboutPage.repOfficeLabel')}
                                </dt>
                                <dd className="mt-1 font-light text-gray-200">
                                    Milano, Italy
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* Vision, Mission & Objectives */}
                <section
                    aria-labelledby="about-pillars-heading"
                    className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-white/12"
                >
                    <div className="mb-10 md:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <h2
                            id="about-pillars-heading"
                            className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white"
                        >
                            {t('aboutPage.pillarsHeading')}
                        </h2>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            {t('aboutPage.pillarsEyebrow')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        {Array.isArray(pillars) &&
                            pillars.map((pillar, index) => (
                                <article
                                    key={pillar.id}
                                    className="border-t border-white/20 pt-6 flex flex-col justify-between"
                                >
                                    <div>
                                        <span className="text-xs font-semibold tracking-[0.22em] text-[#ED7D31]">
                                            0{index + 1}.
                                        </span>
                                        <h3 className="mt-3 text-xl sm:text-2xl font-normal text-white">
                                            {pillar.title}
                                        </h3>
                                        <p className="mt-4 text-base font-light leading-relaxed text-gray-300">
                                            {pillar.body}
                                        </p>
                                    </div>
                                </article>
                            ))}
                    </div>
                </section>

                {/* Next actions */}
                <div className="mt-16 md:mt-24 pt-10 border-t border-white/12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <Link
                        to={`${homePrefix}#team`}
                        className="inline-flex min-h-[48px] items-center justify-center gap-3 border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.22em] text-white hover:border-[#ED7D31] transition-colors focus-visible:outline-2 focus-visible:outline-[#ED7D31] focus-visible:outline-offset-4"
                    >
                        <span>{t('aboutPage.meetTeam')}</span>
                        <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" className="text-[#ED7D31]" />
                    </Link>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to={projectsLink}
                            className="inline-flex min-h-[48px] items-center justify-center gap-3 border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.22em] text-white hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-[#ED7D31] focus-visible:outline-offset-4"
                        >
                            <span>{t('aboutPage.viewProjects')}</span>
                        </Link>
                        <Link
                            to={`${homePrefix}#contact`}
                            className="inline-flex min-h-[48px] items-center justify-center gap-3 bg-white px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-black-900 hover:bg-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#ED7D31] focus-visible:outline-offset-4"
                        >
                            <span>{t('aboutPage.contactCta')}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default About;
