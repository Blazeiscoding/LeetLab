import { useMemo } from 'react';
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
  const topLeaderboard = useMemo(
    () => data?.leaderboard?.slice(0, limit) || [],
    [data?.leaderboard, limit]
  );
  const period = useMemo(
    () => (data ? { month: data.month, year: data.year } : null),
    [data]
  );
  const fullLeaderboard = useMemo(() => data?.leaderboard || [], [data?.leaderboard]);

  return {
    ...query,
    data: topLeaderboard,
    period,
    fullLeaderboard,
  };
};

export const useLeaderboardWithRefresh = () => {
  const { data, refetch, isRefetching, ...query } = useLeaderboard();
  const leaderboard = useMemo(() => data?.leaderboard || [], [data?.leaderboard]);
  const period = useMemo(
    () => (data ? { month: data.month, year: data.year } : null),
    [data]
  );

  return {
    ...query,
    leaderboard,
    period,
    refresh: refetch,
    isRefreshing: isRefetching,
  };
};
