// app/api/hooks/useRate.ts
import { useQuery } from '@tanstack/react-query';
import { getTodayRate } from '../services/productService';

export const useTodayRate = () =>
  useQuery({
    queryKey: ['todayRate'],
    queryFn: getTodayRate,
    staleTime: 1000 * 60 * 10,
  });
