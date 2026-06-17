// app/api/services/productService.ts
// Mirrors website src/service/ProductService.jsx + CategoryItemsService.jsx + RateService.jsx
import { callApi } from '../apiClient';
import { PRODUCT } from '../endpoints';
import { SearchResponse, SearchProduct } from './searchService';
import {
  Product, MainCategory, ItemSubItemName, TodayRate, ProductFilterParams,
} from '../../types/catalog';

/** GET /product/items/filter — primary catalog/listing endpoint (paginated) */
export const filterProducts = (params: ProductFilterParams) => {
  // strip empty values exactly like the website cleaner
  const cleaned: Record<string, any> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) {
      cleaned[k] = typeof v === 'string' ? v.replace(/^"|"$/g, '').trim() : v;
    }
  });
  return callApi<null, SearchResponse>({
    method: 'get',
    url: PRODUCT.FILTER,
    params: cleaned,
  });
};

/** GET /product/getTagkeyFilter/:tagKey — single product detail */
export const getProductByTagKey = (tagKey: string) =>
  callApi<null, Product>({
    method: 'get',
    url: PRODUCT.BY_TAGKEY.replace(':tagKey', encodeURIComponent(tagKey)),
  });

/** GET /product/related?itemCtrId= */
export const getRelatedProducts = (itemCtrId: string | number) =>
  callApi<null, SearchProduct[]>({
    method: 'get',
    url: PRODUCT.RELATED,
    params: { itemCtrId },
  });

/** GET /product/items/MainCategory */
export const getMainCategories = () =>
  callApi<null, MainCategory[]>({
    method: 'get',
    url: PRODUCT.MAIN_CATEGORY,
  });

/** GET /product/itemnameAndSubItemname?metal= */
export const getItemAndSubItemNames = (metal?: string) =>
  callApi<null, ItemSubItemName[]>({
    method: 'get',
    url: PRODUCT.ITEM_SUBITEM_NAMES,
    params: metal ? { metal } : undefined,
  });

/** GET /item-sizes/combined?itemName= */
export const getItemSizes = (itemName: string) =>
  callApi<null, any>({
    method: 'get',
    url: PRODUCT.ITEM_SIZES,
    params: { itemName },
  });

/** GET /product/whatsapp-link?sno= */
export const getWhatsappLink = (sno: string) =>
  callApi<null, any>({
    method: 'get',
    url: PRODUCT.WHATSAPP_LINK,
    params: { sno },
  });

/** GET /product/todayrate */
export const getTodayRate = () =>
  callApi<null, TodayRate>({
    method: 'get',
    url: PRODUCT.TODAY_RATE,
  });
