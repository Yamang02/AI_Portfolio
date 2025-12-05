/**
 * Cloud Usage React Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { cloudUsageApi } from './cloudUsageApi';
import { CloudUsage, UsageTrend, ServiceBreakdown } from '../model/cloudUsage.types';

// 캐시 TTL: 6시간 (백엔드와 동기화)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// ==================== AWS Hooks ====================

/**
 * AWS 현재 월 사용량 조회
 */
export const useAwsCurrentUsage = () => {
  return useQuery<CloudUsage>({
    queryKey: ['cloudUsage', 'aws', 'current'],
    queryFn: () => cloudUsageApi.getAwsCurrent(),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * AWS 비용 추이 조회
 */
export const useAwsUsageTrend = (days: number = 30) => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'aws', 'trend', days],
    queryFn: () => cloudUsageApi.getAwsTrend(days),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * AWS 지난 30일 비용 추이 조회 (일별/월별)
 */
export const useAwsUsageTrend30Days = (granularity: 'daily' | 'monthly' = 'monthly') => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'aws', 'trend30days', granularity],
    queryFn: () => cloudUsageApi.getAwsTrend30Days(granularity),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * AWS 지난 6개월 비용 추이 조회 (월별)
 */
export const useAwsUsageTrend6Months = () => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'aws', 'trend6months'],
    queryFn: () => cloudUsageApi.getAwsTrend6Months(),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * AWS 서비스별 비용 분석
 */
export const useAwsBreakdown = () => {
  return useQuery<ServiceBreakdown>({
    queryKey: ['cloudUsage', 'aws', 'breakdown'],
    queryFn: () => cloudUsageApi.getAwsBreakdown(),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

// ==================== GCP Hooks ====================

/**
 * GCP 현재 월 사용량 조회
 */
export const useGcpCurrentUsage = () => {
  return useQuery<CloudUsage>({
    queryKey: ['cloudUsage', 'gcp', 'current'],
    queryFn: () => cloudUsageApi.getGcpCurrent(),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * GCP 비용 추이 조회
 */
export const useGcpUsageTrend = (days: number = 30) => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'gcp', 'trend', days],
    queryFn: () => cloudUsageApi.getGcpTrend(days),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * GCP 지난 30일 비용 추이 조회 (일별/월별)
 */
export const useGcpUsageTrend30Days = (granularity: 'daily' | 'monthly' = 'daily') => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'gcp', 'trend30days', granularity],
    queryFn: () => cloudUsageApi.getGcpTrend30Days(granularity),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * GCP 지난 6개월 비용 추이 조회 (월별)
 */
export const useGcpUsageTrend6Months = () => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'gcp', 'trend6months'],
    queryFn: () => cloudUsageApi.getGcpTrend6Months(),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * GCP 서비스별 비용 분석
 */
export const useGcpBreakdown = () => {
  return useQuery<ServiceBreakdown>({
    queryKey: ['cloudUsage', 'gcp', 'breakdown'],
    queryFn: () => cloudUsageApi.getGcpBreakdown(),
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};

// ==================== Custom Search Hooks ====================

/**
 * 커스텀 기간 비용 추이 조회
 */
export const useSearchUsageTrend = (
  provider: 'AWS' | 'GCP' | null,
  startDate: string | null,
  endDate: string | null,
  granularity: 'daily' | 'monthly' = 'daily',
  enabled: boolean = false
) => {
  return useQuery<UsageTrend[]>({
    queryKey: ['cloudUsage', 'search', provider, startDate, endDate, granularity],
    queryFn: () => {
      if (!provider || !startDate || !endDate) {
        throw new Error('Provider, startDate, and endDate are required');
      }
      return cloudUsageApi.searchUsageTrend(provider, startDate, endDate, granularity);
    },
    enabled: enabled && !!provider && !!startDate && !!endDate,
    staleTime: CACHE_TTL_MS,
    refetchOnWindowFocus: false,
  });
};




