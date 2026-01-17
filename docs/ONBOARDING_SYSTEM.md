# Onboarding System Documentation

> **AI-Powered Adaptive Onboarding for Inner Odyssey K-12**

**Last Updated**: 2026-01-17  
**Status**: Phase 5 Complete ✅

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
10. [Usage Examples](#usage-examples)

---

## Overview

The Inner Odyssey onboarding system provides a multi-path, AI-enhanced experience that adapts to user preferences and behavior. It supports both comprehensive guided setup and quick-start options for users who prefer immediate access.

### Key Features

- **Multi-Path Onboarding**: Full wizard (7 steps) or Quick Start (4 steps)
- **Age-Adaptive Design**: K-2, 3-5, 6-8, 9-12 tier customization
- **AI-Driven Nudges**: Personalized suggestions based on behavior
- **Contextual Tutorials**: Feature discovery walkthroughs with spotlight effects
- **Progress Persistence**: Resume from any point
- **Deferred Setup**: Non-intrusive reminders to complete skipped steps

### Design Principles

1. **Respect User Time**: Quick Start for fast access, deferred setup later
2. **Progressive Disclosure**: Show complexity only when needed
3. **Celebrate Progress**: Gamified completion with rewards
4. **Non-Intrusive**: Dismissible nudges, skippable tutorials

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Onboarding System                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐                │
│  │    Wizard     │    │   Tutorial    │    │   AI Nudges   │                │
│  │    System     │    │    System     │    │    Engine     │                │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘                │
│          │                    │                    │                         │
│          ▼                    ▼                    ▼                         │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                   OnboardingProvider (Context)                   │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                               │                                              │
│         ┌─────────────────────┼─────────────────────┐                       │
│         ▼                     ▼                     ▼                       │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │useOnboarding│       │ useAINudges │       │ useTutorial │               │
│  │   Wizard    │       │             │       │  Progress   │               │
│  └─────────────┘       └─────────────┘       └─────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Supabase (Lovable Cloud)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  onboarding_preferences │ tutorial_progress │ ai_nudges │ feature_discovery │
└─────────────────────────────────────────────────────────────────────────────┘
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
| `status` | TEXT | not_started, in_progress, completed, skipped, deferred |
| `time_spent_seconds` | INT | Engagement metric |
| `steps_skipped` | INT | Skip count |
| `started_at` | TIMESTAMP | Start time |
| `completed_at` | TIMESTAMP | Completion time |

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
| `icon` | TEXT | Icon name (Lucide) |
| `priority` | INT | Display ordering (1-10) |
| `display_location` | TEXT | Where to show |
| `display_after` | TIMESTAMP | Scheduled display time |
| `expires_at` | TIMESTAMP | Auto-dismiss time |
| `dismissed_at` | TIMESTAMP | User dismissed |
| `completed_at` | TIMESTAMP | User acted |
| `clicked_at` | TIMESTAMP | User clicked action |
| `impressions_count` | INT | View counter |
| `max_impressions` | INT | View limit |
| `feedback_rating` | INT | User rating (1-5) |
| `confidence_score` | DECIMAL | AI confidence |
| `context_data` | JSONB | Additional context |
| `generated_by` | TEXT | 'rule_based' or 'ai' |

#### `feature_discovery_log`
Tracks feature usage for tutorial triggers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to auth.users |
| `child_id` | UUID | Optional child reference |
| `feature_id` | TEXT | Feature identifier |
| `feature_category` | TEXT | Category |
| `tutorial_triggered` | BOOLEAN | Was tutorial shown |
| `tutorial_completed` | BOOLEAN | Was tutorial finished |
| `discovered_at` | TIMESTAMP | Discovery time |

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

### Built-in Tutorials

**Parent Dashboard Tour**
```typescript
const PARENT_DASHBOARD_TUTORIAL = {
  id: 'parent_dashboard_tour',
  triggerCondition: { type: 'first_visit', route: '/parent' },
  steps: [
    { target: '[data-tutorial="child-selector"]', title: 'Switch Children' },
    { target: '[data-tutorial="progress-overview"]', title: 'Progress Overview' },
    { target: '[data-tutorial="weekly-goals"]', title: 'Weekly Goals' },
    { target: '[data-tutorial="rewards"]', title: 'Manage Rewards' },
  ],
};
```

**Child Lessons Tour**
```typescript
const CHILD_LESSONS_TUTORIAL = {
  id: 'child_lessons_tour',
  triggerCondition: { type: 'first_visit', route: '/lessons' },
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

### Nudge Generation

Nudges are generated by the `generate-nudges` edge function using:
1. **Rule-based logic** - Deterministic triggers for common scenarios
2. **AI-enhanced** - Personalized suggestions via Lovable AI Gateway

### Display Locations

- **Dashboard** - Prominent cards on main view
- **Banner** - Top-of-page notification bar
- **Modal** - Focused attention for high-priority
- **Sidebar** - Persistent suggestion panel
- **Toast** - Transient notifications

### Nudge Variants

| Variant | Use Case | Style |
|---------|----------|-------|
| `default` | Standard card display | Full card with icon, title, message, action |
| `compact` | Sidebar/list display | Icon + title + message in single row |
| `banner` | Page-top notifications | Full-width gradient banner |
| `minimal` | Inline suggestions | Icon + title button |

---

## Component Reference

### `OnboardingProvider`
Context provider for onboarding state.

```tsx
import { OnboardingProvider } from '@/components/onboarding';

function App() {
  return (
    <OnboardingProvider>
      <AppRoutes />
    </OnboardingProvider>
  );
}
```

### `QuickStartWizard`
Abbreviated 4-step onboarding flow.

```tsx
import { QuickStartWizard } from '@/components/onboarding';

<QuickStartWizard onComplete={() => navigate('/child')} />
```

### `OnboardingPathSelector`
Choose between full wizard and quick start.

```tsx
import { OnboardingPathSelector } from '@/components/onboarding';

<OnboardingPathSelector
  onSelectFull={() => setMode('full')}
  onSelectQuick={() => setMode('quick_start')}
/>
```

### `DeferredSetupBanner`
Reminds users to complete skipped setup steps.

```tsx
import { DeferredSetupBanner } from '@/components/onboarding';

<DeferredSetupBanner />
```

### `TutorialManager`
Coordinates contextual tutorials.

```tsx
import { TutorialManager } from '@/components/onboarding';

// Place in layout, auto-triggers tutorials based on route
<TutorialManager childId={childId} autoTrigger={true} />
```

### `TutorialOverlay`
Spotlight-style tutorial display.

```tsx
import { TutorialOverlay } from '@/components/onboarding';

<TutorialOverlay
  tutorial={config}
  currentStep={0}
  onNext={handleNext}
  onPrev={handlePrev}
  onSkip={handleSkip}
  onComplete={handleComplete}
/>
```

### `NudgeContainer`
Renders AI nudges for a specific location.

```tsx
import { NudgeContainer } from '@/components/nudges';

<NudgeContainer location="dashboard" childId={childId} maxNudges={3} />
```

### `NudgeBanner`
Full-width nudge banner.

```tsx
import { NudgeBanner } from '@/components/nudges';

<NudgeBanner childId={childId} variant="gradient" />
```

### `NudgeCard`
Individual nudge display.

```tsx
import { NudgeCard } from '@/components/nudges';

<NudgeCard
  nudge={nudge}
  variant="default"
  onDismiss={handleDismiss}
  onComplete={handleComplete}
  onRate={handleRate}
/>
```

### `NudgeModal`
High-priority nudge modal.

```tsx
import { NudgeModal } from '@/components/nudges';

<NudgeModal childId={childId} />
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
Fetches and manages nudges with optimistic updates.

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

### `useTutorialProgress`
Manages tutorial state and triggers.

```typescript
const {
  // State
  activeTutorial,     // Current tutorial config
  currentStep,        // Current step index
  isActive,           // Tutorial in progress
  progress,           // All progress records
  isLoading,          // Loading state
  
  // Current step info
  currentStepData,    // Current step details
  totalSteps,         // Total steps in tutorial
  progressPercentage, // Completion percentage
  
  // Actions
  startTutorial,      // Begin a tutorial
  nextStep,           // Advance step
  prevStep,           // Go back
  completeTutorial,   // Mark complete
  skipTutorial,       // Skip remaining
  deferTutorial,      // Defer for later
  resumeTutorial,     // Resume deferred
  triggerFeatureTutorial, // Trigger by feature ID
  
  // Utilities
  isTutorialCompleted, // Check completion
  getAvailableTutorials, // List available
  fetchProgress,       // Refresh data
} = useTutorialProgress({ childId, autoTrigger: true });
```

### `useNudgeGenerator`
Triggers AI nudge generation.

```typescript
const {
  generate,        // Trigger generation
  isGenerating,    // Generation in progress
  lastGenerated,   // Last generation time
} = useNudgeGenerator({ childId, autoGenerate: true });
```

### `useDeferredSetup`
Manages deferred setup reminders.

```typescript
const {
  deferredItems,   // Items to complete
  showBanner,      // Should show banner
  dismissBanner,   // Hide temporarily
  markComplete,    // Mark item done
} = useDeferredSetup();
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
- [x] Type definitions (`src/types/onboarding.ts`)

### ✅ Phase 2: Wizard Hooks (Complete)
- [x] `useOnboardingWizard` hook
- [x] Form state management
- [x] Progress persistence

### ✅ Phase 3: Quick Start Mode (Complete)
- [x] `QuickStartWizard` component
- [x] `OnboardingPathSelector` component
- [x] `DeferredSetupBanner` component
- [x] `useDeferredSetup` hook

### ✅ Phase 4: AI Nudges System (Complete)
- [x] `generate-nudges` edge function
- [x] `NudgeCard` component (multi-variant)
- [x] `NudgeContainer` component
- [x] `NudgeBanner` component
- [x] `NudgeModal` component
- [x] `useAINudges` hook with caching
- [x] `useNudgeGenerator` hook
- [x] Impression tracking
- [x] Feedback collection

### ✅ Phase 5: Tutorial Trigger System (Complete)
- [x] `useTutorialProgress` hook
- [x] `TutorialOverlay` component
- [x] `TutorialManager` component
- [x] Tutorial registry system
- [x] Contextual trigger engine
- [x] Route-based auto-triggering
- [x] Keyboard navigation support
- [x] Resume/defer functionality
- [x] Feature discovery logging

---

## Usage Examples

### Complete Dashboard Integration

```tsx
import { NudgeContainer, NudgeBanner } from '@/components/nudges';
import { TutorialManager, DeferredSetupBanner } from '@/components/onboarding';

function ParentDashboard({ childId }) {
  return (
    <>
      {/* Top banner nudge */}
      <NudgeBanner childId={childId} variant="gradient" />
      
      {/* Deferred setup reminder */}
      <DeferredSetupBanner />
      
      {/* Tutorial manager */}
      <TutorialManager childId={childId} />
      
      <div className="container">
        {/* Sidebar nudges */}
        <aside>
          <NudgeContainer 
            location="sidebar" 
            childId={childId}
            variant="compact"
            maxNudges={5}
          />
        </aside>
        
        {/* Main content */}
        <main>
          {/* Dashboard nudges */}
          <NudgeContainer 
            location="dashboard" 
            childId={childId}
            maxNudges={2}
          />
          {/* ... rest of dashboard */}
        </main>
      </div>
    </>
  );
}
```

### Custom Tutorial Registration

```tsx
import { registerTutorial } from '@/hooks/useTutorialProgress';

// Register a custom tutorial
registerTutorial({
  id: 'ai_tutor_intro',
  name: 'Meet Your AI Tutor',
  description: 'Learn how to use the AI tutor for homework help',
  isSkippable: true,
  canResumeLater: true,
  category: 'feature',
  triggerCondition: {
    type: 'feature_access',
    featureId: 'ai_tutor',
    delayMs: 2000,
  },
  steps: [
    {
      id: 'chat_input',
      targetSelector: '[data-tutorial="ai-chat-input"]',
      title: 'Ask a Question',
      description: 'Type your question here and the AI tutor will help!',
      placement: 'top',
    },
    // ... more steps
  ],
});
```

### Programmatic Tutorial Trigger

```tsx
import { useTutorialProgress } from '@/hooks/useTutorialProgress';

function AITutorButton() {
  const { triggerFeatureTutorial } = useTutorialProgress();
  
  const handleFirstUse = () => {
    // Trigger tutorial when feature is first accessed
    triggerFeatureTutorial('ai_tutor');
  };
  
  return <button onClick={handleFirstUse}>Open AI Tutor</button>;
}
```

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
          "status": { "enum": ["not_started", "in_progress", "completed", "skipped", "deferred"] },
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

## File Reference

### Components
- `src/components/onboarding/OnboardingProvider.tsx` - Context provider
- `src/components/onboarding/OnboardingTutorial.tsx` - Parent wizard
- `src/components/onboarding/ChildOnboardingTutorial.tsx` - Age-adaptive child wizard
- `src/components/onboarding/QuickStartWizard.tsx` - Quick start flow
- `src/components/onboarding/OnboardingPathSelector.tsx` - Path selection
- `src/components/onboarding/DeferredSetupBanner.tsx` - Setup reminder
- `src/components/onboarding/FeatureSpotlight.tsx` - Feature spotlight
- `src/components/onboarding/TutorialOverlay.tsx` - Tutorial display
- `src/components/onboarding/TutorialManager.tsx` - Tutorial coordinator
- `src/components/onboarding/HelpButton.tsx` - Help menu
- `src/components/nudges/NudgeCard.tsx` - Nudge display (multi-variant)
- `src/components/nudges/NudgeContainer.tsx` - Nudge list manager
- `src/components/nudges/NudgeBanner.tsx` - Banner nudge
- `src/components/nudges/NudgeModal.tsx` - Modal nudge

### Hooks
- `src/hooks/useOnboardingWizard.tsx` - Wizard state management
- `src/hooks/useAINudges.tsx` - Nudge fetching with caching
- `src/hooks/useNudgeGenerator.tsx` - Nudge generation trigger
- `src/hooks/useTutorialProgress.tsx` - Tutorial state management
- `src/hooks/useDeferredSetup.tsx` - Deferred setup tracking
- `src/hooks/useOnboarding.tsx` - Legacy onboarding hook

### Types
- `src/types/onboarding.ts` - Complete type definitions

### Edge Functions
- `supabase/functions/generate-nudges/index.ts` - AI nudge generation

---

**Document Version**: 5.0  
**Last Updated**: 2026-01-17  
**Next Review**: After user testing feedback
