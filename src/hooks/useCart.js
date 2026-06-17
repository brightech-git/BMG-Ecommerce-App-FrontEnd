import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchCartSummary, addToCart, deleteCartItem, clearCart} from '../services/CartService';
import {useAuth} from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export const useCart = () => {
  const queryClient = useQueryClient();
  const {isAuthenticated} = useAuth();

  const {data, isLoading, error} = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCartSummary,
    enabled: !!isAuthenticated,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 30000, // refresh every 30s
  });

  const cartProducts = data?.data?.products ?? [];
  const cartCount = cartProducts.length;

  const addItemMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cart']});
      Toast.show({type: 'success', text1: 'Added to cart!'});
    },
    onError: err =>
      Toast.show({type: 'error', text1: 'Failed', text2: err.message}),
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cart']});
      Toast.show({type: 'success', text1: 'Item removed from cart'});
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['cart']}),
  });

  const handleAddToCart = item => {
    if (!isAuthenticated) {
      Toast.show({type: 'info', text1: 'Please login first'});
      return;
    }
    if (!item?.TAGKEY) {
      Toast.show({type: 'error', text1: 'Invalid product'});
      return;
    }
    if (cartProducts.some(c => String(c.TAGKEY) === String(item.TAGKEY))) {
      Toast.show({type: 'info', text1: 'Already in cart!'});
      return;
    }
    addItemMutation.mutate({tagKey: item.TAGKEY, quantity: 1});
  };

  return {
    cartItems: data,
    cartProducts,
    cartCount,
    isLoading,
    error,
    handleAddToCart,
    addToCart: addItemMutation.mutate,
    deleteCart: deleteItemMutation,
    clearCart: clearCartMutation.mutate,
  };
};
