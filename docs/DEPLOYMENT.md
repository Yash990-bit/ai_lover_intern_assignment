# Deployment Guide

This project is optimized for deployment on Vercel with a Supabase PostgreSQL backend.

## 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the schema found in `docs/schema.sql`.
3. Get your connection credentials from Project Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Needed for bypass RLS if used, though the backend uses the anon key or service key depending on configuration)

## 2. Vercel Deployment
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Configure Environment Variables in Vercel before building:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `PIPELINE_SECRET` (A strong random string, e.g., generated via `openssl rand -base64 32`)

4. Click Deploy.

## 3. GitHub Actions Cron Setup
The project uses GitHub Actions to run the daily pipeline.
1. Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
2. Add the following Repository Secrets:
   - `PROD_URL`: Your deployed Vercel URL (e.g. `https://my-tracker.vercel.app`)
   - `PIPELINE_SECRET`: The exact same secret string you put in Vercel.

The Action will run every night at midnight UTC, calling `POST /api/pipeline/run` and securing it using `x-pipeline-secret`.

## 4. Testing the Deployed Pipeline
You can trigger the pipeline manually from your terminal:

```bash
curl -X POST https://your-vercel-app.vercel.app/api/pipeline/run \
  -H "x-pipeline-secret: your-super-secret-key" \
  -H "Content-Type: application/json"
```
You should receive a JSON response with the execution summary.
