import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from "../utils/axios"

/**
 * Hook to fetch monthly leaderboard data
 */
export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard', 'monthly'],
    queryFn: async () => {
      const response = await axiosInstance.get('/leaderboard/monthly');
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - leaderboard doesn't change frequently
  });
};

/**
 * Hook to fetch top N leaderboard entries
 * @param {number} limit - Number of top entries to return
 */
export const useTopLeaderboard = (limit = 3) => {
  const { data, ...query } = useLeaderboard();

  return {
    ...query,
    data: data?.leaderboard?.slice(0, limit) || [],
    period: data ? { month: data.month, year: data.year } : null,
    fullLeaderboard: data?.leaderboard || [],
  };
};

/**
 * Hook to get leaderboard with refresh capability
 * Returns refetch function for manual refresh
 */
export const useLeaderboardWithRefresh = () => {
  const { data, refetch, isRefetching, ...query } = useLeaderboard();

  return {
    ...query,
    leaderboard: data?.leaderboard || [],
    period: data ? { month: data.month, year: data.year } : null,
    refresh: refetch,
    isRefreshing: isRefetching,
  };
};
