# Inner Odyssey - Quick Reference Card

**Version:** 1.0  
**Date:** January 10, 2026

---

## What Works Today ✅

### For Parents

- ✅ Create account with email or Google
- ✅ Add up to 5 children with profiles
- ✅ View child progress and analytics
- ✅ Get AI-powered insights and recommendations
- ✅ Send encouragement messages to children
- ✅ Create and manage custom rewards
- ✅ Approve reward redemptions
- ✅ Set screen time limits
- ✅ Grant bonus lesson tokens
- ✅ Export all child data (GDPR)
- ✅ Delete child accounts
- ✅ View engagement scores

### For Children

- ✅ Browse lessons by subject and grade
- ✅ Complete lessons with quizzes
- ✅ Request custom AI-generated lessons
- ✅ Earn points and badges
- ✅ Maintain daily streaks
- ✅ Complete daily quests
- ✅ View badge showcase
- ✅ Redeem rewards
- ✅ Log emotions daily
- ✅ Take notes on lessons
- ✅ Watch video lessons
- ✅ Connect with peers (parent approved)

### For Teachers

- ✅ View teacher dashboard
- ✅ Create and manage classes
- ✅ Create assignments
- ✅ View class analytics with charts
- ✅ Complete onboarding flow

### For Admins

- ✅ Review submitted lessons
- ✅ Score lesson quality
- ✅ View beta feedback
- ✅ Monitor security alerts
- ✅ Check system health
- ✅ Trigger batch lesson generation
- ✅ View lesson analytics

---

## Known Limitations ⚠️

| Limitation | Workaround | Fix Timeline |
|------------|------------|--------------|
| No offline mode | Requires internet | Q2 2026 |
| English only | N/A | Q3 2026 |
| No mobile app | Use mobile web | Q3 2026 |
| Teacher roles need manual assignment | Admin sets via DB | Q1 2026 |
| 1000 row query limit | Use pagination | Optimization ongoing |

---

## Quick Troubleshooting

### "Child not found" error

```
Cause: Selected child ID not in database or RLS blocking
Fix: 
1. Check localStorage for stale childId
2. Re-select child from parent dashboard
3. Verify child belongs to logged-in parent
```

### Lesson generation fails

```
Cause: Rate limit or AI API error
Fix:
1. Wait 60 seconds and retry
2. Check daily quota not exceeded
3. Try simpler topic
```

### Badge not unlocking

```
Cause: Criteria not fully met
Fix:
1. Check badge requirements in showcase
2. Verify lesson completion saved
3. Hard refresh page
```

### Real-time messages not appearing

```
Cause: WebSocket connection issue
Fix:
1. Check network connection
2. Refresh page
3. Sign out and back in
```

---

## Key URLs

| Environment | URL |
|-------------|-----|
| Production | app.innerodyssey.com |
| Staging | staging.innerodyssey.com |
| Preview | [auto-generated per PR] |
| Local Dev | localhost:8080 |

---

## Key Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:coverage # Coverage report

# Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
```

---

## Database Quick Stats

| Category | Count |
|----------|-------|
| Tables | 66+ |
| Edge Functions | 19 |
| Database Functions | 30+ |
| Indexes | 10+ critical |
| RLS Policies | All tables |

---

## API Endpoints (Edge Functions)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai-insights` | POST | Get AI recommendations |
| `/generate-custom-lesson` | POST | Create AI lesson |
| `/generate-weekly-reports` | POST | Trigger weekly emails |
| `/export-child-data` | POST | GDPR data export |
| `/delete-child-account` | POST | Account deletion |
| `/health-check` | GET | System status |
| `/verify-recaptcha` | POST | Bot verification |

---

## Support Contacts

| Issue Type | Contact |
|------------|---------|
| Bug Reports | GitHub Issues |
| Beta Feedback | In-app widget |
| Security Issues | security@innerodyssey.com |
| General Support | support@innerodyssey.com |

---

## File Structure Overview

```
src/
├── components/      # 100+ React components
│   ├── auth/       # Authentication
│   ├── learning/   # Learning features
│   ├── parent/     # Parent dashboard
│   ├── teacher/    # Teacher portal
│   ├── gamification/ # Points, badges
│   └── ui/         # shadcn components
├── hooks/          # 14+ custom hooks
├── pages/          # 42 page components
├── lib/            # Utilities
└── integrations/   # Supabase client

supabase/
├── functions/      # 19 edge functions
└── migrations/     # Database migrations

docs/               # 50+ documentation files
e2e/                # 14 E2E test files
```

---

## Version Info

| Component | Version |
|-----------|---------|
| React | 18.3.1 |
| TypeScript | Latest |
| Vite | Latest |
| Tailwind CSS | Latest |
| shadcn/ui | Latest |
| Supabase | 2.75.0 |

---

*Quick reference card for Inner Odyssey team and beta testers.*
