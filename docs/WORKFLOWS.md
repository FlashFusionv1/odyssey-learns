# User Workflows & Journeys

## Overview
This document maps complete user journeys through Inner Odyssey, from registration to daily usage, covering all user types: Parents, Children, Admins, and Moderators.

**User Types:**
- **Parents** - Primary account holders
- **Children** - Students (K-12)
- **Admins** - Platform administrators
- **Moderators** - Content reviewers

---

## PARENT WORKFLOWS

### 1. Parent Registration & Onboarding

**Total Time:** 5-10 minutes  
**Route:** `/` → `/login` → `/signup` → `/parent-setup` → `/dashboard`

#### Step 1: Landing Page (/)
**Duration:** 1 minute

**Actions:**
1. Visit innerodyssey.com
2. Review features on landing page
3. Click "Start Free Trial" button
4. Redirected to `/signup`

**UI Elements:**
- Hero section with value proposition
- Feature highlights (EI + Academics + Life Skills)
- Testimonials
- Pricing (if applicable)
- CTA button

---

#### Step 2: Signup (/signup)
**Duration:** 2 minutes

**Form Fields:**
1. Full Name
2. Email Address
3. Password (with strength meter)
4. Confirm Password
5. COPPA Consent Checkbox

**Validation:**
- Email: Valid format, not already registered
- Password: ≥8 chars, 1 uppercase, 1 number, 1 special
- reCAPTCHA verification (score ≥0.5)

**On Submit:**
1. Call `supabase.auth.signUp()`
2. Create profile in `profiles` table
3. Assign 'parent' role in `user_roles` table
4. Auto-confirm email (enabled in Supabase settings)
5. Redirect to `/parent-setup`

**Error Handling:**
- "Email already registered" → Link to login
- "Password too weak" → Show requirements
- "reCAPTCHA failed" → Ask to retry

---

#### Step 3: Parent Setup (/parent-setup)
**Duration:** 3-5 minutes

**Step 3a: Welcome Message**
- Explain what's next
- Set expectations (add child, configure settings)

**Step 3b: Add First Child**

**Form Fields:**
1. Child's Name
2. Grade Level (K-12 dropdown)
3. Avatar Selection (optional)
4. Interests (multi-select: math, science, reading, art, etc.)
5. Learning Style (visual, auditory, kinesthetic, reading)
6. Special Needs (optional checkboxes: ADHD, dyslexia, autism, etc.)

**On Submit:**
1. Insert into `children` table
2. Initialize `daily_lesson_quota` record
3. Initialize `lesson_tokens` record (3 tokens)
4. Set default avatar if not selected
5. Create initial daily quest
6. Show success message
7. Option to "Add Another Child" or "Continue to Dashboard"

**Step 3c: Optional Settings**
- Screen time limits (default: 60 min/day)
- Weekly report email (default: enabled)
- Notification preferences

**On Complete:**
- Mark `profiles.onboarding_completed = true`
- Redirect to `/parent-dashboard`

---

### 2. Parent Daily Workflow

**Total Time:** 5-10 minutes/day  
**Route:** `/parent-dashboard`

#### Morning Check-In (2 minutes)

**Actions:**
1. Log in to parent dashboard
2. View child selector dropdown
3. Select child to monitor
4. Review yesterday's activity summary

**Dashboard Widgets:**
- **Activity Summary Card**
  - Lessons completed yesterday
  - Points earned
  - Streak status
  
- **Pending Actions Card**
  - Collaboration requests to approve
  - Lesson share requests to review
  - Reward redemption requests

- **AI Insights Card**
  - Quick insight: "Alex is excelling in math!"
  - Click "View Full Insights" for details

---

#### Review Progress (3 minutes)

**Navigation:** Click "View Full Progress" button

**Progress Dashboard Sections:**
1. **Subject Performance Chart**
   - Bar chart: Math, Reading, Science, Social-Emotional
   - Color-coded: Green (strong), Yellow (ok), Red (needs help)

2. **Recent Lessons Table**
   - Lesson title, subject, completion date, score
   - Filter by date range, subject

