export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 10_000,
} as const;

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.BASE_DELAY_MS * 2 ** attempt;
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY_MS);
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T | undefined> {
  let lastError: Error;

  for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === RETRY_CONFIG.MAX_RETRIES) {
        console.error(
          `${operationName} failed after ${RETRY_CONFIG.MAX_RETRIES + 1} attempts:`,
          lastError
        );
        throw lastError;
      }

      const delay = calculateBackoffDelay(attempt);
      console.warn(
        `${operationName} failed (attempt ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES + 1}), retrying in ${delay}ms:`,
        lastError.message
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
