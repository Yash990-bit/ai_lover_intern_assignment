/**
 * youthOpportunitiesScraper.ts
 *
 * Scrapes youthop.com — one of the largest youth opportunity aggregators
 * covering scholarships, fellowships, internships, and competitions.
 *
 * Strategy:
 *   1. Fetch listing pages (by category or search)
 *   2. Collect post URLs from article cards
 *   3. Scrape each detail page for structured data
 *   4. Fallback: extract all visible text from detail page
 */

import * as cheerio from 'cheerio';
import type { IScraper, RawOpportunity, ScraperResult } from './baseScraper.js';
import {
  fetchWithRetry,
  stripHtml,
  resolveUrl,
  truncate,
  sleep,
  nowIso,
} from './baseScraper';

const LISTING_URLS = [
  'https://www.youthop.com/scholarships',
  'https://www.youthop.com/fellowships',
  'https://www.youthop.com/internships',
];

const MAX_PER_PAGE = 3;
const DELAY_MS = 500;

export class YouthOpportunitiesScraper implements IScraper {
  readonly name = 'YouthOpportunities';
  readonly baseUrl = 'https://www.youthop.com';

  async run(): Promise<ScraperResult> {
    const start = Date.now();
    const opportunities: RawOpportunity[] = [];
    const seenUrls = new Set<string>();

    for (const listingUrl of LISTING_URLS) {
      try {
        const links = await this.extractListingLinks(listingUrl);
        console.log(`[YouthOpportunities] ${links.length} links from ${listingUrl}`);

        for (const link of links.slice(0, MAX_PER_PAGE)) {
          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          try {
            const opp = await this.scrapeDetailPage(link);
            if (opp) {
              opportunities.push(opp);
              console.log(`  ✓ ${opp.title}`);
            }
            await sleep(DELAY_MS);
          } catch (err) {
            console.warn(`[YouthOpportunities] Failed ${link}: ${(err as Error).message}`);
          }
        }
      } catch (err) {
        console.warn(`[YouthOpportunities] Listing error ${listingUrl}: ${(err as Error).message}`);
      }
    }

    return {
      sourceName: this.name,
      sourceUrl: this.baseUrl,
      status: opportunities.length > 0 ? 'success' : 'failed',
      opportunitiesFound: opportunities.length,
      opportunities,
      durationMs: Date.now() - start,
    };
  }

  private async extractListingLinks(url: string): Promise<string[]> {
    const html = await fetchWithRetry(url, { retries: 3, delayMs: 1000 });
    const $ = cheerio.load(html);
    const links: string[] = [];

    // YouthOp uses article cards with class-based structure
    const selectors = [
      'article a',
      '.post-title a',
      'h2 a',
      'h3 a',
      '.entry-title a',
      '.card-title a',
      '.opportunity-title a',
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href') ?? '';
        const resolved = resolveUrl(href, this.baseUrl);
        if (
          resolved.includes('youthop.com') &&
          !resolved.includes('/category/') &&
          !resolved.includes('/tag/') &&
          !resolved.includes('/page/') &&
          !resolved.includes('?') &&
          resolved !== this.baseUrl
        ) {
          links.push(resolved);
        }
      });
      if (links.length >= MAX_PER_PAGE) break;
    }

    // Generic fallback — any internal post link
    if (links.length === 0) {
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? '';
        const resolved = resolveUrl(href, this.baseUrl);
        const text = $(el).text().trim();
        // Only grab links that look like opportunity titles (long anchor text)
        if (
          resolved.startsWith(this.baseUrl) &&
          resolved !== this.baseUrl &&
          !resolved.match(/\.(css|js|png|jpg|gif|svg|pdf)$/i) &&
          text.length > 15
        ) {
          links.push(resolved);
        }
      });
    }

    return [...new Set(links)];
  }

  private async scrapeDetailPage(url: string): Promise<RawOpportunity | null> {
    const html = await fetchWithRetry(url, { retries: 2, timeoutMs: 15000 });
    const $ = cheerio.load(html);

    // Title
    const title =
      $('h1.entry-title, h1.post-title, h1').first().text().trim() ||
      $('title').text().replace(/\s*[-|].*$/, '').trim();

    if (!title || title.length < 5) return null;

    // Body
    const bodyEl = $('.entry-content, .post-content, .content, article, main').first();
    const rawText = truncate(
      stripHtml(bodyEl.html() ?? $('body').html() ?? ''),
      5000
    );

    // Short description: first 2-3 meaningful sentences from the body
    const description = extractShortDescription($, rawText);

    // Structured fields that YouthOp sometimes includes in meta or sidebar
    const deadline = extractDeadlineFromPage($, rawText);
    const fundingAmount = extractFundingFromText(rawText);
    const organization = extractOrgFromPage($, rawText);
    const country = extractCountry(rawText);
    const category = guessCategoryFromUrl(url);

    const tags: string[] = [];
    $('a[rel="tag"], .tags a, .post-tags a, .badge').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length < 50) tags.push(t.toLowerCase());
    });

    return {
      title,
      sourceUrl: url,
      sourceName: this.name,
      rawText,
      discoveredAt: nowIso(),
      organization,
      deadline,
      fundingAmount,
      country,
      category,
      tags,
      description,
    };
  }
}

