/**
 * Cloud Usage API 클라이언트
 */
import { CloudUsage, UsageTrend, ServiceBreakdown } from '../model/cloudUsage.types';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data: T;
}

const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

class CloudUsageApi {
  private baseUrl = `${API_BASE_URL}/api/admin/cloud-usage`;

  private async request<T>(
    endpoint: string,
    errorMessage: string,
    init?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include',
      ...init,
    });

    const result = await response.json() as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(result?.message || result?.error || errorMessage);
    }

    return result.data;
  }

  // ==================== AWS API ====================

  async getAwsCurrent(): Promise<CloudUsage> {
    return this.request<CloudUsage>('/aws/current', 'AWS 현재 월 사용량 조회 실패');
  }

  async getAwsTrend(days: number = 30): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      `/aws/trend?days=${days}`,
      'AWS 비용 추이 조회 실패'
    );
    return data ?? [];
  }

  async getAwsTrend30Days(granularity: 'daily' | 'monthly' = 'monthly'): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      `/aws/trend/30days?granularity=${granularity}`,
      'AWS 30일 비용 추이 조회 실패'
    );
    return data ?? [];
  }

  async getAwsTrend6Months(): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      '/aws/trend/6months',
      'AWS 6개월 비용 추이 조회 실패'
    );
    return data ?? [];
  }

  async getAwsBreakdown(): Promise<ServiceBreakdown> {
    return this.request<ServiceBreakdown>('/aws/breakdown', 'AWS 서비스별 비용 분석 조회 실패');
  }

  // ==================== GCP API ====================

  async getGcpCurrent(): Promise<CloudUsage> {
    return this.request<CloudUsage>('/gcp/current', 'GCP 현재 월 사용량 조회 실패');
  }

  async getGcpTrend(days: number = 30): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      `/gcp/trend?days=${days}`,
      'GCP 비용 추이 조회 실패'
    );
    return data ?? [];
  }

  async getGcpTrend30Days(granularity: 'daily' | 'monthly' = 'daily'): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      `/gcp/trend/30days?granularity=${granularity}`,
      'GCP 30일 비용 추이 조회 실패'
    );
    return data ?? [];
  }

  async getGcpTrend6Months(): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      '/gcp/trend/6months',
      'GCP 6개월 비용 추이 조회 실패'
    );
    return data ?? [];
  }

  async getGcpBreakdown(): Promise<ServiceBreakdown> {
    return this.request<ServiceBreakdown>('/gcp/breakdown', 'GCP 서비스별 비용 분석 조회 실패');
  }

  // ==================== Custom Search API ====================

  async searchUsageTrend(
    provider: 'AWS' | 'GCP',
    startDate: string,
    endDate: string,
    granularity: 'daily' | 'monthly' = 'daily'
  ): Promise<UsageTrend[]> {
    const data = await this.request<UsageTrend[] | undefined>(
      `/search?provider=${provider}&startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`,
      '비용 검색 실패'
    );
    return data ?? [];
  }
}

export const cloudUsageApi = new CloudUsageApi();
