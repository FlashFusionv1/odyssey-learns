# Odyssey Learns - Educational Platform Documentation

> **Complete documentation for developers, contributors, and stakeholders**

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)
8. [Contributing](#contributing)
9. [Documentation Index](#documentation-index)

---

## 🎯 Project Overview

**Odyssey Learns** is a modern, interactive educational platform designed for children (K-12) with comprehensive parent oversight. The platform combines engaging educational content with gamification elements to create an effective and enjoyable learning experience.

### Key Features

- **🎓 Interactive Lessons**: Markdown-based lessons with quizzes across multiple subjects (Reading, Math, Science, Social Studies, Life Skills)
- **👥 Parent-Child Model**: Secure parent oversight with role-based access control
- **🎮 Gamification**: Points, badges, achievements, daily quests, and streaks
- **🎨 Avatar Customization**: Personalized avatars with unlockable items
- **🏆 Reward System**: Parent-defined rewards that children can redeem
- **📊 Progress Tracking**: Comprehensive analytics for both parents and children
- **💬 Social Features**: Collaboration requests and lesson sharing
- **⏱️ Screen Time Management**: Configurable limits and session tracking
- **🎉 Celebration Animations**: Engaging feedback for achievements
- **❤️ Emotional Check-ins**: Monitor child's emotional state during learning

### Target Audience

- **Primary Users**: Children in grades K-12
- **Secondary Users**: Parents/Guardians who manage and monitor learning
- **Tertiary Users**: Administrators who manage platform content

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** 9+ or **yarn** 1.22+
- **Supabase Account** (for backend services)
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Krosebrook/odyssey-learns.git
cd odyssey-learns

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Development settings
VITE_DEBUG_MODE=false
```

### First Run Setup

1. **Navigate to** `http://localhost:5173`
2. **Sign up** as a parent account
3. **Complete onboarding** and create a child profile
4. **Browse lessons** or create custom ones
5. **Start learning!**

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  (TypeScript + Vite + React Router + shadcn/ui)    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ├─── React Query (Server State)
                    ├─── React Context (Client State)
                    └─── React Hook Form (Form State)
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Backend (BaaS)                 │
├─────────────────────────────────────────────────────┤
│  • PostgreSQL Database (with RLS)                   │
│  • Authentication (JWT-based)                       │
│  • Storage (Avatars, Thumbnails)                    │
│  • Realtime Subscriptions                           │
│  • Edge Functions                                   │
└─────────────────────────────────────────────────────┘
```

### Frontend Architecture

**Component Organization:**
- **Atomic Design Pattern**: UI components in `components/ui/`
- **Feature-Based Structure**: Domain components in `components/{feature}/`
- **Page Components**: Route-level components in `pages/`

**State Management:**
- **Server State**: React Query for caching and synchronization
- **Client State**: React Context for auth, theme, and global state
- **Form State**: React Hook Form with Zod validation

**Routing:**
- React Router v6 with nested routes
- Protected routes with authentication guards
- Role-based route access (parent/child)

### Backend Architecture

**Database Schema:**

```
profiles (auth users)
  ├── children (1:many)
  │     ├── user_progress (1:many)
  │     ├── badges (many:many via user_badges)
  │     ├── daily_quests (1:many)
  │     ├── reward_redemptions (1:many)
  │     ├── screen_time_sessions (1:many)
  │     └── collaboration_requests (1:many)
  │
  ├── rewards (1:many) - parent-defined
  ├── notifications (1:many)
  └── security_logs (1:many)

lessons (platform content)
  ├── user_progress (1:many)
  ├── lesson_shares (1:many)
  └── quiz_questions (embedded JSON)
```

**Security:**
- Row-Level Security (RLS) policies on all tables
- JWT-based authentication via Supabase Auth
- Input sanitization on client and server
- Rate limiting for sensitive operations
- Content Security Policy (CSP) headers

---

## 🛠️ Tech Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Language** | TypeScript | 5.8.3 | Type safety |
| **Build Tool** | Vite | 5.4.19 | Fast dev server & bundler |
| **Backend** | Supabase | 2.75.0 | BaaS (auth, DB, storage) |
| **Router** | React Router | 6.30.1 | Client-side routing |
| **State** | React Query | 5.83.0 | Server state management |
| **UI Library** | shadcn/ui + Radix | Latest | Accessible components |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **Forms** | React Hook Form | 7.61.1 | Form management |
| **Validation** | Zod | 3.25.76 | Schema validation |
| **Animation** | Framer Motion | 12.23.24 | Animations & transitions |

### Additional Libraries

- **dompurify**: XSS protection for user-generated content
- **react-markdown**: Render lesson content from markdown
- **recharts**: Data visualization and charts
- **lucide-react**: Icon library
- **date-fns**: Date manipulation
- **zxcvbn**: Password strength validation
- **cmdk**: Command palette component

---

## 📁 Project Structure

```
odyssey-learns/
├── public/                    # Static assets
│   ├── avatars/              # Avatar item images
│   └── lesson-thumbnails/    # Lesson cover images
│
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── admin/           # Admin dashboard components
│   │   ├── auth/            # Authentication components
│   │   ├── avatar/          # Avatar customization
│   │   ├── badges/          # Badge system
│   │   ├── beta/            # Beta testing features
│   │   ├── celebration/     # Celebration animations
│   │   ├── emotional/       # Emotional check-ins
│   │   ├── gamification/    # Points, rewards, quests
│   │   ├── layout/          # Layout components (nav, footer)
│   │   ├── learning/        # Lesson-related components
│   │   ├── notifications/   # Notification system
│   │   ├── onboarding/      # User onboarding flow
│   │   ├── parent/          # Parent dashboard features
│   │   ├── quests/          # Daily quest system
│   │   └── social/          # Social features
│   │
│   ├── pages/               # Route components
│   │   ├── Landing.tsx      # Marketing landing page
│   │   ├── Login.tsx        # Authentication
│   │   ├── ParentDashboard.tsx
│   │   ├── ChildDashboard.tsx
│   │   ├── Lessons.tsx      # Lesson browser
│   │   ├── LessonPlayer.tsx # Lesson viewer
│   │   └── [30+ more pages]
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication hook
│   │   ├── useValidatedChild.tsx
│   │   └── [more hooks]
│   │
│   ├── lib/                 # Utilities and helpers
│   │   ├── analytics.ts     # Analytics tracking
│   │   ├── badgeChecker.ts  # Badge award logic
│   │   ├── inputSanitization.ts  # Security
│   │   ├── questGenerator.ts     # Quest generation
│   │   ├── rateLimiter.ts   # Client-side rate limiting
│   │   ├── schemas/         # Zod validation schemas
│   │   └── utils.ts         # General utilities
│   │
│   ├── integrations/        # External integrations
│   │   └── supabase/        # Supabase client
│   │       ├── client.ts    # Supabase instance
│   │       └── types.ts     # Generated types
│   │
│   ├── App.tsx              # Root component with routes
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── supabase/                # Supabase configuration
│   ├── migrations/          # Database migrations
│   ├── functions/           # Edge functions
│   └── config.toml          # Supabase config
│
├── docs/                    # Documentation
│   ├── CODEBASE_AUDIT.md    # Comprehensive audit
│   ├── IMPROVEMENT_PLAN.md  # Improvement roadmap
│   ├── REFACTOR_PLAN.md     # Refactoring guide
│   ├── security-testing-guide.md
│   └── [more docs]
│
├── .github/                 # GitHub configuration
│   └── workflows/           # CI/CD workflows
│
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
├── eslint.config.js         # ESLint rules
└── README.md                # Main README
```

---

## 💻 Development Guide

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run dev:host         # Dev server accessible on network

# Building
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking

# Testing (when set up)
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guide

3. **Test your changes:**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit with semantic messages:**
   ```bash
   git commit -m "feat: add user profile editing"
   git commit -m "fix: resolve avatar loading issue"
   git commit -m "docs: update API documentation"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

**TypeScript:**
- ✅ **Always use explicit types** - NO `any` types
- ✅ Use `interface` for object shapes
- ✅ Export types from `src/types/` for reuse
- ✅ Enable strict mode (already configured)

**React:**
- ✅ Use functional components with hooks
- ✅ Extract custom hooks for reusable logic
- ✅ Include all dependencies in `useEffect` arrays
- ✅ Use `useCallback` for stable function references
- ✅ Use `useMemo` for expensive computations

**Components:**
```typescript
// ✅ Good component structure
interface LessonCardProps {
  lesson: Lesson;
  onStart: (id: string) => void;
}

export function LessonCard({ lesson, onStart }: LessonCardProps) {
  // 1. Hooks
  const [isHovered, setIsHovered] = useState(false);
  
  // 2. Event handlers
  const handleClick = useCallback(() => {
    onStart(lesson.id);
  }, [lesson.id, onStart]);
  
  // 3. Render
  return (
    <Card onMouseEnter={() => setIsHovered(true)}>
      {/* JSX */}
    </Card>
  );
}
```

**Styling:**
- ✅ Use Tailwind utility classes
- ✅ Follow shadcn/ui patterns
- ✅ Mobile-first responsive design
- ✅ Use `cn()` utility for conditional classes

**Security:**
- ✅ **Always sanitize user inputs** (use `inputSanitization.ts`)
- ✅ Validate on both client and server
- ✅ Use DOMPurify for rendering user content
- ✅ Check RLS policies for database operations

### Database Migrations

```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database (careful!)
supabase db reset
```

### Common Development Tasks

**Adding a new page:**
1. Create component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link if needed
4. Update documentation

**Adding a new component:**
1. Create in appropriate `src/components/{category}/`
2. Export from category index if needed
3. Add TypeScript interfaces
4. Document props and usage

**Adding a database table:**
1. Create migration in `supabase/migrations/`
2. Add RLS policies
3. Update types in `src/integrations/supabase/types.ts`
4. Create API functions in `src/lib/api/`

---

## 🚢 Deployment

### Supabase Setup

1. **Create Supabase project**: https://supabase.com
2. **Run migrations**:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
3. **Configure Authentication** providers in Supabase dashboard
4. **Set up Storage** buckets for avatars and thumbnails
5. **Configure RLS policies** (already in migrations)

### Frontend Deployment

**Recommended Platforms:**
- **Vercel** (easiest, zero-config)
- **Netlify**
- **Cloudflare Pages**

**Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables:**
Set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Storage buckets configured
- [ ] Authentication providers set up
- [ ] Custom domain configured (optional)
- [ ] Analytics integrated (optional)
- [ ] Error tracking set up (recommended)
- [ ] Backup strategy in place
- [ ] Monitoring enabled

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Fix issues
- ✨ Add new features
- 🎨 Improve UI/UX

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write/update tests** (when available)
5. **Update documentation**
6. **Submit a pull request**

### Pull Request Guidelines

- **Clear title**: Use semantic commit format
- **Description**: Explain what and why
- **Screenshots**: For UI changes
- **Tests**: Add tests for new features
- **Documentation**: Update if needed
- **Code quality**: Pass linting and type checks

### Code Review Process

1. Automated checks run (linting, type checking)
2. Reviewer provides feedback
3. Address feedback
4. Approval and merge

### Getting Help

- 📖 Read documentation in `/docs`
- 💬 Ask questions in GitHub Discussions
- 🐛 Report issues on GitHub
- 📧 Email: support@odysseylearns.com

---

## 📚 Documentation Index

### Core Documentation
- **[CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md)** - Comprehensive codebase analysis
- **[IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md)** - Planned improvements
- **[REFACTOR_PLAN.md](./REFACTOR_PLAN.md)** - Refactoring strategy
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture (to be created)
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference (to be created)

### Specialized Guides
- **[security-testing-guide.md](./security-testing-guide.md)** - Security testing procedures
- **[DEBUG_PLAN.md](./DEBUG_PLAN.md)** - Debugging strategies
- **[FEATURES_PLAN.md](./FEATURES_PLAN.md)** - Feature roadmap
- **[SCALABILITY_PLAN.md](./SCALABILITY_PLAN.md)** - Scaling strategies

### Roadmaps
- **[SHORT_TERM_ROADMAP.md]** - Next 1-3 months (to be created)
- **[MID_TERM_ROADMAP.md]** - 3-6 months (to be created)
- **[LONG_TERM_ROADMAP.md]** - 6-12+ months (to be created)

### AI Integration
- **[agents.md]** - Custom agents documentation (to be created)
- **[claude.md]** - Claude AI integration (to be created)
- **[gemini.md]** - Gemini AI integration (to be created)

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Contact

- **Website**: https://odysseylearns.com
- **Email**: support@odysseylearns.com
- **GitHub**: https://github.com/Krosebrook/odyssey-learns

---

**Made with ❤️ for learners everywhere**
