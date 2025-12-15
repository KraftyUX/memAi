import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for memAI Dashboard
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 * 
 * These tests run against the actual backend server.
 * The backend must be running on localhost:3030 for tests to pass.
 */

/**
 * Helper to get memory card elements
 */
function getMemoryCards(page: Page) {
  return page.locator('#memory-list [role="list"] > [role="listitem"]');
}

/**
 * Test: Dashboard loads and displays memories
 * Requirements: 5.1, 4.1, 4.2
 */
test.describe('Dashboard loads and displays memories', () => {
  test('should load the dashboard and display memory cards', async ({ page }) => {
    await page.goto('/');

    // Verify header with new logo and "memAI" text (Requirements: 4.1, 4.2)
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verify MemaiLogo SVG is present (Requirements: 4.1)
    const logo = header.locator('svg[aria-label*="memAI logo"]');
    await expect(logo).toBeVisible();
    
    // Verify "memAI" text is present in header
    await expect(header.getByRole('heading', { name: /memAI/i })).toBeVisible();
    
    // Verify old emoji (🧠) is removed from header
    const headerText = await header.textContent();
    expect(headerText).not.toContain('🧠');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Verify memory cards are visible (at least one)
    const memoryCards = getMemoryCards(page);
    const count = await memoryCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

/**
 * Test: Breadcrumb navigation
 * Requirements: 5.1, 5.3
 */
test.describe('Breadcrumb navigation', () => {
  test('should display breadcrumb with correct navigation items', async ({ page }) => {
    await page.goto('/');

    // Verify breadcrumb navigation is visible (Requirements: 5.1)
    const breadcrumbNav = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumbNav).toBeVisible();

    // Verify "Home" link is present (Requirements: 5.3)
    const homeLink = breadcrumbNav.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();

    // Verify "Dashboard" text is present (Requirements: 5.3)
    await expect(breadcrumbNav.getByText('Dashboard')).toBeVisible();
  });
});

/**
 * Test: Decisions tab filtering
 * Requirements: 5.2, 2.1
 * This specifically tests the reported bug fix where decisions weren't displaying
 */
test.describe('Decisions tab filtering', () => {
  test('should filter to show only decision memories when Decisions tab is clicked', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Get initial count
    const initialCards = getMemoryCards(page);
    const initialCount = await initialCards.count();

    // Click the Decisions tab
    const decisionsTab = page.getByRole('tab', { name: 'Decisions' });
    await decisionsTab.click();

    // Verify tab is selected
    await expect(decisionsTab).toHaveAttribute('aria-selected', 'true');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify filtered results
    const filteredCards = getMemoryCards(page);
    const filteredCount = await filteredCards.count();

    // If there are decision memories, verify they have the decision badge
    if (filteredCount > 0) {
      // All visible cards should have the "decision" category
      const firstCard = filteredCards.first();
      await expect(firstCard.getByText('decision')).toBeVisible();
    }

    // Filtered count should be <= initial count
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });
});

/**
 * Test: Category dropdown filtering
 * Requirements: 5.3, 2.2
 */
test.describe('Category dropdown filtering', () => {
  test('should filter memories by category when selected from dropdown', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Get initial count
    const initialCards = getMemoryCards(page);
    const initialCount = await initialCards.count();

    // Open category dropdown
    const categoryTrigger = page.getByRole('combobox', { name: /filter by category/i });
    await categoryTrigger.click();

    // Select "Decision" category
    await page.getByRole('option', { name: 'Decision' }).click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify filtered results
    const filteredCards = getMemoryCards(page);
    const filteredCount = await filteredCards.count();

    // If there are filtered results, verify they have the correct category
    if (filteredCount > 0) {
      const firstCard = filteredCards.first();
      await expect(firstCard.getByText('decision')).toBeVisible();
    }

    // Filtered count should be <= initial count
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });
});

/**
 * Test: Search filtering
 * Requirements: 5.4, 2.3
 */
test.describe('Search filtering', () => {
  test('should filter memories by search term', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Get initial count
    const initialCards = getMemoryCards(page);
    const initialCount = await initialCards.count();

    // Skip if no memories
    if (initialCount === 0) {
      test.skip();
      return;
    }

    // Get text from first memory to use as search term
    const firstCard = initialCards.first();
    const cardText = await firstCard.textContent();
    
    // Extract a word to search for (at least 4 chars to be meaningful)
    const words = cardText?.split(/\s+/).filter(w => w.length >= 4 && /^[a-zA-Z]+$/.test(w)) || [];
    if (words.length === 0) {
      test.skip();
      return;
    }
    const searchTerm = words[0];

    // Enter search term
    const searchInput = page.getByRole('searchbox', { name: /search memories/i });
    await searchInput.fill(searchTerm);

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify filtered results
    const filteredCards = getMemoryCards(page);
    const filteredCount = await filteredCards.count();

    // Should have at least one result (the card we got the term from)
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should show empty state when no matches found', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Enter a search term that won't match anything
    const searchInput = page.getByRole('searchbox', { name: /search memories/i });
    await searchInput.fill('xyznonexistentterm123456789');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Should show empty state or no cards
    const filteredCards = getMemoryCards(page);
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBe(0);
  });
});

