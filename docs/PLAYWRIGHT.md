# Playwright E2E Testing - Bleeding-Edge Industrial Standards

**Last Updated**: 2026-01-10  
**Status**: ✅ OPTIMIZED FOR PRODUCTION

---

## 🎯 Philosophy

These Playwright tests implement **bleeding-edge industrial best practices** for maximum reliability, maintainability, and performance:

- ✅ **Page Object Model (POM)**: Reusable, maintainable page representations
- ✅ **Test Steps**: Clear reporting with `test.step()`
- ✅ **Parallel Execution**: Maximum test speed
- ✅ **Custom Fixtures**: Domain-specific test utilities
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Performance Monitoring**: Built-in Core Web Vitals tracking

---

## 🏗️ Architecture

### **Directory Structure**

```
tests/
├── _helpers/
│   ├── pages/              # Page Object Models
│   │   ├── BasePage.ts     # Base POM class
│   │   ├── HomePage.ts     # Homepage POM
│   │   ├── ArchivePage.ts  # Archive/Blog POM
│   │   └── index.ts        # Barrel exports
│   ├── fixtures.ts         # Custom Playwright fixtures
│   └── customMatchers.ts   # Domain-specific assertions
├── e2e/                    # Full E2E tests
│   ├── accessibility.spec.ts
│   ├── amp.spec.ts
│   └── ...
├── smoke.fast.spec.ts      # Fast smoke tests
└── *.spec.ts               # Other test suites
```

---

## 📘 Page Object Model (POM)

### **BasePage - Foundation Class**

All page objects extend `BasePage` which provides:

- **goto()**: Navigate with configurable wait strategies
- **waitForReady()**: Ensure page is fully interactive
- **getLocator()**: Standardized locator creation
- **verifyTitle()**: Title assertion helper
- **verifyURL()**: URL pattern matching
- **clickElement()**: Safe click with automatic waiting
- **waitForNavigation()**: Handle navigation with proper timing

**Example Usage**:

```typescript
import { BasePage } from './_helpers/pages';

class MyPage extends BasePage {
  async navigate(): Promise<void> {
    await this.goto('/my-page');
  }

  async clickButton(): Promise<void> {
    await this.clickElement('.my-button');
  }
}
```

### **HomePage - Semantic Methods**

```typescript
const homePage = new HomePage(page);

// Navigate
await homePage.navigate();

// Verify
await homePage.verifyLoaded();

// Interact
await homePage.goToArchive();
await homePage.toggleDarkMode();

// Accessibility
await homePage.verifySkipLinkFocus();
```

### **ArchivePage - Advanced Interactions**

```typescript
const archivePage = new ArchivePage(page);

// Search
await archivePage.search('playwright');
await archivePage.verifySearchResults('playwright');

// Filter
await archivePage.filterByCategory('testing');
await archivePage.filterByYear('2025');

// Navigate
await archivePage.openFirstPost();
```

---

## 🎨 Custom Fixtures

### **Page Object Fixtures**

Automatically instantiated for every test:

```typescript
test('example', async ({ homePage, archivePage }) => {
  // Page objects ready to use
  await homePage.navigate();
  await archivePage.navigate();
});
```

### **Performance Fixtures**

```typescript
test('performance', async ({ collectPerfMetrics, page }) => {
  await page.goto('/');
  const metrics = await collectPerfMetrics(page);
  
  expect(metrics.fcp).toBeLessThan(1800); // Good FCP
  expect(metrics.lcp).toBeLessThan(2500); // Good LCP
});
```

### **Utility Fixtures**

```typescript
test('validation', async ({ validateInternalLinks, page }) => {
  await page.goto('/');
  const brokenLinks = await validateInternalLinks(page);
  
  expect(brokenLinks).toEqual([]);
});
```

---

## 🧪 Custom Matchers

Domain-specific assertions for better test readability:

```typescript
test('amp validation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toPassAMPValidation();
});

test('core web vitals', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveGoodCoreWebVitals();
});

test('aria compliance', async ({ page }) => {
  const button = page.locator('button');
  await expect(button).toHaveProperARIA('button');
});
```

---

## ⚡ Test.Step() for Better Reporting

Break tests into logical steps for clearer reporting:

```typescript
test('user journey', async ({ homePage }) => {
  await test.step('Navigate to homepage', async () => {
    await homePage.navigate();
  });

  await test.step('Verify page loaded', async () => {
    await homePage.verifyLoaded();
  });

  await test.step('Navigate to archive', async () => {
    await homePage.goToArchive();
  });
});
```

**Benefits**:

- Clear test structure
- Better failure reporting
- Step-by-step screenshots
- Easier debugging

