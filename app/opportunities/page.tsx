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
        <h1 className="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">Explore Opportunities</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-20 bg-white border border-slate-200 rounded-2xl">
        <p className="text-red-600 font-bold text-lg mb-2">Error Loading Opportunities</p>
        <p className="text-slate-500 text-sm">{error}</p>
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
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Explore Opportunities</h1>
          <p className="text-slate-500 text-sm mt-1">Discover global scholarships, fellowships, and tech competitions</p>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          Showing <span className="text-blue-600 font-bold">{filteredOpps.length}</span> of {opps.length} total
        </div>
      </div>

      <div className="glass-card p-6 mb-8 flex flex-col md:flex-row gap-4 items-center bg-white/70 border border-slate-200/80 shadow-sm">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search keyword, role, or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:outline-none text-slate-800 px-5 py-2.5 rounded-xl text-sm placeholder:text-slate-400 transition-all duration-200 shadow-inner"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-blue-600 focus:outline-none text-slate-800 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200 shadow-inner"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
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
