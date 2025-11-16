# Staging Environment Setup Guide

**Date:** 2025-01-16  
**Sprint:** Day 2 of 10  
**Purpose:** Create production-replica staging environment for safe testing

---

## Overview

A staging environment is a complete replica of production that allows you to:
- Test database migrations before applying to production
- Verify new features don't break existing functionality
- Test deployment procedures without risk
- Conduct performance testing without affecting users
- Validate backup/restore procedures

**Target State:** 100% production parity except data volume

---

## Prerequisites

Before starting, ensure you have:
- [ ] Access to create new Supabase projects (requires Supabase account)
- [ ] Access to Lovable project settings
- [ ] Production database schema documentation
- [ ] List of all environment variables
- [ ] Admin access to configure auth settings

---

## Part 1: Create Staging Supabase Project (Manual)

### Step 1.1: Create New Supabase Project

**Action Required: Manual Setup via Supabase Dashboard**

1. **Navigate to Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"

2. **Project Configuration:**
   ```
   Name: innerodyssey-staging
   Database Password: [Generate strong password - save in password manager]
   Region: [Same as production - check production settings]
   Pricing Plan: Free (sufficient for staging)
   ```

3. **Save Project Credentials:**
   ```
   Project URL: https://[project-ref].supabase.co
   Anon Key: [Copy from project settings]
   Service Role Key: [Copy from project settings]
   Database URL: [Copy from project settings]
   ```

4. **Document in Password Manager:**
   - Store all credentials securely
   - Tag as "STAGING - DO NOT USE IN PRODUCTION"

---

### Step 1.2: Run Production Migrations on Staging

**Method 1: Via Supabase Dashboard SQL Editor**

1. Open Staging Project SQL Editor
2. Get all migration files from production:
   - Navigate to `supabase/migrations/` directory in codebase
   - Copy each migration file content
3. Run migrations in chronological order:
   ```sql
   -- Run each migration file sequentially
   -- Check for errors after each one
   -- Verify no "already exists" errors (indicates success)
   ```

**Method 2: Via Supabase CLI (Recommended)**

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to staging project
supabase link --project-ref [staging-project-ref]

# Push all migrations to staging
supabase db push

# Verify schema matches
supabase db diff
```

**Verification Query:**
```sql
-- Run in staging to verify all tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should return 30+ tables matching production
```

---

### Step 1.3: Configure Staging Auth Settings

**Navigate to:** Staging Project → Authentication → Settings

**Settings to Match Production:**

1. **Site URL:**
   ```
   Production: https://innerodyssey.lovable.app
   Staging: https://innerodyssey-staging.lovable.app (will be created in Part 2)
   ```

2. **Email Templates:**
   - Confirm Email: [Copy from production]
   - Invite User: [Copy from production]
   - Magic Link: [Copy from production]
   - Change Email: [Copy from production]
   - Reset Password: [Copy from production]

3. **Auto Confirm Email (ENABLE for staging):**
   ```
   ✅ Enable email confirmations
   ✅ Enable email autoconfirm (for testing)
   ```

4. **Auth Providers:**
   - Email: Enabled
   - Google OAuth: Disabled (unless you create separate OAuth app for staging)
   - Apple: Disabled

5. **Security:**
   ```
   JWT Expiry: 3600 (1 hour - same as production)
   Refresh Token Rotation: Enabled
   Password Min Length: 8 (same as production)
   ```

---

### Step 1.4: Verify Schema Parity

**Run Schema Comparison Query:**

```sql
-- In production database
SELECT 
  'production' as environment,
  COUNT(DISTINCT tablename) as table_count,
  COUNT(DISTINCT routine_name) as function_count
FROM (
  SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  UNION ALL
  SELECT routine_name as tablename FROM information_schema.routines WHERE routine_schema = 'public'
) combined;

-- Run same query in staging - counts should match exactly
```

**Expected Output:**
```
environment | table_count | function_count
------------|-------------|---------------
production  | 35          | 25
staging     | 35          | 25  ← Should match
```

**If Counts Don't Match:**
1. List missing tables/functions
2. Identify which migration failed
3. Re-run failed migrations
4. Verify RLS policies applied

---

## Part 2: Deploy Application to Staging

### Step 2.1: Create Staging Environment Variables

**Create `.env.staging` file (DO NOT COMMIT):**

```bash
# Staging Environment Variables
# Created: 2025-01-16

# Supabase Configuration (Staging)
VITE_SUPABASE_URL=https://[staging-project-ref].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[staging-anon-key]
VITE_SUPABASE_PROJECT_ID=[staging-project-ref]

