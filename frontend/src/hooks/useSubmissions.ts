import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axios';
import { Submission, ExecuteCodeRequest } from '../types';

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/submission/get-all-submission');
      return (response.data.data || []) as Submission[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useRecentSubmissions = (limit = 5) => {
  const { data: submissions = [], ...query } = useSubmissions();
  const recentSubmissions = useMemo(
    () => submissions.slice(0, limit),
    [submissions, limit]
  );

  return {
    ...query,
    data: recentSubmissions,
  };
};

export const useSubmitCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExecuteCodeRequest) => {
      const response = await axiosInstance.post('/execute-code/submit', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['solvedProblems'] });
    },
  });
};

export const useRunCode = () => {
  return useMutation({
    mutationFn: async (payload: ExecuteCodeRequest) => {
      const response = await axiosInstance.post('/execute-code/run', payload);
      return response.data;
    },
  });
};
