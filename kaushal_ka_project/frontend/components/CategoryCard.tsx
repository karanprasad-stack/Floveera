'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  image?: string;
  index: number;
}

export default function CategoryCard({ name, icon: Icon, image, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden cursor-pointer border border-white/20"
    >
      <div className="h-40 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="bg-white p-4 rounded-full shadow-md">
            <Icon className="h-12 w-12 text-brand-blue" />
          </div>
        )}
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg text-brand-text">{name}</h3>
      </div>
    </motion.div>
  );
}
