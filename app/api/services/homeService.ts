// app/api/services/homeService.ts
// Mirrors website banner/home-content services (BannerService, CategoryImageService,
// BudgetCategoryService, newArrivals, trendingService, GenderBannerService, OfferBannerService…)
import { callApi } from '../apiClient';
import { HOME } from '../endpoints';
import { CategoryImage } from '../../types/catalog';

export const getHeroBanners        = () => callApi<null, any>({ method: 'get', url: HOME.BANNER_LIST });
export const getCategoryImages     = () => callApi<null, CategoryImage[]>({ method: 'get', url: HOME.CATEGORY_IMAGES });
export const getGenderImages       = () => callApi<null, any>({ method: 'get', url: HOME.GENDER_IMAGES });
export const getOfferBanners       = () => callApi<null, any>({ method: 'get', url: HOME.OFFER_BANNERS });
export const getInstantOffers      = () => callApi<null, any>({ method: 'get', url: HOME.INSTANT_OFFERS });
export const getFeaturedProducts   = () => callApi<null, any>({ method: 'get', url: HOME.FEATURED_PRODUCTS });
export const getBestDesign         = () => callApi<null, any>({ method: 'get', url: HOME.BEST_DESIGN });
export const getLatestCollection   = () => callApi<null, any>({ method: 'get', url: HOME.LATEST_COLLECTION });
export const getBudgetCategories   = () => callApi<null, any>({ method: 'get', url: HOME.BUDGET_CATEGORIES });
export const getNewArrivals        = () => callApi<null, any>({ method: 'get', url: HOME.NEW_ARRIVALS });
export const getTrending           = () => callApi<null, any>({ method: 'get', url: HOME.TRENDING });
export const getRecentlyViewed     = () => callApi<null, any>({ method: 'get', url: HOME.RECENTLY_VIEWED });
export const recordRecentlyViewed  = (tagKey: string, token: string) =>
  callApi<null, any>({
    method: 'post',
    url: HOME.RECENTLY_VIEWED_ADD,
    data: null,
    params: { tagKey },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
export const getCompanyInfo        = () => callApi<null, any>({ method: 'get', url: HOME.COMPANY });
export const getFooterContent      = () => callApi<null, any>({ method: 'get', url: HOME.FOOTER });
