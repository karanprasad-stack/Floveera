'use client';

import { useState, useRef, useEffect } from 'react';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { useCrmUiStore, CrmTheme } from '@/store/crmUiStore';
import { 
  Store, 
  RotateCw, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  HardHat,
  Menu,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CrmHeaderProps {
  onSync?: () => void;
  syncing?: boolean;
}

export default function CrmHeader({ onSync, syncing }: CrmHeaderProps) {
  const router = useRouter();
  const { user, restaurant, role, logout } = useCrmAuthStore();
  const { toggleSidebar, theme, setTheme, toggleTheme, resolvedTheme } = useCrmUiStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === 'RESTAURANT_ADMIN';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150">
      {/* Left: Mobile hamburger + Restaurant name & Active indicator */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
              {restaurant?.name || 'Floveera Restaurant'}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              Accepting Orders
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {isAdmin ? 'Admin Console' : 'Worker Operational Station'}
          </p>
        </div>
      </div>

      {/* Right: Theme Toggle, Sync button & User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Dark/Light Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Dark Mode"
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer shadow-xs flex items-center space-x-1.5"
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              <span className="hidden md:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500 animate-in spin-in-180 duration-200" />
              <span className="hidden md:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        {onSync && (
          <button
            onClick={onSync}
            disabled={syncing}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        )}

        {/* User Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Staff'}</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {isAdmin ? 'Restaurant Admin' : 'Restaurant Worker'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* User summary */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Staff Member'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold ${
                    isAdmin 
                      ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60' 
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-3 h-3 mr-1" /> : <HardHat className="w-3 h-3 mr-1" />}
                    {isAdmin ? 'Restaurant Admin' : 'Restaurant Worker'}
                  </span>
                  <span className="text-slate-400 truncate max-w-[110px]">{restaurant?.name}</span>
                </div>
              </div>

              {/* Theme / Appearance Options */}
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  CRM Theme
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center space-x-1 py-1 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      theme === 'system'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-slate-400" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              {/* Menu links */}
              <div className="py-1.5">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Restaurant Settings</span>
                  </Link>
                )}
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
