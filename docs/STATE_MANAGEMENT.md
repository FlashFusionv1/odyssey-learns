# State Management Guide

## Overview
Inner Odyssey uses a combination of React Query (TanStack Query), custom hooks, and React Context for state management. This guide documents patterns, best practices, and the state architecture.

**Primary State Library:** TanStack Query v5.83.0  
**Local State:** React useState/useReducer  
**Global State:** React Context API  
**Persistent State:** localStorage  
**Real-time State:** Supabase Realtime subscriptions

---

## State Management Architecture

### State Categories

**1. Server State (React Query)**
- Database records (lessons, children, progress)
- Edge function responses
- Real-time updates

**2. Local Component State (useState/useReducer)**
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary calculations

**3. Global Client State (Context)**
- Current user session
- Selected child
- Theme preferences

**4. Persistent State (localStorage)**
- Selected child ID
- User preferences
- Draft form data

**5. Real-time State (Supabase)**
- Live messages
- Collaboration requests
- Activity participants

---

## React Query (TanStack Query)

### Setup
**Location:** `src/main.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

### Query Hooks Pattern

**Standard Query Hook:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLessons = (gradeLevel: number) => {
  return useQuery({
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
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (lessons rarely change)
  });
};

// Usage
const { data: lessons, isLoading, error, refetch } = useLessons(gradeLevel);
```

---

### Mutation Hooks Pattern

**Standard Mutation Hook:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childData: ChildInsert) => {
      const { data, error } = await supabase
        .from('children')
        .insert(childData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newChild) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['children'] });

      // Snapshot previous value (for rollback)
      const previousChildren = queryClient.getQueryData(['children']);

      // Optimistically update
      queryClient.setQueryData(['children'], (old: any[]) => {
        return [...(old || []), { ...newChild, id: 'temp-id' }];
      });

      return { previousChildren };
    },
    onError: (err, newChild, context) => {
      // Rollback on error
      queryClient.setQueryData(['children'], context?.previousChildren);
      toast.error('Failed to add child');
    },
    onSuccess: (data) => {
      toast.success('Child added successfully!');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['children'] });
    }
  });
};

// Usage
const { mutate: createChild, isPending } = useCreateChild();

const handleSubmit = (data: ChildInsert) => {
  createChild(data);
};
```

---

### Query Key Conventions

**Hierarchical Keys:**
```typescript
// Top-level resource
['lessons']

// Filtered resource
['lessons', { gradeLevel: 2 }]
['lessons', { subject: 'math' }]

// Single item
['lessons', lessonId]

// Nested resource
['children', childId, 'progress']
['children', childId, 'badges']

// Parameterized queries
['user_progress', { childId, status: 'completed' }]
```

**Benefits:**
- Precise cache invalidation
- Automatic refetching
- Predictable cache behavior

---

### Invalidation Patterns

**Invalidate Specific Query:**
```typescript
queryClient.invalidateQueries({ queryKey: ['children'] });
```

**Invalidate Related Queries:**
```typescript
// After updating a child, invalidate all child-related queries
queryClient.invalidateQueries({ queryKey: ['children'] });
queryClient.invalidateQueries({ queryKey: ['user_progress', childId] });
queryClient.invalidateQueries({ queryKey: ['badges', childId] });
```

**Invalidate with Predicate:**
```typescript
// Invalidate all queries for a specific child
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey.includes(childId)
});
```

---

### Prefetching Data

**Prefetch on Hover:**
```typescript
const prefetchLesson = (lessonId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['lessons', lessonId],
    queryFn: () => fetchLesson(lessonId),
    staleTime: 5 * 60 * 1000,
  });
};

// Usage
<LessonCard
  lesson={lesson}
  onMouseEnter={() => prefetchLesson(lesson.id)}
/>
```

**Prefetch on Route Change:**
```typescript
useEffect(() => {
  // Prefetch data for next likely route
  if (currentPage === 'dashboard') {
    queryClient.prefetchQuery({
      queryKey: ['lessons', gradeLevel],
      queryFn: () => fetchLessons(gradeLevel)
    });
  }
}, [currentPage, gradeLevel]);
```

---

### Dependent Queries

```typescript
// Query 2 depends on Query 1
const { data: child } = useQuery({
  queryKey: ['children', childId],
  queryFn: () => fetchChild(childId),
});

