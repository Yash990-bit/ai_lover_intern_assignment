import React from 'react';

/**
 * Simple empty state UI with premium light glass‑morphic styling.
 * Shows a subtle message when no data is available.
 */
const EmptyState: React.FC<{ message?: string }> = ({ message = 'No items to display.' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl p-6 bg-white/70 border border-slate-200/80 shadow-sm max-w-lg mx-auto">
    <svg
      className="w-14 h-14 mb-4 text-slate-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6" />
      <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
    </svg>
    <p className="text-sm font-semibold text-slate-600">{message}</p>
  </div>
);

export default EmptyState
