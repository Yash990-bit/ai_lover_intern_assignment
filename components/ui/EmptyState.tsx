import React from 'react';

/**
 * Simple empty state UI with premium glass‑morphic styling.
 * Shows a subtle message when no data is available.
 */
const EmptyState: React.FC<{ message?: string }> = ({ message = 'No items to display.' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl p-6 bg-white/5 border border-border-glass">
    <svg
      className="w-16 h-16 mb-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6" />
      <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
    </svg>
    <p className="text-lg font-medium text-gray-200">{message}</p>
  </div>
);

export default EmptyState;
