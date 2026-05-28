"use client";

import React from 'react';
import Link from 'next/link';
import KanbanBoard from '@/components/ui/KanbanBoard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';

export default function TrackerPage() {
  const { savedOpps, loading, error, updateSaved } = useSavedOpportunities();

  // Called by KanbanBoard when a card status changes (drag & drop)
  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateSaved(id, 'application_status', newStatus);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-6 space-y-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-6">
        <div className="p-8 text-center border border-red-100 bg-red-50 rounded-2xl text-red-600 font-bold">
          {error}
        </div>
      </div>
    );
  }

  if (savedOpps.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mt-6">
        <div className="text-center py-20 border border-slate-200/80 bg-white/70 rounded-2xl shadow-sm p-8 max-w-lg mx-auto">
          <div className="text-5xl mb-4">📂</div>
          <h2 className="text-xl font-bold mb-2 text-slate-800">No saved opportunities yet</h2>
          <p className="text-slate-500 text-sm mb-6">Browse the dashboard and click &quot;Save&quot; on opportunities you like to start tracking them.</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs">
            Browse Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent text-slate-800 pb-20">
      <main className="max-w-7xl mx-auto mt-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Application Tracker</h1>
            <p className="text-slate-500 text-sm mt-1">Drag and drop your opportunities across pipeline columns to manage application workflows.</p>
          </div>
          <div>
            <Link
              href="/saved"
              className="bg-white border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm text-xs"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              View Saved Listings List
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard savedOpps={savedOpps} onStatusChange={handleStatusChange} />
      </main>
    </div>
  );
}
