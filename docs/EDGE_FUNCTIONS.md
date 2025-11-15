# Edge Functions Reference

## Overview

All edge functions run on Deno runtime and deploy automatically on git push. They provide backend logic for AI generation, analytics, workflows, and complex business logic that can't run in the browser.

**Runtime:** Deno (TypeScript/JavaScript)  
**Deployment:** Automatic on git push  
**Environment:** Lovable Cloud (Supabase Edge Functions)

---

## Global Patterns

### Authentication Pattern
All functions (except `health-check` and `verify-recaptcha`) require authentication.

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Verify authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Validate user
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // User authenticated, proceed with business logic
  // ...
});
```

---

### CORS Pattern
All functions must return CORS headers for browser requests.

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Your business logic here
    const result = { success: true, data: 'Hello' };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

---

## Function Reference

### ai-insights
Generate AI-powered parent insights using Lovable AI.

**Path:** `supabase/functions/ai-insights/index.ts`  
**Method:** POST  
**Auth:** Required  
**Rate Limit:** None (internal use)

**Request Body:**
```json
{
  "childId": "uuid"
}
```

**Response:**
```json
{
  "insights": "Your child is excelling in math with an average score of 92%...",
  "childName": "Alex",
  "gradeLevel": 2,
  "recentActivity": [
    {
      "lesson_title": "Addition Facts",
      "score": 95,
      "completed_at": "2025-11-15T10:30:00Z"
    }
  ],
  "emotionalState": "positive"
}
```

**Security:**
- Validates parent owns child before generating insights
- Logs access to `security_access_log`
- No sensitive data exposed in response

**AI Model:** `google/gemini-2.5-pro` (Lovable AI)

**Implementation Details:**
1. Verify child ownership via RLS query
2. Fetch recent progress (last 10 lessons)
3. Fetch emotion logs (last 10 entries) - encrypted, decrypt with session key
4. Aggregate subject performance (avg score per subject)
5. Call Lovable AI API with structured prompt
6. Return personalized insights (2-3 paragraphs)

**Error Handling:**
- 401: User not authenticated
- 403: User doesn't own child
- 500: AI API failure or database error

---

### generate-custom-lesson
AI-generated custom lessons with content moderation.

**Path:** `supabase/functions/generate-custom-lesson/index.ts`  
**Method:** POST  
**Auth:** Required  
**Rate Limit:** 3/day per child (enforced in function)

**Request Body:**
```json
{
  "childId": "uuid",
  "topic": "Dinosaurs",
  "subject": "science",
  "gradeLevel": 2
}
```

**Response:**
```json
{
  "lessonId": "uuid",
  "title": "Discovering Dinosaurs",
  "subject": "science",
  "gradeLevel": 2,
  "content": "# Discovering Dinosaurs\n\n## Introduction\nDinosaurs were amazing creatures...",
  "quizQuestions": [
    {
      "question": "What does 'dinosaur' mean?",
      "options": ["Terrible lizard", "Big animal", "Old creature", "Extinct being"],
      "correctAnswer": 0
    }
  ],
  "estimatedMinutes": 15,
  "pointsValue": 50
}
```

**Security:**
- Verifies parent owns child
- Content moderation check before generation (blocks inappropriate topics)
- Decrements daily quota after successful generation
- No sensitive data in generation prompt

**AI Models:**
- **Moderation:** `google/gemini-2.5-flash` (fast, cheap)
- **Generation:** `google/gemini-2.5-pro` (high quality)

**Quota Enforcement:**
```typescript
// Check daily quota
const { data: quota } = await supabase
  .from('daily_lesson_quota')
  .select('custom_lessons_completed, quota_date')
  .eq('child_id', childId)
  .eq('quota_date', today)
  .single();

if (quota && quota.custom_lessons_completed >= 3) {
  return new Response(JSON.stringify({ 
    error: 'Daily custom lesson limit reached',
    retry_after: 'tomorrow',
    limit: 3,
    used: quota.custom_lessons_completed
  }), { status: 429, headers: corsHeaders });
}
```

**Content Moderation:**
```typescript
// Moderation prompt
const moderationPrompt = `Is the following topic appropriate for ${gradeLevel} grade children? 
Topic: "${topic}"

Respond with ONLY "SAFE" or "UNSAFE".
UNSAFE topics include: violence, inappropriate content, external links, personal information, dangerous activities.`;

