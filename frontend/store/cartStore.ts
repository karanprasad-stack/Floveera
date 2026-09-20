import { create } from 'zustand';

export interface CartItem {
  id: string; // The name of the item acts as ID for now
  name: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
  unit?: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity' | 'id'> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  totalItems: 0,
  totalPrice: 0,
  
  addItem: (item) => {
    const id = item.id || item.name;
    const items = get().items;
    const existingItem = items.find((i) => i.id === id);

    let newItems;
    if (existingItem) {
      newItems = items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...items, { ...item, id, quantity: 1 }];
    }

    set({
      items: newItems,
      totalItems: get().totalItems + 1,
      totalPrice: get().totalPrice + (typeof item.price === 'number' ? item.price : parseInt(item.price as string) || 0),
    });
  },
  
  removeItem: (id) => {
    const items = get().items;
    const existingItem = items.find((i) => i.id === id);
    if (!existingItem) return;

    set({
      items: items.filter((i) => i.id !== id),
      totalItems: get().totalItems - existingItem.quantity,
      totalPrice: get().totalPrice - (typeof existingItem.price === 'number' ? existingItem.price : parseInt(existingItem.price as string) || 0) * existingItem.quantity,
    });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    const items = get().items;
    const existingItem = items.find((i) => i.id === id);
    if (!existingItem) return;

    const quantityDiff = quantity - existingItem.quantity;
    const newItems = items.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );

    set({
      items: newItems,
      totalItems: get().totalItems + quantityDiff,
      totalPrice: get().totalPrice + (typeof existingItem.price === 'number' ? existingItem.price : parseInt(existingItem.price as string) || 0) * quantityDiff,
    });
  },

  clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
  
  toggleCart: (isOpen) => set((state) => ({ 
    isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen 
  })),
}));
