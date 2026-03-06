import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    pt: {
        translation: {
            nav: {
                workshop: "Workshop",
                expertise: "Expertise",
                projects: "Projectos",
                contact: "Contactos"
            },
            hero: {
                subtitle: "For a changing world"
            }
        }
    },
    en: {
        translation: {
            nav: {
                workshop: "Workshop",
                expertise: "Expertise",
                projects: "Projects",
                contact: "Contact"
            },
            hero: {
                subtitle: "For a changing world"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'pt', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