const { data: progress, isLoading } = useQuery({
  queryKey: ['progress', childId],
  queryFn: () => fetchProgress(childId),
  enabled: !!child, // Only run if child exists
});
```

---

### Infinite Queries (Pagination)

```typescript
export const useInfiniteLessons = (gradeLevel: number) => {
  return useInfiniteQuery({
    queryKey: ['lessons', 'infinite', gradeLevel],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('grade_level', gradeLevel)
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (error) throw error;
      return { data, nextPage: pageParam + 1 };
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length === 20 ? lastPage.nextPage : undefined;
    },
    initialPageParam: 0,
  });
};

// Usage
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteLessons(2);

<Button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
  {isFetchingNextPage ? 'Loading...' : 'Load More'}
</Button>
```

---

## Custom Hooks

### useAuth Hook
**Location:** `src/hooks/useAuth.tsx`

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, session, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return <div>Welcome, {user.email}</div>;
};
```

**Implementation:**
```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, isLoading };
};
```

---

### useValidatedChild Hook
**Location:** `src/hooks/useValidatedChild.tsx`

**Purpose:** Securely validate child ownership server-side

```typescript
import { useValidatedChild } from '@/hooks/useValidatedChild';

const MyComponent = () => {
  const { childId, isValidating, isValid } = useValidatedChild();

  if (isValidating) return <LoadingSpinner />;
  if (!isValid) return <Navigate to="/select-child" />;

  return <ChildDashboard childId={childId} />;
};
```

**Implementation:**
```typescript
export const useValidatedChild = () => {
  const [childId, setChildId] = useState<string | null>(
    localStorage.getItem('selectedChildId')
  );

  const { data: child, isLoading } = useQuery({
    queryKey: ['validateChild', childId],
    queryFn: async () => {
      if (!childId) return null;

      const { data, error } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .maybeSingle();

      if (error || !data) {
        localStorage.removeItem('selectedChildId');
        setChildId(null);
        return null;
      }

      return data;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    childId: child?.id || null,
    isValidating: isLoading,
    isValid: !!child,
  };
};
```

---

### usePlatformLessonQuota Hook
**Location:** `src/hooks/usePlatformLessonQuota.tsx`

**Purpose:** Manage daily lesson quota enforcement

```typescript
import { usePlatformLessonQuota } from '@/hooks/usePlatformLessonQuota';

const LessonButton = ({ lessonId }) => {
  const { canAccess, remaining, refetch } = usePlatformLessonQuota(childId);

  if (!canAccess) {
    return <div>Daily lesson limit reached</div>;
  }

  return <Button onClick={() => startLesson(lessonId)}>Start Lesson ({remaining} remaining)</Button>;
};
```

**Implementation:**
```typescript
export const usePlatformLessonQuota = (childId: string) => {
  const { data: quotaStatus, refetch } = useQuery({
    queryKey: ['lessonQuota', childId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_platform_lesson_quota', {
        p_child_id: childId
      });

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    canAccess: quotaStatus?.allowed || false,
    remaining: quotaStatus?.remaining || 0,
    baseLimit: quotaStatus?.baseLimit || 5,
    bonusGranted: quotaStatus?.bonusGranted || 0,
    refetch,
  };
};
```

---

### useLessonAnalytics Hook
**Location:** `src/hooks/useLessonAnalytics.ts`

**Purpose:** Track lesson engagement events

```typescript
export const trackLessonView = async (lessonId: string, childId: string) => {
  await supabase.functions.invoke('track-lesson-analytics', {
    body: {
      lessonId,
      childId,
      eventType: 'view'
    }
  });
};

export const trackLessonSave = async (lessonId: string, childId: string) => {
  await supabase.functions.invoke('track-lesson-analytics', {
    body: {
      lessonId,
      childId,
      eventType: 'save'
    }
  });
};

export const trackLessonShare = async (lessonId: string, childId: string) => {
  await supabase.functions.invoke('track-lesson-analytics', {
    body: {
      lessonId,
      childId,
      eventType: 'share'
    }
  });
};
```

---

### useRecaptcha Hook
**Location:** `src/hooks/useRecaptcha.tsx`

**Purpose:** reCAPTCHA v3 integration

```typescript
import { useRecaptcha } from '@/hooks/useRecaptcha';

const LoginForm = () => {
  const { executeRecaptcha } = useRecaptcha();

  const handleSubmit = async (data) => {
    const token = await executeRecaptcha('login');

    // Verify server-side
    const { data: result } = await supabase.functions.invoke('verify-recaptcha', {
      body: { token }
    });

    if (result.score < 0.5) {
      toast.error('Security check failed');
      return;
    }

    // Proceed with login
  };
};
```

---

## React Context API

### Theme Context (Example Pattern)

**Provider:**
```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

**Usage:**
```typescript
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </Button>
  );
};
```

---

## Persistent State (localStorage)

### Safe localStorage Pattern

```typescript
// src/lib/localStorage.ts
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};
```

**Usage:**
```typescript
import { storage } from '@/lib/localStorage';

