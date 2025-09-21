import { FastifyInstance } from 'fastify';

export const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

export const registerCors = async (fastify: FastifyInstance) => {
  await fastify.register(require('@fastify/cors'), corsOptions);
};
