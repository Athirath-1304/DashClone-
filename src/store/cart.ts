'use client';
import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (dish: CartItem['dish']) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>((set) => ({
  items: [],
  total: 0,
  addItem: (dish: CartItem['dish']) => {
    set((state: CartState) => {
      const existing = state.items.find((i: CartItem) => i.dish.id === dish.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i: CartItem) =>
          i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { dish, quantity: 1, special_instructions: undefined }];
      }
      const total = newItems.reduce((sum: number, i: CartItem) => sum + i.dish.price * i.quantity, 0);
      return { items: newItems, total };
    });
  },
  removeItem: (id: string) => {
    set((state: CartState) => {
      const newItems = state.items.filter((i: CartItem) => i.dish.id !== id);
      const total = newItems.reduce((sum: number, i: CartItem) => sum + i.dish.price * i.quantity, 0);
      return { items: newItems, total };
    });
  },
  updateQuantity: (id: string, quantity: number) => {
    set((state: CartState) => {
      const newItems = state.items.map((i: CartItem) =>
        i.dish.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      );
      const total = newItems.reduce((sum: number, i: CartItem) => sum + i.dish.price * i.quantity, 0);
      return { items: newItems, total };
    });
  },
  clearCart: () => set(() => ({ items: [], total: 0 })),
}));

export const useCartStore = useCart; 