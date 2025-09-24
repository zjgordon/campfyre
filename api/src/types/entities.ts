// Core entity types for the TTRPG platform
// These types extend the Prisma-generated types with additional business logic types

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    campaignUpdates: boolean;
    sessionReminders: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
  gameplay: {
    defaultDiceRoller: 'standard' | 'advanced';
    autoSaveCharacterSheets: boolean;
  };
}

export interface CampaignSettings {
  allowPlayerInvites: boolean;
  requireApprovalForJoins: boolean;
  allowCharacterCreation: boolean;
  maxCharactersPerPlayer: number;
  sessionDuration: number; // in minutes
  timezone: string;
  language: string;
}

export interface CampaignMetadata {
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contentWarnings: string[];
  ageRating: 'all' | 'teen' | 'mature';
  estimatedDuration: string;
  lastActivity: Date;
}

export interface CharacterSheetData {
  // Base character information
  basicInfo: {
    name: string;
    class?: string;
    race?: string;
    background?: string;
    alignment?: string;
    level: number;
    experience: number;
  };

  // Attributes/Stats (system-agnostic)
  attributes: Record<
    string,
    {
      value: number;
      modifier?: number;
      temporary?: number;
    }
  >;

  // Skills and abilities
  skills: Record<
    string,
    {
      value: number;
      proficient: boolean;
      expertise?: boolean;
      modifier?: number;
    }
  >;

  // Equipment and inventory
  equipment: {
    weapons: Array<{
      name: string;
      damage?: string;
      type: string;
      properties?: string[];
    }>;
    armor: Array<{
      name: string;
      ac?: number;
      type: string;
    }>;
    items: Array<{
      name: string;
      quantity: number;
      weight?: number;
      description?: string;
    }>;
  };

  // Spells and abilities
  spells?: {
    known: string[];
    prepared: string[];
    slots: Record<string, number>;
  };

  // Health and status
  health: {
    current: number;
    maximum: number;
    temporary?: number;
    hitDice?: string;
  };

  // Custom fields (for system-specific data)
  customFields: Record<string, any>;

  // Notes and background
  notes: {
    background: string;
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
    other: string;
  };
}

export interface GameSystemTemplate {
  name: string;
  version: string;
  description: string;
  publisher?: string;

  // Character sheet template
  characterSheetTemplate: {
    attributes: Array<{
      name: string;
      abbreviation: string;
      description?: string;
    }>;
    skills: Array<{
      name: string;
      attribute: string;
      description?: string;
    }>;
    classes: Array<{
      name: string;
      description: string;
      hitDie: string;
      primaryAttributes: string[];
    }>;
    races: Array<{
      name: string;
      description: string;
      abilityScoreIncrease: Record<string, number>;
    }>;
  };

  // System-specific rules
  rules: {
    diceSystem: 'd20' | 'd6' | 'd10' | 'custom';
    levelingSystem: 'experience' | 'milestone' | 'session';
    combatSystem: 'turn-based' | 'real-time' | 'hybrid';
    magicSystem?: {
      type: 'vancian' | 'spell-points' | 'mana' | 'none';
      description: string;
    };
  };

  // Metadata
  metadata: {
    tags: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    genre: string[];
    ageRating: 'all' | 'teen' | 'mature';
  };
}

export interface GameSessionSettings {
  allowSpectators: boolean;
  recordSession: boolean;
  enableVoiceChat: boolean;
  enableVideoChat: boolean;
  diceRollVisibility: 'public' | 'gm-only' | 'private';
  characterSheetSharing: 'full' | 'limited' | 'gm-only';
  timeLimit?: number; // in minutes
}

export interface MessageMetadata {
  mentions?: string[]; // User IDs
  reactions?: Record<string, string[]>; // emoji -> user IDs
  diceRolls?: Array<{
    expression: string;
    result: number;
    rolls: number[];
  }>;
  characterAction?: {
    characterId: string;
    action: string;
    target?: string;
  };
  systemMessage?: {
    type: 'join' | 'leave' | 'roll' | 'action';
    data: any;
  };
}

export interface NotificationMetadata {
  campaignId?: string;
  gameSessionId?: string;
  characterId?: string;
  action?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Real-time event types for WebRTC and live features
export interface RealtimeEvent {
  type:
    | 'user_join'
    | 'user_leave'
    | 'dice_roll'
    | 'character_update'
    | 'message'
    | 'session_start'
    | 'session_end';
  timestamp: Date;
  userId: string;
  data: any;
}

export interface WebRTCConnection {
  userId: string;
  connectionId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  capabilities: {
    audio: boolean;
    video: boolean;
    screenShare: boolean;
  };
}

// Validation schemas for character sheets
export interface CharacterSheetValidation {
  required: string[];
  optional: string[];
  constraints: Record<
    string,
    {
      type: 'number' | 'string' | 'boolean' | 'array' | 'object';
      min?: number;
      max?: number;
      pattern?: string;
      enum?: string[];
    }
  >;
}

// Campaign invitation types
export interface CampaignInvite {
  campaignId: string;
  invitedUserId: string;
  invitedByUserId: string;
  role: CampaignRole;
  message?: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// Export enums for use in other files
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type CampaignVisibility = 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
export type CampaignRole = 'OWNER' | 'GM' | 'PLAYER' | 'OBSERVER';
export type GameSessionStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
export type MessageType =
  | 'TEXT'
  | 'SYSTEM'
  | 'DICE_ROLL'
  | 'CHARACTER_ACTION'
  | 'GM_ANNOUNCEMENT';
export type NotificationType =
  | 'CAMPAIGN_INVITE'
  | 'SESSION_REMINDER'
  | 'MESSAGE_MENTION'
  | 'SYSTEM_UPDATE'
  | 'CAMPAIGN_UPDATE';
