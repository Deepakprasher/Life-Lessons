-- ================================================================
-- Life Lessons from Indian Literature — Supabase Database Setup
-- Copy this entire file into Supabase > SQL Editor > Run
-- ================================================================

-- ── My Collection (private per reader) ───────────────────────────
CREATE TABLE IF NOT EXISTS my_collection (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reader_id     text NOT NULL,
  title         text NOT NULL,
  author        text NOT NULL,
  year          text,
  note          text,
  date_added    date DEFAULT CURRENT_DATE,
  type          text DEFAULT 'anybook'
);

-- Only the reader who created an entry can see it
ALTER TABLE my_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Readers see own entries" ON my_collection
  FOR ALL USING (reader_id = current_setting('request.jwt.claims', true)::json->>'sub'
                 OR reader_id LIKE 'reader_%');

-- ── Communal Library (public) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS communal_library (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title             text NOT NULL,
  author            text NOT NULL,
  year              text,
  nomination_reason text,
  date_added        date DEFAULT CURRENT_DATE,
  type              text DEFAULT 'communal'
);

-- Anyone can read; anyone can insert; no updates or deletes
ALTER TABLE communal_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON communal_library FOR SELECT USING (true);
CREATE POLICY "Public insert" ON communal_library FOR INSERT WITH CHECK (true);

-- ── Done ──────────────────────────────────────────────────────────
-- Your tables are ready. Return to the deployment guide.
