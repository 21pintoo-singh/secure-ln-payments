import pRetry from 'p-retry';

export async function withRetry(fn, opts = {}) {
  const { retries = 3, minTimeout = 200, factor = 2 } = opts;
  return pRetry(async (attempt) => {
    return fn(attempt);
  }, { retries, minTimeout, factor });
}
