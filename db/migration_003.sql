-- Migration 003: Notes / Learning journal table
-- Run this in Neon or your PostgreSQL instance alongside migration_001 and migration_002.

CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  note_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  category    TEXT NOT NULL DEFAULT 'Concept',
  -- Category options: Networking | Tool | Algorithm | Protocol | Security | OS | Other
  summary     TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',   -- what it is / background / how it works
  examples    TEXT,                        -- practical usage, commands, real examples
  tools_used  TEXT[] NOT NULL DEFAULT '{}',
  refs        JSONB NOT NULL DEFAULT '[]', -- [{label, url}]
  published   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_notes_updated_at ON notes;
CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_notes_updated_at();
