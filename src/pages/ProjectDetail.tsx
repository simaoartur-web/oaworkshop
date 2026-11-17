import { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { resolveProjectDetail } from '../data/projects';
import { getLocalizedInternalLink, getHomePrefix } from '../seo/routes';

const ProjectDetail = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const project = useMemo(
        () => (id ? resolveProjectDetail(id, t) : null),
        [id, t]
    );

    const backLink = getLocalizedInternalLink('/projects', location.pathname);
    const contactLink = `${getHomePrefix(location.pathname)}#contact`;

    if (!project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black-900 text-white">
                <p>{t('common.notFoundProject')}</p>
                <Link to={backLink} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white">{t('projectDetail.back')}</Link>
            </div>
        );
    }

    const metadata = [
        [t('projectDetail.location'), project.location],
        [t('projectDetail.date'), project.date],
        [t('projectDetail.client'), project.client],
        [t('projectDetail.category'), project.category],
        [t('projectDetail.area'), project.area],
    ].filter((entry): entry is [string, string] => Boolean(entry[1]));

    return (
        <motion.div className="relative min-h-screen bg-black-900 pb-32 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative h-[80vh] w-full overflow-hidden">
                <picture>
                    {project.imageWebp && <source srcSet={project.imageWebp} type="image/webp" />}
                    <img src={project.mainImage} alt={project.imageAlt} className="h-full w-full object-cover opacity-80" />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black-900 via-transparent to-black-900/60" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:px-24">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 className="mb-4 break-words text-3xl font-light tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl">{project.title}</h1>
                        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-gray-400 md:gap-6">
                            {project.category && <span>{project.category}</span>}
                            {project.location && <span>{project.location}</span>}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container-custom mt-24 grid grid-cols-1 gap-16 lg:grid-cols-12">
                {metadata.length > 0 && (
                    <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="border-t border-white/20 pt-8 lg:col-span-3">
                        {metadata.map(([label, value]) => (
                            <div className="mb-8" key={label}>
                                <div className="mb-1 text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
                                <div className="font-light text-gray-200">{value}</div>
                            </div>
                        ))}
                    </motion.aside>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className={metadata.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'}>
                    <p className="text-xl font-light leading-relaxed text-gray-300 md:text-3xl">
                        {project.description || t('projectDetail.pendingSheetNote')}
                    </p>
                    {project.scope && project.scope.length > 0 && (
                        <div className="mt-12 flex flex-wrap gap-2">
                            {project.scope.map((item) => <span key={item} className="border border-white/10 px-3 py-1 text-xs text-white/60">{item}</span>)}
                        </div>
                    )}
                    <div className="mt-32 flex flex-col items-start justify-between gap-8 border-t border-white/10 pt-12 sm:flex-row sm:items-center">
                        <Link to={backLink} className="flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400 transition-colors hover:text-white">
                            <span className="inline-block h-px w-12 bg-gray-400" /> {t('projectDetail.back')}
                        </Link>
                        <Link to={contactLink} className="w-full bg-white px-8 py-4 text-center text-xs font-medium uppercase tracking-widest text-black-900 transition-colors hover:bg-gray-200 sm:w-auto">
                            {t('projectDetail.requestProposal')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProjectDetail;
