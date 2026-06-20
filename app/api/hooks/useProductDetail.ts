// app/api/hooks/useProductDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getProductByTagKey, getRelatedProducts, getWhatsappLink } from '../services/productService';

export const useProductDetail = (tagKey?: string) =>
  useQuery({
    queryKey: ['product', tagKey],
    queryFn: () => getProductByTagKey(tagKey as string),
    enabled: !!tagKey,
  });

export const useRelatedProducts = (itemCtrId?: string | number | null) =>
  useQuery({
    queryKey: ['related', itemCtrId],
    queryFn: () => getRelatedProducts(itemCtrId as string | number),
    // SubItemId can be 0 for some products — check != null rather than !!
    // Also fall back gracefully if ITEMID string is passed
    enabled: itemCtrId != null && itemCtrId !== '' && itemCtrId !== 0,
  });

export const useWhatsappLink = (sno?: string) =>
  useQuery({
    queryKey: ['whatsappLink', sno],
    queryFn: () => getWhatsappLink(sno as string),
    enabled: !!sno,
  });
