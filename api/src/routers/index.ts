import { router, publicProcedure } from '../trpc';
import { authRouter } from './auth';
import { gamesRouter } from './games';
import { usersRouter } from './users';

// Health router (keeping existing functionality)
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

// Root router (keeping existing functionality)
export const rootRouter = router({
  info: publicProcedure.query(() => {
    return {
      message: 'Campfyre API',
      version: '0.1.0',
      status: 'running',
    };
  }),
});

// Main app router composition
export const appRouter = router({
  auth: authRouter,
  games: gamesRouter,
  users: usersRouter,
  health: healthRouter,
  root: rootRouter,
});

export type AppRouter = typeof appRouter;
