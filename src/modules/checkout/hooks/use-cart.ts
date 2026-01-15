import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useCartStore } from '../store/use-cart-store';

export const useCart = () => {
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);

  // useShallow hara un mejor trabajo al comparar dos arrays
  const productIds = useCartStore(useShallow((state) => state.cart?.productIds || []));

  const toggleProduct = useCallback(
    (productId: string) => {
      if (productIds.includes(productId)) {
        removeProduct(productId);
      } else {
        addProduct(productId);
      }
    },
    [addProduct, removeProduct, productIds],
  );

  const isProductInCart = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds],
  );

  const clearTenantCart = useCallback(() => clearCart(), [clearCart]);

  const handleAddProduct = useCallback(
    (productId: string) => {
      if (!isProductInCart(productId)) {
        addProduct(productId);
      }
    },
    [addProduct, isProductInCart],
  );
  const handleRemoveProduct = useCallback(
    (productId: string) => {
      if (isProductInCart(productId)) {
        removeProduct(productId);
      }
    },
    [isProductInCart, removeProduct],
  );

  return {
    productIds,
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCart,
    isProductInCart,
    toggleProduct,
    totalItems: productIds.length,
  };
};
