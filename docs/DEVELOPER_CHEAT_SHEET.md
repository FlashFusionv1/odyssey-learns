# Developer Cheat Sheet 🚀

**Quick reference for 90% of daily development tasks. For deep dives, see linked docs.**

---

## 🎯 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server → http://localhost:5173
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Git Workflow
git checkout -b feature/my-feature   # Create feature branch
git add .
git commit -m "feat: add feature"    # Conventional commits
git push origin feature/my-feature   # Push to GitHub

# Database Operations
# All via Lovable Cloud UI → Backend → Database
# Migrations auto-deploy when code pushed

# Edge Functions
# Auto-deploy when code pushed to supabase/functions/
# Test locally: See EDGE_FUNCTIONS.md
```

---

## 📁 File Structure Map (20 Key Locations)

| Path | Purpose | Edit Frequency |
|------|---------|----------------|
| `src/pages/` | Route components (30+ pages) | High |
| `src/components/ui/` | shadcn components (50+) | Low |
| `src/components/learning/` | Lesson UI | Medium |
| `src/components/parent/` | Parent dashboard widgets | Medium |
| `src/hooks/` | Custom React hooks | Medium |
| `src/lib/` | Utility functions | Medium |
| `src/integrations/supabase/` | **⚠️ AUTO-GEN, DON'T EDIT** | Never |
| `supabase/functions/` | Edge functions (Deno) | Medium |
| `docs/` | Documentation (15 files) | Low |
| `public/sounds/` | Audio assets | Low |

---

## 🗄️ Database Quick Reference

### Core Tables (15 Most Used)

| Table | Purpose | RLS | Key Columns |
|-------|---------|-----|-------------|
| `profiles` | User accounts | ✅ | `id`, `full_name` |
| `children` | Child profiles | ✅ | `id`, `parent_id`, `grade_level`, `total_points` |
| `lessons` | Platform lessons | ✅ | `id`, `subject`, `grade_level`, `content_markdown` |
| `child_generated_lessons` | Custom lessons | ✅ | `id`, `child_id`, `share_status` |
| `user_progress` | Lesson completion | ✅ | `child_id`, `lesson_id`, `score`, `completed_at` |
| `achievement_badges` | Badge definitions | ✅ | `badge_id`, `name`, `unlock_criteria` |
| `user_badges` | Earned badges | ✅ | `child_id`, `badge_id` |
| `daily_lesson_quota` | Daily limits | ✅ | `child_id`, `quota_date`, `platform_lessons_completed` |
| `rewards` | Parent rewards | ✅ | `parent_id`, `name`, `points_cost` |
| `reward_redemptions` | Redemption requests | ✅ | `child_id`, `reward_id`, `status` |
| `parent_child_messages` | Messaging | ✅ | `parent_id`, `child_id`, `message_text` |
| `peer_connections` | Friend system | ✅ | `child_id`, `peer_id`, `status` |
| `emotion_logs` | Emotional tracking | ✅ | `child_id`, `emotion_type`, `intensity` |
| `lesson_reviews` | Content QA | ✅ | `lesson_id`, `reviewer_id`, `status` |
| `beta_feedback` | User feedback | ✅ | `user_id`, `feedback_type`, `description` |

### Common Queries

```sql
-- Get child's recent progress
SELECT * FROM user_progress 
WHERE child_id = '<uuid>' 
ORDER BY completed_at DESC LIMIT 10;

-- Check daily lesson quota
SELECT * FROM daily_lesson_quota 
WHERE child_id = '<uuid>' AND quota_date = CURRENT_DATE;

-- View child's badges
SELECT b.name, ub.earned_at 
FROM user_badges ub
JOIN achievement_badges b ON ub.badge_id = b.badge_id
WHERE ub.child_id = '<uuid>';

