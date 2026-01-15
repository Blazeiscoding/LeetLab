import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from "../utils/axios"
import toast from 'react-hot-toast';

// Query cache configuration for optimal performance
const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
  gcTime: 10 * 60 * 1000,   // 10 minutes - garbage collection time
};

/**
 * Hook to fetch all user playlists
 */
export const usePlaylists = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await axiosInstance.get('/playlist');
      return response.data.data || [];
    },
    ...QUERY_CONFIG,
  });
};

/**
 * Hook to fetch a single playlist by ID
 * @param {string} id - Playlist ID
 */
export const usePlaylist = (id) => {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/playlist/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...QUERY_CONFIG,
  });
};

/**
 * Hook to create a new playlist
 */
export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistData) => {
      const response = await axiosInstance.post('/playlist', playlistData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create playlist');
    },
  });
};

/**
 * Hook to update a playlist
 */
export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(`/playlist/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update playlist');
    },
  });
};

/**
 * Hook to delete a playlist
 */
export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/playlist/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete playlist');
    },
  });
};

/**
 * Hook to add problems to a playlist
 */
export const useAddProblemsToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, problemIds }) => {
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
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add problems');
    },
  });
};

/**
 * Hook to remove a problem from a playlist
 */
export const useRemoveProblemFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, problemId }) => {
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
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove problem');
    },
  });
};
