# 🔧 Recommended Tools, Libraries, and Frameworks

**Project**: Odyssey Learns  
**Date**: January 14, 2026  
**Purpose**: Comprehensive technology recommendations for 3-month launch

---

## Executive Summary

This document provides specific, actionable recommendations for tools, libraries, and frameworks to improve Odyssey Learns' development workflow, code quality, security, performance, and user experience during the 3-month launch preparation.

**Investment Required**: ~$200-500/month for paid tools (during development)  
**ROI**: Significant reduction in bugs, faster development, better UX  
**Priority**: Implement P0 tools Week 1-2, P1 tools by Week 6

---

## 🧪 Testing & Quality Assurance

### Priority: P0 (CRITICAL) 🔴

#### 1. Vitest - Unit Testing Framework
**Purpose**: Fast, modern testing framework for Vite projects  
**Cost**: FREE (Open source)  
**Installation**:
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

**Why**: Native Vite integration, fast, great DX  
**Alternatives**: Jest (slower with Vite)

**Configuration**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
```

#### 2. React Testing Library
**Purpose**: Test React components from user perspective  
**Cost**: FREE  
**Installation**:
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Why**: Best practices for React testing, excellent documentation

#### 3. Playwright - E2E Testing
**Purpose**: End-to-end testing across browsers  
**Cost**: FREE  
**Installation**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Why**: Fast, reliable, great debugging, cross-browser support  
**Alternatives**: Cypress (slower, less reliable)

**Example Test**:
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('parent can sign up and add child', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=Sign Up');
  await page.fill('[name=email]', 'parent@example.com');
  await page.fill('[name=password]', 'SecurePass123!');
  await page.click('button[type=submit]');
  
  await expect(page).toHaveURL('/parent-dashboard');
  await page.click('text=Add Child');
  // ...
});
```

---

## 🔒 Security Tools

### Priority: P0 (CRITICAL) 🔴

#### 4. npm audit + Snyk
**Purpose**: Dependency vulnerability scanning  
**Cost**: FREE (Snyk free tier)  
**Installation**:
```bash
# npm audit is built-in
npm audit

# Snyk (optional, better reporting)
npm install -g snyk
snyk auth
snyk test
```

**Why**: Catch vulnerabilities early, automated scanning  
**Recommendation**: Run weekly, fix all high+ severity

#### 5. OWASP ZAP - Security Scanner
**Purpose**: Web application security testing  
**Cost**: FREE  
**Installation**: Download from https://www.zaproxy.org/

**Usage**:
```bash
# Automated scan
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:5173

# Manual testing with proxy
# Configure browser to use ZAP proxy
# Navigate app, ZAP records all requests
# Run active scan
```

**Why**: Find XSS, CSRF, injection vulnerabilities

#### 6. Helmet.js - Security Headers (Backend)
**Purpose**: Set secure HTTP headers  
**Cost**: FREE  
**Installation**: For Express.js backend
```bash
npm install helmet
```

**Why**: Prevent common attacks (XSS, clickjacking, etc.)

### Priority: P1 (HIGH) 🟡

#### 7. Sentry - Error Tracking
**Purpose**: Real-time error monitoring and reporting  
**Cost**: FREE tier (5k events/month), then $26/month  
**Installation**:
```bash
npm install @sentry/react
```

**Configuration**:
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

// Wrap your app
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

**Why**: Catch production errors, understand user impact, debug faster  
**Alternatives**: LogRocket ($99/month), DataDog (expensive)

---

## ⚡ Performance Optimization

### Priority: P1 (HIGH) 🟡

#### 8. Lighthouse CI
**Purpose**: Automated performance testing in CI/CD  
**Cost**: FREE  
**Installation**:
```bash
npm install -D @lhci/cli
```

**Configuration**:
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.85 }],
      },
    },
  },
};
```

**Why**: Prevent performance regressions, enforce quality standards

#### 9. vite-bundle-visualizer
**Purpose**: Analyze bundle size and optimize imports  
**Cost**: FREE  
**Installation**:
```bash
npm install -D rollup-plugin-visualizer
```

**Configuration**:
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

**Why**: Identify large dependencies, optimize bundle size

#### 10. sharp - Image Optimization (Backend)
**Purpose**: Optimize images on upload  
**Cost**: FREE  
**Installation**: For Supabase Edge Functions
```typescript
import sharp from 'sharp';

// Optimize uploaded avatar
const optimized = await sharp(imageBuffer)
  .resize(400, 400, { fit: 'cover' })
  .webp({ quality: 80 })
  .toBuffer();
