import { createServer } from './server';
import { appRouter, Context } from './trpc';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyRequest } from 'fastify';

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

async function start() {
  const fastify = await createServer();

  // Register tRPC
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: ({ req }: { req: FastifyRequest }): Context => ({ req }),
    },
  });

  // Legacy REST endpoints for compatibility
  fastify.get('/health', async () => {
    return {
      ok: true,
      service: 'api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  fastify.get('/ping', async () => {
    return {
      ok: true,
      msg: 'pong',
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
