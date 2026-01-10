# Component Library Reference

## Overview
This document catalogs all React components in Inner Odyssey, organized by category with usage examples, props, and best practices.

**Component Count:** 100+ components  
**UI Framework:** shadcn/ui + Radix UI  
**Styling:** Tailwind CSS with semantic tokens  
**Icons:** Lucide React

---

## Component Categories

### 1. Layout Components
### 2. Authentication Components
### 3. Learning Components
### 4. Gamification Components
### 5. Social Components
### 6. Parent Dashboard Components
### 7. Admin Components
### 8. UI Primitives (shadcn/ui)

---

## 1. LAYOUT COMPONENTS

### AppLayout
**Path:** `src/components/layout/AppLayout.tsx`  
**Purpose:** Main application wrapper with navigation

**Props:**
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}
```

**Usage:**
```tsx
<AppLayout>
  <ChildDashboard />
</AppLayout>
```

**Features:**
- Responsive navigation
- Age-adaptive nav based on grade level
- Offline indicator integration
- Health status monitoring

---

### ParentLayout
**Path:** `src/components/layout/ParentLayout.tsx`  
**Purpose:** Parent portal wrapper

**Props:**
```typescript
interface ParentLayoutProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<ParentLayout>
  <ParentDashboard />
</ParentLayout>
```

**Features:**
- Parent-specific navigation
- Notification bell integration
- Child selector integration

---

### AgeAdaptiveNav
**Path:** `src/components/layout/AgeAdaptiveNav.tsx`  
**Purpose:** Navigation that adapts to child's grade level

**Props:**
```typescript
interface AgeAdaptiveNavProps {
  gradeLevel: number;
}
```

**Behavior:**
- **K-2:** Large icons, 3-4 items, simple labels
- **3-5:** Medium icons, 5-7 items, categories
- **6-8:** Standard icons, 7+ items, compact
- **9-12:** Text-primary, dense layout

**Usage:**
```tsx
<AgeAdaptiveNav gradeLevel={child.grade_level} />
```

---

### Navigation
**Path:** `src/components/layout/Navigation.tsx`  
**Purpose:** Main navigation component

**Features:**
- Desktop sidebar
- Mobile bottom navigation
- Active route highlighting
- Role-based menu items

---

### TopBar
**Path:** `src/components/layout/TopBar.tsx`  
**Purpose:** Top application bar

**Contents:**
- User avatar
- Notification bell
- Points display
- Settings menu

---

### MobileOptimized
**Path:** `src/components/layout/MobileOptimized.tsx`  
**Purpose:** Mobile-first responsive wrapper

**Features:**
- Touch-optimized hit targets (44px minimum)
- Swipe gestures
- Bottom sheet modals on mobile
- Responsive breakpoints

---

## 2. AUTHENTICATION COMPONENTS

### LoginForm
**Path:** `src/components/auth/LoginForm.tsx`  
**Purpose:** Email/password login

**Props:**
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
}
```

**Features:**
- reCAPTCHA integration
- Rate limiting (5 attempts/15min)
- Password visibility toggle
- Error handling with user-friendly messages

**Usage:**
```tsx
<LoginForm onSuccess={() => navigate('/dashboard')} />
```

**Form Schema:**
```typescript
{
  email: z.string().email(),
  password: z.string().min(8)
}
```

---

### SignupForm
**Path:** `src/components/auth/SignupForm.tsx`  
**Purpose:** Parent account registration

**Features:**
- reCAPTCHA protection
- Password strength meter
- Email validation
- COPPA consent checkbox

**Usage:**
```tsx
<SignupForm onSuccess={() => navigate('/parent-setup')} />
```

**Validation:**
- Email: Must be valid format
- Password: ≥8 chars, 1 uppercase, 1 number, 1 special char
- Full name: Required
- COPPA consent: Required checkbox

---

### PasswordStrengthMeter
**Path:** `src/components/auth/PasswordStrengthMeter.tsx`  
**Purpose:** Visual password strength indicator

**Props:**
```typescript
interface PasswordStrengthMeterProps {
  password: string;
}
```

