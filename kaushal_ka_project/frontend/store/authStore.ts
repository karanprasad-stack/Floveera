import { create } from 'zustand';
import { getSettingsCurrentUser } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const userData = await getSettingsCurrentUser();
      set({ user: userData, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
