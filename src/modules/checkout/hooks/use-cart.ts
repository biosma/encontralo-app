import { useCartStore } from '../store/use-cart-store';

export const useCart = (tenantSlug: string) => {
  const { addProduct, removeProduct, clearCart, clearAllCarts, getCartByTenant } = useCartStore();
  const productsId = getCartByTenant(tenantSlug);
  const toggleProduct = (productId: string) => {
    if (productsId.includes(productId)) {
      removeProduct(tenantSlug, productId);
    } else {
      addProduct(tenantSlug, productId);
    }
  };
  const isProductInCart = (productId: string) => productsId.includes(productId);
  const clearTenantCart = () => clearCart(tenantSlug);
  return {
    productsId,
    addProduct: (productId: string) => addProduct(tenantSlug, productId),
    removeProduct: (productId: string) => removeProduct(tenantSlug, productId),
    clearCart: clearTenantCart,
    clearAllCarts: clearAllCarts,
    isProductInCart,
    toggleProduct,
    totalItems: productsId.length,
  };
};
