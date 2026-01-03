import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Feed Validation', { tag: ['@full', '@feeds'] }, () => {
    test.describe.configure({ mode: 'parallel' });

    test('Sitemap XML structure', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.ok()).toBeTruthy();
        const text = await response.text();
        expect(text).toContain('<?xml');
        expect(text).toContain('<urlset');
    });

    test('RSS Feed XML structure', async ({ request }) => {
        const response = await request.get('/feed.xml');
        expect(response.ok()).toBeTruthy();
        const text = await response.text();
        expect(text).toContain('<?xml');
        expect(text).toContain('<feed');
    });
});
