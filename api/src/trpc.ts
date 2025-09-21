import { initTRPC } from '@trpc/server';
import { FastifyRequest } from 'fastify';

export interface Context {
  req: FastifyRequest;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Health router
export const healthRouter = router({
  check: publicProcedure.query(() => {
    return {
      ok: true,
      service: 'api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }),
  ping: publicProcedure.query(() => {
    return {
      ok: true,
      msg: 'pong',
    };
  }),
});

// Root router
export const rootRouter = router({
  info: publicProcedure.query(() => {
    return {
      message: 'Campfyre API',
      version: '0.1.0',
      status: 'running',
    };
  }),
});

// Main app router
export const appRouter = router({
  health: healthRouter,
  root: rootRouter,
});

export type AppRouter = typeof appRouter;
