# CLAUDE.md - AI Agent Development Guide

> **Living Document**: This guide provides comprehensive guidance for Claude and other AI assistants working on the Inner Odyssey codebase. This document is updated with every major architectural change and reviewed monthly for accuracy.

**Document Status**: 🟢 Current | **Last Reviewed**: 2026-02-05 | **Version**: 2.0.0

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites & Setup](#prerequisites--setup)
- [Quick Start Commands](#quick-start-commands)
- [Project Structure](#project-structure)
- [Architecture Workflows](#architecture-workflows)
- [Key Architectural Patterns](#key-architectural-patterns)
- [Security Requirements](#security-requirements)
- [Code Style Guidelines](#code-style-guidelines)
- [Database Operations](#database-operations)
- [Testing Requirements](#testing-requirements)
- [Common Tasks](#common-tasks)
- [Performance Guidelines](#performance-guidelines)
- [Edge Cases to Handle](#edge-cases-to-handle)
- [Troubleshooting Quick Fixes](#troubleshooting-quick-fixes)
- [Documentation References](#documentation-references)
- [Quick Reference](#quick-reference)
- [Maintenance & Updates](#maintenance--updates)

---

## Project Overview

**Inner Odyssey** is a comprehensive K-12 educational platform combining:
- 🧠 Emotional Intelligence (EI) training
- 📚 Academic excellence
- 🌍 Real-world life skills
- 🎮 Gamified learning experiences

### Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Frontend | React | 18.3 | UI framework |
| Language | TypeScript | 5.x | Type safety |
| Build | Vite | 5.x | Fast dev server & bundler |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Backend | Supabase | Latest | BaaS (auth, DB, storage) |
| Deployment | Lovable Cloud | - | Hosting platform |
| State | React Query | 5.x | Server state management |
| Testing | Playwright | Latest | E2E testing |

### Platform Capabilities

```
Authentication → Child Selection → Learning Dashboard → Progress Tracking
       ↓               ↓                   ↓                    ↓
   RLS Security   Validation Hook    Gamification       Analytics
```

---

## Prerequisites & Setup

### Required Environment

**Before starting development, ensure you have:**

| Requirement | Version | Verification Command | Installation |
|-------------|---------|---------------------|--------------|
| Node.js | ≥18.0.0 | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | ≥9.0.0 | `npm --version` | Included with Node.js |
| Git | ≥2.30 | `git --version` | [git-scm.com](https://git-scm.com) |
| Supabase CLI | Latest | `supabase --version` | `npm i -g supabase` |

### Environment Variables

**Required** `.env.local` configuration:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

### First-Time Setup Checklist

- [ ] Clone repository: `git clone <repo-url>`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` with Supabase credentials
- [ ] Verify Supabase connection: `npm run dev` and check console
- [ ] Run database migrations (if local): `supabase db push`
- [ ] Verify build works: `npm run build`

---

## Quick Start Commands

```bash
# Development
npm install              # Install all dependencies
npm run dev             # Start dev server (http://localhost:5173)
npm run dev -- --host   # Expose to network

# Building
npm run build           # Production build (outputs to dist/)
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix linting issues
npm run type-check      # TypeScript type checking
npm run format          # Format code with Prettier

# Testing
npm run test            # Run unit tests (Vitest)
npm run test:watch      # Watch mode for tests
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:e2e:ui     # E2E tests with UI

# Database
npx supabase gen types typescript --local  # Generate types from DB schema
npx supabase db reset                      # Reset local database
npx supabase functions serve               # Test edge functions locally
```

**Pro Tip**: Use `npm run dev -- --port 3000` to change the dev server port.

---

## Project Structure

```
odyssey-learns/
├── 📂 src/
│   ├── 📂 components/              # Reusable UI components (133 total)
│   │   ├── 📂 ui/                 # shadcn/ui primitives (50+)
│   │   ├── 📂 auth/               # Authentication components
│   │   ├── 📂 learning/           # Lesson-related components
│   │   ├── 📂 parent/             # Parent dashboard widgets
│   │   ├── 📂 admin/              # Admin-specific components
│   │   └── 📂 [feature-based]/    # Feature-organized components
│   ├── 📂 pages/                  # Route page components (40 total)
│   ├── 📂 hooks/                  # Custom React hooks (9 total)
│   │   ├── useAuth.tsx           # Authentication hook
│   │   ├── useValidatedChild.tsx # Child validation hook
│   │   └── ...                    # Other custom hooks
│   ├── 📂 lib/                    # Utility functions (65+)
│   │   ├── inputSanitization.ts  # Input cleaning utilities
│   │   ├── errorHandler.ts       # Error handling
│   │   └── ...                    # Other utilities
│   ├── 📂 routes/                 # Route definitions
│   ├── 📂 config/                 # App configuration
│   ├── 📂 constants/              # Route paths, constants
│   ├── 📂 integrations/           # Supabase client + types
│   │   └── 📂 supabase/
│   │       ├── client.ts         # Supabase client instance
│   │       └── types.ts          # Generated DB types
│   └── 📂 types/                  # TypeScript type definitions
├── 📂 supabase/
│   ├── 📂 migrations/             # Database migrations (45+)
│   │   └── *.sql                 # Sequential migration files
│   └── 📂 functions/              # Edge Functions (20)
│       └── [function-name]/      # Each function in own folder
├── 📂 docs/                       # Documentation (87 files)
│   ├── ARCHITECTURE.md           # System architecture
│   ├── DATABASE_SCHEMA.md        # Database design
│   ├── SECURITY.md               # Security guidelines
│   └── ...                        # Additional docs
├── 📂 e2e/                        # Playwright E2E tests
├── 📂 scripts/                    # Build/test scripts
├── 📄 package.json               # Dependencies & scripts
├── 📄 vite.config.ts             # Vite configuration
├── 📄 tsconfig.json              # TypeScript configuration
└── 📄 tailwind.config.ts         # Tailwind CSS configuration
```

### Key Directories Explained

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| `src/components/ui/` | Primitive UI components from shadcn/ui | Using pre-built UI components |
| `src/components/[feature]/` | Feature-specific components | Building feature modules |
| `src/hooks/` | Reusable React hooks | Sharing stateful logic |
| `src/lib/` | Pure utility functions | Helper functions without React deps |
| `src/pages/` | Route-level page components | Creating new pages/routes |
| `supabase/migrations/` | Database schema changes | Modifying database structure |
| `supabase/functions/` | Server-side edge functions | Backend logic (API calls, processing) |

---

## Architecture Workflows

### User Authentication Flow

```
┌──────────────┐
│ Landing Page │
└──────┬───────┘
       │
       ├─→ Existing User? ──Yes──→ Login ──────────┐
       │                                            │
       └─→ New User? ────Yes──→ Sign Up ───────────┤
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │ Auth Hook Check  │
                                          └────────┬─────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │                             │
                              Parent?                         Child?
                                    │                             │
                         ┌──────────▼─────────┐         ┌────────▼──────────┐
                         │ Parent Dashboard   │         │ Select Child      │
                         │ - Manage Children  │         │ (useValidatedChild)│
                         │ - View Progress    │         └────────┬──────────┘
                         └────────────────────┘                  │
                                                        ┌─────────▼──────────┐
                                                        │ Child Dashboard    │
                                                        │ - Lessons          │
                                                        │ - Badges           │
                                                        │ - Progress         │
                                                        └────────────────────┘
```

### Lesson Completion Workflow

```
Start Lesson → Load Content → Display Lesson → Interactive Activities
                    │                                    │
                    └── RLS Check ──→ Child Owns?       │
                            │              │             │
                            No ───→ Error  Yes           │
                                           │             │
                                           ▼             │
                                    Track Progress ←─────┘
                                           │
                                           ▼
                                    Quiz Section? ──No──→ Complete ──→ Award XP
                                           │
                                          Yes
                                           │
                                           ▼
                                    Submit Answers → Grade → Pass? ──Yes──→ Complete
                                                              │
                                                             No
                                                              │
                                                              ▼
                                                         Retry Quiz
```

### Data Fetching Pattern

```
Component Render
      │
      ├─→ useQuery hook
      │      │
      │      ├─→ Check Cache ──Hit──→ Return Data
      │      │        │
      │      │       Miss
      │      │        │
      │      └───→ Fetch from Supabase
      │               │
      │               ├─→ RLS Check
      │               │
      │               ├─→ Return Data
      │               │
      │               └─→ Cache Result (5-60 min)
      │
      └─→ Display Loading/Error/Data States
```

---

## Key Architectural Patterns

### 1. Authentication Pattern

**Purpose**: Manage user authentication state across the application.

**Usage**: Import and use the `useAuth` hook in any component requiring auth state.

```typescript
// ✅ CORRECT: Always use the useAuth hook
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, session, isAdmin, signIn, signOut } = useAuth();

  // Input: none
  // Output: user object, session data, admin status, auth functions
  // Side effects: Subscribes to auth state changes

  if (!user) {
    return <LoginPrompt onSignIn={signIn} />;
  }

  return <Dashboard user={user} />;
}

// ❌ WRONG: Don't access Supabase auth directly
// const user = supabase.auth.getUser(); // Don't do this!
```

**Key Properties**:
- `user`: Current authenticated user or null
- `session`: Active session with tokens
- `isAdmin`: Boolean flag for admin privileges
- `signIn(email, password)`: Authenticate user
- `signOut()`: End user session

---

### 2. Child Validation Pattern (CRITICAL)

**Purpose**: Ensure child profiles belong to the authenticated parent before any operations.

**Security Invariant**: Never trust `childId` from localStorage without server-side validation.

```typescript
// ✅ CORRECT: Always validate child ownership
import { useValidatedChild } from '@/hooks/useValidatedChild';

function LessonPage() {
  const { childId, isValidating, selectChild, clearChild } = useValidatedChild();

  // Input: childId from localStorage (untrusted)
  // Output: Validated childId or null
  // Side effects: Queries database to verify ownership via RLS

  if (isValidating) {
    return <Spinner />;
  }

  if (!childId) {
    return <ChildSelector onSelect={selectChild} />;
  }

  // childId is now verified to belong to current user
  return <LessonContent childId={childId} />;
}

// ❌ WRONG: Never use localStorage directly
// const childId = localStorage.getItem('currentChildId'); // SECURITY RISK!
```

**Why This Matters**: Without validation, a malicious user could manipulate localStorage to access another child's data, bypassing RLS policies.

---

### 3. Data Fetching Pattern

**Purpose**: Fetch and cache server data with automatic refetching and error handling.

**Best Practice**: Use React Query for all server state (data from Supabase).

```typescript
// ✅ CORRECT: Use React Query for server data
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function LessonList({ childId }: { childId: string }) {
  // Input: childId (validated)
  // Output: lessons array, loading state, error
  // Side effects: Fetches from database, caches result

  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['lessons', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('child_id', childId)  // RLS will verify ownership
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
  });

  if (isLoading) return <Skeleton count={5} />;
  if (error) return <ErrorMessage error={error} />;

  return <List items={lessons} />;
}

// Mutations for create/update/delete operations
function useCreateLesson() {
  return useMutation({
    mutationFn: async (lessonData) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch lessons query
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}
```

---

### 4. Input Sanitization Pattern (REQUIRED)

**Purpose**: Prevent XSS attacks and injection vulnerabilities by cleaning user input.

**Security Requirement**: ALWAYS sanitize before storing or displaying user-generated content.

```typescript
// ✅ CORRECT: Sanitize all user inputs
import { sanitizeText, sanitizeHTML } from '@/lib/inputSanitization';

function CommentForm() {
  const handleSubmit = async (formData: FormData) => {
    const rawComment = formData.get('comment') as string;

    // Input: Raw user text (potentially malicious)
    // Output: Cleaned text with dangerous content removed
    // Side effects: Strips HTML tags, limits length, removes scripts
    const cleanComment = sanitizeText(rawComment, 500);  // Max 500 chars

    await supabase
      .from('comments')
      .insert({ content: cleanComment });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// For rich text (HTML content)
import DOMPurify from 'isomorphic-dompurify';

function RichTextDisplay({ htmlContent }: { htmlContent: string }) {
  // Input: HTML string (potentially malicious)
  // Output: Sanitized HTML safe to render
  const cleanHTML = sanitizeHTML(htmlContent);

  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}

// ❌ WRONG: Never render raw user input
// <div dangerouslySetInnerHTML={{ __html: userInput }} /> // XSS VULNERABILITY!
```

**Sanitization Functions**:
- `sanitizeText(text, maxLength)`: Remove HTML, limit length
- `sanitizeHTML(html)`: Clean HTML, allow safe tags only
- `sanitizeFileName(name)`: Clean file names for uploads

---

### 5. Error Handling Pattern

**Purpose**: Consistently handle and log errors across the application.

```typescript
// ✅ CORRECT: Use centralized error handler
import { handleError } from '@/lib/errorHandler';
import { useToast } from '@/hooks/useToast';

function DataComponent() {
  const { toast } = useToast();

  const processData = async () => {
    try {
      const result = await riskyOperation();
      return result;
    } catch (error) {
      // Input: Error object
      // Output: Logged error, user-friendly message
      // Side effects: Logs to console/service, shows toast notification

      handleError(error, {
        component: 'DataComponent',
        action: 'processData',
        userId: user?.id,
      });

      toast({
        title: 'Operation Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    }
  };

  return <button onClick={processData}>Process</button>;
}
```

---

## Security Requirements

### MUST DO (Critical Security Practices)

#### 1. Never Bypass Row Level Security (RLS)

```typescript
// ✅ CORRECT: Use authenticated Supabase client
import { supabase } from '@/integrations/supabase/client';

const { data } = await supabase
  .from('children')
  .select('*');  // RLS automatically filters to current user's children
```

**Why**: RLS policies ensure users can only access their own data, even if they modify requests.

#### 2. Validate Child Ownership

```typescript
// ✅ CORRECT: Use validation hook
const { childId } = useValidatedChild();

// ❌ WRONG: Trust localStorage
const childId = localStorage.getItem('childId');  // SECURITY RISK!
```

**Why**: Users can manipulate localStorage to access other children's profiles.

#### 3. Sanitize All User Inputs

```typescript
// ✅ CORRECT: Clean inputs before storage/display
const cleanName = sanitizeText(userInput, 100);

// ❌ WRONG: Store raw input
await supabase.from('profiles').insert({ name: userInput });  // XSS RISK!
```

**Why**: Prevents XSS attacks, SQL injection, and other injection vulnerabilities.

#### 4. Check Rate Limits for Sensitive Operations

```typescript
// ✅ CORRECT: Rate limit sensitive actions
import { checkServerRateLimit } from '@/lib/rateLimit';

const canProceed = await checkServerRateLimit('submit-quiz', userId);
if (!canProceed) {
  toast({ title: 'Too many requests', description: 'Please wait.' });
  return;
}
```

**Why**: Prevents abuse, spam, and DOS attacks.

#### 5. Encrypt Sensitive Data

```typescript
// ✅ CORRECT: Encrypt emotion logs
import { encryptEmotionField } from '@/lib/encryption';

const encryptedEmotion = encryptEmotionField(emotionData);
await supabase.from('emotion_logs').insert({ data: encryptedEmotion });
```

**Why**: Protects sensitive personal information even if database is compromised.

---

### NEVER DO (Security Anti-Patterns)

#### ❌ 1. Store Sensitive Data in localStorage

```typescript
// ❌ WRONG: localStorage is not secure
localStorage.setItem('password', userPassword);

// ✅ CORRECT: Use sessionStorage for session data only
sessionStorage.setItem('tempToken', token);
```

**Why**: localStorage persists indefinitely and is vulnerable to XSS attacks.

#### ❌ 2. Trust Client-Side Validation Alone

```typescript
// ❌ WRONG: Client-side only
if (password.length < 8) {
  return 'Password too short';
}

// ✅ CORRECT: Always validate server-side too
// Server validates password strength in edge function
```

**Why**: Attackers can bypass client-side validation by modifying requests.

#### ❌ 3. Expose User IDs in URLs Without Validation

```typescript
// ❌ WRONG: URL parameter without validation
/profile/:userId  // Anyone can change userId in URL

// ✅ CORRECT: Validate ownership
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', session.user.id);  // Always use authenticated user
```

#### ❌ 4. Skip RLS Policies for Convenience

```typescript
// ❌ WRONG: Using service role key in client
const adminClient = createClient(url, SERVICE_ROLE_KEY);

// ✅ CORRECT: Use authenticated client, let RLS handle access
const { data } = await supabase.from('users').select('*');
```

#### ❌ 5. Log Sensitive User Data

```typescript
// ❌ WRONG: Logging PII
console.log('User email:', user.email);

// ✅ CORRECT: Log only non-sensitive identifiers
console.log('User ID:', user.id);
```

---

## Code Style Guidelines

### TypeScript Standards

#### Type Safety Rules

```typescript
// ✅ CORRECT: Use strict types
interface UserProfile {
  id: string;
  name: string;
  age: number;
  email: string;
}

function updateProfile(profile: UserProfile): Promise<UserProfile> {
  // Implementation
}

// ❌ WRONG: Using 'any'
function updateProfile(profile: any): any {  // Disables type checking!
  // Implementation
}

// ✅ CORRECT: Use 'unknown' when type is truly unknown
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// Type guard for narrowing
function isUserProfile(obj: unknown): obj is UserProfile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}
```

#### Prefer Interfaces Over Types for Objects

```typescript
// ✅ CORRECT: Interface for object shapes
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// ✅ CORRECT: Type for unions/aliases
type Status = 'idle' | 'loading' | 'success' | 'error';
type ID = string | number;
```

#### Use Const Assertions

```typescript
// ✅ CORRECT: Const assertion for immutable values
const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
} as const;

type Color = typeof COLORS[keyof typeof COLORS];  // '#007bff' | '#6c757d'
```

---

### React Standards

#### Functional Components Only

```typescript
// ✅ CORRECT: Functional component
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ WRONG: Class component (outdated)
class UserProfile extends React.Component {
  render() {
    return <div>{this.props.user.name}</div>;
  }
}
```

#### Custom Hooks for Shared Logic

```typescript
// ✅ CORRECT: Extract logic into custom hook
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
}

// Use in components
function Profile({ userId }: { userId: string }) {
  const { user, loading } = useUserData(userId);
  // ...
}
```

#### Memoize Expensive Computations

```typescript
// ✅ CORRECT: Memoize expensive calculations
function DataTable({ data }: { data: Item[] }) {
  const sortedData = useMemo(
    () => data.slice().sort((a, b) => a.score - b.score),
    [data]  // Only recalculate when data changes
  );

  const handleClick = useCallback(
    (id: string) => {
      console.log('Clicked:', id);
    },
    []  // Stable function reference
  );

  return <Table data={sortedData} onClick={handleClick} />;
}
```

---

### Tailwind CSS Standards

#### Use Semantic Tokens

```typescript
// ✅ CORRECT: Use semantic tokens from index.css
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ WRONG: Direct color values
<div className="bg-blue-500 text-white">  // Hard-coded colors
  <p className="text-gray-600">Description</p>
</div>
```

#### Responsive Design

```typescript
// ✅ CORRECT: Mobile-first responsive classes
<div className="
  w-full           /* Mobile: full width */
  sm:w-1/2         /* Small screens: 50% */
  md:w-1/3         /* Medium: 33% */
  lg:w-1/4         /* Large: 25% */
">
  Content
</div>
```

#### Component Variants

```typescript
// ✅ CORRECT: Use className utilities for variants
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

function Button({ variant = 'default', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'border border-input hover:bg-accent': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

---

### File Naming Conventions

```
✅ CORRECT:
- Components: UserProfile.tsx, LessonCard.tsx
- Hooks: useAuth.tsx, useValidatedChild.tsx
- Utilities: errorHandler.ts, formatDate.ts
- Constants: API_ENDPOINTS.ts, ROUTE_PATHS.ts
- Types: user.types.ts, lesson.types.ts

❌ WRONG:
- user-profile.tsx (kebab-case for components)
- UseAuth.tsx (PascalCase for hooks)
- error-handler.ts (kebab-case for utilities)
- api_endpoints.ts (snake_case for constants)
```

---

## Database Operations

### Query with RLS (Row Level Security)

**Concept**: RLS policies automatically filter data based on authenticated user.

```typescript
// ✅ CORRECT: RLS filters automatically
const { data: children, error } = await supabase
  .from('children')
  .select('*');
// Returns ONLY children owned by current authenticated user

// No need to add .eq('parent_id', user.id) - RLS does this automatically
```

**How RLS Works**:
```sql
-- RLS Policy (in database)
CREATE POLICY "Users can only see their own children"
ON children
FOR SELECT
USING (parent_id = auth.uid());
```

---

### Insert with Validation

```typescript
// ✅ CORRECT: Insert with RLS validation
const { data, error } = await supabase
  .from('user_progress')
  .insert({
    child_id: childId,        // RLS will verify child belongs to user
    lesson_id: lessonId,
    status: 'completed',
    score: 95,
    completed_at: new Date().toISOString(),
  })
  .select()                   // Return inserted row
  .single();                  // Expect single result

if (error) {
  // Common errors:
  // - RLS policy rejection (child doesn't belong to user)
  // - Foreign key constraint (invalid child_id or lesson_id)
  // - Unique constraint (duplicate entry)
  handleError(error, { component: 'LessonComplete', action: 'insert_progress' });
  return;
}

console.log('Progress saved:', data);
```

---

### Update Operations

```typescript
// ✅ CORRECT: Update with conditions
const { data, error } = await supabase
  .from('children')
  .update({
    grade_level: newGradeLevel,
    updated_at: new Date().toISOString(),
  })
  .eq('id', childId)          // WHERE id = childId
  .select()
  .single();

// RLS ensures user can only update their own children
```

---

### Complex Queries with Joins

```typescript
// ✅ CORRECT: Fetch related data with joins
const { data: lessonsWithProgress, error } = await supabase
  .from('lessons')
  .select(`
    *,
    user_progress(
      status,
      score,
      completed_at
    )
  `)
  .eq('grade_level', gradeLevel)
  .eq('user_progress.child_id', childId)
  .order('sequence_order');

// Returns lessons with nested progress data
```

---

### Edge Functions (Server-Side Logic)

**When to Use**: Complex business logic, external API calls, sensitive operations

```typescript
// ✅ CORRECT: Call edge function from client
const { data, error } = await supabase.functions.invoke('generate-lesson-content', {
  body: {
    topic: 'Fractions',
    gradeLevel: 5,
    difficulty: 'medium',
  },
});

if (error) {
  console.error('Edge function error:', error);
  return;
}

console.log('Generated content:', data);
```

**Edge Function Example** (`supabase/functions/generate-lesson-content/index.ts`):

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Input validation
    const { topic, gradeLevel, difficulty } = await req.json();

    if (!topic || !gradeLevel) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Use service role client for elevated permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Complex logic here
    const content = await generateContent(topic, gradeLevel, difficulty);

    return new Response(
      JSON.stringify({ content }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

---

## Testing Requirements

### Unit Tests (Vitest)

**What to Test**: Hooks, utilities, component logic (not styling)

```typescript
// ✅ CORRECT: Test custom hook
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('should return null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should sign in user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });
  });
});
```

```typescript
// ✅ CORRECT: Test utility function
import { sanitizeText } from '@/lib/inputSanitization';

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const output = sanitizeText(input, 100);

    expect(output).toBe('Hello');
    expect(output).not.toContain('<script>');
  });

  it('should limit text length', () => {
    const input = 'a'.repeat(1000);
    const output = sanitizeText(input, 50);

    expect(output.length).toBeLessThanOrEqual(50);
  });
});
```

---

### E2E Tests (Playwright)

**What to Test**: Critical user flows end-to-end

```typescript
// ✅ CORRECT: Test complete user flow
import { test, expect } from '@playwright/test';

test.describe('Lesson Completion Flow', () => {
  test('should complete lesson and earn XP', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'parent@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Select child
    await expect(page).toHaveURL('/parent-setup');
    await page.click('[data-testid="child-card-1"]');

    // 3. Navigate to lesson
    await expect(page).toHaveURL('/dashboard');
    await page.click('[data-testid="lesson-card"]');

    // 4. Complete lesson
    await expect(page).toHaveURL(/\/lessons\/.+/);
    await page.click('[data-testid="start-lesson"]');
    await page.click('[data-testid="complete-lesson"]');

    // 5. Verify completion
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-earned"]')).toContainText('50 XP');
  });
});
```

**Critical Flows to Test**:
- ✅ User authentication (login/signup/logout)
- ✅ Child profile creation and selection
- ✅ Lesson completion and progress tracking
- ✅ Quiz submission and grading
- ✅ Badge earning and display
- ✅ Parent dashboard data display
- ✅ Error handling (network errors, invalid data)

---

### Security Tests

```typescript
// ✅ CORRECT: Test RLS policies
test.describe('RLS Policy Tests', () => {
  test('should not allow user to access another users children', async () => {
    // Login as user A
    const userA = await createTestUser('userA@example.com');
    const childA = await createTestChild(userA.id);

    // Login as user B
    const userB = await createTestUser('userB@example.com');

    // Try to fetch user A's child as user B
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', childA.id);

    // Should return empty array (RLS filtered it out)
    expect(data).toEqual([]);
  });
});
```

---

## Common Tasks

### Adding a New Page

**Complete Checklist**:

1. **Create page component** in `src/pages/`

```typescript
// src/pages/MyNewPage.tsx
export default function MyNewPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">My New Page</h1>
        {/* Page content */}
      </div>
    </AppLayout>
  );
}
```

2. **Add route constant** in `src/constants/routePaths.ts`

```typescript
export const ROUTE_PATHS = {
  // ... existing routes
  MY_NEW_PAGE: '/my-new-page',
} as const;
```

3. **Add route definition** in appropriate `src/routes/` file

```typescript
// src/routes/childRoutes.tsx
import MyNewPage from '@/pages/MyNewPage';
import { ROUTE_PATHS } from '@/constants/routePaths';

export const childRoutes = [
  // ... existing routes
  {
    path: ROUTE_PATHS.MY_NEW_PAGE,
    element: <MyNewPage />,
  },
];
```

4. **Update route config** in `src/config/routes.config.ts`

```typescript
export const routeConfig = {
  // ... existing config
  [ROUTE_PATHS.MY_NEW_PAGE]: {
    title: 'My New Page',
    requiresAuth: true,
    requiresChild: true,
  },
};
```

5. **Add navigation link** (if needed)

```typescript
// In navigation component
<Link to={ROUTE_PATHS.MY_NEW_PAGE}>My New Page</Link>
```

---

### Adding a New Component

**Component Structure**:

```
src/components/
└── feature-name/
    ├── index.ts                    # Export all components
    ├── FeatureComponent.tsx        # Main component
    ├── FeatureSubComponent.tsx     # Sub-components
    └── __tests__/
        └── FeatureComponent.test.tsx
```

**Example**:

```typescript
// src/components/learning/QuizCard.tsx
interface QuizCardProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
}

export function QuizCard({ question, options, onAnswer }: QuizCardProps) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{question}</h3>
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option)}
            className="w-full text-left px-4 py-2 border rounded hover:bg-accent"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/components/learning/index.ts
export { QuizCard } from './QuizCard';
export { LessonCard } from './LessonCard';
// ... other exports
```

---

### Adding a Database Table

**Complete Process**:

1. **Create migration file**

```bash
# Generate migration file
npx supabase migration new add_quiz_results_table
```

2. **Write migration SQL** (`supabase/migrations/[timestamp]_add_quiz_results_table.sql`)

```sql
-- Create table
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_quiz_results_child_id ON quiz_results(child_id);
CREATE INDEX idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results(completed_at DESC);

-- Enable RLS (REQUIRED!)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own children's quiz results
CREATE POLICY "Users can view own children's quiz results"
ON quiz_results
FOR SELECT
USING (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
);

-- RLS Policy: Users can insert quiz results for their children
CREATE POLICY "Users can insert quiz results for own children"
ON quiz_results
FOR INSERT
WITH CHECK (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
);

-- Add comments for documentation
COMMENT ON TABLE quiz_results IS 'Stores quiz submission results for children';
COMMENT ON COLUMN quiz_results.answers IS 'JSONB object with question IDs and selected answers';
```

3. **Generate TypeScript types**

```bash
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

4. **Use in application**

```typescript
// Now TypeScript knows about quiz_results table
const { data, error } = await supabase
  .from('quiz_results')  // Autocomplete works!
  .select('*')
  .eq('child_id', childId);
```

---

### Adding an Edge Function

**Complete Process**:

1. **Create function folder**

```bash
npx supabase functions new my-function
```

2. **Write function code** (`supabase/functions/my-function/index.ts`)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  childId: string;
  data: unknown;
}

serve(async (req) => {
  try {
    // Parse request
    const { childId, data }: RequestBody = await req.json();

    // Validate input
    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'childId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user owns child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return new Response(
        JSON.stringify({ error: 'Child not found or unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process data
    const result = await processData(data);

    // Return success
    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function processData(data: unknown) {
  // Implementation
  return { processed: true };
}
```

3. **Test locally**

```bash
npx supabase functions serve my-function
```

4. **Call from client**

```typescript
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { childId, data: payload },
});
```

---

## Performance Guidelines

### DO: Optimize for Performance

#### 1. Code Splitting with React.lazy

```typescript
// ✅ CORRECT: Lazy load heavy components
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

#### 2. Cache Queries Appropriately

```typescript
// ✅ CORRECT: Set appropriate cache times
const { data } = useQuery({
  queryKey: ['static-content'],
  queryFn: fetchStaticContent,
  staleTime: 60 * 60 * 1000,  // 1 hour for static content
});

const { data: liveData } = useQuery({
  queryKey: ['live-progress'],
  queryFn: fetchProgress,
  staleTime: 5 * 60 * 1000,   // 5 minutes for frequently changing data
});
```

#### 3. Database Indexes

```sql
-- ✅ CORRECT: Index frequently queried columns
CREATE INDEX idx_lessons_grade_level ON lessons(grade_level);
CREATE INDEX idx_user_progress_child_id_status ON user_progress(child_id, status);

-- Composite index for common query patterns
CREATE INDEX idx_lessons_search ON lessons(grade_level, subject, status);
```

#### 4. Optimize Images

```typescript
// ✅ CORRECT: Lazy load images with modern formats
<img
  src="/images/hero.webp"
  alt="Hero"
  loading="lazy"
  width={800}
  height={600}
/>

// Use srcset for responsive images
<img
  src="/images/hero-800w.webp"
  srcSet="/images/hero-400w.webp 400w, /images/hero-800w.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Hero"
  loading="lazy"
/>
```

---

### AVOID: Performance Anti-Patterns

#### ❌ 1. Large Component Bundles

```typescript
// ❌ WRONG: Single large component file (>50KB)
// MyHugeComponent.tsx - 1500 lines

// ✅ CORRECT: Split into smaller components
// MyComponent.tsx
// MyComponentHeader.tsx
// MyComponentBody.tsx
// MyComponentFooter.tsx
```

#### ❌ 2. Unnecessary Re-renders

```typescript
// ❌ WRONG: New object/function on every render
function Parent() {
  return <Child config={{ theme: 'dark' }} onClick={() => {}} />;
  // Child re-renders even if nothing changed!
}

// ✅ CORRECT: Memoize props
function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  const handleClick = useCallback(() => {}, []);

  return <Child config={config} onClick={handleClick} />;
}

// Or use React.memo
const Child = React.memo(({ config, onClick }) => {
  // ...
});
```

#### ❌ 3. N+1 Query Problems

```typescript
// ❌ WRONG: N+1 queries
const lessons = await fetchLessons();  // 1 query

for (const lesson of lessons) {
  const progress = await fetchProgress(lesson.id);  // N queries!
}

// ✅ CORRECT: Single query with join
const lessonsWithProgress = await supabase
  .from('lessons')
  .select(`
    *,
    user_progress(*)
  `)
  .eq('user_progress.child_id', childId);
```

#### ❌ 4. Blocking Operations in Render

```typescript
// ❌ WRONG: Heavy computation in render
function Component({ data }) {
  const processed = expensiveOperation(data);  // Blocks every render!
  return <div>{processed}</div>;
}

// ✅ CORRECT: Memoize expensive operations
function Component({ data }) {
  const processed = useMemo(() => expensiveOperation(data), [data]);
  return <div>{processed}</div>;
}
```

---

## Edge Cases to Handle

### 1. No Internet Connection

```typescript
// ✅ CORRECT: Handle offline state
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <OfflineBanner />;
  }

  return <AppContent />;
}
```

---

### 2. Session Expired

```typescript
// ✅ CORRECT: Handle expired sessions
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      // Save intended destination
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);

      // Redirect to login
      navigate('/login');

      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
      });
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);
```

---

### 3. No Children Added

```typescript
// ✅ CORRECT: Redirect to setup if no children
function ChildRouteWrapper({ children }: { children: React.ReactNode }) {
  const { data: childrenList, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data } = await supabase.from('children').select('id');
      return data;
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (!childrenList || childrenList.length === 0) {
    return <Navigate to="/parent-setup" replace />;
  }

  return <>{children}</>;
}
```

---

### 4. Lesson Not Found

```typescript
// ✅ CORRECT: Handle missing lesson gracefully
function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const { data: lesson, error } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The lesson you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/lessons')}
          className="btn-primary"
        >
          Back to Lessons
        </button>
      </div>
    );
  }

  return <LessonContent lesson={lesson} />;
}
```

---

### 5. Rate Limit Exceeded

```typescript
// ✅ CORRECT: Show retry timer
function QuizSubmit() {
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const handleSubmit = async () => {
    const canProceed = await checkServerRateLimit('submit-quiz', userId);

    if (!canProceed) {
      setRetryAfter(60);  // 60 seconds

      const interval = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: 'Too Many Requests',
        description: `Please wait ${retryAfter} seconds before trying again.`,
      });

      return;
    }

    // Proceed with submission
    await submitQuiz();
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={retryAfter !== null}
    >
      {retryAfter ? `Retry in ${retryAfter}s` : 'Submit Quiz'}
    </button>
  );
}
```

---

### 6. Empty Quiz Questions

```typescript
// ✅ CORRECT: Handle empty quiz gracefully
function QuizSection({ quizId }: { quizId: string }) {
  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);
      return data;
    },
  });

  if (!questions || questions.length === 0) {
    // Skip quiz section entirely
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No quiz available for this lesson.
        </p>
        <button onClick={completeLesson} className="btn-primary mt-4">
          Complete Lesson
        </button>
      </div>
    );
  }

  return <QuizForm questions={questions} />;
}
```

---

## Troubleshooting Quick Fixes

### Issue: Build Fails with TypeScript Errors

**Symptoms**: `npm run build` fails with type errors

**Quick Fix**:
```bash
# 1. Check for type errors
npm run type-check

# 2. Common fixes:
# - Update types from database
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

# - Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# - Check tsconfig.json is not modified
```

**See**: `docs/TROUBLESHOOTING.md` for detailed solutions

---

### Issue: RLS Policy Blocking Query

**Symptoms**: Query returns empty array when data should exist

**Quick Fix**:
```typescript
// 1. Check if user is authenticated
const { data: session } = await supabase.auth.getSession();
console.log('Session:', session);  // Should not be null

// 2. Check RLS policy in database
// Run in Supabase SQL Editor:
SELECT * FROM children WHERE id = '<child-id>';  -- Should return data
SELECT auth.uid();  -- Should return user ID

// 3. Verify child belongs to user
SELECT * FROM children WHERE id = '<child-id>' AND parent_id = auth.uid();
```

**See**: `docs/SECURITY.md` Section "RLS Debugging"

---

### Issue: Infinite Re-render Loop

**Symptoms**: Browser freezes, "Maximum update depth exceeded" error

**Quick Fix**:
```typescript
// ❌ PROBLEM: Object/function created in render
function Component() {
  return <Child config={{ theme: 'dark' }} />;  // New object every render!
}

// ✅ SOLUTION: Memoize props
function Component() {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <Child config={config} />;
}

// Or move outside component if truly static
const CONFIG = { theme: 'dark' };
function Component() {
  return <Child config={CONFIG} />;
}
```

---

### Issue: Edge Function Timeout

**Symptoms**: Edge function takes >60s and times out

**Quick Fix**:
```typescript
// 1. Add timeout to fetch calls
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 50000);  // 50s limit

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle timeout
  }
}

// 2. Break into smaller operations
// 3. Use background jobs for long-running tasks
```

**See**: `docs/API_INTEGRATION.md` Section "Edge Functions"

---

### Issue: Supabase Client Not Initialized

**Symptoms**: "Cannot read property 'from' of undefined"

**Quick Fix**:
```typescript
// Check environment variables are set
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Both should be defined. If not:
// 1. Check .env.local exists
// 2. Restart dev server after adding env vars
// 3. Verify no typos in variable names (must start with VITE_)
```

---

### Issue: Child Selection Not Persisting

**Symptoms**: Selected child resets on page refresh

**Quick Fix**:
```typescript
// 1. Check localStorage is working
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));  // Should log 'value'