-- Get parent's children
SELECT * FROM children 
WHERE parent_id = auth.uid();
```

---

## ⚡ Edge Functions Reference (12 Functions)

| Function | Auth | Purpose | Typical Response Time |
|----------|------|---------|----------------------|
| `generate-custom-lesson` | ✅ | AI lesson creation | 8-15s |
| `generate-weekly-reports` | ✅ | Parent email reports | 5-10s |
| `ai-insights` | ✅ | AI analysis | 3-6s |
| `batch-lesson-generation` | Admin | Bulk content | 30-60s |
| `seed-lessons` | Admin | Initial content | 30-60s |
| `seed-kindergarten-lessons` | Admin | K content | 20-40s |
| `seed-grade-2-lessons` | Admin | Grade 2 content | 20-40s |
| `track-lesson-analytics` | ✅ | Usage tracking | <1s |
| `request-lesson-share` | ✅ | Share request | <1s |
| `verify-recaptcha` | Public | Bot protection | <1s |
| `health-check` | Public | System status | <500ms |

**Invoke Example:**
```typescript
const { data, error } = await supabase.functions.invoke('generate-custom-lesson', {
  body: { childId, topic, subject, gradeLevel }
});
```

---

## 🎨 Common Code Patterns

### 1. Supabase CRUD Operations

```typescript
// SELECT
const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('grade_level', 5)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(10);

// INSERT
const { data, error } = await supabase
  .from('user_progress')
  .insert({
    child_id: childId,
    lesson_id: lessonId,
    score: 85,
    status: 'completed'
  })
  .select()
  .single();

// UPDATE
const { error } = await supabase
  .from('children')
  .update({ total_points: 150 })
  .eq('id', childId);

// DELETE
const { error } = await supabase
  .from('rewards')
  .delete()
  .eq('id', rewardId);
```

### 2. React Query Hooks

```typescript
// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['lessons', childId],
  queryFn: async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade_level', gradeLevel);
    return data;
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutate data
const { mutate } = useMutation({
  mutationFn: async (lessonId) => {
    return supabase
      .from('user_progress')
      .insert({ child_id: childId, lesson_id: lessonId });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['lessons', childId]);
    toast.success('Lesson started!');
  },
});
```

### 3. Form Validation (react-hook-form + zod)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  childName: z.string().min(2, 'Min 2 characters'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

### 4. RLS Policy Templates

```sql
-- Parent isolation (can only see their own children)
CREATE POLICY "Parents can view own children"
ON children FOR SELECT
USING (parent_id = auth.uid());

-- Child ownership (children can only see their own data)
CREATE POLICY "Children can view own progress"
ON user_progress FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

-- Admin override
CREATE POLICY "Admins can manage reviews"
ON lesson_reviews FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

### 5. Rate Limiting (Client-Side Check)

```typescript
import { checkRateLimit } from '@/lib/rateLimiter';

const handleGenerateLesson = async () => {
  const canProceed = await checkRateLimit(childId, 'custom-lesson-generation');
  if (!canProceed) {
    toast.error('Daily limit reached. Try again tomorrow!');
    return;
  }
  // Proceed with generation...
};
```

---

## 🔧 Troubleshooting Quick Fixes (Top 10)

| Issue | Quick Fix | Full Details |
|-------|-----------|--------------|
| **Child validation fails** | `localStorage.removeItem('selectedChildId')` | TROUBLESHOOTING.md |
| **Points not updating** | Check `user_progress` table, verify RLS policies | TROUBLESHOOTING.md |
| **Lesson generation fails** | Check `GEMINI_API_KEY` secret, verify quota | TROUBLESHOOTING.md |
| **Auth redirect loops** | Clear cookies, check `onboarding_completed` flag | TROUBLESHOOTING.md |
| **Edge function timeout** | Reduce prompt complexity, add pagination | EDGE_FUNCTIONS.md |
| **RLS policy denies query** | Verify `auth.uid()` matches ownership column | SECURITY.md |
| **Build fails** | Run `npm install`, check for TypeScript errors | DEPLOYMENT.md |
| **React Query stale data** | Reduce `staleTime`, call `invalidateQueries` | STATE_MANAGEMENT.md |
| **Slow page load** | Check bundle size with `npm run build`, lazy load routes | PERFORMANCE.md |
| **Type errors** | Types auto-gen from DB. Don't edit `types.ts` manually | ARCHITECTURE.md |

---

## 🚨 Emergency Procedures (Production Issues)

### 1. Production Down
```bash
# Step 1: Check health endpoint
curl https://[project].lovable.app/api/health

# Step 2: View logs in Lovable Cloud
Cloud → Edge Functions → View Logs

# Step 3: Rollback (if recent deploy caused issue)
Cloud → Deployments → Rollback to Previous

# Step 4: Notify team
Slack #engineering → "Production issue: [description]"
```

