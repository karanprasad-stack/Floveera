import { PresenceStatus } from '@/store/crmPresenceStore';

/**
 * Formats a lastSeenAt timestamp into human-readable relative time
 * e.g. "Just now", "5 minutes ago", "2 hours ago", "Yesterday at 4:15 PM"
 */
export function formatLastSeen(lastSeenAt: string | Date | null | undefined): string {
  if (!lastSeenAt) return 'Offline';

  const date = new Date(lastSeenAt);
  if (isNaN(date.getTime())) return 'Offline';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Returns formatted text label for presence display
 */
export function getPresenceStatusLabel(
  status: PresenceStatus | string | undefined,
  lastSeenAt?: string | Date | null
): string {
  if (status === 'online') return 'Online';
  if (status === 'away') return 'Away';
  if (lastSeenAt) {
    const formatted = formatLastSeen(lastSeenAt);
    return formatted === 'Just now' ? 'Last seen just now' : `Last seen ${formatted}`;
  }
  return 'Offline';
}

/**
 * Get dot CSS color classes based on presence status
 */
export function getPresenceColor(status: PresenceStatus | string | undefined): {
  dot: string;
  ring: string;
  bg: string;
  text: string;
  badge: string;
} {
  switch (status) {
    case 'online':
      return {
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-400/40',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-400',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
      };
    case 'away':
      return {
        dot: 'bg-amber-400',
        ring: 'ring-amber-300/40',
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-400',
        badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
      };
    case 'offline':
    default:
      return {
        dot: 'bg-slate-400 dark:bg-slate-500',
        ring: 'ring-slate-300/40',
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-500 dark:text-slate-400',
        badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
      };
  }
}
