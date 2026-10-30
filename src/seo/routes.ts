import { ALL_PROJECTS } from '../data/projects';

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

/**
 * Safely resolves a legacy HashRouter route (e.g. `#/pt`, `#/en`, `#/projects/milan`)
 * into a clean, modern canonical path for full location.replace navigation.
 *
 * Rules:
 * - Returns null if the hash is not a legacy HashRouter route (e.g. standard section anchors #workshop, #portfolio, #team, #contact, #top).
 * - Validates against open redirects, protocol smuggling, and malformed characters.
 * - Matches ONLY known valid internal application routes.
 * - Preserves existing search queries from window.location.search or the hash itself.
 * - Preserves in-hash section anchors (e.g. `#/pt#workshop` -> `/pt/#workshop`).
 */
export function resolveLegacyHashRedirect(
    hash: string,
    currentSearch = ''
): string | null {
    if (!hash || !hash.startsWith('#/')) {
        return null;
    }

    // Strip the leading '#' to get the candidate relative path: '/pt', '/projects/milan', etc.
    const rawCandidate = hash.slice(1).trim();

    // Prevent protocol-relative URLs ('//'), backslashes ('\'), control characters, or embedded schemes
    if (
        !rawCandidate.startsWith('/') ||
        rawCandidate.startsWith('//') ||
        rawCandidate.includes('\\') ||
        [...rawCandidate].some((c) => {
            const code = c.charCodeAt(0);
            return code <= 31 || code === 127;
        }) ||
        /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(rawCandidate.slice(1))
    ) {
        return null;
    }

    let parsed: URL;
    try {
        parsed = new URL(rawCandidate, 'http://localhost');
        if (parsed.origin !== 'http://localhost') return null;
    } catch {
        return null;
    }

    let rawPath = parsed.pathname;
    // Normalize trailing slash (except root)
    if (rawPath.length > 1 && rawPath.endsWith('/')) {
        rawPath = rawPath.slice(0, -1);
    }

    // Match candidate route against known valid application routes:
    let canonicalPath: string | null = null;

    if (rawPath === '' || rawPath === '/') {
        canonicalPath = '/';
    } else if (rawPath === '/pt') {
        canonicalPath = '/pt/';
    } else if (rawPath === '/en') {
        canonicalPath = '/en/';
    } else if (rawPath === '/projects') {
        canonicalPath = '/projects';
    } else if (rawPath === '/pt/projects') {
        canonicalPath = '/pt/projects';
    } else if (rawPath === '/en/projects') {
        canonicalPath = '/en/projects';
    } else if (
        rawPath.startsWith('/projects/') ||
        rawPath.startsWith('/pt/projects/') ||
        rawPath.startsWith('/en/projects/')
    ) {
        let id = '';
        let prefix = '';
        if (rawPath.startsWith('/pt/projects/')) {
            prefix = '/pt/projects/';
            id = rawPath.slice('/pt/projects/'.length);
        } else if (rawPath.startsWith('/en/projects/')) {
            prefix = '/en/projects/';
            id = rawPath.slice('/en/projects/'.length);
        } else {
            prefix = '/projects/';
            id = rawPath.slice('/projects/'.length);
        }

        // Only allow valid slug characters (alphanumeric and hyphens)
        if (!/^[a-z0-9-]+$/i.test(id)) {
            return null;
        }

        // Verify ID exists in known projects
        const exists = ALL_PROJECTS.some((p) => p.id === id);
        if (!exists) {
            return null;
        }

        canonicalPath = `${prefix}${id}`;
    } else {
        // Not a recognized valid application route
        return null;
    }

    // Preserve and combine search queries:
    // parsed.searchParams from the hash, and currentSearch from window.location.search
    const combinedParams = new URLSearchParams();
    if (currentSearch) {
        const cleanSearch = currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch;
        const curParams = new URLSearchParams(cleanSearch);
        for (const [k, v] of curParams.entries()) {
            combinedParams.set(k, v);
        }
    }
    for (const [k, v] of parsed.searchParams.entries()) {
        combinedParams.set(k, v);
    }

    const searchString = combinedParams.toString() ? `?${combinedParams.toString()}` : '';

    // Preserve any sub-anchor inside the hash (e.g. #/pt#workshop -> hash is '#workshop')
    let subAnchor = '';
    if (parsed.hash && parsed.hash !== '#') {
        const anchorName = parsed.hash.replace(/^#+/, '');
        if (/^[a-zA-Z0-9_-]+$/.test(anchorName)) {
            subAnchor = `#${anchorName}`;
        }
    }

    return `${canonicalPath}${searchString}${subAnchor}`;
}
