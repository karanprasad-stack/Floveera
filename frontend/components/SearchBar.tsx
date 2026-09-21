'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, Loader2, ArrowRight } from 'lucide-react';
import { searchProducts } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export interface Suggestion {
  _id: string;
  name: string;
  category: string;
  image: string;
  price: number;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse recent searches');
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions
  useEffect(() => {
    async function fetchSearchData() {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await searchProducts(debouncedQuery);
        setSuggestions(results || []);
      } catch (err) {
        console.error('Search error', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
        setSelectedIndex(-1);
      }
    }
    fetchSearchData();
  }, [debouncedQuery]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    saveRecentSearch(suggestion.name);
    setIsFocused(false);
    setQuery('');
    router.push(`/product/${suggestion._id}`);
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    setIsFocused(true);
  };

  const saveRecentSearch = (term: string) => {
    let updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) return;

    // Up/Down navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
    // Note: We leave Enter to the native form onSubmit now, unless they have selected a specific index
    if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    }
  };

  // Helper to highlight matched text
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="font-bold text-brand-orange bg-brand-orange/10 px-0.5 rounded">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="relative w-full z-50 text-gray-800" ref={searchContainerRef}>
      <form 
        role="search"
        aria-label="Sitewide product search"
        onSubmit={handleSearchSubmit} 
        className={`relative flex items-center w-full bg-white rounded-full p-1 pl-4 transition-all duration-200 ${
          isFocused 
            ? 'shadow-lg ring-2 ring-brand-orange/70' 
            : 'shadow-sm hover:shadow-md ring-1 ring-slate-200/80'
        }`}
      >
        <label htmlFor="global-search-input" className="sr-only">
          Search sweets, cakes, food & essentials
        </label>
        <input
          id="global-search-input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isFocused && (query.length > 0 || recentSearches.length > 0)}
          aria-controls="search-suggestions-list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search sweets, cakes, food & essentials..."
          className="w-full py-1.5 pr-2 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-sm placeholder:text-gray-400 no-focus-ring"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 active:scale-95 transition-all focus:outline-none focus-visible:outline-none no-focus-ring"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          className="p-2.5 bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white hover:shadow-md active:scale-95 transition-all duration-150 rounded-full flex items-center justify-center font-medium focus:outline-none focus-visible:outline-none no-focus-ring flex-shrink-0"
          aria-label="Submit search query"
        >
          <Search className="w-4 h-4 font-bold" aria-hidden="true" />
        </button>
      </form>

      <AnimatePresence>
        {isFocused && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-cardHover border border-gray-100 overflow-hidden z-50"
          >
            {/* Loading state skeleton */}
            {isLoading && (
              <div className="p-4 flex items-center justify-center space-x-2 text-brand-blue">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Searching...</span>
              </div>
            )}

            {/* Suggestions list */}
            {!isLoading && query && suggestions.length > 0 && (
              <ul className="max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <li
                    key={item._id}
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0
                      ${selectedIndex === idx ? 'bg-brand-blue/5' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        <HighlightText text={item.name} highlight={query} />
                      </p>
                      <p className="text-xs text-brand-orange mt-0.5">{item.category}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <span className="text-sm font-bold text-gray-700">₹{item.price}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Empty State */}
            {!isLoading && query && suggestions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">No results found for <span className="font-semibold px-1 text-gray-800">&ldquo;{query}&rdquo;</span></p>
                <p className="text-xs mt-1 text-gray-400">Try checking for typos or using general terms.</p>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Recent Searches</h4>
                  <button
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }}
                    className="text-xs text-brand-blue hover:text-brand-orange transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-1">
                  {recentSearches.map((term, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => handleSelectRecent(term)}
                        className="w-full flex items-center px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      >
                        <Clock className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="flex-1 text-left">{term}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
