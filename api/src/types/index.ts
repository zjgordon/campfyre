// Shared types
export * from './shared';

// User types
export * from './user';

// Game types
export * from './game';

// API types
export * from './api';

// Re-export commonly used types for convenience
export type {
  BaseResponse,
  SuccessResponse,
  ErrorResponse,
  Pagination,
  PaginatedResponse,
  QueryParams,
  Id,
  TimestampFields,
} from './shared';

export type {
  User,
  BaseUser,
  UserProfile,
  UserStatus,
  UserRole,
  CreateUser,
  UpdateUser,
  LoginUser,
  RegisterUser,
  AuthToken,
  UserSession,
} from './user';

export type {
  Game,
  BaseGame,
  GameStatus,
  GameType,
  GameDifficulty,
  CreateGame,
  UpdateGame,
  JoinGame,
  LeaveGame,
  GamePlayer,
  GameWithPlayers,
  GameFilters,
} from './game';

export type {
  ApiVersion,
  HealthCheck,
  PingResponse,
  ApiInfo,
  UserResponse,
  UserProfileResponse,
  UserSessionResponse,
  UsersResponse,
  GameResponse,
  GameWithPlayersResponse,
  GamesResponse,
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  ApiResponse,
  ApiError,
  TRPCProcedure,
} from './api';
