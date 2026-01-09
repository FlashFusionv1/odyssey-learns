# Inner Odyssey - Component Library Documentation

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Total Components:** 100+

---

## Design System Foundation

### Brand Colors

```css
/* Core Brand Palette */
:root {
  /* Primary - Warm coral gradient for CTAs and highlights */
  --primary: 12 76% 61%;           /* #E57373 - Coral */
  --primary-foreground: 0 0% 100%; /* White */
  
  /* Secondary - Calming teal for balance */
  --secondary: 174 42% 65%;        /* #4DB6AC - Teal */
  --secondary-foreground: 0 0% 100%;
  
  /* Accent - Energetic amber for rewards */
  --accent: 45 100% 51%;           /* #FFC107 - Amber */
  --accent-foreground: 0 0% 0%;
  
  /* Backgrounds */
  --background: 0 0% 100%;         /* Pure white */
  --foreground: 222 47% 11%;       /* Near black */
  
  /* Muted - Subtle backgrounds */
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  
  /* Cards */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  
  /* Borders */
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 12 76% 61%;              /* Focus ring matches primary */
}
```

### Subject Colors

```css
/* Subject-Specific Colors */
--subject-math: 231 48% 48%;       /* #5C6BC0 - Indigo */
--subject-reading: 4 90% 58%;      /* #EF5350 - Red */
--subject-science: 122 39% 49%;    /* #66BB6A - Green */
--subject-social: 36 100% 50%;     /* #FFA000 - Orange */
--subject-emotional: 291 47% 51%;  /* #AB47BC - Purple */
--subject-life-skills: 199 98% 48%;/* #03A9F4 - Light Blue */
```

### Age-Tier Color Variations

```css
/* K-2 (Ages 5-7): Bright, nurturing */
.tier-k2 {
  --primary: 340 82% 52%;    /* #E91E63 - Pink */
  --secondary: 36 100% 50%;  /* #FF9800 - Orange */
  --background: 48 100% 96%; /* Warm cream */
}

/* 3-5 (Ages 8-10): Balanced, curious */
.tier-35 {
  --primary: 231 48% 48%;    /* #5C6BC0 - Indigo */
  --secondary: 174 42% 51%;  /* #26A69A - Teal */
  --background: 0 0% 98%;    /* Light gray */
}

/* 6-8 (Ages 11-13): Mature, sophisticated */
.tier-68 {
  --primary: 207 90% 54%;    /* #2196F3 - Blue */
  --secondary: 200 18% 46%;  /* #607D8B - Blue Gray */
  --background: 0 0% 100%;   /* Pure white */
}

/* 9-12 (Ages 14-18): Professional, academic */
.tier-912 {
  --primary: 212 80% 42%;    /* #1565C0 - Dark Blue */
  --secondary: 200 18% 26%;  /* #37474F - Slate */
  --background: 0 0% 100%;   /* Pure white */
}
```

### Typography Scale

```css
/* Font Families */
--font-display: 'Quicksand', sans-serif;  /* Headings */
--font-body: 'Open Sans', sans-serif;     /* Body text */
--font-mono: 'JetBrains Mono', monospace; /* Code/activities */

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System (8px Grid)

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Responsive Breakpoints

```css
/* Tailwind Breakpoints */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */
```

---

## Component Catalog

### Layout Components

#### AppLayout
Main application wrapper with navigation and content area.

```tsx
import { AppLayout } from "@/components/layout/AppLayout";

// Props
interface AppLayoutProps {
  children: React.ReactNode;
}

// Usage
<AppLayout>
  <ChildDashboard />
</AppLayout>
```

#### ParentLayout
Specialized layout for parent dashboard views.

```tsx
import { ParentLayout } from "@/components/layout/ParentLayout";

// Features
// - Sidebar navigation
// - Child selector
// - Notification bell
// - Settings access
```

#### AgeAdaptiveNav
Navigation that adapts based on child's grade level.

```tsx
import { AgeAdaptiveNav } from "@/components/layout/AgeAdaptiveNav";

// Adaptations by tier:
// K-2: Bottom nav, 3-4 large icons, always visible labels
// 3-5: Top nav, 5-7 items, icon + text
// 6-8: Sidebar, collapsible, breadcrumbs
// 9-12: Full sidebar, shortcuts, keyboard nav
```

#### MobileOptimized
Wrapper for mobile-responsive layouts.

```tsx
import { MobileOptimized } from "@/components/layout/MobileOptimized";

