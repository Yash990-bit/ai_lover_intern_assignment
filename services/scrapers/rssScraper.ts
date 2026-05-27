/**
 * rssScraper.ts
 *
 * Generic RSS/Atom feed scraper.
 * Accepts any array of feed URLs and parses items into RawOpportunity records.
 *
 * Sources include:
 *   - opportunitydesk.org/feed
 *   - youthop.com/feed
 *   - devex.com/news/rss
 *   - fundsforngos.org/feed
 *   - scholarshipdb.net feed
 *   - internships.com feed
 *   - euraxess feeds
 *   - hacker news hiring
 */

import * as cheerio from 'cheerio';
import type { IScraper, RawOpportunity, ScraperResult } from './baseScraper.js';
import {
  fetchWithRetry,
  stripHtml,
  truncate,
  sleep,
  nowIso,
} from './baseScraper';

export interface RssFeedConfig {
  name: string;
  url: string;
  category?: string;
}

// Massive curated list of working RSS feeds for global opportunities
export const DEFAULT_RSS_FEEDS: RssFeedConfig[] = [
  // ── Opportunity aggregators ──
  { name: 'OpportunityDesk RSS', url: 'https://opportunitydesk.org/feed/', category: 'fellowship' },
  { name: 'YouthOp RSS', url: 'https://www.youthop.com/feed', category: 'scholarship' },
  { name: 'FundsForNGOs', url: 'https://www2.fundsforngos.org/feed/', category: 'grant' },
  { name: 'ScholarshipsAds RSS', url: 'https://scholarshipsads.com/feed/', category: 'scholarship' },

  // ── Development / grants ──
  { name: 'Devex News', url: 'https://www.devex.com/news/rss.xml', category: 'grant' },

  // ── Tech / startups ──
  { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'accelerator' },
  { name: 'Y Combinator Blog', url: 'https://www.ycombinator.com/blog/rss', category: 'accelerator' },
  { name: 'ProductHunt', url: 'https://www.producthunt.com/feed', category: 'competition' },

  // ── Academic / research ──
  { name: 'EURAXESS Jobs', url: 'https://euraxess.ec.europa.eu/api/job-rss', category: 'fellowship' },

  // ── India specific ──
  { name: 'Buddy4Study', url: 'https://www.buddy4study.com/rss', category: 'scholarship' },
];

const FEED_DELAY_MS = 800;
const MAX_ITEMS_PER_FEED = 15;

export class RssScraper implements IScraper {
  readonly name = 'RssScraper';
  readonly baseUrl = 'multiple-rss-feeds';

  private feeds: RssFeedConfig[];

  constructor(feeds: RssFeedConfig[] = DEFAULT_RSS_FEEDS) {
    this.feeds = feeds;
  }

  async run(): Promise<ScraperResult> {
    const start = Date.now();
    const opportunities: RawOpportunity[] = [];

    for (const feed of this.feeds) {
      try {
        const items = await this.parseFeed(feed);
        console.log(`[RSS] ${feed.name}: ${items.length} items`);
        opportunities.push(...items);
        await sleep(FEED_DELAY_MS);
      } catch (err) {
        console.warn(`[RSS] Feed failed — ${feed.name}: ${(err as Error).message}`);
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

  private async parseFeed(feed: RssFeedConfig): Promise<RawOpportunity[]> {
    const xml = await fetchWithRetry(feed.url, {
      retries: 2,
      timeoutMs: 15000,
      extraHeaders: { Accept: 'application/rss+xml, application/atom+xml, text/xml, */*' },
    });

    const $ = cheerio.load(xml, { xmlMode: true });
    const opportunities: RawOpportunity[] = [];

    // Support both RSS <item> and Atom <entry>
    const items = $('item, entry');

    items.slice(0, MAX_ITEMS_PER_FEED).each((_, el) => {
      const item = $(el);

      // Title
      const title = item.find('title').first().text().trim() ||
        item.find('name').first().text().trim();
      if (!title || title.length < 5) return;

      // Link
      const link =
        item.find('link').first().attr('href') ||
        item.find('link').first().text().trim() ||
        item.find('guid').first().text().trim() ||
        '';
      if (!link || !link.startsWith('http')) return;

      // Description / summary
      const descHtml =
        item.find('description').first().text() ||
        item.find('summary').first().text() ||
        item.find('content\\:encoded').first().text() ||
        item.find('content').first().text() ||
        '';
      const rawText = truncate(stripHtml(descHtml), 4000);

      // Published date
      const pubDate =
        item.find('pubDate').first().text() ||
        item.find('published').first().text() ||
        item.find('updated').first().text() ||
        '';
      const parsedDate = pubDate ? new Date(pubDate) : null;
      const deadline = parsedDate && !isNaN(parsedDate.getTime())
        ? undefined // pubDate is publish date, not deadline
        : undefined;

      opportunities.push({
        title,
        sourceUrl: link,
        sourceName: feed.name,
        rawText: rawText || `RSS item from ${feed.name}: ${title}`,
        discoveredAt: nowIso(),
        category: feed.category ?? 'other',
        deadline,
      });
    });

    return opportunities;
  }
}
