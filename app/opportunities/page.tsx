"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import type { Opportunity } from '@/types';

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
  { value: 'other', label: '🎁 Other' },
];

const OpportunitiesPage: React.FC = () => {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOpps(data as Opportunity[]);
      } catch (e: any) {
        setError(e.message || 'Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Explore Opportunities</h1>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-20">
        <p className="text-red-400 font-semibold text-lg mb-2">Error Loading Opportunities</p>
        <p className="text-zinc-500 text-sm">{error}</p>
      </div>
    );
  }

  const filteredOpps = opps.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      (opp.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (opp.organization || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? opp.category === category : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Opportunities</h1>
          <p className="text-zinc-400 text-sm mt-1">Discover global scholarships, fellowships, and tech competitions</p>
        </div>
        <div className="text-sm text-zinc-500">
          Showing <span className="text-zinc-200 font-bold">{filteredOpps.length}</span> of {opps.length} total
        </div>
      </div>

      <div className="glass-card p-5 mb-8 flex flex-col md:flex-row gap-4 items-center bg-zinc-900/50 border border-zinc-800/80 rounded-2xl shadow-xl">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search keyword, role, or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950/65 border border-zinc-800 focus:border-indigo-500 focus:outline-none text-white px-5 py-2.5 rounded-xl text-sm placeholder:text-zinc-500 transition-colors"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none bg-zinc-950/65 border border-zinc-800 focus:border-indigo-500 focus:outline-none text-white px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-zinc-900">
                {c.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {filteredOpps.length === 0 ? (
        <EmptyState message="No opportunities match your filter or search criteria." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpps.map((opp) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <OpportunityCard opportunity={opp} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
