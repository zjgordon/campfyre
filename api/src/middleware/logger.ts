import { FastifyRequest, FastifyReply } from 'fastify';
import { TRPCError } from '@trpc/server';
import { getErrorMapping, sanitizeErrorForLogging } from '../lib/errorUtils';
import type { ErrorContext, ErrorSeverity } from '../types/errors';

export interface RequestLogData {
  method: string;
  url: string;
  userAgent?: string | undefined;
  ip?: string | undefined;
  requestId?: string | undefined;
  timestamp: string;
}

export interface ResponseLogData {
  statusCode: number;
  responseTime: number;
  requestId?: string | undefined;
  timestamp: string;
}

export interface ErrorLogData {
  error: {
    code: string;
    message: string;
    category: string;
    severity: ErrorSeverity;
    statusCode: number;
    requestId?: string | undefined;
    path?: string | undefined;
    details?: Record<string, any> | undefined;
  };
  context: ErrorContext;
  timestamp: string;
}

export const createRequestLogger = () => {
  return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    const startTime = Date.now();
    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add request ID to request object for use in other middleware
    (request as any).requestId = requestId;

    const logData: RequestLogData = {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      requestId,
      timestamp: new Date().toISOString(),
    };

    request.log.info(logData, 'Incoming request');

    // Log response when request completes
    reply.raw.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const responseLogData: ResponseLogData = {
        statusCode: reply.statusCode,
        responseTime,
        requestId,
        timestamp: new Date().toISOString(),
      };

      // Log error responses with more detail
      if (reply.statusCode >= 400) {
        request.log.warn(responseLogData, 'Request completed with error');
      } else {
        request.log.info(responseLogData, 'Request completed');
      }
    });

    done();
  };
};

export const createErrorLogger = () => {
  return {
    logError: (error: Error | TRPCError, context: ErrorContext) => {
      const timestamp = new Date().toISOString();

      if (error instanceof TRPCError) {
        const errorCode = getErrorCodeFromTRPCError(error);
        const mapping = getErrorMapping(errorCode as any);

        const errorLogData: ErrorLogData = {
          error: {
            code: errorCode,
            message: error.message,
            category: mapping.category,
            severity: mapping.severity,
            statusCode: mapping.httpStatus,
            requestId: context.requestId || undefined,
            path: context.path || undefined,
            details: error.cause
              ? sanitizeErrorForLogging(error.cause)
              : undefined,
          },
          context,
          timestamp,
        };

        // Log based on severity
        switch (mapping.severity) {
          case 'critical':
            console.error(
              '[ERROR] Critical error occurred:',
              JSON.stringify(errorLogData, null, 2)
            );
            break;
          case 'high':
            console.error(
              '[ERROR] High severity error:',
              JSON.stringify(errorLogData, null, 2)
            );
            break;
          case 'medium':
            console.warn(
              '[WARN] Medium severity error:',
              JSON.stringify(errorLogData, null, 2)
            );
            break;
          case 'low':
            console.info(
              '[INFO] Low severity error:',
              JSON.stringify(errorLogData, null, 2)
            );
            break;
        }
      } else {
        // Generic error logging
        const errorLogData: ErrorLogData = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            category: 'internal',
            severity: 'critical',
            statusCode: 500,
            requestId: context.requestId || undefined,
            path: context.path || undefined,
            details: sanitizeErrorForLogging(error),
          },
          context,
          timestamp,
        };

        console.error(
          '[ERROR] Unhandled error:',
          JSON.stringify(errorLogData, null, 2)
        );
      }
    },
  };
};

export const createTRPCLogger = () => {
  return {
    log: (level: string, message: string, data?: any) => {
      console.log(
        `[tRPC ${level.toUpperCase()}] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    error: (message: string, data?: any) => {
      console.error(
        `[tRPC ERROR] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    warn: (message: string, data?: any) => {
      console.warn(
        `[tRPC WARN] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    info: (message: string, data?: any) => {
      console.info(
        `[tRPC INFO] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    debug: (message: string, data?: any) => {
      console.debug(
        `[tRPC DEBUG] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
  };
};

// Helper function to get error code from tRPC error
const getErrorCodeFromTRPCError = (error: TRPCError): string => {
  // Check if error has custom cause data with our error code
  if (error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
    return error.cause.code as string;
  }

  // Map tRPC error codes to our error codes
  switch (error.code) {
    case 'BAD_REQUEST':
      return 'VALIDATION_ERROR';
    case 'UNAUTHORIZED':
      return 'UNAUTHORIZED';
    case 'FORBIDDEN':
      return 'FORBIDDEN';
    case 'NOT_FOUND':
      return 'NOT_FOUND';
    case 'CONFLICT':
      return 'CONFLICT';
    case 'UNPROCESSABLE_CONTENT':
      return 'BUSINESS_LOGIC_ERROR';
    case 'TOO_MANY_REQUESTS':
      return 'RATE_LIMIT_EXCEEDED';
    case 'INTERNAL_SERVER_ERROR':
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
};
