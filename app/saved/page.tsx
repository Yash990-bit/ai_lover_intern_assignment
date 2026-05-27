import { useSavedOpportunities } from '@/hooks/useSavedOpps';
import Header from '@/components/layout/Header';
import type { ApplicationStatus, Priority, SavedOpportunity } from '@/types';
import Link from 'next/link';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Saved: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'Planning to Apply': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Applied: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Interview: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Waitlisted: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  High: 'text-red-400',
  Medium: 'text-amber-400',
  Low: 'text-emerald-400',
};

export default function SavedPage() {
  const { savedOpps, loading, error, updateSaved, removeSaved } = useSavedOpportunities();

  const handleUpdate = (id: string, field: string, value: string) => {
    // field is either 'application_status' or 'priority'
    updateSaved(id, field, value);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
            <p className="text-slate-400">Track and manage your saved opportunities.</p>
          </div>
          <div className="text-slate-400 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
            Total Saved: <span className="text-white font-bold">{savedOpps.length}</span>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-red-500/20 bg-red-500/5 rounded-xl text-red-400">
            {error}
          </div>
        ) : savedOpps.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-white/5 rounded-2xl">
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-xl font-semibold mb-2">No saved opportunities yet</h2>
            <p className="text-slate-400 mb-6">Browse the dashboard and click &quot;Save&quot; on opportunities you like.</p>
            <Link href="/" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedOpps.map((saved) => {
              const opp = saved.opportunity;
              if (!opp) return null;
              const isExpired = opp.deadline && new Date(opp.deadline).getTime() < new Date().getTime();
              return (
                <div key={saved.id} className="group flex flex-col md:flex-row gap-6 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  {/* Left: Opp Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PRIORITY_COLORS[saved.priority] || 'text-slate-400'} bg-slate-900 border border-slate-700`}> 
                        {saved.priority} Priority
                      </span>
                      {isExpired && <span className="text-xs text-red-400 font-medium">Expired</span>}
                    </div>
                    <Link href={`/opportunities/${opp.id}`} className="text-lg font-bold hover:text-indigo-400 transition-colors line-clamp-1 block mb-1">
                      {opp.title}
                    </Link>
                    <p className="text-sm text-slate-400 truncate mb-3">
                      {opp.organization || 'Unknown Org'} • {opp.category?.replace(/_/g, ' ')}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'N/A'}</span>
                      {opp.funding_amount && <span>Funding: <span className="text-emerald-400">{opp.funding_amount}</span></span>}
                    </div>
                  </div>
                  {/* Right: Controls */}
                  <div className="shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-xs text-slate-500 px-1">Status</label>
                      <select
                        value={saved.application_status}
                        onChange={(e) => handleUpdate(saved.id, 'application_status', e.target.value)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium focus:outline-none appearance-none cursor-pointer ${STATUS_COLORS[saved.application_status] || STATUS_COLORS['Saved']}`}
                      >
                        {Object.keys(STATUS_COLORS).map((status) => (
                          <option key={status} value={status} className="bg-slate-900 text-slate-300">
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-xs text-slate-500 px-1">Priority</label>
                      <select
                        value={saved.priority}
                        onChange={(e) => handleUpdate(saved.id, 'priority', e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="flex items-center self-end sm:self-center pt-5 sm:pt-0 gap-2">
                      <Link href={`/opportunities/${opp.id}`} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors" title="View Details">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                      <button onClick={() => removeSaved(saved.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Remove">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
