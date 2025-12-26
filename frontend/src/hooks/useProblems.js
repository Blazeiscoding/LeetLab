import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../util/axios";

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
