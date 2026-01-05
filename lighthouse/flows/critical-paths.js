/**
 * @fileoverview Lighthouse user flows for critical paths
 * @license MIT
 */

/* eslint-disable no-console, unicorn/no-process-exit */

import { startFlow } from 'lighthouse';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ANIMATION_WAIT_MS = 500;

/**
 * Run all user flows
 * @returns {Promise<void>}
 */
async function runAllFlows() {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    console.log('🚀 Running Lighthouse User Flows...\n');

    // Run flow 1: Homepage → Archive → Post
    console.log('📊 Flow 1: Homepage → Archive → Post');
    const flow1 = await testHomeToArchiveToPost(browser);
    const report1 = await flow1.generateReport();
    await writeFile(
      './lighthouse/reports/flow-home-archive-post.html',
      report1,
    );
    console.log('✅ Flow 1 complete\n');

    // Run flow 2: Homepage → Tags → Tag → Post
    console.log('📊 Flow 2: Homepage → Tags → Tag → Post');
    const flow2 = await testHomeToTagsToPost(browser);
    const report2 = await flow2.generateReport();
    await writeFile('./lighthouse/reports/flow-home-tags-post.html', report2);
    console.log('✅ Flow 2 complete\n');

    // Run flow 3: Search functionality
    console.log('📊 Flow 3: Search Functionality');
    const flow3 = await testSearchFunctionality(browser);
    const report3 = await flow3.generateReport();
    await writeFile('./lighthouse/reports/flow-search.html', report3);
    console.log('✅ Flow 3 complete\n');

    console.log('🎉 All flows completed successfully!');
    console.log('📁 Reports saved to ./lighthouse/reports/');
  } catch (error) {
    console.error('❌ Flow execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Test critical user journey: Homepage → Archive → Post
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('lighthouse').UserFlow>}
 */
async function testHomeToArchiveToPost(browser) {
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: 'Homepage → Archive → Post',
  });

  try {
    // Step 1: Load homepage
    await flow.navigate(`${BASE_URL}/index.html`, {
      name: 'Load Homepage',
      stepName: 'homepage-load',
    });

    // Step 2: Navigate to archive
    await flow.startTimespan({ name: 'Navigate to Archive' });
    await page.click('a[href="/archive"]');
    await page.waitForLoadState('networkidle');
    await flow.endTimespan();

    // Step 3: Navigate to a post
    await flow.startTimespan({ name: 'Navigate to Post' });
    await page.click('.archive-link:first-child');
    await page.waitForLoadState('networkidle');
    await flow.endTimespan();

    // Step 4: Snapshot final state
    await flow.snapshot({ name: 'Post Page State' });

    return flow;
  } finally {
    await page.close();
  }
}

/**
 * Test critical user journey: Homepage → Tags → Tag → Post
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('lighthouse').UserFlow>}
 */
async function testHomeToTagsToPost(browser) {
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: 'Homepage → Tags → Tag → Post',
  });

  try {
    // Step 1: Load homepage
    await flow.navigate(`${BASE_URL}/index.html`, {
      name: 'Load Homepage',
      stepName: 'homepage-load',
    });

    // Step 2: Navigate to tags
    await flow.startTimespan({ name: 'Navigate to Tags' });
    await page.click('a[href="/tags"]');
    await page.waitForLoadState('networkidle');
    await flow.endTimespan();

    // Step 3: Click on a tag
    await flow.startTimespan({ name: 'Expand Tag' });
    await page.click('.tag-group-header:first-child');
    await page.waitForTimeout(ANIMATION_WAIT_MS); // Wait for animation
    await flow.endTimespan();

    // Step 4: Navigate to a post from tag
    await flow.startTimespan({ name: 'Navigate to Post from Tag' });
    await page.click('.tag-post-link:first-child');
    await page.waitForLoadState('networkidle');
    await flow.endTimespan();

    // Step 5: Snapshot final state
    await flow.snapshot({ name: 'Post Page from Tag' });

    return flow;
  } finally {
    await page.close();
  }
}

/**
 * Test search functionality
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('lighthouse').UserFlow>}
 */
async function testSearchFunctionality(browser) {
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: 'Search Functionality',
  });

  try {
    // Step 1: Load archive page
    await flow.navigate(`${BASE_URL}/archive.html`, {
      name: 'Load Archive',
      stepName: 'archive-load',
    });

    // Step 2: Perform search
    await flow.startTimespan({ name: 'Search for "testing"' });
    await page.fill('#archive-search-input', 'testing');
    await page.waitForTimeout(ANIMATION_WAIT_MS); // Wait for debounce
    await flow.endTimespan();

    // Step 3: Snapshot search results
    await flow.snapshot({ name: 'Search Results State' });

    // Step 4: Clear search
    await flow.startTimespan({ name: 'Clear Search' });
    await page.fill('#archive-search-input', '');
    await page.waitForTimeout(ANIMATION_WAIT_MS);
    await flow.endTimespan();

    return flow;
  } finally {
    await page.close();
  }
}

// Run flows if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await runAllFlows();
}

export {
  runAllFlows,
  testHomeToArchiveToPost,
  testHomeToTagsToPost,
  testSearchFunctionality,
};
