import { expect, test } from '@playwright/test';

test.describe('RSS Feed', () => {
    test.describe.configure({ mode: 'parallel' });
    test('feed.xml exists and returns valid response', async ({ request }) => {
        const response = await request.get('/feed.xml');
        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('xml');
    });

    test('feed.xml has valid XML structure', async ({ request }) => {
        const response = await request.get('/feed.xml');
        const content = await response.text();

        // Check for RSS/Atom feed elements
        expect(content).toContain('<?xml');
        expect(content).toMatch(/<feed|<rss/);
    });

    test('feed contains required elements', async ({ request }) => {
        const response = await request.get('/feed.xml');
        const content = await response.text();

        // Required Atom elements
        expect(content).toContain('<title>');
        expect(content).toContain('<link');
        expect(content).toContain('<updated>');
    });

    test('feed contains blog entries', async ({ request }) => {
        const response = await request.get('/feed.xml');
        const content = await response.text();

        // Should have entry/item elements for posts
        expect(content).toMatch(/<entry>|<item>/);
    });

    test('feed entries have required metadata', async ({ request }) => {
        const response = await request.get('/feed.xml');
        const content = await response.text();

        // Each entry should have title and link
        expect(content).toContain('<title>');
        // Should have multiple entries (split creates array with length > 1)
        expect(content.split('<entry>').length).toBeGreaterThan(1);
    });

    test('feed has correct author information', async ({ request }) => {
        const response = await request.get('/feed.xml');
        const content = await response.text();

        expect(content).toContain('Syafiq Hadzir');
    });

    test('sitemap.xml exists', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('xml');
    });

    test('sitemap.xml contains URLs', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const content = await response.text();

        expect(content).toContain('<urlset');
        expect(content).toContain('<url>');
        expect(content).toContain('<loc>');
    });
});
