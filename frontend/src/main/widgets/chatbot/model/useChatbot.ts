/**
 * 챗봇 위젯 훅
 */

import { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '../api/chatbotApi';
import { processQuestion } from '../lib/questionValidator';
import type { ChatMessage, ChatbotState, ChatbotActions } from './chatbot.types';

/**
 * 챗봇 위젯 상태 관리 훅
 */
export const useChatbot = () => {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    isInitialized: false,
    selectedProject: null,
    usageStatus: null
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  // 초기화
  const initializeChatbot = async () => {
    try {
      setState(prev => ({ ...prev, isInitialized: true }));
      
      // 사용량 상태 확인
      const usageStatus = await chatbotApi.getUsageStatus();
      setState(prev => ({ ...prev, usageStatus }));

      // 초기 메시지 추가
      if (usageStatus.isBlocked) {
        const initialMessage: ChatMessage = {
          id: '1',
          text: '죄송합니다. 현재 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
          isUser: false,
          timestamp: new Date(),
          responseType: 'RATE_LIMITED'
        };
        setState(prev => ({ ...prev, messages: [initialMessage] }));
      } else {
        const initialMessage: ChatMessage = {
          id: '1',
          text: '안녕하세요! 포트폴리오에 대해 궁금한 것이 있으시면 언제든지 물어보세요. 프로젝트, 기술 스택, 경험 등에 대해 답변해드릴 수 있습니다.',
          isUser: false,
          timestamp: new Date(),
          responseType: 'SUCCESS'
        };
        setState(prev => ({ ...prev, messages: [initialMessage] }));
      }
    } catch (error) {
      console.error('챗봇 초기화 오류:', error);
      const errorMessage: ChatMessage = {
        id: '1',
        text: '챗봇을 초기화하는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.',
        isUser: false,
        timestamp: new Date(),
        responseType: 'SYSTEM_ERROR'
      };
      setState(prev => ({ ...prev, messages: [errorMessage] }));
    }
  };

  // 메시지 전송
  const sendMessage = async (text: string) => {
    if (!text.trim() || state.isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    try {
      // 질문 검증
      const validationResult = processQuestion(text);
      if (!validationResult.isValid) {
        const validationMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: validationResult.message,
          isUser: false,
          timestamp: new Date(),
          responseType: 'INVALID_INPUT'
        };
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, validationMessage],
          isLoading: false
        }));
        return;
      }

      // API 호출
      const botMessage = await chatbotApi.getChatbotResponse(text, state.selectedProject || undefined);
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));

      // 사용량 상태 업데이트
      if (botMessage.responseType === 'RATE_LIMITED') {
        const usageStatus = await chatbotApi.getUsageStatus();
        setState(prev => ({ ...prev, usageStatus }));
      }

    } catch (error) {
      console.error('메시지 전송 오류:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 메시지를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
        responseType: 'SYSTEM_ERROR'
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));
    }
  };

  // 프로젝트 선택
  const selectProject = (projectId: string | null) => {
    setState(prev => ({ ...prev, selectedProject: projectId }));
  };

  // 채팅 초기화
  const resetChat = () => {
    setState(prev => ({
      ...prev,
      messages: [],
      isInitialized: false,
      selectedProject: null
    }));
  };

  const actions: ChatbotActions = {
    sendMessage,
    selectProject,
    resetChat
  };

  return {
    ...state,
    ...actions,
    initializeChatbot,
    messagesEndRef
  };
};
