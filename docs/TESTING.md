# Testing Strategy Guide

## Overview
This document outlines the testing strategy for Inner Odyssey, covering unit tests, integration tests, end-to-end tests, security testing, and performance testing.

**Testing Philosophy:** Shift-left testing with emphasis on security, accessibility, and user experience.

**Testing Stack:**
- Unit Tests: Vitest + React Testing Library
- E2E Tests: Playwright (future)
- API Tests: Vitest + Supertest
- Security Tests: Manual + OWASP ZAP (future)
- Performance Tests: Lighthouse + Web Vitals

---

## Testing Pyramid

```
         /\
        /  \
       / E2E \       10% - Full user journeys
      /______\
     /        \
    /Integration\ 30% - Component + API integration
   /____________\
  /              \
 /   Unit Tests   \  60% - Functions, hooks, components
/__________________\
```

**Distribution:**
- **60% Unit Tests** - Fast, isolated, focused
- **30% Integration Tests** - Component + API interactions
- **10% E2E Tests** - Critical user flows

---

## Unit Testing

### Setup
**Test Runner:** Vitest  
**Testing Library:** @testing-library/react  
**Assertions:** Vitest expect  
**Mocking:** Vitest vi

**Configuration:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
    },
  },
});
```

---

### Testing Utilities

**Test Setup File:** `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
};

export const TestWrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);
```

---

### Component Testing

**Pattern:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TestWrapper } from '@/test/setup';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />, { wrapper: TestWrapper });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles button click', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />, { wrapper: TestWrapper });
    
    fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message', async () => {
    render(<MyComponent />, { wrapper: TestWrapper });
    
    // Simulate error
    const errorMessage = 'Something went wrong';
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Error' }));
    
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
```

---

### Testing Async Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { LessonList } from './LessonList';

vi.mock('@/integrations/supabase/client');

