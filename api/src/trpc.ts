import { initTRPC, TRPCError } from '@trpc/server';
import { FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { createErrorLogger } from './middleware/logger';
import {
  createTRPCError,
  createValidationError,
  buildErrorContext,
} from './lib/errorUtils';

export interface Context {
  req: FastifyRequest;
  requestId?: string;
}

const errorLogger = createErrorLogger();

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error, ctx }) {
    if (ctx?.req) {
      const context = buildErrorContext(ctx.req);

      // Log the error
      errorLogger.logError(error, context);

      // Enhanced error formatting with our error structure
      if (error instanceof TRPCError && error.cause) {
        return {
          ...shape,
          data: {
            ...shape.data,
            ...error.cause,
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        };
      }

      // Default error formatting
      return {
        ...shape,
        data: {
          ...shape.data,
          code: error.code,
          timestamp: new Date().toISOString(),
          requestId: context.requestId,
        },
      };
    }

    // Fallback when no context
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // TODO: Add authentication middleware here
  return next({ ctx });
});

// Error handling utilities for procedures
export const handleProcedureError = (
  error: unknown,
  context: Context
): never => {
  if (error instanceof ZodError) {
    throw createValidationError(error, buildErrorContext(context.req));
  }

  if (error instanceof TRPCError) {
    throw error;
  }

  if (error instanceof Error) {
    throw createTRPCError(
      'INTERNAL_SERVER_ERROR',
      error.message,
      buildErrorContext(context.req),
      { originalError: error.message }
    );
  }

  throw createTRPCError(
    'INTERNAL_SERVER_ERROR',
    'An unknown error occurred',
    buildErrorContext(context.req)
  );
};

// Export types for use in routers
export type { Context as TRPCContext };
