import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// API Interface matching FastAPI Schema
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
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        // Fetch from FastAPI
        fetch('http://localhost:8000/api/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch projects", err);
                // Fallback Mock Data for immediate visual feedback until DB is populated via CMS
                setProjects([
                    { id: 1, title: 'Maputo Central Hub', category: 'Urbanismo', location: 'Maputo, MZ', completion_year: 2024, client: null, thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800' },
                    { id: 2, title: 'Milan Residence', category: 'Arquitetura', location: 'Milan, IT', completion_year: 2023, client: null, thumbnail_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800' },
                    { id: 3, title: 'WASH School Extension', category: 'WASH', location: 'Pemba, MZ', completion_year: 2025, client: 'UNICEF', thumbnail_url: 'https://images.unsplash.com/photo-1541888086925-0c13d46321de?auto=format&fit=crop&w=800' },
                    { id: 4, title: 'Coastal Defense', category: 'DRR', location: 'Beira, MZ', completion_year: 2022, client: null, thumbnail_url: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800' },
                ]);
                setLoading(false);
            });
    }, []);

    const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
    const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

    return (
        <motion.div 
            className="pt-32 pb-24 min-h-screen bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container-custom">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-300 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-light tracking-tight">Projectos</h1>
                        <p className="text-gray-500 mt-4 max-w-lg font-light">Trabalhos selecionados em arquitetura, planeamento e infraestrutura à escala global.</p>
                    </div>

                    {/* Subtle Filters */}
                    <div className="relative mt-8 md:mt-0 w-full md:w-auto max-w-full">
                        <div className="flex gap-6 overflow-x-auto pb-2 w-full [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] md:[mask-image:none]">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${filter === cat ? 'text-black-900 font-semibold border-b border-black-900 pb-1' : 'text-gray-500 hover:text-black-900'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                            {/* Extra space for mask fade */}
                            <div className="w-8 shrink-0 md:hidden"></div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 uppercase tracking-widest text-xs">A Carregar...</div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
                    >
                        {filteredProjects.map((project) => (
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
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-200 mb-6 relative">
                                        <img
                                            src={project.thumbnail_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800'}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                        />
                                        {/* Dark overlay on hover */}
                                        <div className="absolute inset-0 bg-black-900/0 group-hover:bg-black-900/10 transition-colors duration-500" />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-light group-hover:text-gray-600 transition-colors">{project.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs tracking-widest uppercase text-gray-400 block">{project.category}</span>
                                            {project.completion_year && <span className="text-xs text-gray-500 mt-1 block">{project.completion_year}</span>}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Projects;