```

**Why**: Faster page loads, better mobile experience

### Priority: P2 (MEDIUM) 🟢

#### 11. react-lazy-load-image-component
**Purpose**: Lazy load images for better performance  
**Cost**: FREE  
**Installation**:
```bash
npm install react-lazy-load-image-component
```

**Usage**:
```typescript
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={lesson.thumbnail}
  alt={lesson.title}
  effect="blur"
  placeholderSrc={lesson.thumbnailPlaceholder}
/>
```

**Why**: Reduce initial page load, improve perceived performance

---

## 📊 Monitoring & Analytics

### Priority: P1 (HIGH) 🟡

#### 12. Plausible Analytics - Privacy-Friendly Analytics
**Purpose**: Track usage without privacy concerns  
**Cost**: $9/month (10k page views)  
**Installation**:
```html
<!-- Add to index.html -->
<script defer data-domain="odysseylearns.com" src="https://plausible.io/js/script.js"></script>
```

**Why**: COPPA/GDPR compliant, no cookies, simple dashboard  
**Alternatives**: Google Analytics (privacy concerns), PostHog (self-hosted)

#### 13. Sentry Performance Monitoring
**Purpose**: Track application performance in production  
**Cost**: Included in Sentry plan  
**Configuration**: Already included in Sentry setup

**Metrics Tracked**:
- Page load times
- API response times
- User interactions
- Core Web Vitals

**Why**: Understand real-world performance, identify bottlenecks

#### 14. UptimeRobot - Uptime Monitoring
**Purpose**: Monitor application availability  
**Cost**: FREE (50 monitors)  
**Setup**: https://uptimerobot.com
```
Monitor 1: https://odysseylearns.com (HTTP)
Monitor 2: https://api.odysseylearns.com/health (API)
Check interval: 5 minutes
Alert: Email + Slack
```

**Why**: Know when your app is down before users complain

### Priority: P2 (MEDIUM) 🟢

#### 15. LogRocket - Session Replay (Optional)
**Purpose**: Record user sessions for debugging  
**Cost**: $99/month (starts)  
**When to use**: If budget allows, invaluable for UX debugging

**Why**: See exactly what users see, reproduce bugs easily  
**Note**: COPPA compliance needed - get parental consent for recording

---

## 🎨 Developer Experience

### Priority: P1 (HIGH) 🟡

#### 16. ESLint + Prettier
**Purpose**: Code formatting and linting  
**Cost**: FREE  
**Already Installed**: ✅ (verify configuration)

**Recommended ESLint Plugins**:
```bash
npm install -D \
  eslint-plugin-jsx-a11y \
  eslint-plugin-testing-library \
  eslint-plugin-jest-dom
```

**Why**: Consistent code style, catch errors early

#### 17. Husky + lint-staged
**Purpose**: Run linters on git commit  
**Cost**: FREE  
**Installation**:
```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configuration**:
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Why**: Prevent bad code from being committed

#### 18. TypeScript Strict Mode
**Purpose**: Enforce stricter type checking  
**Cost**: FREE (configuration)  
**Configuration**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Why**: Catch more bugs at compile time, better code quality  
**Recommendation**: Enable after fixing existing `any` types

### Priority: P2 (MEDIUM) 🟢

#### 19. VS Code Extensions
**Purpose**: Improve developer productivity  
**Cost**: FREE

