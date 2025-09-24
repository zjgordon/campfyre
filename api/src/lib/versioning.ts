import { TRPCError } from '@trpc/server';

export type ApiVersion = 'v1' | 'v2';

export interface VersionInfo {
  version: ApiVersion;
  supported: boolean;
  deprecated?: boolean;
  sunsetDate?: string;
}

export const SUPPORTED_VERSIONS: Record<ApiVersion, VersionInfo> = {
  v1: {
    version: 'v1',
    supported: true,
    deprecated: false,
  },
  v2: {
    version: 'v2',
    supported: true,
    deprecated: false,
  },
};

export const DEFAULT_VERSION: ApiVersion = 'v1';

/**
 * Parse API version from request path or header
 */
export function parseApiVersion(
  path: string,
  acceptHeader?: string
): ApiVersion {
  // Check path for version (e.g., /trpc/v1/auth/login)
  const pathMatch = path.match(/\/trpc\/(v\d+)/);
  if (pathMatch) {
    const version = pathMatch[1] as ApiVersion;
    if (isValidVersion(version)) {
      return version;
    }
  }

  // Check Accept header for version
  if (acceptHeader) {
    const headerMatch = acceptHeader.match(
      /application\/vnd\.campfyre\.(v\d+)/
    );
    if (headerMatch) {
      const version = headerMatch[1] as ApiVersion;
      if (isValidVersion(version)) {
        return version;
      }
    }
  }

  return DEFAULT_VERSION;
}

/**
 * Validate if a version string is supported
 */
export function isValidVersion(version: string): version is ApiVersion {
  return version in SUPPORTED_VERSIONS;
}

/**
 * Get version information for a given version
 */
export function getVersionInfo(version: ApiVersion): VersionInfo {
  return SUPPORTED_VERSIONS[version];
}

/**
 * Check if a version is supported
 */
export function isVersionSupported(version: ApiVersion): boolean {
  return SUPPORTED_VERSIONS[version]?.supported ?? false;
}

/**
 * Check if a version is deprecated
 */
export function isVersionDeprecated(version: ApiVersion): boolean {
  return SUPPORTED_VERSIONS[version]?.deprecated ?? false;
}

/**
 * Create a version-specific error for unsupported versions
 */
export function createVersionError(version: string): TRPCError {
  return new TRPCError({
    code: 'BAD_REQUEST',
    message: `Unsupported API version: ${version}`,
    cause: {
      code: 'UNSUPPORTED_VERSION',
      supportedVersions: Object.keys(SUPPORTED_VERSIONS),
      defaultVersion: DEFAULT_VERSION,
    },
  });
}

/**
 * Create a deprecation warning for deprecated versions
 */
export function createDeprecationWarning(version: ApiVersion): string {
  const versionInfo = getVersionInfo(version);
  if (versionInfo.deprecated && versionInfo.sunsetDate) {
    return `API version ${version} is deprecated and will be sunset on ${versionInfo.sunsetDate}`;
  }
  return `API version ${version} is deprecated`;
}

/**
 * Get the latest stable version
 */
export function getLatestVersion(): ApiVersion {
  const versions = Object.keys(SUPPORTED_VERSIONS) as ApiVersion[];
  const latestVersion = versions[versions.length - 1];
  if (!latestVersion) {
    return DEFAULT_VERSION;
  }
  return latestVersion;
}
