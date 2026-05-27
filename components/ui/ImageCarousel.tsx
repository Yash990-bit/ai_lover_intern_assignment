import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  /** width utility class (e.g., 'w-full') */
  width?: string;
  /** height utility class (e.g., 'h-64') */
  height?: string;
}

/**
 * Glass‑morphic image carousel with smooth fade transitions.
 * Shows navigation arrows when multiple images are present.
 */
const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  width = 'w-full',
  height = 'h-64',
}) => {
  const [index, setIndex] = useState(0);
  const total = images.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  if (total === 0) return null;

  return (
    <div className={`relative ${width} ${height} overflow-hidden rounded-xl glass-card border border-border-glass`}> 
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`Opportunity image ${index + 1}`}
          className="object-cover w-full h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
