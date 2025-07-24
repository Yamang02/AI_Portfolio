export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  projectContext?: string;
  showEmailButton?: boolean;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  selectedProject?: string;
}

export interface ChatbotProps {
  // 필요한 경우 props 추가
}

// 백엔드 ResponseType과 일치하는 타입 정의
export type ResponseType = 
  | 'SUCCESS'           // 정상적인 AI 응답
  | 'RATE_LIMITED'      // 사용량 제한 초과
  | 'CANNOT_ANSWER'     // AI가 답변할 수 없는 질문
  | 'PERSONAL_INFO'     // 개인정보 요청 감지
  | 'INVALID_INPUT'     // 입력 검증 실패
  | 'SYSTEM_ERROR'      // 실제 시스템 오류
  | 'SPAM_DETECTED';    // 스팸 패턴 감지

// API 응답 타입 (하이브리드 방식)
export interface ChatbotResponse {
  response: string;                    // 응답 메시지
  isRateLimited?: boolean;             // 사용량 제한 여부 (레거시 호환성)
  rateLimitMessage?: string;           // 사용량 제한 메시지 (레거시 호환성)
  showEmailButton?: boolean;           // 메일 버튼 표시 여부
  responseType?: ResponseType;         // 응답 타입 (새로운 방식)
  reason?: string;                     // 상세 이유
}

// 백엔드 API 응답 구조
export interface ApiResponse<T> {
  success: boolean;                    // API 호출 성공 여부
  message: string;                     // API 응답 메시지
  data?: T;                           // 실제 데이터
  error?: string;                     // 시스템 오류 메시지
}

// 백엔드 ChatResponse 구조
export interface BackendChatResponse {
  response: string;                    // 응답 메시지
  success: boolean;                    // 비즈니스 로직 성공 여부
  error?: string;                     // 오류 메시지
  showEmailButton: boolean;           // 메일 버튼 표시 여부
  responseType: ResponseType;         // 응답 타입
  reason?: string;                    // 상세 이유
} 