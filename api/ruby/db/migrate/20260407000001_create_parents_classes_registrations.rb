class CreateParentsClassesRegistrations < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
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
        status VARCHAR(20) NOT NULL DEFAULT 'registered'
          CHECK (status IN ('registered', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(class_id, parent_id)
      );

      CREATE INDEX IF NOT EXISTS idx_registrations_class ON registrations(class_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_parent ON registrations(parent_id);
    SQL
  end

  def down
    execute <<~SQL
      DROP TABLE IF EXISTS registrations;
      DROP TABLE IF EXISTS classes;
      DROP TABLE IF EXISTS parents;
    SQL
  end
end
