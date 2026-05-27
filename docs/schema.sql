-- ============================================================
-- ScrapeScout AI — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── opportunities ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT NOT NULL,
  organization            TEXT,
  country                 TEXT,
  region                  TEXT,
  category                TEXT,
  description             TEXT,
  eligibility             TEXT,
  funding_amount          TEXT,
  deadline                DATE,
  application_link        TEXT,
  source_url              TEXT UNIQUE,
  tags                    TEXT[] DEFAULT '{}',
  remote_type             TEXT,
  women_founder_friendly  BOOLEAN DEFAULT FALSE,
  indian_applicant_eligible BOOLEAN DEFAULT FALSE,
  student_eligible        BOOLEAN DEFAULT FALSE,
  age_limit               TEXT,
  application_fee         TEXT,
  status                  TEXT DEFAULT 'active',
  raw_text                TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── saved_opportunities ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  opportunity_id      UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  application_status  TEXT DEFAULT 'Saved',
  priority            TEXT DEFAULT 'Medium',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── application_timeline ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_timeline (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_opportunity_id  UUID NOT NULL REFERENCES saved_opportunities(id) ON DELETE CASCADE,
  status                TEXT NOT NULL,
  note                  TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── source_logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS source_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name         TEXT NOT NULL,
  source_url          TEXT,
  status              TEXT NOT NULL,
  opportunities_found INTEGER DEFAULT 0,
  error_message       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_opportunities_category  ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_country   ON opportunities(country);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline  ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_status    ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags      ON opportunities USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_saved_user              ON saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunity       ON saved_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_timeline_saved          ON application_timeline(saved_opportunity_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_saved_updated_at
  BEFORE UPDATE ON saved_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
