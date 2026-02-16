-- Atlas Academy: EdTech Class Scheduler
-- Schema for classes and registrations

CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, parent_id)
);

CREATE INDEX idx_registrations_class ON registrations(class_id);
CREATE INDEX idx_registrations_parent ON registrations(parent_id);

-- Seed data for development
INSERT INTO parents (id, email, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Smith'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob Jones'),
  ('33333333-3333-3333-3333-333333333333', 'carol@example.com', 'Carol Lee'),
  ('44444444-4444-4444-4444-444444444444', 'dan@example.com', 'Dan Patel'),
  ('55555555-5555-5555-5555-555555555555', 'eva@example.com', 'Eva Garcia'),
  ('66666666-6666-6666-6666-666666666666', 'frank@example.com', 'Frank Wu'),
  ('77777777-7777-7777-7777-777777777777', 'grace@example.com', 'Grace Kim')
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, name, description, capacity, start_time, end_time) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Piano for Beginners', 'Learn basic piano', 2, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '1 hour'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Chess Club', 'Strategic thinking', 3, NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '1 hour'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Art & Crafts', 'Creative expression', 4, NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Piano: 2 registered (full)
INSERT INTO registrations (class_id, parent_id, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'registered'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'registered')
ON CONFLICT (class_id, parent_id) DO NOTHING;
