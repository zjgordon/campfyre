import { initTRPC } from '@trpc/server';
import { FastifyRequest } from 'fastify';
import { createTRPCLogger } from './middleware/logger';

export interface Context {
  req: FastifyRequest;
  requestId?: string;
}

const logger = createTRPCLogger();

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    logger.error('tRPC Error', { error: error.message, code: error.code });

    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
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

// Export types for use in routers
export type { Context as TRPCContext };
