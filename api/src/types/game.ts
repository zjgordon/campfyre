import { z } from 'zod';
import { TimestampFieldsSchema, IdSchema } from './shared';

// Game status enum
export const GameStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
]);

export type GameStatus = z.infer<typeof GameStatusSchema>;

// Game type enum
export const GameTypeSchema = z.enum([
  'campaign',
  'oneshot',
  'sandbox',
  'adventure',
]);

export type GameType = z.infer<typeof GameTypeSchema>;

// Game difficulty enum
export const GameDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export type GameDifficulty = z.infer<typeof GameDifficultySchema>;

// Base game schema
export const BaseGameSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: GameTypeSchema,
  difficulty: GameDifficultySchema,
  status: GameStatusSchema,
  maxPlayers: z.number().min(1).max(20),
  currentPlayers: z.number().min(0).max(20),
  gameMasterId: IdSchema,
  tags: z.array(z.string()).default([]),
  settings: z.record(z.any()).optional(),
});

export type BaseGame = z.infer<typeof BaseGameSchema>;

// Game with timestamps
export const GameSchema = BaseGameSchema.extend(TimestampFieldsSchema.shape);

export type Game = z.infer<typeof GameSchema>;

// Game creation input
export const CreateGameSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: GameTypeSchema,
  difficulty: GameDifficultySchema,
  maxPlayers: z.number().min(1).max(20),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export type CreateGame = z.infer<typeof CreateGameSchema>;

// Game update input
export const UpdateGameSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  type: GameTypeSchema.optional(),
  difficulty: GameDifficultySchema.optional(),
  status: GameStatusSchema.optional(),
  maxPlayers: z.number().min(1).max(20).optional(),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export type UpdateGame = z.infer<typeof UpdateGameSchema>;

// Game join input
export const JoinGameSchema = z.object({
  gameId: IdSchema,
  characterName: z.string().min(1).max(50).optional(),
  characterDescription: z.string().max(500).optional(),
});

export type JoinGame = z.infer<typeof JoinGameSchema>;

// Game leave input
export const LeaveGameSchema = z.object({
  gameId: IdSchema,
});

export type LeaveGame = z.infer<typeof LeaveGameSchema>;

// Game player schema
export const GamePlayerSchema = z.object({
  userId: IdSchema,
  gameId: IdSchema,
  characterName: z.string().optional(),
  characterDescription: z.string().optional(),
  joinedAt: z.string().datetime(),
  isGameMaster: z.boolean().default(false),
});

export type GamePlayer = z.infer<typeof GamePlayerSchema>;

// Game with players
export const GameWithPlayersSchema = GameSchema.extend({
  players: z.array(GamePlayerSchema),
});

export type GameWithPlayers = z.infer<typeof GameWithPlayersSchema>;

// Game search filters
export const GameFiltersSchema = z.object({
  status: GameStatusSchema.optional(),
  type: GameTypeSchema.optional(),
  difficulty: GameDifficultySchema.optional(),
  gameMasterId: IdSchema.optional(),
  tags: z.array(z.string()).optional(),
  minPlayers: z.number().min(0).optional(),
  maxPlayers: z.number().min(1).optional(),
});

export type GameFilters = z.infer<typeof GameFiltersSchema>;
