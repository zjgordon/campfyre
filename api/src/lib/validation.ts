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
