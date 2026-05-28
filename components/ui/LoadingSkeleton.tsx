import React from 'react';

/**
 * Loading skeleton component with premium light glass‑morphic style.
 */
const LoadingSkeleton: React.FC = () => (
  <div className="rounded-2xl p-6 bg-white/70 border border-slate-200 shadow-sm animate-pulse h-36 w-full space-y-4">
    <div className="w-24 h-5 bg-slate-200 rounded-full" />
    <div className="w-3/4 h-6 bg-slate-200 rounded" />
    <div className="w-1/2 h-4 bg-slate-200 rounded" />
  </div>
);

export default LoadingSkeleton;
