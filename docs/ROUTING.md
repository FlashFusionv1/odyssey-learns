# Routing Architecture

## Overview

Inner Odyssey uses a **feature-based routing architecture** with type-safe configuration and lazy loading for optimal performance. The routing system is organized into five main feature groups: Auth, Public, Parent, Child, and Admin.

## Architecture Diagram

```
src/
├── App.tsx (80 lines - orchestration only)
├── routes/
│   ├── AuthRoutes.tsx      (Authentication flows)
│   ├── PublicRoutes.tsx    (Landing, marketing, static pages)
│   ├── ParentRoutes.tsx    (Parent dashboard, setup)
│   ├── ChildRoutes.tsx     (Child dashboard, lessons, activities)
│   └── AdminRoutes.tsx     (Admin dashboard, monitoring)
├── config/
│   ├── routes.config.ts    (Centralized route definitions)
│   ├── lazyRoutes.ts       (Lazy loading utilities with retry logic)
│   └── preloadRoutes.ts    (Preloading strategies)
├── constants/
│   └── routePaths.ts       (Type-safe route path constants)
└── types/
    └── routes.ts           (TypeScript interfaces for routes)
```

## Route Groups

### 1. Authentication Routes (`/login`, `/reset-password`, `/update-password`)
**File**: `src/routes/AuthRoutes.tsx`

**Features**:
- Redirects authenticated users to `/index`
- Custom auth-themed loading spinner
- Email confirmation flow support

**Example**:
```tsx
import { AuthRoutes } from '@/routes/AuthRoutes';

<Route path="/login" element={<AuthRoutes />} />
```

---

### 2. Public Routes (`/`, `/features`, `/pricing`, etc.)
**File**: `src/routes/PublicRoutes.tsx`

**Features**:
- SEO metadata injection for each page
- No authentication required
- Eager loading for landing page, lazy loading for others
- Analytics tracking on page views

**Routes**:
- `/` - Landing page (eager loaded)
- `/index` - Child selector
- `/about` - About us
- `/features` - Platform features
- `/pricing` - Pricing plans
- `/contact` - Contact form
- `/support` - Support center
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/discord` - Discord community
- `/beta-program` - Beta program info
- `*` - 404 Not Found

**Example**:
```tsx
import { PublicRoutes } from '@/routes/PublicRoutes';

<Route path="*" element={<PublicRoutes />} />
```

---

### 3. Parent Routes (`/parent`, `/parent-setup`)
**File**: `src/routes/ParentRoutes.tsx`

**Features**:
- Requires authentication (redirects to `/login` if not authenticated)
- Custom parent-themed loading spinner
- Parent role validation

**Routes**:
- `/parent` - Parent dashboard
- `/parent-setup` - Initial parent setup wizard

**Example**:
```tsx
import { ParentRoutes } from '@/routes/ParentRoutes';

<Route path="/parent" element={<ParentRoutes />} />
```

---

### 4. Child Routes (`/dashboard`, `/lessons`, etc.)
**File**: `src/routes/ChildRoutes.tsx`

**Features**:
- Requires authentication + child selection
- Validates child ownership server-side via RLS
- Screen time enforcement
- Lesson quota validation
- Age-adaptive UI theming

**Routes**:
- `/dashboard` - Child dashboard
- `/lessons` - Lesson library
- `/lessons/:id` - Lesson details
- `/lessons/:id/play` - Lesson player
- `/creator` - Creator dashboard
- `/community-lessons` - Community-shared lessons
- `/badges` - Badge showcase
- `/social` - Peer connections
- `/settings` - Child settings
- `/rewards` - Reward redemption

**Example**:
```tsx
import { ChildRoutes } from '@/routes/ChildRoutes';

<Route path="/lessons/*" element={<ChildRoutes />} />
```

---

### 5. Admin Routes (`/admin`, `/beta-analytics`, etc.)
**File**: `src/routes/AdminRoutes.tsx`

**Features**:
- Requires authentication + admin role
- Server-side role validation via `user_roles` table
- Access logging to `security_access_log` table
- Custom access denied page for non-admin users
- Technical error details visible

**Routes**:
- `/admin` - Admin dashboard
- `/admin-setup` - Admin setup
- `/beta-analytics` - Beta testing analytics
- `/beta-feedback-admin` - Feedback management
- `/lesson-analytics` - Lesson usage analytics
- `/phase1-lesson-generation` - AI lesson generation
- `/seed-lessons` - Seed lesson data
- `/lesson-review` - Lesson quality review
- `/lesson-performance-analytics` - Performance metrics
- `/student-performance-report` - Student reports
- `/security-monitoring` - Security dashboard
- `/system-health` - System health monitoring

**Example**:
```tsx
import { AdminRoutes } from '@/routes/AdminRoutes';

