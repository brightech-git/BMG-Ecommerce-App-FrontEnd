import { callApi } from '../apiClient';
import { SEARCH } from '../endpoints';

export interface SearchProduct {
    TAGNO: string;
    TAGKEY: string;
    SNO: string;
    ITEMID: string;
    ITEMNAME: string;
    SUBITEMNAME: string;
    CATNAME: string;
    CATCODE: string;
    GRSWT: string;
    NETWT: string;
    RATE: string;
    MC: string;
    GrossAmount: string;
    FinalAmount: string;
    OriginalAmount: string;
    DiscountAmount: string;
    GrandTotal: string;
    OfferPercentage: string;
    GSTAmount: string;
    GSTPER: string;
    GSTType: string;
    NEWPURITY: string;
    METALID: string;
    SALEMODE: string;
    STUDDEDSTONE: string;
    SUBITEM: string;
    ImagePath: string | null;
    Description: string | null;
    SIZENAME: string | null;
    PCS: number;
    SubItemId: number;
}

export interface SearchResponse {
    data: SearchProduct[];
    recentSearches: string[];
    noMoreProducts: boolean;
    totalProducts: number;
    totalPages: number;
    hasMore: boolean;
    pageSize: number;
    page: number;
    currentPage: number;
    message: string;
}

export const searchProducts = (search: string, page: number, pageSize = 10) =>
    callApi<null, SearchResponse>({
        method: 'get',
        url: SEARCH.SEARCH,
        params: { search, page, pageSize },
    });
