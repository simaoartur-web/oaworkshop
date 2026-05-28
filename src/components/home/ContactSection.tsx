import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ContactSection = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('http://localhost:8000/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-24 bg-black-800 text-white relative overflow-hidden">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">{t('contact.eyebrow')}</h2>
                        <h3 className="text-4xl md:text-6xl font-light leading-tight mb-8">
                            {t('contact.titleStart')} <br /><span className="font-semibold">{t('contact.titleStrong')}</span>
                        </h3>
                        <p className="text-lg text-gray-500 font-light mb-16 leading-relaxed max-w-md">
                            {t('contact.intro')}
                        </p>

                        <div className="space-y-12">
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Email</h4>
                                <a href="mailto:oa@oa-workshop.com" className="text-2xl font-light hover:text-gray-500 transition-colors">
                                    oa@oa-workshop.com
                                </a>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">{t('contact.phone')}</h4>
                                <a href="tel:+258000000000" className="text-2xl font-light hover:text-gray-500 transition-colors">
                                    +258 000 000 000
                                </a>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">{t('contact.locations')}</h4>
                                <p className="text-lg font-light text-gray-400">{t('contact.locationLine')} <br /> {t('contact.locationLine2')}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-black-900 p-8 md:p-12 shadow-sm border border-white/10"
                    >
                        <h3 className="text-2xl font-light mb-8">{t('contact.formTitle')}</h3>

                        {status === 'success' ? (
                            <div className="bg-black-800 text-white p-8 text-center h-full flex flex-col justify-center items-center min-h-[400px]">
                                <div className="w-16 h-16 border border-white rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h4 className="text-xl font-light mb-4">{t('contact.successTitle')}</h4>
                                <p className="text-gray-400 font-light text-sm">{t('contact.successText')}</p>
                                <button onClick={() => setStatus('idle')} className="mt-8 text-xs tracking-widest uppercase border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-colors">{t('contact.sendNew')}</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="admin-label">{t('contact.name')}</label>
                                    <input
                                        type="text" required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="admin-input" placeholder={t('contact.namePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className="admin-label">Email *</label>
                                    <input
                                        type="email" required
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="admin-input" placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="admin-label">{t('contact.subject')}</label>
                                    <input
                                        type="text"
                                        value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        className="admin-input" placeholder={t('contact.subjectPlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className="admin-label">{t('contact.message')}</label>
                                    <textarea
                                        required rows={4}
                                        value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="admin-input resize-none" placeholder={t('contact.messagePlaceholder')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-white text-black-900 py-4 uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {status === 'loading' ? t('contact.sending') : t('contact.submit')}
                                </button>

                                {status === 'error' && (
                                    <p className="text-red-500 text-sm text-center">{t('contact.error')}</p>
                                )}
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
