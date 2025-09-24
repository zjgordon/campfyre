import { router, publicProcedure } from '../../trpc';
import { authRouter } from '../auth';
import { gamesRouter } from '../games';
import { usersRouter } from '../users';

// Health router for v1
export const healthRouter = router({
  check: publicProcedure.query(() => {
    return {
      ok: true,
      service: 'api',
      version: 'v1',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }),
  ping: publicProcedure.query(() => {
    return {
      ok: true,
      msg: 'pong',
      version: 'v1',
    };
  }),
});

// Root router for v1
export const rootRouter = router({
  info: publicProcedure.query(() => {
    return {
      message: 'Campfyre API',
      version: 'v1.0.0',
      status: 'running',
      apiVersion: 'v1',
    };
  }),
});

// V1 API router - contains all existing functionality
export const v1Router = router({
  auth: authRouter,
  games: gamesRouter,
  users: usersRouter,
  health: healthRouter,
  root: rootRouter,
});

export type V1Router = typeof v1Router;
