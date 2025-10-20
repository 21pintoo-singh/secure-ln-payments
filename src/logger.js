/*
  Pino-based logger.
  Responsibilities:
  - Provides structured logging for info, error, warn events
  - Exports named functions for ESM compatibility:
      * info() → log general info
      * error() → log errors
      * warn() → log warnings
  - All logs include structured JSON suitable for observability/metrics
*/

import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level(label) { return { level: label }; }
  }
});

// named exports for ESM style
export const info = logger.info.bind(logger);
export const error = logger.error.bind(logger);
export const warn = logger.warn.bind(logger);
export default logger;
