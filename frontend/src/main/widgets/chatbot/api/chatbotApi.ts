/**
 * 챗봇 API 클라이언트
 */

import { apiClient } from '../../shared/api/base/apiClient';
import type { ChatMessage } from './chatbot.types';

class ChatbotApi {
  /**
   * 챗봇 응답 요청
   */
  async getChatbotResponse(question: string, selectedProject?: string): Promise<ChatMessage> {
    const response = await apiClient.getChatbotResponse(question, selectedProject);
    
    return {
      id: Date.now().toString(),
      text: response.response,
      isUser: false,
      timestamp: new Date(),
      responseType: response.responseType,
      showEmailButton: response.showEmailButton
    };
  }

  /**
   * 사용량 상태 확인
   */
  async getUsageStatus(): Promise<{
    dailyCount: number;
    hourlyCount: number;
    timeUntilReset: number;
    isBlocked: boolean;
  }> {
    return apiClient.getChatUsageStatus();
  }

  /**
   * 헬스 체크
   */
  async healthCheck(): Promise<string> {
    return apiClient.healthCheck();
  }
}

export const chatbotApi = new ChatbotApi();