// ─── Field extraction helpers ─────────────────────────────────────────────────

function extractDeadlineFromPage(
  $: ReturnType<typeof cheerio.load>,
  text: string
): string | undefined {
  // Check for structured deadline fields in the page (common on YouthOp)
  const deadlineEl = $(
    '[class*="deadline"], [class*="date"], .opportunity-date'
  ).first().text().trim();
  if (deadlineEl) {
    const d = new Date(deadlineEl);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // Text pattern matching
  const patterns = [
    /(?:deadline|apply by|closes?|last date)[:\s]+([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i,
    /(?:deadline|closes?)[:\s]+(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/i,
    /(?:deadline)[:\s]+(\d{4}-\d{2}-\d{2})/i,
    /(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})(?=\s*(?:deadline|closes|due))/i,
  ];

  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
  }
  return undefined;
}

function extractFundingFromText(text: string): string | undefined {
  const m = text.match(
    /\$[\d,]+(?:,\d{3})*(?:\s*[-–]\s*\$[\d,]+)?|\€[\d,]+|£[\d,]+|(?:USD|EUR|GBP|INR)\s*[\d,]+|full(?:y)?[\s-]?funded|stipend of[^.]{0,40}/i
  );
  return m?.[0]?.trim();
}

function extractOrgFromPage(
  $: ReturnType<typeof cheerio.load>,
  text: string
): string | undefined {
  const orgEl = $('[class*="organization"], [class*="host"], [class*="sponsor"]').first().text().trim();
  if (orgEl && orgEl.length < 100) return orgEl;

  const m = text.match(
    /(?:offered|organized|hosted|sponsored|funded|presented|by)[:\s]+([A-Z][^\n.]{3,60})/i
  );
  return m?.[1]?.trim();
}

function extractCountry(text: string): string | undefined {
  const countries = [
    'United States', 'USA', 'United Kingdom', 'UK', 'Germany', 'India',
    'Canada', 'Australia', 'France', 'Japan', 'China', 'Netherlands',
    'Sweden', 'Switzerland', 'Norway', 'Denmark', 'South Korea', 'Singapore',
    'New Zealand', 'Austria', 'Belgium', 'Finland', 'Ireland', 'Italy',
  ];
  for (const c of countries) {
    if (text.includes(c)) return c.replace(/^USA$/, 'United States').replace(/^UK$/, 'United Kingdom');
  }
  return undefined;
}

function guessCategoryFromUrl(url: string): string {
  if (url.includes('scholarship')) return 'scholarship';
  if (url.includes('fellowship')) return 'fellowship';
  if (url.includes('grant')) return 'grant';
  if (url.includes('competition')) return 'competition';
  if (url.includes('conference')) return 'conference';
  if (url.includes('accelerator') || url.includes('incubator')) return 'accelerator';
  if (url.includes('exchange') || url.includes('internship')) return 'exchange_program';
  return 'other';
}

/**
 * Extracts a clean short description (~200 chars) from the scraped page.
 * Tries meta description first, then first paragraph, then raw text slice.
 */
export function extractShortDescription(
  $: ReturnType<typeof cheerio.load>,
  rawText: string
): string | undefined {
  // 1. Try meta description (best quality)
  const meta = $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content');
  if (meta && meta.trim().length > 30) {
    return meta.trim().slice(0, 280);
  }

  // 2. Try first meaningful <p> tag in article body
  const bodyEl = $('.entry-content, .post-content, .content, article, main').first();
  let firstP = '';
  bodyEl.find('p').each((_, el) => {
    const text = $(el).text().trim();
    if (!firstP && text.length > 60 && !text.toLowerCase().startsWith('deadline')) {
      firstP = text;
    }
  });
  if (firstP) return firstP.slice(0, 280);

  // 3. Fallback: first 200 chars of raw text, stopping at a sentence boundary
  if (rawText && rawText.length > 50) {
    const slice = rawText.slice(0, 280);
    const lastDot = slice.lastIndexOf('. ');
    return (lastDot > 80 ? slice.slice(0, lastDot + 1) : slice).trim();
  }

  return undefined;
}
