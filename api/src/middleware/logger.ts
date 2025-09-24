import { FastifyRequest, FastifyReply } from 'fastify';
import { TRPCError } from '@trpc/server';
import { getErrorMapping } from '../lib/errorUtils';
import { logRequest, logResponse, logError, logger } from '../lib/logger';
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

    // Log request using Pino
    logRequest(logger, {
      method: request.method,
      url: request.url,
      headers: request.headers as Record<string, string>,
      query: request.query as Record<string, any>,
      params: request.params as Record<string, any>,
      body: request.body,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      requestId,
    });

    // Log response when request completes
    reply.raw.on('finish', () => {
      const responseTime = Date.now() - startTime;

      // Log response using Pino
      logResponse(logger, {
        statusCode: reply.statusCode,
        responseTime,
        headers: reply.getHeaders() as Record<string, string>,
        requestId,
      });
    });

    done();
  };
};

export const createErrorLogger = () => {
  return {
    logError: (error: Error | TRPCError, context: ErrorContext) => {
      if (error instanceof TRPCError) {
        const errorCode = getErrorCodeFromTRPCError(error);
        const mapping = getErrorMapping(errorCode as any);

        // Log error using Pino
        logError(logger, {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack || undefined,
            code: errorCode,
            statusCode: mapping.httpStatus,
          },
          request: {
            method: context.method || 'unknown',
            url: context.path || 'unknown',
            headers: { 'user-agent': context.userAgent || 'unknown' },
            query: {},
            params: {},
            ip: context.ip || 'unknown',
            requestId: context.requestId,
          },
          context: {
            ...context,
            errorCategory: mapping.category,
            errorSeverity: mapping.severity,
          },
        });
      } else {
        // Generic error logging using Pino
        logError(logger, {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack || undefined,
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: 500,
          },
          request: {
            method: context.method || 'unknown',
            url: context.path || 'unknown',
            headers: { 'user-agent': context.userAgent || 'unknown' },
            query: {},
            params: {},
            ip: context.ip || 'unknown',
            requestId: context.requestId,
          },
          context: {
            ...context,
            errorCategory: 'internal',
            errorSeverity: 'critical',
          },
        });
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