**Usage:**
```tsx
<PasswordStrengthMeter password={password} />
```

**Strength Levels:**
- Weak: Red (< 40)
- Fair: Orange (40-60)
- Good: Yellow (60-80)
- Strong: Green (≥80)

**Algorithm:** Uses `zxcvbn` library

---

### ChildSelector
**Path:** `src/components/auth/ChildSelector.tsx`  
**Purpose:** Switch between children (parent view)

**Features:**
- Dropdown menu with child avatars
- Quick add child button
- Validates child ownership server-side

**Usage:**
```tsx
<ChildSelector onChildSelect={(childId) => setSelectedChild(childId)} />
```

**Security:**
- Uses `useValidatedChild()` hook
- Server-side RLS validation
- Clears invalid selections

---

## 3. LEARNING COMPONENTS

### CustomLessonGenerator
**Path:** `src/components/learning/CustomLessonGenerator.tsx`  
**Purpose:** AI-powered custom lesson creator

**Features:**
- Topic input with validation
- Subject selector (math, science, reading, etc.)
- Grade level auto-filled
- Daily quota display (3/day)
- Content moderation

**Usage:**
```tsx
<CustomLessonGenerator childId={childId} />
```

**Quota Enforcement:**
```typescript
const { customLessonsRemaining, loading } = usePlatformLessonQuota(childId);

if (customLessonsRemaining <= 0) {
  return <QuotaExceededMessage />;
}
```

**AI Generation:**
- Calls `generate-custom-lesson` edge function
- Uses Lovable AI (gemini-2.5-pro)
- Content moderation pre-check
- Parent approval workflow

---

### LessonActionButtons
**Path:** `src/components/learning/LessonActionButtons.tsx`  
**Purpose:** Save and share lesson actions

**Props:**
```typescript
interface LessonActionButtonsProps {
  lessonId: string;
  childId: string;
}
```

**Features:**
- Save to favorites
- Share lesson (copy link)
- Analytics tracking

**Usage:**
```tsx
<LessonActionButtons lessonId={lesson.id} childId={childId} />
```

---

### ReportLessonButton
**Path:** `src/components/learning/ReportLessonButton.tsx`  
**Purpose:** Flag inappropriate content

**Props:**
```typescript
interface ReportLessonButtonProps {
  lessonId: string;
}
```

**Features:**
- Single-click report
- Auto-hide after 3 flags
- Prevents duplicate reports
- Updates `flagged_count` in database

**Usage:**
```tsx
<ReportLessonButton lessonId={lesson.id} />
```

---

### SafeMarkdown
**Path:** `src/components/learning/SafeMarkdown.tsx`  
**Purpose:** Render sanitized markdown content

**Props:**
```typescript
interface SafeMarkdownProps {
  content: string;
  className?: string;
}
```

**Features:**
- XSS protection (DOMPurify)
- GitHub-flavored markdown (remark-gfm)
- Link sanitization
- Image lazy loading

**Usage:**
```tsx
<SafeMarkdown content={lesson.content_markdown} />
```

**Security:**
- Removes `<script>` tags
- Sanitizes URLs (blocks javascript:, data:)
- Allows safe HTML tags only

---

### DigitalNotebook
**Path:** `src/components/learning/DigitalNotebook.tsx`  
**Purpose:** Student note-taking for lessons

**Props:**
```typescript
interface DigitalNotebookProps {
  lessonId: string;
  childId: string;
}
```

**Features:**
- Auto-save notes (debounced 2s)
- Markdown support
- Persistent storage (lesson_notes table)

**Usage:**
```tsx
<DigitalNotebook lessonId={lesson.id} childId={childId} />
```

---

### ShareLessonModal
**Path:** `src/components/learning/ShareLessonModal.tsx`  
**Purpose:** Request parent approval to share lesson publicly

**Props:**
```typescript
interface ShareLessonModalProps {
  lessonId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**Workflow:**
1. Child requests to share
2. Modal explains review process
3. Calls `request-lesson-share` edge function
4. Updates lesson `share_status` to 'pending_approval'
5. Parent approves/rejects in dashboard

---

### ChallengeModeToggle
**Path:** `src/components/learning/ChallengeModeToggle.tsx`  
**Purpose:** Enable harder difficulty for advanced students

**Props:**
```typescript
interface ChallengeModeToggleProps {
  childId: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}
