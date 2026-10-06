import { create } from 'zustand';
import type { CartState } from './types';
export const cartStore = create<CartState>((set) => ({
  cart: [],
  notice: '',
  setCart: (cart) => set({ cart }),
  setNotice: (notice) => set({ notice }),
  clear: () => set({ cart: [] }),
}));
