# Changelog

All notable changes to Odyssey Learns will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Comprehensive testing infrastructure (Vitest + React Testing Library)
- TypeScript strict mode improvements (eliminate all `any` types)
- Performance optimization (code splitting, lazy loading)
- Accessibility audit and improvements
- API documentation
- Mobile app (React Native)
- Internationalization (i18n)

## [0.5.0] - 2026-01-10

### Added - Interactive Onboarding & Learning Analytics

#### Learning Progress Dashboard
- **Comprehensive Analytics Page**: New `/progress` route with detailed learning analytics
- **Subject Progress Chart**: Pie chart visualization of learning by subject area
- **Activity Trend Chart**: Area chart showing daily learning activity over time
- **Skill Mastery Grid**: Visual cards displaying skill mastery with progress indicators
- **Achievement Timeline**: Timeline view of recent badge unlocks and milestones
- **Engagement Overview**: Key metrics including streak, points, lessons, and badges

#### Interactive Onboarding System
- **Child Onboarding Tutorial**: Age-adaptive tutorial with tailored content for K-2, 3-5, 6-8, and 9-12 age tiers
- **Feature Spotlight Component**: Contextual feature discovery with spotlight effects and tooltips
- **Onboarding Provider**: React Context for managing onboarding state across the app
- **HelpButton Component**: Floating help button with tutorials, feature tours, and feedback access
- **Progress Persistence**: Tutorial progress saved to Supabase for parents, localStorage for children

#### Data-Tour Integration
- Added `data-tour` attributes to ChildDashboard elements (stats, progress, quests, tokens, lessons, badges)
- Added `data-tour` attributes to ParentDashboard elements (notifications, stats, children overview, tabs)
- Feature tour steps defined for both parent and child flows

#### Age-Adaptive Leaderboard
- **K-2**: Personal progress celebration (no competitive leaderboard)
- **Grades 3-5**: Opt-in class leaderboard with avatar privacy
- **Grades 6-8**: Multiple category rankings (Top Learners, Most Improved, Most Helpful, Streak)
- **Grades 9-12**: Full leaderboard with privacy toggle option

### Technical Details
- `src/hooks/useChildProgressAnalytics.tsx` - Analytics data fetching and computation
- `src/hooks/useOnboarding.tsx` - Onboarding state management hook
- `src/components/progress/SubjectProgressChart.tsx` - Subject breakdown pie chart
- `src/components/progress/ActivityTrendChart.tsx` - Daily activity area chart
- `src/components/progress/SkillMasteryGrid.tsx` - Skill mastery card grid
- `src/components/progress/AchievementTimeline.tsx` - Achievement timeline component
- `src/components/progress/EngagementOverview.tsx` - Engagement metrics overview
- `src/components/onboarding/ChildOnboardingTutorial.tsx` - Age-adaptive tutorial
- `src/components/onboarding/FeatureSpotlight.tsx` - Spotlight overlay component
- `src/components/onboarding/OnboardingProvider.tsx` - Context provider
- `src/components/onboarding/HelpButton.tsx` - Floating help menu
- `src/components/gamification/Leaderboard.tsx` - Age-adaptive leaderboard
- `src/pages/LearningProgress.tsx` - Progress dashboard page

### Routes Added
- `/child/progress` - Learning progress analytics dashboard

## [0.4.0] - 2026-01-09

### Added - Voice-Based Lesson Narration Feature
- **Text-to-Speech Narration**: Browser-native narration for all lessons using Web Speech API
- **Audio Player Component**: Full-featured player with play/pause/stop controls
- **Playback Controls**: Speed adjustment (0.5x-2.0x), volume control with mute toggle
- **Voice Selection**: Choose from all available system voices
- **Progress Indicator**: Visual feedback showing narration progress
- **User Preferences**: Per-child profile preferences saved to localStorage
- **Preferences Persistence**: Speed, volume, and voice preferences automatically saved
- **Responsive Design**: Full player view on desktop, compact mode for mobile
- **Accessibility Features**: ARIA labels on all controls, keyboard navigation
- **Documentation**: Comprehensive feature documentation in `docs/features/NARRATION_FEATURE.md`

### Technical Details
- `src/lib/audio/narrator.ts` - Core narration service using Web Speech API
- `src/lib/audio/preferences.ts` - User preferences management
- `src/hooks/useNarration.ts` - React hook for easy component integration
- `src/components/learning/LessonAudioPlayer.tsx` - Audio player UI component
- Automatic text preprocessing to remove markdown formatting
- Intelligent chunking system for long lessons (~200 char segments)
- Zero external dependencies (browser-native only)
- Privacy-first design (all processing local, COPPA-compliant)
- Graceful degradation for unsupported browsers

### Benefits
- Improves accessibility for K-2 students learning to read
- Helps students with dyslexia or reading difficulties
- Supports auditory learners and multi-sensory learning
- No cost (uses browser-native API)
- Privacy-friendly (no external API calls)

## [0.3.0] - 2024-12-XX (In Progress)

### Added
- Comprehensive codebase documentation
- Architecture documentation
- Contributing guidelines
- Security testing guide
- Deployment documentation
- Module-specific documentation

### Changed
- Updated README with complete setup instructions
- Improved project structure documentation

### Security
- Documented security best practices
- Added security reporting guidelines

## [0.2.0] - 2024-11-XX

### Added
- Beta program features with feedback system
- Community lesson sharing functionality
- Lesson review workflow for admin
- Security monitoring dashboard
- Phase 1 lesson generation tools
- Admin setup workflow
- Advanced analytics for beta testers
- Discord integration page
- Social learning features with collaboration requests

### Enhanced
- Parent dashboard with comprehensive oversight
- Child dashboard with improved gamification
- Avatar customization system with more options
- Badge system with multiple tiers
- Reward redemption workflow

