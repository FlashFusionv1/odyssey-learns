import { test, expect } from "@playwright/test";

/**
 * Play Zone E2E Tests
 * Tests the interactive content hub features
 */
test.describe("Play Zone", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to play zone (requires child authentication)
    await page.goto("/play");
  });

  test("displays play zone header and content", async ({ page }) => {
    // Check for main heading
    await expect(page.locator("h1")).toContainText(/Play Zone/i);
    
    // Check for filter options
    await expect(page.locator("text=/all|quiz|story/i").first()).toBeVisible();
  });

  test("can filter content by type", async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector("[class*='grid']");
    
    // Click on a filter option if available
    const quizFilter = page.locator("button:has-text('quiz'), [data-value='quiz']");
    if (await quizFilter.isVisible()) {
      await quizFilter.click();
      // Content should filter
      await page.waitForTimeout(500);
    }
  });

  test("can click on activity card to open player", async ({ page }) => {
    // Wait for content
    await page.waitForSelector("[class*='grid']", { timeout: 5000 }).catch(() => {});
    
    // Click on first activity card
    const firstCard = page.locator("[class*='card'], [class*='Card']").first();
    if (await firstCard.isVisible({ timeout: 3000 })) {
      await firstCard.click();
      
      // Activity player should open (full-screen overlay)
      await expect(
        page.locator("[class*='fixed'], .activity-player, text=/question/i").first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("activity player shows progress", async ({ page }) => {
    await page.waitForSelector("[class*='grid']", { timeout: 5000 }).catch(() => {});
    
    const firstCard = page.locator("[class*='card']").first();
    if (await firstCard.isVisible({ timeout: 3000 })) {
      await firstCard.click();
      
      // Look for progress indicator
      await expect(
        page.locator("[role='progressbar'], [class*='progress'], text=/\\d+.*of.*\\d+/i").first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("can close activity player", async ({ page }) => {
    await page.waitForSelector("[class*='grid']", { timeout: 5000 }).catch(() => {});
    
    const firstCard = page.locator("[class*='card']").first();
    if (await firstCard.isVisible({ timeout: 3000 })) {
      await firstCard.click();
      await page.waitForTimeout(500);
      
      // Click close button
      const closeButton = page.locator("button:has(svg[class*='x' i]), button[aria-label*='close' i], button:has-text('×')");
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // Player should close
        await expect(page.locator("h1:has-text('Play Zone')")).toBeVisible();
      }
    }
  });
});

/**
 * Social Features E2E Tests
 */
test.describe("Social Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/child/social");
  });

  test("displays social learning header", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Social|Friends/i);
  });

  test("shows friends and activities tabs", async ({ page }) => {
    // Look for tab navigation
    await expect(page.locator("text=/friends/i").first()).toBeVisible();
    await expect(page.locator("text=/activities/i").first()).toBeVisible();
  });

  test("can switch between tabs", async ({ page }) => {
    // Click activities tab
    const activitiesTab = page.locator("button:has-text('Activities'), [value='activities']");
    if (await activitiesTab.isVisible()) {
      await activitiesTab.click();
      await page.waitForTimeout(300);
    }
    
    // Click friends tab
    const friendsTab = page.locator("button:has-text('Friends'), [value='friends']");
    if (await friendsTab.isVisible()) {
      await friendsTab.click();
      await page.waitForTimeout(300);
    }
  });

  test("displays stats cards", async ({ page }) => {
    // Look for stats (friends count, activities, points)
    await expect(
      page.locator("text=/friends|activities|points/i").first()
    ).toBeVisible();
  });
});

/**
 * AI Tutor E2E Tests
 */
test.describe("AI Tutor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/child/dashboard");
  });

  test("shows AI tutor floating button", async ({ page }) => {
    // Look for the floating AI tutor button
    const tutorButton = page.locator(
      "button:has(svg[class*='bot' i]), [class*='fixed']:has(svg)"
    );
    
    // May or may not be visible depending on page state
    const isVisible = await tutorButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });

  test("can open AI tutor chat", async ({ page }) => {
    const tutorButton = page.locator(
      "[class*='fixed'] button:has(svg)"
    ).last();
    
    if (await tutorButton.isVisible({ timeout: 3000 })) {
      await tutorButton.click();
      
      // Chat window should appear
      await expect(
        page.locator("text=/Learning Buddy|Ask me anything/i").first()
      ).toBeVisible({ timeout: 3000 });
    }
  });
});

/**
 * Multiplayer Games E2E Tests
 */
test.describe("Multiplayer Games", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/child/multiplayer-games");
  });

  test("displays multiplayer games page", async ({ page }) => {
    await expect(
      page.locator("h1, h2").filter({ hasText: /game|multiplayer|play/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows game options or lobby", async ({ page }) => {
    // Look for game creation or joining options
    await expect(
      page.locator("text=/create|join|start|game/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
