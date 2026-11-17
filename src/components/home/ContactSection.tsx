import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PUBLIC_EMAIL = 'oa@oa-workshop.com';

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
        <section id="contact" className="relative overflow-hidden bg-gradient-to-b from-[#0b0b0b] to-[#111111] py-16 md:py-28 text-white scroll-mt-24">
            <div className="container-custom">
                <div className="grid grid-cols-1 gap-10 md:gap-14 lg:grid-cols-2 lg:gap-24">
                    <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                        <h2 className="mb-4 md:mb-6 text-xs uppercase tracking-[0.2em] text-gray-400">{t('contact.eyebrow')}</h2>
                        <h3 className="mb-6 md:mb-8 text-3xl sm:text-4xl font-light leading-tight md:text-6xl">
                            {t('contact.titleStart')} <br /><span className="font-semibold">{t('contact.titleStrong')}</span>
                        </h3>
                        <p className="mb-10 md:mb-12 max-w-md text-base sm:text-lg font-light leading-relaxed text-gray-400">{t('contact.intro')}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                            <div>
                                <h4 className="mb-2 text-xs uppercase tracking-widest text-[#ED7D31]">{t('contact.mainOfficeTitle')}</h4>
                                <p className="text-sm font-medium text-white mb-2">{t('contact.locationLine2')}</p>
                                <p className="text-sm font-light leading-relaxed text-gray-300 mb-3">
                                    {t('contact.maputoAddress')}
                                </p>
                                <ul className="space-y-1.5 text-sm font-light text-gray-300">
                                    <li>
                                        <a href="tel:+258876569776" className="inline-block py-0.5 hover:text-white transition-colors">
                                            +258 87 65 69 776
                                        </a>
                                    </li>
                                    <li>
                                        <a href="tel:+258847555427" className="inline-block py-0.5 hover:text-white transition-colors">
                                            +258 84 75 55 427
                                        </a>
                                    </li>
                                    <li className="pt-1">
                                        <a href={`mailto:${PUBLIC_EMAIL}`} className="inline-block py-0.5 text-white hover:text-[#ED7D31] transition-colors break-all">
                                            {PUBLIC_EMAIL}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-2 text-xs uppercase tracking-widest text-[#ED7D31]">{t('contact.repOfficeTitle')}</h4>
                                <p className="text-sm font-medium text-white mb-2">{t('contact.locationLine')}</p>
                                <p className="text-sm font-light leading-relaxed text-gray-300 mb-3">
                                    {t('contact.milanoAddress')}
                                </p>
                                <ul className="space-y-1.5 text-sm font-light text-gray-300">
                                    <li>
                                        <a href="tel:+393513531205" className="inline-block py-0.5 hover:text-white transition-colors">
                                            +39 351 3531205
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="border border-white/10 bg-[#080808] p-6 sm:p-8 shadow-sm md:p-12">
                        <h3 className="mb-2.5 text-xl sm:text-2xl font-light">{t('contact.formTitle')}</h3>
                        <p className="mb-6 md:mb-8 text-sm font-light leading-relaxed text-gray-400">{t('contact.formHelp')}</p>

                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
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
                            <button type="submit" className="w-full min-h-[48px] bg-white py-3.5 text-xs font-medium uppercase tracking-widest text-black-900 transition-colors hover:bg-gray-200 cursor-pointer">
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
