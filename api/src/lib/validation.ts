import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Validation utilities
export const createValidationError = (message: string, path?: string) => {
  return new TRPCError({
    code: 'BAD_REQUEST',
    message,
    cause: path ? { path } : undefined,
  });
};

export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw createValidationError(`Validation failed: ${errorMessage}`);
    }
    throw createValidationError('Invalid input format');
  }
};

export const validateInputSafe = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } => {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
};

// Common validation schemas
export const EmailSchema = z.string().email('Invalid email format');

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

export const NameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'Name can only contain letters, numbers, spaces, hyphens, and underscores'
  );

export const IdSchema = z.string().min(1, 'ID is required');

export const OptionalIdSchema = z.string().min(1, 'ID is required').optional();

export const UrlSchema = z.string().url('Invalid URL format');

export const OptionalUrlSchema = z
  .string()
  .url('Invalid URL format')
  .optional();

// Pagination validation
export const PaginationInputSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Search validation
export const SearchInputSchema = z.object({
  query: z.string().min(1).max(100),
  ...PaginationInputSchema.shape,
});

// Sort validation
export const SortInputSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Common input validation schemas
export const CreateInputSchema = z.object({
  id: IdSchema.optional(), // Allow optional ID for creation
});

export const UpdateInputSchema = z.object({
  id: IdSchema, // Require ID for updates
});

export const DeleteInputSchema = z.object({
  id: IdSchema,
});

// Validation middleware helpers
export const createInputValidator = <T>(schema: z.ZodSchema<T>) => {
  return (input: unknown): T => {
    return validateInput(schema, input);
  };
};

export const createOptionalInputValidator = <T>(schema: z.ZodSchema<T>) => {
  return (input: unknown): T | undefined => {
    if (input === undefined || input === null) {
      return undefined;
    }
    return validateInput(schema, input);
  };
};

// Export commonly used validation functions
export const validateEmail = createInputValidator(EmailSchema);
export const validatePassword = createInputValidator(PasswordSchema);
export const validateName = createInputValidator(NameSchema);
export const validateId = createInputValidator(IdSchema);
export const validateUrl = createInputValidator(UrlSchema);
export const validateOptionalUrl = createOptionalInputValidator(UrlSchema);

// Validation error formatter for tRPC
export const formatValidationError = (error: z.ZodError): string => {
  return error.errors
    .map((err) => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    })
    .join('; ');
};

// Client-side validation utilities
export const createClientValidator = <T>(schema: z.ZodSchema<T>) => {
  return {
    parse: (input: unknown): T => {
      try {
        return schema.parse(input);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(formatValidationError(error));
        }
        throw error;
      }
    },
    safeParse: (input: unknown): z.SafeParseReturnType<unknown, T> => {
      return schema.safeParse(input);
    },
    validate: (input: unknown): boolean => {
      return schema.safeParse(input).success;
    },
  };
};

// Client-side input validation for tRPC procedures
export const validateClientInput = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): T => {
  const validator = createClientValidator(schema);
  return validator.parse(input);
};

// Client-side safe input validation
export const safeValidateClientInput = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: formatValidationError(result.error) };
};

// TTRPG-specific validation schemas
export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, hyphens, and underscores'
  );

export const CuidSchema = z.string().cuid('Invalid ID format');

// User validation schemas
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      campaignUpdates: z.boolean().optional(),
      sessionReminders: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      showOnlineStatus: z.boolean().optional(),
      allowDirectMessages: z.boolean().optional(),
    })
    .optional(),
  gameplay: z
    .object({
      defaultDiceRoller: z.enum(['standard', 'advanced']).optional(),
      autoSaveCharacterSheets: z.boolean().optional(),
    })
    .optional(),
});

export const CreateUserSchema = z.object({
  email: EmailSchema,
  username: UsernameSchema,
  name: NameSchema.optional(),
  password: PasswordSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  preferences: UserPreferencesSchema.optional(),
});

export const UpdateUserSchema = z.object({
  name: NameSchema.optional(),
  email: EmailSchema.optional(),
  username: UsernameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  preferences: UserPreferencesSchema.optional(),
  avatar: OptionalUrlSchema,
});

