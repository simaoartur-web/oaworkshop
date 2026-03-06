import { useState, useEffect } from 'react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState<'leads' | 'projects'>('leads');
    const [leads, setLeads] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New Project Form State
    const [form, setForm] = useState({
        title: '', category: 'Arquitetura', location: '',
        client: '', completion_year: '', description: '', thumbnail_url: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'leads') {
                const res = await fetch('http://localhost:8000/api/admin/leads');
                if (res.ok) setLeads(await res.json());
            } else {
                const res = await fetch('http://localhost:8000/api/projects');
                if (res.ok) setProjects(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                completion_year: form.completion_year ? parseInt(form.completion_year) : null
            };

            const res = await fetch('http://localhost:8000/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Projeto adicionado com sucesso!");
                setForm({ title: '', category: 'Arquitetura', location: '', client: '', completion_year: '', description: '', thumbnail_url: '' });
                fetchData();
            }
        } catch (err) {
            alert("Erro ao adicionar projeto.");
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!confirm("Tem certeza que deseja apagar?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-32 pb-24">
            <div className="container-custom max-w-6xl">
                <div className="bg-white shadow-sm p-8 md:p-12">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-200 pb-8">
                        <div>
                            <h1 className="text-3xl font-light">O+A CMS Portal</h1>
                            <p className="text-gray-500 text-sm mt-2">Gestão de Portfólio e Contactos</p>
                        </div>
                        <div className="flex gap-4 mt-6 md:mt-0">
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={`px-6 py-2 text-xs font-medium tracking-widest uppercase transition-colors ${activeTab === 'leads' ? 'bg-black-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                Leads (Mensagens)
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`px-6 py-2 text-xs font-medium tracking-widest uppercase transition-colors ${activeTab === 'projects' ? 'bg-black-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                Projetos
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-24 text-center text-gray-400 text-sm tracking-widest uppercase">A carregar dados...</div>
                    ) : (
                        <>
                            {/* LEADS TAB */}
                            {activeTab === 'leads' && (
                                <div>
                                    <h2 className="text-xl font-light mb-6">Caixa de Entrada ({leads.length})</h2>
                                    {leads.length === 0 ? (
                                        <p className="text-gray-500">Nenhuma mensagem recebida ainda.</p>
                                    ) : (
                                        <div className="grid gap-6">
                                            {leads.map(lead => (
                                                <div key={lead.id} className="border border-gray-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start hover:border-black-900 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <h3 className="font-semibold">{lead.name}</h3>
                                                            {!lead.is_read && <span className="bg-blue-600 text-white text-[10px] px-2 py-1 uppercase tracking-wider rounded-sm">Nova</span>}
                                                            <span className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1 font-medium">{lead.email} {lead.subject && ` • Assunto: ${lead.subject}`}</p>
                                                        <p className="text-sm text-gray-500 mt-4 bg-gray-50 p-4 border-l-2 border-gray-300">{lead.message}</p>
                                                    </div>
                                                    <button className="text-xs uppercase tracking-widest text-gray-400 hover:text-black-900">Marcar como Lida</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PROJECTS TAB */}
                            {activeTab === 'projects' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                                    {/* Add Form */}
                                    <div className="lg:col-span-5 bg-gray-50 p-8 border border-gray-200">
                                        <h2 className="text-xl font-light mb-6">Adicionar Novo Projeto</h2>
                                        <form onSubmit={handleProjectSubmit} className="space-y-6">
                                            <div>
                                                <label className="admin-label">Título *</label>
                                                <input required type="text" className="admin-input bg-white" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="admin-label">Categoria *</label>
                                                    <select className="admin-input bg-white" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                                        <option>Arquitetura</option>
                                                        <option>Urbanismo</option>
                                                        <option>WASH</option>
                                                        <option>DRR</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="admin-label">Ano</label>
                                                    <input type="number" className="admin-input bg-white" value={form.completion_year} onChange={e => setForm({ ...form, completion_year: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="admin-label">Localização *</label>
                                                <input required type="text" className="admin-input bg-white" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="admin-label">Cliente</label>
                                                <input type="text" className="admin-input bg-white" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="admin-label">Imagem URL (Mock de CDN)</label>
                                                <input type="url" className="admin-input bg-white placeholder-gray-300" placeholder="https://unsplash.com/..." value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="admin-label">Descrição Rica</label>
                                                <textarea rows={4} className="admin-input bg-white" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                                            </div>
                                            <button type="submit" className="admin-btn w-full">Guardar Projeto na Base de Dados</button>
                                        </form>
                                    </div>

                                    {/* List of Projects */}
                                    <div className="lg:col-span-7">
                                        <h2 className="text-xl font-light mb-6">Portfólio Gravado ({projects.length})</h2>
                                        <div className="grid gap-4">
                                            {projects.length === 0 ? <p className="text-gray-500 text-sm">Nenhum projeto inserido.</p> : null}
                                            {projects.map(proj => (
                                                <div key={proj.id} className="flex gap-4 border border-gray-200 p-4 hover:bg-gray-50 transition-colors items-center">
                                                    <div className="w-24 h-16 bg-gray-200 flex-shrink-0">
                                                        {proj.thumbnail_url && <img src={proj.thumbnail_url} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-semibold text-sm">{proj.title}</h4>
                                                        <p className="text-xs text-gray-500">{proj.category} | {proj.location}</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button onClick={() => handleDeleteProject(proj.id)} className="text-xs text-red-500 uppercase tracking-widest hover:text-red-700">Apagar</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Admin;
