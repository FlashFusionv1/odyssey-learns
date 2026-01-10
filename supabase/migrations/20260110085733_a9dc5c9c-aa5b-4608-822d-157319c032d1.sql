-- Create room tables
CREATE TABLE IF NOT EXISTS room_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  svg_data TEXT NOT NULL,
  points_cost INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS child_room (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE UNIQUE,
  room_name TEXT DEFAULT 'My Room',
  placed_decorations JSONB DEFAULT '[]',
  owned_decoration_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE room_decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_room ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_decorations" ON room_decorations FOR SELECT USING (true);
CREATE POLICY "view_room" ON child_room FOR SELECT USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "update_room" ON child_room FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "insert_room" ON child_room FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Seed decorations
INSERT INTO room_decorations (name, category, svg_data, points_cost, is_default) VALUES
('Basic Bed', 'furniture', '<svg viewBox="0 0 100 60"><rect x="5" y="30" width="90" height="25" fill="#8B4513"/><rect x="10" y="20" width="80" height="15" fill="#4169E1"/></svg>', 0, true),
('Window', 'wall_art', '<svg viewBox="0 0 60 80"><rect x="5" y="5" width="50" height="70" fill="#87CEEB" stroke="#8B4513" stroke-width="3"/></svg>', 0, true),
('Cozy Chair', 'furniture', '<svg viewBox="0 0 60 60"><rect x="10" y="25" width="40" height="30" fill="#DC143C" rx="5"/></svg>', 50, false),
('Star Poster', 'wall_art', '<svg viewBox="0 0 50 50"><rect width="50" height="50" fill="#191970"/><polygon points="25,5 30,20 45,20 33,30 38,45 25,35 12,45 17,30 5,20 20,20" fill="#FFD700"/></svg>', 30, false),
('Pet Cat', 'pet', '<svg viewBox="0 0 50 40"><ellipse cx="25" cy="28" rx="15" ry="10" fill="#FFA500"/><circle cx="25" cy="15" r="10" fill="#FFA500"/></svg>', 100, false),
('Trophy', 'trophy', '<svg viewBox="0 0 40 50"><ellipse cx="20" cy="20" rx="15" ry="15" fill="#FFD700"/></svg>', 150, false);

-- Init rooms for children
INSERT INTO child_room (child_id, owned_decoration_ids)
SELECT c.id, ARRAY(SELECT id FROM room_decorations WHERE is_default = true)
FROM children c ON CONFLICT DO NOTHING;