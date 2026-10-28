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

function getInitialLanguage(): 'en' | 'pt' {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/pt' || path.startsWith('/pt/')) return 'pt';
        if (path === '/en' || path.startsWith('/en/')) return 'en';
        const savedLanguage = window.localStorage.getItem('oa-language');
        if (savedLanguage === 'pt' || savedLanguage === 'en') return savedLanguage;
    }
    return 'en';
}

const defaultLanguage = getInitialLanguage();

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
