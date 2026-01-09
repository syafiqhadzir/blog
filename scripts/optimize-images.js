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

  const QUALITY = 80;

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
            ? sharp(data).png({ palette: true, quality: QUALITY })
            : sharp(data).jpeg({ progressive: true, quality: QUALITY });

        await pipeline.toFile(filepath + '.tmp');
        await fs.rename(filepath + '.tmp', filepath);

        // Generate WebP version
        await sharp(data)
          .webp({ quality: QUALITY })
          .toFile(filepath.replace(extension, '.webp'));
      }
    }),
  );
}

try {
  await optimizeImages();
} catch (error) {
  process.stderr.write(`Image optimization failed: ${String(error)}\n`);

  process.exit(1);
}
