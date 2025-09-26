/**
 * tRPC type definitions for Prisma integration
 * Provides type-safe interfaces for tRPC procedures
 */

import {
  User,
  Campaign,
  GameSession,
  Character,
  GameSystem,
  Message,
  Notification,
} from '@prisma/client';

/**
 * Base response interface for all tRPC procedures
 */
export interface BaseResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data: T;
}

/**
 * Error response interface
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  code: string;
  details?: Record<string, any>;
}

/**
 * Pagination interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends BaseResponse {
  success: true;
  data: T[];
  pagination: Pagination;
}

/**
 * User-related types
 */
export interface UserResponse extends SuccessResponse<User> {}
export interface UsersListResponse extends PaginatedResponse<User> {}

export interface CreateUserInput {
  email: string;
  username: string;
  name: string;
  password?: string;
  bio?: string;
  preferences?: Record<string, any>;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  bio?: string;
  preferences?: Record<string, any>;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Campaign-related types
 */
export interface CampaignResponse
  extends SuccessResponse<
    Campaign & {
      owner: User;
      gameSystem: GameSystem;
      members: Array<{ user: User }>;
      _count: {
        members: number;
        characters: number;
        gameSessions: number;
      };
    }
  > {}

export interface CampaignsListResponse
  extends PaginatedResponse<
    Campaign & {
      owner: User;
      gameSystem: GameSystem;
      _count: {
        members: number;
        characters: number;
        gameSessions: number;
      };
    }
  > {}

export interface CreateCampaignInput {
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  maxPlayers: number;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  gameSystemId: string;
}

export interface UpdateCampaignInput {
  id: string;
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  maxPlayers?: number;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CampaignFilters {
  search?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  ownerId?: string;
  gameSystemId?: string;
  page?: number;
  limit?: number;
}

/**
 * Game Session-related types
 */
export interface GameSessionResponse
  extends SuccessResponse<
    GameSession & {
      campaign: Campaign & {
        owner: User;
        gameSystem: GameSystem;
      };
      gm: User;
      characters: Array<{ character: Character }>;
      messages: Array<Message & { author: User }>;
      _count: {
        characters: number;
        messages: number;
      };
    }
  > {}

export interface GameSessionsListResponse
  extends PaginatedResponse<
    GameSession & {
      campaign: Campaign & {
        owner: User;
        gameSystem: GameSystem;
      };
      gm: User;
      _count: {
        characters: number;
        messages: number;
      };
    }
  > {}

export interface CreateGameSessionInput {
  name: string;
  description: string;
  scheduledAt: Date;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  settings?: Record<string, any>;
  notes?: string;
  campaignId: string;
}

export interface UpdateGameSessionInput {
  id: string;
  name?: string;
  description?: string;
  scheduledAt?: Date;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  settings?: Record<string, any>;
  notes?: string;
}

export interface GameSessionFilters {
  campaignId?: string;
  gmId?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Character-related types
 */
export interface CharacterResponse
  extends SuccessResponse<
    Character & {
      owner: User;
      campaign: Campaign & {
        owner: User;
        gameSystem: GameSystem;
      };
    }
  > {}

export interface CharactersListResponse
  extends PaginatedResponse<
    Character & {
      owner: User;
      campaign: Campaign & {
        owner: User;
        gameSystem: GameSystem;
      };
    }
  > {}

export interface CreateCharacterInput {
  name: string;
  description: string;
  level: number;
  experience: number;
  characterSheet: Record<string, any>;
  campaignId: string;
}

export interface UpdateCharacterInput {
  id: string;
  name?: string;
  description?: string;
  level?: number;
  experience?: number;
  characterSheet?: Record<string, any>;
}

export interface CharacterFilters {
  search?: string;
  ownerId?: string;
  campaignId?: string;
  level?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Game System-related types
 */
export interface GameSystemResponse extends SuccessResponse<GameSystem> {}
export interface GameSystemsListResponse
  extends PaginatedResponse<GameSystem> {}

export interface CreateGameSystemInput {
  name: string;
  version: string;
  description: string;
  publisher: string;
  characterSheetTemplate: Record<string, any>;
  rules: Record<string, any>;
}

export interface UpdateGameSystemInput {
  id: string;
  name?: string;
  version?: string;
  description?: string;
  publisher?: string;
  characterSheetTemplate?: Record<string, any>;
  rules?: Record<string, any>;
}

/**
 * Message-related types
 */
export interface MessageResponse
  extends SuccessResponse<
    Message & {
      author: User;
    }
  > {}

export interface MessagesListResponse
  extends PaginatedResponse<
    Message & {
      author: User;
    }
  > {}

export interface CreateMessageInput {
  content: string;
  type:
    | 'GM_ANNOUNCEMENT'
    | 'PLAYER_MESSAGE'
    | 'DICE_ROLL'
    | 'CHARACTER_ACTION'
    | 'SYSTEM_MESSAGE';
  metadata?: Record<string, any>;
  gameSessionId?: string;
}

/**
 * Notification-related types
 */
export interface NotificationResponse extends SuccessResponse<Notification> {}
export interface NotificationsListResponse
  extends PaginatedResponse<Notification> {}

export interface CreateNotificationInput {
  title: string;
  content: string;
  type:
    | 'CAMPAIGN_INVITE'
    | 'SESSION_REMINDER'
    | 'CAMPAIGN_UPDATE'
    | 'SYSTEM_NOTIFICATION';
  metadata?: Record<string, any>;
  userId: string;
}

/**
 * Common query parameters
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Common mutation parameters
 */
export interface DeleteParams {
  id: string;
}

export interface BulkDeleteParams {
  ids: string[];
}

/**
 * Database operation result types
 */
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}

/**
 * tRPC procedure context extension
 */
export interface TRPCContext {
  req: any;
  requestId?: string;
  user?: User;
  prisma: any;
}
