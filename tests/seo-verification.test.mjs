import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// -------------------------------------------------------------
// Suite 1: Static Prerendered HTML & Artifacts Verification
// -------------------------------------------------------------
test('Suite 1: Static Files and HTML Inspection', async (t) => {
    await t.test('dist/index.html exists and has canonical English SSR content', () => {
        const filePath = path.join(distDir, 'index.html');
        assert.ok(fs.existsSync(filePath), 'dist/index.html must exist');
        const html = fs.readFileSync(filePath, 'utf8');

        assert.match(html, /<html\s+lang="en"/, 'HTML lang must be en');
        assert.match(html, /<title>O\+A Architects and Planners \| Architecture, Urbanism &amp; Research<\/title>/);
        assert.match(html, /<link rel="canonical" href="https:\/\/www\.oa-workshop\.com\/" \/>/);
        assert.match(html, /<meta name="robots" content="index, follow" \/>/);
        assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/www\.oa-workshop\.com\/en\/" \/>/);
        assert.match(html, /<link rel="alternate" hreflang="pt" href="https:\/\/www\.oa-workshop\.com\/pt\/" \/>/);
        assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/www\.oa-workshop\.com\/" \/>/);
        assert.match(html, /<script type="application\/ld\+json" data-seo="json-ld">/);

        // Verify JSON-LD is valid and parseable
        const jsonLdMatch = html.match(/<script type="application\/ld\+json" data-seo="json-ld">([\s\S]*?)<\/script>/);
        assert.ok(jsonLdMatch, 'JSON-LD tag must exist');
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        assert.equal(jsonLd['@type'], 'Organization');
        assert.equal(jsonLd.name, 'O+A Architects and Planners');
        assert.equal(jsonLd.url, 'https://www.oa-workshop.com/');
        assert.equal(jsonLd.founders.length, 2);

        // Verify SSR content inside root
        const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>/);
        assert.ok(rootMatch && rootMatch[1].trim().length > 200, 'Root must contain prerendered SSR DOM');
        assert.ok(html.includes('Osvaldo Luís'), 'Root must contain founder Osvaldo Luís');
        assert.ok(html.includes('Artur Simão'), 'Root must contain founder Artur Simão');
    });

    await t.test('dist/en/index.html exists and has /en/ canonical', () => {
        const filePath = path.join(distDir, 'en', 'index.html');
        assert.ok(fs.existsSync(filePath), 'dist/en/index.html must exist');
        const html = fs.readFileSync(filePath, 'utf8');

        assert.match(html, /<html\s+lang="en"/);
        assert.match(html, /<link rel="canonical" href="https:\/\/www\.oa-workshop\.com\/en\/" \/>/);
        assert.match(html, /<meta name="robots" content="index, follow" \/>/);
    });

    await t.test('dist/pt/index.html exists and has /pt/ canonical and Portuguese SSR content', () => {
        const filePath = path.join(distDir, 'pt', 'index.html');
        assert.ok(fs.existsSync(filePath), 'dist/pt/index.html must exist');
        const html = fs.readFileSync(filePath, 'utf8');

        assert.match(html, /<html\s+lang="pt"/, 'HTML lang must be pt');
        assert.match(html, /<title>O\+A Arquitectos e Planeadores \| Arquitectura, Urbanismo e Investigação<\/title>/);
        assert.match(html, /<link rel="canonical" href="https:\/\/www\.oa-workshop\.com\/pt\/" \/>/);
        assert.match(html, /<meta name="robots" content="index, follow" \/>/);
        assert.ok(html.includes('A nossa equipa') || html.includes('Pessoas e prática'), 'Must contain Portuguese editorial text');
    });

    await t.test('dist/projects/index.html exists and has noindex, nofollow', () => {
        const filePath = path.join(distDir, 'projects', 'index.html');
        assert.ok(fs.existsSync(filePath), 'dist/projects/index.html must exist');
        const html = fs.readFileSync(filePath, 'utf8');

        assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
        assert.match(html, /<link rel="canonical" href="https:\/\/www\.oa-workshop\.com\/en\/projects" \/>/);
    });

    await t.test('dist/404.html exists, has noindex, NO canonical, NO og:url, and NO alternates', () => {
        const filePath = path.join(distDir, '404.html');
        assert.ok(fs.existsSync(filePath), 'dist/404.html must exist');
        const html = fs.readFileSync(filePath, 'utf8');

        assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/, '404 must have noindex');
        assert.ok(!html.includes('<link rel="canonical"'), '404 must NEVER contain a canonical tag');
        assert.ok(!html.includes('property="og:url"'), '404 must NEVER contain an og:url tag');
        assert.ok(!html.includes('hreflang='), '404 must NEVER contain alternate hreflang links');
        assert.ok(!html.includes('data-seo="json-ld"'), '404 must NEVER contain JSON-LD script');
        assert.match(html, /<title>404 — Page Not Found \| O\+A<\/title>/);
    });

    await t.test('Mock projects have noindex, nofollow and localized titles', () => {
        const enMilanPath = path.join(distDir, 'projects', 'milan', 'index.html');
        assert.ok(fs.existsSync(enMilanPath), 'en milan project file must exist');
        const enHtml = fs.readFileSync(enMilanPath, 'utf8');
        assert.match(enHtml, /<meta name="robots" content="noindex, nofollow" \/>/);
        assert.match(enHtml, /<title>Milan Cultural Hub \| O\+A Architects and Planners<\/title>/);

        const ptMilanPath = path.join(distDir, 'pt', 'projects', 'milan', 'index.html');
        assert.ok(fs.existsSync(ptMilanPath), 'pt milan project file must exist');
        const ptHtml = fs.readFileSync(ptMilanPath, 'utf8');
        assert.match(ptHtml, /<meta name="robots" content="noindex, nofollow" \/>/);
        assert.match(ptHtml, /<title>Centro Cultural de Milão \| O\+A Arquitectos e Planeadores<\/title>/);
    });

    await t.test('dist/robots.txt is valid and points to sitemap', () => {
        const filePath = path.join(distDir, 'robots.txt');
        assert.ok(fs.existsSync(filePath), 'robots.txt must exist');
        const content = fs.readFileSync(filePath, 'utf8');
        assert.match(content, /User-agent:\s*\*/i);
        assert.match(content, /Allow:\s*\//i);
        assert.match(content, /Sitemap:\s*https:\/\/www\.oa-workshop\.com\/sitemap\.xml/i);
    });

    await t.test('dist/sitemap.xml is valid XML and contains exactly 3 canonical URLs', () => {
        const filePath = path.join(distDir, 'sitemap.xml');
        assert.ok(fs.existsSync(filePath), 'sitemap.xml must exist');
        const xml = fs.readFileSync(filePath, 'utf8');

        assert.match(xml, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
        assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);

        const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
        assert.equal(locs.length, 3, 'sitemap.xml must contain exactly 3 URLs');
        assert.deepEqual(locs.sort(), [
            'https://www.oa-workshop.com/',
            'https://www.oa-workshop.com/en/',
            'https://www.oa-workshop.com/pt/',
        ].sort());

        // Zero '#' in any sitemap URL
        assert.ok(!xml.includes('#'), 'sitemap.xml must never contain hash fragments');
        // Zero demo projects in sitemap
        assert.ok(!xml.includes('/projects'), 'sitemap.xml must never contain demo project URLs');
        // Zero 404 in sitemap
        assert.ok(!xml.includes('/404'), 'sitemap.xml must never contain 404 URLs');
    });
});

