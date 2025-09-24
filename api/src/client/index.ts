// tRPC client exports
export * from './trpcClient';
export * from './types';

// Re-export commonly used client utilities
export {
  createTRPCClient,
  createAuthenticatedTRPCClient,
  createSSRTRPCClient,
  trpcClient,
} from './trpcClient';

// Re-export commonly used types
export type {
  TRPCClient,
  AuthenticatedTRPCClient,
  SSRTRPCClient,
  TRPCClientConfig,
} from './trpcClient';

export type {
  RouterInputs,
  RouterOutputs,
  AuthLoginInput,
  AuthRegisterInput,
  AuthLogoutInput,
  UserGetInput,
  UserListInput,
  UserCreateInput,
  UserUpdateInput,
  UserDeleteInput,
  GameGetInput,
  GameListInput,
  GameCreateInput,
  GameUpdateInput,
  GameDeleteInput,
  AuthLoginOutput,
  AuthRegisterOutput,
  AuthLogoutOutput,
  AuthMeOutput,
  UserGetOutput,
  UserListOutput,
  UserCreateOutput,
  UserUpdateOutput,
  UserDeleteOutput,
  GameGetOutput,
  GameListOutput,
  GameCreateOutput,
  GameUpdateOutput,
  GameDeleteOutput,
  HealthCheckOutput,
  HealthPingOutput,
  RootInfoOutput,
  TRPCClientError,
  ClientConfig,
  QueryOptions,
  MutationOptions,
  UseQueryOptions,
  UseMutationOptions,
  ClientProcedure,
  ClientRouter,
} from './types';

// Default client instance for immediate use
export { trpcClient as client } from './trpcClient';
