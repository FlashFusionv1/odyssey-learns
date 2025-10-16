import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { gradeLevel, subjects, lessonsPerSubject = 10 } = await req.json();

    if (gradeLevel === undefined || !subjects || !Array.isArray(subjects)) {
      throw new Error('Grade level and subjects array required');
    }

    console.log(`Generating ${subjects.length * lessonsPerSubject} lessons for Grade ${gradeLevel}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const allLessons = [];

    // Generate lessons per subject
    for (const subject of subjects) {
      for (let i = 0; i < lessonsPerSubject; i++) {
        const lessonNumber = i + 1;
        
        console.log(`Generating ${subject} lesson ${lessonNumber}/${lessonsPerSubject}...`);
        
        // Generate AI content using Lovable AI
        const prompt = buildLessonPrompt(gradeLevel, subject, lessonNumber);
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: 'You are an expert K-12 educator creating engaging, age-appropriate lesson content. Always return valid JSON.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI generation failed for ${subject} lesson ${lessonNumber}: ${aiResponse.statusText}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const generatedContent = aiData.choices[0].message.content;

        // Parse AI response
        let lessonData;
        try {
          // Try to extract JSON if wrapped in markdown code blocks
          const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                           generatedContent.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : generatedContent;
          lessonData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error(`Failed to parse AI response for ${subject} lesson ${lessonNumber}:`, parseError);
          // Fallback lesson structure
          lessonData = {
            title: `${subject} Lesson ${lessonNumber}`,
            description: `Explore ${subject} concepts for grade ${gradeLevel}`,
            content_markdown: generatedContent.substring(0, 1000),
            quiz_questions: generateDefaultQuiz(subject, gradeLevel)
          };
        }

        allLessons.push({
          title: lessonData.title,
          description: lessonData.description,
          subject,
          grade_level: gradeLevel,
          content_markdown: lessonData.content_markdown,
          quiz_questions: lessonData.quiz_questions || [],
          estimated_minutes: calculateDuration(gradeLevel),
          points_value: calculatePoints(gradeLevel, subject),
          is_active: true,
          thumbnail_url: `/images/subjects/${subject.toLowerCase().replace(/\s+/g, '-')}.jpg`
        });

        // Rate limit: pause between requests
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }

    // Batch insert
    const { data, error } = await supabase
      .from('lessons')
      .insert(allLessons)
      .select();

    if (error) throw error;

    console.log(`Successfully created ${data.length} lessons for Grade ${gradeLevel}`);

    return new Response(JSON.stringify({ 
      success: true, 
      count: data.length,
      grade: gradeLevel,
      subjects: subjects,
      lessons: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function buildLessonPrompt(grade: number, subject: string, lessonNum: number): string {
  const ageRange = getAgeRange(grade);
  const gradeLabel = grade === 0 ? 'Kindergarten' : `${grade}${getGradeSuffix(grade)} grade`;
  
  return `Create a comprehensive ${subject} lesson for ${gradeLabel} (ages ${ageRange}).

Lesson Number: ${lessonNum} of 10 in the series.

Return ONLY valid JSON with this exact structure:
{
  "title": "Engaging lesson title (max 60 chars)",
  "description": "Clear 2-sentence description of what students will learn",
  "content_markdown": "Full markdown lesson content with ## headings, bullet points, and examples. Include: Learning Objectives, Main Content, Interactive Activities, and Reflection Questions. 500-800 words.",
  "quiz_questions": [
    {
      "question": "Age-appropriate question text",
      "options": ["Option A", "Option B", "Option C"],
      "correct": "Option A",
      "explanation": "Encouraging explanation with correct answer reasoning"
    }
  ]
}

Requirements:
- Create 3 quiz questions, each with 3 options (grade ${grade} appropriate difficulty)
- Use encouraging, positive language ("Great thinking!", "You've got this!", "Wonderful!")
- ${grade <= 2 ? 'Use simple vocabulary and short sentences. Include lots of examples and visuals.' : grade <= 5 ? 'Use transitioning reader level vocabulary. Explain new concepts clearly.' : grade <= 8 ? 'Use grade-appropriate complexity. Include real-world applications.' : 'Use advanced vocabulary and complex concepts. Encourage critical thinking.'}
- Include interactive elements: "Try this!", "Draw a picture of...", "Discuss with a friend..."
- Connect to real-world examples relevant to ${ageRange} year olds
- Make it fun and engaging!

Return ONLY the JSON, no additional text.`;
}

function getAgeRange(grade: number): string {
  const baseAge = grade === 0 ? 5 : grade + 5;
  return `${baseAge}-${baseAge + 1}`;
}

function getGradeSuffix(grade: number): string {
  if (grade === 0) return '';
  if (grade === 1) return 'st';
  if (grade === 2) return 'nd';
  if (grade === 3) return 'rd';
  return 'th';
}

function calculateDuration(grade: number): number {
  if (grade <= 2) return 10 + Math.floor(Math.random() * 5); // 10-15 min
  if (grade <= 5) return 15 + Math.floor(Math.random() * 10); // 15-25 min
  if (grade <= 8) return 20 + Math.floor(Math.random() * 15); // 20-35 min
  return 25 + Math.floor(Math.random() * 20); // 25-45 min
}

function calculatePoints(grade: number, subject: string): number {
  const basePoints = 50 + (grade * 5);
  const subjectMultiplier = ['math', 'science'].includes(subject.toLowerCase()) ? 1.2 : 1;
  return Math.round(basePoints * subjectMultiplier);
}

function generateDefaultQuiz(subject: string, grade: number): any[] {
  return [
    {
      question: `Sample ${subject} question for grade ${grade}`,
      options: ['Option A', 'Option B', 'Option C'],
      correct: 'Option A',
      explanation: 'This would be an age-appropriate explanation.'
    },
    {
      question: `Another ${subject} question`,
      options: ['Choice 1', 'Choice 2', 'Choice 3'],
      correct: 'Choice 1',
      explanation: 'Great job thinking about this!'
    },
    {
      question: `Final ${subject} question`,
      options: ['Answer X', 'Answer Y', 'Answer Z'],
      correct: 'Answer X',
      explanation: 'You got it right!'
    }
  ];
}
