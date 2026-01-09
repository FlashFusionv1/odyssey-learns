# Inner Odyssey - Complete Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Status:** Beta Testing Phase  
**Document Owner:** Product Team

---

## Executive Summary

### Product Vision

**Inner Odyssey** is a transformative K-12 educational platform that uniquely integrates emotional intelligence training with standards-aligned academics and real-world life skills. Through age-adaptive gamification and personalized learning journeys, we empower every child to become emotionally intelligent, academically confident, and life-ready.

### Mission Statement

> "Empower every child to become emotionally intelligent, academically confident, and life-ready through personalized learning journeys that adapt to their unique needs, celebrate their growth, and involve parents as active partners in their success."

### Key Differentiators

| Differentiator | Description | Competitive Advantage |
|----------------|-------------|----------------------|
| **Holistic Learning** | Only platform integrating EI + academics + life skills | No competitor offers this combination |
| **Age-Adaptive UI** | 4 distinct UI tiers (K-2, 3-5, 6-8, 9-12) | Most platforms use one-size-fits-all |
| **AI-Powered Content** | Custom lesson generation with parental approval | Personalization at scale |
| **Parent Partnership** | Real-time dashboard, messaging, AI insights | Parents as active learning partners |
| **Gamification Engine** | Points, badges, streaks, quests, rewards | Intrinsic + extrinsic motivation |
| **Privacy-First Design** | COPPA/FERPA/GDPR compliant from day one | Built for trust |

### Target Market

- **Primary:** Families with children ages 5-18 (K-12) in the United States
- **Secondary:** Homeschool families, after-school programs, tutoring centers
- **Future:** K-12 schools and districts, international markets

---

## User Personas

### Persona 1: Parent (Sarah)

**Demographics:**
- Age: 35-45
- Children: 2 (ages 7 and 10)
- Income: $75,000-$150,000 household
- Education: College-educated
- Tech Comfort: Moderate to high

**Goals:**
- Supplement school learning with engaging content
- Develop children's emotional intelligence
- Monitor progress without being overbearing
- Balance screen time with educational value

**Pain Points:**
- Too many low-quality educational apps
- Lack of visibility into what children are learning
- Difficulty teaching emotional regulation
- Guilt about screen time

**Inner Odyssey Solution:**
- Curated, high-quality content with parental oversight
- Real-time dashboard with AI-powered insights
- Integrated emotional intelligence curriculum
- Educational screen time that counts

### Persona 2: Child - Early Elementary (Emma, Age 6)

**Characteristics:**
- Grade: 1st (K-2 tier)
- Learning Style: Visual/kinesthetic
- Interests: Animals, art, stories
- Attention Span: 10-15 minutes

**Goals:**
- Have fun while learning
- Earn stickers and rewards
- Make parents proud
- See colorful characters

**Pain Points:**
- Complex interfaces are confusing
- Text-heavy content is frustrating
- Boring drills feel like work

**Inner Odyssey Solution:**
- K-2 UI with large buttons, bright colors, minimal text
- Animated characters and voice narration
- Sticker collection system with adventure book
- 15-20 minute guided daily quests

### Persona 3: Child - Middle School (Marcus, Age 12)

**Characteristics:**
- Grade: 7th (6-8 tier)
- Learning Style: Independent/competitive
- Interests: Gaming, science, technology
- Attention Span: 30-45 minutes

**Goals:**
- Challenge himself intellectually
- Compete with peers
- Build portfolio for future
- Earn meaningful rewards

**Pain Points:**
- Childish apps are embarrassing
- Lack of challenge in most platforms
- No recognition for achievements

**Inner Odyssey Solution:**
- Mature 6-8 UI with professional aesthetics
- Challenge mode and team competitions
- Skill trees and mastery levels
- Real credentials for portfolio

### Persona 4: Administrator (Dr. Chen)

**Characteristics:**
- Role: Platform administrator/content reviewer
- Expertise: Education specialist, curriculum design
- Responsibilities: Content quality, user safety

**Goals:**
- Maintain high content standards
- Ensure age-appropriateness
- Monitor platform health
- Respond to issues quickly

**Inner Odyssey Solution:**
- Content review dashboard with scoring rubrics
- Automated quality flags and prioritization
- Security monitoring and alerts
- Batch lesson generation tools

---

## Feature Catalog

### 1. Authentication & User Management

