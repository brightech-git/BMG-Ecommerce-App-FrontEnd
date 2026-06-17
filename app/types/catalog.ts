// app/types/catalog.ts
// Shared catalog/commerce types. Product shape mirrors the backend response
// used by both website and mobile (see searchService.SearchProduct).

import { SearchProduct } from '../api/services/searchService';

/** A product as returned by /product/items/filter and /product/getTagkeyFilter/:tagKey */
export type Product = SearchProduct;

/** Main category tile (/product/items/MainCategory) */
export interface MainCategory {
  CATCODE?: string;
  CATNAME?: string;
  ITEMID?: string;
  ITEMNAME?: string;
  ImagePath?: string | null;
  count?: number | string;
  [key: string]: any;
}

/** Category image tile (/mainCategory_images/list) */
export interface CategoryImage {
  id?: number | string;
  title?: string;
  ItemName?: string;
  itemName?: string;
  imagePath?: string;
  image?: string;
  [key: string]: any;
}

/** Item / sub-item names (/product/itemnameAndSubItemname?metal=) */
export interface ItemSubItemName {
  ItemName?: string;
  itemName?: string;
  SubItemName?: string;
  subItemName?: string;
  ItemId?: string | number;
  [key: string]: any;
}

/** Cart line item (/cart/summary -> data.products[]) */
export interface CartProduct extends Partial<SearchProduct> {
  TAGKEY: string;
  quantity?: number;
  shippingPincode?: string;
  [key: string]: any;
}

export interface CartSummary {
  data?: {
    products?: CartProduct[];
    subtotal?: number;
    total?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AddToCartPayload {
  tagKey: string;
  quantity: number;
  shippingPincode?: string;
}

/** Wishlist item (/wishlist -> data.products[]) */
export interface WishlistProduct extends Partial<SearchProduct> {
  TAGKEY: string;
  [key: string]: any;
}

export interface AddToWishlistPayload {
  tagKey: string;
  quantity?: number;
}

/** Today's metal rate (/product/todayrate) */
export interface TodayRate {
  gold?: number | string;
  silver?: number | string;
  goldRate?: number | string;
  silverRate?: number | string;
  [key: string]: any;
}

/** Filter params accepted by /product/items/filter */
export interface ProductFilterParams {
  search?: string;
  ItemName?: string;
  itemId?: string | number;
  metal?: string;
  SubItemName?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}
