import {useQuery} from '@tanstack/react-query';
import {getTodayRates} from '../services/HomeService';

export const useRates = () =>
  useQuery({
    queryKey: ['todayRate'],
    queryFn: getTodayRates,
    staleTime: 1000 * 60 * 2, // 2 min
    retry: 1,
  });
