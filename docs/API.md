# ScrapeScout AI API

## Opportunities

### `GET /api/opportunities`
Fetch a paginated list of opportunities.
**Query Parameters:**
- `search` (string)
- `category` (string)
- `country` (string)
- `region` (string)
- `tag` (string)
- `remote_type` (string)
- `status` (string)
- `women_founder_friendly` (boolean)
- `indian_applicant_eligible` (boolean)
- `student_eligible` (boolean)
- `deadlineBefore` (ISO string)
- `deadlineAfter` (ISO string)
- `page` (number)
- `pageSize` (number)

### `GET /api/opportunities/[id]`
Get details for a single opportunity.

### `POST /api/opportunities`
Create an opportunity manually.

---

## Scrapers

### `POST /api/scrape/run`
Triggers the scraping pipeline manually. Will create records with `raw` status.

---

## AI Extraction

### `POST /api/ai/extract`
Extract JSON from a single raw opportunity string.
**Body:** `{ "raw_text": "..." }`

### `POST /api/ai/process-raw`
Processes all opportunities currently in the `raw` status through the LLM.

### `POST /api/search/ai`
Natural language search proxy.
**Body:** `{ "query": "Show me remote scholarships" }`

---

## Saved / Application Tracker

### `GET /api/saved`
Fetch the user's saved tracking list.

### `POST /api/saved`
Save an opportunity.
**Body:** `{ "opportunityId": "uuid" }`

### `PATCH /api/saved/[id]`
Update a saved opportunity's tracker state.
**Body:** `{ "application_status": "Interview", "priority": "High" }`

### `DELETE /api/saved/[id]`
Remove from tracker.

### `GET /api/saved/[id]/timeline`
Returns status change history for an application.

---

## Dashboard Stats

### `GET /api/dashboard/stats`
Returns aggregation metrics for the frontend display.

---

## Automation Pipeline

### `POST /api/pipeline/run`
Executes the full pipeline: Scrape -> Process -> Expire.
**Headers Required:**
`x-pipeline-secret: YOUR_SECRET_KEY`