// Campaign validation schemas
export const CampaignSettingsSchema = z.object({
  allowPlayerInvites: z.boolean().optional(),
  requireApprovalForJoins: z.boolean().optional(),
  allowCharacterCreation: z.boolean().optional(),
  maxCharactersPerPlayer: z.number().int().min(1).max(10).optional(),
  sessionDuration: z.number().int().min(30).max(480).optional(), // 30 minutes to 8 hours
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export const CampaignMetadataSchema = z.object({
  tags: z.array(z.string().max(50)).max(10).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  contentWarnings: z.array(z.string().max(100)).max(5).optional(),
  ageRating: z.enum(['all', 'teen', 'mature']).optional(),
  estimatedDuration: z.string().max(100).optional(),
});

export const CreateCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  image: OptionalUrlSchema,
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'UNLISTED']).optional(),
  maxPlayers: z
    .number()
    .int()
    .min(1, 'Max players must be at least 1')
    .max(20, 'Max players must be less than 20')
    .optional(),
  gameSystemId: CuidSchema,
  settings: CampaignSettingsSchema.optional(),
  metadata: CampaignMetadataSchema.optional(),
});

export const UpdateCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  image: OptionalUrlSchema,
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'UNLISTED']).optional(),
  maxPlayers: z
    .number()
    .int()
    .min(1, 'Max players must be at least 1')
    .max(20, 'Max players must be less than 20')
    .optional(),
  settings: CampaignSettingsSchema.optional(),
  metadata: CampaignMetadataSchema.optional(),
});

// Character validation schemas
export const CharacterSheetDataSchema = z.object({
  basicInfo: z.object({
    name: z.string().min(1, 'Character name is required'),
    class: z.string().optional(),
    race: z.string().optional(),
    background: z.string().optional(),
    alignment: z.string().optional(),
    level: z.number().int().min(1).max(100),
    experience: z.number().int().min(0),
  }),
  attributes: z.record(
    z.string(),
    z.object({
      value: z.number().int().min(1).max(30),
      modifier: z.number().int().optional(),
      temporary: z.number().int().optional(),
    })
  ),
  skills: z.record(
    z.string(),
    z.object({
      value: z.number().int(),
      proficient: z.boolean(),
      expertise: z.boolean().optional(),
      modifier: z.number().int().optional(),
    })
  ),
  equipment: z.object({
    weapons: z.array(
      z.object({
        name: z.string(),
        damage: z.string().optional(),
        type: z.string(),
        properties: z.array(z.string()).optional(),
      })
    ),
    armor: z.array(
      z.object({
        name: z.string(),
        ac: z.number().int().optional(),
        type: z.string(),
      })
    ),
    items: z.array(
      z.object({
        name: z.string(),
        quantity: z.number().int().min(1),
        weight: z.number().optional(),
        description: z.string().optional(),
      })
    ),
  }),
  spells: z
    .object({
      known: z.array(z.string()),
      prepared: z.array(z.string()),
      slots: z.record(z.string(), z.number().int().min(0)),
    })
    .optional(),
  health: z.object({
    current: z.number().int().min(0),
    maximum: z.number().int().min(1),
    temporary: z.number().int().min(0).optional(),
    hitDice: z.string().optional(),
  }),
  customFields: z.record(z.string(), z.any()),
  notes: z.object({
    background: z.string().optional(),
    personality: z.string().optional(),
    ideals: z.string().optional(),
    bonds: z.string().optional(),
    flaws: z.string().optional(),
    other: z.string().optional(),
  }),
});

