/**
 * Smoke Tests - Critical Path Validation
 * Run before every deployment to ensure core functionality works
 */
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Paths', () => {
  test.describe('Landing Page', () => {
    test('loads and displays key elements', async ({ page }) => {
      await page.goto('/');
      
      // Check page loads
      await expect(page).toHaveTitle(/Inner Odyssey|Odyssey/i);
      
      // Check hero section
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // Check CTA buttons
      await expect(page.getByRole('link', { name: /get started|sign up|try free/i })).toBeVisible();
    });

    test('navigation links work', async ({ page }) => {
      await page.goto('/');
      
      // Check navigation exists
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Check footer loads
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('login page loads', async ({ page }) => {
      await page.goto('/auth');
      
      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
    });

    test('signup form accessible', async ({ page }) => {
      await page.goto('/auth');
      
      // Look for signup tab/link
      const signupTrigger = page.getByRole('tab', { name: /sign up/i })
        .or(page.getByRole('link', { name: /sign up|create account/i }));
      
      if (await signupTrigger.isVisible()) {
        await signupTrigger.click();
        await expect(page.getByLabel(/email/i)).toBeVisible();
      }
    });

    test('password reset accessible', async ({ page }) => {
      await page.goto('/reset-password');
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });
  });

  test.describe('Public Pages', () => {
    test('features page loads', async ({ page }) => {
      await page.goto('/features');
      await expect(page.locator('main')).toBeVisible();
    });

    test('pricing page loads', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.locator('main')).toBeVisible();
    });

    test('privacy page loads', async ({ page }) => {
      await page.goto('/privacy');
      await expect(page.locator('main')).toBeVisible();
    });

    test('terms page loads', async ({ page }) => {
      await page.goto('/terms');
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('404 page displays for unknown routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345');
      
      // Should show 404 or redirect
      const content = await page.content();
      const is404 = content.includes('404') || content.includes('not found') || content.includes('Not Found');
      const redirectedToHome = page.url().endsWith('/') || page.url().includes('/auth');
      
      expect(is404 || redirectedToHome).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('landing page loads within 5 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('no console errors on landing page', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out known acceptable errors
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('third-party') &&
        !e.includes('deprecated')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Accessibility', () => {
    test('landing page has no critical accessibility issues', async ({ page }) => {
      await page.goto('/');
      
      // Check basic accessibility
      await expect(page.locator('html')).toHaveAttribute('lang');
      await expect(page.getByRole('main').or(page.locator('main'))).toBeVisible();
    });
  });
});
