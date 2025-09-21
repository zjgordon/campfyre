/**
 * API Types
 *
 * Common types for API interactions, responses, and errors.
 * These types are designed to be compatible with tRPC and provide consistent API contracts.
 */

/* eslint-disable no-unused-vars */
import {
  BaseEntity,
  ApiResponse,
  ApiErrorResponse,
  PaginationParams,
  PaginatedResponse,
} from './shared';

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API endpoint configuration
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// Request configuration
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTime?: number; // in milliseconds
}

// Query parameters for API requests
export interface ApiQueryParams extends PaginationParams {
  [key: string]: any;
}

// Mutation parameters
export interface ApiMutationParams {
  [key: string]: any;
}

// Health check response
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  dependencies: {
    database: 'connected' | 'disconnected' | 'unknown';
    redis?: 'connected' | 'disconnected' | 'unknown';
    external?: Record<string, 'connected' | 'disconnected' | 'unknown'>;
  };
  metrics?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      load: number[];
    };
  };
}

// Error types for different scenarios
export interface ValidationError extends ApiErrorResponse {
  code: 'VALIDATION_ERROR';
  details: {
    field: string;
    message: string;
    value?: any;
  }[];
}

export interface AuthenticationError extends ApiErrorResponse {
  code: 'AUTHENTICATION_ERROR' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
}

export interface AuthorizationError extends ApiErrorResponse {
  code: 'AUTHORIZATION_ERROR' | 'INSUFFICIENT_PERMISSIONS';
}

export interface NotFoundError extends ApiErrorResponse {
  code: 'NOT_FOUND';
  entity: string;
  id: string;
}

export interface ConflictError extends ApiErrorResponse {
  code: 'CONFLICT';
  entity: string;
  conflictingField: string;
  conflictingValue: any;
}

export interface RateLimitError extends ApiErrorResponse {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter: number; // in seconds
}

// Union type for all possible API errors
export type ApiError =
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | ConflictError
  | RateLimitError
  | ApiErrorResponse;

// Success response types
export interface CreateResponse<T> extends ApiResponse<T> {
  statusCode: 201;
}

export interface UpdateResponse<T> extends ApiResponse<T> {
  statusCode: 200;
}

export interface DeleteResponse extends ApiResponse<null> {
  statusCode: 204;
  message: string;
}

// Query response types
export interface GetResponse<T> extends ApiResponse<T> {
  statusCode: 200;
}

export interface ListResponse<T> extends ApiResponse<PaginatedResponse<T>> {
  statusCode: 200;
}

// Upload response
export interface UploadResponse
  extends ApiResponse<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }> {
  statusCode: 201;
}

// Search response
export interface SearchResponse<T>
  extends ApiResponse<{
    results: T[];
    total: number;
    query: string;
    filters: Record<string, any>;
    suggestions?: string[];
  }> {
  statusCode: 200;
}

// Batch operation response
export interface BatchResponse<T>
  extends ApiResponse<{
    successful: T[];
    failed: Array<{
      item: any;
      error: ApiError;
    }>;
    total: number;
    successCount: number;
    failureCount: number;
  }> {
  statusCode: 207; // Multi-Status
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketError {
  type: 'error';
  payload: ApiError;
  timestamp: string;
  id?: string;
}

// Real-time event types
export interface RealtimeEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
  userId?: string;
  roomId?: string;
}

// API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  defaultHeaders?: Record<string, string>;
  authToken?: string;
  onError?: (error: ApiError) => void;
  onRequest?: (config: ApiRequestConfig) => void;
  onResponse?: (response: any) => void;
}

// Request interceptor
export interface RequestInterceptor {
  onRequest?: (
    config: ApiRequestConfig
  ) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onRequestError?: (error: any) => Promise<any>;
}

// Response interceptor
export interface ResponseInterceptor {
  onResponse?: (response: any) => any;
  onResponseError?: (error: ApiError) => Promise<ApiError>;
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // time to live in milliseconds
  maxSize?: number; // maximum number of cached items
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

// API client interface
export interface ApiClient {
  get<T>(
    endpoint: string,
    params?: ApiQueryParams,
    config?: ApiRequestConfig
  ): Promise<GetResponse<T>>;
  post<T>(
    endpoint: string,
    data?: ApiMutationParams,
    config?: ApiRequestConfig
  ): Promise<CreateResponse<T>>;
  put<T>(
    endpoint: string,
    data?: ApiMutationParams,
    config?: ApiRequestConfig
  ): Promise<UpdateResponse<T>>;
  patch<T>(
    endpoint: string,
    data?: ApiMutationParams,
    config?: ApiRequestConfig
  ): Promise<UpdateResponse<T>>;
  delete(endpoint: string, config?: ApiRequestConfig): Promise<DeleteResponse>;
  upload(
    endpoint: string,
    file: File,
    config?: ApiRequestConfig
  ): Promise<UploadResponse>;
  search<T>(
    endpoint: string,
    query: string,
    filters?: Record<string, any>
  ): Promise<SearchResponse<T>>;
  batch<T>(
    endpoint: string,
    operations: Array<{ method: HttpMethod; data: any }>
  ): Promise<BatchResponse<T>>;
}

// Type guards for API responses
export const isValidationError = (
  error: ApiError
): error is ValidationError => {
  return error.code === 'VALIDATION_ERROR';
};

export const isAuthenticationError = (
  error: ApiError
): error is AuthenticationError => {
  return ['AUTHENTICATION_ERROR', 'TOKEN_EXPIRED', 'TOKEN_INVALID'].includes(
    error.code || ''
  );
};

export const isAuthorizationError = (
  error: ApiError
): error is AuthorizationError => {
  return ['AUTHORIZATION_ERROR', 'INSUFFICIENT_PERMISSIONS'].includes(
    error.code || ''
  );
};

export const isNotFoundError = (error: ApiError): error is NotFoundError => {
  return error.code === 'NOT_FOUND';
};

export const isConflictError = (error: ApiError): error is ConflictError => {
  return error.code === 'CONFLICT';
};

export const isRateLimitError = (error: ApiError): error is RateLimitError => {
  return error.code === 'RATE_LIMIT_EXCEEDED';
};

// Utility functions for API interactions
export const createApiError = (
  message: string,
  statusCode: number,
  code?: string,
  details?: Record<string, any>
): ApiError => ({
  message,
  statusCode,
  ...(code && { code }),
  timestamp: new Date().toISOString(),
  ...(details && { details }),
});

export const isApiSuccess = (response: any): boolean => {
  return response && response.statusCode >= 200 && response.statusCode < 300;
};

export const isApiError = (response: any): response is ApiError => {
  return response && response.statusCode >= 400;
};

export default {
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isConflictError,
  isRateLimitError,
  createApiError,
  isApiSuccess,
  isApiError,
};