export const CreateCharacterSchema = z.object({
  name: z
    .string()
    .min(1, 'Character name is required')
    .max(100, 'Character name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  image: OptionalUrlSchema,
  level: z
    .number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(100, 'Level must be less than 100')
    .optional(),
  experience: z
    .number()
    .int()
    .min(0, 'Experience must be non-negative')
    .optional(),
  characterSheet: CharacterSheetDataSchema,
  campaignId: CuidSchema,
});

export const UpdateCharacterSchema = z.object({
  name: z
    .string()
    .min(1, 'Character name is required')
    .max(100, 'Character name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  image: OptionalUrlSchema,
  level: z
    .number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(100, 'Level must be less than 100')
    .optional(),
  experience: z
    .number()
    .int()
    .min(0, 'Experience must be non-negative')
    .optional(),
  characterSheet: CharacterSheetDataSchema.optional(),
});

// Game System validation schemas
export const GameSystemTemplateSchema = z.object({
  name: z.string().min(1, 'Game system name is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().optional(),
  publisher: z.string().optional(),
  characterSheetTemplate: z.object({
    attributes: z.array(
      z.object({
        name: z.string(),
        abbreviation: z.string(),
        description: z.string().optional(),
      })
    ),
    skills: z.array(
      z.object({
        name: z.string(),
        attribute: z.string(),
        description: z.string().optional(),
      })
    ),
    classes: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        hitDie: z.string(),
        primaryAttributes: z.array(z.string()),
      })
    ),
    races: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        abilityScoreIncrease: z.record(z.string(), z.number().int()),
      })
    ),
  }),
  rules: z.object({
    diceSystem: z.enum(['d20', 'd6', 'd10', 'custom']),
    levelingSystem: z.enum(['experience', 'milestone', 'session']),
    combatSystem: z.enum(['turn-based', 'real-time', 'hybrid']),
    magicSystem: z
      .object({
        type: z.enum(['vancian', 'spell-points', 'mana', 'none']),
        description: z.string(),
      })
      .optional(),
  }),
  metadata: z.object({
    tags: z.array(z.string()),
    complexity: z.enum(['simple', 'moderate', 'complex']),
    genre: z.array(z.string()),
    ageRating: z.enum(['all', 'teen', 'mature']),
  }),
});

export const CreateGameSystemSchema = z.object({
  name: z
    .string()
    .min(1, 'Game system name is required')
    .max(100, 'Game system name must be less than 100 characters'),
  version: z
    .string()
    .min(1, 'Version is required')
    .max(20, 'Version must be less than 20 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  publisher: z
    .string()
    .max(100, 'Publisher must be less than 100 characters')
    .optional(),
  characterSheetTemplate: GameSystemTemplateSchema.shape.characterSheetTemplate,
  rules: z.any().optional(),
  metadata: z.any().optional(),
});

export const UpdateGameSystemSchema = z.object({
  name: z
    .string()
    .min(1, 'Game system name is required')
    .max(100, 'Game system name must be less than 100 characters')
    .optional(),
  version: z
    .string()
    .min(1, 'Version is required')
    .max(20, 'Version must be less than 20 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  publisher: z
    .string()
    .max(100, 'Publisher must be less than 100 characters')
    .optional(),
  characterSheetTemplate:
    GameSystemTemplateSchema.shape.characterSheetTemplate.optional(),
  rules: z.any().optional(),
  metadata: z.any().optional(),
  isActive: z.boolean().optional(),
});

// Game Session validation schemas
export const GameSessionSettingsSchema = z.object({
  allowSpectators: z.boolean().optional(),
  recordSession: z.boolean().optional(),
  enableVoiceChat: z.boolean().optional(),
  enableVideoChat: z.boolean().optional(),
  diceRollVisibility: z.enum(['public', 'gm-only', 'private']).optional(),
  characterSheetSharing: z.enum(['full', 'limited', 'gm-only']).optional(),
  timeLimit: z.number().int().min(30).max(480).optional(), // 30 minutes to 8 hours
});

export const CreateGameSessionSchema = z.object({
  name: z
    .string()
    .min(1, 'Session name is required')
    .max(100, 'Session name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  scheduledAt: z.date().optional(),
  campaignId: CuidSchema,
  gmId: CuidSchema,
  settings: GameSessionSettingsSchema.optional(),
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
});

export const UpdateGameSessionSchema = z.object({
  name: z
    .string()
    .min(1, 'Session name is required')
    .max(100, 'Session name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  scheduledAt: z.date().optional(),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
  status: z
    .enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .optional(),
  settings: GameSessionSettingsSchema.optional(),
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
});

// Message validation schemas
export const MessageMetadataSchema = z.object({
  mentions: z.array(CuidSchema).optional(),
  reactions: z.record(z.string(), z.array(CuidSchema)).optional(),
  diceRolls: z
    .array(
      z.object({
        expression: z.string(),
        result: z.number(),
        rolls: z.array(z.number()),
      })
    )
    .optional(),
  characterAction: z
    .object({
      characterId: CuidSchema,
      action: z.string(),
      target: z.string().optional(),
    })
    .optional(),
  systemMessage: z
    .object({
      type: z.enum(['join', 'leave', 'roll', 'action']),
      data: z.any(),
    })
    .optional(),
});

export const CreateMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Message must be less than 2000 characters'),
  type: z
    .enum([
      'TEXT',
      'SYSTEM',
      'DICE_ROLL',
      'CHARACTER_ACTION',
      'GM_ANNOUNCEMENT',
    ])
    .optional(),
  metadata: MessageMetadataSchema.optional(),
  authorId: CuidSchema,
  gameSessionId: CuidSchema.optional(),
});

export const UpdateMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Message must be less than 2000 characters')
    .optional(),
  metadata: MessageMetadataSchema.optional(),
  isEdited: z.boolean().optional(),
});

