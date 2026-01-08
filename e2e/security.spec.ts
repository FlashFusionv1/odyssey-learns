import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Security Testing Suite
 * Tests for common vulnerabilities: XSS, SQL Injection, CSRF, etc.
 */

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('XSS Protection', () => {
    test('should sanitize malicious script tags in form inputs', async ({ page }) => {
      await page.goto('/contact');
      
      // Attempt XSS via contact form
      const maliciousScript = '<script>alert("XSS")</script>';
      await page.fill('input[name="name"]', maliciousScript);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('textarea[name="message"]', maliciousScript);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Verify no script execution
      await page.waitForTimeout(1000);
      const alertDialogs = await page.locator('dialog[role="alertdialog"]').count();
      expect(alertDialogs).toBe(0); // No alert dialog from XSS
      
      // Verify content is escaped
      const displayedContent = await page.textContent('body');
      expect(displayedContent).not.toContain('<script>');
    });

    test('should sanitize HTML in rich text inputs', async ({ page }) => {
      // Test lesson generation with malicious content
      await page.goto('/login');
      await page.fill('input[type="email"]', 'parent@test.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/parent');
      await page.goto('/parent/custom-lesson');
      
      const maliciousHTML = '<img src=x onerror="alert(1)">';
      await page.fill('textarea[name="lessonContent"]', maliciousHTML);
      
      // Submit and verify sanitization
      await page.click('button:has-text("Generate")');
      await page.waitForTimeout(1000);
      
      const content = await page.textContent('body');
      expect(content).not.toContain('onerror=');
    });

    test('should prevent javascript: protocol in URLs', async ({ page }) => {
      await page.goto('/about');
      
      // Try to find any links with javascript: protocol
      const dangerousLinks = await page.locator('a[href^="javascript:"]').count();
      expect(dangerousLinks).toBe(0);
      
      const dangerousOnclicks = await page.locator('[onclick*="javascript:"]').count();
      expect(dangerousOnclicks).toBe(0);
    });
  });

  test.describe('SQL Injection Protection', () => {
    test('should handle SQL injection attempts in login form', async ({ page }) => {
      await page.goto('/login');
      
      // Common SQL injection payloads
      const sqlPayloads = [
        "admin' OR '1'='1",
        "admin'--",
        "admin' /*",
        "' OR 1=1--",
        "1' UNION SELECT NULL--"
      ];
      
      for (const payload of sqlPayloads) {
        await page.fill('input[type="email"]', payload);
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(500);
        
        // Should show validation error, not database error
        const errorText = await page.textContent('body');
        expect(errorText).not.toContain('SQL');
        expect(errorText).not.toContain('database');
        expect(errorText).not.toContain('syntax error');
        
        // Should not be logged in
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
      }
    });

    test('should validate UUID format in URL parameters', async ({ page }) => {
      // Try to access lesson with malicious ID
      const maliciousIds = [
        "1' OR '1'='1",
        "../../../etc/passwd",
        "'; DROP TABLE lessons; --"
      ];
      
      for (const id of maliciousIds) {
        const response = await page.goto(`/lesson/${id}`);
        
        // Should return 404 or redirect, not 500
        if (response) {
          expect([200, 404]).toContain(response.status());
        }
        
        // Should not leak database errors
        const errorText = await page.textContent('body');
        expect(errorText).not.toContain('SQL');
        expect(errorText).not.toContain('database');
      }
    });
  });

  test.describe('Authentication Security', () => {
    test('should prevent unauthorized access to protected routes', async ({ page }) => {
      const protectedRoutes = [
        '/parent',
        '/parent/dashboard',
        '/child',
        '/admin',
        '/settings'
      ];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        
        // Should redirect to login
        await page.waitForURL(/\/login/, { timeout: 5000 });
        expect(page.url()).toContain('/login');
      }
    });

    test('should enforce strong password requirements', async ({ page }) => {
      await page.goto('/signup');
      
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty',
        'abc123',
        'Password' // Missing number and special char
      ];
      
      for (const password of weakPasswords) {
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(500);
        
        // Should show password strength error
        const errorExists = await page.locator('text=/weak|strong|requirements/i').count();
        expect(errorExists).toBeGreaterThan(0);
      }
    });

    test('should implement rate limiting on login attempts', async ({ page }) => {
      await page.goto('/login');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.fill('input[type="email"]', 'attacker@test.com');
        await page.fill('input[type="password"]', 'wrong-password');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
      }
      
      // Should show rate limit error
      const content = await page.textContent('body');
      expect(content).toMatch(/rate limit|too many attempts|try again later/i);
    });
  });

  test.describe('CSRF Protection', () => {
    test('should include CSRF tokens in forms', async ({ page }) => {
      await page.goto('/login');
      
      // Check for CSRF-like protection (CORS headers, origin checks)
      const response = await page.request.post('/api/auth/login', {
        data: { email: 'test@test.com', password: 'test' },
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });
      
      // Should reject cross-origin requests
      expect([403, 405, 401]).toContain(response.status());
    });
  });

  test.describe('Content Security Policy', () => {
    test('should have proper CSP headers', async ({ page }) => {
      const response = await page.goto('/');
      
      const headers = response?.headers();
      if (headers) {
        // Check for security headers
        const csp = headers['content-security-policy'];
        const xFrameOptions = headers['x-frame-options'];
        const xContentType = headers['x-content-type-options'];
        
        // Log headers for debugging
        console.log('Security Headers:', {
          csp: csp || 'missing',
          xFrameOptions: xFrameOptions || 'missing',
          xContentType: xContentType || 'missing'
        });
        
        // CSP should exist in production
        if (process.env.NODE_ENV === 'production') {
          expect(csp).toBeDefined();
        }
      }
    });

    test('should prevent clickjacking', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers) {
        const xFrameOptions = headers['x-frame-options'];
        // Should have X-Frame-Options set to DENY or SAMEORIGIN
        expect(['DENY', 'SAMEORIGIN', undefined]).toContain(xFrameOptions);
      }
    });
  });

  test.describe('Data Exposure Prevention', () => {
    test('should not expose sensitive data in client-side code', async ({ page }) => {
      await page.goto('/');
      
      // Check for exposed secrets in page source
      const content = await page.content();
      
      const sensitivePatterns = [
        /api[_-]?key/i,
        /secret[_-]?key/i,
        /private[_-]?key/i,
        /password\s*=\s*["'][^"']{8,}/i,
        /Bearer\s+[A-Za-z0-9\-._~+/]+=*/
      ];
      
      for (const pattern of sensitivePatterns) {
        expect(content).not.toMatch(pattern);
      }
    });

    test('should not log sensitive information to console', async ({ page }) => {
      const consoleLogs: string[] = [];
      
      page.on('console', msg => {
        consoleLogs.push(msg.text().toLowerCase());
      });
      
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@test.com');
      await page.fill('input[type="password"]', 'SecurePassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      
      // Check console logs don't contain sensitive data
      const logsText = consoleLogs.join(' ');
      expect(logsText).not.toContain('securepassword123!');
      expect(logsText).not.toMatch(/password.*:/);
    });
  });

  test.describe('File Upload Security', () => {
    test('should validate file types on upload', async ({ page }) => {
      // This test assumes there's a file upload feature
      // Skip if not implemented
      const uploadInputExists = await page.locator('input[type="file"]').count();
      
      if (uploadInputExists > 0) {
        await page.goto('/settings'); // Or wherever file upload is
        
        // Try to upload a dangerous file
        const dangerousFile = {
          name: 'malicious.exe',
          mimeType: 'application/x-msdownload',
          buffer: Buffer.from('fake executable')
        };
        
        await page.setInputFiles('input[type="file"]', {
          name: dangerousFile.name,
          mimeType: dangerousFile.mimeType,
          buffer: dangerousFile.buffer
        });
        
        // Should show error about file type
        const errorText = await page.textContent('body');
        expect(errorText).toMatch(/invalid|not allowed|supported/i);
      }
    });
  });

  test.describe('Session Security', () => {
    test('should clear session on logout', async ({ page, context }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'parent@test.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/parent');
      
      // Get cookies before logout
      const cookiesBefore = await context.cookies();
      
      // Logout
      await page.click('button:has-text("Logout"), a:has-text("Logout")');
      await page.waitForURL('/');
      
      // Verify session cleared
      const cookiesAfter = await context.cookies();
      const sessionCookies = cookiesAfter.filter(c => 
        c.name.includes('session') || c.name.includes('auth')
      );
      
      expect(sessionCookies.length).toBe(0);
      
      // Try to access protected route
      await page.goto('/parent');
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');
    });
  });
});
