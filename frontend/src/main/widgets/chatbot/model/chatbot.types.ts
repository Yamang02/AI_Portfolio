/**
 * 챗봇 위젯 타입 정의
 */

// 챗봇 메시지 타입
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  responseType?: 'SUCCESS' | 'RATE_LIMITED' | 'CANNOT_ANSWER' | 'PERSONAL_INFO' | 'INVALID_INPUT' | 'SYSTEM_ERROR' | 'SPAM_DETECTED';
  showEmailButton?: boolean;
}

// 챗봇 위젯 Props
export interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  showProjectButtons?: boolean;
}

// 챗봇 상태
export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  isInitialized: boolean;
  selectedProject: string | null;
  usageStatus: {
    dailyCount: number;
    hourlyCount: number;
    timeUntilReset: number;
    isBlocked: boolean;
  } | null;
}

// 챗봇 액션
export interface ChatbotActions {
  sendMessage: (text: string) => Promise<void>;
  selectProject: (projectId: string | null) => void;
  resetChat: () => void;
}

// 질문 검증 결과
export interface QuestionValidationResult {
  isValid: boolean;
  message: string;
  reason?: string;
}
