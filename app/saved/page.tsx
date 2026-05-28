"use client";
import React from 'react';
import { motion } from 'framer-motion';
import KanbanBoard from '@/components/ui/KanbanBoard';
import Header from '@/components/layout/Header';
import type { ApplicationStatus, Priority, SavedOpportunity } from '@/types';
import Link from 'next/link';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Saved: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'Planning to Apply': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Applied: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Interview: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Waitlisted: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function SavedPage() {
  const { savedOpps, loading, error, updateSaved, removeSaved } = useSavedOpportunities();

  const handleUpdate = (id: string, field: string, value: string) => {
    updateSaved(id, field, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-zinc-100 pb-20">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
            <p className="text-zinc-400">Track and manage your saved opportunities.</p>
          </div>
          <div className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
            Total Saved: <span className="text-white font-bold">{savedOpps.length}</span>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-red-500/20 bg-red-500/5 rounded-xl text-red-400">
            {error}
          </div>
        ) : savedOpps.length === 0 ? (
          <div className="text-center py-20 border border-zinc-800 bg-zinc-900 rounded-2xl">
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-xl font-semibold mb-2 text-zinc-100">No saved opportunities yet</h2>
            <p className="text-zinc-400 mb-6">Browse the dashboard and click &quot;Save&quot; on opportunities you like.</p>
            <Link href="/" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition-colors">
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <KanbanBoard savedOpps={savedOpps} onStatusChange={(id, newStatus) => handleUpdate(id, 'application_status', newStatus)} />
        )}
      </main>
    </div>
  );
}
