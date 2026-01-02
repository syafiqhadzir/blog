import { glob } from 'glob';
import { minify } from 'html-minifier-terser';
import { promises as fs } from 'node:fs';

/**
 * Minifies all HTML files in the _site directory using html-minifier-terser.
 * Optimized for AMP compliance and payload reduction.
 */
const minifyFiles = async () => {
    const files = await glob('_site/**/*.html');

    const minifyOptions = {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
    };

    const results = await Promise.allSettled(
        files.map(async (file) => {
            const content = await fs.readFile(file, 'utf8');
            const minified = await minify(content, minifyOptions);
            await fs.writeFile(file, minified);
        }),
    );

    const errors = results.filter((result) => result.status === 'rejected');
    if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ Minification failed for ${errors.length} files. Skipping those.`);
    }
};

await minifyFiles();
