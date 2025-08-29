import type { Platform } from '../models/persona-manager/types';
import { normalizeUrl } from './url';

export interface WebSocketPlatformData {
  query: {
    platform?: string;
    [key: string]: unknown;
  };
  headers: Record<string, string | undefined>;
}

export interface PlatformDetectionResult {
  platform: Platform | null;
  isValid: boolean;
  error?: string;
}

function validatePlatformName(
  platformName: string,
  platforms: Platform[]
): PlatformDetectionResult {
  const matchedPlatform = platforms.find((p) => p.name === platformName);

  if (matchedPlatform) {
    return { isValid: true, platform: matchedPlatform };
  }
  const availableNames = platforms.map((p) => p.name).join(', ');

  return {
    platform: null,
    isValid: false,
    error: `Invalid platform: ${platformName}. Available platforms: ${availableNames}`,
  };
}

function detectPlatformFromUrl(
  url: string,
  headerType: 'Origin' | 'Host',
  platforms: Platform[]
): PlatformDetectionResult | null {
  try {
    const normalizedUrl = normalizeUrl(url);
    if (normalizedUrl) {
      const platform = platforms.find((p) => p.url === normalizedUrl);
      if (platform) {
        console.log(
          `Platform detected and validated from ${headerType} header: ${platform.name} (${url})`
        );
        return { platform, isValid: true };
      }
    }
  } catch (error) {
    console.warn(`Failed to parse ${headerType} header: ${url}`, error);
  }
  return null;
}

function getLocalhostPlatform(
  host: string | undefined,
  platforms: Platform[]
): PlatformDetectionResult | null {
  if (
    !(host && (host.includes('localhost') || host.startsWith('localhost:')))
  ) {
    return null;
  }

  if (platforms.length === 0) {
    return null;
  }

  const firstPlatform = platforms[0];
  console.log(
    `Localhost detected, using first available platform: ${firstPlatform.name}`
  );
  return { platform: firstPlatform, isValid: true };
}

export function detectPlatform(
  platforms: Platform[],
  wsData: WebSocketPlatformData
): PlatformDetectionResult {
  // 1. Check query parameter
  if (wsData.query.platform) {
    const validation = validatePlatformName(wsData.query.platform, platforms);

    if (validation.isValid && validation.platform) {
      console.log(
        `Platform validated from query parameter: ${wsData.query.platform}`
      );
      return { platform: validation.platform, isValid: true };
    }

    console.warn(
      `Invalid platform specified in query parameter: ${wsData.query.platform}. ${validation.error}`
    );
    return {
      platform: null,
      isValid: false,
      error: validation.error,
    };
  }

  // 2. Check Origin header
  const origin = wsData.headers.origin || wsData.headers.Origin;
  if (origin) {
    const result = detectPlatformFromUrl(origin, 'Origin', platforms);
    if (result) return result;
  }

  // 3. Check Host header for platform URL
  const host = wsData.headers.host || wsData.headers.Host;
  if (host) {
    const result = detectPlatformFromUrl(host, 'Host', platforms);
    if (result) return result;

    // 4. Check for localhost fallback
    const localhostResult = getLocalhostPlatform(host, platforms);
    if (localhostResult) return localhostResult;
  }

  console.log(
    'No platform detected from query parameter, Origin, or Host headers'
  );

  return {
    platform: null,
    isValid: true,
  };
}
