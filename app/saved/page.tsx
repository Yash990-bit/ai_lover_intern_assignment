"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import type { ApplicationStatus, Priority } from '@/types';

export default function SavedPage() {
  const { savedOpps, loading, error, updateSaved, removeSaved } = useSavedOpportunities();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const handleUpdate = (id: string, field: string, value: string) => {
    updateSaved(id, field, value);
  };

  const handleUnsave = async (id: string) => {
    if (confirm('Are you sure you want to remove this saved opportunity?')) {
      try {
        await removeSaved(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter saved opportunities based on search keyword and priority filter
  const filteredOpps = savedOpps.filter((s) => {
    const title = s.opportunity?.title || '';
    const org = s.opportunity?.organization || '';
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      org.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter ? s.priority === priorityFilter : true;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="bg-transparent text-slate-800 pb-20">
      <main className="max-w-7xl mx-auto mt-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Saved Listings</h1>
            <p className="text-slate-500 text-sm mt-1">Review, prioritize, and manage your bookmarked opportunities.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tracker"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all flex items-center gap-1.5 shadow-sm text-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-6h6v6" />
                <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
              </svg>
              View Kanban Board
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center bg-white/70 border border-slate-200/80 shadow-sm">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="Search saved items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:outline-none text-slate-800 px-4 py-2 rounded-xl text-xs placeholder:text-slate-400 transition-all duration-200 shadow-inner"
            />
          </div>
          <div className="w-full sm:w-48 relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-blue-600 focus:outline-none text-slate-700 px-4 py-2 rounded-xl text-xs cursor-pointer transition-all duration-200 shadow-inner"
            >
              <option value="">All Priorities</option>
              <option value="High">🔥 High Priority</option>
              <option value="Medium">⚡ Medium Priority</option>
              <option value="Low">💤 Low Priority</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/70 border border-slate-200/80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-red-100 bg-red-50 rounded-2xl text-red-600 font-bold">
            {error}
          </div>
        ) : savedOpps.length === 0 ? (
          <div className="text-center py-20 border border-slate-200/80 bg-white/70 rounded-2xl shadow-sm p-8 max-w-lg mx-auto">
            <div className="text-5xl mb-4">📂</div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">No saved opportunities yet</h2>
            <p className="text-slate-500 text-sm mb-6">Browse the dashboard and click &quot;Save&quot; on opportunities you like.</p>
            <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs">
              Browse Opportunities
            </Link>
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="text-center py-16 border border-slate-200 bg-white/70 rounded-2xl shadow-sm">
            <p className="text-slate-500 font-semibold text-sm">No saved opportunities matches your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOpps.map((s) => (
              <div key={s.id} className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-blue-200">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                      {s.opportunity?.category?.replace(/_/g, ' ') || 'Other'}
                    </span>
                    {s.opportunity?.remote_type && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wider">
                        🌐 {s.opportunity?.remote_type}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                    {s.opportunity?.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold">
                    {s.opportunity?.organization} {s.opportunity?.country ? `· ${s.opportunity.country}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={s.application_status}
                      onChange={(e) => handleUpdate(s.id, 'application_status', e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                    >
                      <option value="Saved">📁 Saved</option>
                      <option value="Planning to Apply">📅 Planning</option>
                      <option value="Applied">📝 Applied</option>
                      <option value="Interview">🎤 Interview</option>
                      <option value="Accepted">🎉 Accepted</option>
                      <option value="Waitlisted">⏳ Waitlisted</option>
                      <option value="Rejected">❌ Rejected</option>
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Priority Dropdown */}
                  <div className="relative">
                    <select
                      value={s.priority}
                      onChange={(e) => handleUpdate(s.id, 'priority', e.target.value)}
                      className={`appearance-none border rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold cursor-pointer focus:outline-none transition-all shadow-sm ${
                        s.priority === 'High'
                          ? 'bg-orange-50 border-orange-200 text-orange-700 focus:border-orange-500'
                          : s.priority === 'Medium'
                          ? 'bg-blue-50 border-blue-200 text-blue-600 focus:border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-500 focus:border-slate-400'
                      }`}
                    >
                      <option value="High">🔥 High</option>
                      <option value="Medium">⚡ Medium</option>
                      <option value="Low">💤 Low</option>
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Details Button */}
                  <Link
                    href={`/opportunities/${s.opportunity_id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs shadow-sm transition-all text-center"
                  >
                    Details
                  </Link>

                  {/* Direct Link if any */}
                  {s.opportunity?.application_link && (
                    <a
                      href={s.opportunity.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-xs shadow-sm transition-all text-center flex items-center gap-1 hover:shadow-[0_4px_10px_rgba(37,99,235,0.2)]"
                    >
                      Apply
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleUnsave(s.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 border border-slate-200 hover:border-red-200 transition-colors shadow-sm"
                    title="Remove from Saved"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
