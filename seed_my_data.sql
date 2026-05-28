-- Seed script for ScrapeScout-AI

-- 1️⃣ Sample Users
INSERT INTO users (name, email)
VALUES
  ('Alice Example', 'alice@example.com'),
  ('Bob Example',   'bob@example.com');

-- 2️⃣ Sample Opportunities
INSERT INTO opportunities (
  title,
  organization,
  country,
  region,
  category,
  description,
  eligibility,
  funding_amount,
  deadline,
  application_link,
  source_url,
  tags,
  remote_type,
  women_founder_friendly,
  indian_applicant_eligible,
  student_eligible,
  age_limit,
  application_fee,
  status,
  raw_text
) VALUES
(
  'AI‑Driven Startup Grant',
  'Tech Foundation',
  'United States',
  'North America',
  'Funding',
  'A grant for early‑stage AI startups. 20k USD up‑front, 5k after milestone.',
  'Must have a working prototype and a team of ≤3 people.',
  '20000 USD',
  CURRENT_DATE + INTERVAL '30 days',
  'https://example.com/apply',
  'https://example.com/opportunity/ai-grant',
  ARRAY['grant','AI','startup'],
  'remote',
  true,
  false,
  true,
  '18‑35',
  'none',
  'active',
  'Raw text of the opportunity for internal processing.'
),
(
  'Women Founder Fellowship',
  'Global Women Initiative',
  'India',
  'Asia',
  'Fellowship',
  'Fellowship for women founders in tech. Includes mentorship and seed funding.',
  'Women founders with a tech‑focused product.',
  '5000 USD',
  CURRENT_DATE + INTERVAL '45 days',
  'https://example.org/fellowship',
  'https://example.org/opportunity/women-fellowship',
  ARRAY['fellowship','women','founder','tech'],
  'remote',
  true,
  true,
  false,
  NULL,
  NULL,
  'active',
  'Raw text for the women founder fellowship.'
);

-- 3️⃣ OPTIONAL – Saved Opportunities (run SELECTs first to get UUIDs)
SELECT id FROM users WHERE email = 'alice@example.com';
SELECT id FROM users WHERE email = 'bob@example.com';
SELECT id FROM opportunities WHERE title = 'AI‑Driven Startup Grant';
SELECT id FROM opportunities WHERE title = 'Women Founder Fellowship';

-- After replacing <USER_UUID_ALICE>, <USER_UUID_BOB>, <OPP_UUID_GRANT>, <OPP_UUID_FELLOWSHIP>:
-- INSERT INTO saved_opportunities (user_id, opportunity_id, application_status, priority, notes)
-- VALUES
--   (<USER_UUID_ALICE>, <OPP_UUID_GRANT>, 'Saved', 'High',   'Interested, will apply soon.'),
--   (<USER_UUID_BOB>,   <OPP_UUID_FELLOWSHIP>, 'Saved', 'Medium', 'Need to check eligibility.');
