import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const imagesDir = path.resolve(rootDir, 'public', 'images');

const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

function getAllImageFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getAllImageFiles(fullPath));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (EXTENSIONS.has(ext)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function optimizeImages() {
    console.log('🖼️  Starting automatic image optimization with Sharp...');
    const files = getAllImageFiles(imagesDir);
    console.log(`Found ${files.length} raster photographs to process in ${imagesDir}`);

    let totalOriginalBytes = 0;
    let totalOptimizedBytes = 0;
    let convertedCount = 0;

    for (const filePath of files) {
        const parsed = path.parse(filePath);
        const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);
        const origStat = fs.statSync(filePath);
        totalOriginalBytes += origStat.size;

        // Check if WebP already exists and is newer than source
        let shouldProcess = true;
        if (fs.existsSync(webpPath)) {
            const webpStat = fs.statSync(webpPath);
            if (webpStat.mtimeMs >= origStat.mtimeMs && webpStat.size > 0) {
                shouldProcess = false;
                totalOptimizedBytes += webpStat.size;
            }
        }

        if (shouldProcess) {
            try {
                const image = sharp(filePath);
                const metadata = await image.metadata();

                // High-fidelity webp conversion
                await image
                    .webp({
                        quality: 84,
                        effort: 6,
                        reductionEffort: 6,
                    })
                    .toFile(webpPath);

                const newStat = fs.statSync(webpPath);
                totalOptimizedBytes += newStat.size;
                convertedCount++;

                const savedPct = (((origStat.size - newStat.size) / origStat.size) * 100).toFixed(1);
                console.log(
                    `  ✓ ${path.relative(rootDir, filePath)}: ${formatBytes(origStat.size)} → ${formatBytes(newStat.size)} (-${savedPct}%) [${metadata.width}x${metadata.height}]`
                );
            } catch (err) {
                console.error(`  ✗ Failed to optimize ${filePath}:`, err.message);
                totalOptimizedBytes += origStat.size;
            }
        }
    }

    const totalSavedBytes = totalOriginalBytes - totalOptimizedBytes;
    const overallPct = totalOriginalBytes > 0
        ? ((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1)
        : 0;

    console.log('----------------------------------------------------');
    console.log(`Optimization summary:`);
    console.log(`  Processed: ${convertedCount} updated, ${files.length} total`);
    console.log(`  Original size:  ${formatBytes(totalOriginalBytes)}`);
    console.log(`  Optimized size: ${formatBytes(totalOptimizedBytes)}`);
    console.log(`  Data saved:     ${formatBytes(totalSavedBytes)} (${overallPct}% reduction)`);
    console.log('----------------------------------------------------');
}

optimizeImages().catch((err) => {
    console.error('Image optimization failed:', err);
    process.exit(1);
});
