import { z } from 'zod';

// Base response structure
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type BaseResponse = z.infer<typeof BaseResponseSchema>;

// Success response
export const SuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: z.any().optional(),
});

export type SuccessResponse<T = any> = z.infer<typeof SuccessResponseSchema> & {
  data?: T;
};

// Error response
export const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    statusCode: z.number(),
    timestamp: z.string(),
    path: z.string().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0),
  totalPages: z.number().min(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Paginated response
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  success: true;
  message: string;
  data: T[];
  pagination: Pagination;
};

// Common query parameters
export const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryParams = z.infer<typeof QueryParamsSchema>;

// ID parameter schema
export const IdSchema = z.string().min(1);

export type Id = z.infer<typeof IdSchema>;

// Timestamp fields
export const TimestampFieldsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TimestampFields = z.infer<typeof TimestampFieldsSchema>;