3. **Emotional Check-Ins**
   - Recent emotion logs (last 7 days)
   - Trend chart (mood over time)
   - Privacy: Only parent can view (encrypted)

4. **Badges Earned**
   - Recently unlocked badges
   - Progress toward next badge

---

#### Respond to Requests (2-3 minutes)

**Pending Approvals Section:**

**1. Collaboration Requests**
- Child wants to work with peer on lesson
- Show: Peer name, lesson title, activity type
- Actions: Approve, Reject, View Details
- On Approve: Update `collaboration_requests` status
- Notification sent to both children

**2. Lesson Share Requests**
- Child wants to share custom lesson publicly
- Show: Lesson preview (title, content excerpt)
- Actions: Approve, Reject (with reason), Request Revision
- On Approve: Update `share_status` to 'public'
- Child earns 10 creator points

**3. Reward Redemptions**
- Child requests reward redemption
- Show: Reward name, point cost, child's total points
- Actions: Approve, Reject (with note), Mark as Fulfilled
- On Approve: Deduct points, update status
- Parent note: "Will bring ice cream home Friday"

---

#### Send Encouragement Message (1 minute)

**Navigation:** Click "Send Message" button

**Message Composer:**
- Pre-written templates: "Great job!", "Keep it up!", "I'm proud of you!"
- Custom message textarea
- Message type selector: Encouragement, Question, Celebration, Suggestion
- Mark as important (pins message)
- Send button

**On Send:**
- Insert into `parent_child_messages` table
- Real-time notification to child (if online)
- Child sees message in their dashboard

---

### 3. Weekly Parent Workflow

**Total Time:** 15-20 minutes  
**Frequency:** Once per week (Sunday evening)

#### Review Weekly Report

**Email Received:**
- Auto-generated every Sunday at 8 PM
- Contains: Lessons completed, points earned, strongest subject, growth area, top achievement
- Conversation starter suggestion

**Dashboard View:**
1. Navigate to `/parent-dashboard`
2. Click "Weekly Reports" tab
3. View current week's report

**Report Sections:**
1. **Overview Stats**
   - Total lessons: 12
   - Total points: 650
   - Streak: 5 days
   - Time spent: 3.5 hours

2. **Subject Breakdown**
   - Math: 5 lessons, avg score 92%
   - Reading: 4 lessons, avg score 88%
   - Science: 3 lessons, avg score 95%

3. **Emotional Intelligence**
   - Check-ins completed: 7
   - Most frequent emotion: Happy (5x)
   - Coping strategies used: Deep breathing (3x)

4. **Growth Insights**
   - "Alex is mastering multiplication!"
   - "Consider reviewing reading comprehension strategies"
   - "Great emotional regulation this week!"

5. **Conversation Starters**
   - "Ask Alex about the volcano project they completed"
   - "Discuss how deep breathing helped during the math quiz"

---

#### Adjust Settings

**Navigation:** Settings → Child Settings

**Adjustable Settings:**
1. **Screen Time Limits**
   - Daily limit (minutes)
   - Time windows (e.g., 4pm-6pm weekdays)
   - Weekend exceptions

2. **Lesson Quotas**
   - Platform lessons: 5/day (base)
   - Custom lessons: 3/day (base)
   - Grant bonus lessons: +1 to +5

3. **Rewards**
   - Add new rewards (name, description, point cost)
   - Edit existing rewards
   - Activate/deactivate rewards

4. **Notification Preferences**
   - Email: Weekly reports, achievements, issues
   - In-app: All activity, Important only, None

---

#### Plan Next Week

**Actions:**
1. Review upcoming school topics
2. Create custom lessons for specific topics
3. Set weekly learning goals
4. Adjust difficulty if needed (enable/disable challenge mode)

---

## CHILD WORKFLOWS

### 1. Child Daily Learning Workflow

**Total Time:** 20-45 minutes/day  
**Grade-Adaptive:** K-2 (20min), 3-5 (30min), 6-8 (35min), 9-12 (45min)

#### Step 1: Login & Dashboard (2 minutes)

**Route:** `/` → `/login` (or auto-login if session active) → `/child-dashboard`

