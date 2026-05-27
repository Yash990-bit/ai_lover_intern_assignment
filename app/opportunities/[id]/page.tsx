import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { motion } from 'framer-motion';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  images?: string[]; // expecting an array of URLs
  // add other fields as needed
}

const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();
        if (fetchError) throw fetchError;
        setOpportunity(data as Opportunity);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load opportunity');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOpportunity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!opportunity) {
    return <EmptyState message="Opportunity not found." />;
  }

  const { title, description, images = [] } = opportunity;

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="space-y-4">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {images.length > 0 && <ImageCarousel images={images} />}
        <p className="text-white/80">{description}</p>
        {/* Action buttons - placeholder implementations */}
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Save
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Apply
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default OpportunityDetailPage;
