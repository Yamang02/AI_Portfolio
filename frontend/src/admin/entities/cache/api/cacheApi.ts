import type { CacheStats } from '../model/cache.types';

const VITE_API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';
const API_BASE_URL = `${VITE_API_BASE_URL}/api/admin/cache`;

interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  timestamp?: number;
}

export const getCacheStats = async (): Promise<CacheStats> => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch cache stats.');
  }

  const result: AdminApiResponse<CacheStats> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch cache stats.');
  }
  return result.data;
};

export const getAllCacheKeys = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/keys`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch cache keys.');
  }

  const result: AdminApiResponse<string[]> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch cache keys.');
  }
  return result.data;
};

export const getCacheKeysByPattern = async (pattern: string): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/keys?pattern=${encodeURIComponent(pattern)}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch cache keys by pattern.');
  }

  const result: AdminApiResponse<string[]> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch cache keys by pattern.');
  }
  return result.data;
};

export const clearAllCache = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/flush`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to clear cache.');
  }

  const result: AdminApiResponse<void> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to clear cache.');
  }
};

export const clearCacheByPattern = async (pattern: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/pattern?pattern=${encodeURIComponent(pattern)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to clear cache by pattern.');
  }

  const result: AdminApiResponse<void> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to clear cache by pattern.');
  }
};
