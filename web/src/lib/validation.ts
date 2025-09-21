import { z } from 'zod';

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

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
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
  name: nameSchema,
  email: emailSchema,
  avatar: z.string().url().optional().or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
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
  maxPlayers: z
    .number()
    .min(2, 'Minimum 2 players required')
    .max(10, 'Maximum 10 players allowed'),
  isPrivate: z.boolean().optional().default(false),
  timeLimit: z
    .number()
    .min(5, 'Minimum 5 minutes')
    .max(180, 'Maximum 180 minutes')
    .optional(),
});

export const joinGameSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  playerName: nameSchema,
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
export const userPreferencesSchema = z.object({
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

// Export type inference helpers
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type CreateGameFormData = z.infer<typeof createGameSchema>;
export type JoinGameFormData = z.infer<typeof joinGameSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;

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
    preferences: userPreferencesSchema,
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