const moderationResult = await callLovableAI('gemini-2.5-flash', moderationPrompt);

if (moderationResult.includes('UNSAFE')) {
  return new Response(JSON.stringify({
    error: 'inappropriate_topic',
    message: 'This topic cannot be generated for child safety reasons.'
  }), { status: 400, headers: corsHeaders });
}
```

**Generation Prompt Structure:**
```typescript
const generationPrompt = `Create a ${gradeLevel} grade ${subject} lesson about "${topic}".

Format:
# [Title]

## Introduction
[Engaging introduction paragraph]

## Main Content
[3-4 sections with explanations, examples, activities]

## Quiz Questions
Generate 5 multiple choice questions (4 options each).

Requirements:
- Age-appropriate language for ${gradeLevel} grade
- No external links
- No personal information requests
- Include examples and activities
- Make it engaging and fun
- Estimated time: 15 minutes`;
```

**Error Handling:**
- 401: User not authenticated
- 403: User doesn't own child
- 400: Inappropriate topic
- 429: Daily limit exceeded
- 500: AI API failure

---

### generate-weekly-reports
Automated weekly parent email reports.

**Path:** `supabase/functions/generate-weekly-reports/index.ts`  
**Method:** POST  
**Auth:** Service role (internal cron job)  
**Rate Limit:** None  
**Schedule:** Runs every Sunday at 8 PM UTC

**Request Body:**
```json
{
  "weekStartDate": "2025-11-10"
}
```

**Response:**
```json
{
  "success": true,
  "reportsGenerated": 45,
  "emailsSent": 45,
  "errors": []
}
```

**Report Contents:**
- Lessons completed this week
- Total points earned
- Strongest subject (highest avg score)
- Growth area (lowest avg score or least time spent)
- Top achievement (badge unlocked, high score, streak milestone)
- Conversation starter for parent-child discussion

**Implementation:**
1. Get all children with `weekly_report_enabled = true`
2. For each child:
   - Aggregate week's `user_progress` data
   - Calculate subject performance (avg score per subject)
   - Identify top achievement from `user_badges`, `analytics_events`
   - Generate AI conversation starter (optional, uses gemini-2.5-flash)
   - Insert report into `parent_weekly_reports`
   - (Future) Send email via Resend/SendGrid

**Conversation Starter Generation:**
```typescript
const conversationPrompt = `Generate a thoughtful conversation starter for a parent to discuss this week's learning with their ${gradeLevel} grade child.

This week:
- Completed ${lessonsCompleted} lessons
- Strongest subject: ${strongestSubject}
- Growth area: ${growthArea}
- Top achievement: ${topAchievement}

Format: One open-ended question that encourages the child to share their thoughts and feelings.
Example: "What did you find most interesting about the ${strongestSubject} lessons this week?"`;
```

**Error Handling:**
- Log errors but continue processing other children
- Return summary with success count and error list

---

### track-lesson-analytics
Track lesson engagement events (views, saves, shares).

**Path:** `supabase/functions/track-lesson-analytics/index.ts`  
**Method:** POST  
**Auth:** Required  
**Rate Limit:** None

**Request Body:**
```json
{
  "lessonId": "uuid",
  "childId": "uuid",
  "eventType": "view" | "save" | "share"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event tracked successfully",
  "creatorPointsAwarded": 1
}
```

**Implementation:**
1. Verify parent owns child
2. Insert event into `lesson_analytics_events`
3. Database trigger updates `lesson_analytics` aggregate table
4. Database trigger awards creator points via `trigger_award_analytics_points()`

**Creator Points:**
- View: 1 point
- Save: 3 points
- Share: 5 points

**Error Handling:**
- 401: User not authenticated
- 403: User doesn't own child
- 400: Invalid event type
- 500: Database error

---

### verify-recaptcha
Server-side reCAPTCHA v3 verification.

**Path:** `supabase/functions/verify-recaptcha/index.ts`  
**Method:** POST  
**Auth:** Not required (public endpoint)  
**Rate Limit:** None (Google handles rate limiting)

**Request Body:**
```json
{
  "token": "reCAPTCHA-token-from-client",
  "action": "login"
}
```

**Response:**
```json
{
  "success": true,
  "score": 0.9,
  "action": "login",
  "challenge_ts": "2025-11-15T10:00:00Z"
}
```

**Security:**
- Uses `RECAPTCHA_SECRET_KEY` environment variable
- Validates score threshold (≥0.5 for production)
- Logs low-score attempts for monitoring

**Google API Call:**
```typescript
const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');

