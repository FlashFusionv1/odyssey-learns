# Changelog

## [1.6.1] - 2026-01-17

### Added
- **AI Tutor Backend**: Real AI-powered tutoring via `ai-tutor` edge function using Lovable AI Gateway
- **Streaming Responses**: Token-by-token streaming for natural conversation flow
- **Age-Adaptive Prompts**: System prompts adjust complexity based on grade level
- **ChildDashboard Integration**: Floating AI Tutor button now appears on child dashboard

### Security
- Rate limit handling (429) with friendly kid-appropriate messages
- Payment required handling (402) with parent notification prompt

---

## [1.6.0] - 2026-01-15

### Added - Major Feature Integration
- **Play Zone ActivityPlayer Integration** - Full modal activity player with:
  - Quiz/trivia support with animated feedback
  - Story mode with page navigation
  - Score tracking and completion celebration
  - Confetti animation on completion
  - Points earned display
  
- **Social Page Enhanced** - Complete `/child/social` route with:
  - Stats cards (friends, activities, points, grade)
  - Friends tab with PeerConnectionsUI
  - Activities tab with SharedActivitiesUI
  - Real-time friend/activity counts
  
- **Interactive Content Seeding** - 9 sample activities:
  - Math games (Addition Adventure, Multiplication Challenge)
  - Science puzzles (Animal Kingdom)
  - Reading adventures (Friendly Dragon, Ocean Explorer)
  - Emotional Intelligence roleplay (Feelings Explorer)
  - Social Studies roleplay (Community Helpers)
  - Mindfulness self-soothing (Breathing Bubbles, Starry Night)

- **AI Tutor Chatbot Foundation** - Q1 2026 roadmap feature:
  - `AITutorChat` component with conversational UI
  - `AITutorButton` floating button with tooltip
  - Quick prompts (Help, Hint, Explain)
  - Contextual response system
  - Minimize/maximize chat panel

- **E2E Test Coverage** - New `play-zone.spec.ts`:
  - Play Zone content loading and filtering
  - Activity player open/close/progress
  - Social page tabs and stats
  - AI Tutor interaction tests
  - Multiplayer games page tests



All notable changes to Inner Odyssey will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- AI Tutor Chatbot (Q1 2026)
- Multi-language support (Spanish, Mandarin)
- VR/AR learning experiences
- Mobile app (iOS/Android)

---

## [1.5.0] - 2026-01-15

### Added
- **Multiplayer Learning Games (Feature 2 Complete)**
  - Real-time multiplayer game infrastructure with Supabase Realtime
  - 5 game types: Math Race, Spelling Bee, Science Quiz, Story Builder, Geography Challenge
  - `MultiplayerGame` class for game state management and realtime sync
  - `useMultiplayerGame` hook for React integration
  - Game components: `GameLobby`, `GameQuestion`, `GameResults`, `GameSelector`
  - Database tables: `game_rooms`, `game_players`, `game_questions`, `game_answers`, `game_results`

- **Parent-Child Video Messaging (Feature 4 Complete)**
  - `VideoMessageService` class for recording, upload, and playback
  - `useVideoMessages` and `useVideoRecorder` hooks
  - `VideoRecorder` component for parents to record messages
  - `VideoMessageInbox` component for children to view messages
  - Database table: `video_messages` with storage bucket
  - Real-time notifications for new messages
  - Up to 60-second video messages with optional text

- **Interactive Content Hub (Feature 5 Complete)**
  - `ActivityPlayer` component for playing interactive activities (quizzes, stories, matching)
  - Quiz mode with immediate feedback, explanations, and scoring
  - Story mode with page navigation and completion tracking
  - Progress bar with step tracking
  - Confetti celebration on completion
  - Sound toggle for kid-friendly audio feedback
  - Automatic completion tracking to `interactive_completions` table

- **Peer-to-Peer Social Features (Feature 6 Complete)**
  - `SharedActivitiesUI` component for collaborative learning activities
  - `PeerConnectionsUI` component for managing friend connections
  - Activity types: Study Groups, Projects, Challenges, Reading Clubs
  - Connection request/accept/reject flow with toast notifications
  - Participant tracking and max capacity enforcement
  - Centralized exports via `src/components/social/index.ts`

