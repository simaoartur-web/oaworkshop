export type SupportedLanguage = 'en' | 'pt';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'pt'];
export const SITE_URL = 'https://www.oa-workshop.com';

/**
 * Normalizes a pathname: removes trailing slash (unless root) and ensures leading slash.
 */
export function normalizePathname(pathname: string): string {
    if (!pathname || pathname === '/') return '/';
    let clean = pathname.trim();
    if (!clean.startsWith('/')) clean = `/${clean}`;
    if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
    return clean;
}

/**
 * Extracts language from pathname ('pt' or 'en'). Defaults to 'en' for root or unprefixed paths.
 */
export function getLanguageFromPathname(pathname: string): SupportedLanguage {
    const clean = normalizePathname(pathname);
    if (clean === '/pt' || clean.startsWith('/pt/')) return 'pt';
    if (clean === '/en' || clean.startsWith('/en/')) return 'en';
    return DEFAULT_LANGUAGE;
}

/**
 * Strips the language prefix (/pt or /en) from a pathname.
 * e.g. '/pt/projects' -> '/projects', '/en' -> '/', '/' -> '/'
 */
export function stripLanguagePrefix(pathname: string): string {
    const clean = normalizePathname(pathname);
    if (clean === '/pt' || clean === '/en') return '/';
    if (clean.startsWith('/pt/')) return clean.slice(3) || '/';
    if (clean.startsWith('/en/')) return clean.slice(3) || '/';
    return clean;
}

/**
 * Returns the homepage prefix for the given pathname.
 * When on /pt/... returns '/pt/'
 * When on /en/... returns '/en/'
 * When on / or unprefixed returns '/'
 */
export function getHomePrefix(pathname: string): string {
    const clean = normalizePathname(pathname);
    if (clean === '/pt' || clean.startsWith('/pt/')) return '/pt/';
    if (clean === '/en' || clean.startsWith('/en/')) return '/en/';
    return '/';
}

/**
 * Builds a localized path preserving base path and optional hash.
 * e.g. ('/', 'pt', '#workshop') -> '/pt/#workshop'
 * ('/projects', 'pt') -> '/pt/projects'
 * ('/pt/projects', 'en') -> '/en/projects'
 */
export function buildLocalizedPath(
    currentPath: string,
    targetLang: SupportedLanguage,
    hash = ''
): string {
    const stripped = stripLanguagePrefix(currentPath);
    const cleanHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';

    if (stripped === '/') {
        if (targetLang === 'pt') return `/pt/${cleanHash}`;
        return `/en/${cleanHash}`;
    }

    return `/${targetLang}${stripped}${cleanHash}`;
}

/**
 * Builds an internal link for the active language.
 * e.g. on '/pt' -> ('/projects') -> '/pt/projects'
 * on '/' -> ('/projects') -> '/projects'
 */
export function getLocalizedInternalLink(
    targetPath: string,
    currentPathname: string
): string {
    const lang = getLanguageFromPathname(currentPathname);
    const cleanTarget = normalizePathname(targetPath);
    const strippedTarget = stripLanguagePrefix(cleanTarget);

    if (lang === 'pt') {
        if (strippedTarget === '/') return '/pt/';
        return `/pt${strippedTarget}`;
    }

    if (normalizePathname(currentPathname).startsWith('/en')) {
        if (strippedTarget === '/') return '/en/';
        return `/en${strippedTarget}`;
    }

    return strippedTarget;
}