#### 1.1 Parent Registration
- Email + password or Google OAuth signup
- Age verification (must be 18+)
- COPPA consent with version tracking
- reCAPTCHA v3 for bot prevention
- Password strength meter (zxcvbn)

#### 1.2 Child Profile Management
- Parents create/manage child profiles
- Grade level selection (K-12)
- Learning preference configuration
- Optional PIN protection
- Avatar customization

#### 1.3 Session Management
- JWT-based authentication
- 30-minute idle timeout with warning
- Secure session storage
- Multi-device support
- Logout all devices option

### 2. Learning Content System

#### 2.1 Platform Lessons
- **Subjects:** Math, Reading, Science, Social Studies, Emotional Intelligence, Life Skills
- **Content Format:** Markdown with interactive elements
- **Quiz System:** Multiple choice, true/false, short answer
- **Differentiation:** Built-in scaffolding for different levels
- **Standards:** Common Core aligned

#### 2.2 AI-Generated Custom Lessons
- Child requests topic of interest
- AI generates grade-appropriate content
- Parent approval required before access
- Moderation for safety and accuracy
- Token-based quota system (3/day free)

#### 2.3 Lesson Player
- Age-adaptive presentation
- Progress auto-save
- Embedded quizzes with instant feedback
- Notes and highlighting (Digital Notebook)
- Time tracking for analytics

#### 2.4 Community Lessons
- Share approved lessons with community
- Browse by grade, subject, popularity
- Save to personal library
- Creator attribution and rewards

### 3. Gamification Engine

#### 3.1 Points System
- **Adventure Points (K-2):** +10-20 per activity
- **XP & Levels (3-5):** +25-100 per activity, level every 500 XP
- **Skill Points (6-8):** +50-500, mastery trees
- **Achievement Points (9-12):** +100-1000, credential-worthy

#### 3.2 Badge System
- **Categories:** Academic, Creativity, Leadership, Social-Emotional, Life Skills
- **Tiers:** Bronze, Silver, Gold, Platinum
- **Unlock Criteria:** Activity completion, streaks, milestones
- **Display:** Badge showcase with animations

#### 3.3 Streak System
- Daily activity streaks
- Age-appropriate requirements (5-45 minutes)
- Streak freeze (1/month)
- Milestone rewards (7, 30, 100 days)
- Weekend flexibility option

#### 3.4 Daily Quests
- Personalized quest per child
- 3 activities per quest (varied subjects)
- Bonus points for completion
- Refreshes at midnight local time

#### 3.5 Rewards Store
- Parent-defined rewards
- Points redemption system
- Approval workflow
- Redemption history

### 4. Parent Dashboard

#### 4.1 Progress Overview
- Real-time activity tracking
- Subject performance breakdown
- Streak and points display
- Recent achievements

#### 4.2 AI Insights
- Weekly learning pattern analysis
- Strength and growth area identification
- Personalized recommendations
- Conversation starters

#### 4.3 Communication Center
- In-app messaging with children
- Message types: Encouragement, Question, Celebration
- Reaction system (emoji responses)
- Important message flagging

#### 4.4 Screen Time Management
- Daily limit configuration
- Time window restrictions
- Pause/resume controls
- Usage analytics

#### 4.5 Weekly Reports
- Automated email summary (Sundays)
- Lessons completed, points earned
- Top achievement highlight
- Growth area focus

#### 4.6 Data Management
- Export child data (JSON/CSV)
- GDPR-compliant deletion
- Consent management
- Audit log access

### 5. Child Dashboard

#### 5.1 Age-Adaptive Interface
- **K-2:** Simple, colorful, voice-guided
- **3-5:** Balanced, game-like, achievement-focused
- **6-8:** Mature, data-rich, competitive
- **9-12:** Professional, portfolio-oriented

#### 5.2 Lesson Library
- Browse by subject and grade
- Filter by difficulty, duration
- Search functionality
- Recently viewed and saved

#### 5.3 Social Features
- Peer connections (parent-approved)
- Shared activities and challenges
- Collaboration requests
- Activity feed

#### 5.4 Emotion Check-In
- Daily mood logging
- Intensity scale (1-5)
- Optional trigger and coping notes
- Encrypted storage for privacy

### 6. Admin & Content Management