```

**Features:**
- Persisted in database (children.challenge_mode_enabled)
- Adjusts lesson difficulty
- Bonus points for challenge mode

---

### RequestShareButton
**Path:** `src/components/learning/RequestShareButton.tsx`  
**Purpose:** Request to share custom lesson

**Props:**
```typescript
interface RequestShareButtonProps {
  lessonId: string;
}
```

**Features:**
- Opens ShareLessonModal
- Shows current share status
- Disabled if already pending/public

---

### CollaborativeActivity
**Path:** `src/components/learning/CollaborativeActivity.tsx`  
**Purpose:** Multi-child learning activities

**Features:**
- Real-time collaboration
- Max 4 participants
- Activity types: quiz, discussion, project
- Parent approval required

---

## 4. GAMIFICATION COMPONENTS

### Leaderboard
**Path:** `src/components/gamification/Leaderboard.tsx`  
**Purpose:** Age-adaptive competitive/collaborative ranking

**Props:**
```typescript
interface LeaderboardProps {
  childId: string;
  gradeLevel: number;
}
```

**Age-Adaptive Behavior:**
- **K-2:** Personal progress celebration (no competitive board)
- **Grades 3-5:** Opt-in class leaderboard with avatar privacy
- **Grades 6-8:** Multiple categories (Top Learners, Most Improved, Most Helpful, Streak)
- **Grades 9-12:** Full leaderboard with privacy toggle

**Features:**
- Privacy controls (hide leaderboard option)
- Multiple ranking categories
- Avatar-only display for younger grades
- Celebration of personal growth over competition for K-2

**Usage:**
```tsx
<Leaderboard childId={childId} gradeLevel={child.grade_level} />
```

---

### BadgeShowcase
**Path:** `src/components/badges/BadgeShowcase.tsx`  
**Purpose:** Display earned badges

**Props:**
```typescript
interface BadgeShowcaseProps {
  childId: string;
}
```

**Features:**
- Grid layout of badges
- Locked/unlocked states
- Progress bars for in-progress badges
- Unlock animations
- Badge details on hover/click

**Usage:**
```tsx
<BadgeShowcase childId={childId} />
```

**Badge Categories:**
- Academic (reading, math, science)
- Social (collaboration, friendship)
- Streak (7-day, 30-day, 100-day)
- Creator (lesson sharing)

---

### CelebrationModal
**Path:** `src/components/celebration/CelebrationModal.tsx`  
**Purpose:** Full-screen celebration on achievements

**Props:**
```typescript
interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    points: number;
    icon?: string;
  };
}
```

**Features:**
- Confetti animation (react-confetti)
- Sound effects (success.mp3)
- Auto-close after 5 seconds
- Dismissible with close button

**Usage:**
```tsx
<CelebrationModal
  isOpen={showCelebration}
  onClose={() => setShowCelebration(false)}
  achievement={{
    title: "First Lesson Complete!",
    description: "You earned 50 points",
    points: 50
  }}
