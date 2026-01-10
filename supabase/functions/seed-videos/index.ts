import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoSeedData {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  transcript: string;
  chapter_markers: { time: number; title: string }[];
  quiz_timestamps: { time: number; question: string; options: string[]; correct_index: number }[];
  quiz_questions: { question: string; options: string[]; correct_index: number; explanation: string }[];
  grade_level: number;
  subject: string;
  difficulty: string;
  learning_objectives: string[];
  points_value: number;
}

// Comprehensive video library covering K-12
const VIDEO_LIBRARY: VideoSeedData[] = [
  // KINDERGARTEN (Grade 0)
  {
    title: "Learning the Alphabet - A to Z Adventure",
    description: "Join Sunny the Star on a magical journey through the alphabet! Learn all 26 letters with fun animations and songs.",
    video_url: "https://example.com/videos/alphabet-adventure.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
    duration_seconds: 480,
    transcript: "Welcome to our alphabet adventure! Today we're going to learn all 26 letters...",
    chapter_markers: [
      { time: 0, title: "Introduction" },
      { time: 60, title: "Letters A-G" },
      { time: 180, title: "Letters H-N" },
      { time: 300, title: "Letters O-T" },
      { time: 400, title: "Letters U-Z" },
    ],
    quiz_timestamps: [
      { time: 120, question: "What letter comes after B?", options: ["A", "C", "D", "E"], correct_index: 1 },
      { time: 240, question: "What sound does 'M' make?", options: ["Mmm", "Sss", "Bbb", "Ppp"], correct_index: 0 },
    ],
    quiz_questions: [
      { question: "How many letters are in the alphabet?", options: ["24", "25", "26", "27"], correct_index: 2, explanation: "There are 26 letters in the English alphabet!" },
      { question: "What is the first letter of the alphabet?", options: ["B", "A", "C", "Z"], correct_index: 1, explanation: "A is the first letter of the alphabet!" },
    ],
    grade_level: 0,
    subject: "Reading",
    difficulty: "beginner",
    learning_objectives: ["Recognize all 26 letters", "Identify letter sounds", "Sing the alphabet song"],
    points_value: 15,
  },
  {
    title: "Counting 1 to 10 with Friendly Numbers",
    description: "Learn to count from 1 to 10 with colorful animations and catchy songs!",
    video_url: "https://example.com/videos/counting-1-10.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400",
    duration_seconds: 360,
    transcript: "One little number, sitting all alone. Two little numbers, playing on their own...",
    chapter_markers: [
      { time: 0, title: "Welcome" },
      { time: 60, title: "Numbers 1-5" },
      { time: 200, title: "Numbers 6-10" },
    ],
    quiz_timestamps: [
      { time: 150, question: "What number comes after 3?", options: ["2", "4", "5", "1"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "How many fingers do you have on one hand?", options: ["3", "4", "5", "10"], correct_index: 2, explanation: "You have 5 fingers on one hand!" },
    ],
    grade_level: 0,
    subject: "Math",
    difficulty: "beginner",
    learning_objectives: ["Count from 1 to 10", "Recognize number symbols", "Count objects"],
    points_value: 15,
  },
  {
    title: "Understanding Our Feelings",
    description: "Learn about different emotions and how to express them in healthy ways.",
    video_url: "https://example.com/videos/feelings-k.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400",
    duration_seconds: 420,
    transcript: "Today we're going to talk about feelings. Sometimes we feel happy, sometimes we feel sad...",
    chapter_markers: [
      { time: 0, title: "What are Feelings?" },
      { time: 100, title: "Happy and Sad" },
      { time: 200, title: "Angry and Scared" },
      { time: 320, title: "How to Feel Better" },
    ],
    quiz_timestamps: [
      { time: 180, question: "When you smile, how do you usually feel?", options: ["Sad", "Happy", "Angry", "Tired"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What can you do when you feel angry?", options: ["Hit something", "Take deep breaths", "Yell loudly", "Run away"], correct_index: 1, explanation: "Taking deep breaths helps you calm down!" },
    ],
    grade_level: 0,
    subject: "Emotional Intelligence",
    difficulty: "beginner",
    learning_objectives: ["Identify basic emotions", "Express feelings with words", "Learn calming techniques"],
    points_value: 15,
  },

  // GRADE 1
  {
    title: "Addition Fun: Adding Numbers 1-10",
    description: "Master addition with numbers up to 10 through interactive examples and practice problems.",
    video_url: "https://example.com/videos/addition-1-10.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration_seconds: 540,
    transcript: "Addition is putting numbers together. Let's start with 1 + 1...",
    chapter_markers: [
      { time: 0, title: "What is Addition?" },
      { time: 120, title: "Adding with Objects" },
      { time: 300, title: "Practice Problems" },
      { time: 450, title: "Challenge Round" },
    ],
    quiz_timestamps: [
      { time: 200, question: "What is 2 + 3?", options: ["4", "5", "6", "7"], correct_index: 1 },
      { time: 400, question: "What is 4 + 4?", options: ["6", "7", "8", "9"], correct_index: 2 },
    ],
    quiz_questions: [
      { question: "What is 5 + 3?", options: ["6", "7", "8", "9"], correct_index: 2, explanation: "5 + 3 = 8. Count 5, then add 3 more!" },
      { question: "If you have 2 apples and get 4 more, how many do you have?", options: ["4", "5", "6", "7"], correct_index: 2, explanation: "2 + 4 = 6 apples!" },
    ],
    grade_level: 1,
    subject: "Math",
    difficulty: "beginner",
    learning_objectives: ["Understand addition concept", "Add numbers up to 10", "Solve word problems"],
    points_value: 15,
  },
  {
    title: "Reading Short Words - CVC Words",
    description: "Learn to read consonant-vowel-consonant words like cat, dog, and sun!",
    video_url: "https://example.com/videos/cvc-words.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    duration_seconds: 480,
    transcript: "Today we're going to learn about CVC words. C-V-C stands for consonant, vowel, consonant...",
    chapter_markers: [
      { time: 0, title: "What are CVC Words?" },
      { time: 90, title: "Short A Words" },
      { time: 200, title: "Short O Words" },
      { time: 320, title: "Reading Practice" },
    ],
    quiz_timestamps: [
      { time: 150, question: "What word is this: C-A-T?", options: ["Cut", "Cat", "Cot", "Kit"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "Which is a CVC word?", options: ["The", "Dog", "Play", "Be"], correct_index: 1, explanation: "Dog has consonant-vowel-consonant pattern: D-O-G!" },
    ],
    grade_level: 1,
    subject: "Reading",
    difficulty: "beginner",
    learning_objectives: ["Blend sounds to read words", "Identify CVC patterns", "Read simple sentences"],
    points_value: 15,
  },

  // GRADE 2
  {
    title: "Subtraction Strategies",
    description: "Learn multiple ways to subtract numbers and solve problems!",
    video_url: "https://example.com/videos/subtraction-2.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration_seconds: 600,
    transcript: "Subtraction is taking away. There are many strategies to help us subtract...",
    chapter_markers: [
      { time: 0, title: "Subtraction Basics" },
      { time: 150, title: "Counting Back" },
      { time: 300, title: "Using Number Lines" },
      { time: 450, title: "Word Problems" },
    ],
    quiz_timestamps: [
      { time: 200, question: "What is 8 - 3?", options: ["4", "5", "6", "7"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What is 15 - 7?", options: ["6", "7", "8", "9"], correct_index: 2, explanation: "15 - 7 = 8. You can count back 7 from 15!" },
    ],
    grade_level: 2,
    subject: "Math",
    difficulty: "beginner",
    learning_objectives: ["Subtract numbers up to 20", "Use mental math strategies", "Solve subtraction word problems"],
    points_value: 15,
  },

  // GRADE 3
  {
    title: "Introduction to Multiplication",
    description: "Discover the magic of multiplication and learn your times tables!",
    video_url: "https://example.com/videos/multiplication-intro.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400",
    duration_seconds: 720,
    transcript: "Multiplication is a faster way to add the same number multiple times...",
    chapter_markers: [
      { time: 0, title: "What is Multiplication?" },
      { time: 180, title: "Times Tables 2-5" },
      { time: 400, title: "Times Tables 6-9" },
      { time: 600, title: "Practice and Tricks" },
    ],
    quiz_timestamps: [
      { time: 250, question: "What is 3 x 4?", options: ["7", "10", "12", "14"], correct_index: 2 },
      { time: 500, question: "What is 6 x 7?", options: ["40", "42", "44", "48"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What is 5 x 5?", options: ["20", "25", "30", "35"], correct_index: 1, explanation: "5 x 5 = 25. Five groups of five!" },
      { question: "If you have 4 groups of 6 stickers, how many stickers total?", options: ["18", "20", "24", "28"], correct_index: 2, explanation: "4 x 6 = 24 stickers!" },
    ],
    grade_level: 3,
    subject: "Math",
    difficulty: "intermediate",
    learning_objectives: ["Understand multiplication concept", "Memorize times tables 2-9", "Apply multiplication to word problems"],
    points_value: 20,
  },

  // GRADE 4
  {
    title: "Fractions Made Easy",
    description: "Master fractions with visual examples and real-world applications!",
    video_url: "https://example.com/videos/fractions-4.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration_seconds: 900,
    transcript: "Fractions represent parts of a whole. Let's explore how they work...",
    chapter_markers: [
      { time: 0, title: "What are Fractions?" },
      { time: 200, title: "Comparing Fractions" },
      { time: 450, title: "Adding Fractions" },
      { time: 700, title: "Real World Examples" },
    ],
    quiz_timestamps: [
      { time: 300, question: "Which is larger: 1/2 or 1/4?", options: ["1/2", "1/4", "They're equal", "Can't tell"], correct_index: 0 },
    ],
    quiz_questions: [
      { question: "What is 1/4 + 1/4?", options: ["1/8", "2/8", "1/2", "1"], correct_index: 2, explanation: "1/4 + 1/4 = 2/4 = 1/2!" },
    ],
    grade_level: 4,
    subject: "Math",
    difficulty: "intermediate",
    learning_objectives: ["Understand fraction concepts", "Compare fractions", "Add and subtract fractions"],
    points_value: 20,
  },

  // GRADE 5
  {
    title: "Decimals and Percentages",
    description: "Connect fractions, decimals, and percentages in this comprehensive guide!",
    video_url: "https://example.com/videos/decimals-percentages.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration_seconds: 960,
    transcript: "Decimals, fractions, and percentages are three ways to show the same thing...",
    chapter_markers: [
      { time: 0, title: "Introduction" },
      { time: 240, title: "Fractions to Decimals" },
      { time: 500, title: "Decimals to Percentages" },
      { time: 750, title: "Practice Problems" },
    ],
    quiz_timestamps: [
      { time: 400, question: "What is 1/2 as a decimal?", options: ["0.25", "0.5", "0.75", "1.0"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What is 0.75 as a percentage?", options: ["25%", "50%", "75%", "100%"], correct_index: 2, explanation: "0.75 = 75% (multiply by 100)" },
    ],
    grade_level: 5,
    subject: "Math",
    difficulty: "intermediate",
    learning_objectives: ["Convert between fractions, decimals, percentages", "Understand place value", "Apply to real situations"],
    points_value: 25,
  },

  // GRADE 6
  {
    title: "Introduction to Ratios and Proportions",
    description: "Learn how ratios and proportions help us compare and solve real-world problems.",
    video_url: "https://example.com/videos/ratios-6.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration_seconds: 1020,
    transcript: "A ratio is a way to compare two quantities. Let's explore how to use them...",
    chapter_markers: [
      { time: 0, title: "What are Ratios?" },
      { time: 300, title: "Writing Ratios" },
      { time: 550, title: "Proportions" },
      { time: 800, title: "Solving Problems" },
    ],
    quiz_timestamps: [
      { time: 400, question: "If the ratio of boys to girls is 3:2, and there are 15 boys, how many girls?", options: ["8", "10", "12", "15"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What is the ratio 8:12 in simplest form?", options: ["2:3", "4:6", "1:2", "8:12"], correct_index: 0, explanation: "8:12 simplifies to 2:3 (divide both by 4)" },
    ],
    grade_level: 6,
    subject: "Math",
    difficulty: "intermediate",
    learning_objectives: ["Understand ratio concepts", "Write equivalent ratios", "Solve proportion problems"],
    points_value: 25,
  },

  // GRADE 7
  {
    title: "Pre-Algebra: Variables and Expressions",
    description: "Take your first steps into algebra with variables and expressions!",
    video_url: "https://example.com/videos/pre-algebra-7.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration_seconds: 1080,
    transcript: "Algebra uses letters called variables to represent unknown numbers...",
    chapter_markers: [
      { time: 0, title: "Introduction to Variables" },
      { time: 280, title: "Writing Expressions" },
      { time: 560, title: "Evaluating Expressions" },
      { time: 850, title: "Practice Problems" },
    ],
    quiz_timestamps: [
      { time: 450, question: "If x = 5, what is 3x + 2?", options: ["10", "15", "17", "20"], correct_index: 2 },
    ],
    quiz_questions: [
      { question: "Which expression represents 'a number plus 7'?", options: ["n - 7", "n + 7", "7n", "n/7"], correct_index: 1, explanation: "'Plus' means addition, so n + 7" },
    ],
    grade_level: 7,
    subject: "Math",
    difficulty: "intermediate",
    learning_objectives: ["Use variables in expressions", "Evaluate algebraic expressions", "Translate words to algebra"],
    points_value: 25,
  },

  // GRADE 8
  {
    title: "Linear Equations and Graphing",
    description: "Master linear equations and learn to graph on the coordinate plane!",
    video_url: "https://example.com/videos/linear-equations-8.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration_seconds: 1200,
    transcript: "Linear equations create straight lines when graphed. Let's explore how...",
    chapter_markers: [
      { time: 0, title: "The Coordinate Plane" },
      { time: 300, title: "Slope and Y-Intercept" },
      { time: 600, title: "Graphing Lines" },
      { time: 900, title: "Solving Equations" },
    ],
    quiz_timestamps: [
      { time: 500, question: "What is the slope of y = 2x + 3?", options: ["1", "2", "3", "5"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "In y = mx + b, what does 'b' represent?", options: ["Slope", "Y-intercept", "X-value", "Origin"], correct_index: 1, explanation: "'b' is the y-intercept where the line crosses the y-axis" },
    ],
    grade_level: 8,
    subject: "Math",
    difficulty: "advanced",
    learning_objectives: ["Understand slope and y-intercept", "Graph linear equations", "Solve linear equations"],
    points_value: 30,
  },

  // GRADE 9
  {
    title: "Algebra Foundations: Solving Equations",
    description: "Build a strong foundation in algebra with equation-solving techniques.",
    video_url: "https://example.com/videos/algebra-9.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration_seconds: 1320,
    transcript: "Algebra is the gateway to advanced mathematics. Let's master the fundamentals...",
    chapter_markers: [
      { time: 0, title: "One-Step Equations" },
      { time: 330, title: "Two-Step Equations" },
      { time: 660, title: "Multi-Step Equations" },
      { time: 1000, title: "Word Problems" },
    ],
    quiz_timestamps: [
      { time: 500, question: "Solve: 2x + 5 = 13", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What is the first step to solve 3(x + 2) = 15?", options: ["Add 2", "Divide by 3", "Distribute", "Subtract 15"], correct_index: 2, explanation: "First distribute: 3x + 6 = 15" },
    ],
    grade_level: 9,
    subject: "Algebra",
    difficulty: "intermediate",
    learning_objectives: ["Solve multi-step equations", "Apply inverse operations", "Translate word problems to equations"],
    points_value: 30,
  },
  {
    title: "Introduction to Biology: Cells and Life",
    description: "Explore the building blocks of life - from cell structure to cell function.",
    video_url: "https://example.com/videos/biology-cells-9.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400",
    duration_seconds: 1380,
    transcript: "Every living thing is made of cells. Let's discover what makes them work...",
    chapter_markers: [
      { time: 0, title: "What is a Cell?" },
      { time: 350, title: "Cell Organelles" },
      { time: 700, title: "Plant vs Animal Cells" },
      { time: 1050, title: "Cell Division" },
    ],
    quiz_timestamps: [
      { time: 550, question: "Which organelle is called the 'powerhouse' of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What structure is only found in plant cells?", options: ["Nucleus", "Cell wall", "Mitochondria", "Ribosome"], correct_index: 1, explanation: "Plant cells have a rigid cell wall that animal cells lack" },
    ],
    grade_level: 9,
    subject: "Biology",
    difficulty: "intermediate",
    learning_objectives: ["Identify cell structures", "Compare plant and animal cells", "Understand cell division"],
    points_value: 30,
  },

  // GRADE 10
  {
    title: "Geometry: Angles and Triangles",
    description: "Master geometric concepts from angle relationships to triangle properties.",
    video_url: "https://example.com/videos/geometry-10.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration_seconds: 1440,
    transcript: "Geometry is the study of shapes and their properties. Let's start with angles...",
    chapter_markers: [
      { time: 0, title: "Types of Angles" },
      { time: 360, title: "Angle Relationships" },
      { time: 720, title: "Triangle Properties" },
      { time: 1100, title: "Proofs" },
    ],
    quiz_timestamps: [
      { time: 550, question: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "If two angles are supplementary, they add up to:", options: ["90°", "180°", "270°", "360°"], correct_index: 1, explanation: "Supplementary angles sum to 180°" },
    ],
    grade_level: 10,
    subject: "Geometry",
    difficulty: "intermediate",
    learning_objectives: ["Classify angles and triangles", "Use angle relationships", "Write geometric proofs"],
    points_value: 30,
  },
  {
    title: "Chemistry: Atoms and the Periodic Table",
    description: "Discover the structure of atoms and navigate the periodic table like a pro!",
    video_url: "https://example.com/videos/chemistry-atoms-10.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    duration_seconds: 1500,
    transcript: "Everything around us is made of atoms. Let's explore their structure...",
    chapter_markers: [
      { time: 0, title: "Atomic Structure" },
      { time: 400, title: "Protons, Neutrons, Electrons" },
      { time: 800, title: "The Periodic Table" },
      { time: 1200, title: "Chemical Properties" },
    ],
    quiz_timestamps: [
      { time: 600, question: "What determines an element's atomic number?", options: ["Electrons", "Neutrons", "Protons", "Mass"], correct_index: 2 },
    ],
    quiz_questions: [
      { question: "Where are electrons found in an atom?", options: ["Nucleus", "Electron cloud", "Proton shell", "Neutron ring"], correct_index: 1, explanation: "Electrons orbit the nucleus in the electron cloud" },
    ],
    grade_level: 10,
    subject: "Chemistry",
    difficulty: "intermediate",
    learning_objectives: ["Understand atomic structure", "Read the periodic table", "Predict chemical properties"],
    points_value: 30,
  },

  // GRADE 11
  {
    title: "Algebra II: Quadratic Functions",
    description: "Master quadratic equations, graphing parabolas, and the quadratic formula.",
    video_url: "https://example.com/videos/algebra2-quadratics-11.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration_seconds: 1560,
    transcript: "Quadratic functions create parabola shapes. Let's explore their properties...",
    chapter_markers: [
      { time: 0, title: "Quadratic Equations" },
      { time: 400, title: "Graphing Parabolas" },
      { time: 800, title: "The Quadratic Formula" },
      { time: 1200, title: "Real-World Applications" },
    ],
    quiz_timestamps: [
      { time: 650, question: "What shape does a quadratic function create?", options: ["Line", "Circle", "Parabola", "Hyperbola"], correct_index: 2 },
    ],
    quiz_questions: [
      { question: "In the quadratic formula, what is under the square root?", options: ["a", "b", "c", "b² - 4ac"], correct_index: 3, explanation: "The discriminant b² - 4ac determines the number of solutions" },
    ],
    grade_level: 11,
    subject: "Algebra II",
    difficulty: "advanced",
    learning_objectives: ["Solve quadratic equations", "Graph parabolas", "Apply the quadratic formula"],
    points_value: 35,
  },
  {
    title: "US History: The American Revolution",
    description: "Explore the causes, key events, and outcomes of the American Revolution.",
    video_url: "https://example.com/videos/us-history-revolution-11.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=400",
    duration_seconds: 1620,
    transcript: "The American Revolution shaped the nation we know today. Let's explore how it began...",
    chapter_markers: [
      { time: 0, title: "Colonial Tensions" },
      { time: 400, title: "Key Events" },
      { time: 850, title: "Major Battles" },
      { time: 1300, title: "Declaration of Independence" },
    ],
    quiz_timestamps: [
      { time: 700, question: "What event occurred in 1773?", options: ["Boston Massacre", "Boston Tea Party", "Declaration of Independence", "Constitution signed"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "Who was the primary author of the Declaration of Independence?", options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"], correct_index: 2, explanation: "Thomas Jefferson drafted the Declaration of Independence" },
    ],
    grade_level: 11,
    subject: "US History",
    difficulty: "intermediate",
    learning_objectives: ["Analyze causes of the Revolution", "Identify key historical figures", "Understand founding documents"],
    points_value: 35,
  },

  // GRADE 12
  {
    title: "Pre-Calculus: Trigonometry",
    description: "Master trigonometric functions and their applications.",
    video_url: "https://example.com/videos/precalc-trig-12.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration_seconds: 1680,
    transcript: "Trigonometry connects angles to ratios. Let's explore these powerful relationships...",
    chapter_markers: [
      { time: 0, title: "Trigonometric Ratios" },
      { time: 420, title: "Unit Circle" },
      { time: 840, title: "Graphs of Trig Functions" },
      { time: 1300, title: "Identities" },
    ],
    quiz_timestamps: [
      { time: 600, question: "What is sin(30°)?", options: ["0", "0.5", "1", "√2/2"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "Which trig ratio is opposite/hypotenuse?", options: ["Sine", "Cosine", "Tangent", "Secant"], correct_index: 0, explanation: "Sine = Opposite / Hypotenuse (SOH)" },
    ],
    grade_level: 12,
    subject: "Pre-Calculus",
    difficulty: "advanced",
    learning_objectives: ["Use trigonometric ratios", "Apply the unit circle", "Graph trig functions"],
    points_value: 40,
  },
  {
    title: "Physics: Motion and Forces",
    description: "Understand Newton's laws and apply them to real-world physics problems.",
    video_url: "https://example.com/videos/physics-motion-12.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400",
    duration_seconds: 1740,
    transcript: "Physics explains how and why things move. Let's explore the laws of motion...",
    chapter_markers: [
      { time: 0, title: "Newton's First Law" },
      { time: 450, title: "Newton's Second Law" },
      { time: 900, title: "Newton's Third Law" },
      { time: 1350, title: "Problem Solving" },
    ],
    quiz_timestamps: [
      { time: 700, question: "What is the formula for Newton's Second Law?", options: ["F = ma", "E = mc²", "v = d/t", "p = mv"], correct_index: 0 },
    ],
    quiz_questions: [
      { question: "A 10 kg object accelerates at 5 m/s². What force is applied?", options: ["2 N", "15 N", "50 N", "500 N"], correct_index: 2, explanation: "F = ma = 10 kg × 5 m/s² = 50 N" },
    ],
    grade_level: 12,
    subject: "Physics",
    difficulty: "advanced",
    learning_objectives: ["Apply Newton's laws", "Calculate force and acceleration", "Analyze motion problems"],
    points_value: 40,
  },
  {
    title: "College Prep: Writing the Perfect Essay",
    description: "Learn strategies for writing compelling college application essays.",
    video_url: "https://example.com/videos/college-prep-essay-12.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    duration_seconds: 1200,
    transcript: "Your college essay is your chance to stand out. Let's make it memorable...",
    chapter_markers: [
      { time: 0, title: "Why Essays Matter" },
      { time: 300, title: "Choosing a Topic" },
      { time: 600, title: "Structure and Flow" },
      { time: 900, title: "Common Mistakes" },
    ],
    quiz_timestamps: [
      { time: 500, question: "What makes a strong college essay topic?", options: ["Generic achievements", "Personal and specific stories", "List of activities", "Quotes from famous people"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What should you avoid in a college essay?", options: ["Personal stories", "Specific details", "Clichés and generic statements", "Your authentic voice"], correct_index: 2, explanation: "Avoid clichés - be authentic and specific!" },
    ],
    grade_level: 12,
    subject: "College Prep",
    difficulty: "intermediate",
    learning_objectives: ["Choose compelling topics", "Structure essays effectively", "Avoid common mistakes"],
    points_value: 35,
  },

  // EMOTIONAL INTELLIGENCE (Multiple Grades)
  {
    title: "Managing Stress and Anxiety",
    description: "Learn effective techniques for managing stress and anxiety in school and life.",
    video_url: "https://example.com/videos/stress-management.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    duration_seconds: 900,
    transcript: "Stress is a normal part of life, but we can learn to manage it...",
    chapter_markers: [
      { time: 0, title: "Understanding Stress" },
      { time: 220, title: "Physical Techniques" },
      { time: 450, title: "Mental Strategies" },
      { time: 700, title: "Building Resilience" },
    ],
    quiz_timestamps: [
      { time: 350, question: "What is a healthy way to manage stress?", options: ["Avoiding all challenges", "Deep breathing", "Ignoring feelings", "Staying up late"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "Which is a sign of stress?", options: ["Feeling energized", "Difficulty sleeping", "Increased focus", "Better appetite"], correct_index: 1, explanation: "Stress often causes sleep problems" },
    ],
    grade_level: 6,
    subject: "Emotional Intelligence",
    difficulty: "intermediate",
    learning_objectives: ["Identify stress triggers", "Practice calming techniques", "Build healthy coping habits"],
    points_value: 25,
  },

  // LIFE SKILLS (Multiple Grades)
  {
    title: "Financial Literacy: Budgeting Basics",
    description: "Learn how to create and stick to a budget for smart money management.",
    video_url: "https://example.com/videos/budgeting-basics.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    duration_seconds: 1020,
    transcript: "Managing money is an essential life skill. Let's learn how to budget...",
    chapter_markers: [
      { time: 0, title: "Why Budget?" },
      { time: 260, title: "Income and Expenses" },
      { time: 520, title: "Creating a Budget" },
      { time: 780, title: "Saving Goals" },
    ],
    quiz_timestamps: [
      { time: 400, question: "What should you do first when creating a budget?", options: ["Buy what you want", "Track income", "Borrow money", "Ignore expenses"], correct_index: 1 },
    ],
    quiz_questions: [
      { question: "What is the 50/30/20 rule?", options: ["Study hours ratio", "Budget allocation: needs/wants/savings", "Sleep schedule", "Grade distribution"], correct_index: 1, explanation: "50% needs, 30% wants, 20% savings!" },
    ],
    grade_level: 8,
    subject: "Life Skills",
    difficulty: "beginner",
    learning_objectives: ["Create a personal budget", "Distinguish needs vs wants", "Set savings goals"],
    points_value: 25,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we should clear existing videos
    const { clearExisting } = await req.json().catch(() => ({ clearExisting: false }));

    if (clearExisting) {
      await supabase.from("video_lessons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Insert videos
    const insertedVideos = [];
    const errors = [];

    for (const video of VIDEO_LIBRARY) {
      const { data, error } = await supabase
        .from("video_lessons")
        .insert({
          title: video.title,
          description: video.description,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          duration_seconds: video.duration_seconds,
          transcript: video.transcript,
          chapter_markers: video.chapter_markers,
          quiz_timestamps: video.quiz_timestamps,
          quiz_questions: video.quiz_questions,
          grade_level: video.grade_level,
          subject: video.subject,
          difficulty: video.difficulty,
          learning_objectives: video.learning_objectives,
          points_value: video.points_value,
          is_active: true,
          view_count: 0,
        })
        .select()
        .single();

      if (error) {
        errors.push({ title: video.title, error: error.message });
      } else {
        insertedVideos.push(data);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedVideos.length} videos across K-12 grades`,
        inserted: insertedVideos.length,
        errors: errors.length,
        errorDetails: errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error seeding videos:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});