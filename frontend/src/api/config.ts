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
  return 'https://rag-healthcare-insurance-claim-fraud.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

export type ErrorType = 
  | 'NETWORK_ERROR'
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

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to the AI backend server. Please verify your connection or try again.',
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
      message: 'AI provider rate limit reached. Switching to backup provider...',
      technicalDetails: msg
    };
  }

  if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('502')) {
    return {
      type: 'BACKEND_UNAVAILABLE',
      message: 'The backend service is temporarily booting up. Please try again in a few seconds.',
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
  retriesLeft: number = 3
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok && (response.status === 502 || response.status === 503) && retriesLeft > 0) {
      console.warn(`[API Client] Received ${response.status} from ${url}. Render container is waking up. Retrying...`);
      await new Promise(res => setTimeout(res, 3000));
      return fetchWithTimeout(endpoint, options, timeoutMs, retriesLeft - 1);
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (retriesLeft > 0) {
      const delay = (4 - retriesLeft) * 2000;
      console.warn(`[API Client] Connection to ${url} failed (${err.message}). Retrying attempt in ${delay / 1000}s for Render cold-start...`);
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
