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
    <div className="h-48 overflow-hidden relative bg-gray-100 flex items-center justify-center">
      <AnimatePresence>
        <motion.img
          key={currentSlide}
          src={images[currentSlide]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0"
          alt={title}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      <h3 className="absolute bottom-4 left-6 text-3xl font-bold text-white z-20 tracking-tight">{title}</h3>
    </div>
  );
}
