import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import pt from './locales/pt';

const resources = {
    pt: {
        translation: pt,
    },
    en: {
        translation: en,
    },
};

const savedLanguage = typeof window !== 'undefined' ? window.localStorage.getItem('oa-language') : null;
const defaultLanguage = savedLanguage === 'pt' || savedLanguage === 'en' ? savedLanguage : 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLanguage,
        fallbackLng: 'en',
        supportedLngs: ['en', 'pt'],
        returnNull: false,
        interpolation: {
            escapeValue: false
        }
    });

i18n.on('languageChanged', (language) => {
    const normalizedLanguage = language.startsWith('pt') ? 'pt' : 'en';
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('oa-language', normalizedLanguage);
        document.documentElement.lang = normalizedLanguage;
    }
});

if (typeof document !== 'undefined') {
    document.documentElement.lang = defaultLanguage;
}

export default i18n;
