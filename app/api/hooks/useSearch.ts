import { useState, useEffect, useRef, useCallback } from 'react';
import { searchProducts, SearchProduct, SearchResponse } from '../services/searchService';

const PAGE_SIZE = 10;

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<SearchProduct[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentQuery = useRef('');

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
                setProducts(prev => [...prev, ...res.data]);
            } else {
                setProducts(res.data);
                setRecentSearches(res.recentSearches);
            }
            setHasMore(res.hasMore);
            setPage(res.currentPage);
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong');
        } finally {
            isLoadMore ? setLoadingMore(false) : setLoading(false);
        }
    }, []);

    // Debounced search — fires on every character change
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

    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore || loading) return;
        const nextPage = page + 1;
        fetchProducts(currentQuery.current, nextPage, true);
    }, [hasMore, loadingMore, loading, page, fetchProducts]);

    return {
        query,
        setQuery,
        products,
        recentSearches,
        loading,
        loadingMore,
        hasMore,
        error,
        loadMore,
    };
};