describe('LessonList', () => {
  it('loads and displays lessons', async () => {
    const mockLessons = [
      { id: '1', title: 'Math Lesson', subject: 'math' },
      { id: '2', title: 'Science Lesson', subject: 'science' },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: mockLessons, error: null }),
    });

    render(<LessonList gradeLevel={2} />, { wrapper: TestWrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Math Lesson')).toBeInTheDocument();
      expect(screen.getByText('Science Lesson')).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Network error' } 
      }),
    });

    render(<LessonList gradeLevel={2} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/failed to load lessons/i)).toBeInTheDocument();
    });
  });
});
```

---

### Testing Hooks

**Testing Custom Hooks:**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/test/setup';
import { useLessons } from '@/hooks/useLessons';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('useLessons', () => {
  it('fetches lessons successfully', async () => {
    const mockLessons = [
      { id: '1', title: 'Lesson 1' },
      { id: '2', title: 'Lesson 2' },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: mockLessons, error: null }),
    });

    const { result } = renderHook(() => useLessons(2), {
      wrapper: TestWrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockLessons);
    });
  });

  it('handles errors', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Error' } 
      }),
    });

    const { result } = renderHook(() => useLessons(2), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

---

### Testing Forms

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('validates email format', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    await userEvent.type(emailInput, 'invalid-email');
    
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates password length', async () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText('Password');
    await userEvent.type(passwordInput, 'short');
    
    fireEvent.blur(passwordInput);
    
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('disables submit button while loading', async () => {
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### API Integration Tests

**Testing Supabase Queries:**

```typescript
import { supabase } from '@/integrations/supabase/client';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Lesson API Integration', () => {
  beforeEach(() => {
    // Setup test data
  });

  it('fetches lessons by grade level', async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade_level', 2)
      .eq('is_active', true);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0]).toHaveProperty('id');
    expect(data?.[0]).toHaveProperty('title');
  });

  it('respects RLS policies', async () => {
    // Attempt to fetch lessons without authentication
    const { data, error } = await supabase
      .from('children')
      .select('*');

    expect(error).toBeDefined();
    expect(error?.code).toBe('PGRST116'); // RLS policy violation
  });

  it('creates child record', async () => {
    const newChild = {
      name: 'Test Child',
      grade_level: 2,
      parent_id: 'test-parent-id',
    };

    const { data, error } = await supabase
      .from('children')
      .insert(newChild)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.name).toBe('Test Child');
    expect(data?.grade_level).toBe(2);
  });
});
```

---

### Component + API Integration

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/test/setup';
import { ChildDashboard } from './ChildDashboard';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('ChildDashboard Integration', () => {
  it('loads child data and displays dashboard', async () => {
    const mockChild = {
      id: 'child-1',
      name: 'Alex',
      grade_level: 2,
      total_points: 1250,
    };

    const mockLessons = [
      { id: '1', title: 'Math Lesson' },
      { id: '2', title: 'Science Lesson' },
    ];

    (supabase.from as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockChild, error: null }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockLessons, error: null }),
      });

    render(<ChildDashboard childId="child-1" />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Alex!')).toBeInTheDocument();
      expect(screen.getByText('1,250 points')).toBeInTheDocument();
      expect(screen.getByText('Math Lesson')).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Testing

### Setup (Future Implementation)

**Tool:** Playwright  
**Configuration:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### E2E Test Example

**Test File:** `e2e/parent-onboarding.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Parent Onboarding Flow', () => {
  test('complete parent signup and child setup', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/');
    await page.click('text=Start Free Trial');

    // Fill signup form
    await page.fill('[name="fullName"]', 'Test Parent');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.fill('[name="confirmPassword"]', 'TestPass123!');
    await page.check('[name="coppaConsent"]');

    // Submit signup
    await page.click('button:has-text("Sign Up")');

    // Wait for redirect to parent setup
    await expect(page).toHaveURL('/parent-setup');
    await expect(page.locator('h1')).toContainText('Add Your First Child');

    // Fill child form
    await page.fill('[name="name"]', 'Test Child');
    await page.selectOption('[name="gradeLevel"]', '2');

    // Submit child form
    await page.click('button:has-text("Add Child")');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/parent-dashboard');
    await expect(page.locator('h1')).toContainText('Parent Dashboard');
    await expect(page.locator('text=Test Child')).toBeVisible();
  });

  test('validates email already exists', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button:has-text("Sign Up")');

    await expect(page.locator('text=Email already registered')).toBeVisible();
  });
});
```

---

### Critical User Journey Tests

**Test Coverage:**
1. **Parent Registration** - Full signup flow
2. **Child Creation** - Add first child
3. **Lesson Completion** - Start and finish lesson
4. **Custom Lesson Generation** - Generate custom lesson
5. **Collaboration Request** - Send and approve collaboration
6. **Reward Redemption** - Request and approve reward
7. **Admin Content Review** - Review and approve lesson

---

## Security Testing

### RLS Policy Testing

**Test File:** `tests/security/rls-policies.test.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

describe('RLS Policy Security', () => {
  it('prevents parent from accessing other parents children', async () => {
    // Login as Parent A
    await supabase.auth.signInWithPassword({
      email: 'parentA@example.com',
      password: 'password',
    });

    // Attempt to fetch Parent B's child
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', 'parentB-child-id')
      .single();

    expect(data).toBeNull();
    expect(error).toBeDefined();
  });

  it('allows parent to access own children', async () => {
    await supabase.auth.signInWithPassword({
      email: 'parentA@example.com',
      password: 'password',
    });

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', 'parentA-id');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBeGreaterThan(0);
  });
});
```

---

### Input Sanitization Testing

```typescript
import { sanitizeHTML, sanitizeMarkdown } from '@/lib/inputSanitization';

describe('Input Sanitization', () => {
  it('removes script tags', () => {
    const input = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('javascript:');
  });

  it('allows safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const sanitized = sanitizeHTML(input);
    expect(sanitized).toContain('<p>');
    expect(sanitized).toContain('<strong>');
  });

  it('sanitizes markdown with embedded HTML', () => {
    const input = '# Title\n<script>alert(1)</script>\n**Bold**';
    const sanitized = sanitizeMarkdown(input);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Title');
    expect(sanitized).toContain('Bold');
  });
});
```

---

### Authentication Testing

```typescript
describe('Authentication Security', () => {
  it('prevents access to protected routes without login', async () => {
    const response = await fetch('http://localhost:5173/parent-dashboard');
    expect(response.url).toContain('/login');
  });

  it('rate limits login attempts', async () => {
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      attempts.push(
        supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      );
    }

    const results = await Promise.all(attempts);
    const lastResult = results[5];
    
    expect(lastResult.error?.message).toContain('rate limit');
  });
});
```

---

## Performance Testing

### Lighthouse Testing

**Script:** `scripts/lighthouse.js`

```javascript
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const runLighthouse = async (url) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  const { lhr } = runnerResult;

  console.log('Performance Score:', lhr.categories.performance.score * 100);
  console.log('Accessibility Score:', lhr.categories.accessibility.score * 100);
  console.log('Best Practices Score:', lhr.categories['best-practices'].score * 100);
  console.log('SEO Score:', lhr.categories.seo.score * 100);

  await chrome.kill();

  // Assert scores meet thresholds
  const performanceScore = lhr.categories.performance.score * 100;
  if (performanceScore < 90) {
    throw new Error(`Performance score ${performanceScore} below threshold 90`);
  }
};

