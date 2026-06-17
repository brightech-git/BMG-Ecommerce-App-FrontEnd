// app/api/hooks/useCart.ts
// Server-backed cart (mirrors website src/hook/cart/useCartQuery.js).
// Auth-gated: queries only run when a token exists. Default shipping pincode
// falls back to "360004" exactly like the website.
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCart, addToCart, deleteCartItem, clearCart } from '../services/cartService';
import { useAuthToken } from './useAuthToken';
import { CartProduct, AddToCartPayload } from '../../types/catalog';
import { toastSuccess, toastError, toastInfo, errMsg } from '../../utils/toast';

export const DEFAULT_PINCODE = '360004';

export const useCart = (pincode: string = DEFAULT_PINCODE) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();
  const isAuthenticated = !!token;

  const cartQuery = useQuery({
    queryKey: ['cart', pincode],
    queryFn: () => fetchCart(pincode),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const cartProducts: CartProduct[] = cartQuery.data?.data?.products ?? [];
  const cartCount = cartProducts.length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => { invalidate(); toastSuccess('Added to cart'); },
    onError: (e) => toastError('Could not add to cart', errMsg(e)),
  });
  const removeMutation = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => { invalidate(); toastInfo('Removed from cart'); },
    onError: (e) => toastError('Could not remove item', errMsg(e)),
  });
  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => { invalidate(); toastInfo('Cart cleared'); },
    onError: (e) => toastError('Could not clear cart', errMsg(e)),
  });

  const isInCart = useCallback(
    (tagKey?: string) =>
      !!tagKey && cartProducts.some((c) => String(c.TAGKEY) === String(tagKey)),
    [cartProducts],
  );

  /**
   * Add a product. Shows feedback for every outcome so a tap always does
   * something visible. Returns a status the caller can use for navigation.
   */
  const addItem = useCallback(
    (tagKey?: string, quantity = 1): 'unauth' | 'invalid' | 'duplicate' | 'ok' => {
      if (!isAuthenticated) { toastInfo('Please sign in to add items to your cart'); return 'unauth'; }
      if (!tagKey) { toastError('Invalid product'); return 'invalid'; }
      if (isInCart(tagKey)) { toastInfo('Already in your cart'); return 'duplicate'; }
      const payload: AddToCartPayload = { tagKey, quantity, shippingPincode: pincode };
      addMutation.mutate(payload);
      return 'ok';
    },
    [isAuthenticated, isInCart, pincode, addMutation],
  );

  return {
    cart: cartQuery,
    cartProducts,
    cartCount,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
    isAuthenticated,
    isInCart,
    addItem,
    addRaw: addMutation.mutate,
    isAdding: addMutation.isPending,
    removeItem: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    clearCart: clearMutation.mutate,
    isClearing: clearMutation.isPending,
  };
};
