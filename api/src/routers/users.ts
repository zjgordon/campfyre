import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  executePrismaOperation,
  validatePaginationParams,
  getPrismaClientForTRPC,
} from '../lib/trpcHelpers';
import type { UserResponse, UsersListResponse } from '../types/trpc';

// Input validation schemas
const listUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

const getUserSchema = z.object({
  id: z.string().uuid(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  name: z.string().min(1).max(100),
  password: z.string().min(8).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.record(z.any()).optional(),
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.record(z.any()).optional(),
});

const deleteUserSchema = z.object({
  id: z.string().uuid(),
});

export const usersRouter = router({
  list: publicProcedure
    .input(listUsersSchema)
    .query(async ({ input, ctx }): Promise<UsersListResponse> => {
      const { page, limit, skip } = validatePaginationParams(input);

      const prisma = getPrismaClientForTRPC();

      const where: any = {};
      if (input.search) {
        where.OR = [
          { email: { contains: input.search, mode: 'insensitive' } },
          { username: { contains: input.search, mode: 'insensitive' } },
          { name: { contains: input.search, mode: 'insensitive' } },
        ];
      }
      if (input.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      const [data, total] = await executePrismaOperation(
        () =>
          Promise.all([
            prisma.user.findMany({
              where,
              skip,
              take: limit,
              orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
          ]),
        ctx
      );

      return {
        success: true,
        message: 'Users retrieved successfully',
        timestamp: new Date().toISOString(),
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }),

  get: publicProcedure
    .input(getUserSchema)
    .query(async ({ input, ctx }): Promise<UserResponse> => {
      const prisma = getPrismaClientForTRPC();

      const user = await executePrismaOperation(
        () => prisma.user.findUnique({ where: { id: input.id } }),
        ctx
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        timestamp: new Date().toISOString(),
        data: user,
      };
    }),

  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }): Promise<UserResponse> => {
      const prisma = getPrismaClientForTRPC();

      const user = await executePrismaOperation(
        () =>
          prisma.user.create({
            data: {
              email: input.email,
              username: input.username,
              name: input.name,
              bio: input.bio || null,
              preferences: input.preferences || {},
              isActive: true,
            },
          }),
        ctx
      );

      return {
        success: true,
        message: 'User created successfully',
        timestamp: new Date().toISOString(),
        data: user,
      };
    }),

  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }): Promise<UserResponse> => {
      const { id, ...updateData } = input;
      const prisma = getPrismaClientForTRPC();

      const user = await executePrismaOperation(
        () =>
          prisma.user.update({
            where: { id },
            data: {
              ...(updateData.email && { email: updateData.email }),
              ...(updateData.username && { username: updateData.username }),
              ...(updateData.name && { name: updateData.name }),
              ...(updateData.bio !== undefined && {
                bio: updateData.bio || null,
              }),
              ...(updateData.preferences && {
                preferences: updateData.preferences,
              }),
            },
          }),
        ctx
      );

      return {
        success: true,
        message: 'User updated successfully',
        timestamp: new Date().toISOString(),
        data: user,
      };
    }),

  delete: publicProcedure
    .input(deleteUserSchema)
    .mutation(async ({ input, ctx }) => {
      const prisma = getPrismaClientForTRPC();

      await executePrismaOperation(
        () => prisma.user.delete({ where: { id: input.id } }),
        ctx
      );

      return {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
        data: { deletedId: input.id },
      };
    }),
});
