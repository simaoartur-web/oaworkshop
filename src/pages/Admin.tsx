import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Admin = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'leads' | 'projects'>('leads');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [leads, setLeads] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        title: '', category: t('admin.defaultCategory'), location: '',
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        setForm(current => ({ ...current, category: current.category || t('admin.defaultCategory') }));
    }, [t]);

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
                alert(t('admin.addSuccess'));
                setForm({ title: '', category: t('admin.defaultCategory'), location: '', client: '', completion_year: '', description: '', thumbnail_url: '' });
                fetchData();
            }
        } catch {
            alert(t('admin.addError'));
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!confirm(t('admin.confirmDelete'))) return;
        try {
            const res = await fetch(`http://localhost:8000/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-100 pt-32 pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container-custom max-w-6xl">
                <div className="bg-white shadow-sm p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-200 pb-8">
                        <div>
                            <h1 className="text-3xl font-light">{t('admin.title')}</h1>
                            <p className="text-gray-500 text-sm mt-2">{t('admin.subtitle')}</p>
                        </div>
                        <div className="flex gap-4 mt-6 md:mt-0">
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={`px-6 py-2 text-xs font-medium tracking-widest uppercase transition-colors ${activeTab === 'leads' ? 'bg-black-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {t('admin.leadsTab')}
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`px-6 py-2 text-xs font-medium tracking-widest uppercase transition-colors ${activeTab === 'projects' ? 'bg-black-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {t('admin.projectsTab')}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-24 text-center text-gray-400 text-sm tracking-widest uppercase">{t('common.loadingData')}</div>
                    ) : (
                        <>
                            {activeTab === 'leads' && (
                                <div>
                                    <h2 className="text-xl font-light mb-6">{t('admin.inbox')} ({leads.length})</h2>
                                    {leads.length === 0 ? (
                                        <p className="text-gray-500">{t('admin.noMessages')}</p>
                                    ) : (
                                        <div className="grid gap-6">
                                            {leads.map(lead => (
                                                <div key={lead.id} className="border border-gray-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start hover:border-black-900 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <h3 className="font-semibold">{lead.name}</h3>
                                                            {!lead.is_read && <span className="bg-blue-600 text-white text-[10px] px-2 py-1 uppercase tracking-wider rounded-sm">{t('admin.new')}</span>}
                                                            <span className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1 font-medium">{lead.email} {lead.subject && ` • ${t('admin.subject')}: ${lead.subject}`}</p>
                                                        <p className="text-sm text-gray-500 mt-4 bg-gray-50 p-4 border-l-2 border-gray-300">{lead.message}</p>
                                                    </div>
                                                    <button className="text-xs uppercase tracking-widest text-gray-400 hover:text-black-900">{t('admin.markRead')}</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'projects' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-5 bg-gray-50 p-8 border border-gray-200">
                                        <h2 className="text-xl font-light mb-6">{t('admin.addProject')}</h2>
                                        <form onSubmit={handleProjectSubmit} className="space-y-6">
                                            <div>
                                                <label className="admin-label">{t('admin.titleLabel')}</label>
                                                <input required type="text" className="admin-input bg-white" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="admin-label">{t('admin.categoryLabel')}</label>
                                                    <select className="admin-input bg-white" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                                        <option>{t('admin.categories.architecture')}</option>
                                                        <option>{t('admin.categories.urbanism')}</option>
                                                        <option>{t('admin.categories.wash')}</option>
                                                        <option>{t('admin.categories.drr')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="admin-label">{t('admin.yearLabel')}</label>
                                                    <input type="number" className="admin-input bg-white" value={form.completion_year} onChange={e => setForm({ ...form, completion_year: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="admin-label">{t('admin.locationLabel')}</label>
                                                <input required type="text" className="admin-input bg-white" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="admin-label">{t('admin.clientLabel')}</label>
                                                <input type="text" className="admin-input bg-white" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="admin-label">{t('admin.imageUrlLabel')}</label>
                                                <input type="url" className="admin-input bg-white placeholder-gray-300" placeholder={t('admin.imagePlaceholder')} value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="admin-label">{t('admin.richDescription')}</label>
                                                <textarea rows={4} className="admin-input bg-white" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                                            </div>
                                            <button type="submit" className="admin-btn w-full">{t('admin.saveProject')}</button>
                                        </form>
                                    </div>

                                    <div className="lg:col-span-7">
                                        <h2 className="text-xl font-light mb-6">{t('admin.savedPortfolio')} ({projects.length})</h2>
                                        <div className="grid gap-4">
                                            {projects.length === 0 ? <p className="text-gray-500 text-sm">{t('admin.noProjects')}</p> : null}
                                            {projects.map(proj => (
                                                <div key={proj.id} className="flex gap-4 border border-gray-200 p-4 hover:bg-gray-50 transition-colors items-center">
                                                    <div className="w-24 h-16 bg-gray-200 flex-shrink-0">
                                                        {proj.thumbnail_url && <img src={proj.thumbnail_url} className="w-full h-full object-cover" alt={proj.title} />}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-semibold text-sm">{proj.title}</h4>
                                                        <p className="text-xs text-gray-500">{proj.category} | {proj.location}</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button onClick={() => handleDeleteProject(proj.id)} className="text-xs text-red-500 uppercase tracking-widest hover:text-red-700">{t('admin.delete')}</button>
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
        </motion.div>
    );
};

export default Admin;
