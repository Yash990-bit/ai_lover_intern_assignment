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
    <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-2xl bg-zinc-900/50 border border-zinc-800/80">
      {/* Search Bars Container */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Standard Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="flex items-center gap-4 bg-background-main/50 rounded-2xl px-6 py-4 border border-border-glass focus-within:border-primary transition-all h-full">
            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              id="search-input"
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search keywords, roles, or skills..."
              className="bg-transparent border-none text-text-primary w-full focus:ring-0 text-sm placeholder:text-text-secondary/50 focus:outline-none"
            />
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-2 rounded-xl transition-all hover:brightness-110 ml-2 whitespace-nowrap text-sm">
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
          <div className="flex items-center gap-4 bg-background-main/50 rounded-2xl px-6 py-4 border border-border-glass focus-within:border-primary transition-all h-full shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <svg className="w-6 h-6 text-primary animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <input
              id="ai-search-input"
              type="text"
              value={aiSearchValue}
              onChange={(e) => setAiSearchValue(e.target.value)}
              placeholder="Ask AI: e.g. 'Show me grants for women founders...'"
              className="bg-transparent border-none text-text-primary w-full focus:ring-0 text-sm placeholder:text-text-secondary/50 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-6 py-2 rounded-xl transition-all hover:brightness-110 ml-2 whitespace-nowrap text-sm"
            >
              AI Discovery
            </button>
          </div>
        </form>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-text-secondary font-medium text-sm px-2">Filters:</span>
        
        {/* Category dropdown */}
        <div className="relative group">
          <select
            id="filter-category"
            value={filters.category ?? ''}
            onChange={(e) => onFiltersChange({ category: e.target.value || undefined, page: 1 })}
            className="appearance-none px-4 py-2 rounded-full bg-surface/50 backdrop-blur-md border border-border-glass hover:bg-primary/20 hover:border-primary transition-all text-sm font-medium text-text-primary focus:outline-none cursor-pointer min-w-[160px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-surface text-text-primary py-2">
                {c.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Remote type */}
        <div className="relative group">
          <select
            id="filter-remote-type"
            value={filters.remote_type ?? ''}
            onChange={(e) => onFiltersChange({ remote_type: e.target.value || undefined, page: 1 })}
            className="appearance-none px-4 py-2 rounded-full bg-surface/50 backdrop-blur-md border border-border-glass hover:bg-primary/20 hover:border-primary transition-all text-sm font-medium text-text-primary focus:outline-none cursor-pointer min-w-[140px]"
          >
            {REMOTE_TYPES.map((r) => (
              <option key={r.value} value={r.value} className="bg-surface text-text-primary">
                {r.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="h-6 w-px bg-border-glass mx-2 hidden sm:block"></div>

        {/* Toggle chips */}
        <button
          id="filter-student"
          onClick={() => onFiltersChange({ student_eligible: !filters.student_eligible || undefined, page: 1 })}
          className={`px-4 py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${
            filters.student_eligible
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-surface/50 border-border-glass hover:bg-primary/10 hover:border-primary/50 text-text-primary'
          }`}
        >
          🎓 Students
        </button>

        <button
          id="filter-women"
          onClick={() => onFiltersChange({ women_founder_friendly: !filters.women_founder_friendly || undefined, page: 1 })}
          className={`px-4 py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${
            filters.women_founder_friendly
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-surface/50 border-border-glass hover:bg-primary/10 hover:border-primary/50 text-text-primary'
          }`}
        >
          ♀ Women-friendly
        </button>

        <button
          id="filter-india"
          onClick={() => onFiltersChange({ indian_applicant_eligible: !filters.indian_applicant_eligible || undefined, page: 1 })}
          className={`px-4 py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${
            filters.indian_applicant_eligible
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-surface/50 border-border-glass hover:bg-primary/10 hover:border-primary/50 text-text-primary'
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
            className="text-primary font-medium text-sm hover:underline ml-auto flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
