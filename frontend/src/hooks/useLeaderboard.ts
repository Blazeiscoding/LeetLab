import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axios';
import { LeaderboardEntry } from '../types';

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  month: number;
  year: number;
}

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard', 'monthly'],
    queryFn: async () => {
      const response = await axiosInstance.get('/leaderboard/monthly');
      return response.data.data as LeaderboardData;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useTopLeaderboard = (limit = 3) => {
  const { data, ...query } = useLeaderboard();

  return {
    ...query,
    data: data?.leaderboard?.slice(0, limit) || [],
    period: data ? { month: data.month, year: data.year } : null,
    fullLeaderboard: data?.leaderboard || [],
  };
};

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
