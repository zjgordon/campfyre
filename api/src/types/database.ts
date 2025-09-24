// Database types and Prisma client extensions
// This file provides type-safe database operations and extends Prisma types

import { Prisma } from '@prisma/client';
import {
  UserPreferences,
  CampaignSettings,
  CampaignMetadata,
  CharacterSheetData,
  GameSystemTemplate,
  GameSessionSettings,
  MessageMetadata,
  NotificationMetadata,
} from './entities';

// Re-export Prisma types
export type {
  User,
  Campaign,
  CampaignMember,
  Character,
  GameSystem,
  GameSession,
  GameSessionCharacter,
  Message,
  Notification,
  UserSession,
  CampaignStatus,
  CampaignVisibility,
  CampaignRole,
  GameSessionStatus,
  MessageType,
  NotificationType,
} from '@prisma/client';

// Extended types with business logic
export type ExtendedUser = Prisma.UserGetPayload<{
  include: {
    ownedCampaigns: true;
    campaignMemberships: {
      include: {
        campaign: true;
      };
    };
    characters: true;
    notifications: true;
  };
}>;

export type ExtendedCampaign = Prisma.CampaignGetPayload<{
  include: {
    owner: true;
    members: {
      include: {
        user: true;
      };
    };
    characters: true;
    gameSessions: true;
    gameSystem: true;
  };
}>;

export type ExtendedCharacter = Prisma.CharacterGetPayload<{
  include: {
    owner: true;
    campaign: true;
    gameSessions: true;
  };
}>;

export type ExtendedGameSystem = Prisma.GameSystemGetPayload<{
  include: {
    campaigns: true;
  };
}>;

export type ExtendedGameSession = Prisma.GameSessionGetPayload<{
  include: {
    campaign: true;
    gm: true;
    characters: {
      include: {
        character: true;
      };
    };
    messages: true;
  };
}>;

export type ExtendedMessage = Prisma.MessageGetPayload<{
  include: {
    author: true;
    gameSession: true;
  };
}>;

export type ExtendedNotification = Prisma.NotificationGetPayload<{
  include: {
    user: true;
  };
}>;

// Database operation types
export interface CreateUserData {
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
  lastLoginAt?: Date;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  image?: string;
  visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  maxPlayers?: number;
  gameSystemId: string;
  ownerId: string;
  settings?: CampaignSettings;
  metadata?: CampaignMetadata;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  image?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  maxPlayers?: number;
  settings?: CampaignSettings;
  metadata?: CampaignMetadata;
}

export interface CreateCharacterData {
  name: string;
  description?: string;
  image?: string;
  level?: number;
  experience?: number;
  characterSheet: CharacterSheetData;
  campaignId: string;
  ownerId: string;
}

export interface UpdateCharacterData {
  name?: string;
  description?: string;
  image?: string;
  level?: number;
  experience?: number;
  characterSheet?: CharacterSheetData;
}

export interface CreateGameSystemData {
  name: string;
  version?: string;
  description?: string;
  publisher?: string;
  characterSheetTemplate: GameSystemTemplate;
  rules?: any;
  metadata?: any;
}

export interface UpdateGameSystemData {
  name?: string;
  version?: string;
  description?: string;
  publisher?: string;
  characterSheetTemplate?: GameSystemTemplate;
  rules?: any;
  metadata?: any;
  isActive?: boolean;
}

export interface CreateGameSessionData {
  name: string;
  description?: string;
  scheduledAt?: Date;
  campaignId: string;
  gmId: string;
  settings?: GameSessionSettings;
  notes?: string;
}

export interface UpdateGameSessionData {
  name?: string;
  description?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  settings?: GameSessionSettings;
  notes?: string;
}

export interface CreateMessageData {
  content: string;
  type?:
    | 'TEXT'
    | 'SYSTEM'
    | 'DICE_ROLL'
    | 'CHARACTER_ACTION'
    | 'GM_ANNOUNCEMENT';
  metadata?: MessageMetadata;
  authorId: string;
  gameSessionId?: string;
}

