import React from 'react';
import { motion } from 'framer-motion';

/**
 * Simple search bar with premium glass‑morphic styling.
 * Calls `onChange` with the new string value.
 */
const SearchBar: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => (
  <motion.div
    className="glass-card rounded-xl p-3 mb-4 flex items-center bg-white/5 border border-border-glass"
    whileFocus={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <input
      type="text"
      placeholder="Search opportunities..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent placeholder-gray-400 text-white focus:outline-none"
    />
  </motion.div>
);

export default SearchBar;
