/**
 * Structured logging utility.
 * Replaces console.log with proper structured logging.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

function formatLogEntry(entry: LogEntry): string {
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] ${entry.level}: ${entry.message}${contextStr}`;
}

function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  };

  const formatted = formatLogEntry(entry);

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug(message: string, context?: Record<string, any>): void {
    log(LogLevel.DEBUG, message, context);
  },

  info(message: string, context?: Record<string, any>): void {
    log(LogLevel.INFO, message, context);
  },

  warn(message: string, context?: Record<string, any>): void {
    log(LogLevel.WARN, message, context);
  },

  error(message: string, error?: Error | Record<string, any>): void {
    if (error instanceof Error) {
      log(LogLevel.ERROR, message, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      log(LogLevel.ERROR, message, error);
    }
  }
};
