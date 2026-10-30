import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPageMetadata } from './metadata';
import type { SupportedLanguage } from './routes';

interface DocumentHeadProps {
    dynamicTitle?: string;
}

function setOrCreateMeta(name: string, content: string | undefined, isProperty = false) {
    const attribute = isProperty ? 'property' : 'name';
    const element = document.head.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
    if (!content) {
        if (element) element.remove();
        return;
    }
    let target = element;
    if (!target) {
        target = document.createElement('meta');
        target.setAttribute(attribute, name);
        document.head.appendChild(target);
    }
    target.content = content;
}

function setOrCreateLink(rel: string, href: string, hreflang?: string) {
    const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
    const element = document.head.querySelector(selector) as HTMLLinkElement | null;
    if (!href) {
        if (element) element.remove();
        return;
    }
    let target = element;
    if (!target) {
        target = document.createElement('link');
        target.rel = rel;
        if (hreflang) target.hreflang = hreflang;
        document.head.appendChild(target);
    }
    target.href = href;
}

export default function DocumentHead({ dynamicTitle }: DocumentHeadProps) {
    const location = useLocation();
    const { i18n } = useTranslation();
    const activeLang = (i18n.resolvedLanguage === 'pt' ? 'pt' : 'en') as SupportedLanguage;

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const metadata = getPageMetadata(location.pathname, activeLang, dynamicTitle);

        // 1. Title & HTML lang
        document.title = metadata.title;
        document.documentElement.lang = metadata.lang;

        // 2. Standard Meta
        setOrCreateMeta('description', metadata.description);
        setOrCreateMeta('robots', metadata.robots);

        // 3. Canonical (removed when empty, e.g. on 404)
        setOrCreateLink('canonical', metadata.canonical);

        // 4. Alternates (clean up old ones and add current; empty on 404)
        document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
        metadata.alternates.forEach((alt) => {
            setOrCreateLink('alternate', alt.href, alt.hrefLang);
        });

        // 5. Open Graph (og:url is cleanly removed if empty)
        setOrCreateMeta('og:title', metadata.og.title, true);
        setOrCreateMeta('og:description', metadata.og.description, true);
        setOrCreateMeta('og:url', metadata.og.url, true);
        setOrCreateMeta('og:type', metadata.og.type, true);
        setOrCreateMeta('og:image', metadata.og.image, true);
        setOrCreateMeta('og:image:width', String(metadata.og.imageWidth), true);
        setOrCreateMeta('og:image:height', String(metadata.og.imageHeight), true);
        setOrCreateMeta('og:image:alt', metadata.og.imageAlt, true);
        setOrCreateMeta('og:locale', metadata.og.locale, true);
        setOrCreateMeta('og:locale:alternate', metadata.og.localeAlternate, true);
        setOrCreateMeta('og:site_name', metadata.og.siteName, true);

        // 6. Twitter
        setOrCreateMeta('twitter:card', metadata.twitter.card);
        setOrCreateMeta('twitter:title', metadata.twitter.title);
        setOrCreateMeta('twitter:description', metadata.twitter.description);
        setOrCreateMeta('twitter:image', metadata.twitter.image);
        setOrCreateMeta('twitter:image:alt', metadata.twitter.imageAlt);

        // 7. Structured Data (JSON-LD)
        const existingJsonLd = document.head.querySelector('script[data-seo="json-ld"]');
        if (metadata.jsonLd) {
            let script = existingJsonLd as HTMLScriptElement | null;
            if (!script) {
                script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-seo', 'json-ld');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(metadata.jsonLd);
        } else if (existingJsonLd) {
            existingJsonLd.remove();
        }
    }, [location.pathname, activeLang, dynamicTitle]);

    return null;
}
