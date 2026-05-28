import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SectionOverlayStatus from '../components/common/SectionOverlayStatus';

interface Project {
    id: number;
    title: string;
    category: string;
    location: string;
    client: string | null;
    completion_year: number | null;
    description: string | null;
    thumbnail_url: string | null;
}

const ProjectDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMockContent, setIsMockContent] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        fetch(`http://localhost:8000/api/projects/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then(data => {
                setProject(data);
                setIsMockContent(false);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setProject({
                    id: Number(id),
                    title: t('projectDetail.fallback.title'),
                    category: t('projectDetail.fallback.category'),
                    location: t('projectDetail.fallback.location'),
                    client: t('projectDetail.fallback.client'),
                    completion_year: 2024,
                    description: t('projectDetail.fallback.description'),
                    thumbnail_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000"
                });
                setIsMockContent(true);
                setLoading(false);
            });
    }, [id, t]);

    if (loading) return <div className="min-h-screen bg-black-900 flex items-center justify-center text-white text-xs tracking-widest">{t('common.loading')}</div>;
    if (!project) return <div className="min-h-screen flex items-center justify-center">{t('common.notFoundProject')}</div>;

    return (
        <motion.div
            className="bg-black-900 text-white min-h-screen pb-32 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div>
                <div className="relative h-[80vh] w-full overflow-hidden">
                    <img
                        src={project.thumbnail_url || ''}
                        alt={project.title}
                        className={`w-full h-full object-cover opacity-80 ${isMockContent ? 'saturate-75' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black-900 via-transparent to-black-900/60" />

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:px-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-4 break-words">{project.title}</h1>
                            <div className="text-gray-400 tracking-widest uppercase text-xs flex flex-wrap gap-4 md:gap-6">
                                <span>{project.category}</span>
                                <span>{project.location}</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="container-custom mt-24">
                    <div className="relative overflow-hidden">
                        {isMockContent && (
                            <SectionOverlayStatus
                                title={t('common.underConstruction')}
                                subtitle={t('common.underConstructionSubtitle')}
                                variant="under-construction"
                                blurIntensity="strong"
                            />
                        )}
                    <div className={`relative z-0 grid grid-cols-1 lg:grid-cols-12 gap-16 ${
                        isMockContent ? 'pointer-events-none blur-[5px] saturate-50 opacity-45 select-none' : ''
                    }`}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="lg:col-span-3 border-t border-white/20 pt-8"
                        >
                            <div className="mb-8">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('projectDetail.location')}</div>
                                <div className="font-light text-gray-200">{project.location}</div>
                            </div>
                            <div className="mb-8">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('projectDetail.year')}</div>
                                <div className="font-light text-gray-200">{project.completion_year || t('projectDetail.inProgress')}</div>
                            </div>
                            <div className="mb-8">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('projectDetail.category')}</div>
                                <div className="font-light text-gray-200">{project.category}</div>
                            </div>
                            {project.client && (
                                <div className="mb-8">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('projectDetail.client')}</div>
                                    <div className="font-light text-gray-200">{project.client}</div>
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="lg:col-span-9"
                        >
                            <p className="text-xl md:text-3xl font-light leading-relaxed text-gray-300">
                                {project.description || t('projectDetail.defaultDescription')}
                            </p>

                            <div className="mt-32 pt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                                <Link to="/projects" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-4">
                                    <span className="w-12 h-[1px] bg-gray-400 inline-block" /> {t('projectDetail.back')}
                                </Link>
                                <a href="/#contact" className="w-full sm:w-auto text-center bg-white text-black-900 px-8 py-4 uppercase text-xs tracking-widest font-medium hover:bg-gray-200 transition-colors">
                                    {t('projectDetail.requestProposal')}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectDetail;
