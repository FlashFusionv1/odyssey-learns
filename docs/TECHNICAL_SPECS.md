# Inner Odyssey - Technical Specifications

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Status:** Beta Testing Phase

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Desktop   │  │   Tablet    │  │   Mobile    │  │     PWA     │    │
│  │  (Chrome,   │  │  (Safari,   │  │   (Web)     │  │  (Offline)  │    │
│  │   Firefox)  │  │   Chrome)   │  │             │  │             │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                   │                                      │
│                          ┌────────▼────────┐                            │
│                          │   React 18.3    │                            │
│                          │   + TypeScript  │                            │
│                          │   + Vite 5.x    │                            │
│                          └────────┬────────┘                            │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                              API LAYER                                   │
├───────────────────────────────────┼─────────────────────────────────────┤
│                          ┌────────▼────────┐                            │
│                          │ Supabase Client │                            │
│                          │   (REST + WS)   │                            │
│                          └────────┬────────┘                            │
│                                   │                                      │
│         ┌─────────────────────────┼─────────────────────────┐           │
│         │                         │                         │           │
│  ┌──────▼──────┐          ┌───────▼───────┐         ┌──────▼──────┐    │
│  │   PostgREST │          │   Realtime    │         │    Auth     │    │
│  │   (CRUD)    │          │  (WebSocket)  │         │   (JWT)     │    │
│  └──────┬──────┘          └───────┬───────┘         └──────┬──────┘    │
└─────────┼─────────────────────────┼────────────────────────┼────────────┘
          │                         │                        │
┌─────────┼─────────────────────────┼────────────────────────┼────────────┐
│         │              SERVERLESS FUNCTIONS                │            │
├─────────┼─────────────────────────┼────────────────────────┼────────────┤
│  ┌──────▼──────────────────────────────────────────────────▼──────┐    │
│  │                     Supabase Edge Functions                     │    │
│  │                        (Deno Runtime)                           │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  • ai-insights          • generate-custom-lesson                │    │
│  │  • generate-weekly-reports  • track-lesson-analytics            │    │
│  │  • verify-recaptcha     • health-check                          │    │
│  │  • seed-kindergarten-lessons  • seed-grade-2-lessons            │    │
│  │  • export-child-data    • delete-child-account                  │    │
│  │  • security-alert       • performance-alerts                    │    │
│  │  • batch-lesson-generation  • request-lesson-share              │    │
│  │  • generate-lesson-content  • survey-analytics                  │    │
│  │  • verify-backups                                               │    │
│  └──────┬──────────────────────────────────────────────────────────┘    │
└─────────┼───────────────────────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────────────────────┐
│         │                    DATA LAYER                                  │
├─────────┼───────────────────────────────────────────────────────────────┤
│  ┌──────▼──────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │  PostgreSQL │     │    Storage      │     │   AI Gateway    │       │
│  │  (55+ Tables│     │   (Avatars,     │     │ (Gemini, GPT)   │       │
│  │   + RLS)    │     │    Uploads)     │     │                 │       │
│  └─────────────┘     └─────────────────┘     └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.3.1 | UI framework |
| | TypeScript | 5.x | Type safety |
| | Vite | 5.x | Build tool |
| | Tailwind CSS | 3.x | Styling |
| | shadcn/ui | Latest | Component library |
| | Framer Motion | 12.x | Animations |
| | TanStack Query | 5.x | Data fetching |
| | React Router | 6.x | Routing |
| | React Hook Form | 7.x | Form handling |
| | Zod | 3.x | Validation |
| **Backend** | Supabase | Latest | BaaS platform |
| | PostgreSQL | 15.x | Database |
| | Deno | Latest | Edge runtime |
| | PostgREST | Latest | REST API |
| **AI** | Lovable AI Gateway | - | AI orchestration |
| | Google Gemini | 2.5 Pro/Flash | Content generation |
| | OpenAI GPT | 5.x | Backup/alternatives |
| **Security** | RLS | PostgreSQL | Row-level security |
| | JWT | - | Authentication |
| | reCAPTCHA | v3 | Bot prevention |
| | DOMPurify | 3.x | XSS prevention |

---

## Database Schema

