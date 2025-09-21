/**
 * Game Types
 *
 * Types related to game management, game sessions, and game entities.
 * These types are designed to be compatible with tRPC and provide consistent game data contracts.
 */

/* eslint-disable no-unused-vars */
import { BaseEntity, Status, Visibility } from './shared';

// Game entity
export interface Game extends BaseEntity {
  name: string;
  description: string;
  version: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // in minutes
  rules: string;
  instructions: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  thumbnail?: string;
  screenshots: string[];
  metadata: GameMetadata;
}

// Game categories
export type GameCategory =
  | 'word'
  | 'number'
  | 'trivia'
  | 'strategy'
  | 'puzzle'
  | 'creative'
  | 'social'
  | 'competitive'
  | 'cooperative'
  | 'educational'
  | 'party'
  | 'quick'
  | 'brain';

// Game difficulty levels
export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Game metadata
export interface GameMetadata {
  language: string;
  ageRating: 'all' | '7+' | '12+' | '16+' | '18+';
  contentWarnings?: string[];
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    keyboardOnly: boolean;
  };
  requirements: {
    internet: boolean;
    camera?: boolean;
    microphone?: boolean;
    location?: boolean;
  };
}

// Game session
export interface GameSession extends BaseEntity {
  gameId: string;
  hostId: string;
  name?: string;
  description?: string;
  status: GameSessionStatus;
  visibility: Visibility;
  maxPlayers: number;
  currentPlayers: number;
  settings: GameSettings;
  players: GamePlayer[];
  spectators: GameSpectator[];
  rounds: GameRound[];
  currentRound?: number;
  startedAt?: string;
  endedAt?: string;
  winner?: GamePlayer;
  statistics: GameStatistics;
  chat: ChatMessage[];
  metadata: GameSessionMetadata;
}

// Game session status
export type GameSessionStatus =
  | 'lobby'
  | 'starting'
  | 'in-progress'
  | 'paused'
  | 'ended'
  | 'cancelled';

// Game settings
export interface GameSettings {
  timeLimit?: number; // in seconds
  roundLimit?: number;
  difficulty: GameDifficulty;
  allowSpectators: boolean;
  autoStart: boolean;
  autoStartDelay: number; // in seconds
  allowLateJoin: boolean;
  allowRejoin: boolean;
  customRules?: Record<string, any>;
}

// Game player
export interface GamePlayer extends BaseEntity {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: PlayerStatus;
  role: PlayerRole;
  score: number;
  rank?: number;
  isHost: boolean;
  joinedAt: string;
  leftAt?: string;
  lastActivity: string;
  statistics: PlayerStatistics;
  preferences: PlayerPreferences;
}

// Player status
export type PlayerStatus =
  | 'active'
  | 'inactive'
  | 'disconnected'
  | 'eliminated'
  | 'spectator';

// Player role
export type PlayerRole = 'player' | 'host' | 'moderator' | 'spectator';

// Player statistics
export interface PlayerStatistics {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  averageResponseTime: number;
  perfectGames: number;
  streaks: {
    current: number;
    longest: number;
  };
}

// Player preferences
export interface PlayerPreferences {
  autoSkip: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  chatEnabled: boolean;
  showHints: boolean;
  difficulty: GameDifficulty;
}

// Game spectator
export interface GameSpectator extends BaseEntity {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  joinedAt: string;
  lastActivity: string;
}

// Game round
export interface GameRound extends BaseEntity {
  roundNumber: number;
  status: RoundStatus;
  type: RoundType;
  question?: string;
  prompt?: string;
  options?: RoundOption[];
  correctAnswer?: string | number;
  timeLimit: number;
  startedAt: string;
  endedAt?: string;
  responses: PlayerResponse[];
  results: RoundResults;
}

// Round status
export type RoundStatus =
  | 'pending'
  | 'active'
  | 'scoring'
  | 'completed'
  | 'cancelled';

// Round type
export type RoundType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'ordering'
  | 'matching'
  | 'timed'
  | 'creative';

// Round option (for multiple choice)
export interface RoundOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  explanation?: string;
}

// Player response
export interface PlayerResponse extends BaseEntity {
  playerId: string;
  response: string | number | any;
  isCorrect?: boolean;
  score?: number;
  timeToAnswer: number; // in milliseconds
  submittedAt: string;
}

// Round results
export interface RoundResults {
  totalResponses: number;
  correctResponses: number;
  averageScore: number;
  fastestResponse?: PlayerResponse;
  leaderboard: Array<{
    playerId: string;
    score: number;
    rank: number;
  }>;
}

// Game statistics
export interface GameStatistics {
  totalRounds: number;
  completedRounds: number;
  averageRoundDuration: number;
  totalDuration: number;
  playerCount: number;
  spectatorCount: number;
  chatMessages: number;
  averageScore: number;
  highestScore: number;
  perfectScores: number;
}

// Game session metadata
export interface GameSessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    region?: string;
    city?: string;
  };
  tags: string[];
  notes?: string;
}

// Chat message
export interface ChatMessage extends BaseEntity {
  playerId: string;
  username: string;
  message: string;
  type: MessageType;
  roundNumber?: number;
  isSystem: boolean;
  isPrivate: boolean;
  recipientId?: string;
  editedAt?: string;
  deletedAt?: string;
}

