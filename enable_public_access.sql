CREATE POLICY "Public Access" ON opportunities FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON saved_opportunities FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON application_timeline FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON source_logs FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_logs ENABLE ROW LEVEL SECURITY;