// Features
// - Touch-optimized spacing
// - Swipe gestures
// - Bottom sheet patterns
// - Safe area handling
```

### Authentication Components

#### LoginForm
Email/password login with validation.

```tsx
import { LoginForm } from "@/components/auth/LoginForm";

// Features
// - Email validation
// - Password visibility toggle
// - "Remember me" option
// - Forgot password link
// - reCAPTCHA integration
// - Error handling
```

#### SignupForm
Registration form with COPPA consent.

```tsx
import { SignupForm } from "@/components/auth/SignupForm";

// Features
// - Email validation
// - Password strength meter (zxcvbn)
// - Age verification (birth year)
// - COPPA consent checkbox
// - Terms acceptance
// - Google OAuth option
```

#### PasswordStrengthMeter
Visual password strength indicator.

```tsx
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

// Props
interface PasswordStrengthMeterProps {
  password: string;
}

// Display
// - 5-bar strength indicator
// - Color coding (red → green)
// - Strength label (Weak → Very Strong)
// - Improvement suggestions
```

#### ChildSelector
Switch between child profiles.

```tsx
import { ChildSelector } from "@/components/auth/ChildSelector";

// Features
// - Avatar display
// - Name and grade
// - PIN entry (if enabled)
// - Add child option
```

#### SessionTimeoutProvider
Manages idle session timeout.

```tsx
import { SessionTimeoutProvider } from "@/components/auth/SessionTimeoutProvider";

// Configuration
// - 30 minute idle timeout
// - 5 minute warning modal
// - Activity detection (clicks, keys, scroll)
// - Graceful logout
```

### Learning Components

#### LessonCard
Card display for lesson previews.

```tsx
import { LessonCard } from "@/components/learning/LessonCard";

interface LessonCardProps {
  lesson: Lesson;
  onStart: () => void;
  showProgress?: boolean;
}

// Displays
// - Thumbnail image
// - Title and description
// - Subject badge
// - Duration estimate
// - Points value
// - Progress indicator (if started)
```

#### CustomLessonGenerator
AI lesson creation interface.

```tsx
import { CustomLessonGenerator } from "@/components/learning/CustomLessonGenerator";

// Flow
// 1. Topic input with suggestions
// 2. Subject selection (optional)
// 3. Generate button with loading
// 4. Preview and submit for approval
// 5. Token usage display
```

#### SafeMarkdown
Secure markdown renderer with sanitization.

```tsx
import { SafeMarkdown } from "@/components/learning/SafeMarkdown";

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

// Security
// - DOMPurify sanitization
// - XSS prevention
// - Allowed tags whitelist
// - Safe link handling
```

#### DigitalNotebook
Note-taking during lessons.

```tsx
import { DigitalNotebook } from "@/components/learning/DigitalNotebook";

interface DigitalNotebookProps {
  lessonId: string;
  childId: string;
}

// Features
// - Rich text editor
// - Auto-save
// - Highlight colors
// - Export options
```

#### LessonActionButtons
Action buttons for lesson interactions.

```tsx
import { LessonActionButtons } from "@/components/learning/LessonActionButtons";

// Buttons
// - Start/Resume lesson
// - Save to library
// - Share with peer
// - Report issue
```

### Gamification Components

#### BadgeShowcase
Display earned and locked badges.

```tsx
import { BadgeShowcase } from "@/components/badges/BadgeShowcase";

interface BadgeShowcaseProps {
  childId: string;
  showLocked?: boolean;
}

// Display
// - Categorized badge grid
// - Earned badges with glow effect
// - Locked badges with criteria tooltip
// - Tier indicators (bronze/silver/gold)
// - Unlock animations
```

#### CelebrationModal
Full-screen celebration for achievements.

```tsx
import { CelebrationModal } from "@/components/celebration/CelebrationModal";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement;
  childTier: AgeTier;
}

// Effects (age-adaptive)
// K-2: Confetti explosion, character dance, sound
// 3-5: Badge animation, points counter, sparkles
// 6-8: Toast notification, badge glow, subtle confetti
// 9-12: Professional banner, portfolio update
```

#### PointCounter
Animated points display.

```tsx
import { PointCounter } from "@/components/ui/point-counter";