**Recommended Extensions**:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "vitest.explorer",
    "eamodio.gitlens",
    "github.copilot"
  ]
}
```

**Setup**: Create `.vscode/extensions.json` in repo

---

## 📧 Email & Communication

### Priority: P1 (HIGH) 🟡

#### 20. Resend - Email Service
**Purpose**: Send transactional emails  
**Cost**: FREE (100 emails/day), then $20/month  
**Installation**:
```bash
npm install resend
```

**Supabase Edge Function**:
```typescript
// supabase/functions/send-email/index.ts
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  const { to, subject, html } = await req.json();
  
  const data = await resend.emails.send({
    from: 'Odyssey Learns <notifications@odysseylearns.com>',
    to,
    subject,
    html,
  });
  
  return new Response(JSON.stringify(data));
});
```

**Why**: Reliable email delivery, good developer experience  
**Alternatives**: SendGrid (complex), Postmark (expensive), AWS SES (setup pain)

---

## 🚀 Deployment & Infrastructure

### Priority: P1 (HIGH) 🟡

#### 21. GitHub Actions - CI/CD
**Purpose**: Automated testing and deployment  
**Cost**: FREE (2,000 minutes/month)  
**Configuration**: See Week 4 in roadmap

**Why**: Automate repetitive tasks, prevent bad deploys

#### 22. Vercel or Netlify - Hosting
**Purpose**: Fast, reliable hosting with CDN  
**Cost**: FREE tier, then $20/month

**Vercel**:
- Best for React apps
- Automatic preview deployments
- Edge functions support
- Great performance

**Netlify**:
- Similar features
- Better for static sites
- Good free tier

**Recommendation**: Vercel for this project  
**Current**: Lovable Cloud (verify if sufficient)

### Priority: P2 (MEDIUM) 🟢

#### 23. Cloudflare - CDN & DDoS Protection
**Purpose**: Speed up global delivery, protect from attacks  
**Cost**: FREE tier available  
**Setup**: Point DNS to Cloudflare

**Features**:
- CDN for static assets
- DDoS protection
- SSL/TLS encryption
- Analytics

**Why**: Better performance globally, additional security layer

---

## 🎓 Documentation & Collaboration

### Priority: P2 (MEDIUM) 🟢

#### 24. Storybook - Component Documentation
**Purpose**: Document and test components in isolation  
**Cost**: FREE  
**Installation**:
```bash
npx storybook@latest init
```

**Usage**:
```typescript
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

**Why**: Living component documentation, easier testing, better design system  
**When**: Phase 2 (Week 5-8) if time allows

#### 25. Notion or Linear - Project Management
**Purpose**: Track tasks, bugs, features  
**Cost**: FREE tier available

**Notion**:
- Great for documentation
- Flexible databases
- Free for small teams

**Linear**:
- Built for engineering teams
- Fast, keyboard-driven
- Good GitHub integration

**Recommendation**: Linear for technical tasks, Notion for docs

---

## 🔍 Accessibility

### Priority: P1 (HIGH) 🟡

#### 26. axe DevTools - Accessibility Testing
**Purpose**: Find accessibility issues  
**Cost**: FREE (browser extension)  
**Installation**: Chrome/Firefox extension

**Usage**:
1. Install extension
2. Open DevTools
3. Run axe scan
4. Fix issues

**Why**: Ensure WCAG compliance, better UX for all users

#### 27. Lighthouse Accessibility Audit
**Purpose**: Automated accessibility testing  
**Cost**: FREE (built into Chrome)  
**Usage**: Already covered in Lighthouse CI

---

## 💾 Database & Backend

### Priority: P1 (HIGH) 🟡

#### 28. Supabase - Already Using ✅
**Status**: GOOD CHOICE  
**Cost**: FREE tier, scales to $25/month+

**Recommendations**:
- [ ] Upgrade to Pro plan before launch ($25/month)
- [ ] Enable connection pooling
- [ ] Set up automated backups
- [ ] Monitor slow queries

#### 29. PgBouncer - Connection Pooling
**Purpose**: Manage database connections efficiently  
**Cost**: FREE (included in Supabase Pro)  
**Setup**: Enable in Supabase settings

**Why**: Handle more concurrent users, prevent connection exhaustion

---

## 📱 Mobile & PWA

### Priority: P2 (MEDIUM) 🟢

#### 30. vite-plugin-pwa - Progressive Web App
**Purpose**: Add offline support, install prompt  
**Cost**: FREE  
**Installation**:
```bash
npm install -D vite-plugin-pwa
```

**Configuration**:
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Odyssey Learns',
        short_name: 'Odyssey',
        description: 'Educational platform for children',
        theme_color: '#4F46E5',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

**Why**: Better mobile experience, works offline, installable  
**When**: Week 7-8 (if time allows)

---

## 🧩 State Management (Already Good) ✅

### Current: React Query + Context
**Status**: EXCELLENT CHOICE  
**No Changes Needed**

**Recommendations**:
- Continue using React Query for server state
- Continue using Context for auth/global state
- No need for Redux/MobX/Zustand

---

## 📦 Recommended Package Updates

### Security Updates (P0) 🔴
```bash
npm update react-router-dom@latest    # Fix XSS vulnerability
npm update vite@latest                # Fix path traversal
npm update glob@latest                # Fix command injection
npm update js-yaml@latest             # Fix prototype pollution
npm update esbuild@latest             # Fix dev server issue
npm update mdast-util-to-hast@latest  # Fix unsanitized class
```

