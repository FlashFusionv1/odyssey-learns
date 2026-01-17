# Onboarding System Documentation

> **AI-Powered Adaptive Onboarding for Inner Odyssey K-12**

**Last Updated**: 2026-01-17  
**Status**: Phase 3 Implementation

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Onboarding Paths](#onboarding-paths)
5. [Tutorial System](#tutorial-system)
6. [AI Nudges](#ai-nudges)
7. [Component Reference](#component-reference)
8. [Hook Reference](#hook-reference)
9. [Implementation Status](#implementation-status)

---

## Overview

The Inner Odyssey onboarding system provides a multi-path, AI-enhanced experience that adapts to user preferences and behavior. It supports both comprehensive guided setup and quick-start options for users who prefer immediate access.

### Key Features

- **Multi-Path Onboarding**: Full wizard (7 steps) or Quick Start (4 steps)
- **Age-Adaptive Design**: K-2, 3-5, 6-8, 9-12 tier customization
- **AI-Driven Nudges**: Personalized suggestions based on behavior
- **Contextual Tutorials**: Feature discovery walkthroughs
- **Progress Persistence**: Resume from any point

### Design Principles

1. **Respect User Time**: Quick Start for fast access, deferred setup later
2. **Progressive Disclosure**: Show complexity only when needed
3. **Celebrate Progress**: Gamified completion with rewards
4. **Non-Intrusive**: Dismissible nudges, skippable tutorials

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Onboarding System                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Wizard    │    │  Tutorials  │    │  AI Nudges  │         │
│  │   System    │    │   System    │    │   Engine    │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              OnboardingProvider (Context)            │       │
│  └─────────────────────────────────────────────────────┘       │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                  │
│         ▼                 ▼                 ▼                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │useOnboarding│   │useAINudges │   │useTutorial  │          │
│  │   Wizard    │   │            │   │  Progress   │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (Lovable Cloud)                     │
├─────────────────────────────────────────────────────────────────┤
│  onboarding_preferences │ tutorial_progress │ ai_nudges        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables

#### `onboarding_preferences`
Stores user preferences and wizard completion status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to auth.users |
| `onboarding_mode` | TEXT | 'full' or 'quick_start' |
| `preferred_subjects` | TEXT[] | Selected subjects |
| `difficulty_preference` | TEXT | 'easy', 'moderate', 'challenging', 'adaptive' |
| `session_length_minutes` | INT | Preferred session length |
| `learning_style` | TEXT | Visual, auditory, kinesthetic, reading, balanced |
| `primary_goal` | TEXT | Main learning objective |
| `target_lessons_per_week` | INT | Weekly goal |
| `focus_areas` | TEXT[] | Priority areas |
| `community_interest` | TEXT | Engagement level |
| `share_progress_publicly` | BOOLEAN | Privacy setting |
| `notification_frequency` | TEXT | Alert preferences |
| `wizard_completed` | BOOLEAN | Completion flag |
| `wizard_completed_at` | TIMESTAMP | Completion time |
| `quick_start_completed` | BOOLEAN | Quick path flag |
| `deferred_setup_items` | TEXT[] | Skipped steps |

#### `tutorial_progress`
Tracks tutorial completion across features.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to auth.users |
| `child_id` | UUID | Optional child reference |
| `tutorial_id` | TEXT | Tutorial identifier |
| `tutorial_type` | TEXT | Category of tutorial |
| `current_step` | INT | Progress position |
| `total_steps` | INT | Tutorial length |
| `status` | TEXT | not_started, in_progress, completed, skipped |
| `time_spent_seconds` | INT | Engagement metric |
| `steps_skipped` | INT | Skip count |

#### `ai_nudges`
Personalized recommendation engine data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Target user |
| `child_id` | UUID | Optional child context |
| `nudge_type` | TEXT | Category (preference, activity, setup, etc.) |
| `trigger_reason` | TEXT | Why nudge was generated |
| `title` | TEXT | Display title |
| `message` | TEXT | Nudge content |
| `action_url` | TEXT | CTA destination |
| `action_label` | TEXT | CTA text |
| `priority` | INT | Display ordering (1-10) |
| `display_location` | TEXT | Where to show |
| `expires_at` | TIMESTAMP | Auto-dismiss time |
| `dismissed_at` | TIMESTAMP | User dismissed |
| `completed_at` | TIMESTAMP | User acted |
| `impressions_count` | INT | View counter |
| `max_impressions` | INT | View limit |
| `feedback_rating` | INT | User rating (1-5) |

---

## Onboarding Paths

### Full Wizard (7 Steps)

For users who want comprehensive setup:

| Step | Component | Duration | Description |
|------|-----------|----------|-------------|
| 1 | WelcomeStep | 1 min | Platform introduction |
| 2 | LearningPreferencesStep | 2 min | Learning style |
| 3 | SubjectsStep | 1 min | Subject selection |
| 4 | GoalsStep | 2 min | Learning objectives |
| 5 | ScheduleStep | 1 min | Weekly routine |
| 6 | CommunityStep | 1 min | Social settings |
| 7 | ReviewStep | 1 min | Confirm & complete |

**Total Time**: ~9 minutes

### Quick Start (4 Steps)

For users who want immediate access:

| Step | Component | Duration | Description |
|------|-----------|----------|-------------|
| 1 | QuickWelcomeStep | 30 sec | Brief intro |
| 2 | QuickChildStep | 1 min | Basic child info |
| 3 | QuickGoalStep | 30 sec | Primary objective |
| 4 | QuickReadyStep | 30 sec | Launch to app |

**Total Time**: ~2.5 minutes

### Path Selection Logic

```typescript
// Entry point determines path
function determineOnboardingPath(user: User): 'full' | 'quick_start' {
  // User explicitly chose quick start
  if (userSelectedQuickStart) return 'quick_start';
  
  // Returning user with partial completion
  if (hasExistingPreferences && !wizardCompleted) return 'quick_start';
  
  // New user, default to full wizard
  return 'full';
}
```

---

## Tutorial System

### Tutorial Types

1. **Onboarding Wizard** - Initial setup flow
2. **Feature Spotlight** - Single-feature highlights
3. **Contextual Walkthrough** - Multi-step guided tours
4. **Quick Tour** - Brief orientation

### Trigger Conditions

| Type | Trigger | Example |
|------|---------|---------|
| `first_visit` | Route accessed first time | Parent visits `/parent` |
| `feature_access` | Feature used first time | User opens AI tutor |
| `manual` | User clicks help | Help button clicked |
| `inactivity` | No activity for X time | Idle for 5 minutes |
| `milestone` | Achievement unlocked | 10th lesson completed |

### Tutorial Definitions

```typescript
// Parent Dashboard Tour
const PARENT_DASHBOARD_TUTORIAL = {
  id: 'parent_dashboard_tour',
  steps: [
    { target: '[data-tutorial="child-selector"]', title: 'Switch Children' },
    { target: '[data-tutorial="progress-overview"]', title: 'Progress Overview' },
    { target: '[data-tutorial="weekly-goals"]', title: 'Weekly Goals' },
    { target: '[data-tutorial="rewards"]', title: 'Manage Rewards' },
  ],
};

// Child Lessons Tour
const CHILD_LESSONS_TUTORIAL = {
  id: 'child_lessons_tour',
  steps: [
    { target: '[data-tutorial="lesson-cards"]', title: 'Choose a Lesson' },
    { target: '[data-tutorial="subject-filter"]', title: 'Filter Subjects' },
    { target: '[data-tutorial="daily-quest"]', title: 'Daily Quest' },
  ],
};
```

---

## AI Nudges

### Nudge Types

| Type | Description | Example |
|------|-------------|---------|
| `preference_based` | Based on user settings | "Try these high-challenge lessons" |
| `activity_based` | Based on usage patterns | "You love science—here's more!" |
| `incomplete_setup` | Deferred setup prompts | "Complete your profile for better matches" |
| `feature_discovery` | Unused feature hints | "Have you tried multiplayer games?" |
| `celebration` | Achievement recognition | "🎉 7-day streak!" |
| `reminder` | Gentle re-engagement | "Your child hasn't learned today" |

### Nudge Generation Logic

```typescript
// Example nudge generation rules
const nudgeRules = [
  {
    condition: (user) => user.difficultyPreference === 'challenging' && hasNewChallenges,
    generate: () => ({
      type: 'preference_based',
      title: 'New Challenges Available!',
      message: 'We found 5 challenging lessons matching your preferences.',
      priority: 8,
    }),
  },
  {
    condition: (user) => user.deferredSetupItems.includes('community'),
    generate: () => ({
      type: 'incomplete_setup',
      title: 'Connect with Other Families',
      message: 'Setting up community preferences unlocks collaborative features.',
      priority: 5,
    }),
  },
];
```

### Display Locations

- **Dashboard** - Prominent cards on main view
- **Banner** - Top-of-page notification bar
- **Modal** - Focused attention for high-priority
- **Sidebar** - Persistent suggestion panel
- **Toast** - Transient notifications

---

## Component Reference

### `OnboardingProvider`
Context provider for onboarding state.

```tsx
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';

function App() {
  return (
    <OnboardingProvider>
      <AppRoutes />
    </OnboardingProvider>
  );
}
```

### `OnboardingWizard`
Main wizard component.

```tsx
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

<OnboardingWizard
  mode="full" // or "quick_start"
  onComplete={(data) => navigate('/parent')}
  onSkip={() => navigate('/parent')}
/>
```

### `QuickStartWizard`
Abbreviated onboarding flow.

```tsx
import { QuickStartWizard } from '@/components/onboarding/QuickStartWizard';

<QuickStartWizard
  onComplete={() => navigate('/child')}
/>
```

### `NudgeDisplay`
Renders AI nudges.

```tsx
import { NudgeDisplay } from '@/components/onboarding/NudgeDisplay';

<NudgeDisplay
  location="dashboard"
  maxNudges={3}
/>
```

---

## Hook Reference

### `useOnboardingWizard`
Manages wizard state and persistence.

```typescript
const {
  state,           // Current wizard state
  steps,           // Step definitions
  currentStepData, // Current step info
  progress,        // Completion percentage
  isLoading,       // Loading state
  isSaving,        // Save in progress
  updateFormData,  // Update form values
  nextStep,        // Advance wizard
  prevStep,        // Go back
  completeWizard,  // Finish and save
  skipWizard,      // Skip remaining
} = useOnboardingWizard({ mode: 'full' });
```

### `useAINudges`
Fetches and manages nudges.

```typescript
const {
  nudges,          // Active nudges
  isLoading,       // Loading state
  error,           // Error message
  fetchNudges,     // Refresh nudges
  recordImpression,// Track view
  dismissNudge,    // User dismisses
  completeNudge,   // User acts
  rateNudge,       // User feedback
} = useAINudges({ childId, location: 'dashboard' });
```

### `useOnboardingContext`
Access onboarding provider state.

```typescript
const {
  showParentOnboarding,
  setShowParentOnboarding,
  showChildOnboarding,
  setShowChildOnboarding,
  showFeatureTour,
  startFeatureTour,
  endFeatureTour,
} = useOnboardingContext();
```

---

## Implementation Status

### ✅ Phase 1: Data Model (Complete)
- [x] Database schema design
- [x] RLS policies
- [x] Type definitions

### ✅ Phase 2: Wizard Hooks (Complete)
- [x] `useOnboardingWizard` hook
- [x] `useAINudges` hook
- [x] Form state management

### 🚧 Phase 3: Quick Start Mode (In Progress)
- [x] Quick Start step definitions
- [ ] `QuickStartWizard` component
- [ ] Path selection UI
- [ ] Deferred setup prompts

### 📋 Phase 4: AI Nudges System (Planned)
- [ ] Nudge generation edge function
- [ ] `NudgeDisplay` component
- [ ] Impression tracking
- [ ] Feedback collection

### 📋 Phase 5: Tutorial Triggers (Planned)
- [ ] `useTutorialProgress` hook
- [ ] `TutorialOverlay` component
- [ ] Contextual trigger engine
- [ ] Resume functionality

---

## User Profile JSON Schema

Complete schema for onboarding user profile:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OnboardingUserProfile",
  "type": "object",
  "properties": {
    "userId": { "type": "string", "format": "uuid" },
    "onboardingMode": { "enum": ["full", "quick_start"] },
    "preferences": {
      "type": "object",
      "properties": {
        "preferredSubjects": { "type": "array", "items": { "type": "string" } },
        "difficultyPreference": { "enum": ["easy", "moderate", "challenging", "adaptive"] },
        "sessionLengthMinutes": { "type": "integer", "minimum": 5, "maximum": 120 },
        "learningStyle": { "enum": ["visual", "auditory", "kinesthetic", "reading", "balanced"] }
      }
    },
    "goals": {
      "type": "object",
      "properties": {
        "primaryGoal": { "enum": ["academic_growth", "emotional_intelligence", "life_skills", "balanced_development"] },
        "targetLessonsPerWeek": { "type": "integer", "minimum": 1, "maximum": 20 },
        "focusAreas": { "type": "array", "items": { "type": "string" } }
      }
    },
    "communitySettings": {
      "type": "object",
      "properties": {
        "communityInterest": { "enum": ["networking", "learning", "both", "minimal", "moderate"] },
        "shareProgressPublicly": { "type": "boolean" },
        "notificationFrequency": { "enum": ["realtime", "daily", "weekly", "minimal"] }
      }
    },
    "completionStatus": {
      "type": "object",
      "properties": {
        "wizardCompleted": { "type": "boolean" },
        "wizardCompletedAt": { "type": "string", "format": "date-time" },
        "quickStartCompleted": { "type": "boolean" },
        "deferredSetupItems": { "type": "array", "items": { "type": "string" } }
      }
    },
    "tutorialProgress": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tutorialId": { "type": "string" },
          "status": { "enum": ["not_started", "in_progress", "completed", "skipped"] },
          "completionPercentage": { "type": "number" }
        }
      }
    },
    "nudgeHistory": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "nudgeId": { "type": "string" },
          "nudgeType": { "type": "string" },
          "shownAt": { "type": "string", "format": "date-time" },
          "action": { "enum": ["dismissed", "clicked", "completed", "expired"] }
        }
      }
    }
  }
}
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [COMPONENTS.md](./COMPONENTS.md) - Component library
- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Developer setup
- [FEATURES_PLAN.md](./FEATURES_PLAN.md) - Feature roadmap

---

**Maintained by**: Inner Odyssey Team  
**Contact**: support@innerodyssey.com
