import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axios';
import { Playlist, PlaylistWithProblems } from '../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

interface ApiErrorResponse {
  error?: string;
}

export const usePlaylists = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await axiosInstance.get('/playlist');
      return (response.data.data || []) as Playlist[];
    },
    ...QUERY_CONFIG,
  });
};

export const usePlaylist = (id: string | undefined) => {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/playlist/${id}`);
      return response.data.data as PlaylistWithProblems;
    },
    enabled: !!id,
    ...QUERY_CONFIG,
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistData: { name: string; description?: string }) => {
      const response = await axiosInstance.post('/playlist', playlistData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist created successfully');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.error || 'Failed to create playlist');
    },
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description?: string } }) => {
      const response = await axiosInstance.put(`/playlist/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist updated successfully');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.error || 'Failed to update playlist');
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/playlist/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist deleted successfully');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.error || 'Failed to delete playlist');
    },
  });
};

export const useAddProblemsToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, problemIds }: { playlistId: string; problemIds: string[] }) => {
      const response = await axiosInstance.post(
        `/playlist/${playlistId}/add-problem`,
        { problemIds }
      );
      return response.data;
    },
    onSuccess: (_, { playlistId, problemIds }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success(`Added ${problemIds.length} problem(s) to playlist`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.error || 'Failed to add problems');
    },
  });
};

export const useRemoveProblemFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, problemId }: { playlistId: string; problemId: string }) => {
      const response = await axiosInstance.delete(
        `/playlist/${playlistId}/remove-problem`,
        { data: { problemIds: [problemId] } }
      );
      return response.data;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success('Problem removed from playlist');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.error || 'Failed to remove problem');
    },
  });
};
