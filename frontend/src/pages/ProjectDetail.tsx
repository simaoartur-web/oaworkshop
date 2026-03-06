import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Project {
    id: number;
    title: string;
    category: string;
    location: string;
    client: string | null;
    completion_year: int | null;
    description: string | null;
    thumbnail_url: string | null;
}

const ProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Scroll to top on load for immersion
        window.scrollTo(0, 0);

        fetch(`http://localhost:8000/api/projects/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then(data => {
                setProject(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                // Fallback mock data if DB empty
                setProject({
                    id: Number(id),
                    title: "Maputo Central Hub",
                    category: "Urbanismo",
                    location: "Maputo, Moçambique",
                    client: "Município de Maputo",
                    completion_year: 2024,
                    description: "Um plano diretor extenso focado em mobilidade sustentável e infraestrutura verde. O projeto visa revitalizar as conexões centrais da cidade criando eixos pedestres dedicados e áreas comerciais sombreadas, providenciando proteção contra pluviosidade extrema ao abrigo dos princípios DRR da O+A.",
                    thumbnail_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000"
                });
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-black-900 flex items-center justify-center text-white text-xs tracking-widest">A CARREGAR...</div>;
    if (!project) return <div className="min-h-screen flex items-center justify-center">Projeto não encontrado.</div>;

    return (
        <div className="bg-black-900 text-white min-h-screen pb-32">
            {/* Cinematic Hero */}
            <div className="relative h-[80vh] w-full">
                <img
                    src={project.thumbnail_url || ''}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black-900 via-transparent to-black-900/60" />

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-4">{project.title}</h1>
                        <div className="text-gray-400 tracking-widest uppercase text-xs flex gap-6">
                            <span>{project.category}</span>
                            <span>{project.location}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Project Data & Details */}
            <div className="container-custom mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Rigorous Technical Data (Foster Style Sidebar) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="lg:col-span-3 border-t border-white/20 pt-8"
                    >
                        <div className="mb-8">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Localização</div>
                            <div className="font-light text-gray-200">{project.location}</div>
                        </div>
                        <div className="mb-8">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ano</div>
                            <div className="font-light text-gray-200">{project.completion_year || 'Em Progresso'}</div>
                        </div>
                        <div className="mb-8">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Categoria</div>
                            <div className="font-light text-gray-200">{project.category}</div>
                        </div>
                        {project.client && (
                            <div className="mb-8">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cliente</div>
                                <div className="font-light text-gray-200">{project.client}</div>
                            </div>
                        )}
                    </motion.div>

                    {/* Expansive Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="lg:col-span-9"
                    >
                        <p className="text-xl md:text-3xl font-light leading-relaxed text-gray-300">
                            {project.description || "Descrição em desenvolvimento para este projeto da O+A Architects."}
                        </p>

                        {/* Continuity loop - Return / Next */}
                        <div className="mt-32 pt-12 border-t border-white/10 flex justify-between items-center">
                            <Link to="/projects" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-4">
                                <span className="w-12 h-[1px] bg-gray-400 inline-block" /> Voltar ao Portfólio
                            </Link>
                            <a href="/#contact" className="bg-white text-black-900 px-8 py-4 uppercase text-xs tracking-widest font-medium hover:bg-gray-200 transition-colors">
                                Solicitar Proposta
                            </a>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
