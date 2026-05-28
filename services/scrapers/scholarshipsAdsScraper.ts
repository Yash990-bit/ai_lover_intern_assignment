/**
 * scholarshipsDbScraper.ts
 *
 * Scrapes scholarshipsads.com — a popular scholarship aggregator
 * with frequently updated listings covering multiple countries.
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
  'https://scholarshipsads.com/category/fully-funded-scholarships/',
];

const MAX_PER_PAGE = 3;
const DELAY_MS = 500;

export class ScholarshipsAdsScraper implements IScraper {
  readonly name = 'ScholarshipsAds';
  readonly baseUrl = 'https://scholarshipsads.com';

  async run(): Promise<ScraperResult> {
    const start = Date.now();
    const opportunities: RawOpportunity[] = [];
    const seenUrls = new Set<string>();

    for (const listingUrl of LISTING_URLS) {
      try {
        const html = await fetchWithRetry(listingUrl, { retries: 2, delayMs: 1000 });
        const $ = cheerio.load(html);
        const links: string[] = [];

        // WordPress blog structure
        $('article a, h2 a, h3 a, .entry-title a, .post-title a').each((_, el) => {
          const href = $(el).attr('href') ?? '';
          if (!href) return;
          const resolved = resolveUrl(href, this.baseUrl);
          if (
            resolved.includes('scholarshipsads.com') &&
            !resolved.includes('/category/') &&
            !resolved.includes('/tag/') &&
            !resolved.includes('/page/') &&
            resolved !== this.baseUrl
          ) {
            links.push(resolved);
          }
        });

        const uniqueLinks = [...new Set(links)].slice(0, MAX_PER_PAGE);
        console.log(`[ScholarshipsAds] Found ${uniqueLinks.length} links from ${listingUrl}`);

        for (const link of uniqueLinks) {
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
            console.warn(`[ScholarshipsAds] Failed ${link}: ${(err as Error).message}`);
          }
        }
      } catch (err) {
        console.warn(`[ScholarshipsAds] Listing error ${listingUrl}: ${(err as Error).message}`);
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

  private async scrapeDetailPage(url: string): Promise<RawOpportunity | null> {
    const html = await fetchWithRetry(url, { retries: 2, timeoutMs: 15000 });
    const $ = cheerio.load(html);

    const title = $('h1.entry-title, h1').first().text().trim() ||
      $('title').text().replace(/\s*[-|–].*$/, '').trim();
    if (!title || title.length < 5) return null;

    const bodyEl = $('.entry-content, .post-content, article, main').first();
    const rawText = truncate(stripHtml(bodyEl.html() ?? $('body').html() ?? ''), 5000);

    const fundingMatch = rawText.match(/fully[- ]?funded|full(?:y)? scholarship|\$[\d,]+|€[\d,]+|£[\d,]+/i);
    const fundingAmount = fundingMatch?.[0]?.trim() || (rawText.toLowerCase().includes('fully funded') ? 'Fully Funded' : undefined);

    const deadlineMatch = rawText.match(/(?:deadline|apply by|closes?|last date)[:\s]+([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i);
    let deadline: string | undefined;
    if (deadlineMatch?.[1]) {
      const d = new Date(deadlineMatch[1]);
      if (!isNaN(d.getTime())) deadline = d.toISOString().split('T')[0];
    }

    const tags: string[] = ['scholarship'];
    $('a[rel="tag"], .post-tags a').each((_, el) => {
      const t = $(el).text().trim().toLowerCase();
      if (t && t.length < 30) tags.push(t);
    });

    return {
      title,
      sourceUrl: url,
      sourceName: this.name,
      rawText,
      discoveredAt: nowIso(),
      category: 'scholarship',
      fundingAmount,
      deadline,
      tags: [...new Set(tags)].slice(0, 8),
    };
  }
}
