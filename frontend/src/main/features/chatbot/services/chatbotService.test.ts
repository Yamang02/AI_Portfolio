import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetChatbotResponse = vi.fn();

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    getChatbotResponse: (...args: any[]) => mockGetChatbotResponse(...args),
  },
}));

import { apiClient } from '@/shared/api/apiClient';
import { ChatbotService } from './chatbotService';

describe('ChatbotService', () => {
  beforeEach(() => {
    mockGetChatbotResponse.mockReset();
  });

  it('정상 응답을 반환한다', async () => {
    mockGetChatbotResponse.mockResolvedValue({
      response: 'AI RESPONSE',
      responseType: 'SUCCESS',
      showEmailButton: false,
      isRateLimited: false,
    });

    const result = await ChatbotService.sendMessage('질문');

    expect(result.response).toBe('AI RESPONSE');
    expect(mockGetChatbotResponse).toHaveBeenCalledTimes(1);
  });

  it('API 오류 시 기본 응답을 반환한다', async () => {
    mockGetChatbotResponse.mockRejectedValue(new Error('network error'));

    const result = await ChatbotService.sendMessage('질문');

    expect(result.response).toContain('응답을 생성하는 중에 오류가 발생했습니다');
    expect(result.isRateLimited).toBe(false);
  });
});

