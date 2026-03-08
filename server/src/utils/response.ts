/**
 * Standardized API response format.
 * All API responses follow this envelope structure.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data?: T[];
  error?: string;
  metadata: {
    timestamp: string;
    version: string;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

const API_VERSION = '1.0.0';

/**
 * Create a successful response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      version: API_VERSION
    }
  };
}

/**
 * Create an error response
 */
export function errorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      version: API_VERSION
    }
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + data.length < total
      }
    }
  };
}
