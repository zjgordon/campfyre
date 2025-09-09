# Error Shapes Contract

This document defines the standard error response format used across all Campfyre services.

## Success Response Format

All successful API responses follow this envelope pattern:

```json
{
  "ok": true,
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## Error Response Format

All error responses follow this envelope pattern:

```json
{
  "ok": false,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    // Additional error context
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## Standard Error Codes

### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `MISSING_REQUIRED_FIELD` - Required field is missing
- `INVALID_FORMAT` - Field format is invalid

### Authentication & Authorization
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `INVALID_CREDENTIALS` - Login credentials are invalid
- `TOKEN_EXPIRED` - Authentication token has expired

### Resource Errors
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists or conflict occurred
- `GONE` - Resource is no longer available

### Server Errors
- `INTERNAL_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `TIMEOUT` - Request timed out

### Rate Limiting
- `RATE_LIMITED` - Too many requests

## Example Error Responses

### Validation Error
```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "Invalid input provided",
  "details": {
    "field": "email",
    "reason": "Invalid email format",
    "value": "not-an-email"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### Not Found Error
```json
{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Story not found",
  "details": {
    "resource": "story",
    "id": "story_123"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### Internal Server Error
```json
{
  "ok": false,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "details": {
    "errorId": "err_987654321"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## Implementation Notes

- All error responses should include a unique `requestId` for tracing
- The `details` field should contain relevant context for debugging
- Error messages should be user-friendly but not expose sensitive information
- HTTP status codes should align with the error type (400 for validation, 401 for auth, etc.)
- All timestamps should be in ISO 8601 format with UTC timezone
