/**
 * Normalize URL for consistent lookup (handles root domains and subdomains)
 * @param url The URL to normalize
 * @returns Normalized domain name or null if invalid
 */
export function normalizeUrl(url: string): string | null {
  try {
    // Add protocol if missing
    let normalizedUrl = url;
    const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
    if (!hasProtocol) {
      normalizedUrl = `https://${url}`;
    }

    const urlObj = new URL(normalizedUrl);

    // Extract domain (hostname) for flexible matching
    // This allows matching both root domains and subdomains
    const domain = urlObj.hostname.toLowerCase();

    return domain;
  } catch (error) {
    console.warn(`Failed to normalize URL: ${url}`, error);
    return null;
  }
}
