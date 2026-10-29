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

/**
 * Deterministic initial language policy (SEO-01):
 * - URL path is the single authoritative source of truth for the initial render and SSR.
 * - /pt and /pt/* strictly initialize in Portuguese ('pt').
 * - /en and /en/* strictly initialize in English ('en').
 * - Root (/) and all unprefixed canonical routes initialize in English ('en' / x-default).
 * - Legacy hash routes (e.g. #/pt) are supported on initial load if present.
 * - localStorage ('oa-language') stores the user's explicit preference across sessions,
 *   but NEVER overrides or contradicts the canonical URL's language, preventing hydration mismatches.
 */
export function getInitialLanguage(): 'en' | 'pt' {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/pt' || path.startsWith('/pt/')) return 'pt';
        if (path === '/en' || path.startsWith('/en/')) return 'en';
        const hash = window.location.hash;
        if (hash.startsWith('#/pt') || hash.startsWith('#pt')) return 'pt';
        if (hash.startsWith('#/en') || hash.startsWith('#en')) return 'en';
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