**Dashboard Elements:**
1. **Welcome Message**
   - "Welcome back, Alex!"
   - Current streak: "🔥 5 day streak!"
   - Points display: "⭐ 1,250 points"

2. **Today's Quest Card** (prominently displayed)
   - Quest title: "Math Master Challenge"
   - Description: "Complete 3 multiplication lessons"
   - Reward: 150 points + special badge
   - Progress: 1/3 complete
   - CTA: "Continue Quest"

3. **Quick Stats**
   - Lessons today: 2/5
   - Tokens: 3 available
   - New messages: 1 from parent

4. **Recommended Lessons** (AI-powered)
   - 3-4 lesson cards based on grade, interests, recent activity
   - Subject badges (Math, Science, Reading)
   - Estimated time (15 min)
   - Difficulty indicator (Easy, Medium, Hard)

---

#### Step 2: Start Daily Quest (15-25 minutes)

**Route:** Click "Continue Quest" → `/lessons/{quest-lesson-id}`

**Quest Lesson Flow (K-2 Example):**

**Phase 1: Introduction (2 minutes)**
- Animated character appears
- Voice narration: "Let's learn about shapes!"
- Show learning objective
- Motivational message: "You can do this!"

**Phase 2: Teaching Content (5-8 minutes)**
- Interactive slides with animations
- Age-appropriate explanations
- Visual examples
- Embedded mini-games (drag-and-drop shapes)
- Progress bar at top

**Phase 3: Practice Activities (5-10 minutes)**
- 5-7 practice questions
- Immediate feedback (correct/incorrect)
- Hints available (use decreases points slightly)
- Encouraging messages: "Great job!", "Try again!"
- No time pressure

**Phase 4: Quiz Assessment (3-5 minutes)**
- 5 quiz questions
- Multiple choice or interactive
- No hints available
- Score calculated (percentage)

**Phase 5: Completion Celebration (1 minute)**
- Full-screen confetti animation 🎉
- Points earned: +50 points
- New total: 1,300 points
- Progress toward quest: 2/3 complete
- Badge progress: "Almost there! 1 more lesson to unlock Math Master badge!"
- CTA: "Continue Quest" or "Take a Break"

---

#### Step 3: Continue Learning or Take Break

**Option A: Continue Quest (if time permits)**
- Click "Continue Quest"
- Repeat Step 2 with next lesson
- Complete 3rd lesson to finish quest
- Unlock quest reward (badge + bonus points)

**Option B: Free Exploration**
- Return to dashboard
- Browse lesson library
- Filter by subject, difficulty, time
- Select lesson of interest

**Option C: Take Break**
- View badges
- Check messages from parent
- Explore avatar customization
- View leaderboard (if enabled)

---

#### Step 4: Emotional Check-In (2 minutes)

**Trigger:** After completing 2-3 lessons or after 30 minutes

**Modal Appears:**
- "How are you feeling right now?"
- Emoji selector: 😊 😐 😟 😢 😠 😰 😴 😃

**Follow-up Questions:**
- "What made you feel this way?"
- "What helped you feel better?" (if negative emotion)
- "Want to practice a coping strategy?" (deep breathing exercise)

**On Submit:**
- Data encrypted and stored in `emotion_logs`
- Parent can view trends (not raw entries)
- AI insights use aggregated data

---

#### Step 5: End Session (1 minute)

**Actions:**
1. Click "Done for Today" button
2. See daily summary:
   - Lessons completed: 3
   - Points earned: 150
   - New badges: 1 (Math Master)
   - Streak maintained: 6 days 🔥
3. Encouraging message: "Great work today, Alex! See you tomorrow!"
4. Auto-save progress
5. Logout or return to dashboard

---

### 2. Child Custom Lesson Creation Workflow

**Total Time:** 10-15 minutes  
**Route:** `/child-dashboard` → "Create Custom Lesson" button → `/lessons/create`

#### Step 1: Topic Input (2 minutes)

**Form Fields:**
1. **Lesson Topic** (text input)
   - Placeholder: "What do you want to learn about?"
   - Examples: "Dinosaurs", "Space exploration", "How volcanoes work"
   - Character limit: 200

2. **Subject** (dropdown)
   - Options: Science, Math, Reading, Social Studies, Art, Other

