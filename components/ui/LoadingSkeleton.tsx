import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading skeleton component with glass‑morphic style.
 * Uses Tailwind classes for animation and background.
 */
const LoadingSkeleton: React.FC = () => (
  <div className="glass-card rounded-xl p-4 bg-white/5 border border-border-glass animate-pulse h-32 w-full" />
);

export default LoadingSkeleton;