<Route path="/admin" element={<AdminRoutes />} />
```

---

## Type-Safe Route Paths

**Never hardcode paths!** Always use the centralized constants:

```tsx
import { ROUTE_PATHS } from '@/constants/routePaths';

// ✅ CORRECT
navigate(ROUTE_PATHS.CHILD.LESSONS);

// ❌ WRONG
navigate('/lessons');
```

### Path Building Utilities

For dynamic routes with parameters:

```tsx
import { buildLessonDetailPath, buildLessonPlayerPath } from '@/constants/routePaths';

// Build lesson detail path
const lessonPath = buildLessonDetailPath('lesson-id-123');
// Result: /lessons/lesson-id-123

// Build lesson player path
const playerPath = buildLessonPlayerPath('lesson-id-123');
// Result: /lessons/lesson-id-123/play
```

---

## Lazy Loading with Retry Logic

All heavy components use lazy loading with automatic retry on failure:

```tsx
import { createLazyRoute } from '@/config/lazyRoutes';

// Create a lazy route with retry logic and preloading
const Dashboard = createLazyRoute(
  () => import('@/pages/Dashboard'),
  {
    preload: true,        // Enable preloading
    maxRetries: 3,        // Retry up to 3 times on failure
    retryDelay: 1000,     // Wait 1 second between retries
  }
);
```

### Preloading Strategies

**1. Hover Preloading** (navigation links):
```tsx
import { preloadRouteOnHover } from '@/config/preloadRoutes';

<Link 
  to="/dashboard" 
  onMouseEnter={() => preloadRouteOnHover(() => import('@/pages/Dashboard'))}
>
  Dashboard
</Link>
```

**2. Idle Preloading** (automatic):
```tsx
import { initializePreloading } from '@/config/preloadRoutes';

// Initialize preloading after auth (call once on app mount)
initializePreloading({
  isAuthenticated: true,
  isAdmin: false,
});
```

**3. Manual Preloading**:
```tsx
import { preloadRoute } from '@/config/lazyRoutes';

// Preload a specific route
await preloadRoute(() => import('@/pages/Dashboard'));
```

---

## Route Configuration

Routes are defined in `src/config/routes.config.ts` with full type safety:

```tsx
import { RouteConfig } from '@/types/routes';

const childRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: ChildDashboard,
    requireAuth: true,
    roles: ['child'],
    preload: true,
    preloadPriority: 1,
    meta: {
      title: 'Dashboard - Inner Odyssey',
      description: 'Your learning adventure starts here',
    },
  },
  // ...more routes
];
```

### Route Config Properties

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | URL path for the route |
| `component` | `ComponentType \| LazyExoticComponent` | React component to render |
| `requireAuth` | `boolean?` | Whether authentication is required |
| `roles` | `string[]?` | Required roles (e.g., `['admin']`) |
| `preload` | `boolean?` | Enable preloading for this route |
| `preloadPriority` | `1 \| 2 \| 3?` | Priority level (1 = highest) |
| `meta` | `object?` | SEO metadata (title, description, keywords) |

---

## Adding a New Route

### Step 1: Add Route Path Constant

```tsx
// src/constants/routePaths.ts
export const ROUTE_PATHS = {
  CHILD: {
    // ...existing routes
    NEW_FEATURE: '/new-feature',
  },
};
```

### Step 2: Create Lazy Route

```tsx
// src/config/routes.config.ts
const NewFeature = createLazyRoute(() => import('@/pages/NewFeature'));
```

### Step 3: Add to Route Config

```tsx
// src/config/routes.config.ts
export const childRoutes: RouteConfig[] = [
  // ...existing routes
  {
    path: ROUTE_PATHS.CHILD.NEW_FEATURE,
    component: NewFeature,
    requireAuth: true,
    roles: ['child'],
    preload: false,
    meta: {
      title: 'New Feature - Inner Odyssey',
    },
  },
];
```

### Step 4: Add Route to App.tsx (if needed)

```tsx
// src/App.tsx
<Route path="/new-feature" element={<ChildRoutes />} />
```

**That's it!** The route is now:
- ✅ Type-safe
- ✅ Lazy loaded with retry logic
- ✅ Protected by authentication
- ✅ Has SEO metadata
- ✅ Centrally managed

---

## Error Boundaries

Each route group has its own error boundary with context-appropriate messages:

```tsx
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';

