// app/api/hooks/useHome.ts
// Aggregates the home-screen content sources used by the website home page.
import { useQuery } from '@tanstack/react-query';
import { useAuthToken } from './useAuthToken';
import {
  getHeroBanners, getCategoryImages, getBudgetCategories,
  getNewArrivals, getTrending, getOfferBanners,
} from '../services/homeService';

// Public content — always fetched
export const useHeroBanners    = () => useQuery({ queryKey: ['heroBanners'],    queryFn: getHeroBanners });
export const useBudgetBanners  = () => useQuery({ queryKey: ['budgetBanners'],  queryFn: getBudgetCategories });
export const useHomeCategories = () => useQuery({ queryKey: ['homeCategories'], queryFn: getCategoryImages });
export const useOfferBanners   = () => useQuery({ queryKey: ['offerBanners'],   queryFn: getOfferBanners });

// These endpoints are personalised — only run when a token is available
export const useNewArrivals = () => {
  const token = useAuthToken();
  return useQuery({ queryKey: ['newArrivals'], queryFn: getNewArrivals, enabled: !!token });
};

export const useTrending = () => {
  const token = useAuthToken();
  return useQuery({ queryKey: ['trending'], queryFn: getTrending, enabled: !!token });
};
