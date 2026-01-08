/**
 * @fileoverview Lighthouse user flows for error states
 * Tests performance of error pages and failure scenarios
 * @license MIT
 */

/* eslint-disable no-console, unicorn/no-process-exit, max-statements */

import { startFlow } from 'lighthouse';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const NETWORK_DELAY_MS = 3000;

/**
 * Run all error state flows
 * @returns {Promise<void>}
 */
async function runAllErrorFlows() {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    console.log('🚀 Running Error State Flows...\n');

    // Test 404 page
    console.log('📊 Flow 1: 404 Error Page');
    const flow1 = await test404Page(browser);
    const report1 = await flow1.generateReport();
    await writeFile('./lighthouse/reports/flow-404-error.html', report1);
    console.log('✅ 404 Flow complete\n');

    // Test offline behavior
    console.log('📊 Flow 2: Offline Behavior');
    const flow2 = await testOfflineBehavior(browser);
    const report2 = await flow2.generateReport();
    await writeFile('./lighthouse/reports/flow-offline.html', report2);
    console.log('✅ Offline Flow complete\n');

    // Test network degradation
    console.log('📊 Flow 3: Network Degradation');
    const flow3 = await testNetworkDegradation(browser);
    const report3 = await flow3.generateReport();
    await writeFile(
      './lighthouse/reports/flow-network-degradation.html',
      report3,
    );
    console.log('✅ Network Degradation Flow complete\n');

    console.log('🎉 All error state flows completed!');
    console.log('📁 Reports saved to ./lighthouse/reports/');
  } catch (error) {
    console.error('❌ Error flow execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Test 404 page performance
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('lighthouse').UserFlow>}
 */
async function test404Page(browser) {
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: '404 Error Page Performance',
  });

  try {
    await flow.navigate(`${BASE_URL}/nonexistent-page.html`, {
      name: 'Load 404 Page',
      stepName: '404-load',
    });

    await flow.snapshot({ name: '404 Page State' });

    return flow;
  } finally {
    await page.close();
  }
}

/**
 * Test slow network degradation
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('lighthouse').UserFlow>}
 */
async function testNetworkDegradation(browser) {
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: 'Network Degradation',
  });

  try {
    // Simulate very slow network
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), NETWORK_DELAY_MS);
    });

    await flow.navigate(`${BASE_URL}/index.html`, {
      name: 'Load with Network Delay',
      stepName: 'slow-network-load',
    });

    await flow.snapshot({ name: 'Degraded Network State' });

    return flow;
  } finally {
    await page.close();
  }
}

/**
 * Test offline behavior
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('lighthouse').UserFlow>}
 */
async function testOfflineBehavior(browser) {
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: 'Offline Behavior',
  });

  try {
    // Load page normally first
    await flow.navigate(`${BASE_URL}/index.html`, {
      name: 'Load Page Online',
      stepName: 'online-load',
    });

    // Go offline
    await flow.startTimespan({ name: 'Go Offline' });
    await page.context().setOffline(true);
    await flow.endTimespan();

    // Try to navigate while offline
    await flow.startTimespan({ name: 'Navigate While Offline' });
    await page.goto(`${BASE_URL}/about.html`).catch(() => {
      // Expected to fail
    });
    await flow.endTimespan();

    await flow.snapshot({ name: 'Offline State' });

    return flow;
  } finally {
    await page.context().setOffline(false);
    await page.close();
  }
}

// Run flows if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await runAllErrorFlows();
}

export {
  runAllErrorFlows,
  test404Page,
  testNetworkDegradation,
  testOfflineBehavior,
};
