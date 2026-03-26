import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import type { ChatMessage } from '@/main/features/chatbot/types';

const mockProcessQuestion = vi.fn();
const mockGetChatbotResponse = vi.fn();

vi.mock('@/main/features/chatbot/utils/questionValidator', () => ({
  processQuestion: (...args: any[]) => mockProcessQuestion(...args),
}));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    getChatbotResponse: (...args: any[]) => mockGetChatbotResponse(...args),
  },
}));

import { useChatMessages } from './useChatMessages';

describe('useChatMessages', () => {
  beforeEach(() => {
    localStorage.clear();
    mockProcessQuestion.mockReset();
    mockGetChatbotResponse.mockReset();
  });

  it('메시지 전송 시 사용자/AI 메시지가 추가된다', async () => {
    // given: 초기화 후 shouldSendToBackend=true 경로
    mockProcessQuestion.mockReturnValue({
      shouldSendToBackend: true,
      showEmailButton: false,
    });

    mockGetChatbotResponse.mockResolvedValue({
      response: 'AI REPLY',
      responseType: 'SUCCESS',
      showEmailButton: false,
      isRateLimited: false,
      rateLimitMessage: undefined,
      reason: undefined,
    });

    const refreshUsageStatus = vi.fn();
    const { result } = renderHook(() => useChatMessages(refreshUsageStatus));

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(1);
      expect(result.current.messages[0]?.id).toBe('initial');
    });

    await act(async () => {
      await result.current.handleSendMessage('테스트 질문');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
    });

    const [userMsg, aiMsg] = result.current.messages as ChatMessage[];
    expect(userMsg.isUser).toBe(true);
    expect(userMsg.content).toBe('테스트 질문');
    expect(aiMsg.isUser).toBe(false);
    expect(aiMsg.content).toBe('AI REPLY');
    expect(refreshUsageStatus).toHaveBeenCalled();
  });

  it('resetChatbot 호출 시 메시지가 초기 상태로 돌아간다', async () => {
    mockProcessQuestion.mockReturnValue({
      shouldSendToBackend: true,
      showEmailButton: false,
    });

    mockGetChatbotResponse.mockResolvedValue({
      response: 'AI REPLY',
      responseType: 'SUCCESS',
      showEmailButton: false,
      isRateLimited: false,
      rateLimitMessage: undefined,
      reason: undefined,
    });

    const refreshUsageStatus = vi.fn();
    const { result } = renderHook(() => useChatMessages(refreshUsageStatus));

    await waitFor(() => {
      expect(result.current.messages[0]?.id).toBe('initial');
    });

    await act(async () => {
      await result.current.handleSendMessage('테스트 질문');
    });

    expect(result.current.messages.some(m => m.isUser)).toBe(true);

    await act(() => {
      result.current.resetChatbot();
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
      expect(result.current.messages[0]?.id).toBe('initial');
    });

    expect(localStorage.getItem('chatPageMessages')).toBeNull();
    expect(result.current.messages.some(m => m.isUser)).toBe(false);
  });
});

