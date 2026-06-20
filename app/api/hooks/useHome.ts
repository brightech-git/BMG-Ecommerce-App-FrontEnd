// app/api/hooks/useHome.ts
// Aggregates the home-screen content sources used by the website home page.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthToken } from './useAuthToken';
import {
  getHeroBanners, getCategoryImages, getBudgetCategories,
  getNewArrivals, getTrending, getOfferBanners, getInstantOffers,
  getCompanyInfo, getFooterContent, getRecentlyViewed, recordRecentlyViewed,
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

export const useInstantOffers = () =>
  useQuery({ queryKey: ['instantOffers'], queryFn: getInstantOffers, staleTime: 1000 * 60 * 5 });

export const useCompanyInfo = () =>
  useQuery({ queryKey: ['companyInfo'], queryFn: getCompanyInfo, staleTime: 1000 * 60 * 30 });

export const useFooterContent = () =>
  useQuery({ queryKey: ['footerContent'], queryFn: getFooterContent, staleTime: 1000 * 60 * 30 });

// Recently viewed — requires auth. Returns list of previously viewed products.
export const useRecentlyViewed = () => {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: getRecentlyViewed,
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // refresh every 2 min
  });
};

// Call this when a product page opens to record the view server-side.
// We pass the token explicitly because the mutation fires on mount (before the
// axios interceptor's async token-read from AsyncStorage has finished).
export const useRecordRecentlyViewed = () => {
  const token = useAuthToken();
  const qc    = useQueryClient();
  return useMutation({
    mutationFn: (tagKey: string) => {
      if (__DEV__) console.log('[RecentlyViewed ADD] posting tagKey:', tagKey, '| token present:', !!token);
      return recordRecentlyViewed(tagKey, token ?? '');
    },
    onSuccess: (res: any) => {
      if (__DEV__) console.log('[RecentlyViewed ADD] success:', JSON.stringify(res)?.slice(0, 300));
      qc.invalidateQueries({ queryKey: ['recentlyViewed'] });
    },
    onError: (err: any) => {
      if (__DEV__) console.warn('[RecentlyViewed ADD] error:', err?.statusCode, err?.message);
    },
  });
};