// Get
const selectedChildId = storage.get<string>('selectedChildId', null);

// Set
storage.set('selectedChildId', childId);

// Remove
storage.remove('selectedChildId');
```

---

### Synced State Hook

```typescript
export const useSyncedState = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    return storage.get(key, defaultValue);
  });

  useEffect(() => {
    storage.set(key, state);
  }, [key, state]);

  return [state, setState] as const;
};

// Usage
const [selectedChild, setSelectedChild] = useSyncedState('selectedChildId', null);
```

---

## Real-Time State Sync

### Real-time Messages Hook

```typescript
export const useRealtimeMessages = (childId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'parent_child_messages',
          filter: `child_id=eq.${childId}`
        },
        (payload) => {
          // Update React Query cache
          queryClient.setQueryData(
            ['messages', childId],
            (old: Message[] | undefined) => {
              return [...(old || []), payload.new as Message];
            }
          );

          // Show notification
          toast.info('New message received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId, queryClient]);
};
```

---

### Real-time Collaboration Hook

```typescript
export const useRealtimeCollaboration = (activityId: string) => {
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`activity:${activityId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setParticipants(users);
      })
      .on('broadcast', { event: 'update' }, (payload) => {
        console.log('Activity updated:', payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activityId, userId]);

  return { participants };
};
```

---

## State Management Best Practices

### ✅ DO

1. **Use React Query for server state**
   - All database queries
   - Edge function calls
   - Real-time subscriptions

2. **Use local state for UI**
   - Form inputs
   - Modal visibility
   - Dropdown open/closed

3. **Use Context sparingly**
   - Authentication state
   - Theme preferences
   - Global UI settings

4. **Optimize query keys**
   - Hierarchical structure
   - Predictable patterns
   - Precise invalidation

5. **Handle loading/error states**
   - Show spinners during loading
   - Display error messages
   - Provide retry options

6. **Implement optimistic updates**
   - Instant UI feedback
   - Rollback on error
   - Refetch on settle

7. **Use proper staleTime**
   - Static data: Infinity
   - Slow-changing: 10 minutes
   - Real-time: 0

8. **Clean up subscriptions**
   - Use useEffect cleanup
   - Remove channels on unmount

---

### ❌ DON'T

1. Store server state in Context (use React Query)
2. Use localStorage for sensitive data (use secure sessions)
3. Fetch same data multiple times (use query cache)
4. Ignore error handling
5. Make too many real-time subscriptions
6. Forget to invalidate queries after mutations
7. Use global state for local UI state
8. Store large objects in localStorage
9. Bypass React Query cache
10. Forget cleanup in useEffect

---

## Performance Optimization

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

const MyComponent = ({ childId, lessons }) => {
  // Memoize expensive calculations
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => lesson.grade_level === gradeLevel);
  }, [lessons, gradeLevel]);

  // Memoize callbacks
  const handleLessonClick = useCallback((lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  }, [navigate]);

  return (
    <LessonList
      lessons={filteredLessons}
      onLessonClick={handleLessonClick}
    />
  );
};
```

---

### Component Memoization

```typescript
import { memo } from 'react';

const LessonCard = memo(({ lesson, onClick }) => {
  return (
    <Card onClick={() => onClick(lesson.id)}>
      <CardTitle>{lesson.title}</CardTitle>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Only re-render if lesson ID changed
  return prevProps.lesson.id === nextProps.lesson.id;
});
```

---

### Debounced State

```typescript
import { useState, useEffect } from 'react';

export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch.length > 2) {
    searchLessons(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## Testing State Management

### Testing React Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('useLessons hook', async () => {
  const { result } = renderHook(() => useLessons(2), {
    wrapper: createWrapper(),
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toHaveLength(10);
});
```

---

### Testing Custom Hooks

```typescript
test('useValidatedChild hook', async () => {
  const { result } = renderHook(() => useValidatedChild(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isValidating).toBe(false));

  expect(result.current.childId).toBe('test-child-id');
  expect(result.current.isValid).toBe(true);
});
```

---

## State Management Checklist

When adding new state:
- [ ] Determine state category (server/local/global/persistent)
- [ ] Choose appropriate state management tool
- [ ] Implement loading/error states
- [ ] Add TypeScript types
- [ ] Handle edge cases (empty, null, undefined)
- [ ] Implement proper cleanup (useEffect return)
- [ ] Add proper query keys (React Query)
- [ ] Optimize with memoization if needed
- [ ] Test state updates
- [ ] Document in this file
