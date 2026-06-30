import { useState, useEffect, useRef, useCallback } from 'react';
import { searchProducts, SearchProduct, SearchResponse } from '../services/searchService';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';

const PAGE_SIZE = 10;

export const useSearch = () => {
    const [query, setQuery]               = useState('');
    const [products, setProducts]         = useState<SearchProduct[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [loading, setLoading]           = useState(false);
    const [loadingMore, setLoadingMore]   = useState(false);
    const [hasMore, setHasMore]           = useState(false);
    const [page, setPage]                 = useState(0);
    const [error, setError]               = useState<string | null>(null);

    const debounceTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentQuery   = useRef('');

    // ── Load recent searches from AsyncStorage on mount ──────────────
    useEffect(() => {
        AsyncStorageHelper.getRecentSearches().then(setRecentSearches);
    }, []);

    // ── Fetch products ────────────────────────────────────────────────
    const fetchProducts = useCallback(async (search: string, pageNum: number, isLoadMore = false) => {
        if (!search.trim()) {
            setProducts([]);
            setHasMore(false);
            return;
        }

        isLoadMore ? setLoadingMore(true) : setLoading(true);
        setError(null);

        try {
            const res: SearchResponse = await searchProducts(search, pageNum, PAGE_SIZE);
            if (isLoadMore) {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.TAGKEY ?? p.id));
                    const fresh = res.data.filter(p => !existingIds.has(p.TAGKEY ?? p.id));
                    return [...prev, ...fresh];
                });
            } else {
                // Deduplicate by TAGKEY within the page itself
                const seen = new Set<string>();
                const unique = res.data.filter(p => {
                    const key = String(p.TAGKEY ?? p.id ?? '');
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setProducts(unique);
            }
            setHasMore(res.hasMore);
            setPage(res.currentPage);

            // Save to AsyncStorage only on first page (new search, not load-more)
            if (!isLoadMore) {
                const updated = await AsyncStorageHelper.addRecentSearch(search);
                setRecentSearches(updated);
            }
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong');
        } finally {
            isLoadMore ? setLoadingMore(false) : setLoading(false);
        }
    }, []);

    // ── Debounced search ──────────────────────────────────────────────
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!query.trim()) {
            setProducts([]);
            setHasMore(false);
            return;
        }

        debounceTimer.current = setTimeout(() => {
            currentQuery.current = query;
            setPage(0);
            fetchProducts(query, 0, false);
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query, fetchProducts]);

    // ── Load more ─────────────────────────────────────────────────────
    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore || loading) return;
        fetchProducts(currentQuery.current, page + 1, true);
    }, [hasMore, loadingMore, loading, page, fetchProducts]);

    // ── Remove a single recent search ─────────────────────────────────
    const removeRecent = useCallback(async (term: string) => {
        const updated = await AsyncStorageHelper.removeRecentSearch(term);
        setRecentSearches(updated);
    }, []);

    // ── Clear all recent searches ─────────────────────────────────────
    const clearRecent = useCallback(async () => {
        await AsyncStorageHelper.clearRecentSearches();
        setRecentSearches([]);
    }, []);

    return {
        query,
        setQuery,
        products,
        recentSearches,
        removeRecent,
        clearRecent,
        loading,
        loadingMore,
        hasMore,
        error,
        loadMore,
    };
};