const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
});

const result = await response.json();

// result.success: true/false
// result.score: 0.0-1.0 (v3 only)
// result.action: action name from client
```

**Score Interpretation:**
- 0.0-0.3: Likely bot → Block
- 0.3-0.5: Suspicious → Challenge or block
- 0.5-1.0: Likely human → Allow

**Integration Points:**
- Login form (`LoginForm.tsx`)
- Signup form (`SignupForm.tsx`)
- Password reset form (`ResetPassword.tsx`)

**Error Handling:**
- 400: Missing token
- 500: Google API error

---

### health-check
System health monitoring endpoint.

**Path:** `supabase/functions/health-check/index.ts`  
**Method:** GET  
**Auth:** Not required (public endpoint)  
**Rate Limit:** None

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T10:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "edge_functions": "operational"
}
```

**Checks:**
- Database connectivity (simple SELECT query)
- Edge function runtime health
- Response time (<500ms)

**Used For:**
- Uptime monitoring (external services like UptimeRobot)
- Load balancer health checks
- DevOps alerting

**Error Handling:**
- Returns 500 if database unreachable
- Returns degraded status if response time >500ms

---

### seed-kindergarten-lessons
Seed 50 Kindergarten lessons (one-time batch operation).

**Path:** `supabase/functions/seed-kindergarten-lessons/index.ts`  
**Method:** POST  
**Auth:** Admin only  
**Rate Limit:** None (manual trigger)

**Request Body:**
```json
{
  "force": true  // Optional: overwrite existing lessons
}
```

**Response:**
```json
{
  "success": true,
  "lessonsCreated": 50,
  "lessonIds": ["uuid1", "uuid2", ...],
  "errors": []
}
```

**Lesson Sources:**
- Reads from `docs/kindergarten-lesson-outlines.md`
- Parses structured lesson data (title, subject, content, quiz)
- Inserts into `lessons` table with `grade_level = 0`

**Error Handling:**
- Logs errors but continues processing other lessons
- Returns summary with success count and error list
- Validates lesson data before insert (title, content required)

---

### seed-grade-2-lessons
Seed 50 Grade 2 lessons.

**Path:** `supabase/functions/seed-grade-2-lessons/index.ts`  
**Method:** POST  
**Auth:** Admin only  
**Rate Limit:** None

**Request Body:**
```json
{
  "force": true
}
```

**Response:**
```json
{
  "success": true,
  "lessonsCreated": 50,
  "lessonIds": ["uuid1", "uuid2", ...],
  "errors": []
}
```

**Lesson Sources:**
- Reads from `docs/grade-2-lesson-outlines.md`
- Inserts into `lessons` table with `grade_level = 2`

---

### batch-lesson-generation
Generate multiple lessons in one request (admin tool).

**Path:** `supabase/functions/batch-lesson-generation/index.ts`  
**Method:** POST  
**Auth:** Admin only  
**Rate Limit:** None

**Request Body:**
```json
{
  "gradeLevel": 3,
  "subjects": ["math", "science"],
  "count": 10,
  "topics": ["Multiplication tables", "Fractions", "Plants", "Weather"]
}
```

**Response:**
```json
{
  "success": true,
  "lessonsGenerated": 10,
  "lessonIds": ["uuid1", "uuid2", ...],
  "errors": []
}
```

**AI Model:** `google/gemini-2.5-pro` (Lovable AI)

**Implementation:**
1. Verify user is admin
2. For each topic:
   - Generate lesson with AI
   - Insert into `lessons` table
   - Track generation time and token usage
3. Return summary

**Error Handling:**
- 401: Not authenticated
- 403: Not admin
- 500: AI API failure

---

### request-lesson-share
Submit lesson for review/approval to share publicly.

**Path:** `supabase/functions/request-lesson-share/index.ts`  
**Method:** POST  
**Auth:** Required  
**Rate Limit:** None

**Request Body:**
```json
{
  "lessonId": "uuid",
  "childId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "reviewId": "uuid",
  "message": "Lesson submitted for review",
  "estimatedReviewTime": "2-3 business days"
}
```

