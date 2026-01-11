/**
 * Admin API 공통 타입 정의
 */

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
