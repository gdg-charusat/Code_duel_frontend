/**
 * Logger utility for error tracking and debugging
 * Stores logs in localStorage (dev mode) or can be extended for backend
 */

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  stackTrace?: string;
}

const LOGS_STORAGE_KEY = "app_error_logs";
const MAX_STORED_LOGS = 100;
const isDevelopment = import.meta.env.DEV;

/**
 * Format log entry for display
 */
const formatLogEntry = (entry: LogEntry): string => {
  const time = new Date(entry.timestamp).toLocaleTimeString();
  return `[${time}] ${entry.level}: ${entry.message}`;
};

/**
 * Get stored logs from localStorage
 */
export const getStoredLogs = (): LogEntry[] => {
  try {
    const stored = localStorage.getItem(LOGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to retrieve logs:", e);
    return [];
  }
};

/**
 * Save log entry to localStorage (with rotation)
 */
const saveLogToStorage = (entry: LogEntry): void => {
  try {
    const logs = getStoredLogs();
    logs.push(entry);

    // Keep only last MAX_STORED_LOGS
    if (logs.length > MAX_STORED_LOGS) {
      logs.splice(0, logs.length - MAX_STORED_LOGS);
    }

    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save log:", e);
  }
};

/**
 * Log error with full context
 */
export const logError = (
  message: string,
  context?: Record<string, any>,
  error?: Error
): void => {
  const entry: LogEntry = {
    level: LogLevel.ERROR,
    message,
    context,
    timestamp: new Date().toISOString(),
    stackTrace: error?.stack,
  };

  // Save to storage
  saveLogToStorage(entry);

  // Console output in development
  if (isDevelopment) {
    console.error(formatLogEntry(entry), { context, error });
  }
};

/**
 * Log warning
 */
export const logWarn = (
  message: string,
  context?: Record<string, any>
): void => {
  const entry: LogEntry = {
    level: LogLevel.WARN,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  saveLogToStorage(entry);

  if (isDevelopment) {
    console.warn(formatLogEntry(entry), context);
  }
};

/**
 * Log info
 */
export const logInfo = (
  message: string,
  context?: Record<string, any>
): void => {
  const entry: LogEntry = {
    level: LogLevel.INFO,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  saveLogToStorage(entry);

  if (isDevelopment) {
    console.info(formatLogEntry(entry), context);
  }
};

/**
 * Log debug info
 */
export const logDebug = (
  message: string,
  context?: Record<string, any>
): void => {
  const entry: LogEntry = {
    level: LogLevel.DEBUG,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  saveLogToStorage(entry);

  if (isDevelopment) {
    console.debug(formatLogEntry(entry), context);
  }
};

/**
 * Clear all stored logs
 */
export const clearLogs = (): void => {
  try {
    localStorage.removeItem(LOGS_STORAGE_KEY);
    if (isDevelopment) {
      console.log("Logs cleared");
    }
  } catch (e) {
    console.error("Failed to clear logs:", e);
  }
};

/**
 * Export logs for sharing/debugging
 */
export const exportLogs = (): string => {
  const logs = getStoredLogs();
  return JSON.stringify(logs, null, 2);
};

/**
 * Get error logs only
 */
export const getErrorLogs = (): LogEntry[] => {
  return getStoredLogs().filter((log) => log.level === LogLevel.ERROR);
};
