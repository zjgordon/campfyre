import { router, publicProcedure } from '../../trpc';
import { authRouter } from '../auth';
import { gamesRouter } from '../games';
import { usersRouter } from '../users';

// Health router for v2 with enhanced response
export const healthRouter = router({
  check: publicProcedure.query(() => {
    return {
      ok: true,
      service: 'api',
      version: 'v2',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      features: {
        versioning: true,
        enhancedLogging: true,
      },
    };
  }),
  ping: publicProcedure.query(() => {
    return {
      ok: true,
      msg: 'pong',
      version: 'v2',
      timestamp: new Date().toISOString(),
    };
  }),
  status: publicProcedure.query(() => {
    return {
      status: 'healthy',
      version: 'v2',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }),
});

// Root router for v2 with enhanced info
export const rootRouter = router({
  info: publicProcedure.query(() => {
    return {
      message: 'Campfyre API',
      version: 'v2.0.0',
      status: 'running',
      apiVersion: 'v2',
      features: {
        versioning: true,
        enhancedErrorHandling: true,
        requestLogging: true,
      },
      supportedVersions: ['v1', 'v2'],
      defaultVersion: 'v1',
    };
  }),
  versions: publicProcedure.query(() => {
    return {
      supported: ['v1', 'v2'],
      current: 'v2',
      default: 'v1',
      deprecated: [],
    };
  }),
});

// V2 API router - enhanced version with future improvements
export const v2Router = router({
  auth: authRouter,
  games: gamesRouter,
  users: usersRouter,
  health: healthRouter,
  root: rootRouter,
});

export type V2Router = typeof v2Router;
