# CLAUDE.md - AI Agent Development Guide

> This document provides guidance for Claude and other AI assistants working on the Inner Odyssey codebase.

## Project Overview

**Inner Odyssey** is a comprehensive K-12 educational platform combining:
- Emotional Intelligence (EI) training
- Academic excellence
- Real-world life skills
- Gamified learning experiences

**Tech Stack:** React 18.3 + TypeScript + Vite + Tailwind CSS + Supabase + Lovable Cloud

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

---

## Project Structure

```
odyssey-learns/
├── src/
│   ├── components/         # Reusable UI components (133 total)
│   │   ├── ui/            # shadcn/ui primitives (50+)
│   │   ├── auth/          # Authentication components
│   │   ├── learning/      # Lesson-related components
│   │   ├── parent/        # Parent dashboard widgets
│   │   ├── admin/         # Admin-specific components
│   │   └── ...
│   ├── pages/             # Route page components (40 total)
│   ├── hooks/             # Custom React hooks (9 total)
│   ├── lib/               # Utility functions (65+)
│   ├── routes/            # Route definitions
│   ├── config/            # App configuration
│   ├── constants/         # Route paths, constants
│   ├── integrations/      # Supabase client + types
│   └── types/             # TypeScript type definitions
├── supabase/
│   ├── migrations/        # Database migrations (45+)
│   └── functions/         # Edge Functions (20)
├── docs/                  # Documentation (55 files)
├── e2e/                   # Playwright E2E tests
└── scripts/               # Build/test scripts
```

---

## Key Architectural Patterns

### 1. Authentication
```typescript
// Always use the useAuth hook
import { useAuth } from '@/hooks/useAuth';

const { user, session, isAdmin, signIn, signOut } = useAuth();
```

### 2. Child Validation (CRITICAL)
```typescript
// NEVER trust localStorage directly - always validate server-side
import { useValidatedChild } from '@/hooks/useValidatedChild';

const { childId, isValidating, selectChild } = useValidatedChild();
```

### 3. Data Fetching
```typescript
// Use React Query for server state
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const { data, isLoading, error } = useQuery({
  queryKey: ['lessons', childId],
  queryFn: async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade_level', gradeLevel);
    return data;
  },
});
```

### 4. Input Sanitization (REQUIRED)
```typescript
// ALWAYS sanitize user input
import { sanitizeText, sanitizeHTML } from '@/lib/inputSanitization';

const cleanInput = sanitizeText(userInput, 500);
```

### 5. Error Handling
```typescript
import { handleError } from '@/lib/errorHandler';

try {
  // operation
} catch (error) {
  handleError(error, { component: 'ComponentName', action: 'actionName' });
}
```

---

## Security Requirements

### MUST DO:
1. **Never bypass RLS** - Always use authenticated Supabase client
2. **Validate child ownership** - Use `useValidatedChild()` hook
3. **Sanitize all inputs** - Use functions from `@/lib/inputSanitization`
4. **Check rate limits** - Use `checkServerRateLimit()` for sensitive operations
5. **Encrypt sensitive data** - Use `encryptEmotionField()` for emotion logs

### NEVER DO:
1. Store sensitive data in localStorage (use sessionStorage)
2. Trust client-side validation alone
3. Expose user IDs in URLs without validation
4. Skip RLS policies for convenience
5. Log sensitive user data

---

## Code Style Guidelines

### TypeScript
- Strict mode enabled - no `any` types (use `unknown` if needed)
- Prefer interfaces over types for object shapes
- Use const assertions for literals

### React
- Functional components only (no class components)
- Use custom hooks for shared logic
- Memoize expensive computations with `useMemo`/`useCallback`

### Tailwind CSS
- Use semantic tokens from `index.css` (e.g., `bg-primary`, `text-muted-foreground`)
- Never use direct color values (e.g., `bg-blue-500`)
- Use responsive prefixes (`sm:`, `md:`, `lg:`)

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE`

---

## Database Operations

### Query with RLS
```typescript
// RLS automatically filters by authenticated user
const { data } = await supabase
  .from('children')
  .select('*'); // Returns only current user's children