runLighthouse('http://localhost:5173');
```

---

### Core Web Vitals Testing

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

describe('Core Web Vitals', () => {
  it('meets LCP threshold (< 2.5s)', (done) => {
    getLCP((metric) => {
      expect(metric.value).toBeLessThan(2500);
      done();
    });
  });

  it('meets FID threshold (< 100ms)', (done) => {
    getFID((metric) => {
      expect(metric.value).toBeLessThan(100);
      done();
    });
  });

  it('meets CLS threshold (< 0.1)', (done) => {
    getCLS((metric) => {
      expect(metric.value).toBeLessThan(0.1);
      done();
    });
  });
});
```

---

## Accessibility Testing

### Automated Accessibility Tests

**Tool:** axe-core + @testing-library/jest-dom

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from './LoginForm';

expect.extend(toHaveNoViolations);

describe('LoginForm Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

### Manual Accessibility Checklist

- [ ] All interactive elements keyboard accessible (Tab navigation)
- [ ] Focus indicators visible (3px outline)
- [ ] ARIA labels on icon-only buttons
- [ ] Form labels associated with inputs
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Images have descriptive alt text
- [ ] Screen reader tested (NVDA, JAWS, VoiceOver)
- [ ] No keyboard traps
- [ ] Semantic HTML used (`<button>`, `<nav>`, `<main>`)
- [ ] Skip to main content link available

---

## Test Coverage Goals

**Minimum Coverage:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

**Critical Path Coverage:**
- Authentication: 95%
- Authorization (RLS): 95%
- Data mutations: 90%
- Input sanitization: 100%

**Run Coverage:**
```bash
npm run test:coverage
```

---

## Continuous Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run coverage
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Run Lighthouse
        run: npm run lighthouse
      
      - name: Security audit
        run: npm audit --audit-level=moderate
```

---

## Testing Best Practices

### ✅ DO

1. Write tests before fixing bugs (TDD)
2. Test user behavior, not implementation
3. Use descriptive test names
4. Test error states and edge cases
5. Mock external dependencies (Supabase, APIs)
6. Test accessibility in all components
7. Maintain >80% code coverage
8. Run tests before committing
9. Write integration tests for critical flows
10. Test on multiple browsers/devices

---

### ❌ DON'T

1. Test implementation details (internal state)
2. Write tests that depend on each other
3. Mock everything (test real integrations)
4. Ignore slow tests (optimize or remove)
5. Skip error handling tests
6. Test only happy paths
7. Commit code with failing tests
8. Test third-party libraries
9. Write brittle tests (overly specific selectors)
10. Ignore flaky tests (fix or remove)

---

## Test Maintenance

### Regular Reviews
- **Weekly:** Review flaky tests, fix or remove
- **Monthly:** Update test coverage goals
- **Quarterly:** Audit test suite performance

### Test Metrics
- Test execution time (target <5 min)
- Flaky test rate (target <2%)
- Coverage percentage (track trends)
- Tests per component (balance)

---

## Testing Resources

**Documentation:**
- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)

**Internal Guides:**
- Security Testing: `docs/SECURITY.md`
- Accessibility Testing: WCAG 2.1 guidelines
- Performance Testing: Core Web Vitals documentation

---

## Future Testing Enhancements

1. **Visual Regression Testing** - Percy or Chromatic
2. **Load Testing** - k6 or Artillery
3. **Contract Testing** - Pact for API contracts
4. **Mutation Testing** - Stryker for test quality
5. **Fuzz Testing** - Random input generation for edge cases
