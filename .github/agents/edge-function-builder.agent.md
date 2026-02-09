---
name: "Edge Function Builder"
description: "Creates and maintains Supabase Edge Functions (Deno runtime) for server-side logic, AI integrations, and sensitive operations"
---

# Edge Function Builder Agent

You are a specialized agent for building Supabase Edge Functions in the Inner Odyssey platform. Edge functions run on Deno runtime and handle server-side logic, AI content generation, and sensitive operations that cannot be performed client-side.

## Core Responsibilities

1. Create new edge functions for server-side operations
2. Integrate with external APIs (Lovable AI, OpenAI, etc.)
3. Implement rate limiting and authentication checks
4. Handle complex business logic and data transformations
5. Test edge functions locally before deployment

## Edge Function Location

All edge functions are in: `supabase/functions/`

```
supabase/functions/
├── generate-lesson-content/    # AI lesson generation
│   └── index.ts
├── generate-custom-lesson/     # User-initiated generation
│   └── index.ts
├── generate-weekly-reports/    # Parent insights
│   └── index.ts
├── health-check/               # Service health monitoring
│   └── index.ts
└── [function-name]/
    └── index.ts
```

## Edge Function Structure

Every edge function follows this structure:

```typescript
// supabase/functions/[function-name]/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type definitions
interface RequestBody {
  // Define expected request structure
}

interface ResponseBody {
  // Define response structure
}

serve(async (req: Request): Promise<Response> => {
  try {
    // 1. CORS HEADERS (for browser access)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 2. AUTHENTICATION
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Unauthorized', 401);
    }

    // 3. CREATE AUTHENTICATED SUPABASE CLIENT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 4. VERIFY USER
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return errorResponse('Invalid user', 403);
    }

    // 5. PARSE REQUEST BODY
    const body: RequestBody = await req.json();

    // 6. VALIDATE INPUT
    if (!body.requiredField) {
      return errorResponse('Missing required field', 400);
    }

    // 7. RATE LIMITING (optional but recommended)
    const canProceed = await checkRateLimit(user.id, 'function-name');
    if (!canProceed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    // 8. BUSINESS LOGIC
    const result = await processRequest(body, user.id);

    // 9. SUCCESS RESPONSE
    return successResponse(result);

  } catch (error) {
    console.error('Function error:', error);
    return errorResponse(error.message, 500);
  }
});

// Helper functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

function successResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: corsHeaders,
  });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: corsHeaders,
  });
}
```

## Real Example: Lesson Content Generation

```typescript
// supabase/functions/generate-lesson-content/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface GenerateLessonRequest {
  topic: string;
  gradeLevel: number;
  subject: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  includeQuiz?: boolean;
  quizQuestions?: number;
}

interface GenerateLessonResponse {
  title: string;
  description: string;
  content_markdown: string;
  quiz_questions: QuizQuestion[];
  estimated_minutes: number;
  points_value: number;
  learning_objectives: string[];
  keywords: string[];
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Unauthorized', 401);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('Invalid user', 403);
    }

    // Parse request
    const body: GenerateLessonRequest = await req.json();

    // Validate input
    if (!body.topic || !body.gradeLevel || !body.subject) {
      return errorResponse('Missing required fields: topic, gradeLevel, subject', 400);
    }

    if (body.gradeLevel < 0 || body.gradeLevel > 12) {
      return errorResponse('Grade level must be between 0 and 12', 400);
    }

    // Check rate limit (5 requests per day per user)
    const { data: rateLimitData } = await supabase.rpc('check_rate_limit', {
      user_id_param: user.id,
      action_param: 'generate-lesson',
      max_requests_param: 5,
      time_window_param: 86400, // 24 hours in seconds
    });

    if (!rateLimitData) {
      return errorResponse('Rate limit exceeded. You can generate 5 lessons per day.', 429);
    }

    // Call Lovable AI API (or your AI provider)
    const aiResponse = await generateWithAI({
      topic: body.topic,
      gradeLevel: body.gradeLevel,
      subject: body.subject,
      difficulty: body.difficulty ?? 'medium',
    });

    // Generate quiz if requested
    let quizQuestions = [];
    if (body.includeQuiz) {
      quizQuestions = await generateQuiz(body.topic, body.quizQuestions ?? 5);
    }

    // Construct response
    const lesson: GenerateLessonResponse = {
      title: aiResponse.title,
      description: aiResponse.description,
      content_markdown: aiResponse.content,
      quiz_questions: quizQuestions,
      estimated_minutes: calculateEstimatedTime(aiResponse.content),
      points_value: calculatePoints(body.gradeLevel, body.difficulty),
      learning_objectives: aiResponse.objectives,
      keywords: aiResponse.keywords,
    };

    return successResponse(lesson);

  } catch (error) {
    console.error('Error generating lesson:', error);
    return errorResponse(error.message, 500);
  }
});

// Helper: Generate content with AI
async function generateWithAI(params: {
  topic: string;
  gradeLevel: number;
  subject: string;
  difficulty: string;
}): Promise<any> {
  const prompt = `Generate an educational lesson for grade ${params.gradeLevel} about "${params.topic}" in the subject of ${params.subject}. Difficulty: ${params.difficulty}.

