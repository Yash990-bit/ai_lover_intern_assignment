'use client';

import { useState, useEffect, useCallback } from 'react';
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
  setFilters((prev) => ({
    ...prev,
    ...partial,
    ai_mode: (partial as any).ai_mode ?? false,
  }));
}, []);

  const handleScrapeNow = async () => {
    setScraping(true);
    setScrapeResult(null);
    setShowScrapeModal(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${baseUrl}/api/scrape/run`, { method: 'POST' });
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
    { label: 'Update Schedule', value: 'Daily', icon: '⚡' },
  ];

  return (
    <div className="bg-transparent text-slate-800">
      
      {/* ── Scrape Now Modal ─────────────────────────────────────────── */}
      {showScrapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md px-4">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3.5 h-3.5 rounded-full ${scraping ? 'bg-blue-500 animate-pulse' : scrapeResult?.success ? 'bg-green-500' : 'bg-red-500'}`} />
              <h2 className="text-slate-800 font-extrabold text-lg">
                {scraping ? 'Syncing Intel…' : scrapeResult?.success ? 'Scrape Complete! 🎉' : 'Scrape Failed'}
              </h2>
            </div>

            {scraping && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">Scraping OpportunityDesk, YouthOp, Devpost, Idealist, ScholarshipsAds &amp; 10+ RSS feeds…</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
                <p className="text-slate-400 text-xs">This may take 1–3 minutes. The scraper executes asynchronously.</p>
              </div>
            )}

            {!scraping && scrapeResult && scrapeResult.success && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-2xl font-bold text-blue-600">{scrapeResult.scraped ?? 0}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Found</p>
                  </div>
                  <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-2xl font-bold text-orange-600">{scrapeResult.inserted ?? 0}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">New</p>
                  </div>
                  <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-2xl font-bold text-blue-800">{scrapeResult.aiSuccess ?? 0}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">AI Checked</p>
                  </div>
                </div>

                {scrapeResult.sources && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Sources Monitored</p>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {scrapeResult.sources.map((s) => (
                        <div key={s.name} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                          <span className="text-slate-600 font-medium">{s.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.found > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                            {s.found} found
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-slate-400 text-xs">Dashboard is updated with the latest discovered intelligence.</p>
              </div>
            )}

            {!scraping && scrapeResult && !scrapeResult.success && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">{scrapeResult.error ?? 'An unknown error occurred.'}</p>
              </div>
            )}

            {!scraping && (
              <button
                onClick={() => setShowScrapeModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all transform active:scale-95"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Hero Banner Section ─────────────────────────────────────────── */}
      <section className="relative py-12 border-b border-slate-200/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-10 mb-8 shadow-sm">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 items-start justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider mb-4 animate-pulse">
                ⚡ Neural Intelligence Feed Active
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-800 mb-6">
                Unlock Your Next <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Breakthrough.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
                Harness the power of neural intelligence to navigate the complex global landscape. We scan millions of data points to deliver curated growth opportunities in real-time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                <button
                  onClick={handleScrapeNow}
                  disabled={scraping}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 text-sm shadow-md"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Data Scraper AI
                    </>
                  )}
                </button>
              </div>

              {/* Live Intel Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {STATS_CARDS.map((stat) => (
                  <div key={stat.label} className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all hover:border-blue-300 hover:shadow-md group">
                    <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="text-sm shrink-0">{stat.icon}</span>
                      {stat.label}
                    </div>
                    <div className="font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
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
      <main className="py-6">
        <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />

        <div className="flex items-center justify-between mt-8 mb-5">
          <p className="text-slate-500 text-sm">
            {loading ? (
              <span className="inline-block w-32 h-4 bg-slate-200 rounded animate-pulse" />
            ) : (
              <>
                Showing{' '}
                <span className="text-slate-800 font-bold">{response?.data.length ?? 0}</span>
                {' '}of{' '}
                <span className="text-slate-880 font-bold">{response?.total ?? 0}</span>
                {' '}opportunities
              </>
            )}
          </p>
          <div className="relative">
            <select
              id="sort-select"
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl pl-4 pr-10 py-2 text-sm font-semibold text-slate-600 focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm transition-all"
            >
              <option>Newest first</option>
              <option>Deadline soon</option>
              <option>Funding high</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl p-8">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-bold mb-2">Failed to load opportunities</p>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => load(filters)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all active:scale-95"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 h-64 animate-pulse space-y-4">
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
                <div className="w-3/4 h-6 bg-slate-200 rounded" />
                <div className="w-1/2 h-4 bg-slate-200 rounded" />
                <div className="w-full h-3 bg-slate-200 rounded" />
                <div className="w-5/6 h-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : response?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl p-8">
            <div className="text-5xl mb-4">🔭</div>
            <p className="text-slate-800 font-bold text-lg mb-2">No opportunities found</p>
            <p className="text-slate-500 text-sm">
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
                className="text-blue-600 hover:text-blue-700 font-bold underline"
              >
                clear all filters
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {response?.data.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              id="pagination-prev"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => handleFiltersChange({ page: (filters.page ?? 1) - 1 })}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              ← Prev
            </button>
            <span className="text-slate-500 text-sm px-3 font-semibold">
              Page {filters.page ?? 1} of {totalPages}
            </span>
            <button
              id="pagination-next"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => handleFiltersChange({ page: (filters.page ?? 1) + 1 })}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/60 py-8 text-center text-slate-400 text-xs mt-16 font-semibold">
        <p>© 2026 DataScout AI · Neural Opportunity Discovery Platform</p>
      </footer>
    </div>
  );
}
