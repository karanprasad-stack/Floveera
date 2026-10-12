'use client';

import React from 'react';
import { useCrmPresenceStore, PresenceStatus } from '@/store/crmPresenceStore';
import { getPresenceColor, getPresenceStatusLabel } from '@/lib/presenceUtils';

interface UserPresenceDotProps {
  userId?: string;
  status?: PresenceStatus | string;
  lastSeenAt?: string | Date | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPing?: boolean;
  className?: string;
  title?: string;
}

export default function UserPresenceDot({
  userId,
  status: propStatus,
  lastSeenAt: propLastSeenAt,
  size = 'sm',
  showPing = true,
  className = '',
  title: customTitle
}: UserPresenceDotProps) {
  // Read real-time presence from store if userId is provided
  const storePresence = useCrmPresenceStore((s) => (userId ? s.presences[userId] : null));

  const resolvedStatus: PresenceStatus = (
    storePresence?.status || propStatus || 'offline'
  ) as PresenceStatus;

  const resolvedLastSeen = storePresence?.lastSeenAt !== undefined ? storePresence.lastSeenAt : propLastSeenAt;

  const colors = getPresenceColor(resolvedStatus);
  const label = customTitle || getPresenceStatusLabel(resolvedStatus, resolvedLastSeen);

  const sizeClasses = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2'
  }[size];

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title={label}
      aria-label={label}
    >
      {/* Optional subtle ping animation for active online users */}
      {showPing && resolvedStatus === 'online' && (
        <span
          className={`absolute inline-flex rounded-full bg-emerald-400 opacity-60 animate-ping ${
            size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'
          }`}
        />
      )}

      {/* Main colored presence dot */}
      <span
        className={`relative inline-block rounded-full ring-white dark:ring-slate-900 transition-colors duration-200 ${colors.dot} ${sizeClasses}`}
      />
    </span>
  );
}
