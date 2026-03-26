import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import { apiClient } from '@/shared/api/apiClient';
import type { ChatMessage as ChatMessageModel } from '@/main/features/chatbot/types';
import { processQuestion } from '@/main/features/chatbot/utils/questionValidator';

const STORAGE_KEY = 'chatPageMessages';

export function useChatMessages(refreshUsageStatus: () => void | Promise<void>) {
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const hasUserMessages = useMemo(
    () => messages.some(msg => msg.isUser || (msg.id !== 'initial' && !msg.isUser)),
    [messages]
  );

  const shouldShowEmptyState = useMemo(() => !hasUserMessages, [hasUserMessages]);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  const persistMessages = useCallback((next: ChatMessageModel[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('로컬스토리지에 메시지 저장 실패:', error);
    }
  }, []);

  const resetChatbot = useCallback(() => {
    setSelectedProject(null);
    setMessages([]);
    setIsInitialized(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('로컬스토리지에서 메시지 삭제 실패:', error);
    }
  }, []);

  const initializeChatbot = useCallback(() => {
    if (isInitialized) return;

    const savedMessages = localStorage.getItem(STORAGE_KEY);
    let loadedMessages: ChatMessageModel[] = [];

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as Array<Record<string, unknown>>;
        loadedMessages = parsed.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp as string) : new Date(),
        })) as ChatMessageModel[];
      } catch (error) {
        console.error('로컬스토리지에서 메시지 불러오기 실패:', error);
      }
    }

    if (loadedMessages.length === 0) {
      const initialMessage: ChatMessageModel = {
        id: 'initial',
        content:
          '안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.\n\n궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요.\n\n예시:\n"A작업물 기획의도를 알려줘."\n"B작업물 기술스택 알려줘"\n\n💡 AI 답변은 실제 정보와 다를 수 있으니 참고용으로만 활용해 주세요.',
        isUser: false,
        timestamp: new Date(),
      };
      loadedMessages = [initialMessage];
    }

    setMessages(loadedMessages);
    setIsInitialized(true);

    if (
      loadedMessages.length > 1 ||
      (loadedMessages.length === 1 && loadedMessages[0].id !== 'initial')
    ) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isInitialized, scrollToBottom]);

  useEffect(() => {
    if (!isInitialized) {
      initializeChatbot();
    }
  }, [isInitialized, initializeChatbot]);

  useEffect(() => {
    const isEmptyState = !hasUserMessages;
    if (isEmptyState) return;

    if (messages.length > 0 || isLoading) {
      const timer = setTimeout(() => scrollToBottom(true), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, hasUserMessages, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleMessagesScroll = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      const userMessage: ChatMessageModel = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'initial');
        const newMessages = [...filteredMessages, userMessage];
        persistMessages(newMessages);
        return newMessages;
      });
      setIsLoading(true);

      try {
        const questionProcessing = processQuestion(message);

        let aiResponseText: React.ReactNode;
        let showEmailButton = false;

        if (questionProcessing.validationError) {
          aiResponseText = (
            <span className="text-red-600 font-medium">⚠️ {questionProcessing.validationError}</span>
          );
        } else if (questionProcessing.immediateResponse) {
          aiResponseText = questionProcessing.immediateResponse;
          showEmailButton = questionProcessing.showEmailButton;
        } else if (questionProcessing.shouldSendToBackend) {
          const response = await apiClient.getChatbotResponse(message, selectedProject || undefined);
          const responseType = response.responseType;

          if (responseType === 'RATE_LIMITED' || response.isRateLimited) {
            aiResponseText = <span className="text-red-600 font-medium">⚠️ {response.response}</span>;
            showEmailButton = true;
          } else if (responseType === 'CANNOT_ANSWER') {
            aiResponseText = <span>{response.response}</span>;
            showEmailButton = true;
          } else if (responseType === 'PERSONAL_INFO') {
            aiResponseText = <span>{response.response}</span>;
            showEmailButton = true;
          } else if (responseType === 'INVALID_INPUT' || responseType === 'SPAM_DETECTED') {
            aiResponseText = <span className="text-red-600 font-medium">⚠️ {response.response}</span>;
            showEmailButton = response.showEmailButton || false;
          } else if (responseType === 'SYSTEM_ERROR') {
            aiResponseText = <span className="text-red-600 font-medium">⚠️ {response.response}</span>;
            showEmailButton = true;
          } else {
            aiResponseText = response.response;
            showEmailButton = response.showEmailButton || false;
          }

          if (!response.isRateLimited) {
            void refreshUsageStatus();
          }
        } else {
          aiResponseText = '';
        }

        const aiMessage: ChatMessageModel = {
          id: (Date.now() + 1).toString(),
          content: aiResponseText,
          isUser: false,
          timestamp: new Date(),
          showEmailButton,
        };

        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          persistMessages(newMessages);
          return newMessages;
        });
      } catch (error) {
        console.error('메시지 전송 오류:', error);
        const errorMessage: ChatMessageModel = {
          id: (Date.now() + 1).toString(),
          content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
          isUser: false,
          timestamp: new Date(),
          showEmailButton: true,
        };
        setMessages(prev => {
          const newMessages = [...prev, errorMessage];
          persistMessages(newMessages);
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, selectedProject, persistMessages, refreshUsageStatus]
  );

  return {
    messages,
    isLoading,
    messagesEndRef,
    messagesContainerRef,
    isScrolling,
    shouldShowEmptyState,
    handleSendMessage,
    handleMessagesScroll,
    resetChatbot,
  };
}
