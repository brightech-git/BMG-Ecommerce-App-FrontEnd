// app/api/queryClient.ts
// Central React Query client for all server-state (products, cart, wishlist, orders…).
// Redux is kept for auth + local UI state; React Query owns remote data — mirroring
// the website architecture (which uses @tanstack/react-query throughout).
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 min
    },
    mutations: {
      retry: 0,
    },
  },
});
