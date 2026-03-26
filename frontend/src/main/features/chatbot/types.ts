import type { ReactNode } from 'react';

export type { ResponseType, ChatbotResponse, BackendChatResponse } from '@/shared/types/api';

export interface ChatMessage {
  id: string;
  content: string | ReactNode;
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
