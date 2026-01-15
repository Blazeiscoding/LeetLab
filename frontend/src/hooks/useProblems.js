import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../utils/axios";

// Query cache configuration for optimal performance
const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
  gcTime: 10 * 60 * 1000,   // 10 minutes - garbage collection time (formerly cacheTime)
};

/**
 * Hook to fetch all problems with caching
 */
export const useProblems = () => {
  return useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const response = await axiosInstance.get("/problems/get-all-problems");
      return response.data.data || [];
    },
    ...QUERY_CONFIG,
  });
};

/**
 * Hook to fetch a single problem by ID
 */
export const useProblem = (id) => {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/problems/get-problem/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...QUERY_CONFIG,
  });
};

/**
 * Hook to fetch user's solved problems
 */
export const useSolvedProblems = () => {
  return useQuery({
    queryKey: ["solvedProblems"],
    queryFn: async () => {
      const response = await axiosInstance.get("/problems/get-solved-problems");
      const data = response.data.data;
      // Ensure we always return an array (API might return object with difficulty keys)
      return Array.isArray(data) ? data : [];
    },
    ...QUERY_CONFIG,
  });
};

/**
 * Hook to fetch problems by difficulty with derived data
 */
export const useProblemsByDifficulty = () => {
  const { data: problems = [], ...query } = useProblems();
  
  const problemsByDifficulty = problems.reduce(
    (acc, problem) => {
      acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
      return acc;
    },
    { EASY: 0, MEDIUM: 0, HARD: 0 }
  );

  return {
    ...query,
    data: problemsByDifficulty,
    totalProblems: problems.length,
  };
};