/>
```

---

### LessonTokenDisplay
**Path:** `src/components/gamification/LessonTokenDisplay.tsx`  
**Purpose:** Show available lesson tokens

**Props:**
```typescript
interface LessonTokenDisplayProps {
  childId: string;
}
```

**Features:**
- Real-time token count
- Animated coin icon
- Tooltip explaining token usage
- Gradients for visual appeal

**Usage:**
```tsx
<LessonTokenDisplay childId={childId} />
```

---

### StreakTracker
**Path:** `src/components/gamification/StreakTracker.tsx`  
**Purpose:** Daily activity streak display

**Features:**
- Animated flame icon
- Current streak count
- Milestone celebrations (7, 30, 100 days)
- Streak freeze indicator

---

### PointsDisplay
**Path:** `src/components/gamification/PointsDisplay.tsx`  
**Purpose:** Show total points earned

**Features:**
- Animated counter
- Recent point gains tooltip
- Level progress bar

---

## 5. ONBOARDING COMPONENTS

### ChildOnboardingTutorial
**Path:** `src/components/onboarding/ChildOnboardingTutorial.tsx`  
**Purpose:** Age-adaptive interactive tutorial for children

**Props:**
```typescript
interface ChildOnboardingTutorialProps {
  gradeLevel: number;
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}
```

**Age-Adaptive Content:**
- **K-2:** Simple language, large visuals, encouraging mascot
- **Grades 3-5:** Balanced text and images, achievement focus
- **Grades 6-8:** More detailed explanations, feature discovery
- **Grades 9-12:** Concise, efficiency-focused, quick tips

**Features:**
- Multi-step wizard with progress indicators
- Age-appropriate animations
- Skip option for returning users
- Persistent state to prevent re-showing

---

### FeatureSpotlight
**Path:** `src/components/onboarding/FeatureSpotlight.tsx`  
**Purpose:** Highlight UI elements with contextual guidance

**Props:**
```typescript
interface FeatureSpotlightProps {
  steps: SpotlightStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}
```

**Features:**
- DOM element targeting via `data-tour` attributes
- Spotlight overlay with tooltip
- Next/Previous navigation
- Progress indicator
- Auto-positioning

**Usage:**
```tsx
<FeatureSpotlight
  steps={CHILD_FEATURE_TOUR_STEPS}
  isActive={showTour}
  onComplete={() => setShowTour(false)}
  onSkip={() => setShowTour(false)}
/>
```

---

### OnboardingProvider
**Path:** `src/components/onboarding/OnboardingProvider.tsx`  
**Purpose:** Context provider for onboarding state

**Features:**
- Manages tutorial completion state
- Tracks feature tour progress
- Supports parent and child flows
- Persists to Supabase (parents) or localStorage (children)

**Usage:**
```tsx
<OnboardingProvider>
  <App />
