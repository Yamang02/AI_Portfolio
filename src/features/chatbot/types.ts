export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  projectContext?: string;
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