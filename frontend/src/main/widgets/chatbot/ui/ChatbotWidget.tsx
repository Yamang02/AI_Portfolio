import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../model/chatbot.types';
import { apiClient } from '../../../../shared/api/apiClient';
import { ContactModal } from '../../../../shared/ui/modal';
import { processQuestion } from '../lib/questionValidator';
import { useProjectsQuery } from '../../../entities/project';

interface ChatbotWidgetProps {
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

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onToggle, showProjectButtons }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [usageStatus, setUsageStatus] = useState<{
    dailyCount: number;
    hourlyCount: number;
    timeUntilReset: number;
    isBlocked: boolean;
  } | null>(null);
  const MAX_VISIBLE_PROJECTS = 4;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 프로젝트 데이터 가져오기
  const { data: projects = [] } = useProjectsQuery();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기화 및 사용량 상태 확인
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChatbot();
    }
  }, [isOpen, isInitialized]);

  const initializeChatbot = async () => {
    try {
      setIsInitialized(true);
      
      // 사용량 상태 확인
      const status = await apiClient.getChatUsageStatus();
      setUsageStatus(status);

      // 초기 메시지 추가
      if (status.isBlocked) {
        setMessages([{
          id: '1',
          text: '죄송합니다. 현재 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
          isUser: false,
          timestamp: new Date(),
          responseType: 'RATE_LIMITED'
        }]);
      } else {
        setMessages([{
          id: '1',
          text: '안녕하세요! 포트폴리오에 대해 궁금한 것이 있으시면 언제든지 물어보세요. 프로젝트, 기술 스택, 경험 등에 대해 답변해드릴 수 있습니다.',
          isUser: false,
          timestamp: new Date(),
          responseType: 'SUCCESS'
        }]);
      }
    } catch (error) {
      console.error('챗봇 초기화 오류:', error);
      setMessages([{
        id: '1',
        text: '챗봇을 초기화하는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.',
        isUser: false,
        timestamp: new Date(),
        responseType: 'SYSTEM_ERROR'
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 질문 검증
      const validationResult = processQuestion(inputValue);
      if (!validationResult.isValid) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: validationResult.message,
          isUser: false,
          timestamp: new Date(),
          responseType: 'INVALID_INPUT'
        }]);
        return;
      }

      // API 호출
      const response = await apiClient.getChatbotResponse(inputValue, selectedProject || undefined);
      
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        responseType: response.responseType,
        showEmailButton: response.showEmailButton
      };

      setMessages(prev => [...prev, botMessage]);

      // 사용량 상태 업데이트
      if (response.responseType === 'RATE_LIMITED') {
        const status = await apiClient.getChatUsageStatus();
        setUsageStatus(status);
      }

    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 메시지를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
        responseType: 'SYSTEM_ERROR'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const visibleProjects = showAllProjects ? projects : projects.slice(0, MAX_VISIBLE_PROJECTS);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="챗봇 열기"
      >
        <ChatIcon />
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">AI 챗봇</h3>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="챗봇 닫기"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 사용량 상태 표시 */}
        {usageStatus && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <div className="text-xs text-blue-700">
              오늘: {usageStatus.dailyCount}회 | 시간당: {usageStatus.hourlyCount}회
            </div>
          </div>
        )}

        {/* 프로젝트 선택 버튼들 */}
        {showProjectButtons && projects.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">프로젝트 선택:</div>
            <div className="flex flex-wrap gap-2">
              {visibleProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id.toString())}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedProject === project.id.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {project.title}
                </button>
              ))}
              {projects.length > MAX_VISIBLE_PROJECTS && (
                <button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="px-3 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                >
                  {showAllProjects ? '접기' : `+${projects.length - MAX_VISIBLE_PROJECTS}개 더`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onEmailClick={() => setIsContactModalOpen(true)}
            />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span className="text-sm">답변 생성 중...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || usageStatus?.isBlocked}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || usageStatus?.isBlocked}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      {/* 연락 모달 */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default ChatbotWidget;
