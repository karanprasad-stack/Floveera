'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCrmPresenceStore } from '@/store/crmPresenceStore';
import { getPresenceColor, getPresenceStatusLabel } from '@/lib/presenceUtils';
import { UserCheck, ChevronDown, Check, ShieldCheck, HardHat, ChefHat } from 'lucide-react';
import UserPresenceDot from './UserPresenceDot';

export interface AssigneeOption {
  _id: string;
  name: string;
  email?: string;
  restaurantRole?: string;
  department?: string;
}

interface StaffAssignmentDropdownProps {
  workers: AssigneeOption[];
  assignedId?: string | null;
  onAssign?: (worker: AssigneeOption) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function StaffAssignmentDropdown({
  workers = [],
  assignedId,
  onAssign,
  label = 'Assign Staff Task',
  disabled = false,
  className = ''
}: StaffAssignmentDropdownProps) {
  const [open, setOpen] = useState(false);
  const presences = useCrmPresenceStore((s) => s.presences);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Guarantee strict deduplication of employees by ID and normalize name
  const deduplicatedWorkers = Array.from(
    new Map(
      workers
        .filter((w) => Boolean(w && (w._id || w.name)))
        .map((w) => [w._id || w.name, w])
    ).values()
  );

  const currentAssignee = deduplicatedWorkers.find((w) => w._id === assignedId);
  const currentPresence = currentAssignee ? presences[currentAssignee._id] : null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-900 dark:text-white text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-50"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="relative">
            <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold text-[11px] shrink-0">
              {currentAssignee?.name ? currentAssignee.name.charAt(0).toUpperCase() : <ChefHat className="w-3.5 h-3.5" />}
            </div>
            {currentAssignee && (
              <UserPresenceDot
                userId={currentAssignee._id}
                status={currentPresence?.status || 'offline'}
                lastSeenAt={currentPresence?.lastSeenAt}
                size="xs"
                className="absolute -bottom-0.5 -right-0.5"
              />
            )}
          </div>

          <div className="text-left truncate">
            {currentAssignee ? (
              <span className="font-bold text-slate-900 dark:text-white">
                {currentAssignee.name}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Select task assignee...</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          {currentAssignee && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                getPresenceColor(currentPresence?.status || 'offline').badge
              }`}
            >
              {getPresenceStatusLabel(currentPresence?.status || 'offline', currentPresence?.lastSeenAt)}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 max-h-60 overflow-y-auto scrollbar-thin animate-in fade-in duration-100">
          {deduplicatedWorkers.length === 0 ? (
            <p className="p-3 text-center text-xs text-slate-400">No staff accounts available</p>
          ) : (
            deduplicatedWorkers.map((worker) => {
              const p = presences[worker._id];
              const isSelected = worker._id === assignedId;
              const status = p?.status || 'offline';
              const isAdm = worker.restaurantRole === 'RESTAURANT_ADMIN';

              return (
                <button
                  type="button"
                  key={worker._id}
                  onClick={() => {
                    onAssign?.(worker);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <UserPresenceDot
                        userId={worker._id}
                        status={status}
                        lastSeenAt={p?.lastSeenAt}
                        size="xs"
                        className="absolute -bottom-0.5 -right-0.5"
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="truncate block font-semibold">{worker.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {worker.department || (isAdm ? 'Admin' : 'Kitchen Staff')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        getPresenceColor(status).badge
                      }`}
                    >
                      {status === 'online' ? 'Online' : status === 'away' ? 'Away' : 'Offline'}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