```

### Insert with Validation
```typescript
const { data, error } = await supabase
  .from('user_progress')
  .insert({
    child_id: childId, // Will fail if not owned by user (RLS)
    lesson_id: lessonId,
    status: 'completed'
  })
  .select()
  .single();
```

### Edge Functions
```typescript
// Call edge function
const { data, error } = await supabase.functions.invoke('generate-lesson-content', {
  body: { topic, gradeLevel }
});
```

---

## Testing Requirements

### Unit Tests
- Test all custom hooks
- Test utility functions
- Test component logic (not styling)

### E2E Tests (Playwright)
- Cover critical user flows:
  - Login/signup
  - Lesson completion
  - Quiz submission
  - Badge earning

### Security Tests
- Validate RLS policies
- Test rate limiting
- Verify session timeout

---

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/routes/` (correct route group)
3. Add path to `src/constants/routePaths.ts`
4. Update `src/config/routes.config.ts`

### Adding a New Component
1. Create in appropriate `src/components/` subfolder
2. Export from folder's index if exists
3. Add tests in `__tests__/` subfolder

### Adding a Database Table
1. Create migration in `supabase/migrations/`
2. Add RLS policies (REQUIRED)
3. Update types: `npx supabase gen types typescript`

### Adding an Edge Function
1. Create folder in `supabase/functions/`
2. Add `index.ts` with Deno handler
3. Test locally: `supabase functions serve`

---

## Performance Guidelines

### Do:
- Use React.lazy for route code splitting
- Cache queries with React Query (5-60 min stale time)
- Use database indexes for frequent queries
- Optimize images (WebP, lazy loading)

### Avoid:
- Large component bundles (>50KB)
- Unnecessary re-renders (use React.memo)
- N+1 queries (use joins)
- Blocking operations in render

---

## Edge Cases to Handle

1. **No internet connection** - Show offline indicator, queue actions
2. **Session expired** - Redirect to login, preserve intended destination
3. **No children added** - Redirect to parent setup
4. **Lesson not found** - Show friendly error, navigate back
5. **Rate limit exceeded** - Show retry timer, prevent spam
6. **Empty quiz questions** - Handle gracefully, skip quiz section

---

## Documentation References

| Topic | File |
|-------|------|
| Architecture | `docs/ARCHITECTURE.md` |
| Database | `docs/DATABASE_SCHEMA.md` |
| Security | `docs/SECURITY.md` |
| Components | `docs/COMPONENTS.md` |
| API | `docs/API_INTEGRATION.md` |
| Testing | `docs/TESTING.md` |
| Deployment | `docs/DEPLOYMENT.md` |
| Troubleshooting | `docs/TROUBLESHOOTING.md` |

---

## Quick Reference

### Route Groups
- `/` - Public routes (landing, marketing)
- `/login`, `/reset-password` - Auth routes
- `/parent`, `/parent-setup` - Parent routes
- `/dashboard`, `/lessons`, `/badges` - Child routes
- `/admin`, `/beta-analytics` - Admin routes

### Key Hooks
- `useAuth()` - Authentication state
- `useValidatedChild()` - Secure child selection
- `usePlatformLessonQuota()` - Daily lesson limits
- `useToast()` - Toast notifications

### Key Components
- `<AppLayout>` - Child dashboard wrapper
- `<ParentLayout>` - Parent dashboard wrapper
- `<RequireAuth>` - Protected route wrapper
- `<RequireChild>` - Child-required route wrapper
- `<ErrorBoundary>` - Error catching wrapper

---

## Contact & Support

- **Documentation Issues**: Update in `docs/` folder
- **Security Issues**: Priority handling required
- **Feature Requests**: Add to ROADMAP.md

---

*Last Updated: 2025-12-30*
*Version: 1.2.0*
