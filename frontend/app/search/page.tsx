'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { searchProducts, getProducts } from '@/lib/api';
import { Loader2, SearchX, TrendingUp } from 'lucide-react';

// Using a wrapper to gracefully use useSearchParams per Next.js App Router rules
function SearchResultsInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [groupedResults, setGroupedResults] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    async function performSearch() {
      if (!q.trim()) {
        setIsLoading(false);
        fetchTrending();
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await searchProducts(q);
        setResults(data);
        
        // Group by category
        const grouped = data.reduce((acc: any, item: any) => {
          const cat = item.category || 'General';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});
        
        setGroupedResults(grouped);
        
        if (data.length === 0) {
          fetchTrending();
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [q]);

  const fetchTrending = async () => {
    try {
      // Just fallback to some mock trending products so it looks like Amazon
      setTrending([
        { name: "Samosa", price: 20, description: "Hot and spicy", image: "/images/samosa.jpg", category: "Trending" },
        { name: "Jalebi", price: 80, description: "Sweet and crisp", image: "/images/jalebi.jpg", category: "Trending" },
        { name: "Pizza", price: 199, description: "Freshly baked", image: "/images/pizza.jpg", category: "Trending" },
        { name: "Classic Blue Jeans", price: 899, description: "Durable denim", image: "https://images.unsplash.com/photo-1542272604-780c109eeeb8?w=500&q=80", category: "Trending" },
      ]);
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[60vh]">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-blue">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-semibold">Searching our catalog...</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">
              Search results for <span className="text-brand-orange">"{q}"</span>
            </h1>
            <p className="text-gray-500 mt-2">Found {results.length} items</p>
          </div>
          
          {Object.entries(groupedResults).map(([category, items], sectionIdx) => (
            <div key={category} className="mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {items.map((item, idx) => (
                  <div key={item._id} className="h-full">
                     <ProductCard 
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      description={item.description || item.category}
                      index={idx}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center pt-10 pb-20">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <SearchX className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No results found for "{q}"</h2>
          <p className="text-gray-500 mb-12">Check the spelling or try searching for something else</p>
          
          {trending.length > 0 && (
            <div className="w-full mt-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
                <TrendingUp className="w-6 h-6 text-brand-orange" />
                <h3 className="text-xl font-bold text-gray-800">Popular on Floveera</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {trending.map((item, idx) => (
                  <div key={idx} className="h-full">
                     <ProductCard 
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      description={item.description}
                      index={idx}
                      badge="Trending"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div>}>
          <SearchResultsInner />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
