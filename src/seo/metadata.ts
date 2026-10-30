import {
    SITE_URL,
    type SupportedLanguage,
    getLanguageFromPathname,
    stripLanguagePrefix,
    buildLocalizedPath,
} from './routes';
import { ALL_PROJECTS, hasVerifiedProjects, type Project } from '../data/projects';
import enLocale from '../locales/en';
import ptLocale from '../locales/pt';

export interface AlternateLink {
    hrefLang: string;
    href: string;
}

export interface PageMetadata {
    title: string;
    description: string;
    canonical: string;
    robots: 'index, follow' | 'noindex, nofollow';
    lang: SupportedLanguage;
    isIndexable: boolean;
    og: {
        title: string;
        description: string;
        url: string;
        type: 'website' | 'article';
        image: string;
        imageWidth: number;
        imageHeight: number;
        imageAlt: string;
        locale: string;
        localeAlternate: string;
        siteName: string;
    };
    twitter: {
        card: 'summary_large_image';
        title: string;
        description: string;
        image: string;
        imageAlt: string;
    };
    alternates: AlternateLink[];
    jsonLd?: Record<string, unknown>;
}

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-oa-workshop.jpg`;
export const DEFAULT_OG_IMAGE_ALT_EN = 'O+A Architects and Planners — Milan and Maputo';
export const DEFAULT_OG_IMAGE_ALT_PT = 'O+A Arquitectos e Planeadores — Milão e Maputo';

/**
 * Verified Organization JSON-LD structure (Schema.org)
 * Strictly contains verified facts from repository (founders, studio name, locations, logo, email, founding year).
 */
export function buildOrganizationJsonLd(lang: SupportedLanguage): Record<string, unknown> {
    const isPt = lang === 'pt';
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: isPt ? 'O+A Arquitectos e Planeadores' : 'O+A Architects and Planners',
        alternateName: ['O+A', 'O+A Workshop', isPt ? 'O+A Architects and Planners' : 'O+A Arquitectos e Planeadores'],
        url: `${SITE_URL}/`,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
            width: 512,
            height: 512,
            caption: 'O+A',
        },
        image: DEFAULT_OG_IMAGE,
        email: 'oa@oa-workshop.com',
        foundingDate: '2025',
        founders: [
            {
                '@type': 'Person',
                name: 'Osvaldo Luís',
                jobTitle: isPt
                    ? 'Director-Geral · Arquitecto e Urbanista Sénior'
                    : 'Managing Director · Senior Architect & Urbanist',
            },
            {
                '@type': 'Person',
                name: 'Artur Simão',
                jobTitle: isPt
                    ? 'Director Técnico · Arquitecto e Urbanista Sénior'
                    : 'Technical Director · Senior Architect & Urbanist',
            },
        ],
        address: [
            {
                '@type': 'PostalAddress',
                addressLocality: 'Maputo',
                addressCountry: 'MZ',
            },
            {
                '@type': 'PostalAddress',
                addressLocality: 'Milan',
                addressCountry: 'IT',
            },
        ],
        description: isPt
            ? 'Estúdio africano de arquitectura sustentável, planeamento urbano, investigação e design, fundado por Osvaldo Luís e Artur Simão, sediado em Maputo e Milão.'
            : 'African studio for sustainable architecture, urban planning, research and design, founded by Osvaldo Luís and Artur Simão, based in Maputo and Milan.',
    };
}

/**
 * Resolves localized project details (title and description) from local locale dictionaries.
 */
function getProjectDetails(
    project: Project,
    lang: SupportedLanguage
): { title: string; description: string } {
    const localeResource = lang === 'pt' ? ptLocale : enLocale;
    const disciplineProjects =
        localeResource.categorySections?.projects?.[project.discipline];
    const item = Array.isArray(disciplineProjects)
        ? disciplineProjects[project.contentIndex]
        : undefined;
    const projectTitle = item?.title || project.id;
    const projectDesc = item?.description || '';
    return { title: projectTitle, description: projectDesc };
}

/**
 * Returns canonical 404 / Not Found metadata with noindex, no canonical, no og:url, no alternates, and no JSON-LD.
 */
export function getNotFoundMetadata(lang: SupportedLanguage): PageMetadata {
    const isPt = lang === 'pt';
    const siteName = isPt ? 'O+A Arquitectos e Planeadores' : 'O+A Architects and Planners';
    const imageAlt = isPt ? DEFAULT_OG_IMAGE_ALT_PT : DEFAULT_OG_IMAGE_ALT_EN;
    const locale = isPt ? 'pt_PT' : 'en_US';
    const localeAlternate = isPt ? 'en_US' : 'pt_PT';

    const notFoundTitle = isPt
        ? '404 — Página Não Encontrada | O+A'
        : '404 — Page Not Found | O+A';
    const notFoundDesc = isPt
        ? 'A página solicitada não foi encontrada no sítio da O+A Arquitectos e Planeadores.'
        : 'The requested page could not be found on the O+A Architects and Planners website.';

    return {
        title: notFoundTitle,
        description: notFoundDesc,
        canonical: '', // 404 pages must never provide a canonical tag
        robots: 'noindex, nofollow',
        lang,
        isIndexable: false,
        og: {
            title: notFoundTitle,
            description: notFoundDesc,
            url: '', // Cleaned on 404 to avoid inheriting previous og:url
            type: 'website',
            image: DEFAULT_OG_IMAGE,
            imageWidth: 1200,
            imageHeight: 630,
            imageAlt,
            locale,
            localeAlternate,
            siteName,
        },
        twitter: {
            card: 'summary_large_image',
            title: notFoundTitle,
            description: notFoundDesc,
            image: DEFAULT_OG_IMAGE,
            imageAlt,
        },
        alternates: [],
        jsonLd: undefined,
    };
}

/**
 * Returns complete SEO metadata for any given pathname and optional language override.
 */
export function getPageMetadata(
    pathname: string,
    forcedLang?: SupportedLanguage,
    dynamicTitle?: string
): PageMetadata {
    const lang = forcedLang ?? getLanguageFromPathname(pathname);
    const stripped = stripLanguagePrefix(pathname);
    const isPt = lang === 'pt';

    const siteName = isPt ? 'O+A Arquitectos e Planeadores' : 'O+A Architects and Planners';
    const imageAlt = isPt ? DEFAULT_OG_IMAGE_ALT_PT : DEFAULT_OG_IMAGE_ALT_EN;
    const locale = isPt ? 'pt_PT' : 'en_US';
    const localeAlternate = isPt ? 'en_US' : 'pt_PT';

    // 1. Homepage: '/', '/en', '/en/', '/pt', '/pt/'
    if (stripped === '/') {
        const canonical =
            pathname === '/'
                ? `${SITE_URL}/`
                : `${SITE_URL}${buildLocalizedPath('/', lang)}`;

        const title = isPt
            ? 'O+A Arquitectos e Planeadores | Arquitectura, Urbanismo e Investigação'
            : 'O+A Architects and Planners | Architecture, Urbanism & Research';

        const description = isPt
            ? 'Estúdio africano de arquitectura sustentável, planeamento urbano, investigação e design fundado por Osvaldo Luís e Artur Simão em 2025, em Maputo e Milão.'
            : 'African studio for sustainable architecture, urban planning, research and design founded by Osvaldo Luís and Artur Simão in 2025, in Maputo and Milan.';

        const alternates: AlternateLink[] = [
            { hrefLang: 'en', href: `${SITE_URL}/en/` },
            { hrefLang: 'pt', href: `${SITE_URL}/pt/` },
            { hrefLang: 'x-default', href: `${SITE_URL}/` },
        ];

        return {
            title,
            description,
            canonical,
            robots: 'index, follow',
            lang,
            isIndexable: true,
            og: {
                title,
                description,
                url: canonical,
                type: 'website',
                image: DEFAULT_OG_IMAGE,
                imageWidth: 1200,
                imageHeight: 630,
                imageAlt,
                locale,
                localeAlternate,
                siteName,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                image: DEFAULT_OG_IMAGE,
                imageAlt,
            },
            alternates,
            jsonLd: buildOrganizationJsonLd(lang),
        };
    }

    // 2. Project Catalog: '/projects'
    if (stripped === '/projects') {
        const isVerified = hasVerifiedProjects();
        const canonical = `${SITE_URL}${buildLocalizedPath('/projects', lang)}`;
        const title = isPt
            ? 'Biblioteca de Projectos | O+A Arquitectos e Planeadores'
            : 'Project Library | O+A Architects and Planners';

        const description = isPt
            ? 'Selecção de estudos e projectos em arquitectura, planeamento urbano e investigação em diferentes territórios.'
            : 'Selection of studies and projects in architecture, urban planning and research across diverse territories.';

        return {
            title,
            description,
            canonical,
            robots: isVerified ? 'index, follow' : 'noindex, nofollow',
            lang,
            isIndexable: isVerified,
            og: {
                title,
                description,
                url: canonical,
                type: 'website',
                image: DEFAULT_OG_IMAGE,
                imageWidth: 1200,
                imageHeight: 630,
                imageAlt,
                locale,
                localeAlternate,
                siteName,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                image: DEFAULT_OG_IMAGE,
                imageAlt,
            },
            alternates: [
                { hrefLang: 'en', href: `${SITE_URL}/en/projects` },
                { hrefLang: 'pt', href: `${SITE_URL}/pt/projects` },
            ],
            jsonLd: undefined,
        };
    }

    // 3. Project Detail: '/projects/:id'
    if (stripped.startsWith('/projects/')) {
        const projectId = stripped.replace('/projects/', '').trim();
        const found = ALL_PROJECTS.find((p) => p.id === projectId);
        if (!found) {
            // Non-existent project treated consistently as 404
            return getNotFoundMetadata(lang);
        }

        const details = getProjectDetails(found, lang);
        const resolvedTitle = dynamicTitle || details.title;

        const title = `${resolvedTitle} | ${siteName}`;
        const description = details.description || (isPt
            ? 'Detalhes do projecto e intervenção territorial O+A Arquitectos e Planeadores.'
            : 'Project details and spatial intervention by O+A Architects and Planners.');
        const canonical = `${SITE_URL}${buildLocalizedPath(`/projects/${projectId}`, lang)}`;
        const isVerified = found.editorialStatus === 'verified';

        return {
            title,
            description,
            canonical,
            robots: isVerified ? 'index, follow' : 'noindex, nofollow',
            lang,
            isIndexable: isVerified,
            og: {
                title,
                description,
                url: canonical,
                type: 'article',
                image: found.mainImage || DEFAULT_OG_IMAGE,
                imageWidth: 1200,
                imageHeight: 630,
                imageAlt: resolvedTitle,
                locale,
                localeAlternate,
                siteName,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                image: found.mainImage || DEFAULT_OG_IMAGE,
                imageAlt: resolvedTitle,
            },
            alternates: [
                { hrefLang: 'en', href: `${SITE_URL}/en/projects/${projectId}` },
                { hrefLang: 'pt', href: `${SITE_URL}/pt/projects/${projectId}` },
            ],
            jsonLd: undefined,
        };
    }

    // 4. Not Found / 404 fallback for any other unmapped route
    return getNotFoundMetadata(lang);
}
