import { z } from 'zod';

// Error severity levels
export const ErrorSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;

// Error categories
export const ErrorCategorySchema = z.enum([
  'validation',
  'authentication',
  'authorization',
  'not_found',
  'conflict',
  'rate_limit',
  'internal',
  'external',
  'database',
  'network',
  'configuration',
  'business_logic',
]);

export type ErrorCategory = z.infer<typeof ErrorCategorySchema>;

// Error codes mapping
export const ErrorCodeSchema = z.enum([
  // Validation errors
  'VALIDATION_ERROR',
  'INVALID_INPUT',
  'MISSING_REQUIRED_FIELD',
  'INVALID_FORMAT',

  // Authentication errors
  'UNAUTHORIZED',
  'INVALID_CREDENTIALS',
  'TOKEN_EXPIRED',
  'TOKEN_INVALID',
  'SESSION_EXPIRED',

  // Authorization errors
  'FORBIDDEN',
  'INSUFFICIENT_PERMISSIONS',
  'ACCESS_DENIED',

  // Not found errors
  'NOT_FOUND',
  'RESOURCE_NOT_FOUND',
  'USER_NOT_FOUND',
  'GAME_NOT_FOUND',

  // Conflict errors
  'CONFLICT',
  'DUPLICATE_RESOURCE',
  'ALREADY_EXISTS',

  // Rate limiting errors
  'RATE_LIMIT_EXCEEDED',
  'TOO_MANY_REQUESTS',

  // Internal errors
  'INTERNAL_SERVER_ERROR',
  'DATABASE_ERROR',
  'EXTERNAL_SERVICE_ERROR',
  'NETWORK_ERROR',
  'CONFIGURATION_ERROR',
  'BUSINESS_LOGIC_ERROR',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

// Base error structure
export const BaseErrorSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  category: ErrorCategorySchema,
  severity: ErrorSeveritySchema,
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
  path: z.string().optional(),
  details: z.record(z.any()).optional(),
  stack: z.string().optional(),
});

export type BaseError = z.infer<typeof BaseErrorSchema>;

// API error response structure
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema,
  metadata: z
    .object({
      requestId: z.string().optional(),
      timestamp: z.string().datetime(),
      path: z.string().optional(),
      method: z.string().optional(),
      userAgent: z.string().optional(),
      ip: z.string().optional(),
    })
    .optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// tRPC error structure
export const TRPCErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.number(),
    data: z.object({
      code: ErrorCodeSchema,
      category: ErrorCategorySchema,
      severity: ErrorSeveritySchema,
      httpStatus: z.number(),
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
      path: z.string().optional(),
      details: z.record(z.any()).optional(),
    }),
  }),
});

export type TRPCErrorResponse = z.infer<typeof TRPCErrorResponseSchema>;

// Error mapping configuration
export const ErrorMappingSchema = z.object({
  code: ErrorCodeSchema,
  category: ErrorCategorySchema,
  severity: ErrorSeveritySchema,
  httpStatus: z.number().min(100).max(599),
  message: z.string(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
});

export type ErrorMapping = z.infer<typeof ErrorMappingSchema>;

// Error context for logging
export const ErrorContextSchema = z.object({
  requestId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  timestamp: z.string().datetime(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ErrorContext = z.infer<typeof ErrorContextSchema>;

// Error monitoring configuration
export const ErrorMonitoringConfigSchema = z.object({
  enableLogging: z.boolean().default(true),
  enableMetrics: z.boolean().default(true),
  enableTracing: z.boolean().default(true),
  logLevel: z
    .enum(['debug', 'info', 'warn', 'error', 'fatal'])
    .default('error'),
  maxStackTrace: z.number().default(5),
  sanitizeData: z.boolean().default(true),
});

export type ErrorMonitoringConfig = z.infer<typeof ErrorMonitoringConfigSchema>;

// Error statistics
export const ErrorStatsSchema = z.object({
  totalErrors: z.number().min(0),
  errorsByCategory: z.record(z.number().min(0)),
  errorsBySeverity: z.record(z.number().min(0)),
  errorsByCode: z.record(z.number().min(0)),
  lastError: z.string().datetime().optional(),
  errorRate: z.number().min(0).max(1),
});

export type ErrorStats = z.infer<typeof ErrorStatsSchema>;
