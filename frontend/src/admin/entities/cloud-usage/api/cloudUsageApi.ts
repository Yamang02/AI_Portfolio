/**
 * Cloud Usage API 클라이언트
 */
import { CloudUsage, UsageTrend, ServiceBreakdown } from '../model/cloudUsage.types';

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

class CloudUsageApi {
  private baseUrl = `${API_BASE_URL}/api/admin/cloud-usage`;

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('[CloudUsageApi] Error response:', errorData);
      } catch {
        console.error('[CloudUsageApi] Failed to parse error response');
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data || result;
  }

  // ==================== AWS API ====================

  /**
   * AWS 현재 월 사용량 조회
   */
  async getAwsCurrent(): Promise<CloudUsage> {
    return this.request<CloudUsage>('/aws/current');
  }

  /**
   * AWS 비용 추이 조회
   */
  async getAwsTrend(days: number = 30): Promise<UsageTrend[]> {
    const result = await this.request<{ trends: UsageTrend[] }>(`/aws/trend?days=${days}`);
    // request() 메서드가 이미 result.data를 반환하므로 result.trends 사용
    return result?.trends || [];
  }

  /**
   * AWS 서비스별 비용 분석
   */
  async getAwsBreakdown(): Promise<ServiceBreakdown> {
    return this.request<ServiceBreakdown>('/aws/breakdown');
  }

  // ==================== GCP API ====================

  /**
   * GCP 현재 월 사용량 조회
   */
  async getGcpCurrent(): Promise<CloudUsage> {
    return this.request<CloudUsage>('/gcp/current');
  }

  /**
   * GCP 비용 추이 조회
   */
  async getGcpTrend(days: number = 30): Promise<UsageTrend[]> {
    const result = await this.request<{ trends: UsageTrend[] }>(`/gcp/trend?days=${days}`);
    // request() 메서드가 이미 result.data를 반환하므로 result.trends 사용
    return result?.trends || [];
  }

  /**
   * GCP 서비스별 비용 분석
   */
  async getGcpBreakdown(): Promise<ServiceBreakdown> {
    return this.request<ServiceBreakdown>('/gcp/breakdown');
  }
}

export const cloudUsageApi = new CloudUsageApi();

