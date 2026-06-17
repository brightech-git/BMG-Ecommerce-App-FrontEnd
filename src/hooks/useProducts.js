import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {
  filterProducts,
  getProductByTagKey,
  getProductFilters,
  getRelatedProducts,
} from '../services/ProductService';

const PAGE_SIZE = 20;

// Infinite paginated products
export const useFilteredProducts = (filters = {}) =>
  useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({pageParam = 0}) =>
      filterProducts({...filters, page: pageParam, pageSize: PAGE_SIZE}),
    getNextPageParam: (lastPage, allPages) => {
      const total = lastPage?.total ?? lastPage?.data?.length ?? 0;
      const loaded = allPages.reduce(
        (acc, p) => acc + (p?.data?.length ?? 0),
        0,
      );
      return loaded < total ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

// Single product
export const useSingleProduct = tagKey =>
  useQuery({
    queryKey: ['product', tagKey],
    queryFn: () => getProductByTagKey(tagKey),
    enabled: !!tagKey,
    staleTime: 5 * 60 * 1000,
  });

// Filter options
export const useProductFilters = itemName =>
  useQuery({
    queryKey: ['productFilters', itemName],
    queryFn: () => getProductFilters(itemName),
    enabled: !!itemName,
    staleTime: 5 * 60 * 1000,
  });

// Related products
export const useRelatedProducts = itemCtrId =>
  useQuery({
    queryKey: ['relatedProducts', itemCtrId],
    queryFn: () => getRelatedProducts(itemCtrId),
    enabled: !!itemCtrId,
    staleTime: 5 * 60 * 1000,
  });
