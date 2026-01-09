import React, { useState, useRef, useEffect, useMemo } from 'react';

import { apiClient } from '@/shared/api/apiClient';
import { ChatInputBar } from '@/shared/ui/chat';
import { ContactModal } from '@/shared/ui/modal';

import { ChatMessage as ChatMessageType } from '@/main/features/chatbot/types';
import { ChatMessage } from '@/main/features/chatbot/components/ChatMessage';
import { processQuestion } from '@/main/features/chatbot/utils/questionValidator';

import { Button, Spinner, Modal } from '@/design-system';
import { PageMeta } from '@/shared/ui/page-meta';

import {
  EasterEggProvider,
  EasterEggLayer,
  useEasterEggEscapeKey,
  useKeyboardTrigger,
  useScrollTrigger,
  useEasterEggTrigger,
  easterEggRegistry,
} from '@/main/features/easter-eggs';
import { loadEasterEggConfig } from '@/main/features/easter-eggs/config/easterEggConfigLoader';

import styles from './ChatPage.module.css';

const ChatPageContent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [usageStatus, setUsageStatus] = useState<{
    dailyCount: number;
    hourlyCount: number;
    timeUntilReset: number;
    isBlocked: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // ESC 키로 이스터에그 종료
  useEasterEggEscapeKey();

  // PgDn 키 3번 누르면 이스터에그 트리거
  useKeyboardTrigger({
    easterEggId: 'demon-slayer-effect',
    key: 'PageDown',
    targetCount: 3,
    timeWindow: 3000, // 3초 내에 3번 눌러야 함
  });

  // 위에서 아래로 빠르게 스크롤하면 이스터에그 트리거
  useScrollTrigger({
    easterEggId: 'demon-slayer-effect',
    timeWindow: 5000, // 5초 이내
  });

  // 입력값으로 이스터에그 트리거
  useEasterEggTrigger({
    inputValue,
    debounceMs: 300,
  });

  // 사용자가 메시지를 보냈는지 확인 (초기 메시지 제외)
  const hasUserMessages = useMemo(() => {
    return messages.some(msg => msg.isUser || (msg.id !== 'initial' && !msg.isUser));
  }, [messages]);

  // 메시지가 추가되거나 로딩 상태가 변경될 때 하단으로 스크롤
  const scrollToBottom = (smooth: boolean = true) => {
    const container = messagesContainerRef.current;
    if (container) {
      // 스크롤을 최하단으로 이동 (입력 필드 바로 위까지)
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // 사용량 제한 상태 로드
  const loadUsageStatus = async () => {
    try {
      const status = await apiClient.getChatUsageStatus();
      setUsageStatus(status);
    } catch (error) {
      console.error('사용량 제한 상태 로드 오류:', error);
    }
  };

  // 페이지 로드 시 사용량 제한 상태 로드
  useEffect(() => {
    loadUsageStatus();
  }, []);

  // 챗봇 완전 초기화
  const resetChatbot = () => {
    setSelectedProject(null);
    setMessages([]);
    setIsInitialized(false);
    // 로컬스토리지에서 메시지 삭제
    try {
      localStorage.removeItem('chatPageMessages');
    } catch (error) {
      console.error('로컬스토리지에서 메시지 삭제 실패:', error);
    }
  };

  // 모달 열기 이벤트 리스너
  useEffect(() => {
    const handleOpenModal = () => {
      setIsContactModalOpen(true);
    };

    window.addEventListener('openContactModal', handleOpenModal);

    // resetChatbot 이벤트 리스너 추가
    const handleResetChatbot = () => {
      resetChatbot();
    };
    window.addEventListener('resetChatbot', handleResetChatbot);

    return () => {
      window.removeEventListener('openContactModal', handleOpenModal);
      window.removeEventListener('resetChatbot', handleResetChatbot);
    };
  }, []);

  // 챗봇 초기화
  const initializeChatbot = () => {
    if (!isInitialized) {
      // 로컬스토리지에서 메시지 불러오기
      const savedMessages = localStorage.getItem('chatPageMessages');
      let loadedMessages: ChatMessageType[] = [];
      
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          // 타임스탬프 문자열을 Date 객체로 변환
          loadedMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
        } catch (error) {
          console.error('로컬스토리지에서 메시지 불러오기 실패:', error);
        }
      }

      // 불러온 메시지가 없으면 초기 메시지 표시
      if (loadedMessages.length === 0) {
        const initialMessage: ChatMessageType = {
          id: 'initial',
          content: `안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.\n\n궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요.\n\n예시:\n"A프로젝트 기획의도를 알려줘."\n"B프로젝트 기술스택 알려줘"\n\n💡 AI 답변은 실제 정보와 다를 수 있으니 참고용으로만 활용해 주세요.`,
          isUser: false,
          timestamp: new Date()
        };
        loadedMessages = [initialMessage];
      }

      setMessages(loadedMessages);
      setIsInitialized(true);

      // 로컬스토리지에서 불러온 메시지가 있으면 마지막 메시지가 보이도록 스크롤
      // 초기 메시지만 있는 경우는 스크롤하지 않음 (중앙 정렬 유지)
      if (loadedMessages.length > 1 || (loadedMessages.length === 1 && loadedMessages[0].id !== 'initial')) {
        // DOM 업데이트 후 스크롤
        setTimeout(() => {
          scrollToBottom(false); // 즉시 스크롤 (smooth 없이)
        }, 100);
      }
    }
  };

  // isInitialized가 false가 될 때 초기화 메시지 세팅
  useEffect(() => {
    if (!isInitialized) {
      initializeChatbot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // 메시지가 추가되거나 로딩 상태가 변경될 때 자동 스크롤
  useEffect(() => {
    // 빈 상태(초기 메시지만 있는 경우)이면 스크롤하지 않음
    const isEmptyState = !hasUserMessages;
    if (isEmptyState) {
      return;
    }

    // 메시지가 추가되거나 로딩 상태가 변경될 때 자동 스크롤
    if (messages.length > 0 || isLoading) {
      // 약간의 지연을 두어 DOM 업데이트 후 스크롤
      const timer = setTimeout(() => {
        scrollToBottom(true); // smooth 스크롤
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, hasUserMessages]);

  // 메시지 전송 처리
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    // 첫 대화가 시작되면 초기 안내 메시지 제거
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'initial');
        const newMessages = [...filteredMessages, userMessage];
        // 로컬스토리지에 저장
        try {
          localStorage.setItem('chatPageMessages', JSON.stringify(newMessages));
        } catch (error) {
          console.error('로컬스토리지에 메시지 저장 실패:', error);
        }
        return newMessages;
      });
    setIsLoading(true);

    try {
      // 1단계: 프론트엔드 사전 검증 및 분석
      const questionProcessing = processQuestion(message);
      
      let aiResponseText: React.ReactNode;
      let showEmailButton = false;
      
      // 검증 오류가 있는 경우
      if (questionProcessing.validationError) {
        aiResponseText = (
          <span className="text-red-600 font-medium">
            ⚠️ {questionProcessing.validationError}
          </span>
        );
      }
      // 즉시 응답이 있는 경우
      else if (questionProcessing.immediateResponse) {
        aiResponseText = questionProcessing.immediateResponse;
        showEmailButton = questionProcessing.showEmailButton;
      }
      // 백엔드로 전송이 필요한 경우
      else if (questionProcessing.shouldSendToBackend) {
        const response = await apiClient.getChatbotResponse(message, selectedProject || undefined);
        
        // 백엔드 응답 처리 (ResponseType 기반)
        const responseType = response.responseType;
        
        // 에러 타입별 처리
        if (responseType === 'RATE_LIMITED' || response.isRateLimited) {
          aiResponseText = (
            <span className="text-red-600 font-medium">
              ⚠️ {response.response}
            </span>
          );
          showEmailButton = true;
        } else if (responseType === 'CANNOT_ANSWER') {
          aiResponseText = (
            <span>
              {response.response}
            </span>
          );
          showEmailButton = true;
        } else if (responseType === 'PERSONAL_INFO') {
          aiResponseText = (
            <span>
              {response.response}
            </span>
          );
          showEmailButton = true;
        } else if (responseType === 'INVALID_INPUT' || responseType === 'SPAM_DETECTED') {
          aiResponseText = (
            <span className="text-red-600 font-medium">
              ⚠️ {response.response}
            </span>
          );
          showEmailButton = response.showEmailButton || false;
        } else if (responseType === 'SYSTEM_ERROR') {
          aiResponseText = (
            <span className="text-red-600 font-medium">
              ⚠️ {response.response}
            </span>
          );
          showEmailButton = true;
        } else {
          // SUCCESS 또는 기타 정상 응답
          aiResponseText = response.response;
          showEmailButton = response.showEmailButton || false;
        }
        
        // 사용량 제한 상태 업데이트 (성공적인 요청 후)
        if (!response.isRateLimited) {
          loadUsageStatus();
        }
      }

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText as string,
        isUser: false,
        timestamp: new Date(),
        showEmailButton: showEmailButton
      };

      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        // 로컬스토리지에 저장
        try {
          localStorage.setItem('chatPageMessages', JSON.stringify(newMessages));
        } catch (error) {
          console.error('로컬스토리지에 메시지 저장 실패:', error);
        }
        return newMessages;
      });
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date(),
        showEmailButton: true
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        // 로컬스토리지에 저장
        try {
          localStorage.setItem('chatPageMessages', JSON.stringify(newMessages));
        } catch (error) {
          console.error('로컬스토리지에 메시지 저장 실패:', error);
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자가 메시지를 보낸 후에만 하단 레이아웃으로 전환
  const shouldShowEmptyState = useMemo(() => !hasUserMessages, [hasUserMessages]);

  // 윈도우 스크롤 비활성화 (내부 스크롤만 사용)
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // body와 html 모두 스크롤 비활성화
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      // 컴포넌트 언마운트 시 타이머 정리
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <PageMeta
      scrollPolicy="internal"
      enableScrollDrivenAnimations={false}
      enablePageTransition={true}
      showFooter={false}
    >
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      {/* 상단 컨트롤 영역 - 왼쪽 상단 배치 */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          {usageStatus && (
            <div className={styles.usageContainer}>
              {usageStatus.isBlocked && (
                <div className={styles.blockedText}>
                  ⚠️ 차단됨 ({Math.ceil(usageStatus.timeUntilReset / (1000 * 60 * 60))}시간 후 해제)
                </div>
              )}
              <div className={styles.usageText}>
                <div className={styles.usageLabel}>호출제한</div>
                <div className={styles.usageRows}>
                  <div className={styles.usageRow}>시간: {usageStatus.hourlyCount}/15</div>
                  <div className={styles.usageRow}>일일: {usageStatus.dailyCount}/45</div>
                </div>
              </div>
            </div>
          )}
          <div className={styles.buttonsContainer}>
            <Button
              variant="icon"
              size="md"
              onClick={resetChatbot}
              ariaLabel="채팅 초기화"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M19.418 15A7.978 7.978 0 0 1 12 20a8 8 0 1 1 8-8" />
              </svg>
            </Button>
            <Button
              variant="icon"
              size="md"
              onClick={() => setIsInfoModalOpen(true)}
              ariaLabel="안내사항 보기"
              className={styles.infoButton}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div
        className={`${styles.chatPage} ${shouldShowEmptyState ? styles.emptyState : styles.hasMessages}`}
        ref={chatContainerRef}
      >

        {/* 메시지 영역 */}
        <div 
          className={`${styles.messagesContainer} ${isScrolling ? styles.scrolling : ''}`} 
          ref={messagesContainerRef}
          onScroll={() => {
            setIsScrolling(true);
            // 기존 타이머가 있으면 취소
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            // 1초 후 스크롤바 숨김
            scrollTimeoutRef.current = setTimeout(() => {
              setIsScrolling(false);
            }, 1000);
          }}
        >
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className={styles.loadingMessage}>
              <div className={styles.loadingBubble}>
                <Spinner size="sm" ariaLabel="응답 생성 중" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 - 하단 고정 */}
        <div className={styles.inputContainer}>
          <ChatInputBar
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="프로젝트에 대해 궁금한 점을 물어보세요..."
            inputValue={inputValue}
            onInputChange={setInputValue}
          />
        </div>
      </div>

      {/* 이스터에그 레이어 */}
      <EasterEggLayer />

      {/* 문의 모달 */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* 안내사항 모달 */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="채팅 사용 안내"
      >
        <div className={styles.infoContent}>
          <h3>AI 포트폴리오 비서 사용 안내</h3>
          <p>
            안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.
          </p>
          <p>
            궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요.
          </p>
          
          <h4>질문 예시</h4>
          <ul>
            <li>"A프로젝트 기획의도를 알려줘."</li>
            <li>"B프로젝트 기술스택 알려줘"</li>
            <li>"프로젝트에서 사용한 주요 기능은?"</li>
          </ul>

          <h4>사용량 제한</h4>
          <ul>
            <li>시간당 최대 15회 질문 가능</li>
            <li>일일 최대 45회 질문 가능</li>
            <li>사용량이 초과되면 일정 시간 후 자동으로 해제됩니다</li>
          </ul>

          <div className={styles.infoWarning}>
            <strong>⚠️ 주의사항</strong>
            <p>
              AI 답변은 실제 정보와 다를 수 있으니 참고용으로만 활용해 주세요.
              더 자세한 정보가 필요하시면 개발자에게 직접 메일을 보내주세요.
            </p>
          </div>
        </div>
      </Modal>
    </div>
    </PageMeta>
  );
};

const ChatPage: React.FC = () => {
  // 이스터에그 초기화 - JSON 설정 파일에서 로드
  useEffect(() => {
    try {
      const { triggers, effects } = loadEasterEggConfig();
      
      // 트리거 등록
      triggers.forEach(trigger => {
        easterEggRegistry.registerTrigger(trigger);
      });

      // 이펙트 등록
      effects.forEach(effect => {
        easterEggRegistry.registerEffect(effect);
      });
    } catch (error) {
      console.error('Failed to load easter egg config:', error);
    }
  }, []);

  return (
    <EasterEggProvider maxConcurrent={1} initialEnabled={true}>
      <ChatPageContent />
    </EasterEggProvider>
  );
};

export { ChatPage };
