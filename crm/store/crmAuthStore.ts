import { create } from 'zustand';
import { getMyRestaurant, crmLogout } from '@/lib/api';

export type CrmRole = 'RESTAURANT_ADMIN' | 'RESTAURANT_WORKER';

export interface CrmUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  restaurantRole: CrmRole;
}

export interface CrmRestaurant {
  _id: string;
  name: string;
  slug: string;
  phone?: string;
  city?: string;
  status: string;
}

interface CrmAuthState {
  user: CrmUser | null;
  restaurant: CrmRestaurant | null;
  role: CrmRole | null;
  permissions: string[];
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
  checkCrmAuth: () => Promise<{ user: CrmUser; restaurant: CrmRestaurant; role: CrmRole } | null>;
  setUserSession: (user: CrmUser, restaurant: CrmRestaurant, role: CrmRole, permissions?: string[]) => void;
  updateUser: (partial: Partial<CrmUser>) => void;
  logout: () => Promise<void>;
}

export const useCrmAuthStore = create<CrmAuthState>((set) => ({
  user: null,
  restaurant: null,
  role: null,
  permissions: [],
  isLoading: true,
  hasCheckedAuth: false,
  error: null,

  updateUser: (partial) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null
    }));
  },

  checkCrmAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyRestaurant();
      if (data && data.restaurant && data.role) {
        const crmUser: CrmUser = data.user || {
          _id: data.restaurant._id,
          name: 'Staff Member',
          email: '',
          restaurantRole: data.role
        };
        const role: CrmRole = data.role === 'RESTAURANT_ADMIN' ? 'RESTAURANT_ADMIN' : 'RESTAURANT_WORKER';
        set({
          user: crmUser,
          restaurant: data.restaurant,
          role,
          permissions: data.permissions || [],
          isLoading: false,
          hasCheckedAuth: true
        });
        return { user: crmUser, restaurant: data.restaurant, role };
      }
      set({ user: null, restaurant: null, role: null, permissions: [], isLoading: false, hasCheckedAuth: true });
      return null;
    } catch (err: any) {
      set({
        user: null,
        restaurant: null,
        role: null,
        permissions: [],
        isLoading: false,
        hasCheckedAuth: true,
        error: err?.message || 'Unauthorized'
      });
      return null;
    }
  },

  setUserSession: (user, restaurant, role, permissions = []) => {
    set({
      user,
      restaurant,
      role,
      permissions,
      isLoading: false,
      hasCheckedAuth: true,
      error: null
    });
  },

  logout: async () => {
    try {
      await crmLogout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      set({
        user: null,
        restaurant: null,
        role: null,
        permissions: [],
        isLoading: false,
        hasCheckedAuth: true
      });
    }
  }
}));
