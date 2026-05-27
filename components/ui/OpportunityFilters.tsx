import React from 'react';
import { motion } from 'framer-motion';

/**
 * Simple filter bar for opportunity list.
 * Props include current filter values and callbacks to update them.
 * Uses glass‑morphic styling and subtle motion on hover.
 */
const OpportunityFilters: React.FC<{
  category: string;
  setCategory: (cat: string) => void;
}> = ({ category, setCategory }) => {
  const categories = [
    'All',
    'scholarship',
    'fellowship',
    'accelerator',
    'grant',
    'competition',
    'conference',
    'exchange_program',
    'government_scheme',
    'giveaway',
    'other',
  ];

  return (
    <motion.div
      className="flex items-center gap-4 mb-4 glass-card rounded-xl p-3 bg-white/5 border border-border-glass"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <label className="text-sm text-gray-300" htmlFor="categorySelect">
        Category:
      </label>
      <select
        id="categorySelect"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-transparent text-white border-b border-gray-500 focus:outline-none"
      >
        {categories.map((c) => (
          <option key={c} value={c === 'All' ? '' : c} className="bg-slate-900 text-white">
            {c.replace('_', ' ')}
          </option>
        ))}
      </select>
    </motion.div>
  );
};

export default OpportunityFilters;
