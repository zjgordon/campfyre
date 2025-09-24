import { router, publicProcedure } from '../trpc';
import { authRouter } from './auth';
import { gamesRouter } from './games';
import { usersRouter } from './users';
import { v1Router } from './v1';
import { v2Router } from './v2';
import { healthRouter } from './health';

// Legacy health router (keeping existing functionality for backward compatibility)
export const legacyHealthRouter = router({
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

// Root router (keeping existing functionality for backward compatibility)
export const rootRouter = router({
  info: publicProcedure.query(() => {
    return {
      message: 'Campfyre API',
      version: '0.1.0',
      status: 'running',
    };
  }),
});

// Versioned API router
export const versionedRouter = router({
  v1: v1Router,
  v2: v2Router,
});

// Main app router composition with versioning support
export const appRouter = router({
  // Versioned routes
  v1: v1Router,
  v2: v2Router,
  // Enhanced health routes
  health: healthRouter,
  // Legacy routes for backward compatibility
  auth: authRouter,
  games: gamesRouter,
  users: usersRouter,
  legacyHealth: legacyHealthRouter,
  root: rootRouter,
});

export type AppRouter = typeof appRouter;
