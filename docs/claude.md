# Claude AI Integration Guide

> **How to integrate Claude AI (Anthropic) with Odyssey Learns for enhanced educational content generation and assistance**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Use Cases](#use-cases)
3. [Architecture](#architecture)
4. [Setup & Configuration](#setup--configuration)
5. [Implementation Examples](#implementation-examples)
6. [Best Practices](#best-practices)
7. [Cost Optimization](#cost-optimization)
8. [Security Considerations](#security-considerations)

---

## 🎯 Overview

Claude AI can enhance Odyssey Learns by providing:
- **Intelligent lesson generation** from parent prompts
- **Adaptive quiz creation** based on content
- **Personalized learning recommendations**
- **Content summarization and simplification**
- **Writing assistance for parents**
- **Automated feedback on student work**

### Why Claude?

- **Long context window**: Ideal for processing entire lessons
- **Strong reasoning**: Better educational content generation
- **Safety-focused**: Built-in content filtering for children
- **Markdown support**: Native markdown generation
- **Function calling**: Easy integration with existing systems

---

## 💡 Use Cases

### 1. AI-Powered Lesson Generation

**Feature**: Parents can describe a lesson concept, and Claude generates a complete, structured lesson.

**User Flow**:
```
Parent: "Create a Grade 3 math lesson about fractions using pizza examples"
    ↓
Claude API: Generates lesson with:
    - Introduction
    - Core concepts
    - Visual examples
    - Practice problems
    - Quiz questions
    ↓
Platform: Saves lesson, creates quiz entries
```

### 2. Adaptive Quiz Generation

**Feature**: Automatically generate quiz questions from lesson content.

**User Flow**:
```
System: Sends lesson content to Claude
    ↓
Claude: Analyzes content and generates 5-10 quiz questions
    - Multiple choice
    - True/false
    - Short answer
    ↓
Platform: Formats and stores questions
```

### 3. Personalized Study Assistant

**Feature**: Child can ask questions about lesson content and get clarification.

**User Flow**:
```
Child: "I don't understand what a denominator is"
    ↓
Claude: Explains concept using:
    - Age-appropriate language
    - Relevant examples
    - Step-by-step breakdown
    ↓
Platform: Logs interaction for parent visibility
```

### 4. Content Adaptation

**Feature**: Automatically adjust lesson difficulty based on grade level.

**Example**: Convert a Grade 6 lesson to Grade 3 level
```
Claude: Simplifies vocabulary, adds more examples, breaks complex concepts into steps
```

---

## 🏗️ Architecture

### Integration Pattern

```
┌────────────────────────────────────────┐
│        Odyssey Learns Frontend         │
└───────────────┬────────────────────────┘
                │
                │ Lesson generation request
                ↓
┌────────────────────────────────────────┐
│     Supabase Edge Function             │
│  (Claude API Integration Layer)        │
│                                        │
│  • Rate limiting                       │
│  • Request validation                  │
│  • Response caching                    │
│  • Usage tracking                      │
└───────────────┬────────────────────────┘
                │
                │ API call with system prompt
                ↓
┌────────────────────────────────────────┐
│         Claude API (Anthropic)         │
│  Model: claude-3-opus or claude-3-sonnet│
└───────────────┬────────────────────────┘
                │
                │ Generated content
                ↓
┌────────────────────────────────────────┐
│      Content Processing Pipeline       │
│                                        │
│  • Sanitization                        │
│  • Formatting                          │
│  • Validation                          │
│  • Database storage                    │
└────────────────────────────────────────┘
```

---

## ⚙️ Setup & Configuration

### Step 1: Get API Key

1. Sign up at https://console.anthropic.com
2. Create an API key
3. Add to Supabase secrets:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your_key_here
   ```

### Step 2: Create Edge Function

```bash
# Create new edge function
supabase functions new generate-lesson-claude

# Deploy
supabase functions deploy generate-lesson-claude
```

### Step 3: Environment Variables

```env
# .env.local
VITE_CLAUDE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/generate-lesson-claude

# Supabase secrets (server-side)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
MAX_TOKENS=4096
```

---

## 💻 Implementation Examples

### Edge Function: Lesson Generation

```typescript
// supabase/functions/generate-lesson-claude/index.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

interface LessonRequest {
  topic: string;
  gradeLevel: number;
  subject: string;
  duration: number; // minutes
  learningObjectives?: string[];
}

Deno.serve(async (req) => {
  // Verify authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse request
  const body: LessonRequest = await req.json();
  
  // Validate input
  if (!body.topic || !body.gradeLevel || !body.subject) {
    return new Response('Invalid request', { status: 400 });
  }

  // Rate limiting check (implement your logic)
  // const rateLimitOk = await checkRateLimit(userId);
  // if (!rateLimitOk) return new Response('Rate limit exceeded', { status: 429 });

  try {
    // System prompt for lesson generation
    const systemPrompt = `You are an expert educational content creator specializing in K-12 curriculum development. 
    
Create age-appropriate, engaging lessons that:
- Use clear, simple language for the grade level
- Include concrete examples and analogies
- Break complex topics into digestible parts
- Incorporate interactive elements
- Follow educational best practices
- Are 100% factually accurate

Format output as markdown with:
- Clear sections (Introduction, Main Content, Practice, Summary)
- Bullet points for key concepts
- Code blocks for examples (if applicable)
- Embedded quiz questions in a special format`;

    // User prompt
    const userPrompt = `Create a ${body.subject} lesson for Grade ${body.gradeLevel} students about: "${body.topic}"

Duration: ${body.duration} minutes
${body.learningObjectives ? `Learning Objectives:\n${body.learningObjectives.map(obj => `- ${obj}`).join('\n')}` : ''}

Requirements:
1. Introduction that hooks student interest
2. Main content with 3-5 key concepts
3. Visual examples or analogies
4. 3-5 practice problems or activities
5. Brief summary
6. 5 quiz questions (multiple choice and true/false)

Format quiz questions as:
QUIZ:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [Letter]
EXPLANATION: [Why this is correct]`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: Deno.env.get('ANTHROPIC_MODEL') || 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    // Extract response
    const content = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parse lesson and quiz questions
    const { lesson, quiz } = parseLessonContent(content);

    // Log usage for analytics
    console.log('Claude API usage:', {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
      model: message.model
    });

    return new Response(
      JSON.stringify({
        success: true,
        lesson: {
          title: body.topic,
          content_markdown: lesson,
          quiz_questions: quiz,
          grade_level: body.gradeLevel,
          subject: body.subject,
          estimated_minutes: body.duration,
          generated_by: 'claude-ai',
          metadata: {
            model: message.model,
            tokens_used: message.usage.input_tokens + message.usage.output_tokens
          }
        }
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Claude API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to generate lesson' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Helper function to parse lesson content
function parseLessonContent(content: string) {
  const quizMatch = content.match(/QUIZ:([\s\S]*?)(?:$|---)/);
  const quizSection = quizMatch ? quizMatch[1] : '';
  const lessonContent = content.replace(/QUIZ:[\s\S]*/, '').trim();

  const quiz = parseQuizQuestions(quizSection);

  return {
    lesson: lessonContent,
    quiz
  };
}

function parseQuizQuestions(quizSection: string) {
  const questions = [];
  const qRegex = /Q\d+:\s*(.*?)\n((?:[A-D]\).*?\n)*?)CORRECT:\s*(\w)\nEXPLANATION:\s*(.*?)(?=\n\n|Q\d+:|$)/gs;
  
  let match;
  while ((match = qRegex.exec(quizSection)) !== null) {
    const [_, question, optionsText, correct, explanation] = match;
    
    const options = {};
    const optionRegex = /([A-D])\)\s*(.*)/g;
    let optMatch;
    while ((optMatch = optionRegex.exec(optionsText)) !== null) {
      options[optMatch[1].toLowerCase()] = optMatch[2].trim();
    }

    questions.push({
      question: question.trim(),
      options,
      correct_answer: correct.toLowerCase(),
      explanation: explanation.trim()
    });
  }

  return questions;
}
```

### Frontend: Call Lesson Generation

```typescript
// src/lib/api/claudeIntegration.ts
import { supabase } from '@/integrations/supabase/client';

interface GenerateLessonParams {
  topic: string;
  gradeLevel: number;
  subject: string;
  duration: number;
  learningObjectives?: string[];
}

export async function generateLessonWithClaude(
  params: GenerateLessonParams
): Promise<Lesson> {
  // Get current user's session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Call edge function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson-claude`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate lesson');
  }

  const result = await response.json();
  
  // Save lesson to database
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      ...result.lesson,
      created_by: session.user.id,
      is_active: false, // Requires review
      source: 'ai_generated'
    })
    .select()
    .single();

  if (error) throw error;
  return lesson;
}
```

### React Component: Lesson Generator

```typescript
// src/components/admin/ClaudeLessonGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { generateLessonWithClaude } from '@/lib/api/claudeIntegration';
import { toast } from 'sonner';

export function ClaudeLessonGenerator() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState(3);
  const [subject, setSubject] = useState('math');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const lesson = await generateLessonWithClaude({
        topic,
        gradeLevel,
        subject,
        duration: 30,
      });

      toast.success('Lesson generated successfully!');
      // Navigate to lesson editor or preview
      navigate(`/admin/lessons/${lesson.id}/edit`);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      toast.error('Failed to generate lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">AI Lesson Generator</h2>
      <p className="text-gray-600">
        Powered by Claude AI - Describe your lesson topic and let AI create engaging content
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Lesson Topic</label>
          <Input
            placeholder="e.g., Introduction to Fractions using Pizza"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Grade Level</label>
            <Select
              value={gradeLevel.toString()}
              onValueChange={(val) => setGradeLevel(parseInt(val))}
              disabled={loading}
            >
              {Array.from({ length: 13 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? 'Kindergarten' : `Grade ${i}`}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select
              value={subject}
              onValueChange={setSubject}
              disabled={loading}
            >
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="science">Science</option>
              <option value="social">Social Studies</option>
              <option value="lifeskills">Life Skills</option>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Generating Lesson...' : 'Generate Lesson with AI'}
        </Button>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-600">
          <p>Claude AI is creating your lesson...</p>
          <p className="text-xs mt-1">This usually takes 10-20 seconds</p>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Best Practices

### 1. Prompt Engineering

**Do's**:
- ✅ Be specific about grade level and requirements
- ✅ Provide clear structure expectations
- ✅ Include example formats
- ✅ Request age-appropriate language
- ✅ Ask for educational best practices

**Don'ts**:
- ❌ Vague prompts like "create a lesson"
- ❌ Assuming Claude knows your specific curriculum
- ❌ Not specifying output format
- ❌ Forgetting to mention safety requirements

### 2. Content Validation

Always validate Claude's output:
```typescript
function validateLessonContent(lesson: string): boolean {
  // Check for inappropriate content
  if (containsInappropriateContent(lesson)) return false;
  
  // Verify minimum length
  if (lesson.length < 500) return false;
  
  // Ensure has required sections
  if (!hasRequiredSections(lesson)) return false;
  
  // Check factual accuracy (manual review recommended)
  return true;
}
```

### 3. Caching Strategy

Cache common lesson patterns:
```typescript
// Check cache before calling API
const cacheKey = `lesson-${subject}-${gradeLevel}-${topic}`;
const cached = await getCachedLesson(cacheKey);

if (cached && isFresh(cached)) {
  return cached;
}

// Generate new
const lesson = await generateLessonWithClaude({ ... });

// Cache for 7 days
await cacheLesson(cacheKey, lesson, 7 * 24 * 60 * 60);
```

### 4. Rate Limiting

Implement per-user limits:
```typescript
// Parent can generate 10 lessons per day
const limit = await rateLimiter.check(
  `claude-generation-${userId}`,
  10,
  24 * 60 * 60 * 1000
);

if (!limit.allowed) {
  throw new Error('Daily generation limit reached');
}
```

---

## 💰 Cost Optimization

### Token Usage Estimates

Claude API pricing (as of 2024):
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens

Average lesson generation:
- Input: ~1,000 tokens (prompts)
- Output: ~3,000 tokens (lesson content)
- **Cost per lesson**: ~$0.06

### Optimization Strategies

1. **Use Claude Sonnet** instead of Opus when possible
   - Sonnet: 5x cheaper
   - Opus: Only for complex content

2. **Cache System Prompts**
   - Reduces input tokens by 50%

3. **Batch Processing**
   - Generate multiple lessons in one call

4. **Quota Management**
   ```typescript
   // Track monthly usage
   const monthlyUsage = await getMonthlyTokenUsage(parentId);
   const quota = getParentQuota(parentId); // e.g., 100 lessons/month
   
   if (monthlyUsage >= quota) {
     throw new Error('Monthly quota exceeded');
   }
   ```

---

## 🔒 Security Considerations

### 1. API Key Protection

- ✅ Store in Supabase secrets (server-side only)
- ✅ Never expose in frontend code
- ✅ Rotate keys periodically
- ✅ Use environment-specific keys

### 2. Input Sanitization

```typescript
// Always sanitize user input before sending to Claude
const sanitizedTopic = sanitizeText(userInput.topic);
const sanitizedObjectives = userInput.objectives?.map(sanitizeText);
```

### 3. Content Filtering

```typescript
// Filter Claude's response before saving
const filteredContent = await moderateContent(claudeResponse);

if (filteredContent.flagged) {
  console.error('Inappropriate content detected:', filteredContent.flags);
  throw new Error('Generated content did not pass safety checks');
}
```

### 4. User Permissions

```typescript
// Only parents and admins can generate lessons
if (user.role !== 'parent' && user.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

### 5. Audit Logging

```typescript
// Log all AI generation requests
await supabase.from('ai_generation_logs').insert({
  user_id: userId,
  model: 'claude-3-sonnet',
  prompt_tokens: usage.input_tokens,
  completion_tokens: usage.output_tokens,
  cost_usd: calculateCost(usage),
  topic: sanitizedTopic,
  timestamp: new Date()
});
```

---

## 📊 Monitoring & Analytics

Track key metrics:
- Lessons generated per day/week/month
- Average generation time
- Token usage and costs
- Success/failure rates
- User satisfaction (ratings)
- Content quality (parent reviews)

```typescript
// Example analytics tracking
analytics.track('claude_lesson_generated', {
  subject,
  gradeLevel,
  tokens_used: usage.total_tokens,
  generation_time_ms: Date.now() - startTime,
  success: true
});
```

---

## 🔮 Future Enhancements

1. **Streaming Responses**: Real-time lesson generation with progress
2. **Fine-tuning**: Custom models for specific curricula
3. **Multi-turn Conversations**: Iterative lesson refinement
4. **Image Generation**: AI-generated lesson illustrations
5. **Voice Integration**: Text-to-speech for lessons
6. **Assessment Creation**: Automated test generation

---

## 📚 Resources

- [Claude API Documentation](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Educational AI Best Practices](https://www.anthropic.com/index/core-views-on-ai-safety)

---

**Last Updated**: 2025-12-30
