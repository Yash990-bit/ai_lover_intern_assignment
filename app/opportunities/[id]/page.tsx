"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { motion } from 'framer-motion';
import type { Opportunity } from '@/types';

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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <p className="text-red-400 font-semibold text-lg mb-2">Error Loading Details</p>
        <p className="text-zinc-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!opportunity) {
    return <EmptyState message="Opportunity not found." />;
  }

  const {
    title,
    description,
    organization,
    country,
    category,
    funding_amount,
    deadline,
    application_link,
    tags = [],
    student_eligible,
    women_founder_friendly,
    indian_applicant_eligible,
    remote_type,
  } = opportunity;

  const images = (opportunity as any).images || [];

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-card p-8 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl shadow-2xl space-y-6">
        {/* Category Header */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            {category?.replace(/_/g, ' ') || 'Other'}
          </span>
          {remote_type && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
              🌐 {remote_type}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>

        {/* Org & Host Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-zinc-800 text-sm text-zinc-300">
          {organization && (
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 font-semibold">Organizer:</span>
              <span className="text-white font-medium">{organization}</span>
            </div>
          )}
          {country && (
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 font-semibold">Location:</span>
              <span className="text-white font-medium">{country}</span>
            </div>
          )}
          {funding_amount && (
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 font-semibold">Funding:</span>
              <span className="text-emerald-400 font-bold">{funding_amount}</span>
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 font-semibold">Deadline:</span>
              <span className="text-red-400 font-bold">
                {new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Image Carousel if any */}
        {images.length > 0 && <ImageCarousel images={images} />}

        {/* Opportunity Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">About the Opportunity</h2>
          <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">{description}</p>
        </div>

        {/* Metadata Eligibility Tags */}
        <div className="flex flex-wrap gap-2 pt-4">
          {tags.map((tag) => (
            <span key={tag} className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 px-3 py-1 rounded-md text-xs font-semibold">
              #{tag}
            </span>
          ))}
          {student_eligible && (
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-md text-xs font-semibold">🎓 Student Eligible</span>
          )}
          {women_founder_friendly && (
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-md text-xs font-semibold">♀ Women Founder Friendly</span>
          )}
          {indian_applicant_eligible && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-md text-xs font-semibold">🇮🇳 India Eligible</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-zinc-800">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/saved', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ opportunityId: opportunity.id })
                });
                if (res.ok || res.status === 409) {
                  alert('Saved to application tracker!');
                }
              } catch(e) {}
            }}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold border border-zinc-700 transition"
          >
            Save to Tracker
          </button>
          
          {application_link ? (
            <a
              href={application_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[2] flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition"
            >
              Apply Directly
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          ) : (
            <span className="flex-[2] text-center py-3 bg-zinc-900 text-zinc-600 rounded-xl font-bold border border-zinc-800 cursor-not-allowed">
              No Application Link
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OpportunityDetailPage;
