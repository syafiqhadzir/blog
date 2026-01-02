import { glob } from 'glob';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { optimize } from 'svgo';

/**
 * Optimizes JPEG, PNG, and SVG images using sharp and svgo.
 * Designed as a modern, high-performance replacement for imagemin.
 */
async function optimizeImages() {
    const images = await glob('img/**/*.{jpg,jpeg,png,svg}', { absolute: true });
    images.push(path.resolve('logo.png'));

    // eslint-disable-next-line no-console
    console.log(`🚀 Optimizing ${images.length} images...`);

    const results = await Promise.allSettled(
        images.map(async (filepath) => {
            const extension = path.extname(filepath).toLowerCase();
            const data = await fs.readFile(filepath);

            if (extension === '.svg') {
                const result = optimize(data.toString(), {
                    multipass: true,
                    path: filepath,
                });
                await fs.writeFile(filepath, result.data);
            } else if (['.jpeg', '.jpg', '.png'].includes(extension)) {
                const pipeline =
                    extension === '.png'
                        ? sharp(data).png({ palette: true, quality: 80 })
                        : sharp(data).jpeg({ progressive: true, quality: 80 });

                await pipeline.toFile(filepath + '.tmp');
                await fs.rename(filepath + '.tmp', filepath);
            }
        }),
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
        // eslint-disable-next-line no-console
        console.error(`❌ Failed to optimize ${failures.length} images.`);
        for (const failure of failures) {
            // eslint-disable-next-line no-console
            console.error(failure.reason);
        }
    } else {
        // eslint-disable-next-line no-console
        console.log('✅ Image optimization complete.');
    }
}

try {
    await optimizeImages();
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
}
