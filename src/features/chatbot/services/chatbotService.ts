import { getChatbotResponse } from '../../../shared';

export class ChatbotService {
  static async sendMessage(message: string, selectedProject?: string): Promise<string> {
    try {
      const response = await getChatbotResponse(message, selectedProject);
      return response;
    } catch (error) {
      console.error('챗봇 응답 오류:', error);
      return '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.';
    }
  }
} 