import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { apiClient } from '../../../shared/services/apiClient';
import ChatMessage from './ChatMessage';
import { ContactModal } from '../../../shared/components/Modal';
import { processQuestion } from '../utils/questionValidator';

// The 'projects' prop is no longer needed.
interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  showProjectButtons?: boolean;
}

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle, showProjectButtons }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [usageStatus, setUsageStatus] = useState<{
    dailyCount: number;
    hourlyCount: number;
    timeUntilReset: number;
    isBlocked: boolean;
  } | null>(null);
  const MAX_VISIBLE_PROJECTS = 4;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 프로젝트 데이터 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // 이 부분에서 실제로 어떤 프로젝트가 API에서 오는지 콘솔로 확인
        const projectsData = await apiClient.getProjects();
        console.log('챗봇 프로젝트 목록:', projectsData); // <-- 실제 데이터 확인용
        setProjects(projectsData);
      } catch (error) {
        console.error('프로젝트 데이터 로드 오류:', error);
      }
    };
    loadProjects();
  }, []);

  // 사용량 제한 상태 로드
  const loadUsageStatus = async () => {
    try {
      const status = await apiClient.getChatUsageStatus();
      setUsageStatus(status);
    } catch (error) {
      console.error('사용량 제한 상태 로드 오류:', error);
    }
  };

  // 챗봇이 열릴 때 사용량 제한 상태 로드
  useEffect(() => {
    if (isOpen) {
      loadUsageStatus();
    }
  }, [isOpen]);

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
      const initialMessage: ChatMessageType = {
        id: 'initial',
        content: `안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.\n\n궁금한 점이나 알고 싶은 내용을 자유롭게 질문해 주세요.\n\n예시:\n"A프로젝트 기획의도를 알려줘."\n"B프로젝트 기술스택 알려줘"\n\n💡 AI 답변은 실제 정보와 다를 수 있으니 참고용으로만 활용해 주세요.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setIsInitialized(true);
    }
  };

  // 챗봇 완전 초기화 (프로젝트 선택 상태 포함)
  const resetChatbot = () => {
    setSelectedProject(null);
    setMessages([]);
    setIsInitialized(false);
  };

  // isInitialized가 false가 될 때 초기화 메시지 세팅
  useEffect(() => {
    if (!isInitialized) {
      initializeChatbot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // 프로젝트 선택 처리
  const handleProjectSelect = async (project: any) => {
    // 선택된 프로젝트 설정
    setSelectedProject(project.title);
    
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: `${project.title} 프로젝트에 대해 알려주세요.`,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await handleProjectQuestion(project);
  };

  // 프로젝트 질문 처리
  const handleProjectQuestion = async (project: any) => {
    setIsLoading(true);
    
    try {
      // 더 자연스러운 질문 생성
      const question = `${project.title}에 대해 간단히 소개해줄 수 있어?`;
      const response = await apiClient.getChatbotResponse(question, project.title);
      
      let aiResponseText: React.ReactNode;
      let showEmailButton = false;
      
      // 백엔드 응답 처리 (ResponseType 기반) - handleSendMessage와 동일한 로직
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

      const aiMessage: ChatMessageType = { 
        id: (Date.now() + 1).toString(),
        content: aiResponseText as string,
        isUser: false,
        timestamp: new Date(),
        showEmailButton: showEmailButton
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // 사용량 제한 상태 업데이트 (성공적인 요청 후)
      if (!response.isRateLimited) {
        loadUsageStatus();
      }
    } catch (error) {
      console.error('프로젝트 질문 처리 오류:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date(),
        showEmailButton: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 처리
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 1단계: 프론트엔드 사전 검증 및 분석
      const questionProcessing = processQuestion(inputValue);
      
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
        const response = await apiClient.getChatbotResponse(inputValue, selectedProject || undefined);
        
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

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date(),
        showEmailButton: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 챗봇 열기/닫기 버튼 클릭 시
  const handleToggle = () => {
    if (!isOpen && !isInitialized) {
      initializeChatbot();
    }
    onToggle();
  };

  return (
    <>
      {/* 챗봇 토글 버튼 */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors duration-200 z-50"
        aria-label="챗봇 열기"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* 챗봇 패널 */}
      {(
        <div
          className={`fixed right-0 top-0 h-[calc(100vh-120px)] w-96 max-w-full bg-white shadow-lg border-l border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white relative">
            <h3 className="text-lg font-semibold text-gray-900 text-center w-full">AI 포트폴리오 비서</h3>
            <div className="absolute right-4 flex items-center gap-2">
              <button
                onClick={resetChatbot}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="채팅 초기화"
                title="채팅 초기화"
              >
                {/* 리셋(새로고침) 아이콘 */}
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M19.418 15A7.978 7.978 0 0 1 12 20a8 8 0 1 1 8-8" />
                </svg>
              </button>
              <button
                onClick={handleToggle}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="챗봇 닫기"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* 사용량 제한 상태 표시 */}
          {usageStatus && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>시간당: {usageStatus.hourlyCount}/15</span>
                <span>일일: {usageStatus.dailyCount}/50</span>
                {usageStatus.isBlocked && (
                  <span className="text-red-600 font-medium">
                    ⚠️ 차단됨 ({Math.ceil(usageStatus.timeUntilReset / (1000 * 60 * 60))}시간 후 해제)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 프로젝트 선택 영역 */}
          {showProjectButtons !== false && messages.length === 1 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">프로젝트를 선택하세요:</p>
              <div className="grid grid-cols-1 gap-2">
                {(showAllProjects ? projects : projects.slice(0, MAX_VISIBLE_PROJECTS)).map((project: any) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className="text-left p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                  >
                    {project.title}
                  </button>
                ))}
                {projects.length > MAX_VISIBLE_PROJECTS && (
                  <button
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="text-center p-2 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-medium"
                  >
                    {showAllProjects ? '접기' : '더보기'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 입력 영역 */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 문의 모달 */}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default Chatbot;
export type { ChatbotProps }; 