/**
 * Test: Statistics display
 * Requirements: 5.5, 3.1, 3.2, 3.3, 1.4
 */
test.describe('Statistics display', () => {
  test('should display statistics cards', async ({ page }) => {
    await page.goto('/');

    // Wait for stats to load
    const statsSection = page.locator('[role="region"][aria-label="Dashboard statistics"]');
    await expect(statsSection).toBeVisible();

    // Verify all stat cards are present by their IDs
    await expect(page.locator('#total-memories-title')).toHaveText('Total Memories');
    await expect(page.locator('#decisions-title')).toHaveText('Decisions');
    await expect(page.locator('#active-issues-title')).toHaveText('Active Issues');
    // Updated: Show implementations count instead of avg resolve time
    await expect(page.locator('#implementations-title')).toHaveText('Implementations');
  });
});

/**
 * Test: Pagination
 * Requirements: 5.6
 */
test.describe('Pagination', () => {
  test('should display pagination controls', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Check if pagination is visible
    const paginationNav = page.getByRole('navigation', { name: /pagination/i });
    const memoryCards = getMemoryCards(page);
    const cardCount = await memoryCards.count();

    if (cardCount > 0) {
      await expect(paginationNav).toBeVisible();
      
      // Verify pagination elements
      await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
      await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();
    }
  });

  test('should disable Previous button on first page', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    const memoryCards = getMemoryCards(page);
    const cardCount = await memoryCards.count();

    if (cardCount > 0) {
      // On first page, Previous should be disabled
      const prevButton = page.getByRole('button', { name: /previous/i });
      await expect(prevButton).toBeDisabled();
    }
  });

  test('should navigate between pages when multiple pages exist', async ({ page }) => {
    await page.goto('/');

    // Wait for memories to load
    await page.waitForSelector('#memory-list [role="list"]', { timeout: 10000 });

    // Check if we have multiple pages
    const pageInfo = page.getByText(/page (\d+) of (\d+)/i);
    const pageInfoText = await pageInfo.textContent().catch(() => '');
    const match = pageInfoText?.match(/page (\d+) of (\d+)/i);

    if (match && parseInt(match[2]) > 1) {
      // We have multiple pages, test navigation
      const nextButton = page.getByRole('button', { name: /next/i });
      await expect(nextButton).toBeEnabled();

      // Click next
      await nextButton.click();

      // Verify page changed
      await expect(page.getByText(/page 2 of/i)).toBeVisible();

      // Previous should now be enabled
      const prevButton = page.getByRole('button', { name: /previous/i });
      await expect(prevButton).toBeEnabled();

      // Go back
      await prevButton.click();
      await expect(page.getByText(/page 1 of/i)).toBeVisible();
    }
  });
});

/**
 * Test: Theme toggle
 * Requirements: 1.4
 */
test.describe('Theme toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/');

    // Find the theme toggle button
    const themeButton = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    await expect(themeButton).toBeVisible();

    // Get initial state
    const initialLabel = await themeButton.getAttribute('aria-label');

    // Click to toggle
    await themeButton.click();

    // Verify the label changed
    const newLabel = await themeButton.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });
});
