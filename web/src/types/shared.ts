/**
 * Shared Types Package
 *
 * This package contains common types that can be shared between frontend and backend.
 * Types are designed to be compatible with tRPC and provide runtime validation through Zod.
 */

// Base entity interface that all entities should extend
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Common response wrapper for API calls
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

// Error response structure
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  code?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type Visibility = 'public' | 'private' | 'team' | 'unlisted';

// Theme and preferences
export type Theme = 'light' | 'dark' | 'auto';
export type Language =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ko';

// Notification types
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing?: boolean;
}

// Accessibility preferences
export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// Common form states
export type FormState = 'idle' | 'loading' | 'success' | 'error';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Audit trail types
export interface AuditEntry extends BaseEntity {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Permission types
export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'moderate'
  | 'invite'
  | 'manage_roles';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
  isSystem: boolean;
}

// Export utility functions for type checking
export const isBaseEntity = (obj: any): obj is BaseEntity => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
};

export const isApiResponse = (obj: any): obj is ApiResponse => {
  return obj && typeof obj.data !== 'undefined';
};

export const isApiErrorResponse = (obj: any): obj is ApiErrorResponse => {
  return (
    obj && typeof obj.message === 'string' && typeof obj.statusCode === 'number'
  );
};

// Type guards for common patterns
export const isPaginatedResponse = <T>(
  obj: any
): obj is PaginatedResponse<T> => {
  return (
    obj &&
    Array.isArray(obj.data) &&
    obj.pagination &&
    typeof obj.pagination.total === 'number'
  );
};

// Constants for common values
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
];

// Re-export commonly used types for convenience
export type {} from // These will be imported from other type files
'./api';
export type {} from // These will be imported from other type files
'./user';
export type {} from // These will be imported from other type files
'./game';

export default {
  // Export utility functions as default
  isBaseEntity,
  isApiResponse,
  isApiErrorResponse,
  isPaginatedResponse,
  DEFAULT_PAGINATION,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
};
