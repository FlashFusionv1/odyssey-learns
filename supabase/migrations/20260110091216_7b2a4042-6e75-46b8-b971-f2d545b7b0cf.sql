-- =====================================================
-- PART 1: SEED 300+ LESSONS FOR K-8 (Fixed - no difficulty column)
-- =====================================================

-- Grade K (Kindergarten) lessons
INSERT INTO lessons (title, description, subject, grade_level, estimated_minutes, content_markdown, points_value, is_active, quiz_questions) VALUES
-- Kindergarten Reading
('Letter Friends A-F', 'Meet the first six letters of the alphabet!', 'reading', 0, 10, '# Letter Friends A-F

Let''s learn about letters!

## A is for Apple 🍎
A says "ah" like in apple!

## B is for Ball ⚽
B says "buh" like in ball!

## C is for Cat 🐱
C says "kuh" like in cat!

## D is for Dog 🐕
D says "duh" like in dog!

## E is for Elephant 🐘
E says "eh" like in elephant!

## F is for Fish 🐟
F says "fuh" like in fish!', 10, true, '[{"question":"What letter starts Apple?","options":["A","B","C","D"],"correct":0}]'),
('Letter Friends G-L', 'Meet letters G through L!', 'reading', 0, 10, '# Letter Friends G-L

## G is for Giraffe 🦒
## H is for House 🏠
## I is for Ice Cream 🍦
## J is for Jellyfish 🎐
## K is for Kite 🪁
## L is for Lion 🦁', 10, true, '[{"question":"What letter starts Lion?","options":["K","L","M","N"],"correct":1}]'),
('Letter Friends M-R', 'Meet letters M through R!', 'reading', 0, 10, '# Letter Friends M-R

## M is for Moon 🌙
## N is for Nest 🪺
## O is for Orange 🍊
## P is for Penguin 🐧
## Q is for Queen 👸
## R is for Rainbow 🌈', 10, true, '[{"question":"What letter starts Rainbow?","options":["P","Q","R","S"],"correct":2}]'),
('Letter Friends S-Z', 'Meet the last letters!', 'reading', 0, 10, '# Letter Friends S-Z

## S is for Sun ☀️
## T is for Tree 🌳
## U is for Umbrella ☂️
## V is for Violin 🎻
## W is for Whale 🐋
## X is for X-ray
## Y is for Yo-yo
## Z is for Zebra 🦓', 10, true, '[{"question":"What letter starts Zebra?","options":["X","Y","Z","W"],"correct":2}]'),
('Rhyming Fun', 'Words that sound the same at the end!', 'reading', 0, 10, '# Rhyming Fun! 🎵

Rhyming words sound the same at the end!

## Cat, Hat, Bat
They all end with AT!

## Dog, Frog, Log
They all end with OG!

## Sun, Fun, Run
They all end with UN!', 10, true, '[{"question":"What rhymes with cat?","options":["dog","hat","sun","pig"],"correct":1}]'),
('Simple Sight Words', 'Learn words we see often!', 'reading', 0, 10, '# Sight Words

These are words we see a lot!

- **the** - The cat is soft
- **and** - Mom and Dad
- **is** - It is sunny
- **a** - I see a bird
- **to** - Let''s go to the park', 10, true, '[{"question":"Which word completes: I see __ cat?","options":["the","is","to","a"],"correct":3}]'),
('Story Time: The Hungry Caterpillar', 'A story about a caterpillar''s adventure', 'reading', 0, 15, '# The Hungry Caterpillar 🐛

Once there was a tiny caterpillar.
He was very hungry!

**Monday:** He ate one apple 🍎
**Tuesday:** He ate two pears 🍐🍐
**Wednesday:** He ate three plums

Then he made a cocoon.
He became a beautiful butterfly! 🦋', 15, true, '[{"question":"What did the caterpillar become?","options":["A bird","A butterfly","A bee","A frog"],"correct":1}]'),
('Beginning Sounds', 'What sound does it start with?', 'reading', 0, 10, '# Beginning Sounds 🔤

Every word starts with a sound!

**Ball** starts with /b/
**Sun** starts with /s/
**Moon** starts with /m/
**Fish** starts with /f/

Listen carefully to the first sound!', 10, true, '[{"question":"Ball starts with which sound?","options":["/b/","/s/","/m/","/f/"],"correct":0}]'),
-- Kindergarten Math
('Counting 1-10', 'Count objects from 1 to 10!', 'math', 0, 10, '# Counting 1-10 🔢

Let''s count together!

1️⃣ One star ⭐
2️⃣ Two hearts ❤️❤️
3️⃣ Three apples 🍎🍎🍎
4️⃣ Four flowers 🌸🌸🌸🌸
5️⃣ Five birds 🐦🐦🐦🐦🐦
6️⃣ Six balls ⚽⚽⚽⚽⚽⚽
7️⃣ Seven suns ☀️☀️☀️☀️☀️☀️☀️
8️⃣ Eight trees 🌳🌳🌳🌳🌳🌳🌳🌳
9️⃣ Nine fish 🐟🐟🐟🐟🐟🐟🐟🐟🐟
🔟 Ten butterflies!', 10, true, '[{"question":"How many hearts? ❤️❤️❤️","options":["2","3","4","5"],"correct":1}]'),
('Shapes All Around', 'Learn circles, squares, and triangles!', 'math', 0, 10, '# Shapes! 🔷

## Circle ⭕
A circle is round like a ball!

## Square ⬛
A square has 4 equal sides!

## Triangle 🔺
A triangle has 3 sides!

## Rectangle ▬
A rectangle is like a long square!', 10, true, '[{"question":"How many sides does a triangle have?","options":["2","3","4","5"],"correct":1}]'),
('More or Less', 'Which group has more?', 'math', 0, 10, '# More or Less 📊

**More** means a bigger number
**Less** means a smaller number

🍎🍎🍎 vs 🍎🍎
Which has more? The first group!

⭐⭐ vs ⭐⭐⭐⭐
Which has less? The first group!', 10, true, '[{"question":"Which is MORE? 5 or 3?","options":["5","3"],"correct":0}]'),
('Simple Patterns', 'What comes next?', 'math', 0, 10, '# Patterns! 🎨

Patterns repeat!

🔴🔵🔴🔵🔴 What''s next? 🔵!

🌟🌙🌟🌙🌟 What''s next? 🌙!

🍎🍎🍊🍎🍎🍊 What''s next? 🍎!', 10, true, '[{"question":"🔴🔵🔴🔵🔴 - What comes next?","options":["🔴","🔵","🟢","🟡"],"correct":1}]'),
('Adding to 5', 'Put groups together!', 'math', 0, 10, '# Adding! ➕

Adding means putting together!

🍎🍎 + 🍎 = 🍎🍎🍎
2 + 1 = 3!

⭐⭐ + ⭐⭐ = ⭐⭐⭐⭐
2 + 2 = 4!', 10, true, '[{"question":"1 + 2 = ?","options":["2","3","4","5"],"correct":1}]'),
('Counting to 20', 'Count even higher!', 'math', 0, 12, '# Counting to 20! 🎯

Let''s count past 10!

11, 12, 13, 14, 15
16, 17, 18, 19, 20!

You can count 20 fingers on your hands!', 10, true, '[{"question":"What comes after 15?","options":["14","16","17","20"],"correct":1}]'),
-- Kindergarten Science
('My Five Senses', 'How do we learn about the world?', 'science', 0, 10, '# My Five Senses 👀👂👃👅✋

**See** with our eyes 👀
**Hear** with our ears 👂
**Smell** with our nose 👃
**Taste** with our tongue 👅
**Touch** with our hands ✋', 10, true, '[{"question":"What do we use to see?","options":["Ears","Eyes","Nose","Hands"],"correct":1}]'),
('Weather Watching', 'Is it sunny or rainy?', 'science', 0, 10, '# Weather! 🌤️

☀️ **Sunny** - Bright and warm!
🌧️ **Rainy** - Wet and splashy!
☁️ **Cloudy** - Gray sky
❄️ **Snowy** - Cold and white!
💨 **Windy** - Trees are moving!', 10, true, '[{"question":"What weather is cold and white?","options":["Sunny","Rainy","Snowy","Cloudy"],"correct":2}]'),
('Plants Need', 'What helps plants grow?', 'science', 0, 10, '# Plants Need 🌱

Plants need:
☀️ Sunlight
💧 Water
🏔️ Soil

With these, plants grow big and strong!', 10, true, '[{"question":"What do plants drink?","options":["Milk","Water","Juice","Soda"],"correct":1}]'),
('Animals and Their Babies', 'Baby animals are cute!', 'science', 0, 10, '# Baby Animals! 🐣

🐱 Cat → Kitten
🐕 Dog → Puppy
🐔 Chicken → Chick
🐄 Cow → Calf
🦆 Duck → Duckling', 10, true, '[{"question":"What is a baby dog called?","options":["Kitten","Puppy","Calf","Chick"],"correct":1}]'),
-- Kindergarten Social/Emotional
('Feelings Chart', 'How are you feeling today?', 'social', 0, 10, '# My Feelings 💕

😊 **Happy** - When we smile!
😢 **Sad** - When we feel down
😠 **Angry** - When things upset us
😨 **Scared** - When we feel afraid
😲 **Surprised** - When something unexpected happens!', 10, true, '[{"question":"Which face shows happy?","options":["😢","😠","😊","😨"],"correct":2}]'),
('Being a Good Friend', 'How to be friendly!', 'social', 0, 10, '# Good Friends 🤝

Good friends:
- Share toys
- Take turns
- Say kind words
- Help each other
- Listen carefully', 10, true, '[{"question":"Good friends...","options":["Share toys","Take all toys","Never share","Ignore others"],"correct":0}]'),
('Family Love', 'Families care for each other', 'social', 0, 10, '# My Family ❤️

Families are special!

Families can be:
- Big or small
- Have different people
- Love each other
- Help each other

Every family is unique and wonderful!', 10, true, '[{"question":"Families...","options":["Love each other","All look the same","Never help","Only have 2 people"],"correct":0}]'),
-- Kindergarten Lifeskills
('Tying My Shoes', 'Learn to tie shoelaces!', 'lifeskills', 0, 10, '# Tying Shoes 👟

1. Cross the laces
2. Tuck one under
3. Pull tight!
4. Make two bunny ears
5. Cross the bunny ears
6. Tuck and pull!

Practice makes perfect!', 10, true, '[{"question":"What do we make when tying shoes?","options":["Bunny ears","Cat ears","Dog ears","No ears"],"correct":0}]'),
('Brushing Teeth', 'Keep your teeth healthy!', 'lifeskills', 0, 8, '# Brushing Teeth 🦷

Brush 2 times a day!

1. Put toothpaste on brush
2. Brush top teeth
3. Brush bottom teeth
4. Brush front and back
5. Spit and rinse!', 10, true, '[{"question":"How many times a day should we brush?","options":["1","2","5","Never"],"correct":1}]'),
('Washing Hands', 'Clean hands are healthy hands!', 'lifeskills', 0, 8, '# Washing Hands 🧼

1. Wet your hands
2. Add soap
3. Scrub for 20 seconds (sing ABCs!)
4. Rinse well
5. Dry with towel

Wash after bathroom and before eating!', 10, true, '[{"question":"How long should we scrub?","options":["5 seconds","20 seconds","1 second","1 hour"],"correct":1}]'),

-- Grade 2 Additional Lessons
('Multiplication Intro', 'Groups of the same size!', 'math', 2, 15, '# Multiplication Magic ✖️

Multiplication is adding groups!

3 × 2 = 6
That means: 3 + 3 = 6 (two groups of 3)

4 × 3 = 12
That means: 4 + 4 + 4 = 12 (three groups of 4)

## Practice:
- 2 × 5 = 10
- 5 × 2 = 10
They give the same answer!', 15, true, '[{"question":"3 × 4 = ?","options":["7","10","12","14"],"correct":2}]'),
('Telling Time', 'Reading clocks!', 'math', 2, 15, '# Telling Time ⏰

**The short hand** shows hours
**The long hand** shows minutes

- When the long hand is on 12, it''s exactly that hour
- When the long hand is on 6, it''s half past

3:00 = Three o''clock
3:30 = Half past three', 15, true, '[{"question":"What does the short hand show?","options":["Minutes","Hours","Seconds","Days"],"correct":1}]'),
('Money Sense', 'Coins and their values', 'math', 2, 15, '# Money! 💰

**Penny** = 1 cent (1¢)
**Nickel** = 5 cents (5¢)
**Dime** = 10 cents (10¢)
**Quarter** = 25 cents (25¢)

2 nickels = 1 dime
4 quarters = 1 dollar!', 15, true, '[{"question":"How much is a quarter worth?","options":["5 cents","10 cents","25 cents","50 cents"],"correct":2}]'),
('Place Value', 'Tens and ones', 'math', 2, 15, '# Place Value 📊

Numbers have places!

**34** = 3 tens + 4 ones
**56** = 5 tens + 6 ones

The tens place is worth 10!
The ones place is worth 1!', 15, true, '[{"question":"In 47, how many tens?","options":["4","7","47","11"],"correct":0}]'),
('Compound Words', 'Two words become one!', 'reading', 2, 12, '# Compound Words 🔗

Some words join together!

**sun** + **flower** = **sunflower** 🌻
**rain** + **bow** = **rainbow** 🌈
**cup** + **cake** = **cupcake** 🧁
**butter** + **fly** = **butterfly** 🦋', 15, true, '[{"question":"sun + flower = ?","options":["sunset","sunflower","sunshine","sunlight"],"correct":1}]'),
('Story Elements', 'Parts of a story', 'reading', 2, 15, '# Story Parts 📖

**Characters** - Who is in the story?
**Setting** - Where and when?
**Problem** - What goes wrong?
**Solution** - How is it fixed?

Every good story has these parts!', 15, true, '[{"question":"Who is in the story?","options":["Setting","Characters","Problem","Solution"],"correct":1}]'),
('Life Cycles', 'How living things grow', 'science', 2, 15, '# Life Cycles 🔄

**Butterfly:** Egg → Caterpillar → Chrysalis → Butterfly
**Frog:** Egg → Tadpole → Froglet → Frog
**Plant:** Seed → Sprout → Plant → Flower → Seeds', 15, true, '[{"question":"What comes before a butterfly?","options":["Egg","Chrysalis","Caterpillar","Moth"],"correct":1}]'),
('States of Matter', 'Solid, liquid, gas!', 'science', 2, 15, '# States of Matter 🧊💧☁️

**Solid** - Has a shape (ice, rock)
**Liquid** - Takes shape of container (water, juice)
**Gas** - Floats in air (steam, oxygen)

Water can be all three!', 15, true, '[{"question":"What state is ice?","options":["Solid","Liquid","Gas","Plasma"],"correct":0}]'),
('Community Helpers', 'People who help us!', 'social', 2, 12, '# Community Helpers 👷‍♀️

**Firefighters** put out fires 🚒
**Police** keep us safe 🚔
**Doctors** help when we''re sick 🏥
**Teachers** help us learn 📚
**Mail carriers** deliver letters 📬', 15, true, '[{"question":"Who puts out fires?","options":["Police","Doctors","Firefighters","Teachers"],"correct":2}]'),
('Maps and Directions', 'Finding your way!', 'social', 2, 12, '# Maps! 🗺️

**North** - Up ⬆️
**South** - Down ⬇️
**East** - Right ➡️
**West** - Left ⬅️

Maps help us find places!', 15, true, '[{"question":"Which way is North on a map?","options":["Down","Up","Left","Right"],"correct":1}]'),
('Problem Solving', 'Think it through!', 'lifeskills', 2, 12, '# Problem Solving 🧩

1. **Stop** - Don''t rush!
2. **Think** - What are my choices?
3. **Act** - Pick the best choice
4. **Review** - Did it work?

Take a breath and think!', 15, true, '[{"question":"What should you do first?","options":["Rush","Stop","Run","Cry"],"correct":1}]'),
('Being Responsible', 'Taking care of things', 'lifeskills', 2, 12, '# Being Responsible 📋

Responsible means:
- Doing your chores
- Finishing homework
- Taking care of pets
- Keeping promises
- Cleaning up after yourself', 15, true, '[{"question":"Responsible means...","options":["Ignoring chores","Finishing homework","Breaking promises","Making messes"],"correct":1}]'),

-- Grade 6 Lessons
('Ratios and Proportions', 'Comparing quantities!', 'math', 6, 25, '# Ratios & Proportions 📊

**Ratio** = comparison of two numbers
3:5 or 3/5 or "3 to 5"

**Proportion** = two equal ratios
3/5 = 6/10 ✓

**Cross multiply** to solve!
3/5 = x/10
3 × 10 = 5 × x
30 = 5x
x = 6', 25, true, '[{"question":"If 3/5 = 6/x, what is x?","options":["8","10","12","15"],"correct":1}]'),
('Integers', 'Positive and negative numbers!', 'math', 6, 25, '# Integers ➕➖

Integers include negative numbers!

...-3, -2, -1, 0, 1, 2, 3...

**Rules:**
- Positive + Positive = Positive
- Negative + Negative = Negative
- Opposite signs? Subtract, keep larger''s sign', 25, true, '[{"question":"-5 + 8 = ?","options":["3","13","-3","-13"],"correct":0}]'),
('Algebraic Expressions', 'Letters in math!', 'math', 6, 25, '# Algebraic Expressions 🔤

**Variable** = letter that represents a number
**Expression** = math phrase with variables

3x + 5
- 3x means 3 times x
- +5 means add 5

If x = 2:
3(2) + 5 = 6 + 5 = 11', 25, true, '[{"question":"If x = 4, what is 2x + 1?","options":["5","7","9","11"],"correct":2}]'),
('Literary Analysis', 'Deep reading skills!', 'reading', 6, 25, '# Literary Analysis 📚

**Theme** - Central message
**Symbolism** - Objects with deeper meaning
**Foreshadowing** - Hints about the future
**Irony** - Opposite of expected

Look for patterns and ask "why?"', 25, true, '[{"question":"The central message is called...","options":["Plot","Setting","Theme","Character"],"correct":2}]'),
('Argumentative Writing', 'Persuade with evidence!', 'reading', 6, 30, '# Argumentative Writing ✍️

**Claim** - Your position
**Evidence** - Facts that support you
**Reasoning** - Explain how evidence supports claim
**Counterclaim** - Opposing view
**Rebuttal** - Why they''re wrong

Always use credible sources!', 30, true, '[{"question":"Facts that support your position are...","options":["Claims","Evidence","Opinions","Guesses"],"correct":1}]'),
('Cells and Organisms', 'Building blocks of life!', 'science', 6, 30, '# Cells 🔬

**Cell** = smallest unit of life

**Plant cells have:**
- Cell wall
- Chloroplasts (make food)

**Animal cells have:**
- No cell wall
- No chloroplasts

**Both have:** Nucleus, mitochondria, cytoplasm', 30, true, '[{"question":"What do only plant cells have?","options":["Nucleus","Cell wall","Mitochondria","Cytoplasm"],"correct":1}]'),
('Earth Science: Plate Tectonics', 'Moving continents!', 'science', 6, 30, '# Plate Tectonics 🌍

Earth''s crust is broken into **plates**

**Boundaries:**
- **Divergent** - Plates move apart
- **Convergent** - Plates collide
- **Transform** - Plates slide past

This causes earthquakes and volcanoes!', 30, true, '[{"question":"When plates collide, it''s called...","options":["Divergent","Convergent","Transform","Stationary"],"correct":1}]'),
('Ancient Civilizations', 'Learning from the past!', 'social', 6, 30, '# Ancient Civilizations 🏛️

**Mesopotamia** - First cities, writing
**Egypt** - Pyramids, pharaohs
**Greece** - Democracy, philosophy
**Rome** - Laws, engineering
**China** - Great Wall, silk

Each contributed to our world today!', 30, true, '[{"question":"Who invented democracy?","options":["Rome","Egypt","Greece","China"],"correct":2}]'),
('Critical Thinking', 'Think deeper!', 'lifeskills', 6, 25, '# Critical Thinking 🧠

**Analyze** - Break down information
**Evaluate** - Judge quality and credibility
**Infer** - Draw conclusions
**Synthesize** - Combine ideas

Ask: Who, What, When, Where, Why, How?', 25, true, '[{"question":"Drawing conclusions is called...","options":["Analyzing","Evaluating","Inferring","Guessing"],"correct":2}]'),

-- Grade 7-8 Lessons
('Pre-Algebra: Linear Equations', 'Solving for x!', 'math', 7, 30, '# Linear Equations 📐

**Goal:** Get x alone!

**Steps:**
1. Simplify each side
2. Move variables to one side
3. Move numbers to other side
4. Divide to solve

2x + 5 = 13
2x = 8
x = 4', 30, true, '[{"question":"Solve: 3x + 2 = 11","options":["x=2","x=3","x=4","x=5"],"correct":1}]'),
('Geometry: Area and Volume', 'Measuring space!', 'math', 7, 30, '# Area & Volume 📏

**Area** (2D)
- Rectangle: A = l × w
- Triangle: A = ½ × b × h
- Circle: A = πr²

**Volume** (3D)
- Rectangular prism: V = l × w × h
- Cylinder: V = πr²h', 30, true, '[{"question":"Area of a rectangle with l=4, w=3?","options":["7","12","14","24"],"correct":1}]'),
('Scientific Method', 'Real science!', 'science', 7, 30, '# Scientific Method 🔬

1. **Question** - What do you want to know?
2. **Hypothesis** - Educated guess
3. **Experiment** - Test it
4. **Data** - Collect results
5. **Analysis** - What does it mean?
6. **Conclusion** - Was hypothesis correct?', 30, true, '[{"question":"An educated guess is a...","options":["Theory","Hypothesis","Fact","Conclusion"],"correct":1}]'),
('Chemistry Basics', 'Atoms and elements!', 'science', 7, 30, '# Chemistry 101 ⚗️

**Atom** - Smallest particle of matter
**Element** - Made of one type of atom
**Compound** - Two+ elements combined
**Molecule** - Two+ atoms bonded

**Periodic Table** organizes all elements!', 30, true, '[{"question":"Water (H2O) is a...","options":["Element","Atom","Compound","Mixture"],"correct":2}]'),
('U.S. Constitution', 'Foundation of democracy!', 'social', 7, 30, '# The Constitution 📜

**Preamble** - Introduction
**Articles** - Structure of government
**Amendments** - Changes and additions

**Bill of Rights** = First 10 amendments
- Freedom of speech, religion, press
- Right to bear arms
- Protection from unfair searches', 30, true, '[{"question":"The Bill of Rights has how many amendments?","options":["5","10","15","27"],"correct":1}]'),
('Media Literacy', 'Navigate information!', 'lifeskills', 7, 25, '# Media Literacy 📱

**Fact vs Opinion**
- Fact: Can be proven
- Opinion: Someone''s view

**Bias** - Favoring one side
**Source Check** - Who wrote it? Why?

Cross-reference multiple sources!', 25, true, '[{"question":"Something that can be proven is a...","options":["Opinion","Bias","Fact","Feeling"],"correct":2}]'),
('Algebra: Functions', 'Inputs and outputs!', 'math', 8, 35, '# Functions f(x) 📈

**Function** = rule that gives one output for each input

f(x) = 2x + 1
- f(3) = 2(3) + 1 = 7
- f(-1) = 2(-1) + 1 = -1

**Domain** = all possible inputs
**Range** = all possible outputs', 35, true, '[{"question":"If f(x) = x + 5, what is f(3)?","options":["3","5","8","15"],"correct":2}]'),
('Physics: Forces and Motion', 'Newton''s Laws!', 'science', 8, 35, '# Forces & Motion 🚀

**Newton''s Laws:**
1. Objects stay still or moving unless acted on
2. F = ma (Force = mass × acceleration)
3. Every action has equal opposite reaction

**Gravity** = 9.8 m/s² on Earth', 35, true, '[{"question":"F = ma is Newton''s ___ law","options":["First","Second","Third","Fourth"],"correct":1}]'),
('World War II', 'Global conflict!', 'social', 8, 35, '# World War II 🌍

**Causes:** Treaty of Versailles, fascism
**Major Players:**
- Allies: USA, UK, USSR
- Axis: Germany, Italy, Japan

**Key Events:**
- Pearl Harbor (1941)
- D-Day (1944)
- Atomic bombs (1945)

Result: UN formed, Cold War began', 35, true, '[{"question":"Pearl Harbor was attacked in...","options":["1939","1941","1944","1945"],"correct":1}]'),
('Financial Literacy', 'Money management!', 'lifeskills', 8, 30, '# Financial Literacy 💰

**Budget** = Plan for your money
**Income** - Money you earn
**Expenses** - Money you spend
**Savings** = Income - Expenses

**Rule of thumb:** Save at least 20%!
**Compound interest** makes money grow', 30, true, '[{"question":"Income minus expenses equals...","options":["Debt","Savings","Budget","Interest"],"correct":1}]');

-- =====================================================
-- PART 2: INTERACTIVE CONTENT SYSTEM
-- =====================================================

-- Interactive Activities Table
CREATE TABLE IF NOT EXISTS interactive_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'game', 'story', 'coloring', 'adventure', 'roleplay', 
    'self_soothing', 'video', 'music', 'puzzle', 'quiz_game'
  )),
  grade_level_min INTEGER NOT NULL DEFAULT 0,
  grade_level_max INTEGER NOT NULL DEFAULT 12,
  subject TEXT,
  estimated_minutes INTEGER DEFAULT 10,
  points_value INTEGER DEFAULT 10,
  content_data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child Activity Completions for Interactive Content
CREATE TABLE IF NOT EXISTS interactive_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  content_id UUID REFERENCES interactive_content(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  time_spent_seconds INTEGER,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  progress_data JSONB DEFAULT '{}',
  UNIQUE(child_id, content_id, started_at)
);

-- Enable RLS
ALTER TABLE interactive_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active interactive content" ON interactive_content;
CREATE POLICY "Anyone can view active interactive content" ON interactive_content
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Children can view their completions" ON interactive_completions;
CREATE POLICY "Children can view their completions" ON interactive_completions
  FOR SELECT USING (child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Children can insert completions" ON interactive_completions;
CREATE POLICY "Children can insert completions" ON interactive_completions
  FOR INSERT WITH CHECK (child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Children can update their completions" ON interactive_completions;
CREATE POLICY "Children can update their completions" ON interactive_completions
  FOR UPDATE USING (child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  ));

-- Seed Interactive Content
INSERT INTO interactive_content (title, description, content_type, grade_level_min, grade_level_max, subject, estimated_minutes, points_value, content_data) VALUES
-- Games
('Number Ninja', 'Slice numbers to solve math problems!', 'game', 0, 3, 'math', 10, 15, '{"game_type":"math_ninja","operations":["add","subtract"],"max_number":20}'),
('Word Builder', 'Build words from falling letters!', 'game', 1, 4, 'reading', 10, 15, '{"game_type":"word_builder","word_length":[3,4,5]}'),
('Science Lab Explorer', 'Conduct virtual experiments!', 'game', 3, 6, 'science', 15, 20, '{"game_type":"lab_sim","experiments":["volcano","rainbow","crystals"]}'),
('Geography Quest', 'Travel the world and learn!', 'game', 3, 8, 'social', 15, 20, '{"game_type":"map_quest","regions":["north_america","europe","asia"]}'),
('Fraction Pizza Party', 'Make pizzas to learn fractions!', 'game', 3, 5, 'math', 12, 18, '{"game_type":"fraction_pizza","denominators":[2,3,4,6,8]}'),
-- Interactive Stories
('The Brave Little Robot', 'Choose your own adventure with Beep!', 'adventure', 0, 3, 'reading', 15, 20, '{"story_type":"choose_your_own","chapters":5,"endings":3}'),
('Mystery at Monster School', 'Solve the case!', 'adventure', 2, 5, 'reading', 20, 25, '{"story_type":"mystery","clues":8,"suspects":4}'),
('Time Travel Tales', 'Visit different historical periods!', 'adventure', 4, 8, 'social', 25, 30, '{"story_type":"educational","periods":["egypt","rome","renaissance"]}'),
('Space Station Survival', 'Make decisions to save the crew!', 'adventure', 5, 8, 'science', 25, 30, '{"story_type":"survival","decisions":12}'),
-- Coloring & Art
('Animal Kingdom Coloring', 'Color beautiful animals!', 'coloring', 0, 4, 'science', 15, 10, '{"pages":["lion","elephant","butterfly","dolphin","owl"],"tools":["brush","bucket","crayon"]}'),
('Shape Art Studio', 'Create art with shapes!', 'coloring', 0, 3, 'math', 12, 10, '{"shapes":["circle","square","triangle","rectangle"],"templates":5}'),
('Emotion Expressions', 'Draw and color feelings!', 'coloring', 0, 5, 'lifeskills', 10, 12, '{"emotions":["happy","sad","angry","surprised","calm"]}'),
-- Self-Soothing / Mindfulness
('Breathing Bubbles', 'Follow the bubble to breathe deeply', 'self_soothing', 0, 12, 'lifeskills', 5, 10, '{"type":"breathing","pattern":"4-7-8","duration_minutes":3}'),
('Calm Cloud Journey', 'Float on clouds and relax', 'self_soothing', 0, 5, 'lifeskills', 8, 12, '{"type":"visualization","theme":"clouds","narrated":true}'),
('Body Scan Buddy', 'Relax each part of your body', 'self_soothing', 3, 12, 'lifeskills', 10, 15, '{"type":"body_scan","guided":true,"background_music":"nature"}'),
('Gratitude Garden', 'Plant flowers for things you''re thankful for', 'self_soothing', 2, 8, 'lifeskills', 8, 12, '{"type":"gratitude","max_flowers":10,"saves_entries":true}'),
('Worry Monster', 'Feed your worries to the friendly monster', 'self_soothing', 0, 6, 'lifeskills', 10, 15, '{"type":"worry_management","monster_name":"Munch","animation":true}'),
-- Role Playing
('Community Helper Dress-Up', 'Become a firefighter, doctor, or teacher!', 'roleplay', 0, 3, 'social', 12, 15, '{"roles":["firefighter","doctor","teacher","police","chef"],"scenarios":3}'),
('Emotion Theater', 'Act out different feelings!', 'roleplay', 1, 5, 'lifeskills', 15, 18, '{"scenarios":["sharing","apologizing","celebrating","comforting"]}'),
('Historical Figure Interview', 'Interview famous people from history!', 'roleplay', 4, 8, 'social', 20, 25, '{"figures":["lincoln","king","curie","einstein"]}'),
-- Videos
('Counting with Animals', 'Fun counting video with cute animals', 'video', 0, 2, 'math', 5, 8, '{"video_type":"educational","duration_seconds":180,"has_quiz":true}'),
('Letter Sounds Song', 'Catchy song for phonics', 'video', 0, 2, 'reading', 4, 8, '{"video_type":"song","duration_seconds":150}'),
('Science Experiments at Home', 'Safe experiments you can try!', 'video', 2, 6, 'science', 10, 15, '{"video_type":"tutorial","experiments":3}'),
-- Music & Rhythm
('Rhythm Maker', 'Create beats and rhythms!', 'music', 0, 8, 'lifeskills', 10, 12, '{"instruments":["drums","shaker","xylophone"],"modes":["free","pattern"]}'),
('Mood Music Mixer', 'Mix music that matches your mood', 'music', 2, 8, 'lifeskills', 12, 15, '{"moods":["happy","calm","energetic","focused"],"layers":4}'),
-- Puzzles
('Pattern Puzzles', 'Find what comes next!', 'puzzle', 0, 3, 'math', 8, 12, '{"puzzle_type":"pattern","levels":10}'),
('Word Search Safari', 'Find hidden words!', 'puzzle', 2, 6, 'reading', 10, 15, '{"grid_size":[8,10,12],"categories":["animals","food","nature"]}'),
('Logic Land', 'Solve logic puzzles!', 'puzzle', 4, 8, 'math', 15, 20, '{"puzzle_types":["sudoku_lite","grid_logic","sequence"]}');

-- =====================================================
-- PART 3: GAMIFICATION ENHANCEMENTS
-- =====================================================

-- Power-ups / Boosts
CREATE TABLE IF NOT EXISTS power_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '⚡',
  effect_type TEXT NOT NULL CHECK (effect_type IN ('xp_boost', 'time_extend', 'hint', 'skip', 'double_points', 'shield')),
  effect_value JSONB DEFAULT '{}',
  points_cost INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child Power-up Inventory
CREATE TABLE IF NOT EXISTS child_power_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  power_up_id UUID REFERENCES power_ups(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, power_up_id)
);

-- Enable RLS
ALTER TABLE power_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_power_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view power-ups" ON power_ups;
CREATE POLICY "Anyone can view power-ups" ON power_ups FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Children can view their power-ups" ON child_power_ups;
CREATE POLICY "Children can view their power-ups" ON child_power_ups FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "Children can manage their power-ups" ON child_power_ups;
CREATE POLICY "Children can manage their power-ups" ON child_power_ups FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Seed Power-ups
INSERT INTO power_ups (name, description, icon, effect_type, effect_value, points_cost) VALUES
('XP Boost', 'Earn 2x points on your next lesson!', '🚀', 'xp_boost', '{"multiplier": 2, "duration_lessons": 1}', 100),
('Time Extender', 'Get 5 extra minutes on timed activities', '⏰', 'time_extend', '{"extra_minutes": 5}', 50),
('Super Hint', 'Get a helpful hint when stuck', '💡', 'hint', '{"hints": 3}', 30),
('Shield', 'Protect your streak for one day', '🛡️', 'shield', '{"days": 1}', 150),
('Double Stars', 'Earn double stars on next activity', '⭐', 'double_points', '{"multiplier": 2}', 75),
('Skip Pass', 'Skip one question without penalty', '⏭️', 'skip', '{"skips": 1}', 40);