</OnboardingProvider>
```

---

### HelpButton
**Path:** `src/components/onboarding/HelpButton.tsx`  
**Purpose:** Floating help access button

**Props:**
```typescript
interface HelpButtonProps {
  onRestartTutorial: () => void;
  onStartFeatureTour: () => void;
  onOpenFeedback?: () => void;
  variant?: 'parent' | 'child';
  gradeLevel?: number;
}
```

**Features:**
- Dropdown menu with help options
- Restart tutorial action
- Feature tour trigger
- Help center link (parents)
- Feedback widget access
- "What's New" section

**Age-Adaptive Sizing:**
- K-2: Extra large button (56px) for easier tapping
- 3-12: Standard size (48px)

---

## 6. PROGRESS & ANALYTICS COMPONENTS

### SubjectProgressChart
**Path:** `src/components/progress/SubjectProgressChart.tsx`  
**Purpose:** Pie chart of learning by subject

**Props:**
```typescript
interface SubjectProgressChartProps {
  data: SubjectData[];
}
```

**Features:**
- Interactive pie chart (Recharts)
- Subject color coding
- Percentage labels
- Responsive sizing

---

### ActivityTrendChart
**Path:** `src/components/progress/ActivityTrendChart.tsx`  
**Purpose:** Daily activity trend area chart

**Props:**
```typescript
interface ActivityTrendChartProps {
  data: DailyActivity[];
}
```

**Features:**
- 7/14/30 day views
- Area chart with gradient fill
- Tooltip with daily details
- Responsive design

---

### SkillMasteryGrid
**Path:** `src/components/progress/SkillMasteryGrid.tsx`  
**Purpose:** Visual grid of skill mastery progress

**Props:**
```typescript
interface SkillMasteryGridProps {
  skills: SkillData[];
}
```

**Features:**
- Card grid layout
- Progress ring per skill
- Mastery level indicators
- Subject icons

---

### AchievementTimeline
**Path:** `src/components/progress/AchievementTimeline.tsx`  
**Purpose:** Chronological achievement display

**Props:**
```typescript
interface AchievementTimelineProps {
  achievements: Achievement[];
}
```

**Features:**
- Vertical timeline layout
- Badge icons with dates
- Recent achievements first
- Expandable details

---

### EngagementOverview
**Path:** `src/components/progress/EngagementOverview.tsx`  
**Purpose:** Key engagement metrics summary

**Props:**
```typescript
interface EngagementOverviewProps {
  stats: EngagementStats;
}
```

**Features:**
- Stat cards (streak, points, lessons, badges)
- Progress rings
- Trend indicators
- Responsive grid

---

## 7. SOCIAL COMPONENTS

### PeerConnections
**Path:** `src/components/social/PeerConnections.tsx`  
**Purpose:** Manage child friendships

**Features:**
- Send connection requests
- Accept/reject requests
- View connected peers
- Parent approval required

---

### PeerConnectionsUI
**Path:** `src/components/social/PeerConnectionsUI.tsx`  
**Purpose:** UI for peer connections

**Features:**
- Search for peers by name
- Connection request list
- Connected peers grid
- Block user option

---

### SharedActivities
**Path:** `src/components/social/SharedActivities.tsx`  
**Purpose:** Group learning activities

**Features:**
- Create new activities
- Join existing activities
- Activity type selector (quiz, discussion, project)
- Max 4 participants
- Activity status tracking

---

### SharedActivitiesUI
**Path:** `src/components/social/SharedActivitiesUI.tsx`  
**Purpose:** UI for shared activities

**Features:**
- Activity cards grid
- Filter by status (open, in_progress, completed)
- Join button (if space available)
- Leave activity button

---

## 6. PARENT DASHBOARD COMPONENTS

### AIInsights
**Path:** `src/components/parent/AIInsights.tsx`  
**Purpose:** AI-generated parent insights

**Features:**
- Calls `ai-insights` edge function
- Personalized recommendations
- Recent activity summary
- Emotional state analysis
- Subject strengths/weaknesses

**Usage:**
```tsx
<AIInsights childId={selectedChild} />
```

**AI Model:** google/gemini-2.5-pro (Lovable AI)

---

### ParentChildMessaging
**Path:** `src/components/parent/ParentChildMessaging.tsx`  
**Purpose:** In-app parent-child chat

**Features:**
- Real-time messaging
- Read receipts
- Emoji reactions
- Important message pins
- Message history

**Security:**
- Logged to `security_access_log`
- Parent-child only (no external users)

---

### WeeklyReportCard
**Path:** `src/components/parent/WeeklyReportCard.tsx`  
**Purpose:** Display weekly progress summary

**Features:**
- Lessons completed this week
- Points earned
- Strongest subject
- Growth areas
- Conversation starters

**Data Source:** `parent_weekly_reports` table

---

### ScreenTimeTracker
**Path:** `src/components/parent/ScreenTimeTracker.tsx`  
**Purpose:** Monitor daily screen time

**Features:**
- Daily time usage chart
- Set time limits
- Override limits (bonus time)
- Weekly averages
- Activity breakdown

**Enforcement:**
- Soft limits (warnings)
- Hard limits (block access)
- Parent PIN bypass

---

### RewardManagement
**Path:** `src/components/parent/RewardManagement.tsx`  
**Purpose:** Create custom rewards

**Features:**
- Add/edit/delete rewards
- Set point costs
- Activate/deactivate rewards
- Redemption history

**Usage:**
```tsx
<RewardManagement parentId={user.id} />
```

---

### RewardRedemptions
**Path:** `src/components/parent/RewardRedemptions.tsx`  
**Purpose:** Manage child reward requests

**Features:**
- Pending redemptions list
- Approve/reject buttons
- Add parent notes
- Mark as fulfilled
- Redemption history

---

### BonusLessonManager
**Path:** `src/components/parent/BonusLessonManager.tsx`  
**Purpose:** Grant extra daily lessons

**Features:**
- View daily quota status
- Grant bonus lessons (1-5)
- Reset daily quota
- Quota history

**Usage:**
```tsx
<BonusLessonManager childId={selectedChild} />
```

---

### PendingShareApprovals
**Path:** `src/components/parent/PendingShareApprovals.tsx`  
**Purpose:** Review child's lesson share requests

**Features:**
- Pending lessons list
- Preview lesson content
- Approve/reject buttons
- Rejection reason input
- Auto-notification on decision

---

## 7. ADMIN COMPONENTS

### BatchLessonGenerator
**Path:** `src/components/admin/BatchLessonGenerator.tsx`  
**Purpose:** Generate multiple lessons at once

**Props:**
```typescript
interface BatchLessonGeneratorProps {
  onComplete?: () => void;
}
```

**Features:**
- Bulk lesson generation
- Grade level selector
- Subject selector
- Lesson count input
- Progress tracking

**Usage:**
```tsx
<BatchLessonGenerator onComplete={() => toast.success('Lessons generated')} />
```

---

### ContentReviewDashboard
**Path:** `src/components/admin/ContentReviewDashboard.tsx`  
**Purpose:** Review user-generated lessons

**Features:**
- Pending lessons queue
- Lesson preview
- Quality scoring (1-5 scale)
- Approve/reject/needs revision
- Reviewer assignment
- Review history

---

### LessonSeedTrigger
**Path:** `src/components/admin/LessonSeedTrigger.tsx`  
**Purpose:** Trigger lesson seeding

**Features:**
- Seed kindergarten lessons (50)
- Seed grade 2 lessons (50)
- Progress indicator
- Error logging

---

### KindergartenLessonSeedTrigger
**Path:** `src/components/admin/KindergartenLessonSeedTrigger.tsx`  
**Purpose:** Seed kindergarten-specific lessons

---

### Grade2LessonSeedTrigger
**Path:** `src/components/admin/Grade2LessonSeedTrigger.tsx`  
**Purpose:** Seed grade 2-specific lessons

---

### ReviewerPerformance
**Path:** `src/components/admin/ReviewerPerformance.tsx`  
**Purpose:** Track reviewer metrics

**Metrics:**
- Total reviews completed
- Average review time
- Average score given
- Reviews this week
- Quality score

---

## 8. UI PRIMITIVES (shadcn/ui)

### Button
**Path:** `src/components/ui/button.tsx`

**Variants:**
```typescript
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
```

**Usage:**
```tsx
<Button variant="default" size="lg">Click Me</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><X /></Button>
```

**States:**
- Default, hover, active, focus, disabled
- Loading state (spinner)

---

### Input
**Path:** `src/components/ui/input.tsx`

**Usage:**
```tsx
<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email" />
```

**Features:**
- Accessible labels
- Error states
- Disabled states
- Focus ring

---

### PasswordInput
**Path:** `src/components/ui/password-input.tsx`

**Features:**
- Show/hide password toggle
- Eye/EyeOff icon
- All Input props

**Usage:**
```tsx
<PasswordInput placeholder="Password" />
```

---

### Card
**Path:** `src/components/ui/card.tsx`

**Sub-components:**
- Card (wrapper)
- CardHeader
- CardTitle
- CardDescription
- CardContent
- CardFooter

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### Dialog
**Path:** `src/components/ui/dialog.tsx`

**Usage:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Modal content</div>
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Toast
**Path:** `src/components/ui/toast.tsx` + `sonner`

**Usage:**
```tsx
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');
```

**Features:**
- Auto-dismiss (4s default)
- Action buttons
- Position control
- Rich content support

---

### Select
**Path:** `src/components/ui/select.tsx`

**Usage:**
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox
**Path:** `src/components/ui/checkbox.tsx`

**Usage:**
```tsx
<Checkbox
  id="terms"
  checked={checked}
  onCheckedChange={setChecked}
