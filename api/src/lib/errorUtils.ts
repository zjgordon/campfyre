import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import type {
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  ErrorMapping,
  ApiErrorResponse,
  BaseError,
} from '../types/errors';

// Error mapping configuration
const ERROR_MAPPINGS: Record<ErrorCode, ErrorMapping> = {
  // Validation errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    category: 'validation',
    severity: 'medium',
    httpStatus: 400,
    message: 'Validation failed',
    logLevel: 'warn',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    category: 'validation',
    severity: 'medium',
    httpStatus: 400,
    message: 'Invalid input provided',
    logLevel: 'warn',
  },
  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    category: 'validation',
    severity: 'medium',
    httpStatus: 400,
    message: 'Required field is missing',
    logLevel: 'warn',
  },
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    category: 'validation',
    severity: 'medium',
    httpStatus: 400,
    message: 'Invalid format provided',
    logLevel: 'warn',
  },

  // Authentication errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    category: 'authentication',
    severity: 'medium',
    httpStatus: 401,
    message: 'Authentication required',
    logLevel: 'info',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    category: 'authentication',
    severity: 'medium',
    httpStatus: 401,
    message: 'Invalid credentials',
    logLevel: 'warn',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    category: 'authentication',
    severity: 'medium',
    httpStatus: 401,
    message: 'Token has expired',
    logLevel: 'info',
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    category: 'authentication',
    severity: 'medium',
    httpStatus: 401,
    message: 'Invalid token',
    logLevel: 'warn',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    category: 'authentication',
    severity: 'medium',
    httpStatus: 401,
    message: 'Session has expired',
    logLevel: 'info',
  },

  // Authorization errors
  FORBIDDEN: {
    code: 'FORBIDDEN',
    category: 'authorization',
    severity: 'high',
    httpStatus: 403,
    message: 'Access forbidden',
    logLevel: 'warn',
  },
  INSUFFICIENT_PERMISSIONS: {
    code: 'INSUFFICIENT_PERMISSIONS',
    category: 'authorization',
    severity: 'high',
    httpStatus: 403,
    message: 'Insufficient permissions',
    logLevel: 'warn',
  },
  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    category: 'authorization',
    severity: 'high',
    httpStatus: 403,
    message: 'Access denied',
    logLevel: 'warn',
  },

  // Not found errors
  NOT_FOUND: {
    code: 'NOT_FOUND',
    category: 'not_found',
    severity: 'low',
    httpStatus: 404,
    message: 'Resource not found',
    logLevel: 'info',
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    category: 'not_found',
    severity: 'low',
    httpStatus: 404,
    message: 'Resource not found',
    logLevel: 'info',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    category: 'not_found',
    severity: 'low',
    httpStatus: 404,
    message: 'User not found',
    logLevel: 'info',
  },
  GAME_NOT_FOUND: {
    code: 'GAME_NOT_FOUND',
    category: 'not_found',
    severity: 'low',
    httpStatus: 404,
    message: 'Game not found',
    logLevel: 'info',
  },

  // Conflict errors
  CONFLICT: {
    code: 'CONFLICT',
    category: 'conflict',
    severity: 'medium',
    httpStatus: 409,
    message: 'Resource conflict',
    logLevel: 'warn',
  },
  DUPLICATE_RESOURCE: {
    code: 'DUPLICATE_RESOURCE',
    category: 'conflict',
    severity: 'medium',
    httpStatus: 409,
    message: 'Resource already exists',
    logLevel: 'warn',
  },
  ALREADY_EXISTS: {
    code: 'ALREADY_EXISTS',
    category: 'conflict',
    severity: 'medium',
    httpStatus: 409,
    message: 'Resource already exists',
    logLevel: 'warn',
  },

  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    category: 'rate_limit',
    severity: 'medium',
    httpStatus: 429,
    message: 'Rate limit exceeded',
    logLevel: 'warn',
  },
  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    category: 'rate_limit',
    severity: 'medium',
    httpStatus: 429,
    message: 'Too many requests',
    logLevel: 'warn',
  },

  // Internal errors
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    category: 'internal',
    severity: 'critical',
    httpStatus: 500,
    message: 'Internal server error',
    logLevel: 'error',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    category: 'database',
    severity: 'critical',
    httpStatus: 500,
    message: 'Database error',
    logLevel: 'error',
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    category: 'external',
    severity: 'high',
    httpStatus: 502,
    message: 'External service error',
    logLevel: 'error',
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    category: 'network',
    severity: 'high',
    httpStatus: 502,
    message: 'Network error',
    logLevel: 'error',
  },
  CONFIGURATION_ERROR: {
    code: 'CONFIGURATION_ERROR',
    category: 'configuration',
    severity: 'critical',
    httpStatus: 500,
    message: 'Configuration error',
    logLevel: 'error',
  },
  BUSINESS_LOGIC_ERROR: {
    code: 'BUSINESS_LOGIC_ERROR',
    category: 'business_logic',
    severity: 'medium',
    httpStatus: 422,
    message: 'Business logic error',
    logLevel: 'warn',
  },
};

