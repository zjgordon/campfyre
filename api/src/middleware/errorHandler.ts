import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { TRPCError } from '@trpc/server';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
  };
}

export const createErrorHandler = () => {
  return (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ): void => {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Handle tRPC errors
    if (error instanceof TRPCError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          statusCode: getStatusCodeFromTRPCError(error),
          timestamp,
          path,
        },
      };

      reply.status(getStatusCodeFromTRPCError(error)).send(errorResponse);
      return;
    }

    // Handle validation errors
    if (error.validation) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          statusCode: 400,
          timestamp,
          path,
        },
      };

      reply.status(400).send(errorResponse);
      return;
    }

    // Handle other Fastify errors
    const statusCode = error.statusCode || 500;
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Internal server error',
        statusCode,
        timestamp,
        path,
      },
    };

    reply.status(statusCode).send(errorResponse);
  };
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
