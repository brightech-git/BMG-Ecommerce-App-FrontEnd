// app/api/hooks/useProducts.ts
// Paginated product listing via /product/items/filter, with infinite scroll support.
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { filterProducts } from '../services/productService';
import { SearchProduct } from '../services/searchService';
import { ProductFilterParams } from '../../types/catalog';

const PAGE_SIZE = 12;

/**
 * Infinite product listing. `filters` excludes page/pageSize.
 * Returns a flattened `products` array + standard infinite-query controls.
 */
export const useProductListing = (filters: ProductFilterParams = {}) => {
  const query = useInfiniteQuery({
    queryKey: ['productListing', filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      filterProducts({ ...filters, page: pageParam as number, pageSize: PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const current = lastPage.currentPage ?? lastPage.page ?? 1;
      return lastPage.hasMore ? current + 1 : undefined;
    },
  });

  const products: SearchProduct[] =
    query.data?.pages.flatMap((p) => p?.data ?? []) ?? [];

  const totalProducts = query.data?.pages?.[0]?.totalProducts ?? products.length;

  return { ...query, products, totalProducts };
};

/** Simple non-paginated fetch (e.g. small curated lists). */
export const useProducts = (filters: ProductFilterParams = {}, enabled = true) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => filterProducts({ pageSize: PAGE_SIZE, page: 1, ...filters }),
    enabled,
  });
