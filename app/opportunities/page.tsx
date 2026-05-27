import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import SearchBar from '@/components/ui/SearchBar';
import OpportunityFilters from '@/components/ui/OpportunityFilters';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  created_at: string;
  category?: string;
}

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 p-4">{error}</p>;
  }

  const filteredOpps = opps.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? opp.category === category : true;
    return matchesSearch && matchesCategory;
  });

  if (filteredOpps.length === 0) {
    return <EmptyState message="No opportunities match your search or filter criteria." />;
  }

  return (
    <div className="p-4">
      <SearchBar value={search} onChange={setSearch} />
      <OpportunityFilters category={category} setCategory={setCategory} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOpps.map((opp) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full flex flex-col justify-between">
              <h3 className="text-xl font-semibold text-gray-100 mb-2 line-clamp-2">
                {opp.title}
              </h3>
              <p className="text-gray-300 line-clamp-3 flex-grow">
                {opp.description}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {new Date(opp.created_at).toLocaleDateString()}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OpportunitiesPage;
