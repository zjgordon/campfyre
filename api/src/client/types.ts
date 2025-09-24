import type { AppRouter } from '../routers';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Infer input types from router
export type RouterInputs = inferRouterInputs<AppRouter>;

// Infer output types from router
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific input types for common operations
export type AuthLoginInput = RouterInputs['auth']['login'];
export type AuthRegisterInput = RouterInputs['auth']['register'];
export type AuthLogoutInput = RouterInputs['auth']['logout'];

export type UserGetInput = RouterInputs['users']['get'];
export type UserListInput = RouterInputs['users']['list'];
export type UserCreateInput = RouterInputs['users']['create'];
export type UserUpdateInput = RouterInputs['users']['update'];
export type UserDeleteInput = RouterInputs['users']['delete'];

export type GameGetInput = RouterInputs['games']['get'];
export type GameListInput = RouterInputs['games']['list'];
export type GameCreateInput = RouterInputs['games']['create'];
export type GameUpdateInput = RouterInputs['games']['update'];
export type GameDeleteInput = RouterInputs['games']['delete'];

// Specific output types for common operations
export type AuthLoginOutput = RouterOutputs['auth']['login'];
export type AuthRegisterOutput = RouterOutputs['auth']['register'];
export type AuthLogoutOutput = RouterOutputs['auth']['logout'];
export type AuthMeOutput = RouterOutputs['auth']['me'];

export type UserGetOutput = RouterOutputs['users']['get'];
export type UserListOutput = RouterOutputs['users']['list'];
export type UserCreateOutput = RouterOutputs['users']['create'];
export type UserUpdateOutput = RouterOutputs['users']['update'];
export type UserDeleteOutput = RouterOutputs['users']['delete'];

export type GameGetOutput = RouterOutputs['games']['get'];
export type GameListOutput = RouterOutputs['games']['list'];
export type GameCreateOutput = RouterOutputs['games']['create'];
export type GameUpdateOutput = RouterOutputs['games']['update'];
export type GameDeleteOutput = RouterOutputs['games']['delete'];

export type HealthCheckOutput = RouterOutputs['health']['check'];
export type HealthPingOutput = RouterOutputs['health']['ping'];
export type RootInfoOutput = RouterOutputs['root']['info'];

// Client error types
export interface TRPCClientError {
  message: string;
  code: string;
  data?: {
    code: string;
    httpStatus: number;
    path?: string;
    stack?: string;
  };
}

// Client configuration types
export interface ClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Query options for client usage
export interface QueryOptions<TInput> {
  input?: TInput;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
}

// Mutation options for client usage
export interface MutationOptions<TInput, TOutput> {
  onSuccess?: (data: TOutput, variables: TInput) => void;
  onError?: (error: TRPCClientError, variables: TInput) => void;
  onSettled?: (
    data: TOutput | undefined,
    error: TRPCClientError | null,
    variables: TInput
  ) => void;
}

// Client hooks types (for future React integration)
export interface UseQueryOptions<TInput, TOutput> extends QueryOptions<TInput> {
  select?: (data: TOutput) => any;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TRPCClientError) => void;
}

export interface UseMutationOptions<TInput, TOutput>
  extends MutationOptions<TInput, TOutput> {
  onMutate?: (variables: TInput) => void;
}

// Utility types for client usage
export type ClientProcedure = keyof AppRouter;
export type ClientRouter = AppRouter;

// Type helpers for extracting procedure types
export type ExtractProcedureInput<TProcedure extends ClientProcedure> =
  TProcedure extends `${infer TRouter}.${infer TProcedureName}`
    ? TRouter extends keyof AppRouter
      ? TProcedureName extends keyof AppRouter[TRouter]
        ? AppRouter[TRouter][TProcedureName] extends {
            _def: { input: infer TInput };
          }
          ? TInput
          : never
        : never
      : never
    : never;

export type ExtractProcedureOutput<TProcedure extends ClientProcedure> =
  TProcedure extends `${infer TRouter}.${infer TProcedureName}`
    ? TRouter extends keyof AppRouter
      ? TProcedureName extends keyof AppRouter[TRouter]
        ? AppRouter[TRouter][TProcedureName] extends {
            _def: { output: infer TOutput };
          }
          ? TOutput
          : never
        : never
      : never
    : never;
