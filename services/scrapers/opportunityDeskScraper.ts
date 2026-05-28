/**
 * opportunityDeskScraper.ts
 *
 * Scrapes opportunitydesk.org — a well-structured blog listing global
 * scholarships, fellowships, grants, and competitions.
 *
 * Strategy:
 *   1. Fetch the main listing page (or category archive)
 *   2. Extract article links from anchor tags
 *   3. Visit each detail page
 *   4. Extract title, visible text, and metadata
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

// Pages to scrape — these URLs are verified working
const LISTING_URLS = [
  'https://opportunitydesk.org/category/fellowships/',
  'https://opportunitydesk.org/category/grants/',
];

const MAX_ARTICLES_PER_PAGE = 3; // polite limit
const DETAIL_DELAY_MS = 500;    // pause between detail fetches

export class OpportunityDeskScraper implements IScraper {
  readonly name = 'OpportunityDesk';
  readonly baseUrl = 'https://opportunitydesk.org';

  async run(): Promise<ScraperResult> {
    const start = Date.now();
    const opportunities: RawOpportunity[] = [];
    const seenUrls = new Set<string>();

    for (const listingUrl of LISTING_URLS) {
      try {
        const links = await this.extractArticleLinks(listingUrl);
        console.log(`[OpportunityDesk] Found ${links.length} links on ${listingUrl}`);

        for (const link of links.slice(0, MAX_ARTICLES_PER_PAGE)) {
          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          try {
            const opp = await this.scrapeDetailPage(link);
            if (opp) opportunities.push(opp);
            await sleep(DETAIL_DELAY_MS);
          } catch (err) {
            console.warn(`[OpportunityDesk] Detail scrape failed for ${link}: ${(err as Error).message}`);
          }
        }
      } catch (err) {
        console.warn(`[OpportunityDesk] Listing failed for ${listingUrl}: ${(err as Error).message}`);
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

  /** Extract article/post links from a category listing page */
  private async extractArticleLinks(url: string): Promise<string[]> {
    const html = await fetchWithRetry(url, { retries: 3, delayMs: 1000 });
    const $ = cheerio.load(html);
    const links: string[] = [];

    // OpportunityDesk uses standard WordPress article structure
    $('article a, h2 a, h3 a, .entry-title a, .post-title a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const resolved = resolveUrl(href, this.baseUrl);
      // Only keep links that point to the same domain and look like posts
      if (resolved.includes('opportunitydesk.org') && !resolved.includes('/category/') && !resolved.includes('/tag/') && !resolved.includes('/page/')) {
        links.push(resolved);
      }
    });

    // Fallback: grab all internal links
    if (links.length === 0) {
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? '';
        const resolved = resolveUrl(href, this.baseUrl);
        if (
          resolved.startsWith(this.baseUrl) &&
          resolved !== this.baseUrl &&
          !resolved.includes('/category/') &&
          !resolved.includes('/tag/') &&
          !resolved.includes('/?') &&
          !resolved.match(/\.(css|js|png|jpg|gif|svg|pdf)$/i)
        ) {
          links.push(resolved);
        }
      });
    }

    // Deduplicate
    return [...new Set(links)];
  }

  /** Scrape a single opportunity detail page */
  private async scrapeDetailPage(url: string): Promise<RawOpportunity | null> {
    const html = await fetchWithRetry(url, { retries: 2, timeoutMs: 15000 });
    const $ = cheerio.load(html);

    // Title — try multiple selectors
    const title =
      $('h1.entry-title').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('title').text().replace(/\s*[|\u2013\u2014-].*$/, '').trim();

    if (!title || title.length < 5) return null;

    // Main content body
    const contentEl =
      $('.entry-content, .post-content, article, main').first();
    const rawText = truncate(stripHtml(contentEl.html() ?? $('body').html() ?? ''), 5000);

    // Short description: meta > first paragraph > raw text slice
    const metaDesc = $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content');
    let description: string | undefined;
    if (metaDesc && metaDesc.trim().length > 30) {
      description = metaDesc.trim().slice(0, 280);
    } else {
      contentEl.find('p').each((_, el) => {
        const t = $(el).text().trim();
        if (!description && t.length > 60 && !t.toLowerCase().startsWith('deadline')) {
          description = t.slice(0, 280);
        }
      });
      if (!description && rawText.length > 50) {
        const slice = rawText.slice(0, 280);
        const lastDot = slice.lastIndexOf('. ');
        description = (lastDot > 80 ? slice.slice(0, lastDot + 1) : slice).trim();
      }
    }

    // Try to extract organization from meta or common patterns
    const organization = extractOrg($, rawText);

    // Try deadline extraction
    const deadline = extractDeadline(rawText);

    // Funding amount
    const fundingAmount = extractFunding(rawText);

    // Tags from keywords / post tags
    const tags: string[] = [];
    $('a[rel="tag"], .post-tags a, .tags a').each((_, el) => {
      const t = $(el).text().trim();
      if (t) tags.push(t.toLowerCase());
    });

    // Category guess
    const category = guessCategoryFromUrl(url);

    return {
      title,
      sourceUrl: url,
      sourceName: this.name,
      rawText,
      discoveredAt: nowIso(),
      organization,
      deadline,
      fundingAmount,
      tags,
      category,
      description,
    };
  }
}

// ─── Extraction helpers ───────────────────────────────────────────────────────

function extractOrg($: ReturnType<typeof cheerio.load>, text: string): string | undefined {
  // Check <meta> tags
  const metaAuthor =
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content');
  if (metaAuthor) return metaAuthor;

  // Look for "offered by", "organized by", "hosted by" patterns in text
  const match = text.match(
    /(?:offered|organized|hosted|sponsored|funded|presented)\s+by[:\s]+([A-Z][^\n.]{3,60})/i
  );
  return match?.[1]?.trim();
}

function extractDeadline(text: string): string | undefined {
  // Match patterns like "Deadline: January 31, 2026" or "Apply by 31 March 2026"
  const patterns = [
    /(?:deadline|apply by|closes?|due date)[:\s]+([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i,
    /(?:deadline|apply by|closes?)[:\s]+(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/i,
    /(?:deadline)[:\s]+(\d{4}-\d{2}-\d{2})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
  }
  return undefined;
}

function extractFunding(text: string): string | undefined {
  const match = text.match(
    /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?|\€[\d,]+|£[\d,]+|(?:USD|EUR|GBP)\s*[\d,]+|full(?:y)?[\s-]?funded/i
  );
  return match?.[0]?.trim();
}

function guessCategoryFromUrl(url: string): string {
  if (url.includes('scholarship')) return 'scholarship';
  if (url.includes('fellowship')) return 'fellowship';
  if (url.includes('grant')) return 'grant';
  if (url.includes('competition')) return 'competition';
  if (url.includes('conference')) return 'conference';
  if (url.includes('accelerator') || url.includes('incubator')) return 'accelerator';
  if (url.includes('exchange')) return 'exchange_program';
  return 'other';
}