// 2. Check browser storage isn't full or blocked

// 3. Verify useValidatedChild is being called
const { childId } = useValidatedChild();
console.log('Validated childId:', childId);
```

---

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Row level security violation` | RLS policy blocking query | Check user ownership, see RLS debugging above |
| `Foreign key constraint violation` | Referenced record doesn't exist | Verify parent record exists before insert |
| `Unique constraint violation` | Duplicate record | Check for existing record before insert |
| `Module not found` | Import path wrong | Check file exists, verify path alias (@/) |
| `Cannot find name` | Type not imported | Import type from `@/types` or generated types |
| `Property does not exist` | TypeScript type mismatch | Regenerate types from database schema |

---

## Documentation References

**Detailed documentation organized by topic:**

| Topic | File | Description |
|-------|------|-------------|
| 🏗️ Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, component structure, data flow |
| 🗄️ Database | [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Tables, relationships, RLS policies |
| 🔒 Security | [`docs/SECURITY.md`](docs/SECURITY.md) | Security practices, RLS, encryption |
| 🧩 Components | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) | Component library, usage examples |
| 🔌 API | [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md) | Supabase client, edge functions |
| 🧪 Testing | [`docs/TESTING.md`](docs/TESTING.md) | Test strategies, examples |
| 🚀 Deployment | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Build process, deployment steps |
| 🔧 Troubleshooting | [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common issues, solutions |
| 📝 Changelog | [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Version history, breaking changes |
| 🗺️ Roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) | Planned features, timeline |

**Quick Navigation**:
- New to the project? Start with [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Setting up database? See [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)
- Security questions? Check [`docs/SECURITY.md`](docs/SECURITY.md)
- Deployment issues? Consult [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## Quick Reference

### Route Groups

| Route Pattern | Access Level | Description |
|---------------|-------------|-------------|
| `/` | Public | Landing page, marketing |
| `/login`, `/signup`, `/reset-password` | Public | Authentication flows |
| `/parent`, `/parent-setup` | Parent Only | Parent dashboard, child management |
| `/dashboard`, `/lessons/*`, `/badges` | Child Selected | Student learning interface |
| `/admin/*`, `/beta-analytics` | Admin Only | Administrative tools |

---

### Key Hooks

| Hook | Purpose | Returns | Example |
|------|---------|---------|---------|
| `useAuth()` | Authentication state | `{ user, session, isAdmin, signIn, signOut }` | Auth checks |
| `useValidatedChild()` | Secure child selection | `{ childId, isValidating, selectChild, clearChild }` | Child operations |
| `usePlatformLessonQuota()` | Daily lesson limits | `{ remaining, limit, canStartLesson }` | Quota checks |
| `useToast()` | Toast notifications | `{ toast }` | User feedback |
| `useQuery()` | Data fetching | `{ data, isLoading, error, refetch }` | Server state |
| `useMutation()` | Data mutations | `{ mutate, isLoading, error }` | Create/update/delete |

---

### Key Components

| Component | Purpose | Props | Usage |
|-----------|---------|-------|-------|
| `<AppLayout>` | Child dashboard wrapper | `children` | Wrap child pages |
| `<ParentLayout>` | Parent dashboard wrapper | `children` | Wrap parent pages |
| `<RequireAuth>` | Protected route wrapper | `children, redirectTo` | Auth-only routes |
| `<RequireChild>` | Child-required wrapper | `children` | Child-selected routes |
| `<ErrorBoundary>` | Error catching wrapper | `children, fallback` | Error handling |
| `<LoadingSpinner>` | Loading indicator | `size?` | Loading states |
| `<EmptyState>` | Empty content state | `title, description, action?` | No data display |

---

### Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Optional
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
VITE_API_BASE_URL=https://api.example.com
```

---

### Common Commands Cheatsheet

```bash
# Development
npm run dev                  # Start dev server
npm run dev -- --port 3000   # Custom port

# Building
npm run build                # Production build
npm run preview              # Preview build

# Testing
npm run test                 # Unit tests
npm run test:watch           # Watch mode
npm run test:e2e             # E2E tests

# Code Quality
npm run lint                 # Check linting
npm run lint:fix             # Auto-fix
npm run type-check           # TypeScript check

# Database
npx supabase gen types typescript --local  # Generate types
npx supabase db reset                      # Reset DB
npx supabase migration new name            # New migration
```

---

## Maintenance & Updates

### Document Maintenance Schedule

| Frequency | Action | Responsible |
|-----------|--------|-------------|
| **Weekly** | Review and update TODO sections | Dev Team |
| **Monthly** | Update tech stack versions, dependency audit | Tech Lead |
| **Quarterly** | Comprehensive documentation review | All Team |
| **After Major Release** | Update version, changelog, breaking changes | Release Manager |

### When to Update This Document

**Update Required When**:
- ✅ New architectural pattern introduced
- ✅ Security requirement changes
- ✅ New major dependency added/updated
- ✅ Breaking changes to APIs or hooks
- ✅ New common task identified
- ✅ Database schema changes significantly

**Update Process**:
1. Create feature branch: `docs/update-claude-md-[description]`
2. Make changes to `CLAUDE.md`
3. Update version number and "Last Reviewed" date
4. Add entry to `docs/CHANGELOG.md`
5. Submit PR with `[docs]` prefix
6. Require 1 reviewer approval
7. Merge to main branch

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-02-05 | Major overhaul based on 2026 best practices: added TOC, visual workflows, troubleshooting section, prerequisites, enhanced examples |
| 1.2.0 | 2025-12-30 | Added security requirements, updated patterns |
| 1.1.0 | 2025-12-15 | Added testing guidelines, performance section |
| 1.0.0 | 2025-12-01 | Initial version |

### Changelog

See [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for detailed version history and breaking changes.

---

## Feedback & Contributions

### Documentation Issues

Found an error or outdated information?
1. Create issue: `[docs] Description of issue`
2. Submit PR with fix
3. Tag `@docs-team` for review

### Security Issues

**CRITICAL**: Security issues require immediate attention.
- Report via private security advisory (GitHub)
- Email: security@innerodyssey.com
- Do NOT create public issues for security vulnerabilities

### Feature Requests

Want to add new features or patterns?
1. Check [`docs/ROADMAP.md`](docs/ROADMAP.md) for planned features
2. Create issue: `[feature] Feature description`
3. Discuss with team before implementation
4. Update documentation after implementation

---

## Additional Resources

### External Documentation

- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Playwright Docs](https://playwright.dev/docs/intro)

### Internal Resources

- Project Wiki: [link-to-wiki]
- Team Slack: #odyssey-dev
- Design System: [link-to-figma]
- API Docs: `docs/API_INTEGRATION.md`

---

**Document Status**: 🟢 Current and actively maintained
**Last Reviewed**: 2026-02-05
**Version**: 2.0.0
**Next Review**: 2026-03-05

---

*This is a living document. Keep it updated as the project evolves.*