---

## 🚀 Parallel Execution

Tests run in parallel for maximum speed:

```typescript
test.describe('My Suite', () => {
  test.describe.configure({ mode: 'parallel' });
  
  test('test 1', async () => { /* ... */ });
  test('test 2', async () => { /* ... */ });
  test('test 3', async () => { /* ... */ });
});
```

Configuration in `playwright.config.ts`:

- **Workers**: Automatic based on CPU cores
- **Sharding**: Distribute tests across CI machines
- **Retries**: Automatic retry for flaky tests

---

## 🏷️ Test Tags

Organize and run specific test subsets:

```typescript
test.describe('Suite', { tag: '@fast' }, () => {
  // Fast smoke tests
});

test.describe('Suite', { tag: '@e2e' }, () => {
  // Full E2E tests
});

test.describe('Suite', { tag: '@accessibility' }, () => {
  // Accessibility tests
});
```

**Run specific tags**:

```bash
# Run only fast tests
npx playwright test --grep @fast

# Run E2E tests
npx playwright test --grep @e2e

# Exclude slow tests
npx playwright test --grep-invert @slow
```

---

## 📊 Performance Budgets

Enforce performance standards:

```typescript
test('homepage performance', async ({  collectPerfMetrics, page }) => {
  await page.goto('/');
  const metrics = await collectPerfMetrics(page);

  // Performance budgets
  expect(metrics.domContentLoaded).toBeLessThan(1000);
  expect(metrics.fcp).toBeLessThan(1800);
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.loaded).toBeLessThan(3000);
});
```

---

## 🔄 Retry Strategy

Smart retries for network-dependent tests:

```typescript
test.describe('External Links', () => {
  test.describe.configure({ retries: 2 });
  
  test('check external resources', async ({ page }) => {
    // Will retry up to 2 times on failure
  });
});
```

---

## 📈 Best Practices Implemented

### **1. Wait Strategies**

✅ **Use appropriate wait strategies**:

- `domcontentloaded` for fast tests
- `networkidle` for complete loading
- Auto-waiting with Playwright locators

❌ **Avoid**:

- Fixed timeouts (`page.waitForTimeout()`)
- Manual waiting

### **2. Locator Strategies**

✅ **Use semantic, stable locators**:

- Role-based locators
- Test IDs (`data-testid`)
- Accessible names

❌ **Avoid**:

- CSS class selectors (can change)
- XPath (brittle)
- nth-child (position-dependent)

### **3. Assertions**

✅ **Use auto-retrying assertions**:

- `expect(locator).toBeVisible()`
- `expect(page).toHaveTitle()`
- Custom matchers

❌ **Avoid**:

- Non-retrying checks
- Polling manually

### **4. Test Organization**

✅ **Follow AAA pattern**:

- **Arrange**: Set up test data
- **Act**: Perform actions
- **Assert**: Verify results

✅ **Use test.step()** for complex tests

✅ **Keep tests focused** on single functionality

---

## 🎓 Migration Guide

### **Before (Old Pattern)**

```typescript
test('homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Syafiq/);
  await expect(page.locator('h1')).toBeVisible();
  await page.click('a[href="/archive"]');
  await expect(page).toHaveURL(/archive/);
});
```

### **After (Bleeding-Edge Pattern)**

```typescript
test('homepage journey', async ({ homePage }) => {
  await test.step('Navigate to homepage', async () => {
    await homePage.navigate();
  });

  await test.step('Verify homepage loaded', async () => {
    await homePage.verifyLoaded();
  });

  await test.step('Navigate to archive', async () => {
    await homePage.goToArchive();
  });

  await test.step('Verify archive URL', async () => {
    await homePage.verifyURL(/archive/);
  });
});
```

**Benefits**:

- ✅ Reusable page methods
- ✅ Better test reporting
- ✅ Easier maintenance
- ✅ Clear test structure

---

## 📚 References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Parallelization](https://playwright.dev/docs/test-parallel)
- [Custom Matchers](https://playwright.dev/docs/test-assertions)

---

## 🎯 Quick Commands

```bash
# Run all tests
npm run test:e2e

# Run fast tests only
npm run test:fast

# Run with UI mode (debugging)
npx playwright test --ui

# Run specific file
npx playwright test smoke.fast.spec.ts

# Run in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug smoke.fast.spec.ts

# Generate test report
npx playwright show-report
```

---

**Philosophy**: Write tests that are **fast**, **reliable**, **maintainable**, and **readable**. Use bleeding-edge Playwright features to achieve maximum productivity and confidence in your test suite.

**Review**: Monthly  
**Last Optimization**: 2026-01-10
