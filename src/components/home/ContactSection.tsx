import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PUBLIC_EMAIL = 'oa@oa-workshop.com';
const PUBLIC_PHONE_DISPLAY = '+258 000 000 000';
const PUBLIC_PHONE_LINK = '+258000000000';

const ContactSection = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const subject = formData.subject.trim() || t('contact.defaultSubject');
        const body = [
            `${t('contact.nameLabel')}: ${formData.name}`,
            `${t('contact.emailLabel')}: ${formData.email}`,
            '',
            formData.message,
        ].join('\n');

        window.location.href = `mailto:${PUBLIC_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <section id="contact" className="relative overflow-hidden bg-black-800 py-24 text-white">
            <div className="container-custom">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-gray-500">{t('contact.eyebrow')}</h2>
                        <h3 className="mb-8 text-4xl font-light leading-tight md:text-6xl">
                            {t('contact.titleStart')} <br /><span className="font-semibold">{t('contact.titleStrong')}</span>
                        </h3>
                        <p className="mb-16 max-w-md text-lg font-light leading-relaxed text-gray-500">{t('contact.intro')}</p>

                        <div className="space-y-12">
                            <div>
                                <h4 className="mb-2 text-xs uppercase tracking-widest text-gray-500">{t('contact.emailLabel')}</h4>
                                <a href={`mailto:${PUBLIC_EMAIL}`} className="text-2xl font-light transition-colors hover:text-gray-500">{PUBLIC_EMAIL}</a>
                            </div>
                            <div>
                                <h4 className="mb-2 text-xs uppercase tracking-widest text-gray-500">{t('contact.phone')}</h4>
                                <a href={`tel:${PUBLIC_PHONE_LINK}`} className="text-2xl font-light transition-colors hover:text-gray-500">{PUBLIC_PHONE_DISPLAY}</a>
                            </div>
                            <div>
                                <h4 className="mb-2 text-xs uppercase tracking-widest text-gray-500">{t('contact.locations')}</h4>
                                <p className="text-lg font-light text-gray-400">{t('contact.locationLine')} <br /> {t('contact.locationLine2')}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="border border-white/10 bg-black-900 p-8 shadow-sm md:p-12">
                        <h3 className="mb-3 text-2xl font-light">{t('contact.formTitle')}</h3>
                        <p className="mb-8 text-sm font-light leading-relaxed text-gray-400">{t('contact.formHelp')}</p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label htmlFor="contact-name" className="form-label">{t('contact.name')}</label>
                                <input id="contact-name" type="text" required autoComplete="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="form-input" placeholder={t('contact.namePlaceholder')} />
                            </div>
                            <div>
                                <label htmlFor="contact-email" className="form-label">{t('contact.email')}</label>
                                <input id="contact-email" type="email" required autoComplete="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="form-input" placeholder={t('contact.emailPlaceholder')} />
                            </div>
                            <div>
                                <label htmlFor="contact-subject" className="form-label">{t('contact.subject')}</label>
                                <input id="contact-subject" type="text" value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })} className="form-input" placeholder={t('contact.subjectPlaceholder')} />
                            </div>
                            <div>
                                <label htmlFor="contact-message" className="form-label">{t('contact.message')}</label>
                                <textarea id="contact-message" required rows={4} value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} className="form-input resize-none" placeholder={t('contact.messagePlaceholder')} />
                            </div>
                            <button type="submit" className="w-full bg-white py-4 text-xs uppercase tracking-widest text-black-900 transition-colors hover:bg-gray-200">
                                {t('contact.openEmail')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
