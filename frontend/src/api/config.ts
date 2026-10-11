/**
 * Centralized Production API Configuration & Client Module
 */

// Determine API Base URL dynamically
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If running in local browser environment, default to localhost:8000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }

  // Production Fallback: Render Deployed Service Primary URL
  return 'https://healthcare-insurance-claim-fraud-uu8l.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'BACKEND_UNAVAILABLE'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'AUTH_ERROR'
  | 'SERVER_ERROR'
  | 'LLM_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  technicalDetails?: string;
}

export const formatUserErrorMessage = (error: any): AppError => {
  const msg = error?.message || String(error || '');

  if (msg.includes('HTTP 404') || msg.includes('404')) {
    return {
      type: 'NOT_FOUND',
      message: 'The requested API endpoint was not found (HTTP 404).',
      technicalDetails: msg
    };
  }

  if (msg.includes('HTTP 405') || msg.includes('405')) {
    return {
      type: 'METHOD_NOT_ALLOWED',
      message: 'HTTP Method Not Allowed (HTTP 405).',
      technicalDetails: msg
    };
  }

  if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('AbortError')) {
    return {
      type: 'TIMEOUT',
      message: 'The AI investigation took longer than 60 seconds. The backend may still be processing.',
      technicalDetails: msg
    };
  }

  if (msg.includes('503') || msg.includes('502') || msg.includes('Service Unavailable') || msg.includes('Bad Gateway')) {
    return {
      type: 'BACKEND_UNAVAILABLE',
      message: 'The backend service is waking up from sleep (Render cold start). Please retry in 10-15 seconds.',
      technicalDetails: msg
    };
  }

  if (msg.includes('HTTP 500') || msg.includes('500') || msg.includes('Server Error') || msg.includes('Internal Server Error')) {
    return {
      type: 'SERVER_ERROR',
      message: 'The AI investigation pipeline encountered an internal server error. Please retry.',
      technicalDetails: msg
    };
  }

  if (msg.includes('429') || msg.includes('Rate limit') || msg.includes('rate limit')) {
    return {
      type: 'RATE_LIMIT',
      message: 'AI provider rate limit reached. The system is falling back to secondary providers.',
      technicalDetails: msg
    };
  }

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection issue or request was blocked. Please verify your connection.',
      technicalDetails: msg
    };
  }

  return {
    type: 'SERVER_ERROR',
    message: msg.length > 120 ? 'An error occurred during AI investigation. Please try again.' : msg,
    technicalDetails: msg
  };
};

export async function fetchWithTimeout(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 60000,
  retriesLeft: number = 1
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Construct URL cleanly without duplicate slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
  const method = options.method || 'GET';
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const duration = Date.now() - startTime;
    console.log(`[API Client] ${method} ${url} -> status=${response.status} in ${duration}ms`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`HTTP 404: Endpoint ${cleanEndpoint} not found`);
      }
      if (response.status === 405) {
        throw new Error(`HTTP 405: Method ${method} not allowed on ${cleanEndpoint}`);
      }
      // Only retry transient 502/503 server wakeup errors
      if ((response.status === 502 || response.status === 503) && retriesLeft > 0) {
        console.warn(`[API Client] Received HTTP ${response.status} from ${url}. Retrying after delay...`);
        await new Promise(res => setTimeout(res, 2500));
        return fetchWithTimeout(endpoint, options, timeoutMs, retriesLeft - 1);
      }

      // Extract error details from response body if available
      let errorDetail = '';
      try {
        const errJson = await response.clone().json();
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(`HTTP ${response.status}: ${errorDetail || 'Server error'}`);
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.warn(`[API Client] ${method} ${url} FAILED in ${duration}ms: ${err.message}`);

    // If client timed out, DO NOT retry to avoid compounding delays
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs / 1000}s`);
    }

    // Only retry network errors if not a client abort or 4xx error
    if (retriesLeft > 0 && !err.message.includes('404') && !err.message.includes('405') && !err.message.includes('timeout')) {
      const delay = 2000;
      await new Promise(res => setTimeout(res, delay));
      return fetchWithTimeout(endpoint, options, timeoutMs, retriesLeft - 1);
    }

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