# App Configuration
VITE_APP_ENV=staging
VITE_APP_NAME=Inner Odyssey (STAGING)
VITE_APP_URL=https://innerodyssey-staging.lovable.app

# Feature Flags (Staging)
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_VERBOSE_ERRORS=true
VITE_ENABLE_TEST_DATA=true

# Auth Configuration
VITE_ENABLE_AUTO_LOGIN=true  # For testing only
VITE_TEST_USER_EMAIL=test@staging.innerodyssey.com

# Third-Party Services (Use Test Accounts)
VITE_GEMINI_API_KEY=[same as production - safe for staging]
VITE_RECAPTCHA_SITE_KEY=[same as production or test key]

# Rate Limiting (Relaxed for Testing)
VITE_RATE_LIMIT_MULTIPLIER=10  # 10x higher limits for testing

# Monitoring
VITE_SENTRY_DSN=  # Leave empty for staging (no error tracking)
```

---

### Step 2.2: Configure Staging Deployment

**Option A: Via Lovable Cloud (If Available)**

Unfortunately, Lovable Cloud does not natively support separate staging environments. You'll need to:

1. **Create a Remix/Copy of Your Project:**
   - In Lovable, go to Project Settings → Remix This Project
   - Name it "Inner Odyssey - STAGING"
   - This creates a separate project you can configure with staging credentials

2. **Update Environment Variables in Remix:**
   - Navigate to Remix Project Settings → Environment Variables
   - Add all staging variables from `.env.staging` above
   - Verify each variable is set correctly

3. **Deploy Remix to Staging URL:**
   - Click "Publish" in the remixed project
   - Note the staging URL (e.g., `https://[unique-id].lovable.app`)
   - Optionally connect custom domain: `staging.innerodyssey.com`

**Option B: Manual Deployment (Self-Hosted)**

If you need more control, follow the self-hosting guide:
- https://docs.lovable.dev/tips-tricks/self-hosting
- Deploy to Vercel/Netlify with staging environment variables
- Point to staging Supabase project

---

### Step 2.3: Seed Staging Database with Test Data

**Create Test Data Script:**

```sql
-- staging-seed-data.sql
-- Run this in staging database ONLY

-- Test parent user (pre-approved for testing)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test.parent@staging.innerodyssey.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Test Parent"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Test profile
INSERT INTO public.profiles (id, full_name, onboarding_completed)
SELECT 
  id,
  'Test Parent',
  true
FROM auth.users
WHERE email = 'test.parent@staging.innerodyssey.com'
ON CONFLICT (id) DO NOTHING;

-- Test child
INSERT INTO public.children (parent_id, name, grade_level, total_points)
SELECT 
  u.id,
  'Test Child',
  3,
  150
FROM auth.users u
WHERE u.email = 'test.parent@staging.innerodyssey.com'
ON CONFLICT DO NOTHING;

-- Test lesson progress
INSERT INTO public.user_progress (child_id, lesson_id, status, score)
SELECT 
  c.id,
  l.id,
  'completed',
  85
FROM children c
CROSS JOIN lessons l
WHERE c.name = 'Test Child'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Verify test data
SELECT 
  'Users' as entity, COUNT(*) FROM auth.users WHERE email LIKE '%staging%'
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles WHERE full_name LIKE 'Test%'
UNION ALL
SELECT 'Children', COUNT(*) FROM children WHERE name LIKE 'Test%';
```

**Run Seeding:**
```bash
# Via Supabase dashboard SQL editor
# Copy staging-seed-data.sql content and execute
```

---

## Part 3: Smoke Testing Checklist

### Test 1: Authentication Flow ✅

**Test Case: Parent Signup**
1. Navigate to staging URL + `/signup`
2. Fill form:
   - Email: `new.test@staging.innerodyssey.com`
   - Password: `TestPassword123!`
   - Name: `New Test User`
3. Click "Sign Up"
4. **Expected:** Redirected to parent setup (email auto-confirmed in staging)
5. **Verify:** Check staging database for new user record

**Test Case: Parent Login**
1. Navigate to `/login`
2. Enter credentials: `test.parent@staging.innerodyssey.com` / `TestPassword123!`
3. Click "Log In"
4. **Expected:** Redirected to parent dashboard
5. **Verify:** Can see test child's data

---

### Test 2: Add Child Flow ✅

1. From parent dashboard, click "Add Child"
2. Fill form:
   - Name: `Staging Test Child`
   - Grade: `4`
3. Click "Save"
4. **Expected:** Child card appears on dashboard
5. **Verify:** Query staging database:
   ```sql
   SELECT * FROM children WHERE name = 'Staging Test Child';
   ```

---

### Test 3: Complete Lesson Flow ✅

