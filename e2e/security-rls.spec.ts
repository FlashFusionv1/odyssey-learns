import { test, expect } from '@playwright/test';
import { supabase } from '../src/integrations/supabase/client';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

test.describe('RLS Policy Security Tests', () => {
  test.describe('Public Data Exposure Prevention', () => {
    test('anonymous users cannot access creator_rewards table', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/creator_rewards`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      // Should return 401 or empty result with RLS blocking access
      expect([200, 401, 403]).toContain(response.status());
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toEqual([]); // Should return empty array if 200
      }
    });

    test('anonymous users cannot access lesson_performance_metrics', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/lesson_performance_metrics`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([200, 401, 403]).toContain(response.status());
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toEqual([]);
      }
    });

    test('anonymous users cannot access daily_lesson_stats', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/daily_lesson_stats`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([200, 401, 403]).toContain(response.status());
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toEqual([]);
      }
    });

    test('anonymous users cannot access emotion_logs', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/emotion_logs`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([401, 403]).toContain(response.status());
    });

    test('anonymous users cannot access user_progress', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/user_progress`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('Cross-Parent Data Access Prevention', () => {
    let parentAToken: string;
    let parentBToken: string;
    let childAId: string;
    let childBId: string;

    test.beforeAll(async () => {
      // This would require test data setup
      // For now, we'll skip this in the actual test run
      test.skip();
    });

    test('Parent A cannot query Parent B child data', async ({ request }) => {
      test.skip(); // Requires test user setup
      
      const response = await request.get(`${SUPABASE_URL}/rest/v1/children?id=eq.${childBId}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${parentAToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]); // Should return empty, not error
    });

    test('Parent A cannot access Parent B emotion logs', async ({ request }) => {
      test.skip();
      
      const response = await request.get(`${SUPABASE_URL}/rest/v1/emotion_logs?child_id=eq.${childBId}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${parentAToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]);
    });

    test('Parent A cannot update Parent B child profile', async ({ request }) => {
      test.skip();
      
      const response = await request.patch(
        `${SUPABASE_URL}/rest/v1/children?id=eq.${childBId}`,
        {
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${parentAToken}`,
            'Content-Type': 'application/json'
          },
          data: { name: 'Hacked Name' }
        }
      );
      
      expect([401, 403, 404]).toContain(response.status());
    });
  });

  test.describe('Sensitive Table Access Control', () => {
    test('error_logs table has restrictive policies', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/error_logs`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([401, 403]).toContain(response.status());
    });

    test('security_access_log requires authentication', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/security_access_log`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([401, 403]).toContain(response.status());
    });

    test('beta_feedback requires authentication', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/beta_feedback`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([401, 403]).toContain(response.status());
    });

    test('api_rate_limits table not publicly accessible', async ({ request }) => {
      const response = await request.get(`${SUPABASE_URL}/rest/v1/api_rate_limits`, {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect([401, 403]).toContain(response.status());
    });
  });
});
