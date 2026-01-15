-- Multiplayer Learning Games Tables
-- Game rooms for multiplayer sessions
CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('math_race', 'spelling_bee', 'science_quiz', 'story_builder', 'geography_challenge')),
  creator_id UUID REFERENCES children(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  max_players INTEGER DEFAULT 4 CHECK (max_players BETWEEN 2 AND 8),
  grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 0 AND 12),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  settings JSONB DEFAULT '{}',
  room_code TEXT UNIQUE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game players in each room
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES children(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'ready', 'playing', 'finished', 'left')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  UNIQUE(room_id, player_id)
);

-- Game questions for each session
CREATE TABLE game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'spelling')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 30,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, question_number)
);

-- Player answers for each question
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  question_id UUID REFERENCES game_questions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES children(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INTEGER,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, player_id)
);

-- Game results and history
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES children(id) ON DELETE SET NULL,
  final_scores JSONB NOT NULL DEFAULT '{}',
  total_questions INTEGER,
  duration_seconds INTEGER,
  xp_awarded JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate unique room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate room code on insert
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.room_code IS NULL THEN
    NEW.room_code := generate_room_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_rooms_set_code
BEFORE INSERT ON game_rooms
FOR EACH ROW EXECUTE FUNCTION set_room_code();

-- Enable RLS
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_rooms
CREATE POLICY "Anyone can view public game rooms"
ON game_rooms FOR SELECT
USING (status IN ('waiting', 'in_progress'));

CREATE POLICY "Children can create game rooms"
ON game_rooms FOR INSERT
WITH CHECK (
  creator_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

CREATE POLICY "Room creator can update room"
ON game_rooms FOR UPDATE
USING (creator_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- RLS Policies for game_players
CREATE POLICY "Players in room can view other players"
ON game_players FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM game_players 
    WHERE player_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  )
  OR room_id IN (SELECT id FROM game_rooms WHERE status = 'waiting')
);

CREATE POLICY "Children can join games"
ON game_players FOR INSERT
WITH CHECK (
  player_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

CREATE POLICY "Players can update own status"
ON game_players FOR UPDATE
USING (player_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- RLS Policies for game_questions
CREATE POLICY "Players can view questions in their games"
ON game_questions FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM game_players 
    WHERE player_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  )
);

-- RLS Policies for game_answers
CREATE POLICY "Players can view answers in their games"
ON game_answers FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM game_players 
    WHERE player_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  )
);

CREATE POLICY "Players can submit their own answers"
ON game_answers FOR INSERT
WITH CHECK (
  player_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- RLS Policies for game_results
CREATE POLICY "Players can view their game results"
ON game_results FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM game_players 
    WHERE player_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  )
);

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_answers;

-- Index for performance
CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_code ON game_rooms(room_code);
CREATE INDEX idx_game_players_room ON game_players(room_id);
CREATE INDEX idx_game_players_player ON game_players(player_id);
CREATE INDEX idx_game_answers_room ON game_answers(room_id);