### Schema Overview

The database consists of **55+ tables** organized into functional domains:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE DOMAINS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │    USERS      │  │   LEARNING    │  │  GAMIFICATION │           │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤           │
│  │ profiles      │  │ lessons       │  │ achievement   │           │
│  │ children      │  │ child_gen_    │  │   _badges     │           │
│  │ user_roles    │  │   lessons     │  │ daily_lesson  │           │
│  │ parental_     │  │ lesson_reviews│  │   _quota      │           │
│  │   consent_log │  │ lesson_notes  │  │ lesson_tokens │           │
│  └───────────────┘  │ lesson_perf   │  │ creator_      │           │
│                     │   _metrics    │  │   rewards     │           │
│                     │ lesson_quality│  │ rewards       │           │
│                     │   _scores     │  │ reward_       │           │
│                     └───────────────┘  │   redemptions │           │
│                                        └───────────────┘           │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │    SOCIAL     │  │ COMMUNICATION │  │   ANALYTICS   │           │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤           │
│  │ peer_         │  │ parent_child  │  │ analytics_    │           │
│  │   connections │  │   _messages   │  │   events      │           │
│  │ collaboration │  │ parent_       │  │ lesson_       │           │
│  │   _requests   │  │   notifications│ │   analytics   │           │
│  │ shared_       │  │ parent_weekly │  │ lesson_       │           │
│  │   activities  │  │   _reports    │  │   analytics   │           │
│  │ activity_     │  └───────────────┘  │   _events     │           │
│  │   participants│                     │ daily_lesson  │           │
│  └───────────────┘                     │   _stats      │           │
│                                        └───────────────┘           │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │   SECURITY    │  │  RATE LIMIT   │  │    ADMIN      │           │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤           │
│  │ security_     │  │ api_rate_     │  │ role_audit    │           │
│  │   access_log  │  │   limits      │  │   _log        │           │
│  │ security_     │  │ rate_limit    │  │ reviewer_     │           │
│  │   alerts      │  │   _violations │  │   performance │           │
│  │ failed_auth   │  │ collaboration │  │ review_       │           │
│  │   _attempts   │  │   _rate_limit │  │   history     │           │
│  │ ip_blocklist  │  │ idempotency   │  │ beta_feedback │           │
│  │ data_access   │  │   _cache      │  │ error_logs    │           │
│  │   _audit      │  │ lesson_gen    │  └───────────────┘           │
│  │ data_export   │  │   _dedup      │                               │
│  │   _log        │  └───────────────┘                               │
│  └───────────────┘                                                   │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐                               │
│  │   EMOTIONAL   │  │   SCREEN      │                               │
│  ├───────────────┤  ├───────────────┤                               │
│  │ emotion_logs  │  │ screen_time   │                               │
│  │ (encrypted)   │  │   _sessions   │                               │
│  └───────────────┘  └───────────────┘                               │
│                                                                      │
│  ┌───────────────┐                                                   │
│  │   AVATAR      │                                                   │
│  ├───────────────┤                                                   │
│  │ avatar_items  │                                                   │
│  └───────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Tables Detail

#### User Management

```sql
-- profiles: Parent/guardian accounts
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  birth_year INTEGER,
  age_verified BOOLEAN DEFAULT false,
  coppa_consented_at TIMESTAMPTZ,
  coppa_consent_version TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- children: Child profiles (owned by parents)
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 12),
  avatar_config JSONB DEFAULT '{}',
  pin_hash TEXT,
  total_points INTEGER DEFAULT 0,
  daily_quest_id UUID REFERENCES lessons(id),
  quest_completed_at TIMESTAMPTZ,
  quest_bonus_points INTEGER DEFAULT 0,
  challenge_mode_enabled BOOLEAN DEFAULT false,
  screen_time_enabled BOOLEAN DEFAULT true,
  daily_screen_time_limit_minutes INTEGER DEFAULT 60,
  weekly_report_enabled BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  deletion_scheduled_at TIMESTAMPTZ,
  deletion_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_roles: RBAC for admin functions
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'parent');
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

#### Learning Content

```sql
-- lessons: Platform-curated lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  content_markdown TEXT NOT NULL,
  quiz_questions JSONB,
  estimated_minutes INTEGER DEFAULT 15,
  points_value INTEGER DEFAULT 10,
  standards_alignment TEXT,
  differentiation JSONB,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- child_generated_lessons: AI-created lessons
