import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

export const createServer = async () => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register security middleware
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // Register CORS middleware
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  return fastify;
};

export default createServer;
