import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createErrorHandler } from './middleware/errorHandler';
import { createRequestLogger } from './middleware/logger';

export const createServer = async () => {
  const loggerConfig =
    process.env.NODE_ENV === 'development'
      ? {
          level: process.env.LOG_LEVEL || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : {
          level: process.env.LOG_LEVEL || 'info',
        };

  const fastify = Fastify({
    logger: loggerConfig,
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

  // Register request logging middleware
  fastify.addHook('preHandler', createRequestLogger());

  // Register error handler
  fastify.setErrorHandler(createErrorHandler());

  return fastify;
};

export default createServer;
