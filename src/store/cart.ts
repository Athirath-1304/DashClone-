import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  restaurant_id: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>((set: (fn: (state: CartState) => Partial<CartState>) => void, get: () => CartState) => ({
  items: [],
  total: 0,
  addItem: (item: Omit<CartItem, 'quantity'>) => {
    set((state: CartState) => {
      const existing = state.items.find((i: CartItem) => i.id === item.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i: CartItem) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      const total = newItems.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
      return { items: newItems, total };
    });
  },
  removeItem: (id: string) => {
    set((state: CartState) => {
      const newItems = state.items.filter((i: CartItem) => i.id !== id);
      const total = newItems.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
      return { items: newItems, total };
    });
  },
  updateQuantity: (id: string, quantity: number) => {
    set((state: CartState) => {
      const newItems = state.items.map((i: CartItem) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      );
      const total = newItems.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
      return { items: newItems, total };
    });
  },
  clearCart: () => set(() => ({ items: [], total: 0 })),
})); 