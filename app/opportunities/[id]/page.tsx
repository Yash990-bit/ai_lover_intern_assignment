"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Opportunity } from '@/types';

const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
          <div className="h-96 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20 bg-white border border-slate-200 rounded-2xl">
        <p className="text-red-600 font-bold text-lg mb-2">Error Loading Details</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={() => router.push('/opportunities')}
          className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md"
        >
          Back to Explorer
        </button>
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
      className="max-w-6xl mx-auto p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Elegant Back Button ────────────────────────────────────────── */}
      <Link
        href="/opportunities"
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors gap-2 mb-6 group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Explorer
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ── LEFT COLUMN: Core Details & Description (2/3 width) ────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 bg-white/70 border border-slate-200/80 rounded-2xl shadow-sm space-y-6">
            
            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                {category?.replace(/_/g, ' ') || 'Other'}
              </span>
              {remote_type && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wider">
                  🌐 {remote_type}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-snug">
              {title}
            </h1>

            {/* Dynamic Image Carousel if any */}
            {images.length > 0 && <ImageCarousel images={images} />}

            {/* Description Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                About the Opportunity
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                {description}
              </p>
            </div>

            {/* Eligibility & Metadata Tags */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Eligibility</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 text-slate-600 border border-slate-200/80 px-3 py-1 rounded-md text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
                {student_eligible && (
                  <span className="bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 rounded-md text-xs font-semibold">🎓 Students</span>
                )}
                {women_founder_friendly && (
                  <span className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-md text-xs font-semibold">♀ Women-friendly</span>
                )}
                {indian_applicant_eligible && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-md text-xs font-semibold">🇮🇳 India applicants</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Quick Action Sidebar (1/3 width, sticky) ─── */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-6">
          <div className="bg-white/85 border border-slate-200/80 rounded-2xl p-6 shadow-md space-y-6 backdrop-blur-md">
            <h2 className="font-extrabold text-slate-800 text-base uppercase tracking-wider text-xs border-b border-slate-100 pb-3">
              Quick Details
            </h2>

            {/* Structured info grid */}
            <div className="space-y-4 text-xs font-semibold">
              
              {/* Organizer Row */}
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Organizer</p>
                  <p className="text-slate-800 text-sm font-extrabold">{organization || 'Not Specified'}</p>
                </div>
              </div>

              {/* Location Row */}
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-500 border border-orange-100 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Location / Venue</p>
                  <p className="text-slate-800 text-sm font-extrabold">{country || 'Global Access'}</p>
                </div>
              </div>

              {/* Funding Amount Row */}
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m-4-6h8" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Funding / Grants</p>
                  <p className="text-emerald-600 text-sm font-black">{funding_amount || 'Not Specified'}</p>
                </div>
              </div>

              {/* Deadline Row */}
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Application Deadline</p>
                  <p className="text-red-600 text-sm font-extrabold">
                    {deadline ? new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              
              {application_link ? (
                <a
                  href={application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-[0_4px_15px_rgba(37,99,235,0.25)] text-white rounded-xl font-bold transition shadow-sm transform active:scale-95 text-xs text-center"
                >
                  Apply Directly
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              ) : (
                <span className="w-full block py-3 bg-slate-100 text-slate-400 text-center rounded-xl font-bold border border-slate-200/80 text-xs cursor-not-allowed">
                  No Direct Link Available
                </span>
              )}

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
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition transform active:scale-95 text-xs shadow-inner"
              >
                Bookmark &amp; Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OpportunityDetailPage;
