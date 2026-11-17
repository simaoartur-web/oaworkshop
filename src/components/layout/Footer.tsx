import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import { getHomePrefix, getLocalizedInternalLink } from '../../seo/routes';

const Footer = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const homePrefix = getHomePrefix(location.pathname);
    const aboutLink = getLocalizedInternalLink('/about', location.pathname);
    const projectsLink = getLocalizedInternalLink('/projects', location.pathname);

    return (
        <footer className="bg-[#090909] text-white pt-16 md:pt-24 pb-12 border-t border-white/[0.06]">
            <div className="container-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 mb-14 md:mb-20">
                    {/* Institutional Column */}
                    <div className="sm:col-span-2 lg:col-span-5">
                        <Link to={homePrefix} className="inline-block mb-6">
                            <img
                                src="/logo.png"
                                alt="O+A"
                                className="oa-logo-white w-16 h-16 md:w-20 md:h-20 object-contain"
                            />
                        </Link>
                        <p className="text-gray-200 font-light text-sm sm:text-base max-w-md leading-relaxed mb-4">
                            {t('footer.institutionalBody1')}
                        </p>
                        <p className="text-gray-400 font-light text-sm sm:text-base max-w-md leading-relaxed">
                            {t('footer.institutionalBody2')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-5 md:mb-6">
                            {t('nav.quickLinks')}
                        </h4>
                        <ul className="space-y-3 font-light text-sm text-gray-300">
                            <li>
                                <Link to={`${homePrefix}#workshop`} className="inline-block py-1 hover:text-white transition-colors">
                                    {t('nav.workshop')}
                                </Link>
                            </li>
                            <li>
                                <Link to={aboutLink} className="inline-block py-1 hover:text-white transition-colors">
                                    {t('nav.about')}
                                </Link>
                            </li>
                            <li>
                                <Link to={`${homePrefix}#portfolio`} className="inline-block py-1 hover:text-white transition-colors">
                                    {t('nav.expertise')}
                                </Link>
                            </li>
                            <li>
                                <Link to={projectsLink} className="inline-block py-1 hover:text-white transition-colors">
                                    {t('nav.projects')}
                                </Link>
                            </li>
                            <li>
                                <Link to={`${homePrefix}#contact`} className="inline-block py-1 hover:text-white transition-colors">
                                    {t('nav.contact')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Main Office — Maputo */}
                    <div className="lg:col-span-3">
                        <h4 className="text-xs uppercase tracking-widest text-[#ED7D31] mb-3">
                            {t('contact.mainOfficeTitle')}
                        </h4>
                        <p className="text-sm font-medium text-white mb-2">
                            {t('contact.locationLine2')}
                        </p>
                        <p className="text-sm font-light leading-relaxed text-gray-300 mb-4">
                            {t('contact.maputoAddress')}
                        </p>
                        <ul className="space-y-2 text-sm font-light text-gray-300">
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
                                <a href="mailto:oa@oa-workshop.com" className="inline-block py-0.5 text-white hover:text-[#ED7D31] transition-colors break-all">
                                    oa@oa-workshop.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Representative Office — Milano */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs uppercase tracking-widest text-[#ED7D31] mb-3">
                            {t('contact.repOfficeTitle')}
                        </h4>
                        <p className="text-sm font-medium text-white mb-2">
                            {t('contact.locationLine')}
                        </p>
                        <p className="text-sm font-light leading-relaxed text-gray-300 mb-4">
                            {t('contact.milanoAddress')}
                        </p>
                        <ul className="space-y-2 text-sm font-light text-gray-300">
                            <li>
                                <a href="tel:+393513531205" className="inline-block py-0.5 hover:text-white transition-colors">
                                    +39 351 3531205
                                </a>
                            </li>
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
