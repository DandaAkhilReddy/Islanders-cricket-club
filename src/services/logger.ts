/**
 * Centralized logging service
 * Replaces console.log/error/warn with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private enableConsole: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.enableConsole = this.isDevelopment || import.meta.env.VITE_ENABLE_LOGGING === 'true';
  }

  /**
   * Format log entry for display
   */
  private formatLog(entry: LogEntry): string {
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const dataStr = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${contextStr} ${entry.message}${dataStr}`;
  }

  /**
   * Send log to external service (TODO: implement with Sentry, LogRocket, etc.)
   */
  private async sendToService(entry: LogEntry): Promise<void> {
    // TODO: Implement external logging service integration
    // Example: Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.data });

    // For now, only send errors to avoid noise
    if (entry.level === 'error' && !this.isDevelopment) {
      // In production, send to monitoring service
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context,
    };

    // Console output in development or if explicitly enabled
    if (this.enableConsole) {
      const formattedLog = this.formatLog(entry);
      switch (level) {
        case 'debug':
          console.debug(formattedLog, data || '');
          break;
        case 'info':
          console.info(formattedLog, data || '');
          break;
        case 'warn':
          console.warn(formattedLog, data || '');
          break;
        case 'error':
          console.error(formattedLog, data || '');
          break;
      }
    }

    // Send to external service
    this.sendToService(entry);
  }

  /**
   * Debug level - verbose information for development
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: unknown, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Warning level - potential issues
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Error level - errors and exceptions
   */
  error(message: string, error?: unknown, context?: string): void {
    this.log('error', message, error, context);
  }

  /**
   * Log API errors with standardized format
   */
  apiError(endpoint: string, error: unknown, statusCode?: number): void {
    this.error(
      `API Error: ${endpoint}`,
      {
        endpoint,
        statusCode,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'API'
    );
  }

  /**
   * Log authentication events
   */
  authEvent(event: string, data?: unknown): void {
    this.info(`Auth: ${event}`, data, 'AUTH');
  }

  /**
   * Log navigation events
   */
  navigation(path: string, data?: unknown): void {
    this.debug(`Navigation: ${path}`, data, 'ROUTER');
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, duration: number, context?: string): void {
    this.debug(
      `Performance: ${metric}`,
      { duration: `${duration}ms` },
      context || 'PERF'
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