CREATE TABLE child_generated_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) NOT NULL,
  parent_id UUID REFERENCES profiles(id) NOT NULL,
  creator_child_id UUID REFERENCES children(id),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  content_markdown TEXT NOT NULL,
  quiz_questions JSONB,
  generation_prompt TEXT,
  difficulty TEXT DEFAULT 'medium',
  estimated_minutes INTEGER DEFAULT 15,
  points_value INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  parent_approved_at TIMESTAMPTZ,
  parent_approved_by UUID,
  share_status TEXT DEFAULT 'private',
  rejection_reason TEXT,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_reviews: Content review workflow
CREATE TYPE review_status AS ENUM (
  'pending', 'in_review', 'approved', 
  'rejected', 'needs_revision', 'archived'
);
CREATE TABLE lesson_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) UNIQUE NOT NULL,
  reviewer_id UUID,
  status review_status DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  content_accuracy_score INTEGER CHECK (1-5),
  age_appropriate_score INTEGER CHECK (1-5),
  engagement_score INTEGER CHECK (1-5),
  clarity_score INTEGER CHECK (1-5),
  assessment_quality_score INTEGER CHECK (1-5),
  overall_score INTEGER,
  strengths TEXT,
  weaknesses TEXT,
  suggestions TEXT,
  reviewer_notes TEXT,
  revision_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Gamification

```sql
-- achievement_badges: Badge definitions
CREATE TABLE achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT DEFAULT 'bronze',
  unlock_criteria JSONB NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- daily_lesson_quota: Track daily usage
CREATE TABLE daily_lesson_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) NOT NULL,
  quota_date DATE NOT NULL,
  platform_lessons_completed INTEGER DEFAULT 0,
  custom_lessons_completed INTEGER DEFAULT 0,
  bonus_lessons_granted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, quota_date)
);

-- lesson_tokens: AI generation quota
CREATE TABLE lesson_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) UNIQUE NOT NULL,
  tokens_available INTEGER DEFAULT 3,
  tokens_used INTEGER DEFAULT 0,
  last_reset_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- rewards: Parent-defined rewards
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  redemption_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Security & Audit

```sql
-- security_access_log: All sensitive data access
CREATE TABLE security_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  access_type TEXT NOT NULL,
  accessed_table TEXT NOT NULL,
  accessed_record_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- failed_auth_attempts: Track failed logins
CREATE TABLE failed_auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  failure_reason TEXT NOT NULL,
  metadata JSONB,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- ip_blocklist: Blocked IPs