3. **What I Already Know** (textarea, optional)
   - Helps AI customize difficulty
   - Placeholder: "Tell me what you already know about this topic"

**Daily Quota Display:**
- "Custom lessons today: 2/3"
- "Tokens available: 3 (use to unlock extra lessons)"

**Validation:**
- Topic required (min 3 words)
- Content moderation pre-check (blocks inappropriate requests)

---

#### Step 2: AI Generation (2-3 minutes)

**Loading Screen:**
- Animated "Generating your lesson..." message
- Progress indicator
- Fun facts displayed while waiting
- Estimated time: 2-3 minutes

**Backend Process:**
1. Content moderation check (gemini-2.5-flash)
2. Generate lesson content (gemini-2.5-pro)
3. Generate quiz questions
4. Store in `child_generated_lessons` table
5. Decrement daily quota counter

---

#### Step 3: Lesson Preview (3 minutes)

**Generated Lesson Display:**
1. Lesson title (AI-generated)
2. Estimated time (15-20 min)
3. Content preview (first 3 paragraphs)
4. Quiz questions preview (3 questions shown)
5. Difficulty indicator

**Actions:**
- **"Start Lesson"** - Begin learning immediately
- **"Save for Later"** - Add to saved lessons
- **"Create Another"** - Generate new lesson (if quota remains)
- **"Share with Friends"** - Request parent approval to share

---

#### Step 4: Complete Custom Lesson (15-20 minutes)

**Same flow as Step 2 of Daily Workflow:**
1. Introduction
2. Teaching content (AI-generated markdown)
3. Practice activities
4. Quiz assessment
5. Completion celebration

**Points Earned:**
- Base points: 50
- Completion bonus: +10
- Perfect score bonus: +25 (if 100%)
- Custom lesson creator bonus: +5

---

#### Step 5: Share Request (Optional, 2 minutes)

**Route:** After completion → "Share This Lesson" button

**Share Modal:**
- "Want to share this lesson with other kids?"
- Explain review process: "Your parent will review it first"
- Checkbox: "I created this lesson myself" (honesty pledge)
- Submit button: "Request Parent Approval"

**On Submit:**
1. Update `share_status` to 'pending_approval'
2. Notify parent (push notification + in-app)
3. Show confirmation: "Request sent to your parent!"

---

### 3. Child Social Workflow

**Total Time:** 10-15 minutes  
**Route:** `/child-dashboard` → "Friends" tab → `/social`

#### Step 1: View Peer Connections (2 minutes)

**Social Dashboard:**
1. **Connected Friends** (grid)
   - Friend avatars
   - Names
   - Online status (green dot)
   - Last active: "2 hours ago"

2. **Pending Requests** (list)
   - Incoming: "Sarah wants to connect with you"
   - Outgoing: "Waiting for Alex to accept"

3. **Find Friends** (search)
   - Search by name
   - Grade level filter
   - Interests filter

---

#### Step 2: Send Collaboration Request (3 minutes)

**Actions:**
1. Click friend's avatar
2. Select "Start Activity Together"
3. Choose activity type:
   - **Study Together** (work on same lesson)
   - **Quiz Battle** (competitive quiz)
   - **Group Project** (collaborative activity)
   - **Discussion Group** (chat about topic)

4. Select lesson (if applicable)
5. Add message: "Want to work on the volcano project together?"
6. Send request

**Backend:**
1. Insert into `collaboration_requests`
2. Check rate limit (10 requests/15min/family)
3. Notify recipient's parent for approval
4. Notify recipient child (pending parent approval)

---

#### Step 3: Join Shared Activity (10-15 minutes)

**Trigger:** Friend's parent approves collaboration

**Notification:**
- "Sarah's activity is ready! Join now?"
- Click "Join Activity"

**Activity Room:**
1. **Participant List**
   - Show all participants (max 4)
   - Online indicators

2. **Shared Workspace**
   - Lesson content (if lesson-based)
   - Collaborative canvas (if project)
   - Chat messages (moderated, parent-visible)

3. **Real-Time Updates**
   - See peer progress
   - Shared notes
   - Turn-based activities