// Error factory functions
export const createError = (
  code: ErrorCode,
  message?: string,
  context?: Partial<ErrorContext>,
  details?: Record<string, any>
): BaseError => {
  const mapping = ERROR_MAPPINGS[code];
  const timestamp = new Date().toISOString();

  return {
    code,
    message: message || mapping.message,
    category: mapping.category,
    severity: mapping.severity,
    timestamp,
    requestId: context?.requestId,
    path: context?.path,
    details,
  };
};

export const createApiErrorResponse = (
  code: ErrorCode,
  message?: string,
  context?: Partial<ErrorContext>,
  details?: Record<string, any>
): ApiErrorResponse => {
  const error = createError(code, message, context, details);

  return {
    success: false,
    error,
    metadata: {
      requestId: context?.requestId,
      timestamp: error.timestamp,
      path: context?.path,
      method: context?.method,
      userAgent: context?.userAgent,
      ip: context?.ip,
    },
  };
};

// tRPC error factory
export const createTRPCError = (
  code: ErrorCode,
  message?: string,
  context?: Partial<ErrorContext>,
  details?: Record<string, any>
): TRPCError => {
  const mapping = ERROR_MAPPINGS[code];
  const finalMessage = message || mapping.message;

  return new TRPCError({
    code: getTRPCCodeFromHttpStatus(mapping.httpStatus),
    message: finalMessage,
    cause: {
      code,
      category: mapping.category,
      severity: mapping.severity,
      httpStatus: mapping.httpStatus,
      timestamp: new Date().toISOString(),
      requestId: context?.requestId,
      path: context?.path,
      details,
    },
  });
};

// Convert Zod validation errors to our error format
export const createValidationError = (
  zodError: ZodError,
  context?: Partial<ErrorContext>
): TRPCError => {
  const message = zodError.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join('; ');

  return createTRPCError('VALIDATION_ERROR', message, context, {
    validationErrors: zodError.errors,
  });
};

// Utility functions
export const getErrorMapping = (code: ErrorCode): ErrorMapping => {
  return ERROR_MAPPINGS[code];
};

export const getErrorHttpStatus = (code: ErrorCode): number => {
  return ERROR_MAPPINGS[code].httpStatus;
};

export const getErrorSeverity = (code: ErrorCode): ErrorSeverity => {
  return ERROR_MAPPINGS[code].severity;
};

export const getErrorCategory = (code: ErrorCode): ErrorCategory => {
  return ERROR_MAPPINGS[code].category;
};

export const getErrorLogLevel = (code: ErrorCode): string => {
  return ERROR_MAPPINGS[code].logLevel;
};

// Convert HTTP status to tRPC error code
export const getTRPCCodeFromHttpStatus = (
  status: number
): TRPCError['code'] => {
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'UNPROCESSABLE_CONTENT';
      case 429:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'BAD_REQUEST';
    }
  }

  if (status >= 500) {
    return 'INTERNAL_SERVER_ERROR';
  }

  return 'BAD_REQUEST';
};

// Error sanitization for logging
export const sanitizeErrorForLogging = (error: any): Record<string, any> => {
  const sanitized: Record<string, any> = {
    message: error.message,
    code: error.code,
    stack: error.stack?.split('\n').slice(0, 10).join('\n'), // Limit stack trace
  };

  // Remove sensitive information
  if (error.details) {
    sanitized.details = { ...error.details };
    delete sanitized.details.password;
    delete sanitized.details.token;
    delete sanitized.details.secret;
  }

  return sanitized;
};

// Error context builder
export const buildErrorContext = (
  request: any,
  additionalContext?: Partial<ErrorContext>
): ErrorContext => {
  return {
    requestId: request.requestId,
    userId: request.user?.id,
    sessionId: request.sessionId,
    path: request.url,
    method: request.method,
    userAgent: request.headers?.['user-agent'],
    ip: request.ip,
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };
};
