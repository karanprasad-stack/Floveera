import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

export default function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse"
          aria-hidden="true"
        >
          {/* Image Placeholder */}
          <div className="h-36 sm:h-40 w-full animate-shimmer" />

          {/* Content Placeholder */}
          <div className="p-4 flex flex-col flex-grow space-y-3">
            <div className="h-4 w-3/4 rounded-md animate-shimmer" />
            <div className="h-3 w-1/2 rounded-md animate-shimmer" />
            
            <div className="mt-auto pt-3 flex justify-between items-center">
              <div className="h-5 w-16 rounded-md animate-shimmer" />
              <div className="h-8 w-20 rounded-xl animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
