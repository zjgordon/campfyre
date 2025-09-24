import { z } from 'zod';
import { TimestampFieldsSchema, IdSchema } from './shared';

// User status enum
export const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending',
]);

export type UserStatus = z.infer<typeof UserStatusSchema>;

// User role enum
export const UserRoleSchema = z.enum(['admin', 'user', 'moderator', 'guest']);

export type UserRole = z.infer<typeof UserRoleSchema>;

// Base user schema
export const BaseUserSchema = z.object({
  id: IdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  status: UserStatusSchema,
  role: UserRoleSchema,
});

export type BaseUser = z.infer<typeof BaseUserSchema>;

// User with timestamps
export const UserSchema = BaseUserSchema.extend(TimestampFieldsSchema.shape);

export type User = z.infer<typeof UserSchema>;

// User creation input
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
  avatar: z.string().url().optional(),
  role: UserRoleSchema.default('user'),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

// User update input
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  status: UserStatusSchema.optional(),
  role: UserRoleSchema.optional(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// User login input
export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginUser = z.infer<typeof LoginUserSchema>;

// User registration input
export const RegisterUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
});

export type RegisterUser = z.infer<typeof RegisterUserSchema>;

// User profile (public information)
export const UserProfileSchema = BaseUserSchema.pick({
  id: true,
  name: true,
  avatar: true,
  status: true,
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Auth token response
export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(),
  tokenType: z.literal('Bearer'),
});

export type AuthToken = z.infer<typeof AuthTokenSchema>;

// User session
export const UserSessionSchema = z.object({
  user: UserSchema,
  token: AuthTokenSchema,
});

export type UserSession = z.infer<typeof UserSessionSchema>;