### Fixed
- Various bug fixes in lesson player
- Progress tracking accuracy improvements
- Screen time calculation corrections

## [0.1.0] - 2024-10-XX

### Added - Initial Release

#### Core Features
- **Authentication System**
  - Email/password authentication via Supabase Auth
  - Parent and child role separation
  - PIN protection for child accounts
  - Password reset functionality
  - Session management

- **User Management**
  - Parent profile creation and management
  - Child profile creation with grade level (K-12)
  - Avatar customization system
  - User settings and preferences

- **Learning Platform**
  - Lesson management system with markdown support
  - Multi-subject support (Reading, Math, Science, Social Studies, Life Skills)
  - Grade-level based lesson filtering (K-12)
  - Interactive lesson player with quiz functionality
  - Progress tracking (completion status, scores, time spent)
  - Lesson search and filtering

- **Gamification System**
  - Points system for lesson completion
  - Badge/achievement system with unlock criteria
  - Daily quests with bonus rewards
  - Token economy for avatar items
  - Progress visualization

- **Reward System**
  - Parent-defined custom rewards
  - Point-based reward costs
  - Reward redemption request workflow
  - Parent approval/denial with feedback
  - Reward history tracking

- **Parent Dashboard**
  - Overview of all children's progress
  - Individual child statistics
  - Lesson assignment capabilities
  - Reward management
  - Screen time monitoring
  - Activity timeline
  - Approval workflows

- **Child Dashboard**
  - Personalized learning dashboard
  - Current progress visualization
  - Available lessons by grade level
  - Earned badges display
  - Daily quest tracking
  - Available rewards showcase
  - Avatar display and customization

- **Additional Features**
  - Emotion check-in system before lessons
  - Celebration animations for achievements
  - Screen time session tracking
  - Notification system
  - Responsive design for all devices
  - Dark/light theme support

#### Technical Implementation
- **Frontend**
  - React 18 with TypeScript
  - Vite for fast development and builds
  - React Router v6 for routing
  - React Query for server state management
  - React Context for auth state
  - shadcn/ui + Radix UI components
  - Tailwind CSS for styling
  - Framer Motion for animations
  - React Hook Form + Zod for form validation

- **Backend**
  - Supabase PostgreSQL database
  - Row-Level Security (RLS) policies
  - Database migrations for schema management
  - Supabase Auth integration
  - Supabase Storage for assets
  - Supabase Realtime for notifications

- **Security**
  - Input sanitization utilities
  - DOMPurify for XSS prevention
  - Client-side rate limiting
  - Password strength validation (zxcvbn)
  - HTTPS enforcement
  - Environment variable management

- **Code Quality**
  - TypeScript strict mode
  - ESLint configuration
  - Consistent code organization
  - Feature-based component structure

#### Database Schema
- Core tables: profiles, children, lessons, user_progress
- Gamification: achievement_badges, user_badges, daily_quests
- Rewards: rewards, reward_redemptions
- Social: collaboration_requests, lesson_shares, activity_participants
- Monitoring: screen_time_sessions, notifications, security_logs
- Beta: beta_feedback, beta_analytics_events

#### Pages and Routes
- Landing page with feature showcase
- Authentication pages (login, signup, reset password)
- Parent setup wizard
- Parent dashboard with child management
- Child dashboard with personalized content
- Lessons page with filtering
- Lesson player with quiz integration
- Settings page for profile management
- Badges page showing achievements
- Rewards page for redemption
- Social page for collaborative learning
- About, Features, Pricing pages
- Support and Contact pages
- Beta program enrollment
- Admin dashboard for platform management
- Security monitoring for admin
- Terms of Service and Privacy Policy

### Known Issues
- 141 TypeScript `any` type usages need fixing
- 38 React hooks missing dependencies
- 5 npm security vulnerabilities (4 moderate, 1 high)
- No automated testing infrastructure yet
- Missing accessibility audit
- No performance optimization (code splitting)

### Dependencies (Major)
- react@18.3.1
- react-dom@18.3.1
- react-router-dom@6.30.1
- @supabase/supabase-js@2.75.0
- @tanstack/react-query@5.83.0
- typescript@5.8.3
- vite@5.4.19
- tailwindcss@3.4.17
- framer-motion@12.23.24
- react-hook-form@7.61.1
- zod@3.25.76

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2024-10 | Initial release with core features |
| 0.2.0 | 2024-11 | Beta features, social learning, admin tools |
| 0.3.0 | 2024-12 | Documentation, security, improvements |

---

## Upgrade Guides

### Upgrading to 0.2.0 from 0.1.0

No breaking changes. New features are additive.

**Database Migrations:**
```bash
supabase db push
```

**Environment Variables:**
No new environment variables required.

### Upgrading to 0.3.0 from 0.2.0

No breaking changes. Documentation updates only.

---

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for information on how to contribute to this changelog.

---

## Semantic Versioning Guide

Given a version number MAJOR.MINOR.PATCH (e.g., 1.2.3):

- **MAJOR** (1.x.x): Incompatible API changes
- **MINOR** (x.2.x): New features, backwards compatible
- **PATCH** (x.x.3): Bug fixes, backwards compatible

### Pre-release versions:
- **alpha**: Early development, unstable
- **beta**: Feature complete, testing
- **rc**: Release candidate, final testing

Example: `1.0.0-beta.1`

---

## Release Process

1. Update version in `package.json`
2. Update this CHANGELOG.md
3. Commit changes: `git commit -m "chore: release v1.0.0"`
4. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
5. Push changes and tags: `git push && git push --tags`
6. Create GitHub release with changelog notes
7. Deploy to production

---

**Last Updated**: 2024-12-30
