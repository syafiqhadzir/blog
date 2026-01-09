/**
 * Google Analytics 4 Event Validator
 *
 * This script validates that all expected GA4 events are properly configured
 * in the analytics.html file and provides a testing checklist.
 *
 * Usage: node scripts/validate-ga4.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expected configuration
const EXPECTED_EVENTS = [
  'page_view',
  'scroll',
  'click',
  'navigation_click',
  'share',
  'tag_click',
  'search',
  'file_download',
  'user_engagement',
  'article_complete',
  'theme_change',
  'back_to_top',
  'related_post_click',
  'page_error',
];

const EXPECTED_CUSTOM_DIMENSIONS = [
  'page_type',
  'content_category',
  'post_tags',
  'reading_time',
  'author_name',
  'publication_year',
  'is_amp',
  'percent_scrolled',
  'outbound',
  'tag_name',
  'search_term',
  'file_extension',
  'theme_mode',
  'error_type',
];

const REQUIRED_TRIGGERS = [
  'trackPageview',
  'scrollDepth10',
  'scrollDepth25',
  'scrollDepth50',
  'scrollDepth75',
  'scrollDepth90',
  'scrollDepth100',
  'outboundLinkClick',
  'internalLinkClick',
  'navigationClick',
  'socialShare',
  'tagClick',
  'searchInteraction',
  'fileDownload',
  'engagementTime30',
  'readingProgress',
  'themeToggle',
  'backToTopClick',
  'relatedPostClick',
  'errorPage',
];

const GA_MEASUREMENT_ID = 'G-TYLK1PCZPF';

// Colors for terminal output
const colors = {
  blue: '\u001B[34m',
  cyan: '\u001B[36m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  reset: '\u001B[0m',
  yellow: '\u001B[33m',
};

/**
 * Validates AMP analytics configuration
 */
function checkAmpConfig(content) {
  log('\n⚡ AMP Configuration', 'blue');
  let passed = true;

  if (content.includes('type="gtag"')) {
    log('✓ Using gtag vendor type (correct for GA4)', 'green');
  } else {
    log('✗ gtag vendor type not found', 'red');
    passed = false;
  }

  if (content.includes('data-credentials="include"')) {
    log('✓ Credentials configured for cookie support', 'green');
  } else {
    log('⚠ data-credentials="include" not found', 'yellow');
  }
  return passed;
}

/**
 * Validates custom dimension parameters
 */
function checkCustomDimensions(content) {
  log('\n🏷️  Custom Dimension Parameters', 'blue');
  let dimCount = 0;

  for (const dim of EXPECTED_CUSTOM_DIMENSIONS) {
    if (content.includes(`"${dim}"`) || content.includes(`${dim}:`)) {
      dimCount++;
    } else {
      log(`⚠ Parameter may be missing: ${dim}`, 'yellow');
    }
  }

  log(
    `✓ ${dimCount}/${EXPECTED_CUSTOM_DIMENSIONS.length} parameters found`,
    'green',
  );
  return true;
}

/**
 * Validates event names
 */
function checkEventNames(content) {
  log('\n📋 Event Names', 'blue');
  let eventCount = 0;

  for (const event of EXPECTED_EVENTS) {
    if (content.includes(`"event_name": "${event}"`)) {
      eventCount++;
    } else {
      log(`⚠ Event may be missing: ${event}`, 'yellow');
    }
  }

  log(`✓ ${eventCount}/${EXPECTED_EVENTS.length} events found`, 'green');
  return true;
}

/**
 * Performs miscellaneous health checks
 */
function checkHealth(content) {
  log('\n🔎 Configuration Health Check', 'blue');
  let passed = true;

  if (content.includes('extraUrlParams')) {
    log('✓ extraUrlParams configured for enhanced tracking', 'green');
  } else {
    log(
      '⚠ extraUrlParams section not found (optional but recommended)',
      'yellow',
    );
  }

  if (content.includes('groups')) {
    log(
      '⚠ WARNING: "groups" parameter found - this can cause issues with GA4',
      'yellow',
    );
    passed = false;
  } else {
    log('✓ No problematic "groups" parameter', 'green');
  }

  if (content.includes('send_page_view')) {
    log(
      '⚠ "send_page_view" found in config (usually handled by triggers)',
      'yellow',
    );
  }
  return passed;
}

/**
 * Validates the measurement ID configuration
 */
