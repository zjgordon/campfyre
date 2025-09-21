// Store exports
export {
  useUserStore,
  useCurrentUser,
  useUserPreferences,
  useUserLoading,
  useUserError,
} from './userStore';
export type { User, UserPreferences } from './userStore';

export {
  useSessionStore,
  useIsAuthenticated,
  useSession,
  useIsInitialized,
  useSessionLoading,
  useSessionError,
} from './sessionStore';
export type { Session, AuthState } from './sessionStore';

export {
  useGameStore,
  useCurrentGame,
  useAvailableGames,
  useGameHistory,
  useGameRole,
  useGameLoading,
  useGameError,
} from './gameStore';
export type {
  GameState,
  GamePlayer,
  GameSettings,
  GameSession,
} from './gameStore';
