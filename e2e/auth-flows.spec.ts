import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  test('Complete signup and login flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Click on Sign Up tab
    await page.click('button[value="signup"]');

    // Fill signup form
    await page.fill('#fullName', 'Test Parent');
    await page.fill('#signup-email', testEmail);
    await page.fill('#signup-password', testPassword);
    await page.fill('#confirmPassword', testPassword);

    // Submit signup
    await page.click('button[type=submit]');

    // Should redirect to parent setup
    await page.waitForURL('/parent-setup', { timeout: 10000 });
    expect(page.url()).toContain('/parent-setup');
  });

  test('Login validation shows errors', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type=submit]');

    // Should show validation errors
    await expect(page.locator('text=/email/i')).toBeVisible();
  });

  test('Password reset flow', async ({ page }) => {
    await page.goto('/login');
    await page.click('a:has-text("Forgot password")');

    // Should navigate to reset password page
    await page.waitForURL('/reset-password');

    // Fill email
    await page.fill('[name=email]', 'test@example.com');
    await page.click('button[type=submit]');

    // Should show success message
    await expect(page.locator('text=/check your email/i')).toBeVisible({ timeout: 5000 });
  });

  test('Signup validates password strength', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[value="signup"]');

    // Fill form with weak password
    await page.fill('#fullName', 'Test User');
    await page.fill('#signup-email', testEmail);
    await page.fill('#signup-password', '12345');

    // Should show password strength warning
    await expect(page.locator('text=/weak/i')).toBeVisible();
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type=submit]');

    // Should show error message
    await expect(page.locator('text=/invalid/i')).toBeVisible({ timeout: 5000 });
  });
});
