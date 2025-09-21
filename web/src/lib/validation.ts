/* eslint-disable no-unused-vars */
import { z } from 'zod';
import {
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordData,
  UpdateUserProfileData,
  UpdateUserPreferencesData,
  UserPreferences,
  PrivacyPreferences,
  GamePreferences,
  GameSettings,
  GameSearchFilters,
  GameSessionSearchFilters,
  UserSearchFilters,
  Theme,
  Language,
  GameDifficulty,
  GameCategory,
  Visibility,
  Status,
} from '../types';

// Common validation patterns
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  );

export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .min(2, 'Display name must be at least 2 characters')
  .max(50, 'Display name must be less than 50 characters');

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: displayNameSchema,
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
    acceptMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User profile schemas
export const userProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  avatar: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

// User preferences schemas
export const userPreferencesUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z
    .enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'])
    .optional(),
  timezone: z.string().optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
  accessibility: z
    .object({
      highContrast: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      screenReader: z.boolean().optional(),
      keyboardNavigation: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      profileVisibility: z
        .enum(['public', 'private', 'team', 'unlisted'])
        .optional(),
      showEmail: z.boolean().optional(),
      showOnlineStatus: z.boolean().optional(),
      allowDirectMessages: z.boolean().optional(),
      allowGameInvites: z.boolean().optional(),
      allowFriendRequests: z.boolean().optional(),
      dataSharing: z.boolean().optional(),
      analytics: z.boolean().optional(),
    })
    .optional(),
  game: z
    .object({
      defaultGameSettings: z
        .object({
          maxPlayers: z.number().min(2).max(20).optional(),
          timeLimit: z.number().min(5).max(180).optional(),
          difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
          autoStart: z.boolean().optional(),
          allowSpectators: z.boolean().optional(),
        })
        .optional(),
      notifications: z
        .object({
          gameInvites: z.boolean().optional(),
          gameResults: z.boolean().optional(),
          achievements: z.boolean().optional(),
          leaderboard: z.boolean().optional(),
        })
        .optional(),
      display: z
        .object({
          showAchievements: z.boolean().optional(),
          showStats: z.boolean().optional(),
          compactMode: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Game schemas
export const createGameSchema = z.object({
  name: z
    .string()
    .min(1, 'Game name is required')
    .min(3, 'Game name must be at least 3 characters')
    .max(50, 'Game name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  category: z.enum([
    'word',
    'number',
    'trivia',
    'strategy',
    'puzzle',
    'creative',
    'social',
    'competitive',
    'cooperative',
    'educational',
    'party',
    'quick',
    'brain',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  minPlayers: z
    .number()
    .min(1, 'Minimum 1 player required')
    .max(20, 'Maximum 20 players allowed'),
  maxPlayers: z
    .number()
    .min(2, 'Minimum 2 players required')
    .max(20, 'Maximum 20 players allowed'),
  estimatedDuration: z
    .number()
    .min(1, 'Minimum 1 minute duration')
    .max(180, 'Maximum 180 minutes duration'),
  rules: z.string().min(10, 'Rules must be at least 10 characters'),
  instructions: z
    .array(z.string().min(1, 'Instruction cannot be empty'))
    .min(1, 'At least one instruction required'),
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty'))
    .max(10, 'Maximum 10 tags allowed'),
});

export const gameSettingsSchema = z.object({
  timeLimit: z
    .number()
    .min(5, 'Minimum 5 seconds')
    .max(3600, 'Maximum 3600 seconds')
    .optional(),
  roundLimit: z
    .number()
    .min(1, 'Minimum 1 round')
    .max(100, 'Maximum 100 rounds')
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  allowSpectators: z.boolean(),
  autoStart: z.boolean(),
  autoStartDelay: z
    .number()
    .min(0, 'Minimum 0 seconds delay')
    .max(300, 'Maximum 300 seconds delay'),
  allowLateJoin: z.boolean(),
  allowRejoin: z.boolean(),
  customRules: z.record(z.string(), z.any()).optional(),
});

export const joinGameSchema = z.object({
  gameSessionId: z.string().min(1, 'Game session ID is required'),
  playerName: displayNameSchema,
});

// Project schemas
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(50, 'Project name must be less than 50 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  visibility: z.enum(['public', 'private', 'team']).default('private'),
});

// Settings schemas
export const userPreferencesFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().min(2).max(10).default('en'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    inApp: z.boolean().default(true),
  }),
  accessibility: z.object({
    highContrast: z.boolean().default(false),
    reducedMotion: z.boolean().default(false),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  }),
});

// Contact/support schemas
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  category: z.enum(['bug', 'feature', 'support', 'other']).default('support'),
});

// Search schemas
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters'),
  filters: z
    .object({
      type: z.enum(['all', 'games', 'projects', 'users']).optional(),
      dateRange: z.enum(['all', 'day', 'week', 'month', 'year']).optional(),
    })
    .optional(),
});

// Export type inference helpers - now using shared types
export type LoginFormData = LoginCredentials;
export type RegisterFormData = RegisterData;
export type ResetPasswordFormData = PasswordResetRequest;
export type ChangePasswordFormData = ChangePasswordData;
export type UserProfileFormData = UpdateUserProfileData;
export type CreateGameFormData = z.infer<typeof createGameSchema>;
export type JoinGameFormData = z.infer<typeof joinGameSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UserPreferencesFormData = UpdateUserPreferencesData;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type GameSettingsFormData = GameSettings;

// Schema registry for easy access
export const schemas = {
  auth: {
    login: loginSchema,
    register: registerSchema,
    resetPassword: resetPasswordSchema,
    changePassword: changePasswordSchema,
  },
  user: {
    profile: userProfileSchema,
    preferences: userPreferencesFormSchema,
  },
  game: {
    create: createGameSchema,
    join: joinGameSchema,
  },
  project: {
    create: createProjectSchema,
  },
  contact: contactFormSchema,
  search: searchSchema,
} as const;

export default schemas;
