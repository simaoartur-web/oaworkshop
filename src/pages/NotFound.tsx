import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { getLanguageFromPathname } from '../seo/routes';

const NotFound = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const lang = getLanguageFromPathname(location.pathname);
    const homeTarget = lang === 'pt' ? '/pt/' : '/en/';

    return (
        <motion.div
            className="flex min-h-screen flex-col items-center justify-center bg-black-900 px-6 py-32 text-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="container-custom flex max-w-xl flex-col items-center">
                <span className="text-xs uppercase tracking-[0.3em] text-terracota font-medium mb-4">
                    404 — {t('common.brand')}
                </span>

                <h1 className="text-4xl font-light tracking-tight sm:text-6xl md:text-7xl mb-6">
                    {t('notFound.title')}
                </h1>

                <p className="max-w-md text-base sm:text-lg font-light leading-relaxed text-gray-400 mb-12">
                    {t('notFound.description')}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        to={homeTarget}
                        className="inline-flex min-h-[44px] items-center gap-3 border border-white/20 px-6 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:border-terracota hover:text-terracota"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        <span>{t('notFound.backHome')}</span>
                    </Link>

                    {lang === 'pt' ? (
                        <Link
                            to="/en/"
                            className="inline-flex min-h-[44px] items-center px-4 py-3 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                        >
                            View in English
                        </Link>
                    ) : (
                        <Link
                            to="/pt/"
                            className="inline-flex min-h-[44px] items-center px-4 py-3 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                        >
                            Ver em Português
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default NotFound;
