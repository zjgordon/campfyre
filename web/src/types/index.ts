/* eslint-disable no-unused-vars */
/**
 * Types Package Index
 *
 * Central export point for all shared types.
 * This provides a clean API for importing types throughout the application.
 */

// Re-export all shared types
export * from './shared';
export * from './api';
export * from './user';
export * from './game';

// Re-export commonly used types for convenience
export type {
  BaseEntity,
  ApiResponse,
  ApiErrorResponse,
  PaginationParams,
  PaginatedResponse,
  Status,
  Visibility,
  Theme,
  Language,
  NotificationPreferences,
  AccessibilityPreferences,
  Permission,
  Role,
  FormState,
  LoadingState,
} from './shared';

export type {
  HttpMethod,
  ApiEndpoint,
  ApiRequestConfig,
  ApiQueryParams,
  ApiMutationParams,
  HealthResponse,
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from './api';

export type {
  User,
  UserPreferences,
  PrivacyPreferences,
  GamePreferences,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordData,
  Session,
  UserProfile,
  UserStats,
  Achievement,
  ActivityEntry,
  Friendship,
  Friend,
  UserSearchFilters,
  UpdateUserProfileData,
  UpdateUserPreferencesData,
  UserInvitation,
  UserExportData,
} from './user';

export type {
  Game,
  GameCategory,
  GameDifficulty,
  GameMetadata,
  GameSession,
  GameSessionStatus,
  GameSettings,
  GamePlayer,
  PlayerStatus,
  PlayerRole,
  PlayerStatistics,
  PlayerPreferences,
  GameSpectator,
  GameRound,
  RoundStatus,
  RoundType,
  RoundOption,
  PlayerResponse,
  RoundResults,
  GameStatistics,
  GameSessionMetadata,
  ChatMessage,
  MessageType,
  GameInvitation,
  InvitationStatus,
  GameSearchFilters,
  GameSessionSearchFilters,
  GameLeaderboard,
  LeaderboardEntry,
  GameAnalytics,
} from './game';

// Re-export utility functions
export {
  isBaseEntity,
  isApiResponse,
  isApiErrorResponse,
  isPaginatedResponse,
  DEFAULT_PAGINATION,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
} from './shared';

export {
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isConflictError,
  isRateLimitError,
  createApiError,
  isApiSuccess,
  isApiError,
} from './api';

export {
  isUser,
  isSession,
  isAchievement,
  isFriend,
  getDisplayName,
  getFullName,
  isOnline,
  canReceiveMessages,
  canReceiveGameInvites,
  hasPermission,
  hasRole,
  DEFAULT_USER_PREFERENCES,
} from './user';

export {
  isGame,
  isGameSession,
  isGamePlayer,
  isGameRound,
  isChatMessage,
  canJoinSession,
  canSpectateSession,
  isHost,
  isActivePlayer,
  calculateWinRate,
  getPlayerRank,
  getSessionDuration,
  isSessionActive,
  getGameDifficultyLevel,
} from './game';

// Type unions for common patterns
export type EntityType =
  | 'user'
  | 'game'
  | 'session'
  | 'achievement'
  | 'activity';
export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'join'
  | 'leave'
  | 'invite';
export type EventType =
  | 'user_joined'
  | 'user_left'
  | 'game_started'
  | 'game_ended'
  | 'round_completed'
  | 'message_sent';

// Common type patterns
export type ID = string;
export type Timestamp = string;
export type URL = string;
export type Email = string;
export type UUID = string;

// Generic response types
export type CreateResponse<T = any> = any & { statusCode: 201 };
export type UpdateResponse<T = any> = any & { statusCode: 200 };
export type DeleteResponse = any & { statusCode: 204 };
export type GetResponse<T = any> = any & { statusCode: 200 };
export type ListResponse<T = any> = any & { statusCode: 200 };

// Form data types (for compatibility with React Hook Form)
export type FormData<T> = T;
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

// State management types
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type PaginatedState<T = any> = AsyncState<any>;

// Event types for real-time updates
export interface RealtimeEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  userId?: string;
  entityId?: string;
  entityType?: EntityType;
}

export interface RealtimeError {
  type: 'error';
  payload: {
    message: string;
    code: string;
    timestamp: string;
  };
}

// WebSocket message types
export interface WSMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

export interface WSError {
  type: 'error';
  payload: any;
  timestamp: string;
  id?: string;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTtl: number;
  maxSize: number;
  storage: 'memory' | 'localStorage' | 'sessionStorage';
}

// Feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetRoles?: string[];
  expiresAt?: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  context?: {
    page: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
  };
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    [key: string]: boolean;
  };
  ui: {
    theme: string;
    language: string;
    animations: boolean;
    sounds: boolean;
  };
  game: {
    maxPlayers: number;
    defaultTimeLimit: number;
    allowSpectators: boolean;
  };
}

// Export everything as default for convenience
export default {
  // Re-export all named exports
  // Note: Using dynamic imports would be preferred but requires async/await
};