#### 6.1 Content Review Dashboard
- Pending lessons queue
- Multi-criteria scoring rubric
- Revision workflow
- Bulk actions

#### 6.2 Lesson Generation Tools
- Batch generation (25 lessons)
- Subject/grade targeting
- Quality score thresholds
- Auto-assignment to reviewers

#### 6.3 Security Monitoring
- Active alerts dashboard
- Failed auth tracking
- Rate limit violations
- IP blocklist management

#### 6.4 Analytics Dashboard
- Platform-wide metrics
- User engagement trends
- Content performance
- System health

---

## User Journeys

### Journey 1: Parent Onboarding (10-15 minutes)

```
1. Landing Page
   └─> "Start Free Trial" CTA
   
2. Account Creation (2 min)
   ├─> Email/Password or Google OAuth
   ├─> Age verification (birth year)
   └─> reCAPTCHA validation

3. COPPA Consent (1 min)
   ├─> Privacy policy review
   ├─> Consent checkbox
   └─> Version logged for compliance

4. First Child Setup (3 min)
   ├─> Child name entry
   ├─> Grade level selection
   ├─> Learning preferences (optional)
   └─> Avatar customization

5. Parent Dashboard Tour (3 min)
   ├─> Interactive walkthrough
   ├─> Key feature highlights
   └─> Quick actions demo

6. First Goal Setting (2 min)
   ├─> Daily learning time target
   ├─> Subject focus areas
   └─> Reward creation prompt

7. Onboarding Complete
   └─> "Your child is ready to learn!"
```

### Journey 2: Child Daily Learning Session (20-30 minutes, K-2)

```
1. Welcome Screen
   ├─> Animated character greeting
   ├─> Streak display ("3 days in a row! 🔥")
   └─> Points balance

2. Today's Quest
   ├─> Single big "Start Adventure!" button
   ├─> Quest preview (3 activities)
   └─> Estimated time (15 min)

3. Activity 1: Reading
   ├─> Story with audio narration
   ├─> Interactive vocabulary
   └─> Quick quiz (3 questions)

4. Activity 2: Math
   ├─> Visual counting game
   ├─> Drag-and-drop interaction
   └─> Celebration animation

5. Activity 3: Feelings
   ├─> Emotion identification game
   ├─> "How do YOU feel?" check-in
   └─> Breathing exercise video

6. Quest Complete!
   ├─> Full-screen confetti
   ├─> Sticker reward selection
   └─> Parent notification sent

7. Free Play or Exit
   ├─> Optional bonus activities
   └─> "See you tomorrow!"
```

### Journey 3: Custom Lesson Creation (5-10 minutes)

```
1. Child Dashboard
   └─> "Create My Own Lesson" button

2. Topic Input
   ├─> "What do you want to learn about?"
   ├─> Text input with suggestions
   └─> Submit request

3. AI Generation (30-60 seconds)
   ├─> Loading animation
   ├─> "Creating your lesson..."
   └─> Progress indicator

4. Preview & Submit
   ├─> Lesson preview (read-only)
   ├─> "Ask Parent to Approve" button
   └─> Notification to parent

5. Parent Approval
   ├─> Parent reviews content
   ├─> Approve/Reject with optional note
   └─> Child notified

6. Lesson Available
   ├─> Appears in child's library
   ├─> Can complete and earn points
   └─> Option to share with community
```

### Journey 4: Weekly Parent Review (10-15 minutes)

```
1. Email Notification
   └─> "Emma's Weekly Report is Ready!"

2. Open Dashboard
   ├─> Quick summary view
   ├─> 5 lessons, 320 points, 7-day streak
   └─> "View Details" CTA

3. Deep Dive
   ├─> Subject breakdown charts
   ├─> Quiz score trends
   └─> Time spent analysis

4. AI Insights Review
   ├─> "Emma excels at reading!"
   ├─> "Consider more math practice"
   └─> Conversation starters

5. Send Encouragement
   ├─> Quick message compose
   ├─> Emoji/sticker selection
   └─> Send to child

6. Adjust Settings (if needed)
   ├─> Modify daily goals
   ├─> Update screen time limits
   └─> Add new reward options

7. Close Dashboard
   └─> "Great week ahead!"
```

---

## Success Metrics & KPIs

### North Star Metric

**Weekly Active Learners (WAL):** Children who complete at least one lesson per week

**Target:** 80% of registered children are WAL