CREATE TABLE ip_blocklist (
  ip_address INET PRIMARY KEY,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  blocked_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policy Patterns

All tables implement Row-Level Security with consistent patterns:

```sql
-- Pattern 1: Parent owns children data
CREATE POLICY "Parents access own children"
ON children FOR ALL TO authenticated
USING (parent_id = auth.uid());

-- Pattern 2: Parent accesses child's data
CREATE POLICY "Parents access child lessons"
ON child_generated_lessons FOR ALL TO authenticated
USING (parent_id = auth.uid());

-- Pattern 3: Admin override
CREATE POLICY "Admins full access"
ON lessons FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Pattern 4: Public read, authenticated write
CREATE POLICY "Public read lessons"
ON lessons FOR SELECT TO authenticated
USING (is_active = true);

-- Pattern 5: Self-access only
CREATE POLICY "Users access own profile"
ON profiles FOR ALL TO authenticated
USING (id = auth.uid());
```

---

## Edge Functions Catalog

### Function Overview

| Function | Purpose | Trigger | AI Model |
|----------|---------|---------|----------|
| `ai-insights` | Generate weekly learning insights | Weekly cron | Gemini 2.5 Pro |
| `generate-custom-lesson` | Create AI lessons for children | On-demand | Gemini 2.5 Flash |
| `generate-lesson-content` | Bulk lesson generation | Admin trigger | Gemini 2.5 Pro |
| `generate-weekly-reports` | Compile parent reports | Sunday cron | None |
| `track-lesson-analytics` | Log engagement events | Real-time | None |
| `verify-recaptcha` | Validate reCAPTCHA tokens | Auth forms | None |
| `health-check` | System health monitoring | Cron/manual | None |
| `seed-kindergarten-lessons` | Batch K lessons | Admin trigger | Gemini 2.5 Pro |
| `seed-grade-2-lessons` | Batch Grade 2 lessons | Admin trigger | Gemini 2.5 Pro |
| `seed-lessons` | Generic lesson seeding | Admin trigger | Gemini 2.5 Pro |
| `batch-lesson-generation` | Bulk content creation | Admin trigger | Gemini 2.5 Pro |
| `export-child-data` | GDPR data export | On-demand | None |
| `delete-child-account` | GDPR account deletion | On-demand | None |
| `security-alert` | Send security notifications | Event-driven | None |
| `performance-alerts` | Send perf notifications | Threshold | None |
| `request-lesson-share` | Handle share requests | On-demand | None |
| `survey-analytics` | Process survey responses | On-submit | None |
| `verify-backups` | Validate backup integrity | Daily cron | None |

### Function Details

#### ai-insights

```typescript
// Purpose: Generate AI-powered insights for parents
// Endpoint: POST /functions/v1/ai-insights
// Auth: Required (parent JWT)

interface AIInsightsRequest {
  childId: string;
  timeRange?: '7d' | '30d' | '90d';
}

interface AIInsightsResponse {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
  conversationStarters: string[];
}

// Implementation uses Gemini 2.5 Pro for analysis
```

#### generate-custom-lesson

```typescript
// Purpose: Create personalized lessons for children
// Endpoint: POST /functions/v1/generate-custom-lesson
// Auth: Required (parent JWT via child session)

interface GenerateLessonRequest {
  childId: string;
  topic: string;
  subject?: string;
}

interface GenerateLessonResponse {
  lessonId: string;
  title: string;
  preview: string;
  status: 'pending_approval';
}

// Includes content moderation and age-appropriate filtering
```

---

## API Patterns

### Supabase Client Integration

```typescript
// Client initialization (auto-generated, read-only)
import { supabase } from "@/integrations/supabase/client";

// Query pattern with React Query
const { data, error, isLoading } = useQuery({
  queryKey: ['lessons', gradeLevel],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade_level', gradeLevel)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
});

// Mutation pattern
const mutation = useMutation({
  mutationFn: async (newLesson: LessonInsert) => {
    const { data, error } = await supabase
      .from('child_generated_lessons')
      .insert(newLesson)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['lessons'] });
    toast.success('Lesson created!');
  },
  onError: (error) => {
    toast.error('Failed to create lesson');
    console.error(error);
  }
});
```

### Real-time Subscriptions

```typescript
// Real-time message subscription
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'parent_child_messages',
        filter: `child_id=eq.${childId}`
      },
      (payload) => {
        setMessages(prev => [...prev, payload.new]);
        playNotificationSound();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [childId]);
```

### Error Handling

```typescript
// Centralized error handler
export const handleSupabaseError = (
  error: PostgrestError | null,
  context: string
): string => {
  if (!error) return '';

  // Log for debugging
  console.error(`Supabase error in ${context}:`, error);

  // User-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'This item already exists.',
    '23503': 'Referenced item not found.',
    '42501': 'You do not have permission.',
    'PGRST116': 'Item not found.',
  };

  return errorMessages[error.code] || 'An unexpected error occurred.';
};
```

---

## Security Architecture

### Multi-Layer Defense

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: NETWORK                              │
├─────────────────────────────────────────────────────────────────────┤
│  • TLS 1.3 encryption in transit                                    │
│  • Cloudflare DDoS protection                                       │
│  • Geographic restrictions (optional)                               │
│  • Rate limiting at edge                                            │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                     LAYER 2: AUTHENTICATION                          │
├─────────────────────────────────────────────────────────────────────┤
│  • JWT tokens with 1-hour expiry                                    │
│  • Refresh token rotation                                           │
│  • reCAPTCHA v3 on auth forms                                       │
│  • Password strength enforcement (zxcvbn)                           │
│  • Failed attempt tracking                                          │
│  • Session timeout (30 min idle)                                    │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                     LAYER 3: AUTHORIZATION                           │
├─────────────────────────────────────────────────────────────────────┤
│  • Row-Level Security on ALL tables                                 │
│  • Role-Based Access Control (admin, moderator, parent)             │
│  • Parent-child ownership validation                                │
│  • Resource-level permissions                                       │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER 4: APPLICATION                            │
├─────────────────────────────────────────────────────────────────────┤
│  • Input sanitization (DOMPurify)                                   │
│  • Zod schema validation                                            │
│  • XSS prevention (CSP headers)                                     │
│  • CSRF protection                                                  │
│  • Rate limiting (client + server)                                  │
│  • Content moderation for AI outputs                                │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                         LAYER 5: AUDIT                               │
├─────────────────────────────────────────────────────────────────────┤
│  • security_access_log for sensitive data                           │
│  • role_audit_log for permission changes                            │
│  • error_logs for application errors                                │
│  • failed_auth_attempts for auth failures                           │
│  • data_export_log for GDPR requests                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Protection

| Data Type | Protection Method |
|-----------|-------------------|
| Passwords | bcrypt hashing (Supabase Auth) |
| JWT tokens | HMAC-SHA256 signing |
| Emotion logs | AES-256 encryption (optional fields) |
| PII | RLS isolation per parent |
| API keys | Environment secrets |

---

## Performance Specifications

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | <1.5s | ~1.2s |
| Largest Contentful Paint | <2.5s | ~2.0s |
| Time to Interactive | <3.0s | ~2.5s |
| Cumulative Layout Shift | <0.1 | ~0.05 |
| Lighthouse Performance | 90+ | 92 |
| Lighthouse Accessibility | 90+ | 94 |
| API p95 Latency | <500ms | ~300ms |

### Optimization Strategies

1. **Code Splitting:** Route-based lazy loading
2. **Image Optimization:** WebP format, lazy loading
3. **Bundle Size:** Tree shaking, minimal dependencies
4. **Caching:** React Query stale-while-revalidate
5. **Prefetching:** Critical route preloading
6. **Edge Caching:** Static asset CDN

---

## Deployment Architecture

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:8080 | Local development |
| Staging | staging.innerodyssey.app | Pre-production testing |
| Production | app.innerodyssey.app | Live users |

### CI/CD Pipeline

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run type check
        run: npm run typecheck
      - name: Run unit tests
        run: npm run test
      - name: Run E2E tests
        run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Lovable Cloud
        run: # Automatic via Lovable
```

---

## Appendix: File Structure

```
src/
├── components/          # 100+ React components
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   ├── avatar/         # Avatar customization
│   ├── badges/         # Badge display
│   ├── beta/           # Beta testing widgets
│   ├── celebration/    # Celebration modals
│   ├── emotional/      # Emotion tracking
│   ├── error/          # Error boundaries
│   ├── gamification/   # Gamification UI
│   ├── layout/         # Layout components
│   ├── learning/       # Learning content
│   ├── monitoring/     # Health monitoring
│   ├── notifications/  # Notification system
│   ├── onboarding/     # Onboarding flows
│   ├── parent/         # Parent dashboard
│   ├── pwa/            # PWA components
│   ├── quests/         # Quest system
│   ├── social/         # Social features
│   └── ui/             # shadcn/ui primitives
├── config/             # Route configuration
├── constants/          # Route paths
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client
├── lib/                # Utility functions
├── pages/              # Page components
├── routes/             # Route definitions
├── test/               # Test utilities
└── types/              # TypeScript types

supabase/
├── config.toml         # Supabase configuration
├── functions/          # Edge functions
│   ├── _shared/        # Shared utilities
│   └── [function]/     # Individual functions
└── migrations/         # Database migrations

docs/                   # Documentation
e2e/                    # Playwright E2E tests
scripts/                # Build/test scripts
public/                 # Static assets
```

---

*This document provides the complete technical specification for Inner Odyssey. All implementations should adhere to these patterns and standards.*
