import {
  type APIRequestContext,
  test as base,
  type Page,
} from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'node:fs';
import path from 'node:path';

// --- Configuration & Constants ---
const BASE_URL = process.env['BASE_URL'] ?? 'http://127.0.0.1:5000';
const PERF_MODE = process.env['PERF_MODE'] === 'true';

// --- Types ---
export interface PerfMetrics {
  domContentLoaded: number;
  duration: number;
  loaded: number;
  resources: number;
  url: string;
}

interface BlogFixtures {
  blockAdsAndAnalytics: (page: Page) => Promise<void>;
  collectPerfMetrics: (page: Page) => Promise<PerfMetrics>;
  getAllInternalRoutes: () => Promise<string[]>;
  validateInternalLinks: (page: Page) => Promise<string[]>;
}

// --- Helper Functions ---
const normalizeRoute = (route: string): string => {
  // Remove both local and production base URLs

  let clean = route
    .replace(BASE_URL, '')
    .replace(/https?:\/\/blog\.syafiqhadzir\.dev/, '')
    .split('#')[0];

  if (clean != undefined && clean.length > 0 && clean.endsWith('index.html'))
    clean = clean.replace('index.html', '');
  if (clean === undefined || !(clean.length > 0 && clean.startsWith('/')))
    clean = '/' + (clean ?? '');
  return clean;
};

// Helper to parse feed XML and extract routes

async function parseFeedRoutes(
  request: APIRequestContext,
  routes: Set<string>,
): Promise<void> {
  try {
    const feedResponse = await request.get(`${BASE_URL}/feed.xml`);

    if (!feedResponse.ok()) return;

    const xml = await feedResponse.text();
    const parser = new XMLParser({ ignoreAttributes: false });

    const feedObject = parser.parse(xml) as { feed?: { entry?: unknown } };
    const feedEntries = feedObject.feed?.entry ?? [];
    const entryList = Array.isArray(feedEntries)
      ? (feedEntries as unknown[])
      : [feedEntries];

    for (const entry of entryList) {
      const entryObject = entry as { link?: Record<string, string> };
      const link = entryObject.link?.['@_href'];
      if (link != undefined && link.length > 0) {
        routes.add(normalizeRoute(link));
      }
    }
  } catch {
    // Feed is optional
  }
}

// Helper to parse sitemap XML and extract routes

async function parseSitemapRoutes(
  request: APIRequestContext,
  routes: Set<string>,
): Promise<void> {
  try {
    const sitemapResponse = await request.get(`${BASE_URL}/sitemap.xml`);

    if (!sitemapResponse.ok()) return;

    const xml = await sitemapResponse.text();
    const parser = new XMLParser();

    const jsonObject = parser.parse(xml) as { urlset?: { url?: unknown } };
    const urlEntries = jsonObject.urlset?.url ?? [];
    const urlList = Array.isArray(urlEntries)
      ? (urlEntries as unknown[])
      : [urlEntries];

    for (const entry of urlList) {
      const entryObject = entry as { loc?: string };
      const location = entryObject.loc;
      if (location != undefined && location.length > 0) {
        routes.add(normalizeRoute(location));
      }
    }
  } catch (error) {
    process.stderr.write(`Sitemap discovery failed: ${String(error)}\n`);
  }
}

// Helper to walk filesystem and collect HTML files
function walkFilesystem(siteDirectory: string, routes: Set<string>): void {
  if (!fs.existsSync(siteDirectory)) return;

  const walkSync = (directory: string, fileList: string[] = []): string[] => {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filepath = path.join(directory, file);
      if (fs.statSync(filepath).isDirectory()) {
        fileList = walkSync(filepath, fileList);
      } else if (file.endsWith('.html')) {
        fileList.push(filepath);
      }
    }
    return fileList;
  };

  const files = walkSync(siteDirectory);
  for (const htmlFile of files) {
    let relative = htmlFile.replace(siteDirectory, '').replaceAll('\\', '/');
    if (relative.endsWith('/index.html'))
      relative = relative.replace('/index.html', '/');
    routes.add(normalizeRoute(relative));
  }
}

// --- Fixtures Implementation ---
export const test = base.extend<BlogFixtures>({
  blockAdsAndAnalytics: async ({ page: _page }, use) => {
    await use(async (targetPage: Page) => {
      if (!PERF_MODE) return;
      await targetPage.route('**/*', async (route) => {
        const url = route.request().url();
        const type = route.request().resourceType();
        // Block trackers, fonts, and heavy media in fast mode
        if (
          type === 'font' ||
          url.includes('google-analytics') ||
          url.includes('googletagmanager') ||
          url.includes('facebook') ||
          url.includes('doubleclick')
        ) {
          return route.abort();
        }
        if (type === 'image' && !url.includes('logo')) {
          // Optional: stricter image blocking for pure speed
          // return route.abort();
        }
        return route.continue();
      });
      // Disable animations
      await targetPage.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
            scroll-behavior: auto !important;
          }
        `,
      });
    });
  },

  collectPerfMetrics: async ({ page: _page }, use) => {
    await use(async (targetPage: Page) => {
      const timing = await targetPage.evaluate(() => {
        const nav = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
          duration: nav.duration,
          loaded: nav.loadEventEnd - nav.startTime,
        };
      });
      return {
        domContentLoaded: timing.domContentLoaded || 0,
        duration: timing.duration || 0,
        loaded: timing.loaded || 0,
        resources: 0, // Placeholder
        url: targetPage.url(),
      };
    });
  },

  getAllInternalRoutes: async ({ request }, use) => {
    await use(async () => {
      const routes = new Set<string>();

      // 1. Walk _site directory (Source of Truth)
      const siteDirectory = path.resolve(process.cwd(), '_site');
      walkFilesystem(siteDirectory, routes);

      // 2. Parse Sitemap (Secondary)
      await parseSitemapRoutes(request, routes);

      // 3. Parse Feed (Tertiary)
      await parseFeedRoutes(request, routes);

      return [...routes].toSorted((a, b) => a.localeCompare(b));
    });
  },

  validateInternalLinks: async ({ page: _page }, use) => {
    await use(async (targetPage: Page) => {
      const brokenLinks: string[] = [];
      const links = await targetPage
        .locator('a[href^="/"], a[href^="' + BASE_URL + '"]')
        .all();

      // Extract hrefs first to dedupe
      const attributePromises = links.map(async (link) =>
        link.getAttribute('href'),
      );
      const attributes = await Promise.all(attributePromises);
      const hrefs = attributes.filter(
        (h): h is string => h != undefined && h.length > 0,
      );
      const uniqueHrefs = [...new Set(hrefs)];

      for (const href of uniqueHrefs) {
        if (
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('java' + 'script:')
        )
          continue;

        try {
          const response = await targetPage.request.get(href);
          if (response.status() >= 400) {
            brokenLinks.push(`${href} (Status: ${String(response.status())})`);
          }
        } catch {
          brokenLinks.push(`${href} (Network Error)`);
        }
      }

      return brokenLinks;
    });
  },
});
