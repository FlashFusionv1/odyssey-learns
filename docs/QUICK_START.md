# Quick Start Guide

Get Inner Odyssey running locally in 5 minutes.

---

## Prerequisites

- **Node.js** 20+ (check: `node --version`)
- **npm** 10+ (check: `npm --version`)
- **Git** (check: `git --version`)

---

## 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/inner-odyssey/odyssey-learns.git
cd odyssey-learns

# Install dependencies
npm install
```

---

## 2. Environment Setup (1 minute)

The project uses Lovable Cloud, so environment variables are pre-configured:

```bash
# Copy the example env (optional - Lovable Cloud auto-provides these)
cp .env.example .env
```

**Required Variables** (auto-provided by Lovable Cloud):
- `VITE_SUPABASE_URL` - Backend URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public anon key

---

## 3. Start Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 4. Create a Test Account (1 minute)

1. Click **"Get Started Free"** on the landing page
2. Enter email and password (use a test email)
3. Verify email (auto-confirmed in development)
4. Complete parent onboarding
5. Create a child profile (name + grade level)
6. Start exploring!

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test:unit    # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run test:smoke   # Run smoke tests only

# Code Quality
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix ESLint issues
npx tsc --noEmit     # TypeScript check
```

---

## Project Structure

```
odyssey-learns/
├── src/
│   ├── components/     # React components
│   │   ├── ui/         # shadcn/ui primitives
│   │   ├── learning/   # Lesson components
│   │   ├── games/      # Multiplayer game UI
│   │   └── parent/     # Parent dashboard
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities & helpers
│   └── types/          # TypeScript types
├── supabase/
│   └── functions/      # Edge functions (backend)
├── e2e/                # Playwright E2E tests
├── docs/               # Documentation
└── public/             # Static assets
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route configuration |
| `src/lib/queryConfig.ts` | React Query setup |
| `src/hooks/useAuth.tsx` | Authentication hook |
| `src/hooks/useValidatedChild.tsx` | Secure child selection |
| `supabase/functions/ai-tutor/index.ts` | AI tutor backend |

---

## Common Tasks

### Add a New Page

1. Create page: `src/pages/MyPage.tsx`
2. Add to lazy routes: `src/config/lazyRoutes.ts`
3. Add route in: `src/routes/ChildRoutes.tsx` (or appropriate route file)

### Add a New Component

```bash
# Create component
touch src/components/learning/MyComponent.tsx
```

### Add a Database Table

1. Use the Supabase migration tool in Lovable
2. Table auto-synced to `src/integrations/supabase/types.ts`

### Add an Edge Function

```bash
# Create function directory
mkdir supabase/functions/my-function
touch supabase/functions/my-function/index.ts
```

---

## Troubleshooting

### "Module not found" Error
```bash
npm install
```

### TypeScript Errors After Database Changes
Regenerate types (automatic in Lovable Cloud, or run migration tool).

### Authentication Issues
1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Refresh page

### E2E Tests Failing
```bash
# Install Playwright browsers
npx playwright install

# Run in headed mode to debug
npx playwright test --headed
```

---

## Next Steps

- 📖 Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- 🔒 Read [SECURITY.md](./SECURITY.md) for security practices
- 🧪 Read [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing patterns
- 📊 Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for data model

---

## Getting Help

- **Docs**: Browse the `docs/` folder
- **Discord**: Join our community (link in README)
- **Issues**: Open a GitHub issue for bugs

---

**Happy coding! 🚀**
