-- Run this in Neon SQL Editor to upgrade your existing database
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS checks)

ALTER TABLE writeups
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS screenshots JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cvss_score NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS difficulty TEXT,
  ADD COLUMN IF NOT EXISTS lab_environment TEXT,
  ADD COLUMN IF NOT EXISTS key_takeaways TEXT;

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280'
);

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  badge_url TEXT,
  sort_order INT DEFAULT 0
);
