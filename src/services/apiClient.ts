import { logger } from './logger';

/**
 * API Client Configuration
 */
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiError extends Error {
  statusCode?: number;
  response?: unknown;
}

/**
 * Delay helper for retry logic
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const calculateBackoff = (attempt: number, baseDelay: number): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
};

/**
 * Enterprise-grade API client with retry logic, timeouts, and error handling
 */
class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000, // 30 seconds default
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000, // 1 second base delay
      headers: config.headers || {
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Create abort controller with timeout
   */
  private createAbortController(timeout: number): {
    controller: AbortController;
    timeoutId: NodeJS.Timeout;
  } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return { controller, timeoutId };
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError) {
      // Network errors (offline, DNS failure, etc.)
      return true;
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as ApiError).statusCode;
      // Retry on 5xx errors and 429 (rate limit)
      return statusCode ? statusCode >= 500 || statusCode === 429 : false;
    }

    return false;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async fetchWithRetry(
    url: string,
    config: RequestConfig = {},
    attempt: number = 0
  ): Promise<Response> {
    const timeout = config.timeout || this.config.timeout;
    const maxRetries = config.retries !== undefined ? config.retries : this.config.retries;
    const retryDelay = config.retryDelay || this.config.retryDelay;

    const { controller, timeoutId } = this.createAbortController(timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
        headers: {
          ...this.config.headers,
          ...config.headers,
        },
      });

      clearTimeout(timeoutId);

      // Successful response
      if (response.ok) {
        return response;
      }

      // Create error for non-ok responses
      const error: ApiError = new Error(`HTTP Error: ${response.status}`);
      error.statusCode = response.status;
      error.response = await response.json().catch(() => null);

      // Retry if applicable
      if (attempt < maxRetries && this.isRetryableError(error)) {
        const backoffDelay = calculateBackoff(attempt, retryDelay);
        logger.warn(
          `Request failed, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`,
          { url, statusCode: response.status },
          'API'
        );
        await delay(backoffDelay);
        return this.fetchWithRetry(url, config, attempt + 1);
      }

      throw error;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: ApiError = new Error(`Request timeout after ${timeout}ms`);
        logger.error('Request timeout', { url, timeout }, 'API');
        throw timeoutError;
      }

      // Retry on network errors
      if (attempt < maxRetries && this.isRetryableError(error)) {
        const backoffDelay = calculateBackoff(attempt, retryDelay);
        logger.warn(
          `Network error, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`,
          { url, error },
          'API'
        );
        await delay(backoffDelay);
        return this.fetchWithRetry(url, config, attempt + 1);
      }

      // Log final error
      logger.apiError(url, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'GET',
    });
    return response.json();
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'DELETE',
    });
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
