/**
 * Seed script — inserts 10 realistic sample opportunities into Supabase.
 * Run: npx ts-node --project tsconfig.json -e "require('./scripts/seed')"
 * Or:  npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SEED_DATA = [
  {
    title: 'Fulbright Foreign Student Program',
    organization: 'U.S. Department of State',
    country: 'United States',
    region: 'North America',
    category: 'scholarship',
    description:
      'One of the most prestigious international scholarship programs enabling graduate students, artists, and professionals to study and conduct research in the United States.',
    eligibility: 'International students with a bachelor\'s degree, proficiency in English, and strong academic record.',
    funding_amount: 'Full funding (tuition, living expenses, travel)',
    deadline: '2026-09-15',
    application_link: 'https://foreign.fulbrightonline.org/',
    source_url: 'https://foreign.fulbrightonline.org/seed-1',
    tags: ['graduate', 'research', 'USA', 'fully-funded', 'international'],
    remote_type: 'in-person',
    women_founder_friendly: false,
    indian_applicant_eligible: true,
    student_eligible: true,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'YC Startup School Seed Grant',
    organization: 'Y Combinator',
    country: 'United States',
    region: 'Global',
    category: 'accelerator',
    description:
      "Y Combinator offers a free 10-week startup curriculum online. Top participants may be eligible for a $500K MFN deal through YC's standard investment terms.",
    eligibility: 'Early-stage startups with a product idea or MVP. Open globally.',
    funding_amount: 'Up to $500,000 (via MFN deal)',
    deadline: '2026-07-01',
    application_link: 'https://www.startupschool.org/',
    source_url: 'https://www.startupschool.org/seed-2',
    tags: ['startup', 'accelerator', 'YC', 'funding', 'global'],
    remote_type: 'remote',
    women_founder_friendly: true,
    indian_applicant_eligible: true,
    student_eligible: true,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'DAAD Scholarships for Foreign Students in Germany',
    organization: 'DAAD (German Academic Exchange Service)',
    country: 'Germany',
    region: 'Europe',
    category: 'scholarship',
    description:
      'DAAD offers scholarships for international students and researchers to study, teach, or do research in Germany across all disciplines.',
    eligibility: 'Bachelor\'s graduates and above; varies by program. Open to Indian applicants.',
    funding_amount: '€861/month + travel allowance',
    deadline: '2026-10-15',
    application_link: 'https://www.daad.de/en/',
    source_url: 'https://www.daad.de/en/seed-3',
    tags: ['germany', 'DAAD', 'postgrad', 'research', 'europe'],
    remote_type: 'in-person',
    women_founder_friendly: false,
    indian_applicant_eligible: true,
    student_eligible: true,
    age_limit: '32',
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'AWS Activate for Startups',
    organization: 'Amazon Web Services',
    country: 'Global',
    region: 'Global',
    category: 'grant',
    description:
      'AWS Activate provides startups with free AWS credits, technical support, and training to build and scale using AWS cloud infrastructure.',
    eligibility: 'Early-stage startups not yet funded or seed-funded; must be affiliated with an approved accelerator or VC.',
    funding_amount: 'Up to $100,000 in AWS credits',
    deadline: null,
    application_link: 'https://aws.amazon.com/activate/',
    source_url: 'https://aws.amazon.com/activate/seed-4',
    tags: ['cloud', 'AWS', 'credits', 'startup', 'global'],
    remote_type: 'remote',
    women_founder_friendly: false,
    indian_applicant_eligible: true,
    student_eligible: false,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'She Loves Tech Global Competition',
    organization: 'She Loves Tech',
    country: 'Global',
    region: 'Global',
    category: 'competition',
    description:
      'She Loves Tech is the world\'s largest startup competition for women and technology. Winners receive funding, mentorship, and global exposure.',
    eligibility: 'Tech startups with at least one woman co-founder or targeting women users.',
    funding_amount: '$1,000,000 in prizes and support',
    deadline: '2026-06-30',
    application_link: 'https://www.shelovestech.org/',
    source_url: 'https://www.shelovestech.org/seed-5',
    tags: ['women', 'tech', 'startup', 'competition', 'global'],
    remote_type: 'hybrid',
    women_founder_friendly: true,
    indian_applicant_eligible: true,
    student_eligible: false,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'Startup India Seed Fund Scheme (SISFS)',
    organization: 'DPIIT, Government of India',
    country: 'India',
    region: 'South Asia',
    category: 'government_scheme',
    description:
      'SISFS provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.',
    eligibility: 'DPIIT-recognized startups incorporated less than 2 years ago with a scalable innovation.',
    funding_amount: 'Up to ₹20 Lakhs (grant) + ₹50 Lakhs (investment)',
    deadline: '2026-12-31',
    application_link: 'https://seedfund.startupindia.gov.in/',
    source_url: 'https://seedfund.startupindia.gov.in/seed-6',
    tags: ['india', 'startup', 'government', 'seed-fund', 'DPIIT'],
    remote_type: 'in-person',
    women_founder_friendly: true,
    indian_applicant_eligible: true,
    student_eligible: false,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'Google.org Impact Challenge for Women & Girls',
    organization: 'Google.org',
    country: 'Global',
    region: 'Global',
    category: 'grant',
    description:
      'Google.org funds nonprofits and social enterprises using technology to create economic opportunities for women and girls.',
    eligibility: 'Registered nonprofits and social enterprises with technology-driven solutions for women\'s economic empowerment.',
    funding_amount: 'Up to $2,000,000 per grantee',
    deadline: '2026-08-01',
    application_link: 'https://impactchallenge.withgoogle.com/women',
    source_url: 'https://impactchallenge.withgoogle.com/women/seed-7',
    tags: ['women', 'google', 'nonprofit', 'tech', 'global'],
    remote_type: 'remote',
    women_founder_friendly: true,
    indian_applicant_eligible: true,
    student_eligible: false,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'GSOC — Google Summer of Code',
    organization: 'Google',
    country: 'Global',
    region: 'Global',
    category: 'fellowship',
    description:
      'Google Summer of Code is a global program focused on bringing more student developers into open source software development. Students work with an open source organization on a 3–5 month programming project.',
    eligibility: 'Students 18+ enrolled in or recently graduated from an accredited university.',
    funding_amount: '$1,500–$6,600 (based on country)',
    deadline: '2026-04-02',
    application_link: 'https://summerofcode.withgoogle.com/',
    source_url: 'https://summerofcode.withgoogle.com/seed-8',
    tags: ['open-source', 'coding', 'google', 'internship', 'global'],
    remote_type: 'remote',
    women_founder_friendly: false,
    indian_applicant_eligible: true,
    student_eligible: true,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'MIT Solve Global Challenges',
    organization: 'Massachusetts Institute of Technology',
    country: 'United States',
    region: 'Global',
    category: 'competition',
    description:
      'MIT Solve is a marketplace for social impact innovation. Solvers receive funding, technical resources, and connections to MIT\'s global network to solve specific global challenges.',
    eligibility: 'Innovators worldwide with solutions addressing health, learning, economic prosperity, and sustainability challenges.',
    funding_amount: '$10,000–$150,000 per challenge',
    deadline: '2026-05-28',
    application_link: 'https://solve.mit.edu/',
    source_url: 'https://solve.mit.edu/seed-9',
    tags: ['MIT', 'social-impact', 'innovation', 'SDG', 'global'],
    remote_type: 'hybrid',
    women_founder_friendly: true,
    indian_applicant_eligible: true,
    student_eligible: true,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
  {
    title: 'Commonwealth Scholarship and Fellowship Plan',
    organization: 'Commonwealth Scholarship Commission',
    country: 'United Kingdom',
    region: 'Europe',
    category: 'scholarship',
    description:
      'Fully-funded scholarships for citizens of Commonwealth countries to pursue Master\'s and PhD programs at UK universities.',
    eligibility:
      'Citizens of developing Commonwealth countries, strong academic record, committed to returning home after study.',
    funding_amount: 'Full funding (tuition + stipend + flights)',
    deadline: '2026-11-15',
    application_link: 'https://cscuk.fcdo.gov.uk/scholarships/',
    source_url: 'https://cscuk.fcdo.gov.uk/scholarships/seed-10',
    tags: ['UK', 'commonwealth', 'PhD', 'masters', 'fully-funded'],
    remote_type: 'in-person',
    women_founder_friendly: false,
    indian_applicant_eligible: true,
    student_eligible: true,
    age_limit: null,
    application_fee: null,
    status: 'active',
    raw_text: null,
  },
];

async function seed() {
  console.log('🌱 Starting seed...');

  const { data, error } = await supabase
    .from('opportunities')
    .upsert(SEED_DATA, { onConflict: 'source_url' })
    .select('id, title');

  if (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data?.length ?? 0} opportunities:`);
  data?.forEach((row, i) => console.log(`  ${i + 1}. [${row.id}] ${row.title}`));
}

seed();
