import { FastifyRequest, FastifyReply } from 'fastify';
import {
  parseApiVersion,
  isVersionSupported,
  isVersionDeprecated,
  createDeprecationWarning,
  ApiVersion,
} from '../lib/versioning';

export interface VersionContext {
  apiVersion: ApiVersion;
  isDeprecated: boolean;
  deprecationWarning?: string;
}

/**
 * Middleware to handle API versioning
 * Extracts version from path or headers and adds version context
 */
export function createVersionHandler() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const path = request.url;
    const acceptHeader = request.headers.accept;

    // Parse version from request
    const apiVersion = parseApiVersion(path, acceptHeader);

    // Check if version is supported
    if (!isVersionSupported(apiVersion)) {
      reply.code(400).send({
        error: 'Unsupported API version',
        supportedVersions: ['v1', 'v2'],
        defaultVersion: 'v1',
      });
      return;
    }

    // Check if version is deprecated
    const isDeprecated = isVersionDeprecated(apiVersion);
    const deprecationWarning = isDeprecated
      ? createDeprecationWarning(apiVersion)
      : undefined;

    // Add version context to request
    (request as any).versionContext = {
      apiVersion,
      isDeprecated,
      deprecationWarning,
    } as VersionContext;

    // Add deprecation warning to response headers if applicable
    if (isDeprecated && deprecationWarning) {
      reply.header('X-API-Deprecation-Warning', deprecationWarning);
    }

    // Add version info to response headers
    reply.header('X-API-Version', apiVersion);
  };
}

/**
 * Extract version context from request
 */
export function getVersionContext(
  request: FastifyRequest
): VersionContext | undefined {
  return (request as any).versionContext;
}

/**
 * Get API version from request
 */
export function getApiVersion(request: FastifyRequest): ApiVersion {
  const context = getVersionContext(request);
  return context?.apiVersion ?? 'v1';
}
