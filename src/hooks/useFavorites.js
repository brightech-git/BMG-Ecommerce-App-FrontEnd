import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getFavorites, addFavorite, removeFavorite} from '../services/FavoriteService';
import {useAuth} from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const {isAuthenticated} = useAuth();

  const {data, isLoading} = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!isAuthenticated,
  });

  const favorites = data?.data?.products ?? [];
  const favoritesCount = favorites.length;

  const isFavorite = tagKey =>
    favorites.some(f => String(f.TAGKEY) === String(tagKey));

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['favorites']});
      Toast.show({type: 'success', text1: '❤️ Added to wishlist!'});
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['favorites']});
      Toast.show({type: 'success', text1: 'Removed from wishlist'});
    },
  });

  const toggleFavorite = item => {
    if (!isAuthenticated) {
      Toast.show({type: 'info', text1: 'Please login first'});
      return;
    }
    if (isFavorite(item.TAGKEY)) {
      removeMutation.mutate(item.TAGKEY);
    } else {
      addMutation.mutate({tagKey: item.TAGKEY});
    }
  };

  return {
    favorites,
    favoritesCount,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
  };
};
