-- Staging Environment Test Data Seeding Script
-- WARNING: Only run in STAGING environment, never in production!
-- Purpose: Create test users, children, lessons, and sample data for testing
-- Date: 2025-01-16

-- =============================================================================
-- SECTION 1: Test Parent Users
-- =============================================================================

-- Test Parent 1: Primary test account
DO $$
DECLARE
  v_parent_id uuid;
BEGIN
  -- Insert into auth.users (requires service role)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    role
  ) VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'test.parent@staging.innerodyssey.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test Parent Primary"}'::jsonb,
    'authenticated'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  v_parent_id := 'a0000000-0000-0000-0000-000000000001'::uuid;

  -- Insert profile
  INSERT INTO public.profiles (id, full_name, onboarding_completed, created_at)
  VALUES (
    v_parent_id,
    'Test Parent Primary',
    true,
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    onboarding_completed = true;

  RAISE NOTICE 'Created test parent: test.parent@staging.innerodyssey.com';
END $$;

-- Test Parent 2: Secondary test account
DO $$
DECLARE
  v_parent_id uuid;
BEGIN
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    role
  ) VALUES (
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'test.parent2@staging.innerodyssey.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test Parent Secondary"}'::jsonb,
    'authenticated'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  v_parent_id := 'a0000000-0000-0000-0000-000000000002'::uuid;

  INSERT INTO public.profiles (id, full_name, onboarding_completed, created_at)
  VALUES (
    v_parent_id,
    'Test Parent Secondary',
    true,
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name;

  RAISE NOTICE 'Created test parent: test.parent2@staging.innerodyssey.com';
END $$;

-- =============================================================================
-- SECTION 2: Test Children
-- =============================================================================

-- Child 1: Grade 2 (K-2 tier)
INSERT INTO public.children (
  id,
  parent_id,
  name,
  grade_level,
  total_points,
  avatar_config,
  created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Test Child K2',
  2,
  150,
  '{"hair": "short", "color": "brown", "accessory": "glasses"}'::jsonb,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  total_points = EXCLUDED.total_points;

-- Child 2: Grade 4 (3-5 tier)
INSERT INTO public.children (
  id,
  parent_id,
  name,
  grade_level,
  total_points,
  avatar_config,
  challenge_mode_enabled,
  created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Test Child Elementary',
  4,
  450,
  '{"hair": "long", "color": "blonde", "accessory": "headband"}'::jsonb,
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  total_points = EXCLUDED.total_points;

-- Child 3: Grade 7 (6-8 tier)
INSERT INTO public.children (
  id,
  parent_id,
  name,
  grade_level,
  total_points,
  avatar_config,
  challenge_mode_enabled,
  created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Test Child Middle',
  7,
  1200,
  '{"hair": "curly", "color": "black", "accessory": "cap"}'::jsonb,
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  total_points = EXCLUDED.total_points;

-- Child 4: Grade 10 (9-12 tier) - Secondary parent
INSERT INTO public.children (
  id,
  parent_id,
  name,
  grade_level,
  total_points,
  avatar_config,
  challenge_mode_enabled,
  created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000004'::uuid,
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'Test Child High',
  10,
  2500,
  '{"hair": "braids", "color": "red", "accessory": "earrings"}'::jsonb,
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  total_points = EXCLUDED.total_points;

-- =============================================================================
-- SECTION 3: Sample Lesson Progress
-- =============================================================================

-- Create progress for first 5 lessons (completed)
INSERT INTO public.user_progress (child_id, lesson_id, status, score, time_spent_seconds, completed_at, created_at)
SELECT 
  'c0000000-0000-0000-0000-000000000001'::uuid,
  l.id,
  'completed',
  85 + (RANDOM() * 15)::int,  -- Score between 85-100
  600 + (RANDOM() * 600)::int,  -- 10-20 minutes
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY l.created_at))),
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY l.created_at)))
FROM lessons l
WHERE l.is_active = true
AND l.grade_level IN (1, 2)
LIMIT 5
ON CONFLICT DO NOTHING;

-- Create progress for Elementary child (some completed, some in progress)
INSERT INTO public.user_progress (child_id, lesson_id, status, score, time_spent_seconds, completed_at, created_at)
SELECT 
  'c0000000-0000-0000-0000-000000000002'::uuid,
  l.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY l.created_at) <= 3 THEN 'completed'
    ELSE 'in_progress'
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY l.created_at) <= 3 THEN 80 + (RANDOM() * 20)::int
    ELSE NULL
  END,
  300 + (RANDOM() * 900)::int,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY l.created_at) <= 3 THEN NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY l.created_at)))
    ELSE NULL
  END,
  NOW() - (INTERVAL '12 hours')
