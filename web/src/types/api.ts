// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Example API types for future use
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Query result types
export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

// Mutation result types
export interface MutationResult<TData, TVariables> {
  data: TData | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
  // eslint-disable-next-line no-unused-vars
  mutate: (variables: TVariables) => void;
  // eslint-disable-next-line no-unused-vars
  mutateAsync: (variables: TVariables) => Promise<TData>;
}