// -------------------------------------------------------------
// Suite 2: Metadata Generation and Transition Cleaning
// -------------------------------------------------------------
test('Suite 2: Metadata Generation and Transition Cleaning', async (t) => {
    const vite = await createServer({
        root: rootDir,
        server: { middlewareMode: true },
        appType: 'custom',
        optimizeDeps: { noDiscovery: true },
    });

    try {
        const { getPageMetadata, getNotFoundMetadata } = await vite.ssrLoadModule('/src/seo/metadata.ts');

        await t.test('Homepage returns indexable metadata with JSON-LD', () => {
            const meta = getPageMetadata('/', 'en');
            assert.equal(meta.canonical, 'https://www.oa-workshop.com/');
            assert.equal(meta.robots, 'index, follow');
            assert.equal(meta.isIndexable, true);
            assert.equal(meta.og.url, 'https://www.oa-workshop.com/');
            assert.ok(meta.jsonLd, 'Homepage must have jsonLd');
            assert.equal(meta.alternates.length, 3);
        });

        await t.test('Project catalog is noindex and has no JSON-LD', () => {
            const meta = getPageMetadata('/projects', 'en');
            assert.equal(meta.canonical, 'https://www.oa-workshop.com/en/projects');
            assert.equal(meta.robots, 'noindex, nofollow');
            assert.equal(meta.isIndexable, false);
            assert.equal(meta.jsonLd, undefined);
        });

        await t.test('Valid project returns localized title and noindex (demo)', () => {
            const metaEn = getPageMetadata('/projects/milan', 'en');
            assert.equal(metaEn.title, 'Milan Cultural Hub | O+A Architects and Planners');
            assert.equal(metaEn.robots, 'noindex, nofollow');
            assert.equal(metaEn.canonical, 'https://www.oa-workshop.com/en/projects/milan');
            assert.equal(metaEn.isIndexable, false);

            const metaPt = getPageMetadata('/pt/projects/milan', 'pt');
            assert.equal(metaPt.title, 'Centro Cultural de Milão | O+A Arquitectos e Planeadores');
            assert.equal(metaPt.robots, 'noindex, nofollow');
            assert.equal(metaPt.canonical, 'https://www.oa-workshop.com/pt/projects/milan');
            assert.equal(metaPt.isIndexable, false);
        });

        await t.test('Non-existent project strictly returns 404 metadata', () => {
            const meta = getPageMetadata('/projects/non-existent-project-xyz', 'en');
            assert.match(meta.title, /^404/);
            assert.equal(meta.canonical, '', 'Non-existent project must have empty canonical');
            assert.equal(meta.og.url, '', 'Non-existent project must have empty og:url');
            assert.equal(meta.robots, 'noindex, nofollow');
            assert.equal(meta.isIndexable, false);
            assert.deepEqual(meta.alternates, []);
            assert.equal(meta.jsonLd, undefined);
        });

        await t.test('getNotFoundMetadata strictly guarantees no canonical and no og:url', () => {
            const notFoundEn = getNotFoundMetadata('en');
            assert.equal(notFoundEn.canonical, '');
            assert.equal(notFoundEn.og.url, '');
            assert.equal(notFoundEn.robots, 'noindex, nofollow');
            assert.deepEqual(notFoundEn.alternates, []);
            assert.equal(notFoundEn.jsonLd, undefined);

            const notFoundPt = getNotFoundMetadata('pt');
            assert.equal(notFoundPt.canonical, '');
            assert.equal(notFoundPt.og.url, '');
            assert.equal(notFoundPt.robots, 'noindex, nofollow');
            assert.deepEqual(notFoundPt.alternates, []);
            assert.equal(notFoundPt.jsonLd, undefined);
        });
    } finally {
        await vite.close();
    }
});

