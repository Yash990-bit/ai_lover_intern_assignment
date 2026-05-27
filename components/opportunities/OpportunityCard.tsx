'use client';

import type { Opportunity } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  scholarship: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  fellowship: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  accelerator: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  grant: 'bg-green-500/20 text-green-300 border-green-500/30',
  competition: 'bg-red-500/20 text-red-300 border-red-500/30',
  conference: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  exchange_program: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  government_scheme: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  giveaway: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  other: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function formatDeadline(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: 'No deadline', urgent: false };
  const deadline = new Date(dateStr);
  const today = new Date();
  const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: 'Expired', urgent: false };
  if (diff === 0) return { label: 'Today!', urgent: true };
  if (diff <= 7) return { label: `${diff}d left`, urgent: true };
  if (diff <= 30) return { label: `${diff}d left`, urgent: false };

  return {
    label: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    urgent: false,
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const categoryColor =
    CATEGORY_COLORS[opportunity.category] ?? CATEGORY_COLORS.other;
  const { label: deadlineLabel, urgent: isUrgent } = formatDeadline(opportunity.deadline);

  const categoryLabel = opportunity.category?.replace(/_/g, ' ') ?? 'Other';

  return (
    <article className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col h-full glow-hover transition-all duration-300">
      {/* Header / Category & Save Button */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full font-medium text-xs border uppercase tracking-wider ${categoryColor}`}>
            {categoryLabel}
          </span>
          {opportunity.status === 'needs_review' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Needs Review
            </span>
          )}
        </div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch('/api/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunityId: opportunity.id })
              });
              if (res.ok || res.status === 409) {
                alert('Saved!');
              }
            } catch(e) {}
          }}
          className="text-text-secondary hover:text-red-400 transition-colors p-1"
          title="Save Opportunity"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>

      <h3 className="font-bold text-xl text-text-primary mb-4 leading-tight line-clamp-2">
        {opportunity.title}
      </h3>

      {/* Org + Country */}
      <div className="flex flex-col gap-2 mb-4 text-sm text-text-secondary font-medium">
        {opportunity.organization && (
          <div className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{opportunity.organization}</span>
          </div>
        )}
        {opportunity.country && (
          <div className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <span className="truncate">{opportunity.country}</span>
          </div>
        )}
      </div>

      {/* Tags / Eligibility */}
      <div className="flex flex-wrap gap-2 mb-6">
        {opportunity.tags && opportunity.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-surface/50 text-text-secondary border border-border-glass px-3 py-1 rounded-md text-xs font-medium">
            #{tag}
          </span>
        ))}
        {opportunity.student_eligible && (
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-md text-xs font-medium">🎓 Student</span>
        )}
        {opportunity.women_founder_friendly && (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-md text-xs font-medium">♀ Women</span>
        )}
        {opportunity.indian_applicant_eligible && (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-md text-xs font-medium">🇮🇳 India</span>
        )}
        {opportunity.remote_type && (
          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-md text-xs font-medium capitalize">🌐 {opportunity.remote_type}</span>
        )}
      </div>

      {/* Footer / Meta & Actions */}
      <div className="mt-auto space-y-6 pt-4 border-t border-border-glass">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-text-secondary text-sm font-medium mb-1">Funding Amount</p>
            {opportunity.funding_amount ? (
              <p className="text-primary font-bold text-lg">{opportunity.funding_amount}</p>
            ) : (
              <p className="text-text-secondary text-sm">Not specified</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-sm font-medium mb-1">Deadline</p>
            <div className="flex items-center justify-end gap-2 text-tertiary">
              {isUrgent && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
              <p className={`font-bold text-sm ${isUrgent ? 'text-red-400' : 'text-slate-300'}`}>
                {deadlineLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={`/opportunities/${opportunity.id}`}
            className="flex-1 text-center bg-surface hover:bg-surface-variant text-text-primary py-3 rounded-xl font-bold transition-all duration-300 border border-border-glass text-sm"
          >
            Details
          </a>
          
          {(() => {
            const hasDirectLink = !!opportunity.application_link;
            const fallbackUrl = (opportunity as any).source_url;
            const url = opportunity.application_link || fallbackUrl;

            if (!url) {
              return (
                <span className="flex-[2] text-center bg-surface/30 text-text-secondary py-3 rounded-xl font-bold border border-border-glass text-sm opacity-50 cursor-not-allowed">
                  No link
                </span>
              );
            }

            if (hasDirectLink) {
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-sm"
                >
                  Apply Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              );
            }

            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-3 rounded-xl font-bold transition-all duration-300 text-sm"
              >
                Visit Site
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            );
          })()}
        </div>
      </div>
    </article>
  );
}
