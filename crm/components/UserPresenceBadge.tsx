'use client';

import React from 'react';
import { useCrmPresenceStore, PresenceStatus } from '@/store/crmPresenceStore';
import { getPresenceColor, getPresenceStatusLabel } from '@/lib/presenceUtils';
import UserPresenceDot from './UserPresenceDot';

interface UserPresenceBadgeProps {
  userId?: string;
  status?: PresenceStatus | string;
  lastSeenAt?: string | Date | null;
  variant?: 'pill' | 'text-only' | 'inline';
  showLastSeen?: boolean;
  className?: string;
}

export default function UserPresenceBadge({
  userId,
  status: propStatus,
  lastSeenAt: propLastSeenAt,
  variant = 'pill',
  showLastSeen = true,
  className = ''
}: UserPresenceBadgeProps) {
  const storePresence = useCrmPresenceStore((s) => (userId ? s.presences[userId] : null));

  const resolvedStatus: PresenceStatus = (
    storePresence?.status || propStatus || 'offline'
  ) as PresenceStatus;

  const resolvedLastSeen = storePresence?.lastSeenAt !== undefined ? storePresence.lastSeenAt : propLastSeenAt;

  const colors = getPresenceColor(resolvedStatus);
  const textLabel = showLastSeen
    ? getPresenceStatusLabel(resolvedStatus, resolvedLastSeen)
    : resolvedStatus === 'online'
    ? 'Online'
    : resolvedStatus === 'away'
    ? 'Away'
    : 'Offline';

  if (variant === 'text-only') {
    return (
      <span className={`text-[11px] font-medium transition-colors duration-200 ${colors.text} ${className}`}>
        {textLabel}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 ${colors.text} ${className}`}>
        <UserPresenceDot userId={userId} status={resolvedStatus} lastSeenAt={resolvedLastSeen} size="xs" showPing={false} />
        <span>{textLabel}</span>
      </span>
    );
  }

  const tooltipTitle = getPresenceStatusLabel(resolvedStatus, resolvedLastSeen);

  // Default 'pill' badge
  return (
    <span
      title={tooltipTitle}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors duration-200 select-none cursor-default ${colors.badge} ${className}`}
    >
      <UserPresenceDot userId={userId} status={resolvedStatus} lastSeenAt={resolvedLastSeen} size="xs" showPing={resolvedStatus === 'online'} />
      <span>{textLabel}</span>
    </span>
  );
}