// -------------------------------------------------------------
// Suite 3: Deterministic Language Policy & Hydration Consistency
// -------------------------------------------------------------
test('Suite 3: Deterministic Language Policy', async (t) => {
    const vite = await createServer({
        root: rootDir,
        server: { middlewareMode: true },
        appType: 'custom',
        optimizeDeps: { noDiscovery: true },
    });

    try {
        const { getInitialLanguage } = await vite.ssrLoadModule('/src/i18n.ts');

        await t.test('Root / always initializes to en regardless of localStorage', () => {
            const originalWindow = global.window;
            try {
                global.window = {
                    location: { pathname: '/', hash: '' },
                    localStorage: {
                        getItem: (key) => (key === 'oa-language' ? 'pt' : null),
                        setItem: () => {},
                    },
                };
                assert.equal(getInitialLanguage(), 'en', 'Must return en on / even if localStorage is pt');
            } finally {
                global.window = originalWindow;
            }
        });

        await t.test('/pt/ and /pt always initialize to pt regardless of localStorage', () => {
            const originalWindow = global.window;
            try {
                global.window = {
                    location: { pathname: '/pt/', hash: '' },
                    localStorage: {
                        getItem: (key) => (key === 'oa-language' ? 'en' : null),
                        setItem: () => {},
                    },
                };
                assert.equal(getInitialLanguage(), 'pt', 'Must return pt on /pt/ even if localStorage is en');

                global.window.location.pathname = '/pt';
                assert.equal(getInitialLanguage(), 'pt', 'Must return pt on /pt');
            } finally {
                global.window = originalWindow;
            }
        });

        await t.test('/en/ and /en always initialize to en regardless of localStorage', () => {
            const originalWindow = global.window;
            try {
                global.window = {
                    location: { pathname: '/en/', hash: '' },
                    localStorage: {
                        getItem: (key) => (key === 'oa-language' ? 'pt' : null),
                        setItem: () => {},
                    },
                };
                assert.equal(getInitialLanguage(), 'en', 'Must return en on /en/ even if localStorage is pt');
            } finally {
                global.window = originalWindow;
            }
        });

        await t.test('Root / initializes to en regardless of hash (deterministic pathname policy)', () => {
            const originalWindow = global.window;
            try {
                global.window = {
                    location: { pathname: '/', hash: '#/pt' },
                    localStorage: {
                        getItem: () => null,
                        setItem: () => {},
                    },
                };
                assert.equal(getInitialLanguage(), 'en', 'Must return en on / even if hash is #/pt');

                global.window.location.hash = '#workshop';
                assert.equal(getInitialLanguage(), 'en', 'Must return en on / with section anchor #workshop');
            } finally {
                global.window = originalWindow;
            }
        });
    } finally {
        await vite.close();
    }
});