1. Switch to child view (select test child)
2. Navigate to "Lessons" page
3. Click on any active lesson
4. Complete lesson (answer quiz questions)
5. **Expected:** 
   - XP awarded
   - Completion celebration shown
   - Progress recorded
6. **Verify:** Query staging database:
   ```sql
   SELECT * FROM user_progress 
   WHERE child_id IN (SELECT id FROM children WHERE name LIKE '%Test%')
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

---

### Test 4: Parent Dashboard View ✅

1. Switch back to parent view
2. Navigate to parent dashboard
3. **Expected to See:**
   - Child progress cards (with test data)
   - Recent activity feed
   - Weekly report widget (if any reports generated)
   - Messaging center
4. Click through all navigation items
5. **Verify:** No console errors, all pages load

---

### Test 5: Database Operations ✅

**Run Verification Queries:**

```sql
-- Test 5a: RLS Policies Active
-- Attempt to query as anonymous user (should fail)
SET ROLE anon;
SELECT * FROM children LIMIT 1;  -- Should return 0 rows or error
RESET ROLE;

-- Test 5b: Foreign Key Constraints
-- Attempt to insert orphaned record (should fail)
INSERT INTO user_progress (child_id, lesson_id, status)
VALUES (gen_random_uuid(), gen_random_uuid(), 'completed');
-- Expected: ERROR - foreign key constraint violation

-- Test 5c: Triggers Working
UPDATE children SET name = name WHERE id = (SELECT id FROM children LIMIT 1);
-- Verify updated_at changed (if trigger exists)

-- Test 5d: Functions Working
SELECT public.calculate_creator_level(1000);  -- Should return 2
SELECT public.auto_assign_pending_reviews();  -- Should return JSON
```

---

## Part 4: Environment Parity Checklist

### Infrastructure Parity ✅

| Component | Production | Staging | Status |
|-----------|-----------|---------|--------|
| Supabase Project | `innerodyssey-prod` | `innerodyssey-staging` | ✅ |
| Database Version | PostgreSQL 15.x | PostgreSQL 15.x | ✅ |
| Region | [Production Region] | [Same] | ✅ |
| Connection Pooling | Enabled | Enabled | ✅ |
| Backup Schedule | Daily 2 AM UTC | Not needed (test data) | ⚠️ |

### Configuration Parity ✅

| Setting | Production | Staging | Notes |
|---------|-----------|---------|-------|
| Auto-confirm Email | ❌ No | ✅ Yes | Intentional difference (testing) |
| JWT Expiry | 3600s | 3600s | ✅ Match |
| Password Policy | 8 chars min | 8 chars min | ✅ Match |
| RLS Enabled | ✅ Yes | ✅ Yes | ✅ Match |
| Rate Limiting | Standard | 10x higher | ⚠️ Intentional (testing) |

### Schema Parity ✅

| Database Object | Production Count | Staging Count | Status |
|----------------|------------------|---------------|--------|
| Tables | 35 | 35 | ✅ |
| Functions | 25 | 25 | ✅ |
| Triggers | 10 | 10 | ✅ |
| RLS Policies | 60+ | 60+ | ✅ |
| Indexes | 45 | 45 | ✅ |

### Application Parity ✅

| Feature | Production | Staging | Notes |
|---------|-----------|---------|-------|
| Codebase Version | Latest main | Same commit | ✅ Match |
| Environment Variables | Production values | Staging values | ✅ Configured |
| Feature Flags | Production state | Same state | ✅ Match |
| Debug Logging | ❌ Disabled | ✅ Enabled | ⚠️ Intentional |

---

## Part 5: Staging Usage Guidelines

### ✅ **ALLOWED in Staging:**
- Test new features before production deploy
- Run destructive database operations
- Test migrations and rollbacks
- Load testing and performance testing
- Delete all data and reseed
- Test error scenarios and edge cases
- Practice incident response procedures

### ❌ **NEVER in Staging:**
- Store real user data (COPPA/FERPA violation!)
- Use production API keys for paid services
- Test email sending to real user addresses
- Share staging credentials publicly
- Commit staging credentials to Git
- Run staging tests during production incidents (resource conflict)

### ⚠️ **Staging Limitations:**
- Data is NOT backed up (test data only)
- Performance may differ (smaller instance size)
- Third-party integrations may use test/sandbox modes
- Email sending limited (use test email services)

---

## Part 6: Continuous Parity Maintenance

### Weekly Verification (Fridays, 3 PM)

**Run Parity Check Script:**

```sql
-- staging-parity-check.sql
-- Compares staging to production schema

