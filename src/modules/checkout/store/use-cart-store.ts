'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProductID = string;

interface Cart {
  productIds: ProductID[];
}

interface CartState {
  cart: Cart;
  addProduct: (productId: ProductID) => void;
  removeProduct: (productId: ProductID) => void;
  clearCart: () => void;
  hasProduct: (productId: ProductID) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { productIds: [] },

      addProduct: (productId) =>
        set((state) => {
          const ids = state.cart.productIds;
          return ids.includes(productId) ? state : { cart: { productIds: [...ids, productId] } };
        }),

      removeProduct: (productId) =>
        set((state) => ({
          cart: {
            productIds: state.cart.productIds.filter((id) => id !== productId),
          },
        })),

      clearCart: () => set({ cart: { productIds: [] } }),

      hasProduct: (productId) => get().cart.productIds.includes(productId),
    }),
    {
      name: 'ferreteria-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
