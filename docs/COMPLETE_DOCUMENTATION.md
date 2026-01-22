# Inner Odyssey - Complete Documentation

> **Version:** 1.7.0 | **Status:** Beta | **Last Updated:** 2026-01-22

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [End User Guide](#2-end-user-guide)
3. [Developer Guide](#3-developer-guide)
4. [Operator & DevOps Guide](#4-operator--devops-guide)
5. [Architecture](#5-architecture)
6. [API Reference](#6-api-reference)
7. [Configuration Reference](#7-configuration-reference)
8. [Security & Compliance](#8-security--compliance)
9. [Testing & Quality](#9-testing--quality)
10. [Observability & Operations](#10-observability--operations)
11. [Examples & Walkthroughs](#11-examples--walkthroughs)
12. [Troubleshooting](#12-troubleshooting)
13. [Version History](#13-version-history)
14. [Appendix: Style Guide](#appendix-a-style-guide)

---

## 1. Introduction

### 1.1 App Purpose & Summary

**Inner Odyssey** is a comprehensive K-12 educational platform that combines:
- **Emotional Intelligence Training** - Daily check-ins, coping strategies, reflection journals
- **Academic Excellence** - AI-powered lessons aligned to educational standards
- **Life Skills Development** - Real-world applicable skills and challenges
- **Gamified Learning** - Points, badges, streaks, and age-appropriate quests

The platform serves three primary user groups:
| User Type | Description | Key Features |
|-----------|-------------|--------------|
| **Students** | Children ages 5-18 (K-12) | Age-adaptive learning, gamification, peer collaboration |
| **Parents** | Primary caregivers | Progress monitoring, AI insights, screen time controls, rewards |
| **Educators** | Teachers & administrators | Class management, differentiated instruction (future) |

### 1.2 Supported Platforms & Environments

| Platform | Support Level | Notes |
|----------|---------------|-------|
| **Chrome** (Desktop/Mobile) | ✅ Full | Primary development target |
| **Firefox** (Desktop/Mobile) | ✅ Full | Tested regularly |
| **Safari** (Desktop/iOS) | ✅ Full | PWA support varies |
| **Edge** (Desktop) | ✅ Full | Chromium-based |
| **iOS Safari** | ✅ Full | PWA installable |
| **Android Chrome** | ✅ Full | PWA installable |
| **IE11** | ❌ None | Not supported |

**Minimum Requirements:**
- Node.js 18+ (development only)
- Modern browser with ES2020 support
- 2GB RAM, stable internet connection

### 1.3 Versioning Strategy

We follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH (e.g., 1.7.0)
  │     │     └── Bug fixes, security patches
  │     └── New features (backwards compatible)
  └── Breaking changes, major feature releases
```

**Release Cadence:**
- **Major releases:** Quarterly (breaking changes announced 30 days prior)
- **Minor releases:** Bi-weekly (new features, enhancements)
- **Patch releases:** As needed (critical bug fixes, security patches)

**Current Version:** `1.7.0` | [View Changelog](../CHANGELOG.md)

---

## 2. End User Guide

### 2.1 For Parents

#### 2.1.1 Getting Started

**Step 1: Create Account**
1. Navigate to [odyssey-learns.lovable.app](https://odyssey-learns.lovable.app)
2. Click "Get Started" → "Sign Up"
3. Enter email, create password (minimum 8 characters)
4. Verify email via link sent to inbox
5. Complete parent profile setup

**Step 2: Add Your Child**
1. From Parent Dashboard, click "Add Child"
2. Enter child's name, grade level, learning preferences
3. Create a unique PIN for child login (4-6 digits)
4. Review privacy settings and screen time limits
5. Child account is ready!

**Step 3: Manage Screen Time**
```
Settings → Screen Time
├── Daily Limit: 30-180 minutes
├── Time Windows: Set allowed hours (e.g., 3pm-7pm weekdays)
├── Weekend Bonus: Optional extra time on weekends
└── Enforce Limits: Hard stop or gentle reminder
```

#### 2.1.2 Parent Dashboard Overview

| Section | Purpose | Update Frequency |
|---------|---------|------------------|
| **Progress Overview** | Weekly summary of lessons, points, streaks | Real-time |
| **AI Insights** | AI-generated learning recommendations | Weekly (Sundays) |
| **Emotional Wellness** | Mood trends, coping strategy usage | 30-day rolling |
| **Screen Time** | Daily/weekly usage tracking | Real-time |
| **Rewards** | Manage custom rewards, approve redemptions | On-demand |
| **Messages** | Send encouragement, celebrate achievements | Real-time |

#### 2.1.3 Custom Rewards System

Create rewards your child can "purchase" with earned points:

```
Example Rewards:
├── 🎮 30 min extra screen time → 500 points
├── 🍦 Ice cream trip → 1,000 points
├── 🎬 Family movie night → 2,000 points
└── 🎁 New toy/book → 5,000 points
```

**Setting Up Rewards:**
1. Navigate to Settings → Rewards
2. Click "Add Reward"
3. Enter name, description, point cost
4. Optional: Add expiration, quantity limits
5. Save and child sees it immediately

### 2.2 For Students

#### 2.2.1 Daily Learning Flow

```
┌─────────────────────────────────────────────────────────────┐
│  DAILY LEARNING ADVENTURE                                   │
├─────────────────────────────────────────────────────────────┤
│  1. LOGIN → Enter your PIN                                  │
│  2. EMOTION CHECK-IN → How are you feeling today?          │
│  3. DAILY QUEST → Complete today's special challenge        │
│  4. LESSONS → Choose from recommended lessons               │
│  5. PLAY ZONE → Fun activities, games, stories              │
│  6. CELEBRATION → See your points and badges!               │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.2 Earning Points

| Activity | Points | Notes |
|----------|--------|-------|
| Complete lesson | 50-200 | Based on difficulty |
| Daily check-in | 10 | Once per day |
| Complete daily quest | 100-500 | Varies by age tier |
| First try on quiz | +25 bonus | No hints used |
| 7-day streak | 200 bonus | Weekly milestone |
| Help a friend | 50 | Collaborative activities |

#### 2.2.3 Badge Collection

Badges recognize achievements and growth:

**Academic Badges:**
- 📚 Bookworm (Complete 10 reading lessons)
- 🔢 Math Wizard (Complete 10 math lessons)
- 🔬 Science Explorer (Complete 10 science lessons)

**Growth Badges:**
- 🔥 Streak Master (7-day streak)
- 💪 Persistence Pro (Complete a challenging lesson after struggling)
- 🌟 Rising Star (First 100 points earned)

**Social Badges:**
- 🤝 Good Friend (Help 5 friends with activities)
- 🎉 Celebration Champion (Celebrate 10 peer achievements)

### 2.3 Age-Tier Experiences

Content and UI adapt automatically based on grade level:

| Age Tier | Grade | UI Style | Gamification | Competition |
|----------|-------|----------|--------------|-------------|
| **K-2** | K, 1, 2 | Bright colors, large buttons, voice narration | Stickers, simple points | None |
| **3-5** | 3, 4, 5 | Balanced UI, more text, quests | Badges, levels | Optional team-based |
| **6-8** | 6, 7, 8 | Dense information, detailed analytics | Achievement library, skill trees | Team challenges |
| **9-12** | 9-12 | Professional design, portfolio focus | Credentials, certifications | Academic competitions |

---

## 3. Developer Guide

### 3.1 Prerequisites

**Required Software:**
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18.x+ | JavaScript runtime |
| npm | 9.x+ | Package manager |
| Git | 2.40+ | Version control |
| VS Code | Latest | Recommended IDE |

**Recommended VS Code Extensions:**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### 3.2 Quick Start (5 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/inner-odyssey/odyssey-learns.git
cd odyssey-learns

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# → Opens http://localhost:5173

# 4. Run tests (optional)
npm run test        # Unit tests
npm run test:e2e    # E2E tests (requires Playwright)
```

**First-Run Checklist:**
- [ ] Development server starts without errors
- [ ] Landing page loads at localhost:5173
- [ ] Can navigate to /auth page
- [ ] Console shows no critical errors

### 3.3 Project Structure

```
inner-odyssey/
├── .github/                    # GitHub workflows, templates
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml             # Main CI (lint, test, build)
│   │   ├── deploy-staging.yml # Staging deployment
│   │   └── deploy-production.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                       # 📚 Documentation (you are here)
├── e2e/                        # Playwright E2E tests
├── public/                     # Static assets
├── scripts/                    # Build/test scripts
├── src/
│   ├── components/             # React components
│   │   ├── admin/              # Admin dashboard components
│   │   ├── auth/               # Authentication components
│   │   ├── emotional/          # Emotion tracking UI
│   │   ├── games/              # Multiplayer games
│   │   ├── gamification/       # Points, badges, streaks
│   │   ├── layout/             # Navigation, headers
│   │   ├── learning/           # Lesson components
│   │   ├── parent/             # Parent dashboard
│   │   ├── play/               # Play zone activities
│   │   ├── social/             # Peer connections
│   │   ├── teacher/            # Teacher portal
│   │   └── ui/                 # shadcn/ui components
│   ├── config/                 # Route and app configuration
│   ├── constants/              # Shared constants
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/           # Supabase client (auto-generated)
│   ├── lib/                    # Utility functions
│   ├── pages/                  # Route components
│   ├── routes/                 # Route definitions
│   └── types/                  # TypeScript type definitions
├── supabase/
│   ├── functions/              # Edge functions (Deno)
│   └── migrations/             # Database migrations (read-only)
└── package.json
```

### 3.4 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  React 18.3      │ UI library with concurrent features      │
│  TypeScript 5.x  │ Type-safe JavaScript                     │
│  Vite 5.x        │ Fast build tool, HMR                     │
│  Tailwind CSS    │ Utility-first CSS framework              │
│  shadcn/ui       │ Component library (Radix primitives)     │
│  React Query     │ Server state management                  │
│  React Router    │ Client-side routing                      │
│  Framer Motion   │ Animation library                        │
│  Recharts        │ Charting library                         │
│  Zod             │ Schema validation                        │
│  React Hook Form │ Form handling                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase        │ Backend-as-a-Service (Lovable Cloud)     │
│  PostgreSQL 15   │ Database with RLS                        │
│  Deno            │ Edge function runtime                    │
│  Lovable AI      │ AI content generation (Gemini)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                           │
├─────────────────────────────────────────────────────────────┤
│  Lovable Cloud   │ Auto-deployment, hosting                 │
│  Cloudflare      │ CDN, DDoS protection                     │
│  GitHub Actions  │ CI/CD pipelines                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 Code Style & Conventions

#### TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types
interface LessonProps {
  lessonId: string;
  childId: string;
  onComplete?: (score: number) => void;
}

// ❌ DON'T: Use any
const data: any = response; // Bad!

// ✅ DO: Use semantic naming
const isLessonComplete = progress >= 100;

// ❌ DON'T: Use magic numbers
if (score > 80) { /* ... */ } // Bad! What is 80?

// ✅ DO: Use constants
const PASSING_SCORE = 80;
if (score > PASSING_SCORE) { /* ... */ }
```

#### React Component Patterns

```typescript
// ✅ Functional components with TypeScript
import { FC, memo } from 'react';

interface BadgeProps {
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt?: Date;
}

export const Badge: FC<BadgeProps> = memo(({ name, tier, earnedAt }) => {
  // Use destructuring, not props.name
  return (
    <div className="flex items-center gap-2">
      <BadgeIcon tier={tier} />
      <span>{name}</span>
    </div>
  );
});

Badge.displayName = 'Badge'; // Required for memo
```

#### Tailwind CSS Conventions

```tsx
// ✅ DO: Use semantic tokens from design system
<div className="bg-background text-foreground border-border">

// ❌ DON'T: Use direct color values
<div className="bg-white text-gray-900 border-gray-200">

// ✅ DO: Use responsive prefixes consistently
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ DO: Group by concern (layout → spacing → typography → color)
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground">
```

### 3.6 Key Hooks Reference

| Hook | Purpose | Usage |
|------|---------|-------|
| `useAuth()` | Auth state, sign in/out | `const { user, isAdmin, signOut } = useAuth()` |
| `useValidatedChild()` | Get validated child context | `const { child, isLoading } = useValidatedChild()` |
| `useLessonAnalytics()` | Track lesson interactions | `logLessonStart(lessonId)` |
| `usePWA()` | PWA install/update state | `const { canInstall, install } = usePWA()` |
| `useNarration()` | Text-to-speech for lessons | `const { speak, stop, isPlaying } = useNarration()` |
| `useMultiplayerGame()` | Realtime game state | `const { room, players, joinRoom } = useMultiplayerGame()` |

### 3.7 Adding Features

#### Adding a New Page

```typescript
// 1. Create page component: src/pages/MyFeature.tsx
import { PageContainer } from '@/components/ui/page-container';

export default function MyFeature() {
  return (
    <PageContainer title="My Feature" description="Feature description">
      {/* Page content */}
    </PageContainer>
  );
}

// 2. Add route: src/routes/ChildRoutes.tsx
import { lazy } from 'react';
const MyFeature = lazy(() => import('@/pages/MyFeature'));

export const childRoutes = [
  // ... existing routes
  { path: 'my-feature', element: <MyFeature /> },
];

// 3. Add navigation link (if needed)
// src/components/layout/AgeAdaptiveNav.tsx
```

#### Adding a Database Table

```sql
-- Use Lovable's migration tool (ask the AI assistant)
-- Example: Creating a new feature table

CREATE TABLE public.my_feature_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Enable RLS
ALTER TABLE public.my_feature_data ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Parents can view own children data"
ON public.my_feature_data FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));
```

---

## 4. Operator & DevOps Guide

### 4.1 Deployment Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Developer                                                   │
│      │                                                       │
│      ▼                                                       │
│  Git Push → develop branch                                   │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ CI Pipeline (GitHub Actions)                            │ │
│  │  ├── Lint & Type Check                                  │ │
│  │  ├── Build Production Bundle                            │ │
│  │  ├── Security Scan (npm audit, secrets check)          │ │
│  │  ├── Unit Tests (Vitest)                                │ │
│  │  ├── E2E Tests (Playwright)                             │ │
│  │  └── Bundle Size Check (<5MB)                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│      │                                                       │
│      ▼ (auto-deploy on develop)                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ STAGING: staging.innerodyssey.lovable.app               │ │
│  └─────────────────────────────────────────────────────────┘ │
│      │                                                       │
│      ▼ (manual approval)                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ PRODUCTION: odyssey-learns.lovable.app                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Environment Configuration

**Auto-Generated (DO NOT EDIT):**
```bash
# .env (managed by Lovable Cloud)
VITE_SUPABASE_URL=https://hcsglifjqdmiykrrmncn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-generated>
VITE_SUPABASE_PROJECT_ID=hcsglifjqdmiykrrmncn
```

**Manual Configuration (Supabase Secrets):**
```bash
# Set via Supabase dashboard or CLI
RECAPTCHA_SECRET_KEY=<production-recaptcha-secret>
OPENAI_API_KEY=<optional-for-advanced-ai>
```

### 4.3 CI/CD Workflows

| Workflow | Trigger | Actions | Duration |
|----------|---------|---------|----------|
| `ci.yml` | Push, PR | Lint, Build, Test, Security | ~5 min |
| `deploy-staging.yml` | Push to `develop` | Deploy to staging | ~3 min |
| `deploy-production.yml` | Push to `main` | Backup DB, Deploy, Smoke test | ~10 min |

### 4.4 Rollback Procedure

**Immediate Rollback (< 5 minutes):**

```bash
# 1. Identify failing deployment
git log --oneline -10

# 2. Revert to last known good commit
git revert HEAD
git push origin main

# 3. Verify rollback in Lovable Cloud dashboard

# 4. Monitor error rates for 15 minutes
```

**Database Rollback:**
```sql
-- Backups are automatic (Lovable Cloud)
-- For manual restore, contact support with:
-- 1. Timestamp of last known good state
-- 2. Tables affected
-- 3. Description of data issue
```

### 4.5 Monitoring & Alerts

**Health Check Endpoint:**
```
GET /api/health
Response: { status: "healthy", version: "1.7.0", timestamp: "..." }
```

**Key Metrics to Monitor:**
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Error Rate | < 0.1% | > 1% |
| P95 Latency | < 500ms | > 2s |
| Uptime | 99.9% | < 99% |
| Edge Function Cold Start | < 1s | > 3s |

**Alert Channels:**
- Slack: `#inner-odyssey-alerts`
- Email: ops@innerodyssey.com
- PagerDuty: Critical issues only

### 4.6 Backup & Recovery

**Automatic Backups:**
- Daily point-in-time backups (7 days retention)
- Managed by Lovable Cloud

**Recovery Time Objectives:**
| Scenario | RTO | RPO |
|----------|-----|-----|
| App deployment failure | 5 min | 0 |
| Database corruption | 1 hour | 24 hours |
| Complete outage | 4 hours | 24 hours |

---

## 5. Architecture

### 5.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Browser   │  │  iOS PWA    │  │ Android PWA │  │   Tablet    │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         └────────────────┴────────────────┴────────────────┘             │
│                                    │                                      │
│                               HTTPS/WSS                                   │
│                                    │                                      │
└────────────────────────────────────┼──────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼──────────────────────────────────────┐
│                              EDGE LAYER                                   │
│                                    │                                      │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐│
│  │                        Cloudflare CDN                                 ││
│  │    - Static asset caching      - DDoS protection                      ││
│  │    - SSL termination           - Rate limiting (global)               ││
│  └─────────────────────────────────┬─────────────────────────────────────┘│
│                                    │                                      │
└────────────────────────────────────┼──────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼──────────────────────────────────────┐
│                          LOVABLE CLOUD                                    │
│                                    │                                      │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐│
│  │                     React SPA (Vite Build)                            ││
│  │    - Client-side routing       - React Query cache                   ││
│  │    - Service Worker (PWA)      - Offline capability                  ││
│  └─────────────────────────────────┬─────────────────────────────────────┘│
│                                    │                                      │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐│
│  │                     Supabase (PostgreSQL)                             ││
│  │    - Auth (JWT)                - Row Level Security                   ││
│  │    - Realtime subscriptions    - Storage (videos, avatars)           ││
│  └─────────────────────────────────┬─────────────────────────────────────┘│
│                                    │                                      │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐│
│  │                     Edge Functions (Deno)                             ││
│  │    - AI lesson generation      - Weekly reports                      ││
│  │    - Rate limit checks         - Analytics aggregation               ││
│  └─────────────────────────────────┬─────────────────────────────────────┘│
│                                    │                                      │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐│
│  │                     Lovable AI Gateway                                ││
│  │    - Gemini 2.5 Pro/Flash      - Content moderation                  ││
│  │    - Age-appropriate prompts   - Token management                    ││
│  └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow Diagrams

#### 5.2.1 Authentication Flow

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  User ──────────────────────────────────────────────────────► Auth Page   │
│                                                                           │
│  Auth Page ───────► Rate Limit Check ───────► check_rate_limit RPC        │
│       │                    │                         │                    │
│       │                    │ Pass                    │ Fail               │
│       │                    ▼                         ▼                    │
│       │            reCAPTCHA v3 ────────────► Show "Too many attempts"    │
│       │                    │                                              │
│       │                    │ Token                                        │
│       │                    ▼                                              │
│       │         verify-recaptcha Edge Function                            │
│       │                    │                                              │
│       │                    │ Valid                                        │
│       │                    ▼                                              │
│       └──────────► Supabase Auth ──────────► JWT Token                    │
│                                                     │                     │
│                                                     ▼                     │
│                              ┌───────────────────────────────────────────┐│
│                              │ if Admin  → /admin                       ││
│                              │ if Parent → /parent                      ││
│                              │ if Child  → /child/dashboard             ││
│                              └───────────────────────────────────────────┘│
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

#### 5.2.2 Lesson Generation Flow

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      AI LESSON GENERATION FLOW                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Parent/Child ─────────────────────────────────────────► Request Lesson   │
│                                                                │          │
│  ┌─────────────────────────────────────────────────────────────▼────────┐ │
│  │ Frontend Validation                                                   │ │
│  │  - Check daily quota (5 free lessons/day)                            │ │
│  │  - Validate topic/grade level                                         │ │
│  │  - Sanitize user input                                                │ │
│  └─────────────────────────────────────────────────────────────┬────────┘ │
│                                                                │          │
│  ┌─────────────────────────────────────────────────────────────▼────────┐ │
│  │ generate-custom-lesson Edge Function                                  │ │
│  │  - Build age-appropriate prompt                                       │ │
│  │  - Call Lovable AI Gateway (Gemini 2.5 Flash)                        │ │
│  │  - Parse response, generate quiz questions                           │ │
│  │  - Store in child_generated_lessons table                            │ │
│  └─────────────────────────────────────────────────────────────┬────────┘ │
│                                                                │          │
│  ┌─────────────────────────────────────────────────────────────▼────────┐ │
│  │ Response                                                              │ │
│  │  - Lesson content (markdown)                                          │ │
│  │  - Quiz questions (3-5)                                               │ │
│  │  - Estimated duration                                                 │ │
│  │  - Age-appropriate vocabulary                                         │ │
│  └─────────────────────────────────────────────────────────────┬────────┘ │
│                                                                │          │
│  Frontend ◄────────────────────────────────────────────────────┘          │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Database Schema Overview

**Core Entity Relationships:**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │────<│   children   │────<│user_progress │
│  (parents)   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │ emotion_logs │ │ user_badges  │ │quest_progress │
      └──────────────┘ └──────────────┘ └──────────────┘
```

**Key Tables:**
| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `profiles` | Parent user data | User can only read/write own |
| `children` | Child accounts | Parent can read/write own children |
| `lessons` | Platform lessons | Public read, admin write |
| `child_generated_lessons` | AI-generated lessons | Parent/child of creator |
| `user_progress` | Lesson completion tracking | Parent of child |
| `emotion_logs` | Emotional wellness data | Parent of child (encrypted) |
| `user_badges` | Badge achievements | Parent of child |
| `rewards` | Custom parent rewards | Creator parent only |

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema.

---

## 6. API Reference

### 6.1 Supabase Client Setup

```typescript
import { supabase } from '@/integrations/supabase/client';

// The client is pre-configured with environment variables
// DO NOT create new clients or modify this file
```

### 6.2 Common Query Patterns

#### Fetching Data

```typescript
// Get child's lessons
const { data: lessons, error } = await supabase
  .from('lessons')
  .select('id, title, subject, grade_level, content')
  .eq('grade_level', child.grade_level)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(20);

// Get with related data (joins)
const { data: progress } = await supabase
  .from('user_progress')
  .select(`
    id,
    score,
    completed_at,
    lesson:lessons(id, title, subject)
  `)
  .eq('child_id', childId);
```

#### Inserting Data

```typescript
// Create new progress record
const { data, error } = await supabase
  .from('user_progress')
  .insert({
    child_id: childId,
    lesson_id: lessonId,
    score: 85,
    time_spent_seconds: 300,
  })
  .select()
  .single();
```

#### Realtime Subscriptions

```typescript
// Subscribe to new messages
const channel = supabase
  .channel('parent-child-messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'parent_child_messages',
      filter: `child_id=eq.${childId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Cleanup on unmount
return () => supabase.removeChannel(channel);
```

### 6.3 Edge Functions

| Function | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `generate-custom-lesson` | POST | Create AI lesson | Yes |
| `ai-tutor` | POST | AI tutoring chat | Yes |
| `ai-insights` | POST | Generate parent insights | Yes |
| `generate-weekly-reports` | POST | Weekly progress reports | Yes (cron) |
| `verify-recaptcha` | POST | Validate reCAPTCHA token | No |
| `health-check` | GET | Service health status | No |

**Example: Calling Edge Function**

```typescript
const { data, error } = await supabase.functions.invoke('generate-custom-lesson', {
  body: {
    child_id: childId,
    topic: 'Photosynthesis',
    grade_level: '5',
    subject: 'science',
  },
});
```

### 6.4 RPC Functions

| Function | Purpose | Parameters |
|----------|---------|------------|
| `check_rate_limit` | Server-side rate limiting | `p_key`, `p_max_requests`, `p_window_seconds` |
| `verify_game_answer` | Validate quiz answer server-side | `p_question_id`, `p_submitted_answer` |
| `is_current_user_admin` | Check admin role | None |
| `has_role` | Check if user has specific role | `_user_id`, `_role` |

**Example: RPC Call**

```typescript
const { data: isCorrect } = await supabase.rpc('verify_game_answer', {
  p_question_id: questionId,
  p_submitted_answer: selectedAnswer,
});
```

---

## 7. Configuration Reference

### 7.1 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | Auto-generated |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key | Auto-generated |
| `VITE_SUPABASE_PROJECT_ID` | Yes | Project identifier | Auto-generated |
| `VITE_RECAPTCHA_SITE_KEY` | No | reCAPTCHA v3 site key | Test key |

### 7.2 Feature Flags

Feature flags are managed via database or environment:

```typescript
// Check feature flag (database-driven)
const { data } = await supabase
  .from('feature_flags')
  .select('enabled')
  .eq('name', 'ai_tutor')
  .single();

const isAITutorEnabled = data?.enabled ?? false;
```

### 7.3 Rate Limits

| Operation | Limit | Window | Enforcement |
|-----------|-------|--------|-------------|
| Login attempts | 5 | 15 min | Server-side |
| Custom lesson generation | 5 | 24 hours | Server-side |
| API requests | 1000 | 1 hour | Server-side |
| Child validation | 12 | 1 min | Client-side cache |

---

## 8. Security & Compliance

### 8.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: NETWORK                                            │
│  ├── Cloudflare DDoS protection                             │
│  ├── HTTPS everywhere (HSTS enforced)                       │
│  └── Rate limiting at edge                                   │
│                                                              │
│  Layer 2: AUTHENTICATION                                     │
│  ├── Supabase Auth (JWT)                                    │
│  ├── reCAPTCHA v3 (bot protection)                          │
│  ├── Password strength enforcement                          │
│  └── Session timeout (30 min inactivity)                    │
│                                                              │
│  Layer 3: AUTHORIZATION                                      │
│  ├── Role-Based Access Control (RBAC)                       │
│  ├── Row Level Security (RLS) on all tables                 │
│  ├── Server-side child validation                           │
│  └── Admin 2-person approval for sensitive actions          │
│                                                              │
│  Layer 4: DATA PROTECTION                                    │
│  ├── Emotion logs encrypted at rest                         │
│  ├── PII masking in logs and views                          │
│  ├── Input sanitization (DOMPurify)                         │
│  └── SQL injection prevention (parameterized queries)       │
│                                                              │
│  Layer 5: AUDIT & MONITORING                                 │
│  ├── All data access logged                                 │
│  ├── Failed auth attempts tracked                           │
│  ├── Anomaly detection for suspicious patterns              │
│  └── Real-time alerts for critical events                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 COPPA Compliance

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Parental consent | Required during signup | ✅ |
| Data minimization | Only essential data collected | ✅ |
| Right to access | Parent can export all data | ✅ |
| Right to delete | Parent can request deletion | ✅ |
| Privacy policy | Displayed during signup | ✅ |
| No third-party sharing | Data stays within platform | ✅ |
| Opt-in consent (2025) | Granular consent modal | ✅ |

### 8.3 FERPA Alignment

| Principle | Implementation | Status |
|-----------|----------------|--------|
| Educational records protection | RLS + encryption | ✅ |
| Parent access rights | Full dashboard access | ✅ |
| Amendment rights | Edit child profile | ✅ |
| Disclosure restrictions | No external sharing | ✅ |

### 8.4 OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| Injection | Parameterized queries, input sanitization |
| Broken Auth | Rate limiting, strong passwords, session timeout |
| Sensitive Data Exposure | Encryption at rest, HTTPS only |
| XXE | No XML processing |
| Broken Access Control | RLS policies, server-side validation |
| Security Misconfiguration | Secure defaults, CSP headers |
| XSS | DOMPurify, CSP, React's built-in escaping |
| Insecure Deserialization | No custom deserialization |
| Components with Vulnerabilities | npm audit in CI/CD |
| Insufficient Logging | Comprehensive audit logging |

### 8.5 Secrets Management

**DO:**
- Use Supabase secrets for API keys
- Rotate secrets quarterly
- Use environment-specific secrets

**DON'T:**
- Commit secrets to Git
- Log secrets anywhere
- Share secrets via chat/email

---

## 9. Testing & Quality

### 9.1 Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                        E2E Tests                             │
│                       (Playwright)                           │
│                          10%                                 │
│                    ┌──────────────┐                          │
│                   /                \                         │
│                  / Integration Tests\                        │
│                 /    (API, Hooks)    \                       │
│                /         20%          \                      │
│               ┌────────────────────────┐                     │
│              /                          \                    │
│             /       Unit Tests           \                   │
│            /     (Components, Utils)      \                  │
│           /            70%                 \                 │
│          ┌──────────────────────────────────┐                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Running Tests

```bash
# Unit tests (Vitest)
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report

# E2E tests (Playwright)
npm run test:e2e          # All E2E tests
npm run test:e2e:ui       # Interactive UI mode
npx playwright test --grep "auth"  # Filter by test name

# Security tests
npm run test:e2e -- e2e/security*.spec.ts

# Performance tests
npm run lighthouse        # Lighthouse CI
```

### 9.3 Test Coverage Expectations

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 70% | 68% |
| Integration Tests | 80% | 75% |
| E2E Critical Paths | 100% | 100% |
| Security Tests | 100% | 100% |

### 9.4 CI Integration

All tests run automatically on:
- Every pull request
- Every push to `main` or `develop`
- Daily scheduled run (security tests)

**Blocking Failures:**
- Any unit test failure
- Any E2E test failure
- Security scan findings (high/critical)
- Coverage drop > 5%

---

## 10. Observability & Operations

### 10.1 Logging Conventions

```typescript
// ✅ DO: Structured logging with context
console.log('[LessonPlayer] Starting lesson', { lessonId, childId });

// ❌ DON'T: Unstructured or missing context
console.log('Starting lesson'); // Bad!

// ✅ DO: Log errors with stack traces
console.error('[LessonPlayer] Failed to load lesson', {
  lessonId,
  error: error.message,
  stack: error.stack,
});

// ❌ DON'T: Log sensitive data
console.log('User password:', password); // NEVER!
```

**Log Levels:**
| Level | Usage | Example |
|-------|-------|---------|
| `error` | Failures requiring attention | Database query failed |
| `warn` | Potential issues | Rate limit approaching |
| `info` | Normal operations | Lesson completed |
| `debug` | Development only | Component re-render |

### 10.2 Metrics & Dashboards

**Key Metrics:**
- **Frontend:** LCP, FID, CLS, TTFB (Web Vitals)
- **Backend:** Request latency, error rate, connection pool usage
- **Business:** DAU, lesson completions, points earned

**Dashboard Access:**
- Lovable Cloud Dashboard: Real-time frontend metrics
- Supabase Dashboard: Database and function metrics

### 10.3 Alerting

| Alert | Condition | Channel | Severity |
|-------|-----------|---------|----------|
| High Error Rate | > 1% for 5 min | Slack | High |
| P95 Latency | > 2s for 5 min | Slack | Medium |
| Database Connections | > 80% used | Slack | High |
| Failed Deployments | Any failure | Slack + Email | Critical |

---

## 11. Examples & Walkthroughs

### 11.1 Creating a Custom Lesson (Parent)

```typescript
// Complete example: Requesting AI lesson for child

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

async function createCustomLesson(childId: string, topic: string, gradeLevel: string) {
  const { toast } = useToast();
  
  try {
    // 1. Check quota
    const { data: quota } = await supabase
      .from('daily_lesson_quota')
      .select('lessons_used')
      .eq('child_id', childId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();
    
    if (quota && quota.lessons_used >= 5) {
      toast({
        title: 'Daily Limit Reached',
        description: 'You can generate up to 5 lessons per day.',
        variant: 'destructive',
      });
      return null;
    }
    
    // 2. Generate lesson
    const { data, error } = await supabase.functions.invoke('generate-custom-lesson', {
      body: {
        child_id: childId,
        topic,
        grade_level: gradeLevel,
        subject: 'general',
      },
    });
    
    if (error) throw error;
    
    toast({
      title: 'Lesson Created!',
      description: `Your lesson on "${topic}" is ready.`,
    });
    
    return data.lesson;
    
  } catch (error) {
    toast({
      title: 'Generation Failed',
      description: 'Please try again in a few moments.',
      variant: 'destructive',
    });
    return null;
  }
}
```

### 11.2 Adding a New Badge Type

```sql
-- Step 1: Add badge to achievement_badges table
INSERT INTO public.achievement_badges (
  name,
  description,
  icon_url,
  tier,
  criteria_type,
  criteria_value,
  points_reward
) VALUES (
  'Speed Reader',
  'Complete 5 reading lessons in under 10 minutes each',
  '/badges/speed-reader.svg',
  'gold',
  'lesson_speed',
  '{"lessons": 5, "max_minutes": 10}',
  200
);
```

```typescript
// Step 2: Add badge checking logic in badgeChecker.ts
export async function checkSpeedReaderBadge(childId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_progress')
    .select('time_spent_seconds, lesson:lessons(subject)')
    .eq('child_id', childId)
    .lte('time_spent_seconds', 600) // 10 minutes
    .limit(5);
  
  const readingLessons = data?.filter(p => p.lesson?.subject === 'reading');
  return readingLessons?.length >= 5;
}
```

### 11.3 Implementing Realtime Feature

```typescript
// Complete example: Live activity feed

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useLiveActivityFeed(childId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    // Initial fetch
    supabase
      .from('user_progress')
      .select('*, lesson:lessons(title)')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setActivities(data || []));
    
    // Realtime subscription
    const channel = supabase
      .channel(`activity-feed-${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_progress',
          filter: `child_id=eq.${childId}`,
        },
        (payload) => {
          setActivities(prev => [payload.new as Activity, ...prev].slice(0, 10));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);
  
  return activities;
}
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Child not found" error | Child not selected or stale cache | Clear localStorage, re-select child |
| Lesson generation fails | Daily quota exceeded | Wait 24 hours or upgrade plan |
| Points not updating | RLS policy blocking write | Check parent-child relationship |
| Login loop | Session token expired | Clear cookies, log in again |
| Slow dashboard load | Large data set | Reduce date range, enable pagination |
| Video messages not playing | Browser permissions | Enable camera/microphone in settings |
| PWA not updating | Service worker cached | Force refresh or clear cache |

### 12.2 Debug Checklist

1. **Browser Console:** Check for JavaScript errors
2. **Network Tab:** Verify API responses (401, 403, 500)
3. **Application Tab:** Check localStorage for stale data
4. **Supabase Logs:** View Edge Function logs for backend errors
5. **Database:** Query tables directly to verify data

### 12.3 Getting Help

| Channel | Use For | Response Time |
|---------|---------|---------------|
| Docs (`/docs`) | Self-service first | Immediate |
| Slack `#inner-odyssey-dev` | Developer questions | < 4 hours |
| GitHub Issues | Bug reports, feature requests | < 24 hours |
| security@innerodyssey.com | Security issues | Immediate |

---

## 13. Version History

### Current Version: 1.7.0 (2026-01-17)

**Highlights:**
- AI Tutor with streaming responses
- Server-side game answer verification
- Enhanced emotion data encryption
- Comprehensive E2E smoke tests

See [CHANGELOG.md](../CHANGELOG.md) for complete history.

### Upgrade Instructions

**From 1.6.x to 1.7.x:**
1. Pull latest code
2. Run `npm install` (new dependencies)
3. Database migrations apply automatically
4. Clear browser cache for new PWA version

---

## Appendix A: Style Guide

### A.1 Terminology

| Term | Definition |
|------|------------|
| **Child** | A student account (ages 5-18) |
| **Parent** | Primary caregiver/guardian |
| **Educator** | Teacher or school administrator |
| **Lesson** | Educational content unit |
| **Quest** | Daily challenge or goal |
| **Badge** | Achievement recognition |
| **Points** | Earned currency for rewards |

### A.2 Code Formatting

```typescript
// File naming: kebab-case for files, PascalCase for components
src/components/learning/LessonCard.tsx

// Imports: grouped by type, sorted alphabetically
import { FC, memo } from 'react';              // React
import { useQuery } from '@tanstack/react-query'; // External
import { Button } from '@/components/ui/button';  // Internal
import { cn } from '@/lib/utils';                 // Utils
import type { Lesson } from '@/types';            // Types

// Props interface: above component, exported if reused
export interface LessonCardProps {
  lesson: Lesson;
  onComplete?: () => void;
}

// Component: exported as named export
export const LessonCard: FC<LessonCardProps> = memo(({ lesson, onComplete }) => {
  // hooks first, then derived state, then handlers, then render
});
```

### A.3 Documentation Standards

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Run the command" not "The command should be run")
- Include code examples for complex features
- Update docs in same PR as code changes
- Keep line length under 100 characters

### A.4 Commit Message Format

```
type(scope): description

[optional body]

[optional footer]

Types: feat, fix, docs, style, refactor, test, chore
Scope: auth, lessons, gamification, parent, child, admin

Examples:
feat(lessons): add voice narration for K-2 content
fix(auth): prevent session timeout during active use
docs(api): update edge function documentation
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-22  
**Maintainer:** Inner Odyssey Documentation Team  
**Feedback:** docs@innerodyssey.com
