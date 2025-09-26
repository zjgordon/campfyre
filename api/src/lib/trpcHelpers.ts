/**
 * tRPC helper utilities for Prisma integration
 * Provides type-safe database operations and error handling
 */

import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../config/database';
import { handleProcedureError } from '../trpc';

/**
 * Get Prisma client instance
 */
export function getPrismaClientForTRPC() {
  return getPrismaClient();
}

/**
 * Handle Prisma errors and convert to tRPC errors
 */
export function handlePrismaError(
  error: unknown,
  context: { req: any; requestId?: string | undefined }
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A record with this information already exists',
          cause: {
            code: 'DUPLICATE_RECORD',
            field: error.meta?.target,
            details: error.message,
          },
        });
      case 'P2025':
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
          cause: {
            code: 'RECORD_NOT_FOUND',
            details: error.message,
          },
        });
      case 'P2003':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Foreign key constraint failed',
          cause: {
            code: 'FOREIGN_KEY_CONSTRAINT',
            field: error.meta?.field_name,
            details: error.message,
          },
        });
      case 'P2014':
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid relation operation',
          cause: {
            code: 'INVALID_RELATION',
            details: error.message,
          },
        });
      default:
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database operation failed',
          cause: {
            code: 'DATABASE_ERROR',
            prismaCode: error.code,
            details: error.message,
          },
        });
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unknown database error',
      cause: {
        code: 'UNKNOWN_DATABASE_ERROR',
        details: error.message,
      },
    });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database connection error',
      cause: {
        code: 'DATABASE_CONNECTION_ERROR',
        details: error.message,
      },
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database initialization error',
      cause: {
        code: 'DATABASE_INITIALIZATION_ERROR',
        details: error.message,
      },
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid database query',
      cause: {
        code: 'VALIDATION_ERROR',
        details: error.message,
      },
    });
  }

  // Fallback to generic error handling
  return handleProcedureError(error, context as any);
}

/**
 * Execute a Prisma operation with error handling
 */
export async function executePrismaOperation<T>(
  operation: () => Promise<T>,
  context: { req: any; requestId?: string | undefined }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handlePrismaError(error, context);
  }
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Validate and sanitize pagination parameters
 */
export function validatePaginationParams(input: {
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, input.page || 1);
  const limit = Math.min(100, Math.max(1, input.limit || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Operation successful'
) {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  code: string = 'OPERATION_FAILED'
) {
  return {
    success: false,
    message,
    code,
  };
}

/**
 * Type-safe Prisma select helper
 */
export function createSelectFields<T extends Record<string, any>>(
  fields: T
): T {
  return fields;
}

/**
 * Common Prisma include patterns
 */
export const commonIncludes = {
  user: {
    include: {
      _count: {
        select: {
          campaigns: true,
          characters: true,
          gameSessions: true,
        },
      },
    },
  },
  campaign: {
    include: {
      owner: true,
      gameSystem: true,
      members: {
        include: {
          user: true,
        },
      },
      characters: true,
      gameSessions: {
        take: 5,
        orderBy: {
          scheduledAt: 'desc',
        },
      },
      _count: {
        select: {
          members: true,
          characters: true,
          gameSessions: true,
        },
      },
    },
  },
  gameSession: {
    include: {
      campaign: {
        include: {
          owner: true,
          gameSystem: true,
        },
      },
      gm: true,
      characters: {
        include: {
          character: true,
        },
      },
      messages: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
        },
      },
      _count: {
        select: {
          characters: true,
          messages: true,
        },
      },
    },
  },
  character: {
    include: {
      owner: true,
      campaign: {
        include: {
          owner: true,
          gameSystem: true,
        },
      },
    },
  },
} as const;

/**
 * Database transaction helper
 */
export async function withTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  context: { req: any; requestId?: string | undefined }
): Promise<T> {
  const prisma = getPrismaClientForTRPC();

  return executePrismaOperation(() => prisma.$transaction(operation), context);
}

/**
 * Batch operation helper
 */
export async function executeBatchOperation<T>(
  operations: Array<() => Promise<T>>,
  context: { req: any; requestId?: string | undefined }
): Promise<T[]> {
  return executePrismaOperation(async () => {
    const results = await Promise.allSettled(operations.map((op) => op()));

    const errors = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )
      .map((result) => result.reason);

    if (errors.length > 0) {
      throw new Error(
        `Batch operation failed: ${errors.length} operations failed`
      );
    }

    return results
      .filter(
        (result): result is PromiseFulfilledResult<Awaited<T>> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }, context);
}
