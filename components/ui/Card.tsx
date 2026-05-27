import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Motion props for framer-motion animations */
  motionProps?: MotionProps;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Reusable glass‑morphic card component.
 * Applies Tailwind glass effect and optional framer‑motion animations.
 */
const Card: React.FC<CardProps> = ({
  children,
  motionProps,
  onClick,
  className = '',
  ...rest
}) => {
  const baseClasses =
    'glass-card card-hover-glow rounded-xl p-4 bg-white/5 border border-border-glass backdrop-blur-md';
  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Card;