### 2. Database Migration Failed
```bash
# Step 1: View migration status
Cloud → Database → Migrations → View History

# Step 2: Check error logs
Cloud → Database → Logs

# Step 3: Manual rollback (if needed)
# Run reverse migration SQL in Cloud SQL Editor

# Step 4: Fix migration file
# Edit supabase/migrations/[timestamp]_*.sql
# Re-run migration
```

### 3. Security Incident (Data Breach Alert)
```bash
# Step 1: IMMEDIATELY rotate all secrets
Cloud → Settings → Secrets → Regenerate All

# Step 2: Audit access logs
SELECT * FROM security_access_log 
WHERE accessed_at > NOW() - INTERVAL '1 hour'
ORDER BY accessed_at DESC;

# Step 3: Force logout all users
# Invalidate all sessions via Supabase Auth dashboard

# Step 4: Notify affected users (if PII exposed)
# Use email template from SECURITY.md

# Step 5: Document incident
# Create incident report in docs/incidents/
```

### 4. Performance Degradation
```bash
# Step 1: Check current metrics
Cloud → Monitoring → Performance Dashboard

# Step 2: Identify slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

# Step 3: Clear cache (if needed)
# React Query cache clears on page refresh
# Supabase cache: Wait 5 minutes or restart edge functions

# Step 4: Scale resources (if traffic spike)
# Lovable Cloud auto-scales, but check current usage
Cloud → Settings → Resources
```

### 5. Edge Function Timeout (>30s)
```typescript
// Quick fix: Add timeout handler
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 25000)
);

const result = await Promise.race([
  actualFunction(),
  timeoutPromise
]);

// Long-term fix: Optimize function (see EDGE_FUNCTIONS.md)
```

---

## 🎯 Testing Checklist (Pre-Deploy)

**Manual Smoke Test (5 minutes):**
- [ ] Login/Signup works
- [ ] Child selection loads dashboard
- [ ] Lesson completion awards points
- [ ] Custom lesson generation works (within quota)
- [ ] Parent dashboard shows real-time updates
- [ ] No console errors

**Automated Tests (when implemented):**
```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests (Playwright)
npm run test:coverage     # Coverage report
```

---

## 📊 Performance Budgets (Fail Build If Exceeded)

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| Initial Bundle | <500KB | ~400KB | ✅ |
| Total Bundle | <2MB | ~1.5MB | ✅ |
| LCP | <2.5s | ~2.1s | ✅ |
| API Response (p95) | <500ms | ~350ms | ✅ |
| Edge Function | <30s | ~12s avg | ✅ |

---

## 🔗 Quick Links

**Documentation:**
- [Full Architecture](ARCHITECTURE.md) - System design
- [API Integration](API_INTEGRATION.md) - Supabase patterns
- [Security Guide](SECURITY.md) - RLS, COPPA compliance
- [Deployment](DEPLOYMENT.md) - CI/CD, rollback
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

**External Resources:**
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lovable Cloud](https://lovable.dev/docs)

---

## 💡 Pro Tips

1. **Always use `useValidatedChild()`** in child routes to prevent unauthorized access
2. **RLS policies are your friend** - Never bypass them with service role key in frontend
3. **React Query `staleTime`** - Set to 5 minutes for rarely-changing data
4. **Edge function timeouts** - Keep under 25s to avoid Deno runtime limits
5. **Bundle size matters** - Lazy load routes with `React.lazy()`
6. **Console.log cleanup** - Remove before deploying (or use feature flags)
7. **Error boundaries** - Wrap all major page sections to prevent full crashes
8. **Optimistic updates** - Make UI feel instant while backend processes
9. **Type safety** - Let TypeScript catch bugs before runtime
10. **Documentation** - Update this cheat sheet when patterns change!

---

**Last Updated:** 2025-11-15  
**Maintainer:** Development Team  
**Feedback:** Submit issues via Beta Feedback Widget or GitHub Issues

**Pro Developer Tip:** Bookmark this page and use Cmd/Ctrl+F to find commands instantly! ⚡
