import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Opportunity } from '@/types';
import { motion } from 'framer-motion';

export default function FeaturedGrant() {
  const [grant, setGrant] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrant() {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('category', 'grant')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) setGrant(data as Opportunity);
      setLoading(false);
    }
    fetchGrant();
  }, []);

  if (loading) {
    return (
      <div className="space-y-1.5 text-left border-l-2 border-l-blue-500 pl-3 py-1 animate-pulse">
        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Featured Grant</p>
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!grant) return null;

  return (
    <motion.div
      className="space-y-1.5 text-left border-l-2 border-l-blue-500 pl-3 py-1"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Featured Grant</p>
      <p className="text-xs font-extrabold text-slate-800 leading-tight">
        {grant.title ?? grant.name ?? 'Untitled Grant'}
      </p>
      <p className="text-[10px] text-slate-400 font-semibold">
        {grant.funding_amount ?? grant.funding ?? ''} • {grant.location ?? 'Remote'}
      </p>
    </motion.div>
  );
}
