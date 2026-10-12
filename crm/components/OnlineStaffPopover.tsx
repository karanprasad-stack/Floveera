'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCrmPresenceStore } from '@/store/crmPresenceStore';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmWorkers } from '@/lib/api';
import { Users, ShieldCheck, HardHat, CircleDot, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import UserPresenceDot from './UserPresenceDot';

export default function OnlineStaffPopover() {
  const { restaurant } = useCrmAuthStore();
  const presences = useCrmPresenceStore((s) => s.presences);
  const isConnected = useCrmPresenceStore((s) => s.isConnected);
  const [open, setOpen] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch workers when opening or on mount
  useEffect(() => {
    if (restaurant?._id) {
      getCrmWorkers(restaurant._id)
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.workers || [];
          setWorkers(list);
        })
        .catch(() => {});
    }
  }, [restaurant?._id, open]);

  // Calculate online & away count
  const onlineWorkers = workers.filter((w) => {
    const p = presences[w._id];
    return p?.status === 'online' || p?.status === 'away';
  });

  const onlineCount = onlineWorkers.length;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        title="View active team members"
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer shadow-xs"
        aria-expanded={open}
      >
        <span className="relative flex h-2 w-2">
          {onlineCount > 0 && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${onlineCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </span>
        <span className="text-[11px] font-bold">
          {onlineCount} {onlineCount === 1 ? 'Online' : 'Online'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Active Team Presence</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
              {onlineCount} Active
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
            {workers.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No team members loaded</p>
            ) : (
              workers.map((w) => {
                const p = presences[w._id];
                const isAdm = w.restaurantRole === 'RESTAURANT_ADMIN';
                const status = p?.status || 'offline';

                return (
                  <div
                    key={w._id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="relative">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdm
                              ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80'
                          }`}
                        >
                          {w.name ? w.name.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <UserPresenceDot
                          userId={w._id}
                          status={status}
                          lastSeenAt={w.lastSeenAt}
                          size="xs"
                          className="absolute -bottom-0.5 -right-0.5"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                          {w.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {isAdm ? 'Admin' : 'Kitchen / Worker'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-semibold ${
                          status === 'online'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : status === 'away'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {status === 'online' ? 'Active' : status === 'away' ? 'Away' : 'Offline'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/workers"
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>Manage Team Directory</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
