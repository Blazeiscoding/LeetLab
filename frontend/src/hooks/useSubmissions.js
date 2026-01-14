import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../utils/axios";

/**
 * Hook to fetch all user submissions
 */
export const useSubmissions = () => {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/submission/get-all-submission");
      return response.data.data || [];
    },
  });
};

/**
 * Hook to fetch recent submissions (last N)
 */
export const useRecentSubmissions = (limit = 5) => {
  const { data: submissions = [], ...query } = useSubmissions();
  
  return {
    ...query,
    data: submissions.slice(0, limit),
  };
};

/**
 * Hook for submitting code (mutation)
 */
export const useSubmitCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/execute-code/submit", payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate submissions and solved problems to refetch
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["solvedProblems"] });
    },
  });
};

/**
 * Hook for running code (mutation)
 */
export const useRunCode = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/execute-code/run", payload);
      return response.data;
    },
  });
};
