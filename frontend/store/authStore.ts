import { create } from 'zustand';
import { getSettingsCurrentUser, logoutUser } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  restaurantId?: string;
  restaurantRole?: 'RESTAURANT_OWNER' | 'RESTAURANT_MANAGER' | 'ORDER_MANAGER' | 'INVENTORY_MANAGER' | 'DELIVERY_MANAGER' | 'SUPPORT' | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  isLoginPromptOpen: boolean;
  loginPromptMessage: string;
  checkAuth: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  openLoginPrompt: (message?: string) => void;
  closeLoginPrompt: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  hasCheckedAuth: false,
  isLoginPromptOpen: false,
  loginPromptMessage: 'You need to login first to add items to your cart.',

  openLoginPrompt: (message = 'You need to login first to add items to your cart.') => {
    set({ isLoginPromptOpen: true, loginPromptMessage: message });
  },

  closeLoginPrompt: () => {
    set({ isLoginPromptOpen: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await getSettingsCurrentUser();
      if (user && user._id) {
        set({ user, isLoading: false, hasCheckedAuth: true });
        // Sync guest cart with user cloud account
        import('./cartStore').then(({ useCartStore }) => {
          useCartStore.getState().syncWithBackend(true);
        }).catch(() => {});
        return user;
      }
      set({ user: null, isLoading: false, hasCheckedAuth: true });
      return null;
    } catch (error) {
      set({ user: null, isLoading: false, hasCheckedAuth: true });
      return null;
    }
  },

  setUser: (user) => {
    set({ user, isLoading: false, hasCheckedAuth: true });
    if (user && user._id) {
      import('./cartStore').then(({ useCartStore }) => {
        useCartStore.getState().syncWithBackend(true);
      }).catch(() => {});
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      set({ user: null, isLoading: false });
    }
  },
}));
