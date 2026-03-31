export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/** 백엔드 챗봇 ResponseType과 동일한 구분값 */
export type ResponseType =
  | 'SUCCESS'
  | 'RATE_LIMITED'
  | 'CANNOT_ANSWER'
  | 'PERSONAL_INFO'
  | 'INVALID_INPUT'
  | 'SYSTEM_ERROR'
  | 'SPAM_DETECTED';

/** 백엔드 ChatResponse 본문 (ApiResponse.data) */
export interface BackendChatResponse {
  response: string;
  success: boolean;
  error?: string;
  showEmailButton: boolean;
  responseType: ResponseType;
  reason?: string;
}

/** 프론트에서 쓰는 챗봇 응답 (하이브리드·레거시 필드 포함) */
export interface ChatbotResponse {
  response: string;
  isRateLimited?: boolean;
  rateLimitMessage?: string;
  showEmailButton?: boolean;
  responseType?: ResponseType;
  reason?: string;
}

