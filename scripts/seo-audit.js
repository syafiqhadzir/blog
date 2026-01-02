import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { JSDOM } from 'jsdom';

async function auditSEO() {
    const siteDir = '_site';
    if (!fs.existsSync(siteDir)) {
        // eslint-disable-next-line no-console
        console.error('Error: _site directory not found. Run jekyll build first.');
        process.exit(1);
    }

    const files = await glob(`${siteDir}/**/*.html`);
    let errors = 0;
    let warnings = 0;

    // eslint-disable-next-line no-console
    console.log(`Auditing ${files.length} HTML files...`);

    for (const file of files) {
        const html = fs.readFileSync(file, 'utf8');
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const relativePath = path.relative(siteDir, file);

        // 1. Title Presence
        const title = doc.querySelector('title');
        if (!title || !title.textContent) {
            // eslint-disable-next-line no-console
            console.error(`[ERROR] ${relativePath}: Missing <title> tag`);
            errors++;
        }

        // 2. Canonical Tag
        const canonical = doc.querySelector('link[rel="canonical"]');
        if (!canonical) {
            // eslint-disable-next-line no-console
            console.error(`[ERROR] ${relativePath}: Missing rel="canonical" tag`);
            errors++;
        }

        // 3. Duplicate H1s
        const h1s = doc.querySelectorAll('h1');
        if (h1s.length > 1) {
            // eslint-disable-next-line no-console
            console.warn(`[WARN] ${relativePath}: Multiple H1 tags found (${h1s.length})`);
            warnings++;
        } else if (h1s.length === 0) {
            // eslint-disable-next-line no-console
            console.warn(`[WARN] ${relativePath}: No H1 tag found`);
            warnings++;
        }

        // 4. Missing Alt Text
        const images = doc.querySelectorAll('amp-img, img');
        images.forEach((img) => {
            if (!img.getAttribute('alt')) {
                // eslint-disable-next-line no-console
                console.warn(
                    `[WARN] ${relativePath}: Missing alt text on ${img.tagName} (src: ${img.getAttribute('src')})`,
                );
                warnings++;
            }
        });

        // 5. JSON-LD Graph
        const schema = doc.querySelector('script[type="application/ld+json"]');
        if (!schema) {
            // eslint-disable-next-line no-console
            console.warn(`[WARN] ${relativePath}: Missing JSON-LD structured data`);
            warnings++;
        }
    }

    // eslint-disable-next-line no-console
    console.log('\n--- Audit Results ---');
    // eslint-disable-next-line no-console
    console.log(`Files Processed: ${files.length}`);
    // eslint-disable-next-line no-console
    console.log(`Errors: ${errors} (Critical SEO issues)`);
    // eslint-disable-next-line no-console
    console.log(`Warnings: ${warnings} (Best practice recommendations)`);

    if (errors > 0) {
        process.exit(1);
    }
}

(async () => {
    try {
        await auditSEO();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    }
})();
