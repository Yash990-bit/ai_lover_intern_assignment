import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import KanbanBoard from '@/components/ui/KanbanBoard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import type { SavedOpportunity } from '@/types';

export default function TrackerPage() {
  const { savedOpps, loading, error, updateSaved } = useSavedOpportunities();
  const router = useRouter();

  // Data fetching is now handled by useSavedOpportunities hook

  // Called by KanbanBoard when a card status changes (drag & drop)
  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateSaved(id, 'application_status', newStatus);
    } catch (err) {
      console.error(err);
      // Hook will handle error and state sync
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <Header />
        <div className="space-y-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <Header />
        <div className="p-8 text-center border border-red-500/20 bg-red-500/5 rounded-xl text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (savedOpps.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <Header />
        <EmptyState message="No saved opportunities yet. Browse the dashboard and click ‘Save’ to add them here." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <Header />
      <main className="max-w-7xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Application Tracker</h1>
        <KanbanBoard savedOpps={savedOpps} onStatusChange={handleStatusChange} />
      </main>
    </div>
  );
}
