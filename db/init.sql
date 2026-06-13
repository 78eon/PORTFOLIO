CREATE TABLE IF NOT EXISTS writeups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  lab_date DATE NOT NULL,
  category TEXT NOT NULL,
  overview TEXT NOT NULL,
  impact_confidentiality TEXT DEFAULT 'None',
  impact_integrity TEXT DEFAULT 'None',
  impact_availability TEXT DEFAULT 'None',
  attack_vector TEXT NOT NULL,
  exploitation_walkthrough TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  tools_used TEXT[] DEFAULT '{}',
  refs JSONB DEFAULT '[]',
  screenshot_urls TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT TRUE
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON writeups;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON writeups
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);
