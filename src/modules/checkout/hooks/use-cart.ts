import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useCartStore } from '../store/use-cart-store';

export const useCart = (tenantSlug: string) => {
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  // useShallow hara un mejor trabajo al comparar dos arrays
  const productIds = useCartStore(
    useShallow((state) => state.tenantCarts[tenantSlug]?.productIds || []),
  );

  const toggleProduct = useCallback(
    (productId: string) => {
      if (productIds.includes(productId)) {
        removeProduct(tenantSlug, productId);
      } else {
        addProduct(tenantSlug, productId);
      }
    },
    [addProduct, removeProduct, productIds, tenantSlug],
  );

  const isProductInCart = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds],
  );

  const clearTenantCart = useCallback(() => clearCart(tenantSlug), [tenantSlug, clearCart]);

  const handleAddProduct = useCallback(
    (productId: string) => {
      if (!isProductInCart(productId)) {
        addProduct(tenantSlug, productId);
      }
    },
    [addProduct, isProductInCart, tenantSlug],
  );
  const handleRemoveProduct = useCallback(
    (productId: string) => {
      if (isProductInCart(productId)) {
        removeProduct(tenantSlug, productId);
      }
    },
    [isProductInCart, removeProduct, tenantSlug],
  );

  return {
    productIds,
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCart,
    clearAllCarts: clearAllCarts,
    isProductInCart,
    toggleProduct,
    totalItems: productIds.length,
  };
};
