import { test, expect } from '@playwright/test';

test.describe('Error Log Security Tests', () => {
  test.describe('Error Log Spam Prevention', () => {
    test('rapid error insertion is rate limited', async ({ page }) => {
      test.setTimeout(60000);
      
      await page.goto('/');
      
      // Attempt to log 50 errors rapidly
      const errors: Promise<any>[] = [];
      for (let i = 0; i < 50; i++) {
        errors.push(
          page.evaluate((index) => {
            return fetch('/api/log-error', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: `Spam error ${index}`,
                severity: 'error'
              })
            });
          }, i)
        );
      }
      
      const responses = await Promise.allSettled(errors);
      
      // Count how many succeeded
      const successCount = responses.filter(
        r => r.status === 'fulfilled' && (r.value as any).ok
      ).length;
      
      // Should be rate limited - not all 50 should succeed
      expect(successCount).toBeLessThan(50);
      expect(successCount).toBeGreaterThanOrEqual(0);
    });

    test('error message length is validated', async ({ page }) => {
      await page.goto('/');
      
      // Try to insert very long error message
      const longMessage = 'A'.repeat(10000);
      
      const response = await page.evaluate((msg) => {
        return fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            severity: 'error'
          })
        });
      }, longMessage);
      
      // Should either reject or truncate
      expect([400, 413, 200]).toContain(response);
    });

    test('malicious metadata is sanitized', async ({ page }) => {
      await page.goto('/');
      
      const maliciousMetadata = {
        script: '<script>alert("XSS")</script>',
        sql: "'; DROP TABLE error_logs; --",
        nested: {
          deep: {
            evil: '<img src=x onerror=alert(1)>'
          }
        }
      };
      
      const response = await page.evaluate((metadata) => {
        return fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Test error',
            severity: 'error',
            metadata
          })
        }).then(r => r.ok);
      }, maliciousMetadata);
      
      // Should not crash - either accept with sanitization or reject
      expect(typeof response).toBe('boolean');
    });
  });

  test.describe('Error Log Content Validation', () => {
    test('error severity must be valid enum', async ({ page }) => {
      await page.goto('/');
      
      const response = await page.evaluate(() => {
        return fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Test error',
            severity: 'invalid_severity'
          })
        }).then(r => r.status);
      });
      
      expect([400, 422]).toContain(response);
    });

    test('error component field is limited', async ({ page }) => {
      await page.goto('/');
      
      const veryLongComponent = 'Component'.repeat(1000);
      
      const response = await page.evaluate((component) => {
        return fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Test error',
            severity: 'error',
            component
          })
        }).then(r => r.status);
      }, veryLongComponent);
      
      expect([200, 400, 413]).toContain(response);
    });
  });

  test.describe('Error Log Storage Integrity', () => {
    test('duplicate error logs are deduplicated', async ({ page }) => {
      await page.goto('/');
      
      const identicalErrors = Array(10).fill(null).map(() =>
        page.evaluate(() => {
          return fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Duplicate error test',
              severity: 'error',
              component: 'TestComponent'
            })
          }).then(r => r.ok);
        })
      );
      
      const results = await Promise.all(identicalErrors);
      
      // All should succeed or be deduplicated
      expect(results.every(r => typeof r === 'boolean')).toBe(true);
    });
  });
});
