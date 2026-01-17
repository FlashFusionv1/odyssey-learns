# Developer Guide

> **Version:** 1.6.0  
> **Last Updated:** 2026-01-17

## Quick Start

### Prerequisites

- Node.js 18+
- Git
- Modern browser (Chrome, Firefox, Safari, Edge)

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/inner-odyssey.git
cd inner-odyssey

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8080
```

---

## Project Structure

```
inner-odyssey/
├── docs/                    # Documentation
├── e2e/                     # End-to-end tests
├── public/                  # Static assets
├── scripts/                 # Build & test scripts
├── src/
│   ├── components/          # React components
│   ├── config/              # App configuration
│   ├── constants/           # Constants & enums
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External integrations
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Route pages
│   ├── routes/              # Route configuration
│   └── types/               # TypeScript types
├── supabase/
│   ├── functions/           # Edge functions
│   └── migrations/          # Database migrations
└── package.json
```

---

## Development Workflow

### Branch Strategy

```
main          # Production branch
├── staging   # Pre-production testing
└── feature/* # Feature branches
```

### Commit Convention

Follow [Conventional Commits](https://conventionalcommits.org/):

```bash
feat(lessons): add AI-powered lesson generation
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
test(e2e): add critical flow tests
chore(deps): update React to 18.3
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with tests
3. Run linting: `npm run lint`
4. Run tests: `npm run test`
5. Create PR with description
6. Request review
7. Merge after approval

---

## Code Standards

### TypeScript

```typescript
// ✅ Use explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Avoid 'any'
function getUser(id: any): any {
  // ...
}
```

### React Components

```tsx
/**
 * User profile card component
 * @param user - The user object to display
 * @param onEdit - Callback when edit is clicked
 */
interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card>
      <CardContent>
        <h3>{user.name}</h3>
        {onEdit && (
          <Button onClick={onEdit}>Edit</Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### Styling (Tailwind)

```tsx
// ✅ Use semantic tokens
<div className="bg-background text-foreground border-border">

// ✅ Use consistent spacing
<div className="p-4 space-y-4">

// ❌ Avoid magic numbers
<div className="p-[13px] mt-[7px]">
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific file
npm run test -- src/hooks/useAuth.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test
npx playwright test e2e/auth-flows.spec.ts

# Run with UI
npx playwright test --ui
```

### Test Structure

```typescript
describe('useAuth', () => {
  it('should return user when authenticated', async () => {
    // Arrange
    const mockUser = { id: '1', email: 'test@example.com' };
    
    // Act
    const { result } = renderHook(() => useAuth());
    
    // Assert
    expect(result.current.user).toEqual(mockUser);
  });
});
```

---

## Database Operations

### Running Migrations

Migrations are managed through Lovable Cloud. To apply changes:

1. Use the migration tool in the IDE
2. Write SQL migration
3. Approve when prompted
4. Types are auto-generated

### Query Patterns

```typescript
// Read with error handling
const { data, error } = await supabase
  .from('lessons')
  .select('id, title, subject')
  .eq('grade_level', 3)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Query failed:', error);
  return [];
}

return data;
```

### Realtime Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('progress')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_progress',
    }, handleUpdate)
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}, []);
```

---

## Edge Functions

### Creating a New Function

```bash
# Functions are in supabase/functions/
# Create new directory with index.ts
```

### Function Template

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { data } = await req.json();
    
    // Your logic here
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Debugging

### Console Logging

```typescript
// Use structured logging
console.log('[UserService]', 'Fetching user:', { userId });
console.error('[UserService]', 'Failed to fetch user:', error);
```

### React DevTools

1. Install React DevTools extension
2. Open browser DevTools
3. Navigate to "Components" tab
4. Inspect component props and state

### Network Debugging

1. Open DevTools Network tab
2. Filter by "Fetch/XHR"
3. Click request to see details
4. Check Response tab for data

---

## Performance

### Code Splitting

```typescript
// Lazy load heavy components
const VideoPlayer = lazy(() => import('./VideoPlayer'));

<Suspense fallback={<Skeleton />}>
  <VideoPlayer src={videoUrl} />
</Suspense>
```

### Image Optimization

```tsx
// Use next-gen formats
<OptimizedImage
  src="/images/hero.webp"
  alt="Hero image"
  width={1200}
  height={630}
  loading="lazy"
/>
```

### Memoization

```typescript
// Memoize expensive computations
const sortedData = useMemo(
  () => data.sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

---

## Deployment

### Staging

```bash
# Push to staging branch triggers deployment
git push origin staging
```

### Production

```bash
# Merge to main triggers production deployment
git checkout main
git merge staging
git push origin main
```

### Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Types out of sync | Reload IDE / regenerate types |
| Build fails | Check for TypeScript errors |
| Auth not working | Verify Supabase config |
| RLS errors | Check policies in Supabase |

### Getting Help

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing issues
3. Ask in team Discord
4. Create GitHub issue

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
