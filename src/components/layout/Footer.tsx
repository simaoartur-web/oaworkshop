import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import { getHomePrefix, getLocalizedInternalLink } from '../../seo/routes';

const Footer = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const homePrefix = getHomePrefix(location.pathname);
    const projectsLink = getLocalizedInternalLink('/projects', location.pathname);

    return (
        <footer className="bg-[#090909] text-white pt-16 md:pt-24 pb-12">
            <div className="container-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-14 md:mb-20">
                    <div className="col-span-1 sm:col-span-2">
                        <Link to={homePrefix} className="inline-block">
                            <img src="/logo.png" alt="O+A" className="w-14 h-14 md:w-16 md:h-16 object-contain mb-5 md:mb-6" />
                        </Link>
                        <p className="text-gray-400 font-light text-base md:text-xl max-w-sm leading-relaxed mb-6 md:mb-8">
                            {t('common.tagline')}
                        </p>
                        <p className="text-gray-500 text-sm">{t('common.basedIn')}</p>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-5 md:mb-6">{t('nav.quickLinks')}</h4>
                        <ul className="space-y-3.5 font-light text-gray-300">
                            <li><Link to={`${homePrefix}#workshop`} className="inline-block py-1 hover:text-white transition-colors">{t('nav.workshop')}</Link></li>
                            <li><Link to={`${homePrefix}#portfolio`} className="inline-block py-1 hover:text-white transition-colors">{t('nav.expertise')}</Link></li>
                            <li><Link to={projectsLink} className="inline-block py-1 hover:text-white transition-colors">{t('nav.projects')}</Link></li>
                            <li><Link to={`${homePrefix}#contact`} className="inline-block py-1 hover:text-white transition-colors">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-5 md:mb-6">{t('footer.contacts')}</h4>
                        <ul className="space-y-3.5 font-light text-gray-300">
                            <li><a href="mailto:oa@oa-workshop.com" className="inline-block py-1 hover:text-white transition-colors break-all">oa@oa-workshop.com</a></li>
                            <li className="pt-2">{t('contact.locationLine')}</li>
                            <li>{t('contact.locationLine2')}</li>
                        </ul>
                    </div>
                </div>

                <div className="mb-8 flex justify-start border-t border-white/10 pt-8">
                    <Link
                        to={`${homePrefix}#top`}
                        className="group inline-flex min-h-[44px] items-center gap-4 border border-white/12 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/70 transition-all duration-500 hover:border-terracota/60 hover:bg-white/[0.03] hover:text-white focus:outline-none focus:ring-1 focus:ring-terracota/50"
                    >
                        <span>{t('footer.backToTop')}</span>
                        <ArrowUp size={15} strokeWidth={1.5} className="text-terracota transition-transform duration-500 group-hover:-translate-y-1" />
                    </Link>
                </div>

                <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 text-center sm:text-left">
                    <div>© {new Date().getFullYear()} {t('common.studioName')}. {t('footer.copyright')}</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
