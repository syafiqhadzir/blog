/**
 * @fileoverview Real User Monitoring (RUM) collector for Web Vitals
 * @license MIT
 */

/* eslint-disable no-console */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

const ANALYTICS_ENDPOINT = process.env.ANALYTICS_ENDPOINT || '/api/vitals';

/**
 * Initialize Web Vitals monitoring
 * @returns {void}
 */
function initWebVitals() {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onFID(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);

  console.log('📊 Web Vitals monitoring initialized');
}

/**
 * Send metric to analytics endpoint
 * @param {object} metric - Web Vitals metric
 * @returns {Promise<void>}
 */
async function sendToAnalytics(metric) {
  const body = JSON.stringify({
    delta: metric.delta,
    id: metric.id,
    name: metric.name,
    navigationType: metric.navigationType,
    rating: metric.rating,
    value: metric.value,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
  } else {
    await fetch(ANALYTICS_ENDPOINT, {
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      method: 'POST',
    });
  }
}

// Auto-initialize if in browser
if (globalThis.window !== undefined) {
  initWebVitals();
}

export { initWebVitals, sendToAnalytics };
