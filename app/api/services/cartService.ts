// app/api/services/cartService.ts
// Mirrors website src/service/cartService.jsx. Auth token is auto-attached by axiosInstance.
import { callApi } from '../apiClient';
import { CART } from '../endpoints';
import { CartSummary, AddToCartPayload } from '../../types/catalog';

/** GET /cart/summary?pincode= */
export const fetchCart = (pincode?: string) =>
  callApi<null, CartSummary>({
    method: 'get',
    url: CART.SUMMARY,
    params: pincode ? { pincode } : undefined,
  });

/** POST /cart/product  body { tagKey, quantity, shippingPincode } */
export const addToCart = (payload: AddToCartPayload) =>
  callApi<AddToCartPayload, any>({
    method: 'post',
    url: CART.ADD,
    data: payload,
  });

/** DELETE /cart/item/:tagKey */
export const deleteCartItem = (tagKey: string) =>
  callApi<null, any>({
    method: 'delete',
    url: CART.DELETE.replace(':tagKey', encodeURIComponent(tagKey)),
  });

/** DELETE /cart/clear */
export const clearCart = () =>
  callApi<null, any>({
    method: 'delete',
    url: CART.CLEAR,
  });