4. **Completion**
   - All participants receive points
   - Collaboration badge progress
   - Can save activity notes

---

## ADMIN WORKFLOWS

### 1. Admin Daily Monitoring

**Total Time:** 15-30 minutes/day  
**Route:** `/admin-dashboard`

#### Morning Dashboard Review (5 minutes)

**Dashboard Metrics:**
1. **Platform Health**
   - Active users today
   - Lessons completed today
   - Edge function status (green/yellow/red)
   - Database connection status

2. **Content Review Queue**
   - Pending reviews: 23
   - In progress: 5
   - Urgent priority: 3

3. **Security Alerts**
   - Unauthorized access attempts: 0
   - Rate limit violations: 2
   - Failed logins: 15 (within normal range)

4. **Beta Feedback**
   - New feedback: 7
   - Critical bugs: 1
   - Feature requests: 4

---

#### Content Review Workflow (15-20 minutes)

**Route:** `/admin-dashboard` → "Content Review" tab → `/lesson-review`

**Review Queue:**
- Sorted by priority (urgent → high → normal)
- Auto-assigned by round-robin
- Reviewer can claim unassigned reviews

**Review Process (per lesson, 3-5 minutes):**

**Step 1: Lesson Preview**
- Title, description, content markdown
- Grade level, subject
- Creator information (child, parent)
- Generation prompt (if AI-generated)

**Step 2: Quality Scoring (1-5 scale)**
1. Age Appropriateness: ⭐⭐⭐⭐⭐
2. Content Accuracy: ⭐⭐⭐⭐⭐
3. Clarity: ⭐⭐⭐⭐⭐
4. Engagement: ⭐⭐⭐⭐⭐
5. Assessment Quality: ⭐⭐⭐⭐⭐

**Step 3: Feedback**
- **Strengths:** "Great use of visuals, age-appropriate language"
- **Weaknesses:** "Quiz questions too easy for grade level"
- **Suggestions:** "Add more challenging questions"

**Step 4: Decision**
- **Approve:** Lesson goes public, creator earns 10 points
- **Reject:** Lesson hidden, rejection reason sent to parent
- **Needs Revision:** Feedback sent, resubmit after changes

**On Submit:**
1. Update `lesson_reviews` status
2. Log to `review_history`
3. Update `reviewer_performance` metrics
4. Notify parent + child of decision
5. Next review auto-assigned

---

#### Security Monitoring (5 minutes)

**Route:** `/security-monitoring`

**Security Dashboard:**
1. **Access Logs** (last 24 hours)
   - Unusual access patterns
   - Unauthorized attempts
   - Geographic anomalies

2. **Rate Limit Violations**
   - User, endpoint, violation count
   - Action: Temporary ban, warning email

3. **Failed Authentication**
   - Failed login attempts by user
   - Potential brute force attacks
   - Action: Lock account, notify user

**Review Process:**
- Investigate flagged incidents
- Check if legitimate user error or attack
- Take action: Ban IP, lock account, notify user
- Document in incident log

---

#### Beta Feedback Triage (5 minutes)

**Route:** `/beta-feedback-admin`

**Feedback Dashboard:**
- Filter by: Type (bug, feature request, etc.), Severity, Status
- Sort by: Date, Severity, Upvotes

**Triage Process (per feedback, 1-2 minutes):**
1. Read feedback description
2. Check screenshot/device info
3. Reproduce bug (if applicable)
4. Assign severity: Low, Medium, High, Critical
5. Assign to: Development team, Design team, Content team
6. Update status: Reviewing → In Progress → Resolved
7. Add internal notes

**Critical Bug Response:**
- Acknowledge within 2 hours
- Fix deployed within 24 hours
- Notify user when resolved

---

### 2. Admin Weekly Workflow

**Total Time:** 1-2 hours/week  
**Frequency:** Once per week (Monday morning)

#### Platform Analytics Review (30 minutes)

**Route:** `/beta-analytics`

**Metrics:**
1. **User Growth**
   - New signups this week
   - Active users (DAU, WAU)
   - Retention rate (7-day, 30-day)

2. **Engagement**
   - Average lessons per user
   - Average session duration
   - Lesson completion rate

