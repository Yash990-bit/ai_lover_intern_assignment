'use client';

import { useState, useCallback } from 'react';
import type { OpportunityFilters } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'scholarship', label: '🎓 Scholarship' },
  { value: 'fellowship', label: '🔬 Fellowship' },
  { value: 'accelerator', label: '🚀 Accelerator' },
  { value: 'grant', label: '💰 Grant' },
  { value: 'competition', label: '🏆 Competition' },
  { value: 'conference', label: '🎤 Conference' },
  { value: 'exchange_program', label: '🌍 Exchange Program' },
  { value: 'government_scheme', label: '🏛 Gov Scheme' },
  { value: 'giveaway', label: '🎁 Giveaway' },
];

const REMOTE_TYPES = [
  { value: '', label: 'Any Format' },
  { value: 'remote', label: '🌐 Remote' },
  { value: 'in-person', label: '📍 In-person' },
  { value: 'hybrid', label: '🔀 Hybrid' },
];

interface FilterBarProps {
  filters: OpportunityFilters;
  onFiltersChange: (f: Partial<OpportunityFilters>) => void;
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const [aiSearchValue, setAiSearchValue] = useState('');

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onFiltersChange({ search: searchValue, page: 1 });
    },
    [searchValue, onFiltersChange]
  );

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl shadow-sm bg-white/70 border border-slate-200/80">
      {/* Search Bars Container */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Standard Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-5 py-3 border border-slate-200/80 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-full shadow-inner">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-input"
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search keywords, roles, or skills..."
              className="bg-transparent border-none text-slate-800 w-full focus:ring-0 text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] ml-2 whitespace-nowrap text-xs transform active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* AI Search bar */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (aiSearchValue.trim()) {
            onFiltersChange({ search: aiSearchValue, ai_mode: true, page: 1 } as any);
          }
        }} className="relative group">
          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-5 py-3 border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all h-full shadow-inner">
            <svg className="w-5 h-5 text-orange-500 animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <input
              id="ai-search-input"
              type="text"
              value={aiSearchValue}
              onChange={(e) => setAiSearchValue(e.target.value)}
              placeholder="Ask AI: e.g. 'Show me grants for women founders...'"
              className="bg-transparent border-none text-slate-800 w-full focus:ring-0 text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold px-6 py-2.5 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(249,115,22,0.2)] ml-2 whitespace-nowrap text-xs transform active:scale-95"
            >
              AI Discovery
            </button>
          </div>
        </form>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] px-1">Filters</span>
        
        {/* Category dropdown */}
        <div className="relative group">
          <select
            id="filter-category"
            value={filters.category ?? ''}
            onChange={(e) => onFiltersChange({ category: e.target.value || undefined, page: 1 })}
            className="appearance-none px-4 py-2 pr-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer min-w-[150px] shadow-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-white text-slate-800">
                {c.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Remote type */}
        <div className="relative group">
          <select
            id="filter-remote-type"
            value={filters.remote_type ?? ''}
            onChange={(e) => onFiltersChange({ remote_type: e.target.value || undefined, page: 1 })}
            className="appearance-none px-4 py-2 pr-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer min-w-[130px] shadow-sm"
          >
            {REMOTE_TYPES.map((r) => (
              <option key={r.value} value={r.value} className="bg-white text-slate-800">
                {r.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Toggle chips */}
        <button
          id="filter-student"
          onClick={() => onFiltersChange({ student_eligible: !filters.student_eligible || undefined, page: 1 })}
          className={`px-4 py-2 rounded-full border transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm transform active:scale-95 ${
            filters.student_eligible
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          🎓 Students
        </button>

        <button
          id="filter-women"
          onClick={() => onFiltersChange({ women_founder_friendly: !filters.women_founder_friendly || undefined, page: 1 })}
          className={`px-4 py-2 rounded-full border transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm transform active:scale-95 ${
            filters.women_founder_friendly
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          ♀ Women-friendly
        </button>

        <button
          id="filter-india"
          onClick={() => onFiltersChange({ indian_applicant_eligible: !filters.indian_applicant_eligible || undefined, page: 1 })}
          className={`px-4 py-2 rounded-full border transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm transform active:scale-95 ${
            filters.indian_applicant_eligible
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          🇮🇳 India eligible
        </button>

        {/* Clear filters */}
        {(filters.search || filters.category || filters.remote_type || filters.student_eligible || filters.women_founder_friendly || filters.indian_applicant_eligible || filters.country || filters.tag) && (
          <button
            id="clear-filters"
            onClick={() => {
              setSearchValue('');
              setAiSearchValue('');
              onFiltersChange({
                search: undefined,
                category: undefined,
                remote_type: undefined,
                student_eligible: undefined,
                women_founder_friendly: undefined,
                indian_applicant_eligible: undefined,
                country: undefined,
                tag: undefined,
                page: 1,
              });
            }}
            className="text-blue-600 font-extrabold text-xs hover:underline ml-auto flex items-center gap-1 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