interface PointCounterProps {
  points: number;
  animate?: boolean;
}

// Features
// - Count-up animation
// - Sparkle effect on change
// - Compact and expanded modes
```

#### ProgressBar
Visual progress indicator.

```tsx
import { ProgressBar } from "@/components/ui/progress-bar";

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
}
```

#### StreakTracker
Daily streak display with flame animation.

```tsx
import { StreakTracker } from "@/components/gamification/StreakTracker";

interface StreakTrackerProps {
  streak: number;
  lastActivity: Date;
}

// Features
// - Animated flame icon
// - Milestone indicators (7, 30, 100)
// - Freeze status
// - Time until reset
```

#### DailyQuest
Today's personalized quest display.

```tsx
import { DailyQuest } from "@/components/quests/DailyQuest";

// Variants by tier
// K2Quest: Simple, colorful, 3 activities
// Elementary35Quest: Game-like, achievement focus
// Middle68Quest: Challenge hub, team options
// High912Quest: Project-based, portfolio
```

### Parent Dashboard Components

#### AIInsights
AI-generated learning insights.

```tsx
import { AIInsights } from "@/components/parent/AIInsights";

interface AIInsightsProps {
  childId: string;
}

// Sections
// - Summary paragraph
// - Strengths (top 3)
// - Growth areas (top 2)
// - Recommendations
// - Conversation starters
```

#### ParentChildMessaging
In-app messaging interface.

```tsx
import { ParentChildMessaging } from "@/components/parent/ParentChildMessaging";

// Features
// - Message thread display
// - Quick reactions
// - Message types (encouragement, question)
// - Important flag
// - Read receipts
// - Real-time updates
```

#### WeeklyReportCard
Weekly progress summary.

```tsx
import { WeeklyReportCard } from "@/components/parent/WeeklyReportCard";

// Displays
// - Lessons completed
// - Points earned
// - Top achievement
// - Strongest subject
// - Growth area
// - Trend charts
```

#### ScreenTimeTracker
Screen time monitoring and controls.

```tsx
import { ScreenTimeTracker } from "@/components/parent/ScreenTimeTracker";

// Features
// - Daily usage graph
// - Limit configuration
// - Time windows
// - Pause controls
// - Override options
```

#### RewardManagement
Parent reward configuration.

```tsx
import { RewardManagement } from "@/components/parent/RewardManagement";

// Features
// - Create rewards
// - Set point costs
// - Activate/deactivate
// - View redemption history
```

#### BonusLessonManager
Grant additional lesson tokens.

```tsx
import { BonusLessonManager } from "@/components/parent/BonusLessonManager";

// Features
// - Current token balance
// - Grant tokens button
// - Usage history
```

### Social Components

#### PeerConnections
Manage peer friendships.

```tsx
import { PeerConnections } from "@/components/social/PeerConnections";

// Features
// - Friend list
// - Pending requests
// - Send invite
// - Parent approval status
```

#### SharedActivities
Collaborative activity hub.

```tsx
import { SharedActivities } from "@/components/social/SharedActivities";

// Features
// - Active activities
// - Join activity
// - Create new
// - Participant list
```

#### CollaborativeActivity
Real-time collaboration interface.

```tsx
import { CollaborativeActivity } from "@/components/learning/CollaborativeActivity";

// Features
// - Presence indicators
// - Shared progress
// - Turn-based or simultaneous
// - Chat sidebar
```

### Emotional Intelligence Components

#### EmotionCheckIn
Daily mood logging.

```tsx
import { EmotionCheckIn } from "@/components/emotional/EmotionCheckIn";

// Features
// - Emotion picker (emoji-based for K-2, wheel for older)
// - Intensity slider (1-5)
// - Optional trigger input
// - Coping strategy suggestions
// - Private/encrypted storage
```

### Admin Components

#### ContentReviewDashboard
Lesson review queue.

```tsx
import { ContentReviewDashboard } from "@/components/admin/ContentReviewDashboard";

// Features
// - Pending queue with priority
// - Multi-criteria scoring
// - Bulk actions
// - Assignment tracking
// - Quality metrics
```

#### BatchLessonGenerator
Bulk AI lesson creation.

```tsx
import { BatchLessonGenerator } from "@/components/admin/BatchLessonGenerator";

