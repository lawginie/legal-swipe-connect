/**
 * Structured Logging System
 * Provides observability with structured logs, metrics, and error tracking
 */

import { config } from '@/config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userType?: 'client' | 'lawyer' | 'base';
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
  error?: Error | string;
  reason?: any;
  promise?: any;
  stack?: string;
  port?: number;
  environment?: string;
  baseUrl?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private sessionId: string;
  private context: LogContext = {};

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configLevel = config.logging.level;
    return levels.indexOf(level) >= levels.indexOf(configLevel);
  }

  private formatLogEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this.context,
        ...context,
        sessionId: this.sessionId,
      }
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // Console logging
    if (config.logging.enableConsole) {
      const logMethod = entry.level === 'error' ? console.error :
                       entry.level === 'warn' ? console.warn :
                       entry.level === 'debug' ? console.debug :
                       console.log;

      logMethod(`[${entry.level.toUpperCase()}] ${entry.message}`, {
        timestamp: entry.timestamp,
        context: entry.context,
        ...(entry.error && { error: entry.error })
      });
    }

    // Remote logging (for production)
    if (config.logging.enableRemote && typeof window !== 'undefined') {
      // Store in localStorage for now, can be replaced with actual remote service
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    }
  }

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  debug(message: string, context?: LogContext): void {
    this.writeLog(this.formatLogEntry('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.writeLog(this.formatLogEntry('info', message, context));
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.writeLog(this.formatLogEntry('warn', message, context, error));
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.writeLog(this.formatLogEntry('error', message, context, error));
  }

  // Specialized logging methods
  userAction(action: string, context?: Omit<LogContext, 'action'>): void {
    this.info(`User action: ${action}`, { ...context, action });
  }

  apiCall(endpoint: string, method: string, duration?: number, context?: LogContext): void {
    this.info(`API call: ${method} ${endpoint}`, {
      ...context,
      action: 'api_call',
      metadata: { endpoint, method, duration }
    });
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      action: 'performance',
      metadata: { operation, duration }
    });
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, { ...context, action: 'security' });
  }
}

// Global logger instance
export const logger = new Logger();

// Performance measurement helper
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T> | T,
  context?: LogContext
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Performance measurement failed for ${operation}`, context, error as Error);
    throw error;
  }
};

// Error boundary helper
export const logError = (error: Error, context?: LogContext): void => {
  logger.error('Unhandled error', context, error);
};