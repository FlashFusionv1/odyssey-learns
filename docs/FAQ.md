# Frequently Asked Questions

Common issues and solutions for Inner Odyssey development.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Database & RLS Issues](#database--rls-issues)
3. [Build & Development Issues](#build--development-issues)
4. [PWA Issues](#pwa-issues)
5. [Testing Issues](#testing-issues)
6. [Performance Issues](#performance-issues)
7. [Edge Function Issues](#edge-function-issues)

---

## Authentication Issues

### Q: Users can't log in, getting "Invalid credentials"

**Common causes:**
1. **Email not verified**: In production, emails must be verified. Check Supabase auth settings.
2. **Wrong credentials**: Reset password via `/reset-password`.
3. **Rate limiting**: Too many failed attempts. Wait 15 minutes.

**Solution:**
```typescript
// Check auth state in browser console
const { data, error } = await supabase.auth.getUser();
console.log('User:', data, 'Error:', error);
```

---

### Q: Session keeps expiring unexpectedly

**Cause**: Session timeout is set to 60 minutes by default.

**Solution**: Adjust in `src/hooks/useSessionTimeout.tsx`:
```typescript
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const WARNING_BEFORE_MS = 5 * 60 * 1000;   // Warn 5 min before
```

---

### Q: Google OAuth returns "redirect_uri_mismatch"

**Cause**: Redirect URL not configured in Google Cloud Console.

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Add authorized redirect URIs:
   - Development: `http://localhost:8080`
   - Production: `https://yourapp.lovable.app`
   - Supabase callback: `https://<project-ref>.supabase.co/auth/v1/callback`

---

## Database & RLS Issues

### Q: "new row violates row-level security policy"

**Cause**: RLS policy blocking INSERT/UPDATE operation.

**Solution:**
1. Check the table's RLS policies in Supabase
2. Ensure the policy allows the operation for the current user
3. Common fix - add INSERT policy:
```sql
CREATE POLICY "Users can insert own data" ON my_table
FOR INSERT WITH CHECK (user_id = auth.uid());
```

---

### Q: Query returns empty array when data exists

**Common causes:**
1. **RLS blocking**: User doesn't have permission
2. **Wrong filter**: Query filter doesn't match data
3. **Row limit**: Supabase defaults to 1000 rows

**Debugging:**
```typescript
// Add explicit logging
const { data, error, status } = await supabase
  .from('my_table')
  .select('*')
  .eq('user_id', userId);

console.log('Status:', status, 'Data:', data, 'Error:', error);
```

---

### Q: "infinite recursion detected in policy"

**Cause**: RLS policy references itself through foreign keys.

**Solution**: Use security definer functions:
```sql
CREATE OR REPLACE FUNCTION get_user_children(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM children WHERE parent_id = user_uuid;
$$;

-- Then in policy:
CREATE POLICY "Access child data" ON user_progress
FOR SELECT USING (
  child_id IN (SELECT get_user_children(auth.uid()))
);
```

---

### Q: .single() returns PGRST116 error

**Cause**: Query returned 0 or 2+ rows, but `.single()` expects exactly 1.

**Solution**: Use `.maybeSingle()` for 0-1 rows:
```typescript
// Before (throws on 0 rows)
const { data } = await supabase.from('profiles').select('*').eq('id', id).single();

// After (returns null on 0 rows)
const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
```

---

## Build & Development Issues

### Q: "Module not found" for recently added file

**Solutions:**
1. Stop and restart dev server: `Ctrl+C`, then `npm run dev`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check file path case sensitivity (especially on Linux)

---

### Q: TypeScript error after database migration

**Cause**: Types file out of sync with database schema.

**Solution**: In Lovable, types regenerate automatically after migrations. Wait 30 seconds and refresh.

---

### Q: Build fails with "heap out of memory"

**Solution**: Increase Node memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## PWA Issues

### Q: App not prompting for install

**Requirements for PWA install prompt:**
1. HTTPS (or localhost)
2. Valid `manifest.json`
3. Registered service worker
4. User engaged with the page (scrolled, clicked)

**Debug:**
```javascript
// Check installability in browser console
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available!', e);
});
```

---

### Q: Cached content not updating

**Cause**: Service worker serving stale cache.

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear site data: DevTools → Application → Clear Storage
3. Increment version in `src/config/pwaVersion.ts`

---

### Q: Push notifications not working

**Checklist:**
1. HTTPS enabled (required for push)
2. Notification permission granted
3. Service worker registered
4. Push subscription created and stored

---

## Testing Issues

### Q: E2E tests failing with "timeout"

**Common causes:**
1. **Slow CI**: Increase timeout in `playwright.config.ts`
2. **Element not found**: Add `await page.waitForSelector()`
3. **Network request pending**: Use `await page.waitForLoadState('networkidle')`

**Solution:**
```typescript
// In playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
});
```

---

### Q: Unit tests failing with "supabase is not defined"

**Cause**: Supabase client not mocked in tests.

**Solution**: Use the mock in `src/test/mocks/supabase.ts`:
```typescript
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));
```

---

## Performance Issues

### Q: Page takes too long to load

**Checklist:**
1. **Lazy load routes**: Use `React.lazy()` in `src/config/lazyRoutes.ts`
2. **Optimize images**: Use WebP, add dimensions
3. **Reduce bundle**: Check for large dependencies
4. **Prefetch**: Use `useRoutePreload` hook

**Debug:**
```bash
# Analyze bundle
npm run build -- --analyze
```

---

### Q: React Query making too many requests

**Cause**: Stale time too short or missing.

**Solution**: Set appropriate stale times:
```typescript
import { STALE_TIMES } from '@/lib/queryConfig';

useQuery({
  queryKey: ['lessons'],
  queryFn: fetchLessons,
  staleTime: STALE_TIMES.CONTENT, // 10 minutes
});
```

---

## Edge Function Issues

### Q: Edge function returns 500 error

**Debugging steps:**
1. Check logs: Lovable Cloud → Edge Function Logs
2. Test locally: `supabase functions serve`
3. Check for missing environment variables

**Common causes:**
- Missing `Authorization` header
- Invalid JSON body
- Unhandled promise rejection

---

### Q: CORS error calling edge function

**Solution**: Add CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

---

### Q: Edge function timeout

**Cause**: Functions timeout after 60 seconds.

**Solutions:**
1. Optimize slow operations
2. Use background tasks for long operations
3. Break into smaller functions

---

## Still Stuck?

1. **Search existing issues**: Check GitHub Issues
2. **Check logs**: Browser console + network tab + Supabase logs
3. **Ask community**: Discord channel
4. **File a bug**: Create GitHub issue with reproduction steps

---

**Pro Tips:**
- Always check browser console first
- Use React Query DevTools (`npm i @tanstack/react-query-devtools`)
- Enable Supabase debug mode: `supabase.auth.debug = true`
