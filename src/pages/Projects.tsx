import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ALL_PROJECTS, localizeProject, type ProjectDiscipline } from '../data/projects';

const FILTERS: Array<'all' | ProjectDiscipline> = ['all', 'architecture', 'urbanism', 'research'];

const Projects = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<'all' | ProjectDiscipline>('all');
    const projects = useMemo(() => ALL_PROJECTS.map((item) => localizeProject(item, t)), [t]);
    const filteredProjects = filter === 'all' ? projects : projects.filter((item) => item.discipline === filter);
    const filterLabel = (value: 'all' | ProjectDiscipline) => value === 'all'
        ? t('common.all')
        : t(`categorySections.${value}.title`);

    return (
        <motion.div className="min-h-screen bg-gray-100 pt-32 pb-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <div className="container-custom">
                <div className="mb-16 flex flex-col items-end justify-between border-b border-gray-300 pb-8 md:flex-row">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight md:text-6xl">{t('projectsPage.title')}</h1>
                        <p className="mt-4 max-w-lg font-light text-gray-500">{t('projectsPage.intro')}</p>
                    </div>
                    <div className="relative mt-8 w-full max-w-full md:mt-0 md:w-auto">
                        <div className="flex w-full gap-6 overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] md:[mask-image:none]">
                            {FILTERS.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFilter(value)}
                                    aria-pressed={filter === value}
                                    className={`whitespace-nowrap text-xs uppercase tracking-widest transition-colors ${filter === value ? 'border-b border-black-900 pb-1 font-semibold text-black-900' : 'text-gray-500 hover:text-black-900'}`}
                                >
                                    {filterLabel(value)}
                                </button>
                            ))}
                            <div className="w-8 shrink-0 md:hidden" />
                        </div>
                    </div>
                </div>

                <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
                    {filteredProjects.map((item) => (
                        <motion.article layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} key={item.id} className="group">
                            <Link to={`/projects/${item.id}`}>
                                <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-gray-200">
                                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black-900/0 transition-colors duration-500 group-hover:bg-black-900/10" />
                                </div>
                                <div className="flex items-start justify-between gap-8">
                                    <div>
                                        <h2 className="text-2xl font-light transition-colors group-hover:text-gray-600">{item.title}</h2>
                                        <p className="mt-1 text-sm text-gray-500">{item.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs uppercase tracking-widest text-gray-400">{item.category}</span>
                                        <span className="mt-1 block text-xs text-gray-500">{item.year}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Projects;