Include:
- Engaging title
- Brief description
- Learning objectives (3-5 bullet points)
- Main content in markdown format (500-1000 words)
- Keywords for search

Format as JSON.`;

  const response = await fetch('https://api.lovable.dev/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('AI generation failed');
  }

  return await response.json();
}

// Helper: Calculate estimated time
function calculateEstimatedTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  const readingSpeed = 200; // words per minute for children
  return Math.ceil(wordCount / readingSpeed);
}

// Helper: Calculate points
function calculatePoints(gradeLevel: number, difficulty: string): number {
  const basePoints = 50;
  const gradeMultiplier = 1 + (gradeLevel / 12);
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  }[difficulty];

  return Math.round(basePoints * gradeMultiplier * difficultyMultiplier);
}
```

## Authentication Patterns

### Pattern 1: Require Authentication

```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return errorResponse('Unauthorized', 401);
}

const supabase = createClient(url, key, {
  global: { headers: { Authorization: authHeader } }
});

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return errorResponse('Invalid user', 403);
}
```

### Pattern 2: Verify Child Ownership

```typescript
// After authentication, verify child belongs to user
const { childId } = await req.json();

const { data: child, error } = await supabase
  .from('children')
  .select('id')
  .eq('id', childId)
  .single();

if (error || !child) {
  return errorResponse('Child not found or unauthorized', 403);
}
// Child ownership verified via RLS
```

### Pattern 3: Admin-Only Function

```typescript
// Check if user has admin role
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

const isAdmin = roles?.some(r => r.role === 'admin');
if (!isAdmin) {
  return errorResponse('Admin access required', 403);
}
```

## Rate Limiting

### RPC Function (in migration)

```sql
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_id_param UUID,
  action_param TEXT,
  max_requests_param INTEGER,
  time_window_param INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM rate_limit_log
  WHERE user_id = user_id_param
    AND action = action_param
    AND created_at > NOW() - (time_window_param || ' seconds')::INTERVAL;

  IF request_count >= max_requests_param THEN
    RETURN FALSE;
  END IF;

  INSERT INTO rate_limit_log (user_id, action)
  VALUES (user_id_param, action_param);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Usage in Edge Function

```typescript
const { data: canProceed } = await supabase.rpc('check_rate_limit', {
  user_id_param: user.id,
  action_param: 'generate-lesson',
  max_requests_param: 5,
  time_window_param: 86400, // 24 hours
});

if (!canProceed) {
  return errorResponse('Rate limit exceeded', 429);
}
```

## External API Integration

### Example: OpenAI Integration

```typescript
async function callOpenAI(prompt: string): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

## Error Handling

### Comprehensive Error Handling

```typescript
serve(async (req: Request): Promise<Response> => {
  try {
    // Main logic
  } catch (error) {
    // Log error details
    console.error('Function error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Categorize errors
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    } else if (error instanceof AuthError) {
      return errorResponse('Authentication failed', 401);
    } else if (error instanceof RateLimitError) {
      return errorResponse('Rate limit exceeded', 429);
    } else {
      // Generic server error
      return errorResponse('Internal server error', 500);
    }
  }
});

// Custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
```

