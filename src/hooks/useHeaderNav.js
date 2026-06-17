import {useQuery} from '@tanstack/react-query';
import {getHeaderNav, getMenuFilters} from '../services/HeaderNavService';

// Header navigation menu sections
export const useHeaderNav = () =>
  useQuery({
    queryKey: ['header-nav'],
    queryFn: getHeaderNav,
    staleTime: 10 * 60 * 1000, // 10 min
    refetchOnWindowFocus: false,
  });

// Menu filter list (for product page filters)
export const useMenuFilters = () =>
  useQuery({
    queryKey: ['menu-filters'],
    queryFn: getMenuFilters,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
