import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * BasePage - Modern Page Object Model Foundation
 * Implements bleeding-edge Playwright patterns with proper typing and reusability
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env['BASE_URL'] ?? 'http://127.0.0.1:5000';
  }

  /**
   * Navigate to page with optimal wait strategy
   * Uses NetworkIdle for critical pages, DOMContentLoaded for fast tests
   */
  async goto(
    path: string,
    options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {},
  ): Promise<void> {
    const { waitUntil = 'domcontentloaded' } = options;
    await this.page.goto(`${this.baseURL}${path}`, { waitUntil });
  }

  /**
   * Wait for page to be fully loaded and interactive
   */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page
      .waitForLoadState('networkidle', { timeout: 5000 })
      .catch(() => {
        // NetworkIdle is optional - don't fail if timeout
      });
  }

  /**
   * Get standardized locator with proper waiting
   */
  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Verify page title matches expected pattern
   */
  async verifyTitle(pattern: RegExp | string): Promise<void> {
    await expect(this.page).toHaveTitle(pattern);
  }

  /**
   * Verify page URL matches expected pattern
   */
  async verifyURL(pattern: RegExp | string): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Check if element is visible with proper waiting
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.getLocator(selector).waitFor({
        state: 'visible',
        timeout: 3000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click element with automatic waiting and error handling
   */
  async clickElement(selector: string): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  /**
   * Get text content from element
   */
  async getTextContent(selector: string): Promise<string> {
    const element = this.getLocator(selector);
    const text = await element.textContent();
    return text ?? '';
  }

  /**
   * Wait for navigation with proper timing
   */
  async waitForNavigation(
    action: () => Promise<void>,
    options?: { url?: RegExp | string },
  ): Promise<void> {
    await Promise.all([this.page.waitForURL(options?.url ?? /.*/), action()]);
  }
}
