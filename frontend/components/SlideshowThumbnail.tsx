import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideshowThumbnailProps {
  images: string[];
  title: string;
}

export default function SlideshowThumbnail({ images, title }: SlideshowThumbnailProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Add a slight random delay so multiple thumbnails on the same page don't switch at the exact same millisecond
    const delay = Math.random() * 1000;
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(timer);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [images.length]);

  return (
    <div className="h-52 sm:h-56 overflow-hidden relative bg-gray-900 flex items-center justify-center select-none">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide}
          src={images[currentSlide]}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 z-0"
          alt={title}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 z-10" />
      <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between">
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
          {title}
        </h3>
        <span className="text-[11px] font-semibold text-white/80 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
          Explore
        </span>
      </div>
    </div>
  );
}