// -------------------------------------------------------------
// Suite 4: Static Web Server without SPA Fallback (GitHub Pages Simulation)
// -------------------------------------------------------------
test('Suite 4: Static Server without SPA Fallback (Real HTTP Responses)', async () => {
    // MIME types map
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
    };

    // Create a strict static file server simulating GitHub Pages without SPA fallback
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        let diskPath = path.join(distDir, urlPath);

        // Normalize directory index
        if (fs.existsSync(diskPath) && fs.statSync(diskPath).isDirectory()) {
            if (!urlPath.endsWith('/')) {
                // GitHub Pages directory redirect: 301 to trailing slash
                res.writeHead(301, { Location: `${urlPath}/` });
                res.end();
                return;
            }
            diskPath = path.join(diskPath, 'index.html');
        }

        if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
            const ext = path.extname(diskPath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(diskPath).pipe(res);
        } else {
            // Strictly return 404 without SPA rewrite!
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
        }
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
        // Helper to perform HTTP GET
        const fetchHttp = (path) => {
            return new Promise((resolve, reject) => {
                http.get(`${baseUrl}${path}`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () =>
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data,
                        })
                    );
                }).on('error', reject);
            });
        };

        // 1. Root /
        const resRoot = await fetchHttp('/');
        assert.equal(resRoot.statusCode, 200);
        assert.match(resRoot.headers['content-type'], /text\/html/);
        assert.ok(resRoot.data.includes('O+A Architects and Planners'));

        // 2. Localized /en/
        const resEn = await fetchHttp('/en/');
        assert.equal(resEn.statusCode, 200);
        assert.match(resEn.headers['content-type'], /text\/html/);

        // 3. Localized /pt/
        const resPt = await fetchHttp('/pt/');
        assert.equal(resPt.statusCode, 200);
        assert.match(resPt.headers['content-type'], /text\/html/);
        assert.ok(resPt.data.includes('A nossa equipa') || resPt.data.includes('Pessoas e prática'));

        // 4. Projects catalog /projects/
        const resProjects = await fetchHttp('/projects/');
        assert.equal(resProjects.statusCode, 200);
        assert.ok(resProjects.data.includes('noindex, nofollow'));

        // 5. Directory without trailing slash /projects -> 301 to /projects/
        const resProjectsNoSlash = await fetchHttp('/projects');
        assert.equal(resProjectsNoSlash.statusCode, 301);
        assert.equal(resProjectsNoSlash.headers['location'], '/projects/');

        // 6. Project detail /projects/milan/
        const resMilan = await fetchHttp('/projects/milan/');
        assert.equal(resMilan.statusCode, 200);
        assert.ok(resMilan.data.includes('Milan Cultural Hub'));

        // 7. Portuguese project detail /pt/projects/milan/
        const resPtMilan = await fetchHttp('/pt/projects/milan/');
        assert.equal(resPtMilan.statusCode, 200);
        assert.ok(resPtMilan.data.includes('Centro Cultural de Milão'));

        // 8. Robots.txt
        const resRobots = await fetchHttp('/robots.txt');
        assert.equal(resRobots.statusCode, 200);
        assert.match(resRobots.headers['content-type'], /text\/plain/);

        // 9. Sitemap.xml
        const resSitemap = await fetchHttp('/sitemap.xml');
        assert.equal(resSitemap.statusCode, 200);
        assert.match(resSitemap.headers['content-type'], /application\/xml/);

        // 10. Non-existent path returns real HTTP 404
        const resNonExistent = await fetchHttp('/unknown-unmapped-route-xyz');
        assert.equal(resNonExistent.statusCode, 404, 'Must return HTTP 404 on unmapped route');
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

