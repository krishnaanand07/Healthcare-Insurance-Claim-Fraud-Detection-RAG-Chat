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

  if (msg.includes('HTTP 500') || msg.includes('500')) {
    return {
      type: 'SERVER_ERROR',
      message: 'The AI backend returned a server error (HTTP 500). Please try again.',
      technicalDetails: msg
    };
  }

  if (msg.includes('503') || msg.includes('502') || msg.includes('Service Unavailable')) {
    return {
      type: 'BACKEND_UNAVAILABLE',
      message: 'The backend service is waking up or temporarily unavailable. Please try again in a few seconds.',
      technicalDetails: msg
    };
  }

  if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('AbortError')) {
    return {
      type: 'TIMEOUT',
      message: 'The request took longer than expected. Please try again.',
      technicalDetails: msg
    };
  }

  if (msg.includes('429') || msg.includes('Rate limit') || msg.includes('rate limit')) {
    return {
      type: 'RATE_LIMIT',
      message: 'AI provider rate limit reached. Retrying request with secondary provider...',
      technicalDetails: msg
    };
  }

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to the AI backend server. Please verify your connection or try again.',
      technicalDetails: msg
    };
  }

  return {
    type: 'SERVER_ERROR',
    message: 'An error occurred while communicating with the AI service.',
    technicalDetails: msg
  };
};

export async function fetchWithTimeout(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 45000,
  retriesLeft: number = 2
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
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
    console.log(`[HealthCheck]\nmethod: ${method}\nurl: ${url}\nstatus: ${response.status}\nduration: ${duration}ms`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`HTTP 404: Endpoint ${endpoint} not found`);
      }
      if (response.status === 405) {
        throw new Error(`HTTP 405: Method ${method} not allowed on ${endpoint}`);
      }
      if ((response.status === 502 || response.status === 503) && retriesLeft > 0) {
        console.warn(`[API Client] Received HTTP ${response.status} from ${url}. Retrying...`);
        await new Promise(res => setTimeout(res, 2500));
        return fetchWithTimeout(endpoint, options, timeoutMs, retriesLeft - 1);
      }
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.warn(`[HealthCheck]\nmethod: ${method}\nurl: ${url}\nstatus: FAILED\nduration: ${duration}ms\nerror: ${err.message}`);

    if (retriesLeft > 0 && !err.message.includes('404') && !err.message.includes('405')) {
      const delay = (3 - retriesLeft) * 2000;
      await new Promise(res => setTimeout(res, delay));
      return fetchWithTimeout(endpoint, options, timeoutMs, retriesLeft - 1);
    }
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