function checkMeasurementId(content) {
  log('\n📊 Measurement ID', 'blue');
  let passed = true;

  if (
    content.includes(GA_MEASUREMENT_ID) ||
    content.includes('{{ ga_id }}') ||
    content.includes('site.google_analytics')
  ) {
    log(`✓ Measurement ID configured via Liquid variable`, 'green');

    const configPath = path.join(__dirname, '..', '_config.yml');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      if (configContent.includes(GA_MEASUREMENT_ID)) {
        log(`✓ Measurement ID in _config.yml: ${GA_MEASUREMENT_ID}`, 'green');
      } else {
        log(`⚠ Measurement ID not found in _config.yml`, 'yellow');
        log(
          `  Check that google_analytics: ${GA_MEASUREMENT_ID} is set`,
          'yellow',
        );
      }
    }
  } else {
    log(`✗ Measurement ID not found or incorrect`, 'red');
    log(`  Expected: ${GA_MEASUREMENT_ID}`, 'yellow');
    passed = false;
  }
  return passed;
}

/**
 * Validates event triggers
 */
function checkTriggers(content) {
  log('\n🎯 Event Triggers', 'blue');
  let triggerCount = 0;
  let allPresent = true;

  for (const trigger of REQUIRED_TRIGGERS) {
    if (content.includes(`"${trigger}"`)) {
      triggerCount++;
    } else {
      log(`✗ Missing trigger: ${trigger}`, 'red');
      allPresent = false;
    }
  }

  log(
    `✓ ${triggerCount}/${REQUIRED_TRIGGERS.length} triggers configured`,
    triggerCount === REQUIRED_TRIGGERS.length ? 'green' : 'yellow',
  );
  return allPresent;
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Main execution function
 */
function main() {
  const validationPassed = validateAnalyticsFile();
  printTestingChecklist();

  if (!validationPassed) {
    process.exit(1);
  }
}

/**
 * Prints the manual testing checklist
 */
function printTestingChecklist() {
  log('\n📝 Manual Testing Checklist\n', 'cyan');
  log('═'.repeat(60), 'cyan');
  log('\n1. Open GA4 Realtime Reports:', 'yellow');
  log('   https://analytics.google.com/analytics/web/\n');

  log('2. Visit your site:', 'yellow');
  log('   https://blog.syafiqhadzir.dev\n');

  log('3. Perform these actions and verify events in Realtime:\n', 'yellow');

  const tests = [
    '[ ] Load page → page_view event',
    '[ ] Scroll to 50% → scroll event (percent_scrolled: 50)',
    '[ ] Scroll to 100% → scroll + article_complete events',
    '[ ] Click external link → click event (outbound: true)',
    '[ ] Click internal link → click event (outbound: false)',
    '[ ] Click navigation item → navigation_click event',
    '[ ] Click tag/topic → tag_click event',
    '[ ] Use archive search → search event',
    '[ ] Wait 15 seconds → user_engagement event',
    '[ ] Click social share → share event',
    '[ ] Toggle theme → theme_change event',
    '[ ] Click back-to-top → back_to_top event',
    '[ ] Click related post → related_post_click event',
    '[ ] Visit /invalid-url → page_error event',
  ];

  for (const test of tests) log(`   ${test}`, 'cyan');

  log('\n4. Verify Custom Dimensions in GA4:\n', 'yellow');
  log('   Admin → Data display → Custom definitions', 'cyan');
  log('   → Create dimensions for:', 'cyan');

  for (const dim of EXPECTED_CUSTOM_DIMENSIONS.slice(0, 5)) {
    log(`      • ${dim}`, 'cyan');
  }
  log('      • ... and 9 more (see GA4_DOCUMENTATION.md)\n', 'cyan');

  log('5. Enable DebugView:', 'yellow');
  log('   Install "Google Analytics Debugger" extension');
  log('   Configure → DebugView → Verify events and parameters\n');

  log('═'.repeat(60), 'cyan');
  log('\nFor detailed instructions, see: docs/GA4_DOCUMENTATION.md\n', 'blue');
}

/**
 * Validates the analytics.html file
 */
function validateAnalyticsFile() {
  const analyticsPath = path.join(
    __dirname,
    '..',
    '_includes',
    'analytics.html',
  );

  log('\n🔍 GA4 Configuration Validator\n', 'cyan');
  log('═'.repeat(60), 'cyan');

  if (!fs.existsSync(analyticsPath)) {
    log('❌ ERROR: analytics.html not found!', 'red');
    log(`   Expected location: ${analyticsPath}`, 'red');
    return false;
  }

  const content = fs.readFileSync(analyticsPath, 'utf8');

  const results = [
    checkMeasurementId(content),
    checkAmpConfig(content),
    checkTriggers(content),
    checkEventNames(content),
    checkCustomDimensions(content),
    checkHealth(content),
  ];

  const allPassed = results.every((r) => r === true);

  log('\n' + '═'.repeat(60), 'cyan');

  if (allPassed) {
    log('\n✅ All critical validations passed!', 'green');
    log('   Your GA4 configuration looks good.\n', 'green');
  } else {
    log('\n❌ Some validations failed.', 'red');
    log('   Please review the errors above.\n', 'red');
  }

  return allPassed;
}

main();