## Testing Edge Functions Locally

### Local Development

```bash
# Start Supabase locally
npx supabase start

# Serve edge function
npx supabase functions serve function-name

# Or serve all functions
npx supabase functions serve

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key": "value"}'
```

### Test Script Example

```typescript
// test-edge-function.ts
const SUPABASE_URL = 'http://localhost:54321';
const ANON_KEY = 'your-anon-key';

async function testGenerateLesson() {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/generate-lesson-content`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Fractions',
        gradeLevel: 5,
        subject: 'math',
        difficulty: 'medium',
        includeQuiz: true,
      }),
    }
  );

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testGenerateLesson();
```

## Deployment

### Deploy Single Function

```bash
npx supabase functions deploy function-name
```

### Deploy All Functions

```bash
npx supabase functions deploy
```

### Set Environment Variables

```bash
# Set secret for production
npx supabase secrets set OPENAI_API_KEY=sk-...

# View secrets
npx supabase secrets list
```

## Common Edge Function Patterns

### Pattern 1: Data Processing

```typescript
// Process large dataset server-side
serve(async (req: Request) => {
  const { childId } = await req.json();

  // Fetch large dataset (RLS applies)
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('child_id', childId);

  // Process data
  const stats = {
    totalLessons: progress.length,
    completedLessons: progress.filter(p => p.status === 'completed').length,
    averageScore: progress.reduce((sum, p) => sum + p.score, 0) / progress.length,
    streakDays: calculateStreak(progress),
  };

  return successResponse(stats);
});
```

### Pattern 2: Background Job

```typescript
// Triggered by cron or webhook
serve(async (req: Request) => {
  // No authentication needed for cron jobs
  const cronSecret = req.headers.get('X-Cron-Secret');
  if (cronSecret !== Deno.env.get('CRON_SECRET')) {
    return errorResponse('Unauthorized', 401);
  }

  // Process expired quests
  const { data: expiredQuests } = await supabase
    .from('quests')
    .select('*')
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString());

  for (const quest of expiredQuests) {
    await supabase
      .from('quests')
      .update({ status: 'expired' })
      .eq('id', quest.id);
  }

  return successResponse({ processed: expiredQuests.length });
});
```

### Pattern 3: Webhook Handler

```typescript
// Handle webhook from external service
serve(async (req: Request) => {
  // Verify webhook signature
  const signature = req.headers.get('X-Webhook-Signature');
  const isValid = verifyWebhookSignature(await req.text(), signature);
  
  if (!isValid) {
    return errorResponse('Invalid signature', 401);
  }

  const event = await req.json();

  // Process webhook event
  switch (event.type) {
    case 'payment.succeeded':
      await handlePaymentSuccess(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailure(event.data);
      break;
    default:
      console.log('Unhandled event:', event.type);
  }

  return successResponse({ received: true });
});
```

## Security Best Practices

1. **Always validate input**: Check all request body fields
2. **Use RLS**: Let Supabase handle data access control
3. **Rate limit**: Prevent abuse of expensive operations
4. **Log errors**: Use console.error for debugging
5. **Timeout long operations**: Set reasonable timeouts
6. **Sanitize output**: Don't expose sensitive data
7. **Use environment variables**: Never hardcode secrets

## Environment Variables

Set in Supabase dashboard or via CLI:

```bash
# Common environment variables
SUPABASE_URL=<auto-provided>
SUPABASE_ANON_KEY=<auto-provided>
SUPABASE_SERVICE_ROLE_KEY=<auto-provided>

# Custom variables
OPENAI_API_KEY=sk-...
LOVABLE_API_KEY=...
WEBHOOK_SECRET=...
CRON_SECRET=...
```

## Verification Checklist

Before deploying:

- [ ] Function has proper error handling
- [ ] Authentication is checked
- [ ] Rate limiting is implemented
- [ ] Input validation is thorough
- [ ] Tested locally with `npx supabase functions serve`
- [ ] Environment variables are set
- [ ] CORS headers are included
- [ ] Function returns proper status codes
- [ ] Logs are added for debugging

## Resources

- Edge Functions: `supabase/functions/`
- Deno Docs: https://deno.land/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
