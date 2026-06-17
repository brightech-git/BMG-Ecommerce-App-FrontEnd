import {useQuery} from '@tanstack/react-query';
import {getAllBudgetBanners} from '../services/HomeService';

export const useBudgetBanners = () =>
  useQuery({
    queryKey: ['budget-banners'],
    queryFn: getAllBudgetBanners,
    staleTime: 1000 * 60 * 10, // 10 min
  });