// -------------------------------------------------------------
// Suite 5: Legacy HashRouter Resolution and Redirection
// -------------------------------------------------------------
test('Suite 5: Legacy HashRouter Resolution and Redirection', async (t) => {
    const vite = await createServer({
        root: rootDir,
        server: { middlewareMode: true },
        appType: 'custom',
        optimizeDeps: { noDiscovery: true },
    });

    try {
        const { resolveLegacyHashRedirect } = await vite.ssrLoadModule('/src/seo/routes.ts');

        await t.test('Resolves language home routes', () => {
            assert.equal(resolveLegacyHashRedirect('#/pt'), '/pt/');
            assert.equal(resolveLegacyHashRedirect('#/en'), '/en/');
            assert.equal(resolveLegacyHashRedirect('#/pt/'), '/pt/');
            assert.equal(resolveLegacyHashRedirect('#/en/'), '/en/');
            assert.equal(resolveLegacyHashRedirect('#/'), '/');
        });

        await t.test('Resolves project catalog routes', () => {
            assert.equal(resolveLegacyHashRedirect('#/projects'), '/projects');
            assert.equal(resolveLegacyHashRedirect('#/projects/'), '/projects');
            assert.equal(resolveLegacyHashRedirect('#/pt/projects'), '/pt/projects');
            assert.equal(resolveLegacyHashRedirect('#/en/projects'), '/en/projects');
        });

        await t.test('Resolves valid project detail routes', () => {
            assert.equal(resolveLegacyHashRedirect('#/projects/milan'), '/projects/milan');
            assert.equal(resolveLegacyHashRedirect('#/pt/projects/milan'), '/pt/projects/milan');
            assert.equal(resolveLegacyHashRedirect('#/en/projects/milan'), '/en/projects/milan');
            assert.equal(resolveLegacyHashRedirect('#/projects/karlatornet'), '/projects/karlatornet');
        });

        await t.test('Preserves search parameters from hash and window.location.search', () => {
            assert.equal(resolveLegacyHashRedirect('#/projects?cat=arch'), '/projects?cat=arch');
            assert.equal(resolveLegacyHashRedirect('#/pt', '?ref=campaign'), '/pt/?ref=campaign');
            assert.equal(resolveLegacyHashRedirect('#/projects?cat=arch', '?ref=campaign'), '/projects?ref=campaign&cat=arch');
        });

        await t.test('Preserves sub-anchors inside legacy hash', () => {
            assert.equal(resolveLegacyHashRedirect('#/pt#workshop'), '/pt/#workshop');
            assert.equal(resolveLegacyHashRedirect('#/en#contact'), '/en/#contact');
        });

        await t.test('Rejects legitimate website section anchors (returns null)', () => {
            assert.equal(resolveLegacyHashRedirect('#workshop'), null);
            assert.equal(resolveLegacyHashRedirect('#portfolio'), null);
            assert.equal(resolveLegacyHashRedirect('#team'), null);
            assert.equal(resolveLegacyHashRedirect('#contact'), null);
            assert.equal(resolveLegacyHashRedirect('#top'), null);
        });

        await t.test('Rejects malformed, protocol smuggling, or unknown routes (returns null)', () => {
            assert.equal(resolveLegacyHashRedirect(''), null);
            assert.equal(resolveLegacyHashRedirect('#'), null);
            assert.equal(resolveLegacyHashRedirect('#pt'), null);
            assert.equal(resolveLegacyHashRedirect('#/unknown-route-xyz'), null);
            assert.equal(resolveLegacyHashRedirect('#/projects/non-existent-id'), null);
            assert.equal(resolveLegacyHashRedirect('#//evil.com'), null);
            assert.equal(resolveLegacyHashRedirect('#/https://evil.com'), null);
            assert.equal(resolveLegacyHashRedirect('#/\\evil.com'), null);
            assert.equal(resolveLegacyHashRedirect('#/javascript:alert(1)'), null);
        });
    } finally {
        await vite.close();
    }
});
