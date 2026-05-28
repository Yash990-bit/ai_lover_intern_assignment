/**
 * idealistScraper.ts
 *
 * Scrapes idealist.org for internships, volunteer positions, and
 * social-impact jobs/fellowships.
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
  'https://www.idealist.org/en/internships',
  'https://www.idealist.org/en/fellowships',
];

const MAX_PER_PAGE = 3;
const DELAY_MS = 500;

export class IdealistScraper implements IScraper {
  readonly name = 'Idealist';
  readonly baseUrl = 'https://www.idealist.org';

  async run(): Promise<ScraperResult> {
    const start = Date.now();
    const opportunities: RawOpportunity[] = [];
    const seenUrls = new Set<string>();

    for (const listingUrl of LISTING_URLS) {
      try {
        const html = await fetchWithRetry(listingUrl, {
          retries: 2,
          delayMs: 1500,
          extraHeaders: {
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        const $ = cheerio.load(html);

        const links: string[] = [];

        // Idealist uses card-based layouts
        $('a[href*="/internship/"], a[href*="/volunteer/"], a[href*="/fellowship/"], a[href*="/job/"]').each((_, el) => {
          const href = $(el).attr('href') ?? '';
          if (!href) return;
          const resolved = resolveUrl(href, this.baseUrl);
          if (resolved.includes('idealist.org') && !seenUrls.has(resolved)) {
            links.push(resolved);
          }
        });

        // Fallback: look for any card-like links
        if (links.length === 0) {
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const text = $(el).text().trim();
            const resolved = resolveUrl(href, this.baseUrl);
            if (
              resolved.includes('idealist.org/en/') &&
              text.length > 15 &&
              !resolved.includes('/search') &&
              !resolved.includes('/login')
            ) {
              links.push(resolved);
            }
          });
        }

        const uniqueLinks = [...new Set(links)].slice(0, MAX_PER_PAGE);
        console.log(`[Idealist] Found ${uniqueLinks.length} links from ${listingUrl}`);

        for (const link of uniqueLinks) {
          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          try {
            const opp = await this.scrapeDetailPage(link, listingUrl);
            if (opp) {
              opportunities.push(opp);
              console.log(`  ✓ ${opp.title}`);
            }
            await sleep(DELAY_MS);
          } catch (err) {
            console.warn(`[Idealist] Failed ${link}: ${(err as Error).message}`);
          }
        }
      } catch (err) {
        console.warn(`[Idealist] Listing error ${listingUrl}: ${(err as Error).message}`);
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

  private async scrapeDetailPage(url: string, listingUrl: string): Promise<RawOpportunity | null> {
    const html = await fetchWithRetry(url, { retries: 2, timeoutMs: 15000 });
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim() ||
      $('title').text().replace(/\s*[-|–].*$/, '').trim();
    if (!title || title.length < 5) return null;

    const bodyEl = $('main, .listing-body, .job-description, article, .content').first();
    const rawText = truncate(stripHtml(bodyEl.html() ?? $('body').html() ?? ''), 5000);

    const organization = $('[class*=org], [class*=company], .employer-name').first().text().trim() || undefined;
    const country = extractCountry(rawText);

    const category = listingUrl.includes('internship') ? 'internship'
      : listingUrl.includes('fellowship') ? 'fellowship'
      : listingUrl.includes('volunteer') ? 'other'
      : 'other';

    return {
      title,
      sourceUrl: url,
      sourceName: this.name,
      rawText,
      discoveredAt: nowIso(),
      organization,
      country,
      category,
      tags: ['social-impact', category],
    };
  }
}

function extractCountry(text: string): string | undefined {
  const countries = [
    'United States', 'USA', 'United Kingdom', 'UK', 'Germany', 'India',
    'Canada', 'Australia', 'France', 'Japan', 'Netherlands', 'Remote',
    'Singapore', 'New Zealand', 'South Africa', 'Kenya', 'Nigeria',
  ];
  for (const c of countries) {
    if (text.includes(c)) return c === 'USA' ? 'United States' : c === 'UK' ? 'United Kingdom' : c;
  }
  return undefined;
}
