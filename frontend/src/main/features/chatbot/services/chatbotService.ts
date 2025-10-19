import { apiClient } from '../../../../shared/services/apiClient';

export class ChatbotService {
  static async sendMessage(message: string, selectedProject?: string): Promise<{ response: string; isRateLimited?: boolean; rateLimitMessage?: string }> {
    try {
      const response = await apiClient.getChatbotResponse(message, selectedProject);
      return response;
    } catch (error) {
      console.error('챗봇 응답 오류:', error);
      return {
        response: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        isRateLimited: false
      };
    }
  }
} 