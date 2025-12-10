import { QueryClient } from "@tanstack/react-query";

/**
 * Configured QueryClient for React Query
 * Provides caching, deduplication, and automatic refetching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache is kept for 30 minutes
      gcTime: 30 * 60 * 1000,
      
      // Retry failed requests 2 times
      retry: 2,
      
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (useful for stale data)
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