**Workflow:**
1. Verify parent owns lesson
2. Update lesson `share_status` to 'pending_approval'
3. Create `lesson_reviews` record with status='pending'
4. Auto-assign reviewer via `auto_assign_pending_reviews()` function
5. Notify parent of submission (future: email notification)

**Error Handling:**
- 401: Not authenticated
- 403: User doesn't own lesson
- 400: Lesson already pending or public
- 500: Database error

---

## Calling Functions from Client

### Basic Pattern

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param1: 'value1', param2: 'value2' }
});

if (error) {
  console.error('Function error:', error);
  return;
}

console.log('Result:', data);
```

---

### With Authentication (Automatic)

```typescript
// Authentication is automatic if user is logged in
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirect to login
  navigate('/login');
  return;
}

// Function receives auth token automatically
const { data, error } = await supabase.functions.invoke('ai-insights', {
  body: { childId }
});
```

---

### Error Handling Pattern

```typescript
const { data, error } = await supabase.functions.invoke('generate-custom-lesson', {
  body: { childId, topic, subject, gradeLevel }
});

if (error) {
  if (error.message?.includes('limit reached')) {
    toast.error('Daily custom lesson limit reached. Try again tomorrow!');
  } else if (error.message?.includes('inappropriate')) {
    toast.error('This topic cannot be generated. Please choose another.');
  } else if (error.message?.includes('unauthorized')) {
    toast.error('Authentication required. Please log in.');
    navigate('/login');
  } else {
    toast.error('Failed to generate lesson. Please try again.');
  }
  return;
}