// Message type
export type MessageType =
  | 'text'
  | 'emoji'
  | 'system'
  | 'game-event'
  | 'private';

// Game invitation
export interface GameInvitation extends BaseEntity {
  gameSessionId: string;
  hostId: string;
  inviteeId: string;
  message?: string;
  status: InvitationStatus;
  expiresAt: string;
  respondedAt?: string;
}

// Invitation status
export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'cancelled';

// Game search and filtering
export interface GameSearchFilters {
  query?: string;
  category?: GameCategory[];
  difficulty?: GameDifficulty[];
  minPlayers?: number;
  maxPlayers?: number;
  duration?: {
    min: number;
    max: number;
  };
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'popularity' | 'rating' | 'createdAt' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

export interface GameSessionSearchFilters {
  gameId?: string;
  hostId?: string;
  status?: GameSessionStatus[];
  visibility?: Visibility[];
  hasSpace?: boolean;
  allowSpectators?: boolean;
  timeLimit?: {
    min: number;
    max: number;
  };
  sortBy?: 'createdAt' | 'startedAt' | 'playerCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Game leaderboard
export interface GameLeaderboard {
  gameId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  lastUpdated: string;
  totalPlayers: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  displayName: string;
  avatar?: string;
  score: number;
  gamesPlayed: number;
  winRate: number;
  bestScore: number;
  averageScore: number;
  lastPlayed: string;
}

// Game analytics
export interface GameAnalytics {
  gameId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalSessions: number;
    totalPlayers: number;
    averageSessionDuration: number;
    averagePlayersPerSession: number;
    completionRate: number;
    retentionRate: number;
    popularTimes: Array<{
      hour: number;
      dayOfWeek: number;
      sessions: number;
    }>;
    difficultyBreakdown: Record<GameDifficulty, number>;
    categoryBreakdown: Record<GameCategory, number>;
  };
  trends: {
    sessions: Array<{
      date: string;
      count: number;
    }>;
    players: Array<{
      date: string;
      count: number;
    }>;
    scores: Array<{
      date: string;
      average: number;
    }>;
  };
}

// Type guards for game types
export const isGame = (obj: any): obj is Game => {
  return (
    obj &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.minPlayers === 'number' &&
    typeof obj.maxPlayers === 'number'
  );
};

export const isGameSession = (obj: any): obj is GameSession => {
  return (
    obj &&
    typeof obj.gameId === 'string' &&
    typeof obj.hostId === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.players)
  );
};

export const isGamePlayer = (obj: any): obj is GamePlayer => {
  return (
    obj &&
    typeof obj.userId === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.score === 'number' &&
    typeof obj.isHost === 'boolean'
  );
};

export const isGameRound = (obj: any): obj is GameRound => {
  return (
    obj &&
    typeof obj.roundNumber === 'number' &&
    typeof obj.status === 'string' &&
    typeof obj.type === 'string'
  );
};

export const isChatMessage = (obj: any): obj is ChatMessage => {
  return (
    obj &&
    typeof obj.playerId === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.isSystem === 'boolean'
  );
};

// Utility functions for game operations
export const canJoinSession = (
  session: Pick<
    GameSession,
    'status' | 'currentPlayers' | 'maxPlayers' | 'settings'
  >
): boolean => {
  return (
    session.status === 'lobby' &&
    session.currentPlayers < session.maxPlayers &&
    session.settings.allowLateJoin
  );
};

export const canSpectateSession = (
  session: Pick<GameSession, 'status' | 'settings'>
): boolean => {
  return (
    ['lobby', 'in-progress'].includes(session.status) &&
    session.settings.allowSpectators
  );
};

export const isHost = (player: Pick<GamePlayer, 'isHost'>): boolean => {
  return player.isHost;
};

export const isActivePlayer = (player: Pick<GamePlayer, 'status'>): boolean => {
  return player.status === 'active';
};

export const calculateWinRate = (
  stats: Pick<PlayerStatistics, 'gamesPlayed' | 'gamesWon'>
): number => {
  return stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0;
};

export const getPlayerRank = (
  players: GamePlayer[],
  playerId: string
): number => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const playerIndex = sortedPlayers.findIndex((p) => p.id === playerId);
  return playerIndex >= 0 ? playerIndex + 1 : -1;
};

export const getSessionDuration = (
  session: Pick<GameSession, 'startedAt' | 'endedAt'>
): number => {
  if (!session.startedAt) return 0;
  const start = new Date(session.startedAt);
  const end = session.endedAt ? new Date(session.endedAt) : new Date();
  return Math.floor((end.getTime() - start.getTime()) / 1000);
};

export const isSessionActive = (
  session: Pick<GameSession, 'status'>
): boolean => {
  return ['lobby', 'starting', 'in-progress'].includes(session.status);
};

export const getGameDifficultyLevel = (difficulty: GameDifficulty): number => {
  const levels = { easy: 1, medium: 2, hard: 3, expert: 4 };
  return levels[difficulty];
};

export default {
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
};
