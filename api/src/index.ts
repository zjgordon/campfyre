import { createServer } from './server';
import { appRouter } from './routers';
import { Context } from './trpc';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyRequest } from 'fastify';
import { createVersionHandler } from './middleware/versionHandler';
import {
  createHealthMonitor,
  createResponseTimeHook,
} from './middleware/healthMonitor';

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

async function start() {
  const fastify = await createServer();

  // Register version handler middleware
  fastify.addHook('preHandler', createVersionHandler());

  // Register health monitoring middleware
  fastify.addHook('preHandler', createHealthMonitor());

  // Register response time tracking hook
  fastify.addHook('onSend', createResponseTimeHook());

  // Register tRPC with versioning support
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: ({ req }: { req: FastifyRequest }): Context => ({
        req,
        requestId: (req as any).requestId,
      }),
    },
  });

  // Enhanced REST health endpoints
  fastify.get('/health', async () => {
    const { performHealthCheck } = await import('./lib/healthChecks');
    const healthStatus = await performHealthCheck({
      checkDatabase: true,
      checkRedis: true,
      checkDisk: false,
    });

    return {
      ok: healthStatus.status === 'healthy',
      service: 'api',
      timestamp: healthStatus.timestamp,
      uptime: healthStatus.uptime,
      status: healthStatus.status,
      checks: healthStatus.checks,
    };
  });

  fastify.get('/health/ready', async () => {
    const { performHealthCheck } = await import('./lib/healthChecks');
    const healthStatus = await performHealthCheck({
      checkDatabase: true,
      checkRedis: true,
      checkDisk: false,
    });

    return {
      ready: healthStatus.status === 'healthy',
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
    };
  });

  fastify.get('/health/live', async () => {
    const { performHealthCheck } = await import('./lib/healthChecks');
    const healthStatus = await performHealthCheck({
      checkDatabase: false,
      checkRedis: false,
      checkDisk: false,
    });

    return {
      alive: healthStatus.status !== 'unhealthy',
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      uptime: healthStatus.uptime,
    };
  });

  fastify.get('/ping', async () => {
    return {
      ok: true,
      msg: 'pong',
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/', async () => {
    return {
      message: 'Campfyre API',
      version: '0.1.0',
      status: 'running',
    };
  });

  try {
    await fastify.listen({ port, host });
    console.log(`API server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
// Test comment
