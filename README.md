# 🌍 ScrapeScout AI — Global Opportunity Automation

A fully automated, AI-powered platform that discovers and tracks global opportunities (scholarships, fellowships, grants, startup accelerators). It scrapes the web, uses LLMs to structure the data, provides a rich natural language search, and offers a personalized application tracking system.

## 🚀 Features

- **Automated Web Scraping:** Pulls raw opportunities from predefined sources dynamically.
- **AI-Powered Data Extraction:** Uses OpenAI to intelligently extract JSON fields, standardize categories, and infer tags and eligibility rules (women, students, regions).
- **Natural Language Search:** "Find me remote grants for women founders in Europe" translates directly to active filters.
- **Application Tracker (Kanban):** Save opportunities, track statuses (Interview, Applied, Rejected), set priorities, and see upcoming deadlines.
- **Automated Expiry Pipeline:** Runs daily via GitHub Actions to maintain DB hygiene and update historical statuses.

## 🏗️ Architecture & Stack

- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI Processing:** OpenAI (`gpt-4o-mini`), Zod for schema validation.
- **Scraping:** Cheerio / Fetch / Playwright architecture

For a deep dive into the architecture, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🗄️ Database Schema
See the raw SQL schema in [docs/schema.sql](docs/schema.sql).

---

## 🛠️ Local Setup

### 1. Supabase Setup
Create a Supabase project and execute the SQL found in `docs/schema.sql`.

### 2. Environment Variables
Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=sk-your-openai-api-key
PIPELINE_SECRET=any-random-string-used-for-security
```

### 3. Installation
```bash
npm install
npm run dev
```

---

## 🤖 Pipeline Commands

The platform operates on a robust pipeline. You can run individual steps or the entire flow:

### 1. Seed Dummy Data
If you just want to test the UI without scraping:
```bash
npm run seed
```

### 2. Run Scrapers
Pulls raw HTML text from sources into the database:
```bash
npm run scrape
```

### 3. AI Extraction
Processes raw data, structuring it using OpenAI:
```bash
npm run process-raw
```

### 4. Full Daily Pipeline
Runs scraping -> processing -> expiry marking, returning a full summary log:
```bash
npm run pipeline
```

*Note: In production, the daily pipeline is triggered securely by GitHub Actions.*

---

## 📚 Documentation

- [API Reference](docs/API.md): Complete list of REST endpoints and payloads.
- [Architecture](docs/ARCHITECTURE.md): System design, workflow charts, and layer explanations.
- [Deployment Guide](docs/DEPLOYMENT.md): Instructions for Vercel, Supabase, and GitHub Actions cron jobs.

---

## ⚠️ Known Limitations
- Scrapers can break if the source website changes its DOM structure significantly.
- OpenAI processing introduces latency and cost (though minimized using `gpt-4o-mini`).
- The MVP application tracker is local/global until user authentication (Auth) is fully integrated.

## 🔮 Future Improvements
- **Authentication**: Add Supabase Auth to isolate `saved_opportunities` per user.
- **Webhooks**: Send Discord or Slack notifications when a new high-value opportunity is scraped.
- **More Sources**: Expand the scraper runners to cover more diverse global platforms using Playwright.
- **Semantic Search**: Use `pgvector` to do true embedding-based semantic search instead of relying solely on the OpenAI NLP-to-filter bridge.
