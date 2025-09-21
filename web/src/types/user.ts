/**
 * User Types
 *
 * Types related to user management, authentication, and user preferences.
 * These types are designed to be compatible with tRPC and provide consistent user data contracts.
 */

import {
  BaseEntity,
  Status,
  Visibility,
  Theme,
  Language,
  NotificationPreferences,
  AccessibilityPreferences,
  Permission,
  Role,
} from './shared';

// User entity
export interface User extends BaseEntity {
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  status: Status;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  preferences: UserPreferences;
  roles: string[]; // Array of role IDs
  permissions: Permission[];
  metadata?: Record<string, any>;
}

// User preferences
export interface UserPreferences {
  theme: Theme;
  language: Language;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  privacy: PrivacyPreferences;
  game: GamePreferences;
}

// Privacy preferences
export interface PrivacyPreferences {
  profileVisibility: Visibility;
  showEmail: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  allowGameInvites: boolean;
  allowFriendRequests: boolean;
  dataSharing: boolean;
  analytics: boolean;
}

// Game-specific preferences
export interface GamePreferences {
  defaultGameSettings: {
    maxPlayers: number;
    timeLimit?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    autoStart: boolean;
    allowSpectators: boolean;
  };
  notifications: {
    gameInvites: boolean;
    gameResults: boolean;
    achievements: boolean;
    leaderboard: boolean;
  };
  display: {
    showAchievements: boolean;
    showStats: boolean;
    compactMode: boolean;
  };
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Session types
export interface Session extends BaseEntity {
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    version: string;
  };
  isActive: boolean;
}

// User profile types
export interface UserProfile
  extends Omit<User, 'preferences' | 'roles' | 'permissions'> {
  preferences: UserPreferences;
  roles: Role[];
  stats: UserStats;
  achievements: Achievement[];
  recentActivity: ActivityEntry[];
}

// User statistics
export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  rank: number;
  level: number;
  experience: number;
  badges: number;
  friends: number;
  joinedAt: string;
}

// Achievement system
export interface Achievement extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  category: 'game' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

// Activity tracking
export interface ActivityEntry extends BaseEntity {
  type:
    | 'login'
    | 'game_join'
    | 'game_leave'
    | 'game_win'
    | 'achievement'
    | 'profile_update'
    | 'friend_add'
    | 'friend_remove';
  description: string;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// Friend system
export interface Friendship extends BaseEntity {
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
  requestedAt: string;
  respondedAt?: string;
}

export interface Friend
  extends Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'status'> {
  friendshipId: string;
  friendshipStatus: Friendship['status'];
  isOnline: boolean;
  lastSeen?: string;
}

// User search and filtering
export interface UserSearchFilters {
  query?: string;
  status?: Status[];
  roles?: string[];
  isVerified?: boolean;
  hasAvatar?: boolean;
  joinedAfter?: string;
  joinedBefore?: string;
  location?: string;
  sortBy?:
    | 'username'
    | 'displayName'
    | 'createdAt'
    | 'lastLoginAt'
    | 'gamesPlayed'
    | 'winRate';
  sortOrder?: 'asc' | 'desc';
}

// User update types
export interface UpdateUserProfileData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
}

export interface UpdateUserPreferencesData {
  theme?: Theme;
  language?: Language;
  timezone?: string;
  dateFormat?: UserPreferences['dateFormat'];
  timeFormat?: UserPreferences['timeFormat'];
  notifications?: Partial<NotificationPreferences>;
  accessibility?: Partial<AccessibilityPreferences>;
  privacy?: Partial<PrivacyPreferences>;
  game?: Partial<GamePreferences>;
}

// User invitation system
export interface UserInvitation extends BaseEntity {
  email: string;
  invitedBy: string;
  role: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  message?: string;
}

// User export data (GDPR compliance)
export interface UserExportData {
  user: User;
  sessions: Session[];
  friendships: Friendship[];
  activities: ActivityEntry[];
  achievements: Achievement[];
  gameHistory: Array<{
    gameId: string;
    playedAt: string;
    score?: number;
    won?: boolean;
  }>;
  exportedAt: string;
  exportId: string;
}

// Type guards for user types
export const isUser = (obj: any): obj is User => {
  return (
    obj &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.isEmailVerified === 'boolean'
  );
};

export const isSession = (obj: any): obj is Session => {
  return (
    obj &&
    typeof obj.userId === 'string' &&
    typeof obj.token === 'string' &&
    typeof obj.expiresAt === 'string'
  );
};

export const isAchievement = (obj: any): obj is Achievement => {
  return (
    obj &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    ['common', 'rare', 'epic', 'legendary'].includes(obj.rarity)
  );
};

export const isFriend = (obj: any): obj is Friend => {
  return (
    obj &&
    typeof obj.username === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.friendshipId === 'string'
  );
};

// Utility functions for user operations
export const getDisplayName = (
  user: Pick<User, 'displayName' | 'username'>
): string => {
  return user.displayName || user.username;
};

export const getFullName = (
  user: Pick<User, 'firstName' | 'lastName' | 'displayName' | 'username'>
): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.displayName || user.username;
};

export const isOnline = (user: Pick<User, 'status'>): boolean => {
  return user.status === 'active';
};

export const canReceiveMessages = (
  user: Pick<User, 'preferences'>
): boolean => {
  return user.preferences.privacy.allowDirectMessages;
};

export const canReceiveGameInvites = (
  user: Pick<User, 'preferences'>
): boolean => {
  return user.preferences.privacy.allowGameInvites;
};

export const hasPermission = (
  user: Pick<User, 'permissions'>,
  permission: Permission
): boolean => {
  return user.permissions.includes(permission);
};

export const hasRole = (user: Pick<User, 'roles'>, roleId: string): boolean => {
  return user.roles.includes(roleId);
};

// Default user preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'auto',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  notifications: {
    email: true,
    push: false,
    inApp: true,
    marketing: false,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    screenReader: false,
    keyboardNavigation: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showOnlineStatus: true,
    allowDirectMessages: true,
    allowGameInvites: true,
    allowFriendRequests: true,
    dataSharing: false,
    analytics: true,
  },
  game: {
    defaultGameSettings: {
      maxPlayers: 4,
      timeLimit: 30,
      difficulty: 'medium',
      autoStart: false,
      allowSpectators: true,
    },
    notifications: {
      gameInvites: true,
      gameResults: true,
      achievements: true,
      leaderboard: true,
    },
    display: {
      showAchievements: true,
      showStats: true,
      compactMode: false,
    },
  },
};

export default {
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
};