<RouteErrorBoundary feature="child">
  <ChildRoutes />
</RouteErrorBoundary>
```

Features:
- **Auth**: "Login Error" message
- **Parent**: "Parent Dashboard Error" with support link
- **Child**: Age-appropriate "Oops!" message
- **Admin**: Technical error details visible
- **Public**: Generic error message

---

## Performance Optimizations

### Bundle Size Reduction

| Metric | Before Refactor | After Refactor | Improvement |
|--------|----------------|----------------|-------------|
| App.tsx Lines | 296 | 80 | **73% smaller** |
| Initial Bundle | ~2.5MB | ~1.7MB | **32% smaller** |
| Route Modules | Monolithic | Feature-based | **Maintainable** |

### Preloading Strategy

1. **Critical Routes** (preload on hover):
   - Parent Dashboard
   - Child Dashboard
   - Lessons
   - Lesson Player

2. **Secondary Routes** (preload on idle after 3s):
   - Lesson Details
   - Badges
   - Settings
   - Rewards

3. **Admin Routes** (preload on idle after 5s, admin only):
   - Admin Dashboard
   - Analytics
   - Security Monitoring

---

## Route Guards

### Authentication Guard (built-in to route components)
```tsx
if (!user) {
  return <Navigate to="/login" replace />;
}
```

### Child Selection Guard
```tsx
if (!childId) {
  return <Navigate to="/index" replace />;
}
```

### Admin Role Guard
```tsx
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'admin')
  .maybeSingle();

if (!data) {
  return <AdminAccessDenied />;
}
```

---

## Testing Routes

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthRoutes } from '@/routes/AuthRoutes';

test('redirects authenticated users', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthRoutes />
    </MemoryRouter>
  );
  // Assert redirect behavior
});
```

### E2E Tests
```tsx
test('complete user flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/index');
});
```

---

## Troubleshooting

### Route Not Found (404)
1. Check route is defined in `routes.config.ts`
2. Verify path constant in `routePaths.ts`
3. Ensure route is added to App.tsx
4. Check for typos in path strings

### Lazy Loading Fails
- Check browser console for import errors
- Verify file exists at import path
- Clear build cache: `rm -rf dist node_modules/.vite`
- Check retry logic in `lazyRoutes.ts`

### Auth Redirect Loop
1. Verify user state in `useAuth` hook
2. Check RLS policies on `children` table
3. Ensure `localStorage` is accessible
4. Check for race conditions in validation

### Preloading Not Working
1. Verify `preload: true` in route config
2. Check `initializePreloading()` is called
3. Inspect Network tab for prefetch requests
4. Ensure user is authenticated (preloading disabled when logged out)

---

## Migration from Old Routing

If migrating from the old App.tsx routing:

1. **Before**: 296 lines, all routes in one file
2. **After**: 80 lines, feature-based modules

**Benefits**:
- ✅ 73% smaller App.tsx
- ✅ Type-safe route configuration
- ✅ Centralized path management
- ✅ Automatic retry on lazy load failures
- ✅ Feature-based organization
- ✅ SEO metadata per route
- ✅ Role-based access control
- ✅ Performance optimizations (preloading, code splitting)

---

## Best Practices

1. **Never hardcode paths** - Use `ROUTE_PATHS` constants
2. **Always use lazy loading** for non-critical routes
3. **Enable preloading** for frequently accessed routes
4. **Add SEO metadata** for all public routes
5. **Log admin access** to audit trail
6. **Validate server-side** - Never trust client-side auth
7. **Use error boundaries** for feature isolation
8. **Test auth flows** - Redirects, guards, role checks

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Performance Optimization](./PERFORMANCE.md)
- [Security Policies](./SECURITY.md)
- [Developer Onboarding](./DEVELOPER_ONBOARDING.md)
