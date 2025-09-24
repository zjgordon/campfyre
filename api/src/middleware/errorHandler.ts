import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import {
  createApiErrorResponse,
  buildErrorContext,
  sanitizeErrorForLogging,
} from '../lib/errorUtils';
import type { ApiErrorResponse } from '../types/errors';

export const createErrorHandler = () => {
  return (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ): void => {
    const context = buildErrorContext(request);

    // Handle tRPC errors
    if (error instanceof TRPCError) {
      const errorResponse = handleTRPCError(error, context);
      reply.status(getStatusCodeFromTRPCError(error)).send(errorResponse);
      return;
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorResponse = createApiErrorResponse(
        'VALIDATION_ERROR',
        'Validation failed',
        context,
        { validationErrors: error.errors }
      );
      reply.status(400).send(errorResponse);
      return;
    }

    // Handle Fastify validation errors
    if (error.validation) {
      const errorResponse = createApiErrorResponse(
        'VALIDATION_ERROR',
        'Validation failed',
        context,
        { validationErrors: error.validation }
      );
      reply.status(400).send(errorResponse);
      return;
    }

    // Handle other Fastify errors
    const statusCode = error.statusCode || 500;
    const errorCode = getErrorCodeFromStatus(statusCode) as any;
    const errorResponse = createApiErrorResponse(
      errorCode,
      error.message || 'Internal server error',
      context,
      { originalError: sanitizeErrorForLogging(error) }
    );

    reply.status(statusCode).send(errorResponse);
  };
};

const handleTRPCError = (error: TRPCError, context: any): ApiErrorResponse => {
  const errorCode = getErrorCodeFromTRPCError(error) as any;

  return createApiErrorResponse(errorCode, error.message, context, {
    trpcCode: error.code,
    cause: error.cause ? sanitizeErrorForLogging(error.cause) : undefined,
  });
};

const getStatusCodeFromTRPCError = (error: TRPCError): number => {
  switch (error.code) {
    case 'BAD_REQUEST':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'METHOD_NOT_SUPPORTED':
      return 405;
    case 'TIMEOUT':
      return 408;
    case 'CONFLICT':
      return 409;
    case 'PRECONDITION_FAILED':
      return 412;
    case 'PAYLOAD_TOO_LARGE':
      return 413;
    case 'UNPROCESSABLE_CONTENT':
      return 422;
    case 'TOO_MANY_REQUESTS':
      return 429;
    case 'CLIENT_CLOSED_REQUEST':
      return 499;
    case 'INTERNAL_SERVER_ERROR':
    default:
      return 500;
  }
};

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

const getErrorCodeFromStatus = (status: number): string => {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'BUSINESS_LOGIC_ERROR';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 500:
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
};