---

## [1.4.1] - 2026-01-15

### Added
- **Voice-Based Lesson Narration (Feature 3 Complete)**
  - `LessonNarrator` class using Web Speech API for browser-native TTS
  - `useNarration` and `useAvailableVoices` hooks for React integration
  - `LessonAudioPlayer` component with full playback controls
  - Voice selection with per-child preferences
  - Speed control (0.5x - 2x) and volume adjustment
  - Text chunking for smooth narration of long lessons
  - Compact mode for mobile/space-constrained views
  - Auto-save preferences to localStorage
  - Integration in LessonPlayer page

---

### Added
- **AI-Powered Adaptive Learning Path (Phase 1-3 Complete)**
  - `useLearningProfile` hook for computing learning profiles from activity data
  - `useRecommendations` hook for AI-generated lesson recommendations
  - `RecommendedLessons` component with personalized lesson suggestions
  - `LearningProfileCard` component showing strengths, weaknesses, and trends
  - `analyze-learning-profile` Edge Function for AI profile analysis
  - `generate-recommendations` Edge Function for intelligent lesson recommendations
  - Database tables: `learning_profiles`, `learning_patterns`, `skill_mastery`, `lesson_recommendations`
  
- **Dashboard Integrations**
  - ChildDashboard: Added "Recommended For You" section with AI-powered suggestions
  - ChildDashboard: Added compact Learning Profile card
  - ParentDashboard: Added Learning Profiles for all children
  - ParentDashboard: Added Personalized Recommendations per child
  - New feature tour step for recommendations

- **Types & Helpers**
  - Comprehensive `src/types/adaptive.ts` with 20+ types for adaptive learning
  - Subject labels, difficulty labels, recommendation reason labels
  - Type guards for runtime validation

### Changed
- Feature tour now highlights AI recommendations as first step
- Parent dashboard reorganized with Learning Profiles section

---

## [1.3.0] - 2026-01-15

### Added
- **Server-Side SVG Validation**
  - Database CHECK constraints for room_decorations table
  - Blocks script tags, iframe tags, event handlers, and dangerous protocols
  - Defense-in-depth for XSS prevention alongside DOMPurify

- **Client-Side Rate Limiting**
  - useValidatedChild hook now includes rate limiting (5s cooldown, 12 max/min)
  - Prevents query spam from localStorage manipulation attacks
  - Cached child validation to reduce database queries

### Changed
- **Performance Optimizations**
  - LessonCard and LessonCardCompact now use React.memo with custom comparators
  - Lessons page uses useMemo for filtered lessons and subjects list
  - Added useCallback for stable navigation handlers
  - Reduced unnecessary re-renders in lesson grids

### Security
- verify-recaptcha Edge Function now implements fail-closed behavior
  - Returns valid=false for all error cases in production
  - Development bypass only with explicit ENVIRONMENT=development
  - Proper score threshold (0.5) enforcement
- All security findings from audit resolved or documented

---

## [1.2.0] - 2025-12-30

### Added
- **Phase 9 Security Polish**
  - Comprehensive RLS policy audit and fixes
  - Enhanced security access logging
  - Server-side rate limiting with database enforcement
  - Request deduplication for idempotency
  - Circuit breaker pattern for error logging

- **Documentation Overhaul**
  - Created CLAUDE.md for AI agent guidance
  - Created AGENTS.md for multi-agent workflows
  - Created GEMINI.md for Lovable AI integration
  - Created consolidated ROADMAP.md
  - Updated all 55+ documentation files

- **Performance Optimizations**
  - Added 10+ composite database indexes
  - Implemented query result caching
  - Optimized React Query stale times

### Changed
- Updated package.json with proper project metadata
- Refactored authentication flow for better security
- Improved error handling with batched logging

### Fixed
- RLS policy gaps identified in security audit
- Race conditions in client-side rate limiting (removed, now server-only)
- Edge cases in lesson player quiz submission

### Security
- All rate limiting moved to server-side enforcement
- Enhanced input sanitization with DOMPurify
- Improved session timeout handling
- Sensitive data cleared on logout

---

## [1.1.0] - 2025-11-15

