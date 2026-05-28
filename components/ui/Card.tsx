import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
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
  onClick,
  className = '',
  ...rest
}) => {
  const baseClasses = 'flat-card rounded-xl p-4';
  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Card;
