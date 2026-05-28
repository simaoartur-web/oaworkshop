import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-black-900 text-white pt-24 pb-12">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                    <div className="col-span-1 md:col-span-2">
                        <img src="/logo.png" alt="O+A" className="w-16 h-16 object-contain mb-6" />
                        <p className="text-gray-400 font-light text-base md:text-xl max-w-sm leading-relaxed mb-8">
                            {t('common.tagline')}
                        </p>
                        <p className="text-gray-500 text-sm">{t('common.basedIn')}</p>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{t('nav.quickLinks')}</h4>
                        <ul className="space-y-4 font-light text-gray-300">
                            <li><Link to="/#workshop" className="hover:text-white transition-colors">{t('nav.workshop')}</Link></li>
                            <li><Link to="/#expertise" className="hover:text-white transition-colors">{t('nav.expertise')}</Link></li>
                            <li><Link to="/projects" className="hover:text-white transition-colors">{t('nav.projects')}</Link></li>
                            <li><Link to="/#contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{t('footer.contacts')}</h4>
                        <ul className="space-y-4 font-light text-gray-300">
                            <li><a href="mailto:oa@oa-workshop.com" className="hover:text-white transition-colors">oa@oa-workshop.com</a></li>
                            <li><a href="tel:+258000000000" className="hover:text-white transition-colors">+258 000 000 000</a></li>
                            <li className="pt-4">{t('contact.locationLine')}</li>
                            <li>{t('contact.locationLine2')}</li>
                        </ul>
                    </div>
                </div>

                <div className="mb-10 flex justify-start border-t border-white/10 pt-8">
                    <Link
                        to="/#top"
                        className="group inline-flex items-center gap-4 border border-white/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/60 transition-all duration-500 hover:border-terracota/60 hover:bg-white/[0.03] hover:text-white focus:outline-none focus:ring-1 focus:ring-terracota/50"
                    >
                        <span>{t('footer.backToTop')}</span>
                        <ArrowUp size={15} strokeWidth={1.5} className="text-terracota transition-transform duration-500 group-hover:-translate-y-1" />
                    </Link>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <div>© {new Date().getFullYear()} {t('common.studioName')}. {t('footer.copyright')}</div>
                    <div className="flex gap-6">
                        <Link to="/admin" className="hover:text-white transition-colors">{t('nav.reservedArea')}</Link>
                        <a href="#" className="hover:text-white transition-colors">{t('nav.privacy')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
