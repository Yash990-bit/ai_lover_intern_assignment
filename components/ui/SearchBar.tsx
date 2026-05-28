import React from 'react';
import { motion } from 'framer-motion';

/**
 * Simple search bar with premium light glass‑morphic styling.
 * Calls `onChange` with the new string value.
 */
const SearchBar: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => (
  <motion.div
    className="rounded-xl p-3 mb-4 flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 shadow-inner"
    whileFocus={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <svg className="w-5 h-5 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder="Search opportunities..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent placeholder-slate-400 text-slate-800 text-sm focus:outline-none"
    />
  </motion.div>
);

export default SearchBar;
