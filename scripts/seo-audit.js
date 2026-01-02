import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { JSDOM } from 'jsdom';

async function auditSEO() {
    const siteDir = '_site';
    if (!fs.existsSync(siteDir)) {
        process.stderr.write('Error: _site directory not found. Run jekyll build first.\n');
        process.exit(1);
    }

    const files = await glob(`${siteDir}/**/*.html`);
    let errors = 0;
    let warnings = 0;

    process.stdout.write(`Auditing ${files.length} HTML files...\n`);

    for (const file of files) {
        const html = fs.readFileSync(file, 'utf8');
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const relativePath = path.relative(siteDir, file);

        // 1. Title Presence
        const title = doc.querySelector('title');
        if (!title || !title.textContent) {
            process.stderr.write(`[ERROR] ${relativePath}: Missing <title> tag\n`);
            errors++;
        }

        // 2. Canonical Tag
        const canonical = doc.querySelector('link[rel="canonical"]');
        if (!canonical) {
            process.stderr.write(`[ERROR] ${relativePath}: Missing rel="canonical" tag\n`);
            errors++;
        }

        // 3. Meta Description
        const description = doc.querySelector('meta[name="description"]');
        if (!description || !description.getAttribute('content')) {
            process.stdout.write(`[WARN] ${relativePath}: Missing meta description\n`);
            warnings++;
        }

        // 3. Duplicate H1s
        const h1s = doc.querySelectorAll('h1');
        if (h1s.length > 1) {
            process.stdout.write(`[WARN] ${relativePath}: Multiple H1 tags found (${h1s.length})\n`);
            warnings++;
        } else if (h1s.length === 0) {
            process.stdout.write(`[WARN] ${relativePath}: No H1 tag found\n`);
            warnings++;
        }

        // 4. Missing Alt Text
        const images = doc.querySelectorAll('amp-img, img');
        for (const img of images) {
            if (!img.getAttribute('alt')) {
                const src = img.getAttribute('src') ?? 'unknown';
                process.stdout.write(`[WARN] ${relativePath}: Missing alt text on ${img.tagName} (src: ${src})\n`);
                warnings++;
            }
        }

        // 5. JSON-LD Graph
        const schema = doc.querySelector('script[type="application/ld+json"]');
        if (!schema) {
            process.stdout.write(`[WARN] ${relativePath}: Missing JSON-LD structured data\n`);
            warnings++;
        }
    }

    process.stdout.write('\n--- Audit Results ---\n');
    process.stdout.write(`Files Processed: ${String(files.length)}\n`);
    process.stdout.write(`Errors: ${String(errors)} (Critical SEO issues)\n`);
    process.stdout.write(`Warnings: ${String(warnings)} (Best practice recommendations)\n`);

    if (errors > 0) {
        process.exit(1);
    }
}

try {
    await auditSEO();
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${errorMessage}\n`);
    process.exit(1);
}
