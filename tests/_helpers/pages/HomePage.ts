import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';

/**
 * HomePage - Modern Page Object Model
 * Implements bleeding-edge Playwright patterns for the homepage
 */
export class HomePage extends BasePage {
  // Locators - defined as getters for lazy evaluation
  private get heading(): Locator {
    return this.getLocator('h1');
  }

  private get mainContent(): Locator {
    return this.getLocator('main');
  }

  private get navigationLinks(): Locator {
    return this.getLocator('nav a');
  }

  private get skipLink(): Locator {
    return this.getLocator('.skip-link');
  }

  private get themeToggle(): Locator {
    return this.getLocator('[data-theme-toggle]');
  }

  /**
   * Navigate to homepage
   */
  async navigate(): Promise<void> {
    await this.goto('/');
  }

  /**
   * Verify homepage loaded correctly
   */
  async verifyLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.mainContent).toBeVisible();
    await this.verifyTitle(/Syafiq Hadzir/);
  }

  /**
   * Get all navigation link texts
   */
  async getNavigationLinks(): Promise<string[]> {
    const links = await this.navigationLinks.allTextContents();
    return links;
  }

  /**
   * Navigate to archive page
   */
  async goToArchive(): Promise<void> {
    await this.waitForNavigation(
      async () => await this.clickElement('a[href="/archive"]'),
      { url: /archive/ },
    );
  }

  /**
   * Navigate to about page
   */
  async goToAbout(): Promise<void> {
    await this.waitForNavigation(
      async () => await this.clickElement('a[href="/about"]'),
      { url: /about/ },
    );
  }

  /**
   * Toggle dark mode
   */
  async toggleDarkMode(): Promise<void> {
    await this.themeToggle.click();
  }

  /**
   * Verify skip link is first focusable element
   */
  async verifySkipLinkFocus(): Promise<void> {
    await this.page.keyboard.press('Tab');
    await expect(this.skipLink).toBeFocused();
  }

  /**
   * Verify responsive layout
   */
  async verifyResponsiveLayout(viewport: {
    width: number;
    height: number;
  }): Promise<void> {
    await this.page.setViewportSize(viewport);
    await expect(this.mainContent).toBeVisible();
  }
}
