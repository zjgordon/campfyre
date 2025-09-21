// Re-export store hooks for easy access
export {
  // User store hooks
  useUserStore,
  useCurrentUser,
  useUserPreferences,
  useUserLoading,
  useUserError,

  // Session store hooks
  useSessionStore,
  useIsAuthenticated,
  useSession,
  useIsInitialized,
  useSessionLoading,
  useSessionError,

  // Game store hooks
  useGameStore,
  useCurrentGame,
  useAvailableGames,
  useGameHistory,
  useGameRole,
  useGameLoading,
  useGameError,
} from '../stores';

// Custom hooks for common patterns
import { useCallback } from 'react';
import {
  useUserStore,
  useSessionStore,
  useGameStore,
  useIsAuthenticated,
  useSession,
  useCurrentUser,
  useSessionLoading,
  useSessionError,
  useCurrentGame,
  useUserPreferences,
} from '../stores';

// Authentication helpers
export const useAuthActions = () => {
  const { setUser, clearUser, setLoading, setError } = useUserStore();
  const { setSession, clearSession, setInitialized } = useSessionStore();

  const login = useCallback(
    (user: any, session: any) => {
      setLoading(true);
      try {
        setUser(user);
        setSession(session);
        setInitialized(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [setUser, setSession, setInitialized, setLoading, setError]
  );

  const logout = useCallback(() => {
    clearUser();
    clearSession();
    setInitialized(true);
  }, [clearUser, clearSession, setInitialized]);

  return { login, logout };
};

// Game action helpers
export const useGameActions = () => {
  const { setCurrentGame, updateCurrentGame, setGameRole, clearCurrentGame } =
    useGameStore();

  const joinGame = useCallback(
    (game: any, playerId: string, isHost = false) => {
      setCurrentGame(game);
      setGameRole(isHost, false, playerId);
    },
    [setCurrentGame, setGameRole]
  );

  const leaveGame = useCallback(() => {
    clearCurrentGame();
  }, [clearCurrentGame]);

  const updateGameStatus = useCallback(
    (status: string) => {
      updateCurrentGame({ status: status as any });
    },
    [updateCurrentGame]
  );

  return { joinGame, leaveGame, updateGameStatus };
};

// User preference helpers
export const useUserActions = () => {
  const { updatePreferences } = useUserStore();

  const updateTheme = useCallback(
    (theme: 'light' | 'dark' | 'auto') => {
      updatePreferences({ theme });
    },
    [updatePreferences]
  );

  const updateLanguage = useCallback(
    (language: string) => {
      updatePreferences({ language });
    },
    [updatePreferences]
  );

  const updateNotifications = useCallback(
    (notifications: Partial<any>) => {
      updatePreferences({
        notifications: {
          email: true,
          push: false,
          inApp: true,
          ...notifications,
        },
      });
    },
    [updatePreferences]
  );

  return { updateTheme, updateLanguage, updateNotifications };
};

// Combined store selectors for common use cases
export const useAuthState = () => {
  const isAuthenticated = useIsAuthenticated();
  const session = useSession();
  const currentUser = useCurrentUser();
  const isLoading = useSessionLoading();
  const error = useSessionError();

  return {
    isAuthenticated,
    session,
    currentUser,
    isLoading,
    error,
  };
};

export const useAppState = () => {
  const authState = useAuthState();
  const currentGame = useCurrentGame();
  const userPreferences = useUserPreferences();

  return {
    ...authState,
    currentGame,
    userPreferences,
  };
};

export default {
  useAuthActions,
  useGameActions,
  useUserActions,
  useAuthState,
  useAppState,
};
