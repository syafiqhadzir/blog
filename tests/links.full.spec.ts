import type { Page } from '@playwright/test';

import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

// Helper function to check if link exists
function checkLinkExists(link: string, routeSet: Set<string>): boolean {
    const candidates = [
        link,
        link + '.html',
        link.replace(/\/$/, '') + '.html',
        link.replace(/\/$/, '') + '/index.html',
    ];

    return candidates.some((c) => routeSet.has(c) || routeSet.has(c + 'index.html'));
}

// Helper function to extract links from a page
async function extractLinksFromPage(page: Page, baseUrl: string): Promise<string[]> {
    const selector = `a[href^="/"], a[href^="${baseUrl}"]`;
    const hrefs = await page
        .locator(selector)
        .evaluateAll((links: Element[]) => links.map((a: Element) => (a as HTMLAnchorElement).getAttribute('href')));

    const normalized: string[] = [];
    for (const href of hrefs) {
        if (href) {
            const clean = normalizeUrl(href);
            if (clean) normalized.push(clean);
        }
    }
    return normalized;
}

// Helper function to normalize URLs
function normalizeUrl(href: string): string {
    let clean: string = href.split('#')[0] ?? '';
    if (clean.endsWith('index.html')) clean = clean.replace('index.html', '');

    // Safe concatenation
    if (!clean.endsWith('/') && !clean.endsWith('.html') && !clean.includes('.')) {
        clean += '/';
    }

    if (clean.startsWith('http')) {
        try {
            const urlObject = new URL(clean);
            clean = urlObject.pathname;
        } catch {
            // ignore invalid urls
        }
    }

    if (!clean.startsWith('/')) clean = '/' + clean;

    return clean;
}

test.describe('Internal Link Validation', { tag: ['@full', '@links'] }, () => {
    test('Crawl and validate all internal links', async ({ getAllInternalRoutes, page }) => {
        const routes = await getAllInternalRoutes();
        const brokenLinks: string[] = [];
        const allFoundLinks = new Set<string>();

        // Extract all links from all pages
        for (const route of routes) {
            await page.goto(route, { waitUntil: 'domcontentloaded' });
            const links = await extractLinksFromPage(page, process.env['BASE_URL'] ?? '');
            for (const link of links) {
                allFoundLinks.add(link);
            }
        }

        // Build route set for validation
        const routeSet = new Set(
            routes.map((r) => {
                let clean = r;
                if (clean.endsWith('index.html')) clean = clean.replace('index.html', '');
                return clean;
            }),
        );

        // Validate all found links
        for (const link of allFoundLinks) {
            if (!checkLinkExists(link, routeSet)) {
                const response = await page.request.head(link);
                if (response.status() === 404) {
                    brokenLinks.push(link);
                }
            }
        }

        expect(brokenLinks).toHaveLength(0);
    });
});