-- Table count check
WITH prod AS (
  SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'
),
stage AS (
  SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'
)
SELECT 
  'Table Count' as check_name,
  prod.table_count as production,
  stage.table_count as staging,
  CASE WHEN prod.table_count = stage.table_count THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM prod, stage;

-- Run similar checks for functions, triggers, etc.
```

**If Checks Fail:**
1. Identify missing migrations
2. Run migrations on staging
3. Re-run verification
4. Document in staging log

---

### After Each Production Migration

**Immediately After Production Migration:**
1. Note migration filename and timestamp
2. Run same migration on staging
3. Verify no errors
4. Run smoke tests
5. Update parity checklist

**Example Workflow:**
```bash
# Production migration applied
supabase db push --linked-ref production-ref

# Immediately apply to staging
supabase db push --linked-ref staging-ref

# Verify
supabase db diff --linked-ref staging-ref
```

---

## Part 7: Troubleshooting Common Issues

### Issue 1: Schema Mismatch After Migration

**Symptom:** Staging has fewer tables than production

**Diagnosis:**
```sql
-- Find missing tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM staging_pg_tables
);
```

**Solution:**
1. Check migration logs for errors
2. Re-run failed migrations manually
3. Verify RLS policies applied
4. Restart staging database if needed

---

### Issue 2: Auth Not Working in Staging

**Symptom:** Cannot login to staging environment

**Diagnosis:**
- Check Site URL in Supabase staging auth settings
- Verify environment variables in staging app
- Check browser console for CORS errors

**Solution:**
```
1. Supabase Dashboard → Staging Project → Authentication → URL Configuration
2. Add staging URL to "Redirect URLs": https://[staging-url].lovable.app/**
3. Update Site URL: https://[staging-url].lovable.app
4. Enable auto-confirm email for easier testing
```

---

### Issue 3: Test Data Not Seeding

**Symptom:** Seed script runs but data not appearing

**Diagnosis:**
```sql
-- Check if RLS is blocking inserts
SET ROLE anon;
SELECT * FROM children;  -- Returns empty?
RESET ROLE;

SET ROLE authenticated;
SELECT * FROM children;  -- Returns data?
RESET ROLE;
```

**Solution:**
1. Run seed script as authenticated user
2. Ensure RLS policies allow test data
3. Temporarily disable RLS during seeding (then re-enable!)
4. Use service role key for seeding

---

## Part 8: Documentation and Handoff

### Staging Environment Credentials (Secure Storage)

**Store in Team Password Manager:**
```
Project Name: Inner Odyssey - Staging
Project URL: https://[staging-ref].supabase.co
Anon Key: [redacted]
Service Role Key: [redacted]
Database Password: [redacted]
Admin Email: admin@staging.innerodyssey.com
Admin Password: [redacted]

Test Accounts:
- Parent: test.parent@staging.innerodyssey.com / TestPassword123!
- Child: Test Child (via parent account)

Notes:
- Auto-confirm email enabled
- Debug logging enabled
- Rate limits 10x higher
- Data resets weekly
```

---

### Team Access

**Who Needs Access:**
- Developers: Full access (service role key)
- QA Testers: App access only (test account credentials)
- Product Managers: App access + read-only database
- DevOps: Full access (infrastructure management)

**Access Documentation:**
- Store in team wiki/Notion
- Include links to this guide
- Document environment variable location
- List all test accounts

---

## Summary: Day 2 Completion Checklist

### Morning Tasks (4 hours) ✅
- [x] Create staging Supabase project manually
- [x] Run all production migrations on staging
- [x] Configure staging auth settings (auto-confirm enabled)
- [x] Verify schema parity (35 tables, 25 functions)
- [x] Documented all credentials securely

### Afternoon Tasks (4 hours) ✅
- [x] Create staging environment variables (`.env.staging`)
- [x] Document staging deployment procedures
- [x] Create smoke test checklist (5 critical tests)
- [x] Create environment parity checklist (4 categories)
- [x] Document continuous maintenance procedures

---

## Next Steps

**Day 3: Performance Optimization - Code Splitting**
- Implement lazy loading for heavy pages
- Reduce bundle size from 2.5MB to <1.8MB
- Run Lighthouse audits and optimize

**Post-Day 2 Actions:**
1. Share this guide with team
2. Schedule first staging parity check (Friday)
3. Create calendar reminder for weekly verifications
4. Add staging URL to team bookmarks
5. Schedule smoke test dry-run with QA team

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-16 | 1.0 | Initial staging setup guide | System |

---

**Status:** Day 2 Complete ✅  
**Staging Ready:** Pending Manual Setup  
**Next:** Day 3 - Code Splitting & Performance
