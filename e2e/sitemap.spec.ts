import { expect, test } from '@playwright/test';

test.describe('Sitemap', () => {
    test.describe.configure({ mode: 'parallel' });

    test('sitemap.xml exists and is valid XML', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.status()).toBe(200);

        const content = await response.text();
        expect(content).toContain('<?xml');
        expect(content).toContain('<urlset');
    });

    test('sitemap has image namespace', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const content = await response.text();
        expect(content).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    });

    test('posts have images included', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const content = await response.text();

        // At least one image tag should be present (assuming posts have images)
        expect(content).toContain('<image:image>');
        expect(content).toContain('<image:loc>');
    });

    test('homepage has correct priority', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const content = await response.text();

        // Regex to find the homepage block and check priority
        // Simple check: Look for priority 1.0 which is unique to homepage
        expect(content).toContain('<priority>1.0</priority>');
    });

    test('utility pages are excluded', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const content = await response.text();

        expect(content).not.toContain('404.html');
        expect(content).not.toContain('sw-install.html');
        expect(content).not.toContain('offline.html');
    });

    test('has reference to XSLT stylesheet', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        const content = await response.text();
        expect(content).toContain('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
    });

    test('sitemap.xsl exists and returns valid content', async ({ request }) => {
        const response = await request.get('/sitemap.xsl');
        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('xml'); // Server often returns text/xml or application/xml for .xsl

        const content = await response.text();
        expect(content).toContain('<xsl:stylesheet');
        expect(content).toContain('<html lang="en">');
    });
});
