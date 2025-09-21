/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Session-related types
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  session: Session | null;
  isInitialized: boolean;
}

// Session store state interface
interface SessionState {
  // State
  isAuthenticated: boolean;
  session: Session | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: Session) => void;
  updateSession: (updates: Partial<Session>) => void;
  refreshSession: (newToken: string, newRefreshToken?: string) => void;
  clearSession: () => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastActivity: () => void;
}

// Create session store with persistence
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      session: null,
      isInitialized: false,
      isLoading: false,
      error: null,

      // Actions

      setSession: (session: Session) => {
        set({
          session,
          isAuthenticated: true,
          error: null,
        });
      },

      updateSession: (updates: Partial<Session>) => {
        const { session } = get();
        if (session) {
          set({
            session: { ...session, ...updates },
          });
        }
      },

      refreshSession: (newToken: string, newRefreshToken?: string) => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              token: newToken,
              refreshToken: newRefreshToken || session.refreshToken,
              lastActivity: new Date().toISOString(),
            },
          });
        }
      },

      clearSession: () => {
        set({
          session: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      updateLastActivity: () => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              lastActivity: new Date().toISOString(),
            },
          });
        }
      },
    }),
    {
      name: 'campfyre-session-store',
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Selectors for easier usage
export const useIsAuthenticated = () =>
  useSessionStore((state) => state.isAuthenticated);
export const useSession = () => useSessionStore((state) => state.session);
export const useIsInitialized = () =>
  useSessionStore((state) => state.isInitialized);
export const useSessionLoading = () =>
  useSessionStore((state) => state.isLoading);
export const useSessionError = () => useSessionStore((state) => state.error);

export default useSessionStore;
