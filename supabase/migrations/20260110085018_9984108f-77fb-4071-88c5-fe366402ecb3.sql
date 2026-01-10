-- Seed Grade 2 lessons
INSERT INTO lessons (grade_level, subject, title, description, content_markdown, estimated_minutes, points_value, is_active)
VALUES 
(2, 'reading', 'Long Vowel Sounds', 'Learn how vowels make their long sounds', '# Long Vowel Sounds\n\nWhen a vowel says its own name, we call it a **long vowel**!\n\n## The Magic E Rule\n- cap → cape\n- hop → hope\n\n## Practice Words\nmake, cake, lake, bike, hike, note, vote, home', 15, 25, true),
(2, 'reading', 'Compound Words', 'Learn how two words join to make one', '# Compound Words\n\nsun + flower = sunflower\ncup + cake = cupcake\nrain + bow = rainbow', 12, 20, true),
(2, 'reading', 'Sight Words Set 3', 'Master important words', '# Sight Words\n\nbecause, always, around, would, could', 10, 15, true),
(2, 'math', 'Adding Two-Digit Numbers', 'Add bigger numbers step by step', '# Adding Two-Digit Numbers\n\n34 + 25 = 59\nAdd ones first, then tens!', 20, 30, true),
(2, 'math', 'Subtracting Two-Digit Numbers', 'Subtract bigger numbers', '# Subtracting Two-Digit Numbers\n\n47 - 23 = 24', 20, 30, true),
(2, 'math', 'Skip Counting', 'Count by 2s, 5s, 10s', '# Skip Counting\n\nBy 2s: 2, 4, 6, 8, 10\nBy 5s: 5, 10, 15, 20, 25\nBy 10s: 10, 20, 30, 40, 50', 15, 25, true),
(2, 'math', 'Telling Time', 'Read clocks to quarter hour', '# Telling Time\n\n:15 = quarter past\n:30 = half past\n:45 = quarter to', 15, 25, true),
(2, 'science', 'States of Matter', 'Solids, liquids, and gases', '# States of Matter\n\nSolids keep shape\nLiquids take container shape\nGases fill all space', 20, 30, true),
(2, 'science', 'Animal Life Cycles', 'How animals grow and change', '# Life Cycles\n\nButterfly: Egg → Caterpillar → Chrysalis → Butterfly\nFrog: Egg → Tadpole → Froglet → Frog', 20, 30, true),
(2, 'social', 'Community Helpers', 'People who help us', '# Community Helpers\n\nDoctors, firefighters, police, teachers, mail carriers', 15, 25, true),
(2, 'social', 'Maps and Directions', 'Learn to read maps', '# Maps\n\nN=North, S=South, E=East, W=West', 18, 25, true),
(2, 'lifeskills', 'Understanding Feelings', 'Recognize and name emotions', '# Big Feelings\n\nHappy, Sad, Angry, Worried, Calm\nAll feelings are okay!', 15, 30, true),
(2, 'lifeskills', 'Calm Down Strategies', 'Ways to feel better', '# Calm Down\n\nBreathe slowly\nHug a stuffed animal\nDraw your feelings', 12, 25, true),
(2, 'lifeskills', 'Being a Good Friend', 'What makes friendships strong', '# Good Friends\n\nListen, share, help, be kind, say sorry', 15, 30, true);

-- Insert rewards for ALL parents
INSERT INTO rewards (parent_id, name, description, points_cost, is_active, redemption_count)
SELECT p.id, 'Extra Screen Time', '30 minutes extra screen time', 50, true, 0 FROM profiles p WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE parent_id = p.id);

INSERT INTO rewards (parent_id, name, description, points_cost, is_active, redemption_count)
SELECT p.id, 'Movie Night Pick', 'Choose the movie for movie night', 100, true, 0 FROM profiles p;

INSERT INTO rewards (parent_id, name, description, points_cost, is_active, redemption_count)
SELECT p.id, 'Stay Up Late', '15 minutes past bedtime', 75, true, 0 FROM profiles p;

INSERT INTO rewards (parent_id, name, description, points_cost, is_active, redemption_count)
SELECT p.id, 'Ice Cream Trip', 'Visit the ice cream shop', 150, true, 0 FROM profiles p;

INSERT INTO rewards (parent_id, name, description, points_cost, is_active, redemption_count)
SELECT p.id, 'New Book', 'Pick out a new book', 200, true, 0 FROM profiles p;

-- Grant points to children for testing
UPDATE children SET total_points = 500 WHERE total_points < 100;