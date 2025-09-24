import { z } from 'zod';
import { SuccessResponseSchema, PaginatedResponseSchema } from './shared';
import { UserSchema, UserProfileSchema, UserSessionSchema } from './user';
import { GameSchema, GameWithPlayersSchema } from './game';

// API version info
export const ApiVersionSchema = z.object({
  version: z.string(),
  build: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  timestamp: z.string().datetime(),
});

export type ApiVersion = z.infer<typeof ApiVersionSchema>;

// Health check response
export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  timestamp: z.string().datetime(),
  uptime: z.number(),
  version: z.string().optional(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Ping response
export const PingResponseSchema = z.object({
  ok: z.boolean(),
  msg: z.string(),
  timestamp: z.string().datetime().optional(),
});

export type PingResponse = z.infer<typeof PingResponseSchema>;

// API info response
export const ApiInfoSchema = z.object({
  message: z.string(),
  version: z.string(),
  status: z.string(),
  endpoints: z.array(z.string()).optional(),
});

export type ApiInfo = z.infer<typeof ApiInfoSchema>;

// User API responses
export const UserResponseSchema = SuccessResponseSchema.extend({
  data: UserSchema,
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const UserProfileResponseSchema = SuccessResponseSchema.extend({
  data: UserProfileSchema,
});

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

export const UserSessionResponseSchema = SuccessResponseSchema.extend({
  data: UserSessionSchema,
});

export type UserSessionResponse = z.infer<typeof UserSessionResponseSchema>;

export const UsersResponseSchema = PaginatedResponseSchema(UserProfileSchema);

export type UsersResponse = z.infer<typeof UsersResponseSchema>;

// Game API responses
export const GameResponseSchema = SuccessResponseSchema.extend({
  data: GameSchema,
});

export type GameResponse = z.infer<typeof GameResponseSchema>;

export const GameWithPlayersResponseSchema = SuccessResponseSchema.extend({
  data: GameWithPlayersSchema,
});

export type GameWithPlayersResponse = z.infer<
  typeof GameWithPlayersResponseSchema
>;

export const GamesResponseSchema = PaginatedResponseSchema(GameSchema);

export type GamesResponse = z.infer<typeof GamesResponseSchema>;

// Auth API responses
export const LoginResponseSchema = SuccessResponseSchema.extend({
  data: UserSessionSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterResponseSchema = SuccessResponseSchema.extend({
  data: UserSchema,
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LogoutResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    message: z.string(),
  }),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// Generic API responses
export type ApiResponse<T = any> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
  };
};

// tRPC procedure input/output types
export const TRPCProcedureSchema = z.object({
  input: z.any().optional(),
  output: z.any(),
});

export type TRPCProcedure = z.infer<typeof TRPCProcedureSchema>;
