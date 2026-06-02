'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import type { Opportunity } from '@/types';
import FeaturedGrant from '@/components/opportunities/FeaturedGrant';

export default function LandingPage() {
  const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLandingData() {
      try {
        // Fetch top 3 most recent opportunities
        const { data, count, error } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          setRecentOpps(data as Opportunity[]);
        }
        if (count !== null) {
          setTotalCount(count);
        }
      } catch (e) {
        console.error('Failed to load landing data', e);
      } finally {
        setLoading(false);
      }
    }
    loadLandingData();
  }, []);

  const FEATURES = [
    {
      title: 'AI Discovery Search',
      description: 'Describe what you need in plain English and let our custom NLP search find tailored opportunities instantly.',
      icon: '🧠',
      accent: 'border-l-blue-500'
    },
    {
      title: 'On-Demand Scrapers',
      description: 'Trigger our network of synchronous background scrapers in one click to source the freshest listings on the web.',
      icon: '⚡',
      accent: 'border-l-orange-500'
    },
    {
      title: 'Application Tracker',
      description: 'Drag and drop your opportunities across a premium, interactive Kanban board to track your application pipeline.',
      icon: '📊',
      accent: 'border-l-purple-500'
    },
    {
      title: 'Global Inclusion',
      description: 'Specialized flags and filters curated specifically for students, women founders, and Indian applicants.',
      icon: '🌎',
      accent: 'border-l-emerald-500'
    }
  ];

  return (
    <div className="bg-transparent text-slate-800 space-y-16 pb-20">
      {/* ── Hero Presentation Banner ───────────────────────────────────── */}
      <section className="relative py-16 md:py-20 border-b border-slate-200/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-12 shadow-sm text-center md:text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider animate-pulse">
              🚀 Discover Curation Redefined
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-800">
              Discover Your Next <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Global Leap.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              DataScout AI combines real-time multi-source scraping with artificial intelligence to deliver high-impact scholarships, fellowships, grants, and accelerators straight to you.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-md text-sm"
              >
                Launch Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/opportunities"
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 font-bold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                Browse Listings
              </Link>
            </div>
          </div>

          {/* Visual Floating Graphic */}
          <div className="hidden lg:block relative w-80 h-80">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/10 to-orange-500/10 blur-2xl animate-pulse" />

            {/* Absolute Centered Parent Container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              {/* Inner card with smooth floating motion */}
              <motion.div
                className="w-full h-full bg-white/80 border border-slate-200/80 rounded-[3rem] shadow-2xl p-6 flex flex-col justify-between backdrop-blur-md"
                animate={{
                  y: [0, -15, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-4xl">🧠</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-0.5 uppercase tracking-wide">Discovery</span>
                </div>
                <FeaturedGrant />
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-slate-400 text-xs font-bold">Active Listings</span>
                  <span className="text-blue-600 font-black text-xl">{totalCount !== null ? totalCount : '130+'}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Capabilities ────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Built to Navigate Growth</h2>
          <p className="text-slate-500 text-sm">Experience the tools designed to keep you ahead of high-value deadlines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {FEATURES.map((feat) => (
            <div key={feat.title} className={`bg-white/75 border border-slate-200/80 rounded-2xl p-6 shadow-sm flex gap-4 border-l-4 hover:shadow-md hover:border-blue-200 transition-all ${feat.accent}`}>
              <span className="text-3xl shrink-0 select-none">{feat.icon}</span>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-800 text-base">{feat.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dynamic Opportunities Showcase ─────────────────────────────── */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 max-w-6xl mx-auto px-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Hot Opportunities</h2>
            <p className="text-slate-500 text-xs">Freshly curated and scanned listings waiting for applicants.</p>
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 font-bold hover:underline text-xs flex items-center gap-1"
          >
            Go to dashboard to see all
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 h-64 animate-pulse space-y-4">
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
                <div className="w-3/4 h-6 bg-slate-200 rounded" />
                <div className="w-1/2 h-4 bg-slate-200 rounded" />
                <div className="w-full h-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : recentOpps.length === 0 ? (
          <div className="text-center py-12 bg-white/60 border border-slate-200/85 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
            <p className="text-slate-500 text-sm font-semibold">No opportunities currently listed in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {recentOpps.map((opp) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OpportunityCard opportunity={opp} />
              </motion.div>
            ))}
          </div>
        )}

        {totalCount !== null && totalCount > 3 && (
          <div className="text-center pt-4">
            <Link
              href="/dashboard"
              className="inline-flex bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl transition-all shadow-sm text-xs transform active:scale-95"
            >
              Browse all {totalCount} opportunities →
            </Link>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200/60 py-8 text-center text-slate-400 text-xs font-semibold pt-12">
        <p>© 2026 DataScout AI · Neural Opportunity Discovery Platform</p>
      </footer>
    </div>
  );
}
