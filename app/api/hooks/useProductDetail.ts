// app/api/hooks/useProductDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getProductByTagKey, getRelatedProducts, getWhatsappLink } from '../services/productService';

export const useProductDetail = (tagKey?: string) =>
  useQuery({
    queryKey: ['product', tagKey],
    queryFn: () => getProductByTagKey(tagKey as string),
    enabled: !!tagKey,
  });

export const useRelatedProducts = (itemCtrId?: string | number) =>
  useQuery({
    queryKey: ['related', itemCtrId],
    queryFn: () => getRelatedProducts(itemCtrId as string | number),
    enabled: !!itemCtrId,
  });

export const useWhatsappLink = (sno?: string) =>
  useQuery({
    queryKey: ['whatsappLink', sno],
    queryFn: () => getWhatsappLink(sno as string),
    enabled: !!sno,
  });
