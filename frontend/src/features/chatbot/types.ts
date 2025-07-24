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
  | 'SUCCESS'
  | 'RATE_LIMITED'
  | 'CANNOT_ANSWER'
  | 'PERSONAL_INFO'
  | 'INVALID_INPUT'
  | 'SYSTEM_ERROR'
  | 'SPAM_DETECTED';

// API 응답 타입
export interface ChatbotResponse {
  response: string;
  isRateLimited?: boolean;
  rateLimitMessage?: string;
  showEmailButton?: boolean;
  responseType?: ResponseType;
  reason?: string;
} 