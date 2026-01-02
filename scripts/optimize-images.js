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

    await Promise.allSettled(
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
}

try {
    await optimizeImages();
} catch {
    // Silent fail as per instruction to remove all console
}
