# Odyssey Learns - Agent & Module Documentation

> **Complete documentation of all agents, modules, and automated systems in the platform**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Agents](#core-agents)
3. [Utility Modules](#utility-modules)
4. [Custom Hooks](#custom-hooks)
5. [Database Functions](#database-functions)
6. [Integration Points](#integration-points)

---

## 🎯 Overview

Odyssey Learns uses a modular architecture with specialized "agents" and modules that handle specific domains of functionality. These agents are not AI agents in the traditional sense, but rather well-defined modules with clear responsibilities.

### Agent Philosophy

Each agent/module follows these principles:
- **Single Responsibility**: One clear purpose
- **Predictable I/O**: Well-defined inputs and outputs
- **Error Handling**: Graceful degradation
- **Type Safety**: Full TypeScript coverage
- **Testability**: Isolated and mockable

---

## 🤖 Core Agents

### 1. Badge Checker Agent

**Location**: `src/lib/badgeChecker.ts`

**Purpose**: Automatically evaluates and awards badges based on user achievements and milestones.

**Input**:
```typescript
interface BadgeCheckContext {
  childId: string;
  eventType: 'lesson_complete' | 'streak_update' | 'points_earned';
  eventData: {
    lessonId?: string;
    subject?: string;
    currentStreak?: number;
    totalPoints?: number;
    score?: number;
  };
}
```

**Output**:
```typescript
interface BadgeAwardResult {
  newBadges: Badge[];
  success: boolean;
  error?: string;
}
```

**Decision Logic**:

1. **Query User's Current Badges**
   - Fetch existing badges from `user_badges` table
   - Cache for performance

2. **Evaluate Badge Criteria**
   - **Streak Badges**: `streak >= badge.criteria.requiredStreak`
   - **Lesson Badges**: `completedLessons >= badge.criteria.requiredLessons`
   - **Subject Badges**: `completedInSubject >= badge.criteria.requiredSubjectLessons`
   - **Point Badges**: `totalPoints >= badge.criteria.requiredPoints`

3. **Award New Badges**
   - Insert into `user_badges` table
   - Award bonus points for badge
   - Trigger celebration animation
   - Create notification

4. **Return Results**
   - Array of newly awarded badges
   - Success/failure status

**Usage Example**:
```typescript
import { checkAndAwardBadges } from '@/lib/badgeChecker';

// After lesson completion
const result = await checkAndAwardBadges({
  childId: '123',
  eventType: 'lesson_complete',
  eventData: {
    lessonId: 'abc',
    subject: 'math',
    score: 95
  }
});

if (result.newBadges.length > 0) {
  showCelebration(result.newBadges);
}
```

**Error Handling**:
- Database connection failures → graceful failure, log error
- Invalid child ID → return empty array
- Duplicate badge awards → silently skip
- Partial failures → award what's possible, log issues

---

### 2. Quest Generator Agent

**Location**: `src/lib/questGenerator.ts`

**Purpose**: Automatically generates personalized daily quests for each child based on their learning history, preferences, and grade level.

**Input**:
```typescript
interface QuestGenerationParams {
  childId: string;
  gradeLevel: number;
  preferredSubjects?: string[];
  recentActivity?: {
    lessonsCompleted: number;
    favoriteSubject: string;
    averageScore: number;
  };
}
```

**Output**:
```typescript
interface GeneratedQuest {
  id: string;
  childId: string;
  questType: 'lesson_count' | 'subject_focus' | 'points_target' | 'streak_maintain';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardPoints: number;
  expiresAt: Date;
}
```

**Decision Logic**:

1. **Analyze Child's History**
   - Query recent lesson completions (last 7 days)
   - Identify strong subjects
   - Identify subjects needing attention
   - Check current streak status

2. **Select Quest Types** (generates 3 quests per day)
   - **Primary Quest**: Based on grade level and ability
   - **Challenge Quest**: Slightly above current level
   - **Fun Quest**: In favorite subject for engagement

3. **Quest Type Generation**:

   **Lesson Count Quest**:
   ```typescript
   {
     type: 'lesson_count',
     title: 'Learning Momentum',
     description: 'Complete 3 lessons today',
     targetValue: 3,
     rewardPoints: 50
   }
   ```

   **Subject Focus Quest**:
   ```typescript
   {
     type: 'subject_focus',
     title: 'Math Master',
     description: 'Complete 2 math lessons',
     targetValue: 2,
     rewardPoints: 75,
     criteria: { subject: 'math' }
   }
   ```

   **Points Target Quest**:
   ```typescript
   {
     type: 'points_target',
     title: 'Point Collector',
     description: 'Earn 100 points today',
     targetValue: 100,
     rewardPoints: 25
   }
   ```

   **Streak Maintenance Quest**:
   ```typescript
   {
     type: 'streak_maintain',
     title: 'Keep It Going!',
     description: 'Maintain your learning streak',
     targetValue: 1,
     rewardPoints: 30
   }
   ```

4. **Difficulty Scaling**:
   - **K-2**: 1-2 lessons, easier subjects
   - **3-5**: 2-3 lessons, mixed subjects
   - **6-8**: 3-4 lessons, challenging subjects
   - **9-12**: 4-5 lessons, advanced topics

5. **Reward Calculation**:
   ```
   baseReward = 25 points
   difficultyMultiplier = targetValue * 10
   subjectBonus = weakSubject ? 25 : 0
   totalReward = baseReward + difficultyMultiplier + subjectBonus
   ```

**Usage Example**:
```typescript
import { generateDailyQuests } from '@/lib/questGenerator';

// Run daily at midnight for all active children
async function refreshDailyQuests() {
  const children = await getActiveChildren();
  
  for (const child of children) {
    const quests = await generateDailyQuests({
      childId: child.id,
      gradeLevel: child.grade_level,
      preferredSubjects: child.preferences?.subjects
    });
    
    await saveDailyQuests(quests);
  }
}
```

**Error Handling**:
- Failed history query → use default quest templates
- Database write failure → retry once, then log
- Invalid grade level → use grade 3 defaults
- No recent activity → generate beginner-friendly quests

---

### 3. Screen Time Enforcement Agent

**Location**: `src/lib/screenTimeEnforcement.ts`

**Purpose**: Monitors and enforces parent-defined screen time limits for children.

**Input**:
```typescript
interface ScreenTimeSession {
  childId: string;
  startTime: Date;
  activityType: 'lesson' | 'dashboard' | 'social' | 'customization';
}
```

**Output**:
```typescript
interface ScreenTimeStatus {
  isAllowed: boolean;
  remainingMinutes: number;
  dailyLimit: number;
  usedToday: number;
  warningThreshold: boolean; // true if < 10 minutes left
}
```

**Decision Logic**:

1. **Check Daily Limits**
   ```typescript
   const parentSettings = await getParentScreenTimeLimits(childId);
   const todayUsage = await getTodayScreenTime(childId);
   
   if (todayUsage >= parentSettings.dailyLimitMinutes) {
     return { isAllowed: false, remainingMinutes: 0 };
   }
   ```

2. **Track Active Session**
   - Create session record in `screen_time_sessions` table
   - Update every 60 seconds with current duration
   - End session on logout or inactivity (5 min)

3. **Warning System**
   - **10 minutes remaining**: Show warning toast
   - **5 minutes remaining**: Show countdown modal
   - **1 minute remaining**: Show final warning
   - **0 minutes**: Auto-logout with friendly message

4. **Grace Period**
   - Allow finishing current lesson even if time expires
   - Max grace period: 15 minutes
   - No new lessons can be started

5. **Exempt Activities** (optional parent setting)
   - Parent-child messaging
   - Viewing progress reports
   - Emergency contacts

**Usage Example**:
```typescript
import { checkScreenTimeStatus, startScreenTimeSession } from '@/lib/screenTimeEnforcement';

// On child login
const status = await checkScreenTimeStatus(childId);

if (!status.isAllowed) {
  showTimeUpMessage(status.dailyLimit);
  redirectToParentContact();
  return;
}

// Start tracking
await startScreenTimeSession({ 
  childId, 
  activityType: 'dashboard' 
});

// Show warning if needed
if (status.warningThreshold) {
  showWarningToast(`${status.remainingMinutes} minutes remaining`);
}
```

**Error Handling**:
- Database unavailable → allow access with notification to parent
- Invalid limits → use default (60 minutes)
- Clock sync issues → use server time
- Failed session tracking → log warning, continue

---

### 4. Analytics Agent

**Location**: `src/lib/analytics.ts`

**Purpose**: Tracks user behavior, learning patterns, and platform metrics for insights and improvements.

**Input**:
```typescript
interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}
```

**Output**:
```typescript
// Fire-and-forget, no return value
// Logs to console in development
// Sends to analytics service in production
```

**Tracked Events**:

1. **User Events**
   - `user_signup` - New account created
   - `user_login` - User logged in
   - `user_logout` - User logged out
   - `profile_updated` - Profile information changed

2. **Learning Events**
   - `lesson_started` - Child began a lesson
   - `lesson_completed` - Child finished a lesson
   - `lesson_abandoned` - Child left before completing
   - `quiz_answered` - Individual quiz question answered
   - `quiz_completed` - All quiz questions answered

3. **Gamification Events**
   - `points_earned` - Points awarded
   - `badge_unlocked` - New badge earned
   - `quest_completed` - Daily quest finished
   - `reward_requested` - Child requested a reward
   - `reward_approved` - Parent approved reward

4. **Social Events**
   - `collaboration_requested` - Study buddy request sent
   - `lesson_shared` - Lesson shared to community
   - `message_sent` - Parent-child message

5. **Platform Events**
   - `page_viewed` - Navigation tracking
   - `feature_used` - Feature interaction
   - `error_occurred` - Error tracking
   - `feedback_submitted` - User feedback

**Decision Logic**:

```typescript
export const analytics = {
  track(eventName: string, properties?: Record<string, any>) {
    // Development: Console log
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, properties);
      return;
    }

    // Production: Send to service
    try {
      // Plausible, PostHog, or custom endpoint
      window.plausible?.(eventName, { props: properties });
    } catch (error) {
      console.error('Analytics error:', error);
      // Don't throw - analytics should never break the app
    }
  },

  // Convenience methods
  lessonStarted(lessonId: string, childId: string) {
    this.track('lesson_started', { lessonId, childId });
  },

  lessonCompleted(lessonId: string, childId: string, score: number, timeSpent: number) {
    this.track('lesson_completed', { 
      lessonId, 
      childId, 
      score, 
      timeSpent 
    });
  },

  // ... more methods
};
```

**Usage Example**:
```typescript
import { analytics } from '@/lib/analytics';

// Track page view
useEffect(() => {
  analytics.track('page_viewed', { page: 'ChildDashboard' });
}, []);

// Track lesson interaction
const handleLessonStart = (lessonId: string) => {
  analytics.lessonStarted(lessonId, childId);
  navigate(`/lessons/${lessonId}`);
};

// Track with user context
analytics.track('feature_used', {
  feature: 'avatar_customization',
  userId: user.id,
  userType: user.role,
});
```

**Privacy Considerations**:
- **No PII tracked**: Never track names, emails, or personal data
- **Anonymized IDs**: Use hashed or random IDs
- **Opt-out support**: Respect Do Not Track headers
- **COPPA compliant**: Extra care with children's data
- **Transparent**: Document all tracking in privacy policy

---

### 5. Rate Limiter Agent

**Location**: `src/lib/rateLimiter.ts`

**Purpose**: Client-side rate limiting to prevent abuse and ensure fair usage of platform resources.

**Input**:
```typescript
interface RateLimitCheck {
  key: string; // Unique identifier (userId + action)
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}
```

**Output**:
```typescript
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}
```

**Decision Logic**:

1. **Token Bucket Algorithm**
   ```typescript
   class RateLimiter {
     private buckets = new Map<string, TokenBucket>();

     check(key: string, maxRequests: number, windowMs: number): RateLimitResult {
       const bucket = this.buckets.get(key) || this.createBucket(key, maxRequests, windowMs);
       
       // Refill tokens based on time elapsed
       const now = Date.now();
       const elapsed = now - bucket.lastRefill;
       const tokensToAdd = (elapsed / windowMs) * maxRequests;
       
       bucket.tokens = Math.min(maxRequests, bucket.tokens + tokensToAdd);
       bucket.lastRefill = now;

       // Check if request is allowed
       if (bucket.tokens >= 1) {
         bucket.tokens -= 1;
         return { 
           allowed: true, 
           remaining: Math.floor(bucket.tokens),
           resetAt: new Date(now + windowMs)
         };
       }

       return { 
         allowed: false, 
         remaining: 0,
         resetAt: new Date(bucket.lastRefill + windowMs)
       };
     }
   }
   ```

2. **Rate Limit Rules**:
   - **Lesson creation**: 10 per hour
   - **Reward requests**: 5 per day
   - **Messages**: 30 per hour
   - **API calls**: 100 per minute
   - **Login attempts**: 5 per 15 minutes
   - **Password resets**: 3 per hour

3. **Storage**:
   - In-memory (resets on page reload)
   - localStorage for persistence across sessions
   - Cleared daily at midnight

**Usage Example**:
```typescript
import { rateLimiter } from '@/lib/rateLimiter';

async function createLesson(lessonData: LessonData) {
  const limit = rateLimiter.check(
    `lesson-create-${userId}`,
    10, // max 10 lessons
    60 * 60 * 1000 // per hour
  );

  if (!limit.allowed) {
    toast.error(`Rate limit exceeded. Try again after ${limit.resetAt.toLocaleTimeString()}`);
    return;
  }

  // Proceed with creation
  await api.createLesson(lessonData);
}
```

**Error Handling**:
- localStorage unavailable → use memory only
- Invalid parameters → use safe defaults
- Clock skew → handle gracefully
- Cleared storage → reset limits

---

## 🛠️ Utility Modules

### 1. Input Sanitization Module

**Location**: `src/lib/inputSanitization.ts`

**Purpose**: Sanitize and validate all user inputs to prevent XSS, injection attacks, and data corruption.

**Functions**:

```typescript
/**
 * Sanitize plain text by escaping HTML special characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

/**
 * Sanitize HTML content using DOMPurify
 * Only allows safe tags and attributes
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize markdown before parsing
 */
export function sanitizeMarkdown(markdown: string): string {
  // Remove potentially dangerous markdown
  let safe = markdown
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
    
  return safe.trim();
}

/**
 * Validate and sanitize username
 */
export function sanitizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 20);
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}
```

**Usage**:
```typescript
import { sanitizeText, sanitizeHTML, sanitizeMarkdown } from '@/lib/inputSanitization';

// Before saving to database
const safeTitle = sanitizeText(userInput.title);
const safeContent = sanitizeMarkdown(userInput.content);

// Before rendering user content
<div dangerouslySetInnerHTML={{ 
  __html: sanitizeHTML(userGeneratedContent) 
}} />
```

---

### 2. Child Validation Module

**Location**: `src/lib/validateChild.ts`

**Purpose**: Verify child access rights and parent-child relationships before allowing sensitive operations.

**Functions**:

```typescript
/**
 * Verify that a user is the parent of a specific child
 */
export async function validateParentChildRelationship(
  parentId: string,
  childId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', parentId)
    .single();

  return !error && data !== null;
}

/**
 * Verify child PIN before granting access
 */
export async function validateChildPIN(
  childId: string,
  pin: string
): Promise<boolean> {
  const { data } = await supabase
    .from('children')
    .select('pin_hash')
    .eq('id', childId)
    .single();

  if (!data?.pin_hash) return false;

  // Compare hashed PIN (use bcrypt or similar)
  return await comparePINHash(pin, data.pin_hash);
}

/**
 * Check if child has access to specific lesson
 */
export async function validateLessonAccess(
  childId: string,
  lessonId: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Get child's grade level
  const { data: child } = await supabase
    .from('children')
    .select('grade_level')
    .eq('id', childId)
    .single();

  // Get lesson grade level
  const { data: lesson } = await supabase
    .from('lessons')
    .select('grade_level, is_active')
    .eq('id', lessonId)
    .single();

  if (!lesson?.is_active) {
    return { allowed: false, reason: 'Lesson is not available' };
  }

  // Allow lessons ±2 grade levels
  const gradeDiff = Math.abs(child.grade_level - lesson.grade_level);
  if (gradeDiff > 2) {
    return { allowed: false, reason: 'Lesson is not appropriate for grade level' };
  }

  return { allowed: true };
}
```

---

## 🎣 Custom Hooks

### 1. useAuth Hook

**Location**: `src/hooks/useAuth.tsx`

**Purpose**: Centralized authentication state and operations.

**Interface**:
```typescript
interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'parent' | 'child') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
```

**Usage**:
```typescript
const { user, profile, signIn, signOut } = useAuth();

if (!user) {
  return <LoginPage />;
}
```

---

### 2. useValidatedChild Hook

**Location**: `src/hooks/useValidatedChild.tsx`

**Purpose**: Ensures valid child context before allowing operations.

**Interface**:
```typescript
interface ValidatedChildContext {
  child: Child | null;
  loading: boolean;
  error: Error | null;
  isParent: boolean;
  validateAccess: (requiredGradeLevel?: number) => boolean;
}
```

---

### 3. usePlatformLessonQuota Hook

**Location**: `src/hooks/usePlatformLessonQuota.tsx`

**Purpose**: Manages lesson generation limits for beta users.

---

## 💾 Database Functions

### 1. Auto-generate Quests Trigger

**Purpose**: Automatically create daily quests for all children at midnight.

**SQL**:
```sql
CREATE OR REPLACE FUNCTION generate_daily_quests()
RETURNS void AS $$
BEGIN
  -- Logic to generate quests for all active children
  INSERT INTO daily_quests (child_id, quest_type, title, description, ...)
  SELECT ...
  FROM children
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily at midnight
SELECT cron.schedule('generate-quests', '0 0 * * *', 'SELECT generate_daily_quests()');
```

---

### 2. Update User Stats Trigger

**Purpose**: Automatically update aggregate statistics when progress changes.

---

## 🔗 Integration Points

### Supabase Edge Functions

1. **validate-lesson-content**: Server-side validation of lesson creation
2. **generate-certificate**: PDF certificate generation
3. **send-notification**: Push notification service
4. **moderate-content**: Content moderation for community lessons

### External Services (Planned)

1. **Email Service**: SendGrid or Resend for transactional emails
2. **Analytics**: Plausible or PostHog for privacy-friendly analytics
3. **Error Tracking**: Sentry for production error monitoring
4. **CDN**: Cloudflare for asset delivery

---

## 📊 Agent Interaction Map

```
┌─────────────────────────────────────────────────┐
│            User Actions (UI Events)              │
└───────────────────┬──────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
  ┌─────────┐ ┌──────────┐ ┌──────────┐
  │Analytics│ │RateLimiter│ │Sanitizer │
  │ Agent   │ │  Agent    │ │  Module  │
  └─────────┘ └──────────┘ └──────────┘
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
         ┌─────────────────┐
         │  Supabase API   │
         └────────┬─────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌─────────┐ ┌────────────┐
│  Badge   │ │  Quest  │ │ScreenTime  │
│ Checker  │ │Generator│ │  Enforcer  │
└──────────┘ └─────────┘ └────────────┘
```

---

## 🧪 Testing Agents

Each agent should have comprehensive tests:

```typescript
describe('BadgeChecker', () => {
  it('should award streak badge at 7 days', async () => {
    const result = await checkAndAwardBadges({
      childId: 'test-child',
      eventType: 'streak_update',
      eventData: { currentStreak: 7 }
    });

    expect(result.newBadges).toHaveLength(1);
    expect(result.newBadges[0].name).toBe('Week Warrior');
  });

  it('should not duplicate badges', async () => {
    // Award first time
    await checkAndAwardBadges({ ... });
    
    // Try to award again
    const result = await checkAndAwardBadges({ ... });
    
    expect(result.newBadges).toHaveLength(0);
  });
});
```

---

## 📝 Adding New Agents

To add a new agent:

1. **Create Module**: `src/lib/yourAgent.ts`
2. **Define Types**: Input/output interfaces
3. **Implement Logic**: Core decision-making code
4. **Add Error Handling**: Graceful failures
5. **Write Tests**: Comprehensive test coverage
6. **Document**: Add to this file
7. **Integrate**: Connect to relevant parts of app

---

**Last Updated**: 2025-12-30