toast.success('Custom lesson created!');
navigate(`/lessons/${data.lessonId}`);
```

---

### Loading State Pattern

```typescript
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async () => {
  setIsGenerating(true);
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-custom-lesson', {
      body: { childId, topic, subject, gradeLevel }
    });
    
    if (error) throw error;
    
    toast.success('Lesson created!');
    navigate(`/lessons/${data.lessonId}`);
  } catch (error) {
    toast.error('Generation failed. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};

return (
  <Button onClick={handleGenerate} disabled={isGenerating}>
    {isGenerating ? 'Generating...' : 'Generate Lesson'}
  </Button>
);
```

---

## Environment Variables

### Required Secrets

All secrets configured in Lovable Cloud → Backend → Secrets:

**Auto-Configured:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)
- `VITE_SUPABASE_URL` - Client-side URL (same as above)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key (client access)

**Manually Configured:**
- `LOVABLE_API_KEY` - Lovable AI API key (for AI features)
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret key

### Accessing Secrets in Functions

```typescript
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');

if (!LOVABLE_API_KEY) {
  throw new Error('LOVABLE_API_KEY not configured');
}
```

---

## Deployment

### Automatic Deployment

**Trigger:** Git push to main branch  
**Process:**
1. Lovable Cloud detects changes
2. Builds all edge functions
3. Deploys to Deno runtime
4. Health check verification
5. Notification on success/failure

**Deployment Time:** ~30-60 seconds

---

### Viewing Logs

**Via Lovable Cloud:**
1. Open backend (click "View Backend" button in Lovable)
2. Navigate to Functions section
3. Select function name
4. Click "Logs" tab
5. Filter by:
   - Time range (last hour, last day, last week)
   - Log level (info, warn, error)
   - Search term (e.g., "error", "userId")

**Log Levels:**
```typescript
console.log('Info message'); // INFO
console.warn('Warning message'); // WARN
console.error('Error message'); // ERROR
```

---

### Testing Functions

**Using Supabase Client (in browser console):**
```javascript
await supabase.functions.invoke('health-check');
// Returns: { status: 'healthy', ... }

await supabase.functions.invoke('generate-custom-lesson', {
  body: {
    childId: 'child-uuid',
    topic: 'Test Topic',
    subject: 'science',
    gradeLevel: 2
  }
});
```

**Using curl (requires auth token):**
```bash
curl -X POST https://hcsglifjqdmiykrrmncn.supabase.co/functions/v1/health-check \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

---

## Common Issues

### Issue 1: CORS Errors

**Symptom:** Browser shows "CORS policy" error  
**Cause:** Missing CORS headers or OPTIONS handler

**Fix:**
```typescript
// Add at top of function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Add OPTIONS handler
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Add to all responses
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

---

### Issue 2: Authentication Failures

**Symptom:** 401 Unauthorized errors  
**Cause:** Invalid or missing auth token

**Fix:**
1. Ensure user is logged in: `await supabase.auth.getUser()`
2. Check token not expired (auto-refresh enabled by default)
3. Verify Authorization header format: `Bearer <token>`

---

### Issue 3: Rate Limits

**Symptom:** 429 Too Many Requests  
**Cause:** Exceeded daily/hourly limits

**Fix:**
1. Check `daily_lesson_quota` table for current usage
2. Implement retry logic with exponential backoff
3. Show clear error message to user with retry time
4. Consider increasing limits for specific use cases

---

### Issue 4: Slow Performance

**Symptom:** Function takes >5 seconds to respond  
**Cause:** Database queries, AI API calls, inefficient logic

**Optimization:**
1. Minimize database queries (batch when possible)
2. Use indexes for filtered queries
3. Cache AI responses (idempotency cache)
4. Use faster AI models (gemini-2.5-flash vs pro)
5. Implement timeouts (abort after 30 seconds)

---

## Best Practices

### 1. Always Validate Input

```typescript
// Validate required fields
const { childId, topic, subject, gradeLevel } = await req.json();

if (!childId || !topic || !subject || !gradeLevel) {
  return new Response(JSON.stringify({ 
    error: 'Missing required fields' 
  }), { status: 400, headers: corsHeaders });
}

// Validate data types
if (typeof gradeLevel !== 'number' || gradeLevel < 0 || gradeLevel > 12) {
  return new Response(JSON.stringify({ 
    error: 'Invalid grade level' 
  }), { status: 400, headers: corsHeaders });
}
```

---

### 2. Verify Ownership

```typescript
// Never trust client-sent IDs - always verify ownership
const { data: child } = await supabase
  .from('children')
  .select('id')
  .eq('id', childId)
  .eq('parent_id', user.id)
  .single();

if (!child) {
  return new Response(JSON.stringify({ 
    error: 'Child not found or access denied' 
  }), { status: 403, headers: corsHeaders });
}
```

---

### 3. Handle Errors Gracefully

```typescript
try {
  // Business logic
  const result = await performOperation();
  
  return new Response(JSON.stringify({ success: true, data: result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
} catch (error) {
  console.error('Operation failed:', error);
  
  // Return user-friendly error message (don't leak sensitive details)
  return new Response(JSON.stringify({ 
    error: 'Operation failed. Please try again.' 
  }), { 
    status: 500, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}
```

---

### 4. Optimize Performance

```typescript
// ❌ Bad: Multiple sequential queries
const child = await supabase.from('children').select('*').eq('id', childId).single();
const progress = await supabase.from('user_progress').select('*').eq('child_id', childId);
const badges = await supabase.from('user_badges').select('*').eq('child_id', childId);

// ✅ Good: Batch queries with joins or Promise.all
const [child, progress, badges] = await Promise.all([
  supabase.from('children').select('*').eq('id', childId).single(),
  supabase.from('user_progress').select('*').eq('child_id', childId),
  supabase.from('user_badges').select('*').eq('child_id', childId)
]);
```

---

### 5. Security First

```typescript
// ✅ Never expose secrets in logs
console.log('API call successful'); // Good

// ❌ Never log secrets
console.log('API key:', LOVABLE_API_KEY); // Bad

// ✅ Use environment variables
const apiKey = Deno.env.get('LOVABLE_API_KEY');

// ❌ Don't hardcode secrets
const apiKey = 'sk-1234567890'; // Bad

// ✅ Validate all input
const sanitizedTopic = topic.trim().slice(0, 100);

// ❌ Don't trust client input
const query = `SELECT * FROM lessons WHERE topic = '${topic}'`; // SQL injection vulnerability
```

---

### 6. Monitor and Alert

```typescript
// Log important events
console.log(`Custom lesson generated for child ${childId}: ${lessonId}`);

// Log errors with context
console.error(`Failed to generate lesson for child ${childId}:`, error.message);

// Track performance
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;
console.log(`Operation completed in ${duration}ms`);
```

---

## Additional Resources

**Deno Documentation:** https://deno.land/manual  
**Supabase Edge Functions:** https://supabase.com/docs/guides/functions  
**Lovable AI Models:** (Internal documentation)

---

## Support

**Need Help?**
- Check function logs in Lovable Cloud backend
- Review similar existing functions for patterns
- Ask team lead for complex implementations
- Test security implications of every change
