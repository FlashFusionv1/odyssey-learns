import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Grade 2 Lesson Outlines - 50 total lessons (10 per subject)
const GRADE_2_LESSONS = [
  // READING & LANGUAGE ARTS (10 Lessons)
  { id: "2-R-01", title: "Fluency Power: Reading with Expression", subject: "Reading", duration: 18, complexity: "Intermediate", objectives: ["Read with appropriate pacing and expression", "Use punctuation to guide intonation", "Practice repeated reading for fluency"], activities: ["Model reading video", "Punctuation practice", "Echo reading", "Record yourself reading"], assessment: "Read a 100-word passage aloud (70+ words per minute)" },
  { id: "2-R-02", title: "Asking Good Questions", subject: "Reading", duration: 18, complexity: "Intermediate", objectives: ["Generate questions before/during/after reading", "Use question words (who, what, when, where, why, how)", "Understand questioning improves comprehension"], activities: ["Question Detective game", "Before/during/after question chart", "Story: The Curious Case of the Missing Cookie", "Create questions for partner"], assessment: "Generate 3 questions about a passage and answer them" },
  { id: "2-R-03", title: "Making Predictions: What Happens Next?", subject: "Reading", duration: 18, complexity: "Intermediate", objectives: ["Use clues from text and pictures to predict", "Confirm or revise predictions while reading", "Understand predictions help engagement"], activities: ["Predict the Story interactive book", "Picture walk prediction", "What Will Happen Next? cliffhangers", "Create story predictions chart"], assessment: "Make 3 predictions about a story with reasoning" },
  { id: "2-R-04", title: "Retelling Stories: Beginning, Middle, End", subject: "Reading", duration: 20, complexity: "Intermediate", objectives: ["Identify story structure", "Retell story in sequence with key details", "Use transition words"], activities: ["Story map graphic organizer", "Interactive retelling", "Story Scramble game", "Record your retelling"], assessment: "Retell a story including characters, problem, and solution" },
  { id: "2-R-05", title: "Author's Purpose: Why Did They Write It?", subject: "Reading", duration: 18, complexity: "Advanced", objectives: ["Identify author's purpose (inform, persuade, entertain)", "Recognize text features that signal purpose", "Explain how you know the purpose"], activities: ["Purpose Sort game", "Read three texts, identify purpose", "Be the Author activity", "Create purpose poster"], assessment: "Identify author's purpose in 5 texts with evidence" },
  { id: "2-R-06", title: "Punctuation Playground", subject: "Reading", duration: 18, complexity: "Intermediate", objectives: ["Use periods, question marks, exclamation points correctly", "Understand how punctuation changes meaning", "Apply punctuation in writing"], activities: ["Fix the Sentences game", "Punctuation performance", "Sentence builder", "Create comic strip"], assessment: "Add correct punctuation to 10 sentences" },
  { id: "2-R-07", title: "Compound Words: Two Words Become One", subject: "Reading", duration: 18, complexity: "Intermediate", objectives: ["Define compound words", "Break compound words into parts", "Create new compound words"], activities: ["Compound Word Builder game", "Picture clues", "Make Your Own compound words", "Compound word search"], assessment: "Identify and break apart compound words" },
  { id: "2-R-08", title: "Context Clues: Be a Word Detective", subject: "Reading", duration: 20, complexity: "Advanced", objectives: ["Use surrounding words for unknown words", "Identify context clue types", "Apply context clues strategy"], activities: ["Detective Training video", "Practice passages", "Clue Collector game", "Create sentences with clues"], assessment: "Use context to determine meaning of 5 unknown words" },
  { id: "2-R-09", title: "Main Idea and Details", subject: "Reading", duration: 20, complexity: "Advanced", objectives: ["Identify main idea", "Find supporting details", "Distinguish main from unimportant details"], activities: ["Umbrella Organizer", "Read informational texts", "Detail or Not? game", "Create main idea poster"], assessment: "Identify main idea and 3 supporting details" },
  { id: "2-R-10", title: "Compare and Contrast", subject: "Reading", duration: 20, complexity: "Advanced", objectives: ["Understand compare means similarities", "Understand contrast means differences", "Use Venn diagrams"], activities: ["Interactive Venn diagram", "Compare animals", "Compare stories", "Create comparison chart"], assessment: "Complete Venn diagram comparing two texts" },
  
  // MATH (10 Lessons)
  { id: "2-M-01", title: "Addition Within 100: Two-Digit Magic", subject: "Math", duration: 20, complexity: "Intermediate", objectives: ["Add two-digit numbers without regrouping", "Use place value understanding", "Apply addition strategies"], activities: ["Base-ten blocks visual", "Number Line Jump game", "Real-world word problems", "Speed addition challenge"], assessment: "Solve 10 two-digit addition problems" },
  { id: "2-M-02", title: "Subtraction Within 100: Take It Away", subject: "Math", duration: 20, complexity: "Intermediate", objectives: ["Subtract two-digit numbers", "Understand subtraction as take away and difference", "Use subtraction strategies"], activities: ["Manipulative subtraction", "Subtraction Stories", "Number line jumps", "Fact fluency game"], assessment: "Solve 10 two-digit subtraction problems" },
  { id: "2-M-03", title: "Place Value: Hundreds, Tens, Ones", subject: "Math", duration: 20, complexity: "Advanced", objectives: ["Understand place value to hundreds", "Represent numbers in expanded form", "Compare three-digit numbers"], activities: ["Build the Number blocks", "Expanded form puzzles", "Place Value War game", "Create numbers with manipulatives"], assessment: "Identify place value and compare 3-digit numbers" },
  { id: "2-M-04", title: "Skip Counting: 2s, 5s, 10s", subject: "Math", duration: 18, complexity: "Intermediate", objectives: ["Skip count by 2s, 5s, 10s", "Identify patterns in skip counting", "Apply skip counting to solve problems"], activities: ["Skip counting songs", "Number line hop", "Pattern recognition game", "Real-world skip counting"], assessment: "Complete skip counting sequences and solve problems" },
  { id: "2-M-05", title: "Money Matters: Counting Coins", subject: "Math", duration: 20, complexity: "Intermediate", objectives: ["Identify penny, nickel, dime, quarter values", "Count mixed coins", "Make equivalent amounts"], activities: ["Coin sorting activity", "Virtual store shopping", "Make the Amount game", "Create money combinations"], assessment: "Count mixed coins and make change" },
  { id: "2-M-06", title: "Telling Time: Hour, Half Hour, Quarter Hour", subject: "Math", duration: 20, complexity: "Intermediate", objectives: ["Read analog and digital clocks", "Tell time to quarter hour", "Understand elapsed time"], activities: ["Interactive clock builder", "Daily schedule activity", "Time matching game", "Create your timeline"], assessment: "Tell time accurately and calculate elapsed time" },
  { id: "2-M-07", title: "Measurement: Length and Height", subject: "Math", duration: 20, complexity: "Intermediate", objectives: ["Measure using rulers (inches/centimeters)", "Estimate lengths", "Compare and order by length"], activities: ["Measuring station", "Estimation challenge", "Scavenger hunt measurements", "Create measurement chart"], assessment: "Measure 5 objects accurately and estimate lengths" },
  { id: "2-M-08", title: "Introduction to Multiplication", subject: "Math", duration: 20, complexity: "Advanced", objectives: ["Understand multiplication as repeated addition", "Use arrays to represent multiplication", "Solve basic multiplication problems"], activities: ["Array builder", "Skip counting connection", "Multiplication story problems", "Create multiplication posters"], assessment: "Represent and solve multiplication problems" },
  { id: "2-M-09", title: "Shapes and Their Attributes", subject: "Math", duration: 18, complexity: "Intermediate", objectives: ["Identify 2D shapes and attributes", "Identify 3D shapes", "Describe shapes using math vocabulary"], activities: ["Shape hunt", "Attribute sorting", "Build 3D shapes", "Shape riddles game"], assessment: "Identify shapes and describe their attributes" },
  { id: "2-M-10", title: "Data and Graphs: Picture Graphs and Bar Graphs", subject: "Math", duration: 20, complexity: "Intermediate", objectives: ["Read and interpret picture graphs", "Read and interpret bar graphs", "Create graphs from data"], activities: ["Class survey activity", "Build a graph interactive", "Graph interpretation questions", "Create your own graph"], assessment: "Interpret data and answer questions from graphs" },
  
  // SCIENCE (10 Lessons)
  { id: "2-S-01", title: "States of Matter: Solid, Liquid, Gas", subject: "Science", duration: 20, complexity: "Intermediate", objectives: ["Identify three states of matter", "Describe properties of each state", "Understand matter can change states"], activities: ["Matter exploration station", "Ice to water to steam demo", "Sort objects by state", "Create matter poster"], assessment: "Identify states and explain properties" },
  { id: "2-S-02", title: "Magnets: What Do They Attract?", subject: "Science", duration: 18, complexity: "Intermediate", objectives: ["Understand magnets attract certain metals", "Test magnetic properties", "Learn about magnetic poles"], activities: ["Magnetic vs non-magnetic sorting", "Magnet strength tests", "Pole attraction demo", "Create prediction chart"], assessment: "Predict and explain what magnets attract" },
  { id: "2-S-03", title: "Simple Machines Make Work Easier", subject: "Science", duration: 22, complexity: "Advanced", objectives: ["Identify six simple machines", "Understand how machines reduce force", "Find machines in everyday life"], activities: ["Simple Machine Safari", "Interactive demonstrations", "Build a lever experiment", "Name That Machine quiz"], assessment: "Identify machines and explain how they help" },
  { id: "2-S-04", title: "Animal Habitats: Where They Live", subject: "Science", duration: 20, complexity: "Intermediate", objectives: ["Define habitat", "Identify major habitats", "Match animals to habitats"], activities: ["Habitat Tour virtual field trip", "Animal habitat matching", "Design a Habitat activity", "Create diorama plan"], assessment: "Match 10 animals to correct habitats with reasoning" },
  { id: "2-S-05", title: "Life Cycles: How Things Grow", subject: "Science", duration: 22, complexity: "Advanced", objectives: ["Understand life cycles", "Compare different life cycles", "Sequence life cycle stages"], activities: ["Butterfly metamorphosis animation", "Life Cycle Wheel builder", "Compare/contrast cycles", "Observation journal"], assessment: "Sequence stages and compare two cycles" },
  { id: "2-S-06", title: "Sun, Moon, and Stars", subject: "Science", duration: 20, complexity: "Intermediate", objectives: ["Understand sun is a star", "Know moon reflects sunlight", "Identify moon phases"], activities: ["Virtual space tour", "Moon phase demonstration", "Star Light video", "Create moon phase calendar"], assessment: "Identify moon phases and explain sun vs moon" },
  { id: "2-S-07", title: "Weather Patterns and Predictions", subject: "Science", duration: 20, complexity: "Intermediate", objectives: ["Identify weather patterns", "Use weather tools", "Make weather predictions"], activities: ["Weather tracking chart", "Read thermometer activity", "Be a Meteorologist game", "Create forecast poster"], assessment: "Interpret weather data and make predictions" },
  { id: "2-S-08", title: "Forces: Push and Pull Advanced", subject: "Science", duration: 20, complexity: "Advanced", objectives: ["Understand force changes motion", "Compare strength of forces", "Identify friction effects"], activities: ["Force Lab virtual experiments", "Friction exploration", "Force and Motion Race", "Design force experiment"], assessment: "Identify forces and predict outcomes" },
  { id: "2-S-09", title: "Plant Needs and Adaptations", subject: "Science", duration: 22, complexity: "Advanced", objectives: ["Identify plant needs", "Understand plant adaptations", "Compare different plants"], activities: ["Plant observation station", "Adaptation matching game", "Design a plant activity", "Create care guide"], assessment: "Identify plant needs and explain adaptations" },
  { id: "2-S-10", title: "The Water Cycle", subject: "Science", duration: 20, complexity: "Advanced", objectives: ["Understand water cycle stages", "Explain evaporation/condensation", "Recognize water cycle in nature"], activities: ["Water cycle animation", "Mini water cycle in bag", "Cycle diagram builder", "Create water cycle model"], assessment: "Label and explain water cycle stages" },
  
  // SOCIAL STUDIES (10 Lessons)
  { id: "2-SS-01", title: "Maps and Globes: Finding Our Way", subject: "Social Studies", duration: 18, complexity: "Intermediate", objectives: ["Understand maps represent places", "Use map keys and symbols", "Identify cardinal directions"], activities: ["Map vs Globe comparison", "Treasure map activity", "Symbol matching game", "Create your neighborhood map"], assessment: "Read map using key and identify directions" },
  { id: "2-SS-02", title: "Community Helpers: People Who Help Us", subject: "Social Studies", duration: 18, complexity: "Beginner", objectives: ["Identify community helpers", "Understand their roles", "Appreciate their contributions"], activities: ["Community Helper match game", "Interview a helper activity", "Role play scenarios", "Create thank you cards"], assessment: "Identify helpers and describe their jobs" },
  { id: "2-SS-03", title: "Rules and Laws: Why We Need Them", subject: "Social Studies", duration: 18, complexity: "Intermediate", objectives: ["Understand difference between rules and laws", "Explain why rules help communities", "Identify consequences"], activities: ["School rules discussion", "Create class rules activity", "Law vs Rule sorting", "What if? scenarios"], assessment: "Explain purpose of rules and give examples" },
  { id: "2-SS-04", title: "Needs vs Wants: Making Choices", subject: "Social Studies", duration: 20, complexity: "Intermediate", objectives: ["Distinguish needs from wants", "Understand scarcity requires choices", "Apply to real-life decisions"], activities: ["Needs vs Wants sort", "Budget simulation game", "Family decision scenarios", "Create personal budget"], assessment: "Categorize items and explain choices" },
  { id: "2-SS-05", title: "Goods and Services in Our Community", subject: "Social Studies", duration: 20, complexity: "Intermediate", objectives: ["Define goods and services", "Identify producers and consumers", "Understand exchange"], activities: ["Goods vs Services sorting", "Classroom market simulation", "Producer/Consumer game", "Create business plan"], assessment: "Identify goods/services and explain exchange" },
  { id: "2-SS-06", title: "American Symbols and Landmarks", subject: "Social Studies", duration: 18, complexity: "Intermediate", objectives: ["Identify major American symbols", "Understand symbol meanings", "Locate famous landmarks"], activities: ["Symbol matching game", "Virtual landmark tour", "Pledge of Allegiance activity", "Create symbol poster"], assessment: "Identify 5 symbols and explain significance" },
  { id: "2-SS-07", title: "Native Americans: First People", subject: "Social Studies", duration: 20, complexity: "Advanced", objectives: ["Understand Native Americans were first", "Learn about different tribes", "Respect cultural contributions"], activities: ["Tribe introduction video", "Housing comparison activity", "Traditional skills exploration", "Create respect poster"], assessment: "Identify tribes and describe contributions" },
  { id: "2-SS-08", title: "Holidays and Celebrations Around the World", subject: "Social Studies", duration: 20, complexity: "Intermediate", objectives: ["Identify major world holidays", "Understand cultural traditions", "Appreciate diversity"], activities: ["Holiday calendar builder", "Virtual celebration tour", "Tradition comparison chart", "Create celebration guide"], assessment: "Describe 3 holidays from different cultures" },
  { id: "2-SS-09", title: "Then and Now: How Life Has Changed", subject: "Social Studies", duration: 20, complexity: "Intermediate", objectives: ["Compare past and present", "Understand technology changes", "Appreciate historical progress"], activities: ["Timeline activity", "Then vs Now comparison", "Interview grandparent project", "Create change poster"], assessment: "Compare past/present and explain changes" },
  { id: "2-SS-10", title: "Being a Good Citizen", subject: "Social Studies", duration: 18, complexity: "Intermediate", objectives: ["Define citizenship", "Identify citizen responsibilities", "Practice good citizenship"], activities: ["Citizenship scenarios", "Voting simulation", "Helping our school project", "Create citizenship pledge"], assessment: "Describe good citizenship with examples" },
  
  // LIFE SKILLS & EMOTIONAL INTELLIGENCE (10 Lessons)
  { id: "2-LS-01", title: "Understanding My Emotions", subject: "Life Skills", duration: 18, complexity: "Intermediate", objectives: ["Identify basic emotions", "Recognize emotions in self and others", "Express emotions appropriately"], activities: ["Emotion faces game", "Feelings thermometer", "Scenario discussions", "Create emotion journal"], assessment: "Identify emotions and describe appropriate responses" },
  { id: "2-LS-02", title: "Calm Down Strategies", subject: "Life Skills", duration: 20, complexity: "Intermediate", objectives: ["Recognize when feeling overwhelmed", "Practice calming techniques", "Choose effective strategies"], activities: ["Breathing exercises", "Calm down corner tour", "Strategy practice", "Create calm down toolkit"], assessment: "Demonstrate 3 calming strategies" },
  { id: "2-LS-03", title: "Friendship Skills: Making and Keeping Friends", subject: "Life Skills", duration: 20, complexity: "Intermediate", objectives: ["Understand qualities of good friends", "Practice friendship skills", "Resolve friend conflicts"], activities: ["Friendship qualities brainstorm", "Role play scenarios", "Conflict resolution steps", "Create friendship contract"], assessment: "Identify friendship skills and resolve scenarios" },
  { id: "2-LS-04", title: "Growth Mindset: I Can Learn!", subject: "Life Skills", duration: 18, complexity: "Advanced", objectives: ["Understand brain grows with practice", "Use 'yet' in challenges", "Embrace mistakes as learning"], activities: ["Brain growth video", "Fixed vs Growth sorting", "Mistake celebration activity", "Create growth mindset poster"], assessment: "Explain growth mindset with examples" },
  { id: "2-LS-05", title: "Listening Skills: Ears Open, Mouth Closed", subject: "Life Skills", duration: 18, complexity: "Intermediate", objectives: ["Understand good listening behaviors", "Practice active listening", "Show you're listening"], activities: ["Listening vs Not game", "Simon Says listening edition", "Partner interview activity", "Create listening checklist"], assessment: "Demonstrate active listening skills" },
  { id: "2-LS-06", title: "Problem Solving: Think It Through", subject: "Life Skills", duration: 20, complexity: "Advanced", objectives: ["Identify problem-solving steps", "Generate multiple solutions", "Evaluate consequences"], activities: ["Problem Solving Staircase", "Real-life scenarios", "Solution brainstorming", "Create problem-solving guide"], assessment: "Apply problem-solving steps to scenarios" },
  { id: "2-LS-07", title: "Responsible Choices", subject: "Life Skills", duration: 18, complexity: "Intermediate", objectives: ["Understand responsibility", "Make good choices", "Accept consequences"], activities: ["Choice and consequence matching", "Responsibility scenarios", "What would you do? game", "Create responsibility chart"], assessment: "Explain responsible choices with examples" },
  { id: "2-LS-08", title: "Showing Gratitude", subject: "Life Skills", duration: 18, complexity: "Intermediate", objectives: ["Define gratitude", "Express thanks appropriately", "Practice daily gratitude"], activities: ["Gratitude circle", "Thank you note writing", "Appreciation scavenger hunt", "Create gratitude journal"], assessment: "Express gratitude in multiple ways" },
  { id: "2-LS-09", title: "Dealing with Disappointment", subject: "Life Skills", duration: 20, complexity: "Advanced", objectives: ["Recognize disappointment feelings", "Practice coping strategies", "Develop resilience"], activities: ["Disappointment stories", "Coping strategy practice", "Bounce back scenarios", "Create resilience toolkit"], assessment: "Identify coping strategies for disappointment" },
  { id: "2-LS-10", title: "Setting Small Goals", subject: "Life Skills", duration: 20, complexity: "Advanced", objectives: ["Understand what goals are", "Set achievable goals", "Track progress"], activities: ["Goal vs Wish sorting", "SMART goal introduction", "Create personal goal", "Design goal tracker"], assessment: "Set and explain personal SMART goal" },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc('is_current_user_admin');
    if (roleError || !isAdmin) {
      console.warn(`Unauthorized seed-grade-2-lessons attempt by user ${user.id}`);
      return new Response(JSON.stringify({ 
        error: 'Admin access required',
        message: 'This operation is restricted to administrators'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin ${user.id} starting Grade 2 lesson generation...`);
    console.log(`Target: 50 lessons for Grade 2`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const grade = 2;
    let totalCreated = 0;
    const results = [];

    // Check existing lessons
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('title')
      .eq('grade_level', grade);
    
    const existingTitles = new Set(existingLessons?.map(l => l.title) || []);

    for (const lessonOutline of GRADE_2_LESSONS) {
      // Skip if already exists
      if (existingTitles.has(lessonOutline.title)) {
        console.log(`✓ Skipping existing: ${lessonOutline.title}`);
        continue;
      }

      console.log(`Generating: ${lessonOutline.title}...`);

      try {
        // Generate lesson content using AI
        const prompt = buildDetailedLessonPrompt(lessonOutline, grade);
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: 'You are an expert Grade 2 educator creating engaging, age-appropriate lesson content. Always return valid JSON with the exact structure requested.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI generation failed for ${lessonOutline.title}: ${aiResponse.statusText}`);
          throw new Error(`AI generation failed: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const generatedContent = aiData.choices[0].message.content;

        // Parse AI response
        let lessonData;
        try {
          const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                           generatedContent.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : generatedContent;
          lessonData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error(`Failed to parse AI response for ${lessonOutline.title}:`, parseError);
          // Create fallback content
          lessonData = {
            title: lessonOutline.title,
            description: lessonOutline.objectives.join('. '),
            content_markdown: createFallbackContent(lessonOutline),
            quiz_questions: createDefaultQuiz(lessonOutline),
          };
        }

        // Insert lesson into database
        const { data: insertedLesson, error: insertError } = await supabase
          .from('lessons')
          .insert({
            title: lessonOutline.title,
            subject: lessonOutline.subject,
            grade_level: grade,
            description: lessonData.description || lessonOutline.objectives.join('. '),
            content_markdown: lessonData.content_markdown,
            quiz_questions: lessonData.quiz_questions,
            estimated_minutes: lessonOutline.duration,
            points_value: calculatePoints(grade, lessonOutline.subject),
            is_active: true,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to insert ${lessonOutline.title}:`, insertError);
          throw insertError;
        }

        totalCreated++;
        results.push({ 
          id: lessonOutline.id, 
          title: lessonOutline.title, 
          dbId: insertedLesson.id 
        });
        console.log(`✓ Created: ${lessonOutline.title}`);

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error generating ${lessonOutline.title}:`, error);
        results.push({ 
          id: lessonOutline.id, 
          title: lessonOutline.title, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`\n=== Generation Complete ===`);
    console.log(`Created: ${totalCreated}/${GRADE_2_LESSONS.length} lessons`);

    return new Response(JSON.stringify({
      success: true,
      grade: 2,
      created: totalCreated,
      total: GRADE_2_LESSONS.length,
      results: results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seed-grade-2-lessons:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildDetailedLessonPrompt(lessonOutline: any, grade: number): string {
  return `Create a complete, engaging Grade ${grade} ${lessonOutline.subject} lesson titled "${lessonOutline.title}".

LESSON SPECIFICATIONS:
- Duration: ${lessonOutline.duration} minutes
- Complexity: ${lessonOutline.complexity}
- Learning Objectives: ${lessonOutline.objectives.join(', ')}
- Key Activities: ${lessonOutline.activities.join(', ')}
- Assessment: ${lessonOutline.assessment}

Generate a JSON response with this exact structure:
{
  "title": "${lessonOutline.title}",
  "description": "2-3 sentence overview for Grade ${grade} students",
  "content_markdown": "Full lesson content in markdown format (1500-2500 words) including:
    - Engaging introduction (What we'll learn today!)
    - Clear explanation of concepts with examples
    - Step-by-step activity instructions matching the key activities above
    - Practice exercises
    - Review and reflection questions
    Use Grade ${grade} appropriate language, short sentences, friendly tone",
  "quiz_questions": [
    {
      "question": "Multiple choice question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this is correct (student-friendly)"
    }
    // 5 total questions covering the learning objectives
  ]
}

IMPORTANT:
- Use age-appropriate vocabulary for 7-8 year olds
- Include encouragement and positive reinforcement
- Make it fun and engaging
- Ensure questions match the learning objectives
- Content must be ${lessonOutline.duration} minutes of learning`;
}

function createFallbackContent(lessonOutline: any): string {
  return `# ${lessonOutline.title}

## What We'll Learn Today! 🎯

${lessonOutline.objectives.map((obj: string) => `- ${obj}`).join('\n')}

## Let's Get Started! 🚀

Welcome to today's lesson! We're going to have fun learning about ${lessonOutline.title.toLowerCase()}.

## Activities

${lessonOutline.activities.map((activity: string, i: number) => 
  `### Activity ${i + 1}: ${activity}

Follow the instructions and do your best!

`).join('\n')}

## Review

Great job! Let's review what we learned:
${lessonOutline.objectives.map((obj: string) => `- ${obj}`).join('\n')}

## Keep Practicing! 💪

You did an amazing job today!`;
}

function createDefaultQuiz(lessonOutline: any): any[] {
  return lessonOutline.objectives.slice(0, 5).map((objective: string, i: number) => ({
    question: `Question about: ${objective}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct_answer: "Option A",
    explanation: "This demonstrates understanding of the learning objective."
  }));
}

function calculatePoints(grade: number, subject: string): number {
  const basePoints = 50 + (grade * 10);
  const multiplier = (subject === 'Math' || subject === 'Science') ? 1.2 : 1.0;
  return Math.round(basePoints * multiplier);
}
