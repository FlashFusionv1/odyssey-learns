# GEMINI.md - Lovable AI Integration Guide

> Documentation for integrating and using Gemini (Lovable AI) for content generation in Inner Odyssey.

## Overview

Inner Odyssey uses **Lovable AI (powered by Gemini 2.5)** for:
- AI-powered lesson content generation
- Quiz question creation
- Parent insights and weekly reports
- Content personalization

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │ Custom Lesson   │    │ Admin Batch Generator       │    │
│  │ Generator       │    │ (BatchLessonGenerator.tsx)  │    │
│  │ Component       │    │                             │    │
│  └────────┬────────┘    └──────────────┬──────────────┘    │
└───────────┼─────────────────────────────┼──────────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                 │
│                                                            │
│  ┌──────────────────────┐  ┌────────────────────────┐     │
│  │ generate-custom-     │  │ batch-lesson-          │     │
│  │ lesson               │  │ generation             │     │
│  └──────────┬───────────┘  └───────────┬────────────┘     │
│             │                          │                   │
│             ▼                          ▼                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              generate-lesson-content                │   │
│  │              (Core AI Integration)                  │   │
│  └─────────────────────────┬──────────────────────────┘   │
└────────────────────────────┼──────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                      Lovable AI API                         │
│                    (Gemini 2.5 Model)                       │
└────────────────────────────────────────────────────────────┘
```

---

## Edge Functions

### 1. generate-lesson-content

**Purpose:** Core lesson generation engine

**Location:** `supabase/functions/generate-lesson-content/`

**Request:**
```typescript
interface GenerateLessonRequest {
  topic: string;           // Lesson topic
  gradeLevel: number;      // 0-12 (K=0)
  subject: string;         // math, reading, science, ei, life_skills
  difficulty?: 'easy' | 'medium' | 'hard';
  includeQuiz?: boolean;   // Default: true
  quizQuestions?: number;  // Default: 5
}
```

**Response:**
```typescript
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
```

**Rate Limit:** 10 requests per day per user

---

### 2. generate-custom-lesson

**Purpose:** User-initiated lesson generation

**Location:** `supabase/functions/generate-custom-lesson/`

**Features:**
- Validates user quota before generation
- Logs to `lesson_generation_dedup` for idempotency
- Stores result in `child_generated_lessons` table

**Rate Limit:** 5 requests per day per user

---

### 3. batch-lesson-generation

**Purpose:** Admin bulk lesson creation

**Location:** `supabase/functions/batch-lesson-generation/`

**Features:**
- Generates 10 lessons at once
- Queue-based processing
- Progress tracking
- Admin-only access

**Rate Limit:** None (admin only)

---

### 4. generate-weekly-reports

**Purpose:** Parent AI insights generation

**Location:** `supabase/functions/generate-weekly-reports/`

**Output:**
```typescript
interface WeeklyReport {
  summary: string;
  highlights: string[];
  areas_for_growth: string[];
  conversation_starters: string[];
  recommended_activities: string[];
}
```

---

### 5. ai-insights

**Purpose:** Real-time progress analysis

**Location:** `supabase/functions/ai-insights/`

**Features:**
- Analyzes child's recent activity
- Identifies learning patterns
- Suggests focus areas

---

## Content Templates

### Lesson Template (Gemini Prompt)

```markdown
Generate an educational lesson for a [GRADE_LEVEL] student about [TOPIC].

Subject: [SUBJECT]
Difficulty: [DIFFICULTY]

Requirements:
1. Age-appropriate language for grade [GRADE_LEVEL]
2. Engaging introduction with a hook
3. Clear learning objectives (3-5 bullet points)
4. Main content in markdown format (500-1000 words)
5. Real-world examples or applications
6. Summary/key takeaways

Emotional Intelligence Integration:
- Include reflection prompts
- Connect to feelings where appropriate
- Encourage growth mindset

Format the response as JSON:
{
  "title": "...",
  "description": "...",
  "content_markdown": "...",
  "learning_objectives": [...],
  "estimated_minutes": ...,
  "keywords": [...]
}
```

### Quiz Template (Gemini Prompt)

```markdown
Generate [COUNT] quiz questions for the lesson about [TOPIC].

Grade Level: [GRADE_LEVEL]
Difficulty: [DIFFICULTY]

Question Types:
- Multiple Choice (4 options, 1 correct)
- True/False
- Short Answer (1-2 sentence response)

Requirements:
1. Progressive difficulty (easy → medium → hard)
2. Cover all learning objectives
3. Include explanations for each answer
4. Age-appropriate language

