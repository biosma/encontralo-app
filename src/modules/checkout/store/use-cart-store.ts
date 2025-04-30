import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TenantCart {
  productIds: string[];
}

interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (tenantSlug: string, productId: string) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
  getCartByTenant: (tenantSlug: string) => string[];
}
// TODO: Hacer un carrito global, ya que solo genera uno por tenant si no tenemos los detalles de compania en stripe connect
// This could be a global store, but for business logic reasons we'll keep this way(stripe connect doesnt allow fee for products with different tenants)

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tenantCarts: {},
      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: [...(state.tenantCarts[tenantSlug]?.productIds || []), productId],
            },
          },
        })),
      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds:
                state.tenantCarts[tenantSlug]?.productIds?.filter((id) => id !== productId) || [],
            },
          },
        })),
      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: { ...state.tenantCarts, [tenantSlug]: { productIds: [] } },
        })),
      clearAllCarts: () => set({ tenantCarts: {} }),
      getCartByTenant: (tenantSlug) => get().tenantCarts[tenantSlug]?.productIds || [],
    }),
    {
      name: 'encontralo-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
