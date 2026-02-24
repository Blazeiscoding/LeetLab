import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axios';
import { Problem, ProblemSolved } from '../types';

const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

interface UseProblemsOptions {
  enabled?: boolean;
}

export const useProblems = (options: UseProblemsOptions = {}) => {
  return useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const response = await axiosInstance.get('/problems/get-all-problems');
      return (response.data.data || []) as Problem[];
    },
    enabled: options.enabled ?? true,
    ...QUERY_CONFIG,
  });
};

export const useProblem = (id: string | undefined) => {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/problems/get-problem/${id}`);
      return response.data.data as Problem;
    },
    enabled: !!id,
    ...QUERY_CONFIG,
  });
};

export const useSolvedProblems = () => {
  return useQuery({
    queryKey: ['solvedProblems'],
    queryFn: async () => {
      const response = await axiosInstance.get('/problems/get-solved-problems');
      const data = response.data.data;
      return (Array.isArray(data) ? data : []) as ProblemSolved[];
    },
    ...QUERY_CONFIG,
  });
};

interface ProblemsByDifficulty {
  EASY: number;
  MEDIUM: number;
  HARD: number;
}

export const useProblemsByDifficulty = () => {
  const { data: problems = [], ...query } = useProblems();

  const problemsByDifficulty = useMemo(
    () =>
      problems.reduce<ProblemsByDifficulty>(
        (acc, problem) => {
          acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
          return acc;
        },
        { EASY: 0, MEDIUM: 0, HARD: 0 }
      ),
    [problems]
  );

  return {
    ...query,
    data: problemsByDifficulty,
    totalProblems: problems.length,
  };
};