### Added
- **Beta Feedback System**
  - NPS survey infrastructure
  - Feedback widget in all pages
  - Admin analytics dashboard for feedback

- **CI/CD Pipeline**
  - GitHub Actions workflows (lint, build, test, deploy)
  - Automated Playwright E2E tests
  - Lighthouse CI performance monitoring
  - Zero-downtime deployments

- **PWA Support**
  - Service worker for offline capability
  - Install prompt for mobile devices
  - Auto-update notifications

- **Admin Dashboard Enhancements**
  - Batch lesson generation (10 at once)
  - Content review workflow
  - Reviewer performance tracking
  - Security monitoring dashboard

### Changed
- Improved lesson player with auto-save every 30 seconds
- Enhanced parent dashboard with AI insights
- Updated gamification to use intrinsic motivation patterns

### Fixed
- Session timeout not clearing sensitive data
- Parent-child messaging not refreshing in real-time
- Badge unlocking not triggering celebration modal

---

## [1.0.0] - 2025-10-20

### Added
- **Core Platform Architecture**
  - React 18.3 + TypeScript frontend
  - Supabase backend (PostgreSQL, Auth, Edge Functions)
  - Lovable Cloud deployment infrastructure
  - Cloudflare CDN and DDoS protection

- **Authentication System**
  - Email/password authentication
  - Parent, Child, and Admin roles
  - reCAPTCHA v3 bot protection
  - Password strength enforcement
  - Session timeout with auto-logout

- **Multi-Grade Support (K-12)**
  - Age-adaptive UI (K-2, 3-5, 6-8, 9-12 tiers)
  - Grade-specific lesson content
  - Differentiated quests and challenges

- **Lesson System**
  - 50+ seed lessons for K-2
  - AI-powered lesson generation (Lovable AI/Gemini)
  - Quiz system (multiple choice, true/false, short answer)
  - Progress tracking with auto-save

- **Gamification Foundation**
  - Points system with fair earning
  - Achievement badges (15+ unique badges)
  - Daily streaks with multipliers
  - Age-specific daily quests

- **Parent Dashboard**
  - Real-time child progress monitoring
  - AI-generated weekly insights
  - Screen time management
  - Custom reward system
  - Parent-child messaging

- **Child Dashboard**
  - Personalized lesson recommendations
  - Avatar customization
  - Badge showcase
  - Point redemption for rewards

- **Security Infrastructure**
  - Row Level Security (RLS) on all tables
  - Emotion log encryption at rest
  - Rate limiting on sensitive operations
  - Audit logging for data access
  - COPPA/FERPA compliance measures

- **Social Features (Parent-Approved)**
  - Peer connections with dual-parent approval
  - Shared activities for collaborative learning
  - Celebration feed for achievements

### Database
- 30+ tables with proper indexing
- Comprehensive RLS policies
- Stored procedures for complex operations
- Automated backup and recovery

### Testing
- Jest + React Testing Library for unit tests
- Playwright for E2E tests (5 browser targets)
- Security test suite for RLS validation
- Load testing infrastructure

---

## [0.5.0] - 2025-10-01

### Added
- Initial project scaffolding
- Basic routing structure
- Supabase integration
- Core component library (shadcn/ui)

### Changed
- Migrated from Create React App to Vite
- Adopted TypeScript strict mode

---

## Release Notes

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, backwards compatible
- **Patch (0.0.X)**: Bug fixes, security patches

### Upgrade Guide

#### From 1.1.x to 1.2.x
1. Pull latest migrations: `supabase db push`
2. Clear browser cache (new PWA version)
3. Review updated RLS policies in migration files

#### From 1.0.x to 1.1.x
1. Run database migrations for beta feedback tables
2. Configure GitHub Actions secrets for CI/CD
3. Update environment variables for PWA

---

## Contributors

- Inner Odyssey Development Team
- Beta Testing Community (2,500+ families)
- Open Source Contributors

---

[Unreleased]: https://github.com/inner-odyssey/odyssey-learns/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/inner-odyssey/odyssey-learns/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/inner-odyssey/odyssey-learns/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/inner-odyssey/odyssey-learns/compare/v0.5.0...v1.0.0
[0.5.0]: https://github.com/inner-odyssey/odyssey-learns/releases/tag/v0.5.0