### Feature Additions (P1-P2)
```bash
# Testing (P0)
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @playwright/test

# Monitoring (P1)
npm install @sentry/react

# Performance (P1)
npm install -D @lhci/cli rollup-plugin-visualizer

# Email (P1)
npm install resend

# Accessibility (P1)
npm install -D eslint-plugin-jsx-a11y

# Image optimization (P2)
npm install react-lazy-load-image-component

# PWA (P2)
npm install -D vite-plugin-pwa
```

---

## 💰 Cost Breakdown

### Month 1-3 (Development)
| Service | Cost | Priority | Total |
|---------|------|----------|-------|
| Supabase Pro | $25/month | P0 | $75 |
| Resend | $20/month | P1 | $60 |
| Sentry | $26/month | P1 | $78 |
| Plausible | $9/month | P1 | $27 |
| GitHub Actions | FREE | P0 | $0 |
| Vercel | FREE tier | P0 | $0 |
| All others | FREE | - | $0 |
| **Total** | | | **$240** |

### Month 4+ (Production)
| Service | Cost | Notes |
|---------|------|-------|
| Supabase Pro | $25-50/month | Scales with usage |
| Resend | $20/month | 50k emails |
| Sentry | $26-100/month | Scales with events |
| Plausible | $9-19/month | Scales with traffic |
| Vercel Pro | $20/month | If needed |
| **Total** | **$100-215/month** | Depends on growth |

**ROI**: Paying for quality tools saves 10-20 hours/month of debugging and manual work. At $100/hour developer rate, that's $1,000-2,000/month in saved time.

---

## 🎯 Implementation Priority

### Week 1-2 (Must Have) 🔴
1. ✅ npm security updates
2. ✅ Vitest + Testing Library
3. ✅ Playwright
4. ✅ Sentry setup
5. ✅ Lighthouse CI

### Week 3-4 (Should Have) 🟡
6. ✅ GitHub Actions CI/CD
7. ✅ ESLint plugins (a11y, testing)
8. ✅ Resend email service
9. ✅ Bundle analyzer
10. ✅ UptimeRobot

### Week 5-8 (Nice to Have) 🟢
11. ⚪ Plausible Analytics
12. ⚪ PWA support
13. ⚪ Storybook (if time)
14. ⚪ Image lazy loading
15. ⚪ Cloudflare CDN

---

## 🏆 Success Criteria

### Technical Quality
- ✅ Zero high-severity vulnerabilities
- ✅ 50%+ test coverage (Vitest + Playwright)
- ✅ All errors tracked (Sentry)
- ✅ Performance monitored (Lighthouse CI)
- ✅ Uptime monitored (UptimeRobot)

### Developer Experience
- ✅ Fast feedback loop (<30s test run)
- ✅ Automated quality checks (lint-staged)
- ✅ Good error messages (Sentry)
- ✅ Easy debugging (Source maps, Sentry)

### User Experience
- ✅ Fast page loads (<3s)
- ✅ Accessible (WCAG AA)
- ✅ Reliable (99.9% uptime)
- ✅ Good mobile experience

---

## 📚 Additional Resources

### Documentation
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **Sentry**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Lighthouse**: https://developer.chrome.com/docs/lighthouse/
- **axe DevTools**: https://www.deque.com/axe/devtools/

### Learning
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Web Vitals**: https://web.dev/vitals/
- **WCAG**: https://www.w3.org/WAI/WCAG21/quickref/
- **Security**: https://cheatsheetseries.owasp.org/

### Community
- **React Discord**: For React help
- **Supabase Discord**: For backend help
- **Playwright Discord**: For E2E testing help

---

## 🚀 Next Steps

### Immediate Actions (This Week)
1. [ ] Run `npm audit fix` to fix all vulnerabilities
2. [ ] Install and configure Vitest
3. [ ] Set up Sentry account and add to project
4. [ ] Configure Lighthouse CI
5. [ ] Create GitHub Actions workflow

### Week 2 Actions
6. [ ] Write first 20 tests
7. [ ] Set up Playwright E2E tests
8. [ ] Configure ESLint plugins
9. [ ] Set up Resend account
10. [ ] Add UptimeRobot monitoring

### Week 3-4 Actions
11. [ ] Achieve 30%+ test coverage
12. [ ] Analyze bundle size and optimize
13. [ ] Run accessibility audit
14. [ ] Set up staging environment
15. [ ] Document all tools and workflows

---

**Document Version**: 1.0  
**Last Updated**: January 14, 2026  
**Next Review**: Week 4 (February 11, 2026)

**Questions?** Open an issue or contact the tech lead.
