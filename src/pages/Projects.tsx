import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionOverlayStatus from '../components/common/SectionOverlayStatus';
import { useTranslation } from 'react-i18next';

interface Project {
    id: number;
    title: string;
    category: string;
    location: string;
    client: string | null;
    completion_year: number | null;
    thumbnail_url: string | null;
}

const Projects = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('__all__');
    const [isMockContent, setIsMockContent] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/api/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(Array.isArray(data) ? data : []);
                setIsMockContent(false);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch projects', err);
                setProjects([
                    { id: 1, title: t('projectDetail.fallback.title'), category: t('projectDetail.fallback.category'), location: 'Maputo, MZ', completion_year: 2024, client: null, thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800' },
                    { id: 2, title: 'Milan Residence', category: t('admin.categories.architecture'), location: 'Milan, IT', completion_year: 2023, client: null, thumbnail_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800' },
                    { id: 3, title: 'WASH School Extension', category: 'WASH', location: 'Pemba, MZ', completion_year: 2025, client: 'UNICEF', thumbnail_url: 'https://images.unsplash.com/photo-1541888086925-0c13d46321de?auto=format&fit=crop&w=800' },
                    { id: 4, title: 'Coastal Defense', category: 'DRR', location: 'Beira, MZ', completion_year: 2022, client: null, thumbnail_url: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800' },
                ]);
                setIsMockContent(true);
                setLoading(false);
            });
    }, [t]);

    const categories = ['__all__', ...Array.from(new Set(projects.map(p => p.category)))];
    const filteredProjects = filter === '__all__' ? projects : projects.filter(p => p.category === filter);

    return (
        <motion.div
            className="min-h-screen bg-gray-100 pt-32 pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container-custom">
                <div className="mb-16 flex flex-col items-end justify-between border-b border-gray-300 pb-8 md:flex-row">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight md:text-6xl">{t('projectsPage.title')}</h1>
                        <p className="mt-4 max-w-lg font-light text-gray-500">
                            {t('projectsPage.intro')}
                        </p>
                    </div>

                    <div className="relative mt-8 w-full max-w-full md:mt-0 md:w-auto">
                        <div className="flex w-full gap-6 overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] md:[mask-image:none]">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`whitespace-nowrap text-xs uppercase tracking-widest transition-colors ${
                                        filter === cat
                                            ? 'border-b border-black-900 pb-1 font-semibold text-black-900'
                                            : 'text-gray-500 hover:text-black-900'
                                    }`}
                                >
                                    {cat === '__all__' ? t('common.all') : cat}
                                </button>
                            ))}
                            <div className="w-8 shrink-0 md:hidden" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center text-xs uppercase tracking-widest text-gray-400">
                        {t('projectsPage.loading')}
                    </div>
                ) : (
                    <div className="relative overflow-hidden">
                        {isMockContent && (
                            <SectionOverlayStatus
                                title={t('common.underConstruction')}
                                subtitle={t('projectsPage.intro')}
                                variant="under-construction"
                                blurIntensity="strong"
                            />
                        )}
                        <motion.div
                            layout
                            className={`relative z-0 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 ${
                                isMockContent ? 'pointer-events-none blur-[5px] saturate-50 opacity-45 select-none' : ''
                            }`}
                        >
                            {filteredProjects.map(project => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    key={project.id}
                                    className="group cursor-pointer"
                                >
                                    <Link to={`/projects/${project.id}`}>
                                        <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-gray-200">
                                            <img
                                                src={project.thumbnail_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800'}
                                                alt={project.title}
                                                className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black-900/0 transition-colors duration-500 group-hover:bg-black-900/10" />
                                        </div>
                                        <div className="flex items-start justify-between gap-8">
                                            <div>
                                                <h3 className="text-2xl font-light transition-colors group-hover:text-gray-600">
                                                    {project.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">{project.location}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs uppercase tracking-widest text-gray-400">
                                                    {project.category}
                                                </span>
                                                {project.completion_year && (
                                                    <span className="mt-1 block text-xs text-gray-500">
                                                        {project.completion_year}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Projects;
