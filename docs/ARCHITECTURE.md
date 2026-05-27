# Architecture Overview

This project is built using a modern, scalable, and modular stack optimized for background automation and clean AI extraction.

## Flow Diagram

```text
  [ GitHub Actions (Cron) ] OR [ Manual API Trigger ]
              │
              ▼
        (Scheduler)
       dailyPipeline.ts
              │
              ├─ 1. 🌐 Scrapers (Cheerio/Playwright)
              │       Fetch raw text/html from source websites.
              │
              ├─ 2. 🗄️ Raw Insert
              │       Opportunities stored in Supabase with `status='raw'`.
              │
              ├─ 3. 🧠 AI Extraction Engine
              │       `processRaw.ts` loops through 'raw' items.
              │       Sends prompt + text to OpenAI.
              │       Validates strict JSON with Zod.
              │       Repairs JSON if broken.
              │       Normalizes categories & tags.
              │       Transitions to `active` (or `needs_review`).
              │
              └─ 4. ⏳ Expiry Service
                      Checks deadlines against current date.
                      Transitions `active` -> `expired`.


  [ End User / Web App ]
              │
              ▼
        Next.js App Router
              │
              ├─ AI Search (GPT)
              ├─ Standard DB Filters
              └─ Personal Application Tracker (Saved, Interview, Applied)
```

## Layers
- **Database**: Supabase PostgreSQL. Enforces schema, foreign keys, triggers.
- **Service Layer**: Node.js services inside `/services` separating logic from HTTP handlers.
- **API Layer**: Next.js App Router `/api` bridging client requests to services.
- **AI Layer**: Abstracted inside `/services/ai`. Currently uses OpenAI `gpt-4o-mini`, highly modular.
- **Frontend**: React components styled with Tailwind CSS, utilizing Server Components where possible, Client Components for interactivity.
