/**
 * devpostScraper.ts
 *
 * Scrapes devpost.com for hackathons & tech competitions.
 * Devpost lists hundreds of hackathons with good metadata.
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
  'https://devpost.com/hackathons?status[]=upcoming&status[]=open',
  'https://devpost.com/hackathons?status[]=open',
];

const MAX_PER_PAGE = 12;
const DELAY_MS = 1200;

export class DevpostScraper implements IScraper {
  readonly name = 'Devpost';
  readonly baseUrl = 'https://devpost.com';

  async run(): Promise<ScraperResult> {
    const start = Date.now();
    const opportunities: RawOpportunity[] = [];
    const seenUrls = new Set<string>();

    for (const listingUrl of LISTING_URLS) {
      try {
        const html = await fetchWithRetry(listingUrl, { retries: 2, delayMs: 1000 });
        const $ = cheerio.load(html);

        // Devpost uses tile-style hackathon cards
        const selectors = [
          'a.hackathon-tile',
          '.hackathon-tile a',
          'a[data-hackathon-slug]',
          '.challenge-listing a',
          '.hackathons-container a',
          'h2 a, h3 a',
        ];

        const links: string[] = [];
        for (const selector of selectors) {
          $(selector).each((_, el) => {
            const href = $(el).attr('href') ?? '';
            if (!href) return;
            const resolved = resolveUrl(href, this.baseUrl);
            if (
              (resolved.includes('devpost.com') || resolved.includes('.devpost.com')) &&
              !resolved.includes('/software') &&
              !resolved.includes('/submissions') &&
              resolved !== this.baseUrl
            ) {
              links.push(resolved);
            }
          });
          if (links.length >= MAX_PER_PAGE) break;
        }

        // Fallback: grab from the tile structure
        if (links.length === 0) {
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const text = $(el).text().trim();
            if (
              href.includes('devpost.com') &&
              !href.includes('/software') &&
              !href.includes('?') &&
              text.length > 10
            ) {
              links.push(resolveUrl(href, this.baseUrl));
            }
          });
        }

        const uniqueLinks = [...new Set(links)].slice(0, MAX_PER_PAGE);
        console.log(`[Devpost] Found ${uniqueLinks.length} hackathon links`);

        // For each hackathon, either scrape or create from listing data
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
            console.warn(`[Devpost] Failed ${link}: ${(err as Error).message}`);
          }
        }

        // Also extract inline hackathon data from the listing page itself
        const inlineOpps = this.extractFromListing($);
        for (const opp of inlineOpps) {
          if (!seenUrls.has(opp.sourceUrl)) {
            seenUrls.add(opp.sourceUrl);
            opportunities.push(opp);
            console.log(`  ✓ (inline) ${opp.title}`);
          }
        }

      } catch (err) {
        console.warn(`[Devpost] Listing failed ${listingUrl}: ${(err as Error).message}`);
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

  private extractFromListing($: ReturnType<typeof cheerio.load>): RawOpportunity[] {
    const opps: RawOpportunity[] = [];

    // Try common Devpost listing card structures
    $('.hackathon-tile, .challenge-card, [data-hackathon-slug]').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, .title, .hackathon-title').first().text().trim() ||
                    $el.attr('data-hackathon-title') || '';
      const href = $el.attr('href') || $el.find('a').first().attr('href') || '';
      const desc = $el.find('.tagline, .description, p').first().text().trim();
      const prize = $el.find('.prize, .prize-amount, [class*=prize]').first().text().trim();

      if (title.length > 5 && href) {
        const sourceUrl = resolveUrl(href, this.baseUrl);
        opps.push({
          title,
          sourceUrl,
          sourceName: this.name,
          rawText: `${title}. ${desc}. Prize: ${prize || 'TBD'}`,
          discoveredAt: nowIso(),
          category: 'competition',
          description: desc || undefined,
          fundingAmount: prize || undefined,
          tags: ['hackathon', 'tech', 'competition'],
        });
      }
    });

    return opps;
  }

  private async scrapeDetailPage(url: string): Promise<RawOpportunity | null> {
    const html = await fetchWithRetry(url, { retries: 2, timeoutMs: 15000 });
    const $ = cheerio.load(html);

    const title =
      $('h1').first().text().trim() ||
      $('title').text().replace(/\s*[-|–].*$/, '').trim();
    if (!title || title.length < 5) return null;

    const bodyEl = $('main, .challenge-container, .hackathon-details, article, .content').first();
    const rawText = truncate(stripHtml(bodyEl.html() ?? $('body').html() ?? ''), 5000);

    // Prize
    const prizeEl = $('[class*=prize], .prize-amount, .prizes').first().text().trim();
    const fundingAmount = prizeEl || extractPrize(rawText);

    // Deadline
    const deadlineEl = $('[class*=deadline], [class*=submission], .dates').first().text().trim();
    const deadline = parseDate(deadlineEl) || extractDeadline(rawText);

    // Tags
    const tags: string[] = ['hackathon', 'tech'];
    $('.tag, .theme, [class*=theme], [class*=tag]').each((_, el) => {
      const t = $(el).text().trim().toLowerCase();
      if (t && t.length < 30) tags.push(t);
    });

    return {
      title,
      sourceUrl: url,
      sourceName: this.name,
      rawText,
      discoveredAt: nowIso(),
      category: 'competition',
      fundingAmount,
      deadline,
      tags: [...new Set(tags)].slice(0, 8),
    };
  }
}

function extractPrize(text: string): string | undefined {
  const m = text.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?|(?:USD|EUR)\s*[\d,]+/i);
  return m?.[0]?.trim();
}

function extractDeadline(text: string): string | undefined {
  const patterns = [
    /(?:deadline|submissions? (?:due|close)|ends?)[:\s]+([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i,
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

function parseDate(text: string): string | undefined {
  if (!text) return undefined;
  const d = new Date(text);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return undefined;
}
