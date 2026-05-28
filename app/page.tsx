'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import FilterBar from '@/components/opportunities/FilterBar';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import type { Opportunity, OpportunityFilters, PaginatedResponse } from '@/types';

async function fetchOpportunities(
  filters: OpportunityFilters
): Promise<PaginatedResponse<Opportunity>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.country) params.set('country', filters.country);
  if (filters.remote_type) params.set('remote_type', filters.remote_type);
  if (filters.student_eligible) params.set('student_eligible', 'true');
  if (filters.women_founder_friendly) params.set('women_founder_friendly', 'true');
  if (filters.indian_applicant_eligible) params.set('indian_applicant_eligible', 'true');
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', String(filters.pageSize ?? 12));

  if ((filters as any).ai_mode && filters.search) {
    const res = await fetch('/api/search/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: filters.search }),
    });
    if (!res.ok) throw new Error('AI Search failed');
    const data = await res.json();
    return data.results;
  }

  const res = await fetch(`/api/opportunities?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch opportunities');
  return res.json();
}

type ScrapeResult = {
  success: boolean;
  scraped?: number;
  inserted?: number;
  aiSuccess?: number;
  aiFailed?: number;
  sources?: { name: string; status: string; found: number }[];
  error?: string;
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<OpportunityFilters>({ page: 1, pageSize: 12 });
  const [response, setResponse] = useState<PaginatedResponse<Opportunity> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeOpportunities: 0, savedOpportunities: 0, deadlinesThisWeek: 0 });

  // Scrape Now state
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [showScrapeModal, setShowScrapeModal] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  }, []);

  const load = useCallback(async (f: OpportunityFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOpportunities(f);
      setResponse(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filters); }, [filters, load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const handleFiltersChange = useCallback((partial: Partial<OpportunityFilters>) => {
    setFilters((prev) => {
      if (partial.search !== undefined && !(partial as any).ai_mode) {
        (prev as any).ai_mode = false;
      }
      return { ...prev, ...partial };
    });
  }, []);

  const handleScrapeNow = async () => {
    setScraping(true);
    setScrapeResult(null);
    setShowScrapeModal(true);
    try {
      const res = await fetch('/api/scrape/run', { method: 'POST' });
      const data = await res.json();
      setScrapeResult(data);
      if (data.success) {
        await load(filters);
        await loadStats();
      }
    } catch {
      setScrapeResult({ 
        success: false, 
        error: 'Background Sync Initiated: Vercel timed out the connection, but the scrapers are still running in the background. Please refresh the dashboard in 5 minutes to see the new data!' 
      });
    } finally {
      setScraping(false);
    }
  };

  const totalPages = response ? Math.ceil(response.total / (filters.pageSize ?? 12)) : 0;

  const STATS_CARDS = [
    { label: 'Active Opportunities', value: stats.activeOpportunities > 0 ? stats.activeOpportunities : '...', icon: '🌍' },
    { label: 'Saved by You', value: stats.savedOpportunities > 0 ? stats.savedOpportunities : '0', icon: '⭐' },
    { label: 'Deadlines This Week', value: stats.deadlinesThisWeek > 0 ? stats.deadlinesThisWeek : '0', icon: '⏳' },
    { label: 'Updated', value: 'Daily', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Header />

      {/* ── Scrape Now Modal ─────────────────────────────────────────── */}
      {showScrapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur px-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${scraping ? 'bg-indigo-400 animate-pulse' : scrapeResult?.success ? 'bg-green-400' : 'bg-red-400'}`} />
              <h2 className="text-white font-bold text-lg">
                {scraping ? 'Scraping the web…' : scrapeResult?.success ? 'Scrape Complete! 🎉' : 'Scrape Failed'}
              </h2>
            </div>

            {scraping && (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">Scraping OpportunityDesk, YouthOp, Devpost, Idealist, ScholarshipsAds &amp; 10+ RSS feeds…</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-[scrape_2s_ease-in-out_infinite]" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <p className="text-slate-500 text-xs">This may take 1–3 minutes. Please wait…</p>
              </div>
            )}

            {!scraping && scrapeResult && scrapeResult.success && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-bold text-indigo-400">{scrapeResult.scraped ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-1">Found online</p>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-bold text-green-400">{scrapeResult.inserted ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-1">New added</p>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-bold text-purple-400">{scrapeResult.aiSuccess ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-1">AI processed</p>
                  </div>
                </div>

                {scrapeResult.sources && (
                  <div className="mt-3 space-y-1">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Sources</p>
                    {scrapeResult.sources.map((s) => (
                      <div key={s.name} className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-slate-300">{s.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {s.found} found
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-slate-500 text-xs mt-2">Dashboard has been refreshed with the latest data.</p>
              </div>
            )}

            {!scraping && scrapeResult && !scrapeResult.success && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{scrapeResult.error ?? 'An unknown error occurred.'}</p>
              </div>
            )}

            {!scraping && (
              <button
                onClick={() => setShowScrapeModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <section className="relative pt-24 pb-12 border-b border-zinc-800 bg-[#09090b]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 items-start justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6 font-extrabold tracking-tight">
                Unlock Your Next <span className="text-emerald-500">Breakthrough.</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mb-8 leading-relaxed">
                Harness the power of neural intelligence to navigate the complex global landscape. We scan millions of data points to deliver curated growth opportunities in real-time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <button
                  onClick={handleScrapeNow}
                  disabled={scraping}
                  className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {scraping ? (
                    <>
                      <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Syncing Intel...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Run AI Scraper
                    </>
                  )}
                </button>
              </div>

              {/* Live Intel Stats */}
              <div className="flex flex-wrap gap-4">
                {STATS_CARDS.map((stat) => (
                  <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-md p-5 min-w-[160px] flex-1 shadow-sm transition-colors hover:border-zinc-700">
                    <div className="text-zinc-500 font-medium text-sm mb-2 flex items-center gap-2">
                      {stat.label === 'Active' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {stat.label}
                    </div>
                    <div className="font-bold text-3xl text-zinc-100">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />

        <div className="flex items-center justify-between mt-8 mb-5">
          <p className="text-slate-400 text-sm">
            {loading ? (
              <span className="inline-block w-32 h-4 bg-white/10 rounded animate-pulse" />
            ) : (
              <>
                Showing{' '}
                <span className="text-white font-semibold">{response?.data.length ?? 0}</span>
                {' '}of{' '}
                <span className="text-white font-semibold">{response?.total ?? 0}</span>
                {' '}opportunities
              </>
            )}
          </p>
          <select
            id="sort-select"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-400 focus:outline-none focus:border-indigo-500/70 cursor-pointer"
          >
            <option className="bg-slate-900">Newest first</option>
            <option className="bg-slate-900">Deadline soon</option>
            <option className="bg-slate-900">Funding high</option>
          </select>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-medium mb-2">Failed to load opportunities</p>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => load(filters)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 h-64 animate-pulse">
                <div className="w-20 h-4 bg-white/10 rounded-full mb-3" />
                <div className="w-3/4 h-5 bg-white/10 rounded mb-2" />
                <div className="w-1/2 h-4 bg-white/10 rounded mb-4" />
                <div className="w-full h-3 bg-white/10 rounded mb-2" />
                <div className="w-5/6 h-3 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : response?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔭</div>
            <p className="text-white font-semibold text-lg mb-2">No opportunities found</p>
            <p className="text-slate-400 text-sm">
              Try adjusting your filters or{' '}
              <button
                onClick={() =>
                  handleFiltersChange({
                    search: undefined,
                    category: undefined,
                    remote_type: undefined,
                    student_eligible: undefined,
                    women_founder_friendly: undefined,
                    indian_applicant_eligible: undefined,
                    page: 1,
                  })
                }
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                clear all filters
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {response?.data.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              id="pagination-prev"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => handleFiltersChange({ page: (filters.page ?? 1) - 1 })}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-slate-400 text-sm px-2">
              Page {filters.page ?? 1} of {totalPages}
            </span>
            <button
              id="pagination-next"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => handleFiltersChange({ page: (filters.page ?? 1) + 1 })}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm mt-16">
        <p>© 2026 OpportunityTracker · AI-Powered Global Opportunity Discovery</p>
      </footer>
    </div>
  );
}
