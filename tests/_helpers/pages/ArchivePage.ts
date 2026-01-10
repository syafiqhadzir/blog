import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';

/**
 * ArchivePage - Modern Page Object Model
 * Implements bleeding-edge patterns for the archive/blog listing page
 */
export class ArchivePage extends BasePage {
  // Locators
  private get searchInput(): Locator {
    return this.getLocator('input[type="search"]');
  }

  private get searchResults(): Locator {
    return this.getLocator('.search-results');
  }

  private get postLinks(): Locator {
    return this.getLocator('a[href*="/posts/"]');
  }

  private get categoryFilters(): Locator {
    return this.getLocator('[data-category-filter]');
  }

  private get yearFilters(): Locator {
    return this.getLocator('[data-year-filter]');
  }

  /**
   * Navigate to archive page
   */
  async navigate(): Promise<void> {
    await this.goto('/archive.html');
  }

  /**
   * Verify archive page loaded
   */
  async verifyLoaded(): Promise<void> {
    await expect(this.getLocator('main')).toBeVisible();
    await expect(this.getLocator('h1')).toBeVisible();
  }

  /**
   * Search for posts
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    // Wait for search results to update
    await this.page.waitForTimeout(500); // Allow AMP search to process
  }

  /**
   * Get all post titles
   */
  async getPostTitles(): Promise<string[]> {
    const titles = await this.postLinks.allTextContents();
    return titles.map((title) => title.trim());
  }

  /**
   * Get number of visible posts
   */
  async getVisiblePostCount(): Promise<number> {
    return await this.postLinks.count();
  }

  /**
   * Click on first post
   */
  async openFirstPost(): Promise<void> {
    await this.postLinks.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on specific post by index
   */
  async openPostByIndex(index: number): Promise<void> {
    await this.postLinks.nth(index).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Filter by category
   */
  async filterByCategory(category: string): Promise<void> {
    const filter = this.categoryFilters.filter({ hasText: category });
    await filter.click();
    await this.page.waitForTimeout(300); // Allow filtering animation
  }

  /**
   * Filter by year
   */
  async filterByYear(year: string): Promise<void> {
    const filter = this.yearFilters.filter({ hasText: year });
    await filter.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Verify search results contain query
   */
  async verifySearchResults(query: string): Promise<void> {
    const titles = await this.getPostTitles();
    const hasMatch = titles.some((title) =>
      title.toLowerCase().includes(query.toLowerCase()),
    );
    expect(hasMatch).toBeTruthy();
  }
}
