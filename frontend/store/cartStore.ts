import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { syncUserCart, saveUserCart, getUserCart, clearUserCart } from '@/lib/api';
import { useAuthStore } from './authStore';

export interface CartCustomization {
  spiceLevel?: string;
  addOns?: Array<{ name: string; price: number }>;
  notes?: string;
  weight?: string;
  flavor?: string;
  cakeMessage?: string;
  deliveryDate?: string;
  deliverySlot?: string;
  isEggless?: boolean;
  selectedUnit?: string;
  packSize?: string;
}

export interface CartItem {
  id: string; // Unique composite key (baseId + customization + unit)
  productId?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  vertical: 'restaurant' | 'supermart' | 'cakes';
  unit?: string;
  customization?: CartCustomization;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;

  addItem: (item: {
    productId?: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    vertical?: 'restaurant' | 'supermart' | 'cakes';
    unit?: string;
    description?: string;
    customization?: CartCustomization;
    quantity?: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: (syncCloud?: boolean) => void;
  toggleCart: (isOpen?: boolean) => void;
  syncWithBackend: (isUserLoggedIn: boolean) => Promise<void>;
  loadUserCart: () => Promise<void>;
}

// Generate unique identifier for items with variations
export const generateCartItemId = (
  baseId: string,
  unit: string = '',
  customization: CartCustomization = {}
): string => {
  const parts = [
    baseId,
    unit || '',
    customization.spiceLevel || '',
    (customization.addOns || []).map((a) => a.name).sort().join(','),
    customization.weight || '',
    customization.flavor || '',
    customization.cakeMessage || '',
    customization.deliveryDate || '',
    customization.deliverySlot || '',
    customization.isEggless ? 'eggless' : '',
  ];
  return parts.filter(Boolean).join('_').replace(/\s+/g, '-').toLowerCase();
};

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);
  // Free delivery over ₹299, otherwise standard ₹25
  const deliveryFee = totalPrice === 0 ? 0 : totalPrice >= 299 ? 0 : 25;
  const taxes = Math.round(totalPrice * 0.05); // 5% GST
  const grandTotal = totalPrice + deliveryFee + taxes;

  return { totalItems, totalPrice, deliveryFee, taxes, grandTotal };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      totalItems: 0,
      totalPrice: 0,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 0,

      addItem: (item) => {
        const user = useAuthStore.getState().user;
        if (!user) {
          useAuthStore.getState().openLoginPrompt('You need to login first to add items to your cart.');
          return;
        }

        const baseId = item.productId || item.name;
        const customization = item.customization || {};
        const unit = item.unit || '';
        const id = generateCartItemId(baseId, unit, customization);

        // Add add-ons prices to item base price if present
        const addOnsTotal = (customization.addOns || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        const effectivePrice = (Number(item.price) || 0) + addOnsTotal;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === id);
        const addQty = item.quantity || 1;

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = currentItems.map((i, idx) =>
            idx === existingIndex ? { ...i, quantity: i.quantity + addQty } : i
          );
        } else {
          updatedItems = [
            ...currentItems,
            {
              id,
              productId: item.productId,
              name: item.name,
              description: item.description,
              price: effectivePrice,
              originalPrice: item.originalPrice,
              image: item.image,
              quantity: addQty,
              vertical: item.vertical || 'restaurant',
              unit: item.unit,
              customization: item.customization,
            },
          ];
        }

        const totals = calculateTotals(updatedItems);
        set({ items: updatedItems, ...totals });

        // Save to cloud in background if user is authenticated
        saveUserCart(updatedItems).catch(() => {});
      },

      removeItem: (id) => {
        const updatedItems = get().items.filter((i) => i.id !== id);
        const totals = calculateTotals(updatedItems);
        set({ items: updatedItems, ...totals });
        saveUserCart(updatedItems).catch(() => {});
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const updatedItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        );
        const totals = calculateTotals(updatedItems);
        set({ items: updatedItems, ...totals });
        saveUserCart(updatedItems).catch(() => {});
      },

      clearCart: (syncCloud = true) => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          deliveryFee: 0,
          taxes: 0,
          grandTotal: 0,
        });
        if (syncCloud) {
          clearUserCart().catch(() => {});
        }
      },

      toggleCart: (isOpen) =>
        set((state) => ({
          isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen,
        })),

      // Synchronize local guest cart with user cloud account on login
      syncWithBackend: async (isUserLoggedIn) => {
        if (!isUserLoggedIn) return;
        try {
          const localItems = get().items;
          const result = await syncUserCart(localItems);
          if (result && Array.isArray(result.items)) {
            const totals = calculateTotals(result.items);
            set({ items: result.items, ...totals });
          }
        } catch (err) {
          console.error('Cart sync error:', err);
        }
      },

      // Fetch cloud cart on session initialization
      loadUserCart: async () => {
        try {
          const result = await getUserCart();
          if (result && Array.isArray(result.items)) {
            const totals = calculateTotals(result.items);
            set({ items: result.items, ...totals });
          }
        } catch (err) {
          // Keep local cart if guest or offline
        }
      },
    }),
    {
      name: 'floveera-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state && state.items) {
          const totals = calculateTotals(state.items);
          Object.assign(state, totals);
        }
      },
    }
  )
);
