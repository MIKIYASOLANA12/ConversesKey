/**
 * Structured logger for server-side use.
 *
 * Rules:
 * - Never log passwords, API keys, tokens, or sensitive content
 * - Always include requestId when available
 * - Use appropriate log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const isDev = process.env.NODE_ENV === 'development';

  // Skip debug logs in production
  if (level === 'debug' && !isDev) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ?? {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

/** Generate a short request ID for tracing */
export function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