3. **Content Performance**
   - Top lessons (by completion)
   - Most-saved lessons
   - Most-shared lessons
   - Custom lesson generation count

4. **Gamification**
   - Badges unlocked
   - Points earned
   - Streak distribution
   - Reward redemptions

**Actions:**
- Identify trends (positive/negative)
- Flag issues (e.g., low completion rate)
- Generate report for team meeting

---

#### Content Seeding (30 minutes)

**Route:** `/seed-lessons`

**Seed New Lessons:**
1. Select grade level (K-12)
2. Select subject (math, science, reading, etc.)
3. Select count (10-50 lessons)
4. Click "Generate Batch"

**Batch Generation Process:**
- Calls `batch-lesson-generation` edge function
- Uses Lovable AI (gemini-2.5-pro)
- Generates lesson content + quiz questions
- Stores in `lessons` table
- Progress bar shows completion

**Review Generated Lessons:**
- Preview sample lessons
- Check quality
- Mark as active (publish)

---

#### Reviewer Performance Review (15 minutes)

**Route:** `/admin-dashboard` → "Reviewer Performance" tab

**Metrics per Reviewer:**
1. Total reviews completed
2. Average review time (minutes)
3. Average score given (1-5)
4. Reviews this week
5. Approval rate (approved/rejected ratio)

**Actions:**
- Identify top performers (reward/recognize)
- Identify outliers (too lenient/harsh)
- Provide feedback to reviewers
- Adjust workload distribution

---

## WORKFLOW DECISION TREES

### Parent: Should I Approve Collaboration Request?

```
Collaboration Request Received
│
├─ Do I know the peer child?
│  ├─ Yes → Check activity type
│  │  ├─ Study Together → Approve (educational)
│  │  ├─ Quiz Battle → Approve (fun + learning)
│  │  ├─ Discussion Group → Review topic first
│  │  └─ Group Project → Check time commitment
│  │
│  └─ No → Research peer
│     ├─ Check peer's profile (if visible)
│     ├─ Ask my child about peer
│     └─ Start with low-commitment activity (quiz)
│
├─ Is the activity age-appropriate?
│  ├─ Yes → Approve
│  └─ No → Reject with explanation
│
└─ Does my child have time today?
   ├─ Yes → Approve
   └─ No → Reject with "Try again tomorrow"
```

---

### Child: Should I Use a Lesson Token?

```
Daily Lesson Quota Reached (5 lessons completed)
│
├─ Do I have lesson tokens available?
│  ├─ Yes (3 tokens) → Check motivation
│  │  ├─ "I'm really interested in this topic" → Use token
│  │  ├─ "I want to complete my quest today" → Use token
│  │  ├─ "I'm just bored" → Save token for later
│  │  └─ "Parent asked me to learn this" → Ask parent for bonus lesson
│  │
│  └─ No tokens → Request parent for bonus lesson
│     ├─ Parent approves → Extra lesson granted
│     └─ Parent denies → Come back tomorrow
│
└─ Is this lesson important?
   ├─ Yes (school test tomorrow) → Use token
   └─ No → Save for tomorrow
```

---

### Admin: Should I Approve This Lesson for Public Sharing?

```
Lesson Review Request
│
├─ Is content age-appropriate?
│  ├─ Yes → Continue review
│  └─ No → Reject (reason: inappropriate content)
│
├─ Is content accurate?
│  ├─ Yes → Continue review
│  └─ No → Needs Revision (reason: factual errors)
│
├─ Is content engaging for target grade?
│  ├─ Yes → Continue review
│  └─ Mediocre → Needs Revision (suggestions provided)
│
├─ Are quiz questions appropriate?
│  ├─ Yes → Continue review
│  ├─ Too easy → Needs Revision (add harder questions)
│  └─ Too hard → Needs Revision (simplify questions)
│
└─ Overall quality score (average of 5 metrics)
   ├─ ≥ 4.0 → Approve (publish publicly)
   ├─ 3.0-3.9 → Needs Revision (good but improvable)
   └─ < 3.0 → Reject (quality too low)
```

---

## ERROR RECOVERY WORKFLOWS