/>
<label htmlFor="terms">Accept terms</label>
```

---

### Progress
**Path:** `src/components/ui/progress.tsx`

**Usage:**
```tsx
<Progress value={60} max={100} />
```

---

### Tabs
**Path:** `src/components/ui/tabs.tsx`

**Usage:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

### Tooltip
**Path:** `src/components/ui/tooltip.tsx`

**Usage:**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Slider
**Path:** `src/components/ui/slider.tsx`

**Usage:**
```tsx
<Slider
  value={[value]}
  onValueChange={([v]) => setValue(v)}
  min={0}
  max={100}
  step={1}
/>
```

---

### Switch
**Path:** `src/components/ui/switch.tsx`

**Usage:**
```tsx
<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

---

### LoadingSpinner
**Path:** `src/components/ui/loading-spinner.tsx`

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage:**
```tsx
<LoadingSpinner size="md" />
```

---

## COMPONENT COMPOSITION PATTERNS

### Page Layout Pattern
```tsx
const MyPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Page Title</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Section Title</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content here */}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
```

---

### Form Pattern
```tsx
const MyForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
```

---

### Data Loading Pattern
```tsx
const MyComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;
  if (!data) return <p>No data found</p>;

  return <div>{/* Render data */}</div>;
};
```

---

### Modal Pattern
```tsx
const MyModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        <div>Modal content</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

---

## STYLING GUIDELINES

### Use Semantic Tokens
✅ **CORRECT:**
```tsx
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">Click</Button>
</div>
```

❌ **WRONG:**
```tsx
<div className="bg-white text-black">
  <Button className="bg-blue-500 text-white">Click</Button>
