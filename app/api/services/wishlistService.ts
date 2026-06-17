// app/api/services/wishlistService.ts
// Mirrors website src/service/favoriteService.jsx. Auth token auto-attached.
import { callApi } from '../apiClient';
import { WISHLIST } from '../endpoints';
import { AddToWishlistPayload } from '../../types/catalog';

/** GET /wishlist -> { data: { products: [...] } } */
export const getWishlist = () =>
  callApi<null, any>({
    method: 'get',
    url: WISHLIST.LIST,
  });

/** POST /wishlist  body { tagKey, quantity } */
export const addWishlist = (payload: AddToWishlistPayload) =>
  callApi<AddToWishlistPayload, any>({
    method: 'post',
    url: WISHLIST.ADD,
    data: payload,
  });

/** DELETE /wishlist/:tagKey */
export const removeWishlist = (tagKey: string) =>
  callApi<null, any>({
    method: 'delete',
    url: WISHLIST.DELETE.replace(':tagKey', encodeURIComponent(tagKey)),
  });