// Campaign Member validation schemas
export const CreateCampaignMemberSchema = z.object({
  userId: CuidSchema,
  campaignId: CuidSchema,
  role: z.enum(['OWNER', 'GM', 'PLAYER', 'OBSERVER']).optional(),
});

export const UpdateCampaignMemberSchema = z.object({
  role: z.enum(['OWNER', 'GM', 'PLAYER', 'OBSERVER']).optional(),
  isActive: z.boolean().optional(),
});

// Auth validation schemas
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: EmailSchema,
  username: UsernameSchema,
  name: NameSchema.optional(),
  password: PasswordSchema,
});

// Health check validation schemas
export const HealthCheckSchema = z.object({
  checkDatabase: z.boolean().optional(),
  checkRedis: z.boolean().optional(),
  checkDisk: z.boolean().optional(),
});

// Filtering schemas
export const CampaignFiltersSchema = z.object({
  status: z
    .array(z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']))
    .optional(),
  visibility: z.array(z.enum(['PRIVATE', 'PUBLIC', 'UNLISTED'])).optional(),
  gameSystemId: CuidSchema.optional(),
  ownerId: CuidSchema.optional(),
  memberId: CuidSchema.optional(),
  search: z.string().max(100).optional(),
});

export const CharacterFiltersSchema = z.object({
  campaignId: CuidSchema.optional(),
  ownerId: CuidSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
});

export const GameSessionFiltersSchema = z.object({
  campaignId: CuidSchema.optional(),
  gmId: CuidSchema.optional(),
  status: z
    .array(z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']))
    .optional(),
  scheduledAfter: z.date().optional(),
  scheduledBefore: z.date().optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterSchema>;
export type CreateGameSystemInput = z.infer<typeof CreateGameSystemSchema>;
export type UpdateGameSystemInput = z.infer<typeof UpdateGameSystemSchema>;
export type CreateGameSessionInput = z.infer<typeof CreateGameSessionSchema>;
export type UpdateGameSessionInput = z.infer<typeof UpdateGameSessionSchema>;
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageSchema>;
export type CreateCampaignMemberInput = z.infer<
  typeof CreateCampaignMemberSchema
>;
export type UpdateCampaignMemberInput = z.infer<
  typeof UpdateCampaignMemberSchema
>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type HealthCheckInput = z.infer<typeof HealthCheckSchema>;
export type CampaignFiltersInput = z.infer<typeof CampaignFiltersSchema>;
export type CharacterFiltersInput = z.infer<typeof CharacterFiltersSchema>;
export type GameSessionFiltersInput = z.infer<typeof GameSessionFiltersSchema>;
