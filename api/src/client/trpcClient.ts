import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '../routers';
import type { CreateTRPCClientOptions } from '@trpc/client';

// Client configuration options
export interface TRPCClientConfig {
  url?: string;
  headers?: Record<string, string>;
  batch?: boolean;
  maxURLLength?: number;
  enableLogging?: boolean;
}

// Default configuration
const defaultConfig: Required<TRPCClientConfig> = {
  url: '/trpc',
  headers: {
    'Content-Type': 'application/json',
  },
  batch: true,
  maxURLLength: 2083,
  enableLogging: process.env.NODE_ENV === 'development',
};

// Create tRPC client factory
export const createTRPCClient = (config: TRPCClientConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  const clientOptions: CreateTRPCClientOptions<AppRouter> = {
    links: [
      // Logger link for development
      ...(finalConfig.enableLogging
        ? [
            loggerLink({
              enabled: (opts) =>
                (opts.direction === 'down' && opts.result instanceof Error) ||
                opts.direction === 'up',
            }),
          ]
        : []),

      // HTTP batch link
      httpBatchLink({
        url: finalConfig.url,
        headers: finalConfig.headers,
        maxURLLength: finalConfig.maxURLLength,
      }),
    ],
  };

  return createTRPCProxyClient<AppRouter>(clientOptions);
};

// Default client instance
export const trpcClient = createTRPCClient();

// Client with authentication headers
export const createAuthenticatedTRPCClient = (
  token: string,
  config: TRPCClientConfig = {}
) => {
  return createTRPCClient({
    ...config,
    headers: {
      ...defaultConfig.headers,
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// Client for server-side rendering (SSR)
export const createSSRTRPCClient = (config: TRPCClientConfig = {}) => {
  return createTRPCClient({
    ...config,
    url: config.url || 'http://localhost:3000/trpc',
    headers: {
      ...defaultConfig.headers,
      ...config.headers,
    },
  });
};

// Export types for client usage
export type TRPCClient = ReturnType<typeof createTRPCClient>;
export type AuthenticatedTRPCClient = ReturnType<
  typeof createAuthenticatedTRPCClient
>;
export type SSRTRPCClient = ReturnType<typeof createSSRTRPCClient>;
