import { expect, test } from '@playwright/test';

test.describe('SEO Metadata', () => {
  test.describe.configure({ mode: 'parallel' });
  test.beforeEach(async ({ page }) => {
    await page.goto('/archive.html');
    // Click first post link to check a real post
    await page.locator('a[href*="/posts/"]').first().click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should have essential meta tags', async ({ page }) => {
    // Core tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /.+/,
    );
    const authorContent = await page
      .locator('meta[name="author"]')
      .getAttribute('content');
    expect(authorContent !== null && authorContent.length > 0).toBe(true);

    // Open Graph
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article',
    );

    // Twitter
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
  });

  test('should have canonical link', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^https?:\/\/.+/,
    );
  });

  test('should have AMP specific tags', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('⚡', ''); // AMP attribute on html
    await expect(page.locator('style[amp-boilerplate]')).toHaveCount(1);
    await expect(page.locator('style[amp-custom]')).toHaveCount(1);
    await expect(
      page.locator('script[src^="https://cdn.ampproject.org/v0.js"]'),
    ).toHaveCount(1);
  });

  test('should prevent duplicate JSON-LD schemas', async ({ page }) => {
    // Evaluate all script tags content in the browser context
    /* eslint-disable max-nested-callbacks -- Playwright evaluateAll requires nested inline functions */
    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => {
        return scripts
          .filter(
            (script): script is HTMLScriptElement & { textContent: string } => {
              try {
                const { textContent } = script;
                if (typeof textContent !== 'string') return false;
                JSON.parse(textContent);
                return true;
              } catch {
                return false;
              }
            },
          )
          .map(
            (script) =>
              JSON.parse(script.textContent) as Record<string, unknown>,
          );
      });
    /* eslint-enable max-nested-callbacks */

    const blogPostingSchemas = schemas.filter(
      (s) => s['@type'] === 'BlogPosting' || s['@type'] === 'Article',
    );

    // We expect exactly 1 BlogPosting schema (from jekyll-seo-tag)
    expect(blogPostingSchemas).toHaveLength(1);
  });
});
