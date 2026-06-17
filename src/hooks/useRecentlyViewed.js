import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getRecentlyViewedItems, addRecentlyViewed} from '../services/RecentlyViewedService';
import {useAuth} from '../context/AuthContext';

export const useRecentlyViewed = () => {
  const queryClient = useQueryClient();
  const {isAuthenticated} = useAuth();

  const {data, isLoading, isError} = useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: getRecentlyViewedItems,
    enabled: !!isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const addItemMutation = useMutation({
    mutationFn: addRecentlyViewed,
    onSuccess: () =>
      queryClient.invalidateQueries({queryKey: ['recentlyViewed']}),
  });

  return {
    data,
    isLoading,
    isError,
    addItem: tagKey => addItemMutation.mutate(tagKey),
  };
};
