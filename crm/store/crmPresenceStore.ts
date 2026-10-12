import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { getCrmPresence } from '@/lib/api';

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresenceInfo {
  status: PresenceStatus;
  lastSeenAt?: string | null;
  lastPresenceUpdateAt?: string | null;
}

interface CrmPresenceState {
  presences: Record<string, UserPresenceInfo>;
  isConnected: boolean;
  activeRestaurantId: string | null;
  currentUserId: string | null;
  myStatus: PresenceStatus;
  initializePresence: (restaurantId: string, userId: string) => Promise<void>;
  updateUserPresence: (userId: string, info: Partial<UserPresenceInfo>) => void;
  setAllPresences: (presences: Record<string, UserPresenceInfo>) => void;
  setMyStatus: (status: 'online' | 'away') => void;
  disconnect: () => void;
}

let socketInstance: Socket | null = null;
let activityListenersAttached = false;
let idleTimer: NodeJS.Timeout | null = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes inactivity triggers 'away'

export const useCrmPresenceStore = create<CrmPresenceState>((set, get) => ({
  presences: {},
  isConnected: false,
  activeRestaurantId: null,
  currentUserId: null,
  myStatus: 'offline',

  updateUserPresence: (userId, info) => {
    set((state) => ({
      presences: {
        ...state.presences,
        [userId]: {
          status: (info.status || state.presences[userId]?.status || 'offline') as PresenceStatus,
          lastSeenAt: info.lastSeenAt !== undefined ? info.lastSeenAt : (state.presences[userId]?.lastSeenAt || null),
          lastPresenceUpdateAt: info.lastPresenceUpdateAt || state.presences[userId]?.lastPresenceUpdateAt
        }
      }
    }));
  },

  setAllPresences: (presences) => {
    set((state) => ({
      presences: {
        ...state.presences,
        ...presences
      }
    }));
  },

  setMyStatus: (status) => {
    set({ myStatus: status });
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('presence:status', { status });
    }
    const currentUserId = get().currentUserId;
    if (currentUserId) {
      get().updateUserPresence(currentUserId, { status });
    }
  },

  initializePresence: async (restaurantId: string, userId: string) => {
    if (!restaurantId || !userId) return;

    // Avoid duplicate initialization for identical restaurant & user
    if (get().activeRestaurantId === restaurantId && get().currentUserId === userId && socketInstance?.connected) {
      return;
    }

    set({ activeRestaurantId: restaurantId, currentUserId: userId, myStatus: 'online' });

    // 1. Initial REST snapshot synchronization
    // Fetches immediately so UI displays accurate presence without waiting for socket handshake
    try {
      const res = await getCrmPresence(restaurantId);
      if (res && res.presences) {
        get().setAllPresences(res.presences);
      }
    } catch (err) {
      console.warn('[Presence] Initial REST presence fetch note:', err);
    }

    // Always immediately mark current user online locally
    get().updateUserPresence(userId, { status: 'online', lastSeenAt: null });

    // 2. Establish Real-Time Socket Connection
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

    socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketInstance.on('connect', () => {
      set({ isConnected: true, myStatus: 'online' });
      get().updateUserPresence(userId, { status: 'online', lastSeenAt: null });
      socketInstance?.emit('presence:request_sync');
    });

    // Synchronize full list from server
    socketInstance.on('presence:sync', (snapshot: Record<string, UserPresenceInfo>) => {
      if (snapshot && typeof snapshot === 'object') {
        get().setAllPresences(snapshot);
        // Ensure self is online
        get().updateUserPresence(userId, { status: 'online', lastSeenAt: null });
      }
    });

    // Handle single presence update event broadcasted from server
    socketInstance.on('presence:update', (payload: { userId: string; status: PresenceStatus; lastSeenAt?: string | null }) => {
      if (payload && payload.userId) {
        get().updateUserPresence(payload.userId, {
          status: payload.status,
          lastSeenAt: payload.lastSeenAt
        });
      }
    });

    socketInstance.on('disconnect', () => {
      set({ isConnected: false });
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Presence Socket Error]:', err.message);
      set({ isConnected: false });
    });

    // 3. User Activity / Idle Detector for "Away" status
    if (!activityListenersAttached && typeof window !== 'undefined') {
      activityListenersAttached = true;

      const resetIdleTimer = () => {
        if (get().myStatus === 'away') {
          get().setMyStatus('online');
        }

        if (idleTimer) clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
          if (get().isConnected && get().myStatus === 'online') {
            get().setMyStatus('away');
          }
        }, IDLE_TIMEOUT_MS);
      };

      const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
      activityEvents.forEach((evt) => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          resetIdleTimer();
        }
      });

      resetIdleTimer();
    }
  },

  disconnect: () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    set({
      isConnected: false,
      activeRestaurantId: null,
      currentUserId: null,
      myStatus: 'offline'
    });
  }
}));

export function getCrmSocket(): Socket | null {
  return socketInstance;
}