// Features
// - Subject/grade selection
// - Quantity input (max 25)
// - Progress tracking
// - Auto-queue for review
```

### UI Primitive Components

Inner Odyssey uses shadcn/ui as the foundation with custom variants.

#### Button

```tsx
import { Button } from "@/components/ui/button";

// Variants
// - default: Primary action
// - secondary: Secondary action
// - outline: Tertiary action
// - ghost: Subtle action
// - destructive: Danger action
// - link: Text link style

// Sizes
// - sm: 32px height
// - default: 40px height
// - lg: 48px height
// - icon: Square icon button

// States
// - loading: Spinner + disabled
// - disabled: Reduced opacity
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Variants
// - default: Standard elevation
// - elevated: Higher shadow
// - flat: No shadow
// - interactive: Hover effects
```

#### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

// Features
// - Focus trap
// - Escape to close
// - Click outside to close
// - Animated open/close
```

#### Toast

```tsx
import { toast } from "@/hooks/use-toast";

// Usage
toast({
  title: "Success!",
  description: "Your changes have been saved.",
  variant: "default" // | "destructive"
});

// Also available via Sonner
import { toast } from "sonner";
toast.success("Saved!");
```

#### Form Components

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup } from "@/components/ui/radio-group";
```

---

## Animation Patterns

### Transition Timings by Age Tier

```css
/* K-2: Generous, bouncy */
.tier-k2 {
  --transition-duration: 500ms;
  --transition-timing: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 3-5: Moderate, smooth */
.tier-35 {
  --transition-duration: 300ms;
  --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 6-8: Quick, subtle */
.tier-68 {
  --transition-duration: 200ms;
  --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 9-12: Fast, minimal */
.tier-912 {
  --transition-duration: 150ms;
  --transition-timing: ease-out;
}
```

### Framer Motion Variants

```tsx
// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Card hover
const cardVariants = {
  rest: { scale: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
};

// Badge unlock
const badgeVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

// Confetti celebration
const confettiConfig = {
  numberOfPieces: 200,
  gravity: 0.3,
  colors: ['#E57373', '#4DB6AC', '#FFC107', '#66BB6A', '#5C6BC0']
};
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Guidelines

### Focus Management

```css
/* Focus indicators */
:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 1rem;
  background: hsl(var(--background));
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Patterns

```tsx
// Live regions for announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>

// Loading states
<button disabled aria-busy="true">
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span>Loading...</span>
</button>

// Progress
<div 
  role="progressbar" 
  aria-valuenow={progress} 
  aria-valuemin={0} 
  aria-valuemax={100}
  aria-label="Lesson progress"
>
  {progress}%
</div>
```

### Screen Reader Classes

```css
/* Visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Show on focus for skip links */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Color Contrast

All color combinations meet WCAG 2.1 AA requirements:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

---

## Component Usage Examples

### Complete Login Page

```tsx
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthHeader 
        title="Welcome Back!" 
        subtitle="Log in to continue your learning adventure"
      />
      <LoginForm />
    </AuthLayout>
  );
}
```

### Complete Child Dashboard

```tsx
import { AppLayout } from "@/components/layout/AppLayout";
import { DailyQuest } from "@/components/quests/DailyQuest";
import { BadgeShowcase } from "@/components/badges/BadgeShowcase";
import { StreakTracker } from "@/components/gamification/StreakTracker";
import { EmotionCheckIn } from "@/components/emotional/EmotionCheckIn";

export default function ChildDashboard() {
  const { child } = useValidatedChild();
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <header className="flex justify-between items-center">
          <h1>Welcome, {child.name}!</h1>
          <StreakTracker streak={child.streak} />
        </header>
        
        <EmotionCheckIn childId={child.id} />
        
        <section>
          <h2>Today's Quest</h2>
          <DailyQuest childId={child.id} tier={getAgeTier(child.grade_level)} />
        </section>
        
        <section>
          <h2>Your Badges</h2>
          <BadgeShowcase childId={child.id} showLocked={false} />
        </section>
      </div>
    </AppLayout>
  );
}
```

---

*This component library documentation serves as the reference for all UI development in Inner Odyssey. All new components should follow these patterns and design tokens.*