</div>
```

### Design System Tokens
```css
/* From index.css */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 221.2 83.2% 53.3%;
--radius: 0.5rem;
```

---

### Responsive Design
```tsx
// Mobile-first approach
<div className="
  grid grid-cols-1        /* Mobile: 1 column */
  sm:grid-cols-2          /* Small: 2 columns */
  md:grid-cols-3          /* Medium: 3 columns */
  lg:grid-cols-4          /* Large: 4 columns */
  gap-4                   /* Consistent gap */
">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

---

### Spacing System
```typescript
// Use 4px base unit (Tailwind's default)
const spacing = {
  xs: 'p-1',    // 4px
  sm: 'p-2',    // 8px
  md: 'p-4',    // 16px
  lg: 'p-6',    // 24px
  xl: 'p-8',    // 32px
  '2xl': 'p-12' // 48px
};
```

---

## ACCESSIBILITY REQUIREMENTS

### Keyboard Navigation
- All interactive elements focusable (Tab)
- Logical tab order
- Visible focus indicators
- Escape closes modals
- Enter/Space activates buttons

### Screen Reader Support
- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA labels on icon buttons
- ARIA live regions for dynamic content
- Descriptive alt text on images

### Color Contrast
- Text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- UI components: 3:1 minimum
- Test with contrast checker tools

---

## PERFORMANCE OPTIMIZATION

### Code Splitting
```tsx
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### Memoization
```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = memo(MyComponent);
```

### Image Optimization
```tsx
<img
  src={url}
  alt="Description"
  loading="lazy"
  width={600}
  height={400}
/>
```

---

## TESTING COMPONENTS

### Unit Testing
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button click handler', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  
  await userEvent.click(screen.getByText('Click'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Integration Testing
```tsx
test('login flow', async () => {
  render(<LoginForm />);
  
  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByText('Login'));
  
  expect(await screen.findByText('Welcome')).toBeInTheDocument();
});
```

---

## COMMON PATTERNS SUMMARY

1. **Always validate child ownership** with `useValidatedChild()`
2. **Use semantic color tokens** from design system
3. **Implement loading states** for all async operations
4. **Show user-friendly error messages** (never raw errors)
5. **Add keyboard navigation** to all interactive elements
6. **Memoize expensive operations** with useMemo/useCallback
7. **Lazy load heavy components** to reduce bundle size
8. **Test accessibility** with screen readers and keyboard-only navigation
9. **Use proper ARIA labels** on all icon-only buttons
10. **Handle empty states** gracefully (no data found messages)

---

## COMPONENT CHECKLIST

When creating new components:
- [ ] Props interface defined with TypeScript
- [ ] Default props for optional values
- [ ] Loading state implementation
- [ ] Error state handling
- [ ] Empty state handling
- [ ] Responsive design (mobile-first)
- [ ] Semantic color tokens (no hardcoded colors)
- [ ] Keyboard navigation support
- [ ] ARIA labels for accessibility
- [ ] Unit tests written
- [ ] Documentation added to this file
