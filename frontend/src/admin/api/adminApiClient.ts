/**
 * Admin API 클라이언트
 * 
 * 모든 Admin API 호출의 중앙 집중식 클라이언트
 * - 세션 쿠키 기반 인증
 * - 일관된 에러 처리
 * - 공통 헤더 관리
 * - ApiResponse<T> 구조 지원
 */

import { message } from 'antd';
import { ApiError } from './types';
import { ApiResponse } from '@/shared/types/api';

// 개발 환경: 빈 문자열 사용하여 Vite 프록시로 same-origin 쿠키 전송
// 프로덕션: 실제 API 서버 URL 사용
const API_BASE_URL = import.meta.env?.DEV
  ? ''
  : (import.meta.env?.VITE_API_BASE_URL || '');

export class AdminApiClient {
  private baseURL = '/api/admin';

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * 파일 업로드 (FormData)
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData, // Content-Type은 브라우저가 자동 설정
    });
    return this.handleResponse<T>(response);
  }

  /**
   * URL 빌더 (쿼리 파라미터 포함)
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = `${API_BASE_URL}${this.baseURL}${endpoint}`;
    
    // 상대 경로인 경우 (API_BASE_URL이 빈 문자열)
    if (!API_BASE_URL) {
      const url = new URL(baseUrl, window.location.origin);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // 배열인 경우 여러 번 append
            if (Array.isArray(value)) {
              value.forEach((item) => {
                url.searchParams.append(key, String(item));
              });
            } else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }
      
      return url.pathname + url.search;
    }
    
    // 절대 경로인 경우
    const url = new URL(baseUrl, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // 배열인 경우 여러 번 append
          if (Array.isArray(value)) {
            value.forEach((item) => {
              url.searchParams.append(key, String(item));
            });
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }
    
    return url.toString();
  }

  /**
   * 공통 헤더
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 응답 처리
   * ApiResponse<T> 구조를 지원합니다: { success, message, data, error }
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // 204 No Content 처리
    if (response.status === 204) {
      return {} as T;
    }

    // JSON 파싱 시도
    let jsonData: any;
    try {
      jsonData = await response.json();
    } catch (error) {
      // JSON 파싱 실패 시
      if (!response.ok) {
        const apiError: ApiError = {
          message: '응답을 파싱할 수 없습니다.',
          status: response.status,
        };
        this.showErrorToast(apiError);
        throw apiError;
      }
      return {} as T;
    }

    // ApiResponse 구조 확인
    if (jsonData && typeof jsonData === 'object' && 'success' in jsonData) {
      const apiResponse = jsonData as ApiResponse<T>;
      
      // success가 false이거나 HTTP 에러 상태인 경우
      if (!apiResponse.success || !response.ok) {
        const apiError: ApiError = {
          message: apiResponse.error || apiResponse.message || '요청 처리 중 오류가 발생했습니다.',
          status: response.status,
        };
        this.showErrorToast(apiError);
        throw apiError;
      }

      // success가 true인 경우 data 반환
      return apiResponse.data as T;
    }

    // ApiResponse 구조가 아닌 경우 (직접 데이터 반환)
    if (!response.ok) {
      const error = await this.parseError(response);
      this.showErrorToast(error);
      throw error;
    }

    return jsonData as T;
  }

  /**
   * 에러 파싱
   * ApiResponse 구조도 고려합니다
   */
  private async parseError(response: Response): Promise<ApiError> {
    try {
      const data = await response.json();
      
      // ApiResponse 구조인 경우
      if (data && typeof data === 'object' && 'success' in data) {
        const apiResponse = data as ApiResponse<any>;
        return {
          message: apiResponse.error || apiResponse.message || '요청 처리 중 오류가 발생했습니다.',
          status: response.status,
          code: (data as any).code,
        };
      }
      
      // 일반 에러 구조
      return {
        message: data.message || data.error || '요청 처리 중 오류가 발생했습니다.',
        status: response.status,
        code: data.code,
      };
    } catch {
      return {
        message: '요청 처리 중 오류가 발생했습니다.',
        status: response.status,
      };
    }
  }

  /**
   * 에러 토스트 표시
   */
  private showErrorToast(error: ApiError): void {
    if (error.status === 401) {
      message.error('로그인이 필요합니다.');
    } else if (error.status === 403) {
      message.error('권한이 없습니다.');
    } else if (error.status === 404) {
      message.error('요청한 리소스를 찾을 수 없습니다.');
    } else if (error.status >= 500) {
      message.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      message.error(error.message);
    }
  }
}

// 싱글톤 인스턴스
export const adminApiClient = new AdminApiClient();
