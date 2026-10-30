import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

async function main() {
    console.log('🚀 Starting static pre-rendering...');

    const templatePath = path.resolve(distDir, 'index.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error('dist/index.html not found. Run "vite build" first.');
    }
    const template = fs.readFileSync(templatePath, 'utf8');

    const vite = await createServer({
        root: rootDir,
        server: { middlewareMode: true },
        appType: 'custom',
    });

    try {
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
        const { ALL_PROJECTS } = await vite.ssrLoadModule('/src/data/projects.ts');

        // Route definitions
        const routes = [
            { path: '/', outPath: 'index.html' },
            { path: '/en/', outPath: 'en/index.html' },
            { path: '/pt/', outPath: 'pt/index.html' },
            { path: '/projects', outPath: 'projects/index.html' },
            { path: '/en/projects', outPath: 'en/projects/index.html' },
            { path: '/pt/projects', outPath: 'pt/projects/index.html' },
            { path: '/404', outPath: '404.html' },
        ];

        // Add mock projects (each with en, pt, and default)
        for (const p of ALL_PROJECTS) {
            routes.push({
                path: `/projects/${p.id}`,
                outPath: `projects/${p.id}/index.html`,
            });
            routes.push({
                path: `/en/projects/${p.id}`,
                outPath: `en/projects/${p.id}/index.html`,
            });
            routes.push({
                path: `/pt/projects/${p.id}`,
                outPath: `pt/projects/${p.id}/index.html`,
            });
        }

        console.log(`📄 Pre-rendering ${routes.length} static routes...`);

        const indexableUrls = [];

        for (const route of routes) {
            const { html, metadata } = await render(route.path);

            let page = template;

            // 1. Inject rendered HTML into root
            page = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

            // 2. HTML lang attribute
            page = page.replace(/<html\s+lang="[^"]*"/, `<html lang="${metadata.lang}"`);

            // 3. Document Title
            page = page.replace(
                /<title>[\s\S]*?<\/title>/,
                `<title>${escapeHtml(metadata.title)}</title>`
            );

            // 4. Clean existing replaceable SEO tags from template head
            page = page.replace(/<meta\s+name="description"[^>]*\/?>/gi, '');
            page = page.replace(/<meta\s+name="robots"[^>]*\/?>/gi, '');
            page = page.replace(/<link\s+rel="canonical"[^>]*\/?>/gi, '');
            page = page.replace(/<link\s+rel="alternate"[^>]*\/?>/gi, '');
            page = page.replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/gi, '');
            page = page.replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>/gi, '');

            // 5. Construct new SEO tags block
            const seoTags = [];

            seoTags.push(`<meta name="description" content="${escapeHtml(metadata.description)}" />`);
            seoTags.push(`<meta name="robots" content="${metadata.robots}" />`);

            if (metadata.canonical) {
                seoTags.push(`<link rel="canonical" href="${metadata.canonical}" />`);
            }

            for (const alt of metadata.alternates) {
                seoTags.push(`<link rel="alternate" hreflang="${alt.hrefLang}" href="${alt.href}" />`);
            }

            // Open Graph
            seoTags.push(`<meta property="og:title" content="${escapeHtml(metadata.og.title)}" />`);
            seoTags.push(`<meta property="og:description" content="${escapeHtml(metadata.og.description)}" />`);
            seoTags.push(`<meta property="og:type" content="${metadata.og.type}" />`);
            if (metadata.og.url) {
                seoTags.push(`<meta property="og:url" content="${metadata.og.url}" />`);
            }
            seoTags.push(`<meta property="og:image" content="${metadata.og.image}" />`);
            seoTags.push(`<meta property="og:image:width" content="${metadata.og.imageWidth}" />`);
            seoTags.push(`<meta property="og:image:height" content="${metadata.og.imageHeight}" />`);
            seoTags.push(`<meta property="og:image:alt" content="${escapeHtml(metadata.og.imageAlt)}" />`);
            seoTags.push(`<meta property="og:locale" content="${metadata.og.locale}" />`);
            seoTags.push(`<meta property="og:locale:alternate" content="${metadata.og.localeAlternate}" />`);
            seoTags.push(`<meta property="og:site_name" content="${escapeHtml(metadata.og.siteName)}" />`);

            // Twitter
            seoTags.push(`<meta name="twitter:card" content="${metadata.twitter.card}" />`);
            seoTags.push(`<meta name="twitter:title" content="${escapeHtml(metadata.twitter.title)}" />`);
            seoTags.push(`<meta name="twitter:description" content="${escapeHtml(metadata.twitter.description)}" />`);
            seoTags.push(`<meta name="twitter:image" content="${metadata.twitter.image}" />`);
            seoTags.push(`<meta name="twitter:image:alt" content="${escapeHtml(metadata.twitter.imageAlt)}" />`);

            // JSON-LD
            if (metadata.jsonLd) {
                seoTags.push(
                    `<script type="application/ld+json" data-seo="json-ld">${JSON.stringify(metadata.jsonLd)}</script>`
                );
            }

            // Inject after <head>
            page = page.replace(
                /<head>/i,
                `<head>\n  ${seoTags.join('\n  ')}`
            );

            // Write target file
            const destPath = path.resolve(distDir, route.outPath);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.writeFileSync(destPath, page, 'utf8');

            if (metadata.isIndexable && metadata.canonical) {
                indexableUrls.push({
                    loc: metadata.canonical,
                    alternates: metadata.alternates,
                });
            }
        }

        // Deduplicate indexable URLs for sitemap
        const sitemapMap = new Map();
        for (const item of indexableUrls) {
            if (!sitemapMap.has(item.loc)) {
                sitemapMap.set(item.loc, item);
            }
        }
        const sitemapEntries = Array.from(sitemapMap.values());

        // 6. Generate sitemap.xml
        const sitemapXml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
            '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
            ...sitemapEntries.map((entry) => {
                const alternatesXml = entry.alternates
                    .map(
                        (alt) =>
                            `    <xhtml:link rel="alternate" hreflang="${alt.hrefLang}" href="${alt.href}" />`
                    )
                    .join('\n');
                return `  <url>\n    <loc>${entry.loc}</loc>\n${alternatesXml}\n  </url>`;
            }),
            '</urlset>',
            '',
        ].join('\n');

        const sitemapDest = path.resolve(distDir, 'sitemap.xml');
        fs.writeFileSync(sitemapDest, sitemapXml, 'utf8');
        console.log(`🗺️ Generated sitemap.xml with ${sitemapEntries.length} canonical URLs.`);

        console.log('✅ Static pre-rendering completed successfully!');
    } finally {
        await vite.close();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

main().catch((err) => {
    console.error('❌ Prerender failed:', err);
    process.exit(1);
});