### Engagement Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Daily Active Users (DAU) | Unique children logging in daily | 60% of WAL |
| Session Duration | Average time per learning session | K-2: 15min, 3-5: 25min, 6-8: 35min |
| Lessons per Week | Average lessons completed per child | 5+ |
| Quest Completion Rate | % of started quests completed | 75% |
| 7-Day Retention | % of new users active after 7 days | 80% |
| 30-Day Retention | % of new users active after 30 days | 60% |

### Learning Outcomes

| Metric | Definition | Target |
|--------|------------|--------|
| Quiz Pass Rate | % of quizzes passed (≥70%) | 85% |
| Skill Improvement | Pre/post assessment score gain | +15% average |
| Grade Level Progress | Children advancing levels | 2+ per semester |
| EI Growth | Emotion vocabulary improvement | Measurable growth |

### Parent Engagement

| Metric | Definition | Target |
|--------|------------|--------|
| Dashboard Weekly Access | Parents visiting dashboard weekly | 70% |
| Message Engagement | Parents sending encouragement | 50%+ weekly |
| Report Open Rate | Weekly report email opens | 60% |
| Net Promoter Score (NPS) | Would recommend to friend | 50+ |
| Would Pay | Willingness to pay for premium | 60%+ |

### Technical Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Page Load Time | Time to interactive | <3s mobile, <2s desktop |
| API Response Time | 95th percentile latency | <500ms |
| Error Rate | Client-side error frequency | <0.1% |
| Uptime | Platform availability | 99.9% |
| Lighthouse Score | Performance audit | 90+ all categories |

### Beta-Specific Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Bug Reports | Unique bugs reported | 50+ (goal: find issues) |
| Feature Requests | Actionable suggestions | 30+ |
| Survey Completion | Monthly survey response | 80% |
| Feedback Submissions | Total feedback items | 100+ |

---

## Competitive Landscape

### Direct Competitors

| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| **Khan Academy Kids** | Free, high quality, brand trust | No EI, limited gamification, no parent dashboard | Holistic + engaged parents |
| **ABCmouse** | Strong K-2, comprehensive | Dated UI, no EI, older kids neglected | Age-adaptive + modern UX |
| **IXL Learning** | Standards-aligned, diagnostic | Drill-focused, no engagement, no EI | Fun + emotional growth |
| **Duolingo Kids** | Gamification leader | Language only, no academics | Full curriculum coverage |
| **Epic!** | Reading focus, great library | Limited subjects, no EI | Multi-subject + holistic |

### Indirect Competitors

- **Traditional tutoring:** High cost, limited access
- **School homework:** Not engaging, no personalization
- **Educational YouTube:** Passive, no progress tracking
- **Mobile games:** Entertaining but not educational

### Competitive Moat

1. **Data Moat:** Learning history enables better personalization over time
2. **Content Moat:** AI-generated content library grows with use
3. **Network Effects:** Community lessons and peer features
4. **Trust Moat:** COPPA compliance and parent transparency
5. **UX Moat:** Age-adaptive design is hard to replicate

---

## Pricing Strategy (Planned)

### Free Tier
- 3 platform lessons/day
- 3 custom lesson tokens/day
- Basic parent dashboard
- 1 child profile

### Premium Tier ($9.99/month)
- Unlimited platform lessons
- 10 custom lesson tokens/day
- Advanced AI insights
- Up to 5 child profiles
- Priority support

### Family Tier ($14.99/month)
- Everything in Premium
- Unlimited custom lessons
- Detailed analytics export
- Sibling collaboration features
- Early access to new features

### School/District Tier (Custom)
- Bulk licensing
- Teacher dashboard
- Classroom management
- LMS integration
- Custom content creation

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Age Tier** | UI/UX variation based on grade level (K-2, 3-5, 6-8, 9-12) |
| **Daily Quest** | Personalized set of 3 activities assigned each day |
| **EI** | Emotional Intelligence |
| **Lesson Token** | Currency for AI-generated custom lessons |
| **Platform Lesson** | Pre-created, curated lesson content |
| **RLS** | Row-Level Security (database access control) |
| **WAL** | Weekly Active Learner |

## Appendix B: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 9, 2026 | Product Team | Initial complete PRD |

---

*This document is the source of truth for Inner Odyssey product requirements. All feature implementations should reference this PRD for alignment.*
