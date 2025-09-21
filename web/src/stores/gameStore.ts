/* eslint-disable no-unused-vars */
import { create } from 'zustand';

// Game-related types
export interface GameState {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
  currentPhase: string;
  players: GamePlayer[];
  settings: GameSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GamePlayer {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'joined' | 'ready' | 'active' | 'inactive';
  score: number;
  joinedAt: string;
}

export interface GameSettings {
  maxPlayers: number;
  timeLimit?: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  allowSpectators: boolean;
  isPrivate: boolean;
  customRules?: Record<string, any>;
}

export interface GameSession {
  currentGame: GameState | null;
  isHost: boolean;
  isSpectator: boolean;
  playerId: string | null;
}

// Game store state interface
interface GameStoreState {
  // State
  currentGame: GameState | null;
  availableGames: GameState[];
  gameHistory: GameState[];
  isHost: boolean;
  isSpectator: boolean;
  playerId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentGame: (game: GameState | null) => void;
  updateCurrentGame: (updates: Partial<GameState>) => void;
  setAvailableGames: (games: GameState[]) => void;
  addToHistory: (game: GameState) => void;
  setGameRole: (
    isHost: boolean,
    isSpectator: boolean,
    playerId: string | null
  ) => void;
  updatePlayerStatus: (playerId: string, status: GamePlayer['status']) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  clearCurrentGame: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create game store
export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial state
  currentGame: null,
  availableGames: [],
  gameHistory: [],
  isHost: false,
  isSpectator: false,
  playerId: null,
  isLoading: false,
  error: null,

  // Actions

  setCurrentGame: (game: GameState | null) => {
    set({
      currentGame: game,
      error: null,
    });
  },

  updateCurrentGame: (updates: Partial<GameState>) => {
    const { currentGame } = get();
    if (currentGame) {
      set({
        currentGame: {
          ...currentGame,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  setAvailableGames: (games: GameState[]) => {
    set({ availableGames: games });
  },

  addToHistory: (game: GameState) => {
    const { gameHistory } = get();
    set({
      gameHistory: [game, ...gameHistory.slice(0, 9)], // Keep last 10 games
    });
  },

  setGameRole: (
    isHost: boolean,
    isSpectator: boolean,
    playerId: string | null
  ) => {
    set({ isHost, isSpectator, playerId });
  },

  updatePlayerStatus: (playerId: string, status: GamePlayer['status']) => {
    const { currentGame } = get();
    if (currentGame) {
      const updatedPlayers = currentGame.players.map((player) =>
        player.id === playerId ? { ...player, status } : player
      );
      set({
        currentGame: {
          ...currentGame,
          players: updatedPlayers,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  updatePlayerScore: (playerId: string, score: number) => {
    const { currentGame } = get();
    if (currentGame) {
      const updatedPlayers = currentGame.players.map((player) =>
        player.id === playerId ? { ...player, score } : player
      );
      set({
        currentGame: {
          ...currentGame,
          players: updatedPlayers,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  clearCurrentGame: () => {
    set({
      currentGame: null,
      isHost: false,
      isSpectator: false,
      playerId: null,
      error: null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Selectors for easier usage
export const useCurrentGame = () => useGameStore((state) => state.currentGame);
export const useAvailableGames = () =>
  useGameStore((state) => state.availableGames);
export const useGameHistory = () => useGameStore((state) => state.gameHistory);
export const useGameRole = () =>
  useGameStore((state) => ({
    isHost: state.isHost,
    isSpectator: state.isSpectator,
    playerId: state.playerId,
  }));
export const useGameLoading = () => useGameStore((state) => state.isLoading);
export const useGameError = () => useGameStore((state) => state.error);

export default useGameStore;