FROM lessons l
WHERE l.is_active = true
AND l.grade_level IN (3, 4, 5)
LIMIT 5
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 4: Sample Rewards & Badges
-- =============================================================================

-- Award some badges to test children
INSERT INTO public.user_badges (child_id, badge_id, earned_at, progress)
SELECT 
  'c0000000-0000-0000-0000-000000000002'::uuid,
  ab.badge_id,
  NOW() - (INTERVAL '1 day' * (RANDOM() * 7)::int),
  100
FROM achievement_badges ab
WHERE ab.is_active = true
AND ab.category IN ('reading', 'math')
LIMIT 3
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 5: Parent-Child Messages
-- =============================================================================

-- Sample encouragement message
INSERT INTO public.parent_child_messages (
  parent_id,
  child_id,
  sender_type,
  message_type,
  message_text,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'parent',
  'encouragement',
  'Great job on completing your math lesson today! 🌟',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT DO NOTHING;

-- Sample celebration message
INSERT INTO public.parent_child_messages (
  parent_id,
  child_id,
  sender_type,
  message_type,
  message_text,
  is_important,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'parent',
  'celebration',
  'You unlocked a new badge! I''m so proud of you! 🎉',
  true,
  NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 6: Test Rewards (Parent Created)
-- =============================================================================

INSERT INTO public.rewards (
  parent_id,
  name,
  description,
  points_cost,
  is_active
) VALUES 
(
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Extra Screen Time (30 min)',
  'Earn an extra 30 minutes of screen time',
  100,
  true
),
(
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Choose Dinner',
  'Pick what we have for dinner tonight',
  150,
  true
),
(
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Special Outing',
  'A trip to the park or museum',
  500,
  true
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 7: Verification Queries
-- =============================================================================

-- Verify test data was created successfully
DO $$
DECLARE
  v_user_count int;
  v_child_count int;
  v_progress_count int;
  v_badge_count int;
  v_message_count int;
  v_reward_count int;
BEGIN
  SELECT COUNT(*) INTO v_user_count FROM auth.users WHERE email LIKE '%staging%';
  SELECT COUNT(*) INTO v_child_count FROM children WHERE name LIKE 'Test Child%';
  SELECT COUNT(*) INTO v_progress_count FROM user_progress WHERE child_id IN (SELECT id FROM children WHERE name LIKE 'Test Child%');
  SELECT COUNT(*) INTO v_badge_count FROM user_badges WHERE child_id IN (SELECT id FROM children WHERE name LIKE 'Test Child%');
  SELECT COUNT(*) INTO v_message_count FROM parent_child_messages WHERE parent_id IN (SELECT id FROM profiles WHERE full_name LIKE 'Test Parent%');
  SELECT COUNT(*) INTO v_reward_count FROM rewards WHERE parent_id IN (SELECT id FROM profiles WHERE full_name LIKE 'Test Parent%');

  RAISE NOTICE '=== STAGING DATA SEEDING COMPLETE ===';
  RAISE NOTICE 'Test Users Created: %', v_user_count;
  RAISE NOTICE 'Test Children Created: %', v_child_count;
  RAISE NOTICE 'User Progress Records: %', v_progress_count;
  RAISE NOTICE 'Badges Awarded: %', v_badge_count;
  RAISE NOTICE 'Messages Created: %', v_message_count;
  RAISE NOTICE 'Rewards Created: %', v_reward_count;
  RAISE NOTICE '====================================';
END $$;

-- List test accounts for reference
SELECT 
  'Test Accounts' as category,
  u.email,
  p.full_name,
  (SELECT COUNT(*) FROM children WHERE parent_id = u.id) as child_count
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email LIKE '%staging%'
ORDER BY u.email;

-- =============================================================================
-- CLEANUP SCRIPT (Run if you need to reset staging data)
-- =============================================================================

/*
-- UNCOMMENT TO RESET STAGING DATA

-- Delete test progress
DELETE FROM user_progress WHERE child_id IN (SELECT id FROM children WHERE name LIKE 'Test Child%');

-- Delete test badges
DELETE FROM user_badges WHERE child_id IN (SELECT id FROM children WHERE name LIKE 'Test Child%');

-- Delete test messages
DELETE FROM parent_child_messages WHERE parent_id IN (SELECT id FROM profiles WHERE full_name LIKE 'Test Parent%');

-- Delete test rewards
DELETE FROM rewards WHERE parent_id IN (SELECT id FROM profiles WHERE full_name LIKE 'Test Parent%');

-- Delete test children
DELETE FROM children WHERE name LIKE 'Test Child%';

-- Delete test profiles
DELETE FROM profiles WHERE full_name LIKE 'Test Parent%';

-- Delete test users
DELETE FROM auth.users WHERE email LIKE '%staging%';

RAISE NOTICE 'Staging data cleaned up successfully';
*/
