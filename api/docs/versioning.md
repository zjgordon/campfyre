# API Versioning Strategy

## Overview

The Campfyre API implements a versioning strategy using tRPC procedures to ensure backward compatibility and smooth API evolution. This document outlines the versioning approach, implementation details, and best practices.

## Versioning Approach

### Supported Versions

- **v1**: Current stable version (default)
- **v2**: Enhanced version with additional features

### Version Detection

The API supports multiple methods for version detection:

1. **Path-based versioning**: `/trpc/v1/endpoint` or `/trpc/v2/endpoint`
2. **Accept header**: `Accept: application/vnd.campfyre.v1+json`
3. **Default fallback**: v1 when no version is specified

### Version Routing

```typescript
// Versioned routes
/trpc/1v /
  auth /
  login /
  trpc /
  v1 /
  games /
  list /
  trpc /
  v2 /
  health /
  status /
  // Legacy routes (backward compatibility)
  trpc /
  auth /
  login /
  trpc /
  games /
  list;
```

## Implementation Details

### Version Handler Middleware

The version handler middleware (`/api/src/middleware/versionHandler.ts`) automatically:

- Parses version from request path or headers
- Validates version support
- Adds version context to requests
- Sets appropriate response headers
- Handles deprecation warnings

### Version-Specific Routers

Each API version has its own router structure:

- **v1 Router** (`/api/src/routers/v1/index.ts`): Contains existing functionality
- **v2 Router** (`/api/src/routers/v2/index.ts`): Enhanced version with additional features

### Versioning Utilities

The versioning library (`/api/src/lib/versioning.ts`) provides:

- Version parsing and validation
- Support status checking
- Deprecation handling
- Error creation for unsupported versions

## Backward Compatibility

### Legacy Route Support

The API maintains backward compatibility by:

- Keeping existing routes at `/trpc/endpoint`
- Defaulting to v1 behavior for unversioned requests
- Preserving existing response formats

### Migration Strategy

When introducing breaking changes:

1. Create new version (e.g., v3)
2. Mark old version as deprecated
3. Set sunset date for old version
4. Provide migration guide
5. Remove old version after sunset period

## Error Handling

### Version-Specific Errors

```typescript
// Unsupported version error
{
  "error": "Unsupported API version",
  "supportedVersions": ["v1", "v2"],
  "defaultVersion": "v1"
}
```

### Deprecation Warnings

Deprecated versions include warning headers:

```
X-API-Deprecation-Warning: API version v1 is deprecated and will be sunset on 2024-12-31
X-API-Version: v1
```

## Best Practices

### For API Consumers

1. **Always specify version**: Use path-based versioning for clarity
2. **Handle deprecation warnings**: Monitor response headers
3. **Plan migrations**: Update to newer versions before sunset dates
4. **Test thoroughly**: Verify compatibility when upgrading

### For API Developers

1. **Maintain backward compatibility**: Avoid breaking changes in existing versions
2. **Document changes**: Clearly document differences between versions
3. **Provide migration guides**: Help consumers upgrade smoothly
4. **Monitor usage**: Track version adoption and deprecation impact

## Version Lifecycle

### Version States

- **Active**: Currently supported and maintained
- **Deprecated**: Still supported but scheduled for removal
- **Sunset**: No longer supported, requests return errors

### Version Timeline

```
v1 (Active) ──────────────────────────────────
v2 (Active) ──────────────────────────────────
v3 (Planned) ─────────────────────────────────
```

## Testing

### Version-Specific Tests

Each version should have comprehensive tests covering:

- Version detection and routing
- Response format validation
- Error handling
- Backward compatibility

### Integration Tests

Test scenarios include:

- Version switching
- Legacy route compatibility
- Deprecation warning handling
- Error responses for unsupported versions

## Monitoring and Observability

### Metrics to Track

- Version usage distribution
- Deprecation warning frequency
- Error rates by version
- Migration progress

### Logging

Version information is included in request logs:

```json
{
  "requestId": "req_123",
  "apiVersion": "v2",
  "endpoint": "/trpc/v2/health/check",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Future Considerations

### Planned Enhancements

- **v3**: Enhanced error handling and response formats
- **GraphQL support**: Alternative query language
- **Rate limiting**: Version-specific rate limits
- **Caching**: Version-aware caching strategies

### Long-term Strategy

- Maintain 2-3 active versions maximum
- 6-month deprecation notice for major versions
- Automated migration tools for common patterns
- Version-aware client SDKs

## Examples

### Client Usage

```typescript
// Using v1 (default)
const v1Client = createTRPCClient<AppRouter>({
  url: 'http://localhost:3000/trpc',
});

// Using v2 explicitly
const v2Client = createTRPCClient<AppRouter>({
  url: 'http://localhost:3000/trpc/v2',
});

// Using Accept header
const headerClient = createTRPCClient<AppRouter>({
  url: 'http://localhost:3000/trpc',
  headers: {
    Accept: 'application/vnd.campfyre.v2+json',
  },
});
```

### Response Examples

```typescript
// v1 response
{
  "ok": true,
  "service": "api",
  "version": "v1",
  "timestamp": "2024-01-15T10:30:00Z"
}

// v2 response (enhanced)
{
  "ok": true,
  "service": "api",
  "version": "v2",
  "timestamp": "2024-01-15T10:30:00Z",
  "features": {
    "versioning": true,
    "enhancedLogging": true
  }
}
```
