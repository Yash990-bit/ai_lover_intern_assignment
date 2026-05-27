/**
 * baseScraper.ts
 * Defines the common contract that every scraper must implement,
 * plus shared utilities (fetch with retry, text extraction helpers).
 */

// ─── Shared raw result type ───────────────────────────────────────────────────

export interface RawOpportunity {
  title: string;
  sourceUrl: string;
  sourceName: string;
  rawText: string;
  discoveredAt: string; // ISO timestamp
  // Optional enriched fields picked up during scraping
  organization?: string;
  deadline?: string;
  applicationLink?: string;
  description?: string;
  country?: string;
  category?: string;
  fundingAmount?: string;
  tags?: string[];
}

// ─── Scraper result / log ─────────────────────────────────────────────────────

export interface ScraperResult {
  sourceName: string;
  sourceUrl: string;
  status: 'success' | 'failed' | 'partial';
  opportunitiesFound: number;
  opportunities: RawOpportunity[];
  errorMessage?: string;
  durationMs: number;
}

// ─── Scraper interface ────────────────────────────────────────────────────────

export interface IScraper {
  /** Human-readable name, used in logs */
  readonly name: string;
  /** Primary URL being scraped */
  readonly baseUrl: string;
  /** Run the scraper and return raw results */
  run(): Promise<ScraperResult>;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (compatible; OpportunityTrackerBot/1.0; +https://github.com/opportunity-tracker)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Fetch a URL with configurable retries and a polite delay.
 */
export async function fetchWithRetry(
  url: string,
  options: {
    retries?: number;
    delayMs?: number;
    timeoutMs?: number;
    extraHeaders?: Record<string, string>;
  } = {}
): Promise<string> {
  const { retries = 3, delayMs = 1500, timeoutMs = 20000, extraHeaders = {} } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        headers: { ...DEFAULT_HEADERS, ...extraHeaders },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
      }

      return await res.text();
    } catch (err) {
      const isLast = attempt === retries;
      if (isLast) throw err;

      console.warn(
        `[fetchWithRetry] Attempt ${attempt}/${retries} failed for ${url}: ${
          (err as Error).message
        }. Retrying in ${delayMs}ms…`
      );
      await sleep(delayMs * attempt); // exponential back-off
    }
  }

  throw new Error(`fetchWithRetry exhausted all retries for ${url}`);
}

/** Resolve a potentially relative URL against a base */
export function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

/** Strip HTML tags and collapse whitespace */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Truncate text to a max character count */
export function truncate(text: string, max = 4000): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/** Polite sleep */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Looks like a real URL */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/** ISO timestamp for right now */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Wrap a scraper run with timing and top-level error capture */
export async function runSafely(scraper: IScraper): Promise<ScraperResult> {
  const start = Date.now();
  try {
    const result = await scraper.run();
    return result;
  } catch (err) {
    return {
      sourceName: scraper.name,
      sourceUrl: scraper.baseUrl,
      status: 'failed',
      opportunitiesFound: 0,
      opportunities: [],
      errorMessage: (err as Error).message,
      durationMs: Date.now() - start,
    };
  }
}