export interface UpdateMessageData {
  content?: string;
  metadata?: MessageMetadata;
  isEdited?: boolean;
}

export interface CreateNotificationData {
  title: string;
  content: string;
  type:
    | 'CAMPAIGN_INVITE'
    | 'SESSION_REMINDER'
    | 'MESSAGE_MENTION'
    | 'SYSTEM_UPDATE'
    | 'CAMPAIGN_UPDATE';
  metadata?: NotificationMetadata;
  userId: string;
}

// Query filters and options
export interface CampaignFilters {
  status?: ('ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED')[];
  visibility?: ('PRIVATE' | 'PUBLIC' | 'UNLISTED')[];
  gameSystemId?: string;
  ownerId?: string;
  memberId?: string;
  search?: string;
}

export interface CharacterFilters {
  campaignId?: string;
  ownerId?: string;
  isActive?: boolean;
  search?: string;
}

export interface GameSessionFilters {
  campaignId?: string;
  gmId?: string;
  status?: ('PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')[];
  scheduledAfter?: Date;
  scheduledBefore?: Date;
}

export interface MessageFilters {
  gameSessionId?: string;
  authorId?: string;
  type?: (
    | 'TEXT'
    | 'SYSTEM'
    | 'DICE_ROLL'
    | 'CHARACTER_ACTION'
    | 'GM_ANNOUNCEMENT'
  )[];
  after?: Date;
  before?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions extends PaginationOptions {
  query: string;
  fields?: string[];
}

// Database transaction types
export interface DatabaseTransaction {
  createUser: (data: CreateUserData) => Promise<ExtendedUser>;
  updateUser: (id: string, data: UpdateUserData) => Promise<ExtendedUser>;
  deleteUser: (id: string) => Promise<void>;

  createCampaign: (data: CreateCampaignData) => Promise<ExtendedCampaign>;
  updateCampaign: (
    id: string,
    data: UpdateCampaignData
  ) => Promise<ExtendedCampaign>;
  deleteCampaign: (id: string) => Promise<void>;

  createCharacter: (data: CreateCharacterData) => Promise<ExtendedCharacter>;
  updateCharacter: (
    id: string,
    data: UpdateCharacterData
  ) => Promise<ExtendedCharacter>;
  deleteCharacter: (id: string) => Promise<void>;

  createGameSession: (
    data: CreateGameSessionData
  ) => Promise<ExtendedGameSession>;
  updateGameSession: (
    id: string,
    data: UpdateGameSessionData
  ) => Promise<ExtendedGameSession>;
  deleteGameSession: (id: string) => Promise<void>;

  createMessage: (data: CreateMessageData) => Promise<ExtendedMessage>;
  updateMessage: (
    id: string,
    data: UpdateMessageData
  ) => Promise<ExtendedMessage>;
  deleteMessage: (id: string) => Promise<void>;
}

// Database statistics and analytics types
export interface DatabaseStats {
  totalUsers: number;
  totalCampaigns: number;
  totalCharacters: number;
  totalGameSessions: number;
  totalMessages: number;
  activeUsers: number;
  activeCampaigns: number;
  averageSessionDuration: number;
  popularGameSystems: Array<{
    gameSystemId: string;
    name: string;
    count: number;
  }>;
}

export interface UserStats {
  totalCampaigns: number;
  totalCharacters: number;
  totalGameSessions: number;
  totalMessages: number;
  averageSessionDuration: number;
  favoriteGameSystem?: string;
  lastActivity: Date;
}

export interface CampaignStats {
  totalMembers: number;
  totalCharacters: number;
  totalGameSessions: number;
  totalMessages: number;
  averageSessionDuration: number;
  lastActivity: Date;
  memberActivity: Array<{
    userId: string;
    username: string;
    messageCount: number;
    sessionCount: number;
  }>;
}
