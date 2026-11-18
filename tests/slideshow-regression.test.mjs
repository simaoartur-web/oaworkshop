import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const readSrc = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

test('Slideshow regression invariants (Plan 136)', async (t) => {
    const workshopSrc = readSrc('src/components/home/WorkshopSection.tsx');
    const tabsSrc = readSrc('src/components/home/WorkshopTabs.tsx');
    const cssSrc = readSrc('src/components/home/workshop.css');
    const enSrc = readSrc('src/locales/en.ts');
    const ptSrc = readSrc('src/locales/pt.ts');

    await t.test('Timer duration is exported as exactly 12000ms (12 seconds)', async () => {
        const vite = await createServer({
            root: rootDir,
            server: { middlewareMode: true, hmr: false },
            appType: 'custom',
            optimizeDeps: { noDiscovery: true },
        });
        try {
            const mod = await vite.ssrLoadModule('/src/components/home/WorkshopSection.tsx');
            assert.equal(mod.SLIDE_DURATION_MS, 12000);
        } finally {
            await vite.close();
        }
    });

    await t.test('Zero Play/Pause UI, state, icons, CSS, or locale keys exist', () => {
        assert.doesNotMatch(workshopSrc, /\b(Play|Pause)\b/);
        assert.doesNotMatch(workshopSrc, /isPlaying|togglePlayPause|workshop-nav-btn-playback/);
        assert.doesNotMatch(cssSrc, /workshop-nav-btn-playback/);
        assert.doesNotMatch(enSrc, /playSlideshow|pauseSlideshow/);
        assert.doesNotMatch(ptSrc, /playSlideshow|pauseSlideshow/);
    });

    await t.test('Autoplay does not suspend on hover, focus, or idle timers', () => {
        assert.doesNotMatch(workshopSrc, /isHovered|isFocused|isKeyboardFocused|idleTimer|onPointerEnter|onMouseEnter|onFocusCapture/);
        assert.match(workshopSrc, /const canAutoRotate = !reducedMotion && pageVisible && inViewport;/);
    });

    await t.test('Manual navigation restarts the 12-second cycle cleanly', () => {
        assert.match(workshopSrc, /const selectArea = \(id: WorkshopAreaId\) => \{\s*setCycleId\(\(value\) => value \+ 1\);/);
        assert.match(workshopSrc, /const selectPrevious = \(\) => \{\s*setCycleId\(\(value\) => value \+ 1\);/);
        assert.match(workshopSrc, /const selectNext = \(\) => \{\s*setCycleId\(\(value\) => value \+ 1\);/);
        assert.match(tabsSrc, /onSelect\(nextItem\.id\)/);
    });

    await t.test('Continuous timeline bar and reduced-motion/visibility safeguards are intact', () => {
        assert.match(workshopSrc, /visibilitychange/);
        assert.match(workshopSrc, /useReducedMotion/);
        assert.match(tabsSrc, /workshop-tab-line-fill/);
        assert.match(tabsSrc, /--workshop-slide-duration/);
        assert.match(cssSrc, /@keyframes workshop-timeline-fill/);
        assert.match(cssSrc, /@media \(prefers-reduced-motion: reduce\)/);
    });

    await t.test('Prerendered HTML renders 3 tabs, 2 arrow controls, continuous line fills, and zero Play/Pause', () => {
        for (const rel of ['index.html', 'en/index.html', 'pt/index.html']) {
            const html = fs.readFileSync(path.join(distDir, rel), 'utf8');
            assert.ok(html.includes('id="workshop"'), `${rel} must include #workshop`);
            assert.equal((html.match(/role="tab"/g) || []).length, 3, `${rel} must render 3 tabs`);
            assert.equal((html.match(/workshop-tab-line-fill/g) || []).length, 3, `${rel} must render 3 progress segments`);
            assert.ok(html.includes('--workshop-slide-duration:12000ms'), `${rel} must embed 12000ms duration`);
            assert.ok(!html.includes('workshop-nav-btn-playback'), `${rel} must not contain Play/Pause button`);
            assert.ok(!/Pause slideshow|Play slideshow|Pausar slides|Reproduzir slides/i.test(html), `${rel} must not contain playback labels`);
        }
    });
});
