// app/api/hooks/useCatalog.ts
import { useQuery } from '@tanstack/react-query';
import { getMainCategories, getItemAndSubItemNames } from '../services/productService';
import { getCategoryImages } from '../services/homeService';

export const useMainCategories = () =>
  useQuery({
    queryKey: ['mainCategories'],
    queryFn: getMainCategories,
    staleTime: 1000 * 60 * 30,
  });

export const useCategoryImages = () =>
  useQuery({
    queryKey: ['categoryImages'],
    queryFn: getCategoryImages,
    staleTime: 1000 * 60 * 30,
  });

export const useItemSubItemNames = (metal?: string) =>
  useQuery({
    queryKey: ['itemNames', metal ?? 'all'],
    queryFn: () => getItemAndSubItemNames(metal),
    staleTime: 1000 * 60 * 30,
  });
