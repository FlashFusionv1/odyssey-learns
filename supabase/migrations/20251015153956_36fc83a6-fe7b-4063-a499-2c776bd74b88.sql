-- Migration for Phase 2: Engagement Features

-- 1. Parent Onboarding Tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- 2. Daily Quest System for Children
ALTER TABLE children
ADD COLUMN IF NOT EXISTS daily_quest_id UUID REFERENCES lessons(id),
ADD COLUMN IF NOT EXISTS quest_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quest_bonus_points INTEGER DEFAULT 0;

-- 3. Avatar Items Table (for future avatar store)
CREATE TABLE IF NOT EXISTS avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('hair', 'color', 'accessory')),
  item_name TEXT NOT NULL,
  item_svg_data TEXT NOT NULL,
  points_cost INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_type, item_name)
);

-- Enable RLS on avatar_items
ALTER TABLE avatar_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view avatar items
CREATE POLICY "Authenticated users can view avatar items"
ON avatar_items FOR SELECT
TO authenticated
USING (true);

-- Seed default avatar items
INSERT INTO avatar_items (item_type, item_name, item_svg_data, is_default, points_cost) VALUES
('hair', 'short', 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 L18,8 Q18,10 16,10 L14,10 Q12,10 12,8 Z', true, 0),
('hair', 'long', 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 L18,12 Q18,14 16,14 L14,14 Q12,14 12,12 Z', true, 0),
('hair', 'curly', 'M12,4 Q12,2 14,2 Q15,2 15,3 Q15,2 16,2 Q18,2 18,4 Q18,5 17,5 Q18,5 18,8 L18,10 Q16,10 14,10 Q12,10 12,8 Z', true, 0),
('hair', 'wavy', 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 Q18,6 17,7 Q18,8 18,10 L12,10 Q12,8 13,7 Q12,6 12,4 Z', true, 0),
('hair', 'bun', 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 L18,6 Q20,6 20,8 Q20,10 18,10 L18,8 L12,8 Z', true, 0),
('color', 'brown', '#8B4513', true, 0),
('color', 'blonde', '#FFD700', true, 0),
('color', 'black', '#000000', true, 0),
('color', 'red', '#DC143C', true, 0),
('color', 'blue', '#4169E1', true, 0),
('color', 'purple', '#9370DB', true, 0),
('accessory', 'none', '', true, 0),
('accessory', 'glasses', 'M8,12 L10,12 M10,12 Q11,11 12,11 Q13,11 14,12 M14,12 L16,12 M10,12 Q10,13 10,14 M14,12 Q14,13 14,14', true, 0),
('accessory', 'hat', 'M10,6 L14,6 L15,4 Q15,2 12,2 Q9,2 9,4 L10,6 Z', true, 0),
('accessory', 'crown', 'M10,4 L11,2 L12,4 L13,2 L14,4 L14,6 L10,6 Z', true, 50)
ON CONFLICT (item_type, item_name) DO NOTHING;