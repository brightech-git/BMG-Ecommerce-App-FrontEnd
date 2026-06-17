// app/api/hooks/useWishlist.ts
// Server-backed wishlist (mirrors website src/hook/favorites/useFavoritesQuery.js).
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, addWishlist, removeWishlist } from '../services/wishlistService';
import { useAuthToken } from './useAuthToken';
import { WishlistProduct } from '../../types/catalog';
import { toastSuccess, toastError, toastInfo, errMsg } from '../../utils/toast';

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();
  const isAuthenticated = !!token;

  const listQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });

  const favorites: WishlistProduct[] = listQuery.data?.data?.products ?? [];
  const favoritesCount = favorites.length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['wishlist'] });

  const addMutation = useMutation({
    mutationFn: addWishlist,
    onSuccess: () => { invalidate(); toastSuccess('Added to wishlist'); },
    onError: (e) => toastError('Could not add to wishlist', errMsg(e)),
  });
  const removeMutation = useMutation({
    mutationFn: removeWishlist,
    onSuccess: () => { invalidate(); toastInfo('Removed from wishlist'); },
    onError: (e) => toastError('Could not remove item', errMsg(e)),
  });

  const isFavorite = useCallback(
    (tagKey?: string) =>
      !!tagKey && favorites.some((f) => String(f.TAGKEY) === String(tagKey)),
    [favorites],
  );

  /** Toggle wishlist membership with feedback. Returns status. */
  const toggleFavorite = useCallback(
    (tagKey?: string): 'unauth' | 'invalid' | 'added' | 'removed' => {
      if (!isAuthenticated) { toastInfo('Please sign in to save favourites'); return 'unauth'; }
      if (!tagKey) { toastError('Invalid product'); return 'invalid'; }
      if (isFavorite(tagKey)) {
        removeMutation.mutate(tagKey);
        return 'removed';
      }
      addMutation.mutate({ tagKey, quantity: 1 });
      return 'added';
    },
    [isAuthenticated, isFavorite, addMutation, removeMutation],
  );

  return {
    list: listQuery,
    favorites,
    favoritesCount,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    isAuthenticated,
    isFavorite,
    toggleFavorite,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isMutating: addMutation.isPending || removeMutation.isPending,
  };
};
