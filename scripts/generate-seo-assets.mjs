import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDir = fileURLToPath(new URL('../', import.meta.url));

// Maintenance command: node scripts/generate-seo-assets.mjs (Plan 082, D1/D3).
// The original logo and institutional photograph are never overwritten.
async function generateSeoAssets() {
    const mark = await sharp(path.join(rootDir, 'public/logo.png'))
        .resize(160, 160, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer({ resolveWithObject: true });

    await sharp({
        create: {
            width: 192,
            height: 192,
            channels: 4,
            background: '#FFFFFF',
        },
    })
        .composite([{
            input: mark.data,
            left: Math.floor((192 - mark.info.width) / 2),
            top: Math.floor((192 - mark.info.height) / 2),
        }])
        .png()
        .toFile(path.join(rootDir, 'public/favicon.png'));

    // A neutral unavailable-image marker, never a depiction of a project.
    const placeholder = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
            <rect width="1200" height="630" fill="#F5F5F5"/>
            <g fill="none" stroke="#9E9E9E" stroke-width="3" stroke-linecap="round">
                <rect x="554" y="280" width="92" height="70" rx="2"/>
                <path d="M550 354L650 276"/>
            </g>
        </svg>
    `);
    await sharp(placeholder)
        .png()
        .toFile(path.join(rootDir, 'public/images/project-placeholder.png'));

    console.log('Generated favicon.png (192x192) and project-placeholder.png (1200x630).');
}

generateSeoAssets().catch((error) => {
    console.error('SEO asset generation failed:', error);
    process.exitCode = 1;
});
