/* eslint-disable no-unused-vars */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { ApiResponse, User } from '../types';

// Example API functions (to be replaced with actual API calls)
const api = {
  // Health check endpoint
  getHealth: async (): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > => {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new ApiError(
        `Health check failed: ${response.status}`,
        response.status
      );
    }
    return response.json();
  },

  // User endpoints (examples)
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch users: ${response.status}`,
        response.status
      );
    }
    return response.json();
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch user: ${response.status}`,
        response.status
      );
    }
    return response.json();
  },

  // Project endpoints (examples)
  getProjects: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch projects: ${response.status}`,
        response.status
      );
    }
    return response.json();
  },
};

// Query hooks
export const useHealthQuery = () => {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: api.getHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUsersQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: api.getUsers,
  });
};

export const useUserQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.getUser(id),
    enabled: !!id, // Only run query if id is provided
  });
};

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: api.getProjects,
  });
};

// Mutation hooks (examples)
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new ApiError(
          `Failed to create user: ${response.status}`,
          response.status
        );
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export default {
  useHealthQuery,
  useUsersQuery,
  useUserQuery,
  useProjectsQuery,
  useCreateUserMutation,
};
