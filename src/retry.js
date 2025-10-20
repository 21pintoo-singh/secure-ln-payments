/*
  Provides generic retry logic for async functions.
  Responsibilities:
  - withRetry(fn, opts): Retries a function with exponential backoff
      * retries: number of attempts
      * minTimeout: initial delay
      * factor: multiplier for backoff
  - Uses p-retry package
  - Used by LightsparkIntegrator to retry payments on transient failures
*/

import pRetry from 'p-retry';

export async function withRetry(fn, opts = {}) {
  const { retries = 3, minTimeout = 200, factor = 2 } = opts;
  return pRetry(async (attempt) => {
    return fn(attempt);
  }, { retries, minTimeout, factor });
}