### Scenario 1: Child Lost Streak Due to Technical Issue

**Problem:** Child completed lesson but streak didn't increment due to server error.

**Recovery Workflow:**
1. Parent contacts support via in-app feedback widget
2. Admin reviews `activity_sessions` table
3. Confirm lesson completion timestamp
4. Manually update streak in `children` table
5. Award missed badge (if applicable)
6. Send apology message to child with bonus points

---

### Scenario 2: Lesson Won't Load (Network Error)

**Problem:** Child clicks lesson, gets "Failed to load" error.

**Child Actions:**
1. Click "Retry" button (3 attempts)
2. If still fails, click "Report Problem"
3. System logs error details (lesson ID, child ID, error message, network status)
4. Child shown: "We're having trouble right now. Try again in a few minutes or pick a different lesson."

**Parent Notification:**
- In-app: "Alex had trouble loading a lesson. We're looking into it."
- No action needed from parent

**Admin Workflow:**
1. Error logged in monitoring system
2. If widespread (multiple users), escalate to dev team
3. If isolated, check lesson data integrity
4. Fix issue, notify user when resolved

---

### Scenario 3: Inappropriate Content in Custom Lesson

**Problem:** Child generates custom lesson with inappropriate content that slipped through moderation.

**Detection:**
1. Another user flags lesson via "Report" button
2. Flagged count increments
3. At 3 flags, lesson auto-hidden from public view

**Admin Review Workflow:**
1. Admin receives notification (high priority)
2. Review flagged lesson content
3. Determine if violation:
   - **Yes (mild):** Hide lesson, warn creator parent
   - **Yes (severe):** Hide lesson, suspend creator account, notify all affected users
   - **No (false positive):** Unhide lesson, log false flag
4. Notify reporters of outcome

**Prevention:**
- Improve AI moderation prompts
- Add keyword blocklist
- Implement pre-publish human review for sensitive topics

---

## WORKFLOW OPTIMIZATION OPPORTUNITIES

### Current Pain Point: Too Many Clicks to Start Lesson

**Current:** Dashboard → Browse Lessons → Filter by Subject → Select Lesson → Preview → Start (5 clicks)

**Optimized:** Dashboard → "Continue Yesterday's Lesson" (1 click) or "Today's Quest" (1 click)

**Implementation:**
- Add "Recently Started" section to dashboard
- Add "Quick Start" button to quest card
- Reduce preview step for trusted lessons

---

### Current Pain Point: Parent Overwhelmed by Daily Notifications

**Current:** Email + SMS + In-app notification for every child action (10-20/day)

**Optimized:** Daily digest email at 8 PM with all activity

**Implementation:**
- Add notification preferences: Real-time, Hourly, Daily Digest
- Group notifications by child
- Only send real-time for critical actions (safety concerns, collaboration requests)

---

## WORKFLOW METRICS & KPIs

### Parent Engagement
- **Onboarding Completion Rate:** Target >90%
- **Daily Dashboard Views:** Target >60% of parents
- **Approval Response Time:** Target <24 hours

### Child Engagement
- **Daily Active Usage:** Target >60% of children
- **Lesson Completion Rate:** Target >75%
- **Streak Maintenance:** Target >50% maintain 7+ day streak

### Admin Efficiency
- **Review Completion Time:** Target <5 minutes per review
- **Bug Response Time (Critical):** Target <2 hours
- **Feedback Triage Time:** Target <15 minutes daily

---

## FUTURE WORKFLOW ENHANCEMENTS

1. **Voice Commands:** "Hey Inner Odyssey, show me science lessons"
2. **Adaptive Difficulty:** Auto-adjust lesson difficulty based on performance
3. **Personalized Daily Planner:** AI-generated daily schedule based on goals
4. **Parent-Teacher Integration:** Share progress reports with school teachers
5. **Offline Mode:** Download lessons for offline access, sync when online

---

## WORKFLOW DOCUMENTATION MAINTENANCE

**Review Schedule:** Quarterly or after major feature releases

**Update Triggers:**
- New user flows added
- Existing flows significantly changed
- User feedback indicates confusion

**Ownership:** Product team maintains, with input from UX and engineering