Format as JSON array:
[
  {
    "question": "...",
    "type": "multiple_choice",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "explanation": "..."
  }
]
```

---

## Grade-Level Adaptations

| Grade | Reading Level | Vocabulary | Content Length | Quiz Complexity |
|-------|--------------|------------|----------------|-----------------|
| K-2 | Simple sentences | Basic words | 300-500 words | 3-5 questions |
| 3-5 | Paragraphs | Expanding | 500-800 words | 5-7 questions |
| 6-8 | Complex text | Academic | 800-1200 words | 7-10 questions |
| 9-12 | Advanced | Technical | 1000-1500 words | 10-15 questions |

---

## Subject-Specific Guidelines

### Math
- Include step-by-step problem solving
- Use visual representations (describe diagrams)
- Provide multiple example problems
- Connect to real-world applications

### Reading/Language Arts
- Include vocabulary words with definitions
- Reading comprehension questions
- Writing prompts
- Literary elements analysis (grades 6+)

### Science
- Hypothesis-experiment-conclusion format
- Hands-on activity suggestions
- Scientific method emphasis
- Safety considerations

### Emotional Intelligence
- Feeling identification exercises
- Scenario-based learning
- Coping strategy practice
- Reflection journaling prompts

### Life Skills
- Practical applications
- Step-by-step guides
- Decision-making scenarios
- Goal-setting exercises

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Rate limit exceeded | Too many requests | Wait for quota reset |
| Content too short | Generation failed | Retry with longer prompt |
| Invalid JSON | Parsing error | Validate and retry |
| Timeout | Complex request | Simplify or split request |

### Retry Strategy

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // ms

async function generateWithRetry(params: GenerateLessonRequest) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = await generate(params);
      return result;
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw error;
      await new Promise(r => setTimeout(r, RETRY_DELAY * (i + 1)));
    }
  }
}
```

---

## Content Review Workflow

### Automated Checks
1. **Length Validation** - Content meets minimum requirements
2. **Profanity Filter** - No inappropriate language
3. **Grade Level Analysis** - Vocabulary complexity check
4. **Quiz Validation** - All answers are correct format

### Human Review
1. Content accuracy verification
2. Age-appropriateness confirmation
3. Learning objective alignment
4. Cultural sensitivity review

### Review States
```
Generated → Pending Review → Approved → Published
                  ↓
              Rejected → Regenerate
```

---

## Performance Optimization

### Caching Strategy
- Cache common lesson topics (24-hour TTL)
- Store generation templates
- Cache quiz question pools by topic

### Batch Processing
- Queue lessons for off-peak generation
- Process in batches of 10
- Use background workers for large operations

### Cost Optimization
- Monitor API usage daily
- Use shorter prompts for simple content
- Cache frequently requested lessons

---

## Monitoring & Analytics

### Metrics to Track
- Lessons generated per day
- Average generation time
- Error rate by type
- User satisfaction (lesson ratings)
- Quiz completion rates

### Logging
```typescript
// Log generation events
await supabase.from('lesson_analytics_events').insert({
  event_type: 'lesson_generated',
  child_id: childId,
  metadata: {
    topic,
    gradeLevel,
    generationTime: duration,
    success: true
  }
});
```

---

## Security Considerations

### Input Validation
```typescript
// Sanitize user-provided topics
const cleanTopic = sanitizeText(topic, 100);
const validGrade = Math.min(12, Math.max(0, gradeLevel));
```

### Output Sanitization
```typescript
// Sanitize AI-generated content before display
const safeContent = sanitizeMarkdown(generatedContent);
```

### Rate Limiting
- Server-side enforcement via `check_rate_limit` RPC
- Per-user daily quotas
- Admin bypass for bulk operations

---

## Integration Examples

### Frontend Component

```typescript
// src/components/learning/CustomLessonGenerator.tsx
import { supabase } from '@/integrations/supabase/client';

const generateLesson = async (topic: string, gradeLevel: number) => {
  const { data, error } = await supabase.functions.invoke(
    'generate-custom-lesson',
    {
      body: {
        topic: sanitizeText(topic, 100),
        gradeLevel,
        childId
      }
    }
  );

  if (error) {
    handleError(error, { component: 'CustomLessonGenerator' });
    return null;
  }

  return data;
};
```

### Admin Batch Generation

```typescript
// src/components/admin/BatchLessonGenerator.tsx
const generateBatch = async (config: BatchConfig) => {
  const { data, error } = await supabase.functions.invoke(
    'batch-lesson-generation',
    {
      body: {
        subjects: config.subjects,
        gradeLevel: config.gradeLevel,
        count: 10
      }
    }
  );

  // Handle response
};
```

---

## Troubleshooting

### Lesson Generation Fails
1. Check rate limit status
2. Verify user authentication
3. Check edge function logs
4. Validate input parameters

### Content Quality Issues
1. Review prompt template
2. Check grade level parameter
3. Adjust difficulty setting
4. Add more context to topic

### Quiz Answer Mismatches
1. Validate JSON parsing
2. Check answer format
3. Review question types
4. Manual correction if needed

---

## Future Enhancements

### Q1 2026
- [ ] AI Tutor Chatbot integration
- [ ] Real-time content adaptation
- [ ] Learning style detection

### Q2 2026
- [ ] Multi-language content generation
- [ ] Voice-based lesson narration
- [ ] Personalized learning paths

### Q3 2026
- [ ] Image generation for lessons
- [ ] Interactive simulations
- [ ] AR/VR content support

---

## Resources

### Documentation
- [Lovable AI Docs](https://lovable.dev/docs)
- [Gemini API Reference](https://ai.google.dev/docs)
- [Edge Functions Guide](docs/EDGE_FUNCTIONS.md)

### Internal References
- Lesson outlines: `docs/kindergarten-lesson-outlines.md`
- Grade 2 content: `docs/grade-2-lesson-outlines.md`
- Content roadmap: `docs/comprehensive-enhancement-roadmap.md`

---

*Last Updated: 2025-12-30*
*Version: 1.0.0*
