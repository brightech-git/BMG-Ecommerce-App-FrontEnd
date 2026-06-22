// app/api/hooks/useHome.ts
// Aggregates the home-screen content sources used by the website home page.
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthToken } from './useAuthToken';
import { filterProducts } from '../services/productService';
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

export const useRecentlyViewed = () => {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: getRecentlyViewed,
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Fetches 4 products each from 5 jewellery categories in parallel.
 * Returns data grouped by category so the UI can render a Flipkart-style
 * "section card" per category — each card shows a 2×2 product mini-grid.
 */
const SUGGEST_CATS = [
  { id: 2,  name: 'Rings',     headerColor: '#FFF0E6', accentColor: '#E07B39' },
  { id: 6,  name: 'Earrings',  headerColor: '#FFF0E6', accentColor: '#E07B39' },
  { id: 13, name: 'Bangles',   headerColor: '#FFF0E6', accentColor: '#E07B39' },
  { id: 4,  name: 'Necklaces', headerColor: '#FFF0E6', accentColor: '#E07B39' },
];
const PER_CAT = 4;

export const useSuggestedProducts = () => {
  const results = useQueries({
    queries: SUGGEST_CATS.map((cat) => ({
      queryKey: ['suggestedCat', cat.id],
      queryFn: () => filterProducts({ itemId: cat.id, pageSize: PER_CAT, page: 1 }),
      staleTime: 1000 * 60 * 10,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  // Return one entry per category; filter out empty ones
  const categories = SUGGEST_CATS.map((cat, i) => {
    const raw = (results[i].data as any)?.data ?? [];
    return {
      ...cat,
      products: (Array.isArray(raw) ? raw : []).slice(0, PER_CAT) as any[],
    };
  }).filter((c) => c.products.length > 0);

  return { categories, isLoading };
};

export const useRecordRecentlyViewed = () => {
  const token = useAuthToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagKey: string) => recordRecentlyViewed(tagKey, token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recentlyViewed'] });
    },
  });
};
