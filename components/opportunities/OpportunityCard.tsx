'use client';

import type { Opportunity } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  scholarship: 'bg-blue-50 text-blue-700 border-blue-100',
  fellowship: 'bg-purple-50 text-purple-700 border-purple-100',
  accelerator: 'bg-orange-50 text-orange-700 border-orange-100',
  grant: 'bg-green-50 text-green-700 border-green-100',
  competition: 'bg-red-50 text-red-700 border-red-100',
  conference: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  exchange_program: 'bg-yellow-50 text-yellow-800 border-yellow-100',
  government_scheme: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  giveaway: 'bg-pink-50 text-pink-700 border-pink-100',
  other: 'bg-slate-100 text-slate-700 border-slate-200/80',
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
    <article className="flat-card p-6 rounded-2xl flex flex-col h-full bg-white/70 border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200">
      {/* Header / Category & Save Button */}
      <div className="flex justify-between items-start mb-5 gap-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-[10px] border uppercase tracking-wider ${categoryColor}`}>
            {categoryLabel}
          </span>
          {opportunity.status === 'needs_review' && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
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
          className="text-slate-400 hover:text-orange-500 transition-colors p-1"
          title="Save Opportunity"
        >
          <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>

      <h3 className="font-extrabold text-lg text-slate-800 mb-3 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
        {opportunity.title}
      </h3>

      {/* Org + Country */}
      <div className="flex flex-col gap-1.5 mb-4 text-xs text-slate-500 font-semibold">
        {opportunity.organization && (
          <div className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{opportunity.organization}</span>
          </div>
        )}
        {opportunity.country && (
          <div className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <span className="truncate">{opportunity.country}</span>
          </div>
        )}
      </div>

      {/* Tags / Eligibility */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {opportunity.tags && opportunity.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="bg-slate-50 text-slate-500 border border-slate-200/60 px-2 py-0.5 rounded-lg text-[10px] font-bold">
            #{tag}
          </span>
        ))}
        {opportunity.student_eligible && (
          <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">🎓 Student</span>
        )}
        {opportunity.women_founder_friendly && (
          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">♀ Women</span>
        )}
        {opportunity.indian_applicant_eligible && (
          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">🇮🇳 India</span>
        )}
        {opportunity.remote_type && (
          <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize">🌐 {opportunity.remote_type}</span>
        )}
      </div>

      {/* Footer / Meta & Actions */}
      <div className="mt-auto space-y-5 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Funding Amount</p>
            {opportunity.funding_amount ? (
              <p className="text-emerald-600 font-extrabold text-base">{opportunity.funding_amount}</p>
            ) : (
              <p className="text-slate-400 text-xs font-semibold">Not specified</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Deadline</p>
            <div className="flex items-center justify-end gap-1.5 text-slate-500">
              {isUrgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
              <p className={`font-extrabold text-xs ${isUrgent ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                {deadlineLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <a
            href={`/opportunities/${opportunity.id}`}
            className="flex-1 text-center bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold transition-all border border-slate-200 shadow-sm text-xs"
          >
            Details
          </a>
          
          {(() => {
            const hasDirectLink = !!opportunity.application_link;
            const fallbackUrl = (opportunity as any).source_url;
            const url = opportunity.application_link || fallbackUrl;

            if (!url) {
              return (
                <span className="flex-[2] text-center bg-slate-100 text-slate-400 py-2.5 rounded-xl font-bold border border-slate-200/80 text-xs cursor-not-allowed">
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
                  className="flex-[2] flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-xl font-bold hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all shadow-sm text-xs"
                >
                  Apply Now
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="flex-[2] flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 py-2.5 rounded-xl font-bold transition-all shadow-sm text-xs"
              >
                Visit Site
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
