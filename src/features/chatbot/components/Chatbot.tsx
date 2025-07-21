import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { getChatbotResponse } from '../../../shared';
import { ALL_PROJECTS } from '../../projects';
import ChatMessage from './ChatMessage';
import { appConfig } from '../../../shared';

// The 'projects' prop is no longer needed.
interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
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

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 챗봇 초기화
  const initializeChatbot = () => {
    if (!isInitialized) {
      const initialMessage: ChatMessageType = {
        id: 'initial',
        content: `안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.\n\n어떤 프로젝트에 대해 궁금하신가요?\n\n**사용 가능한 프로젝트:**\n• 성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)\n• PYQT5 파일 태거 (File Tagger)\n• AI 포트폴리오 챗봇 (AI Portfolio Chatbot)\n\n💡 직접 질문도 가능합니다! "어떤 기술을 사용했어?" 같은 질문을 해보세요.`,
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
    initializeChatbot();
  };

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
      const responseText = await getChatbotResponse(question, project.title);
      
      let aiResponseText: React.ReactNode;
      if (responseText.trim() === 'I_CANNOT_ANSWER') {
        aiResponseText = (
          <span>
            해당 프로젝트에 대한 정보를 찾을 수 없습니다. 다른 프로젝트를 선택하거나 직접 질문해보세요.
          </span>
        );
      } else {
        aiResponseText = responseText;
      }

      const aiMessage: ChatMessageType = { 
        id: (Date.now() + 1).toString(), 
        content: aiResponseText as string,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('프로젝트 질문 처리 오류:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date()
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
      const responseText = await getChatbotResponse(inputValue, selectedProject || undefined);
      
      let aiResponseText: React.ReactNode;
      if (responseText.trim() === 'I_CANNOT_ANSWER') {
        aiResponseText = (
          <span>
            죄송합니다. 해당 질문에 대한 답변을 제공할 수 없습니다. 다른 질문을 해보시거나 프로젝트를 선택해보세요.
          </span>
        );
      } else {
        aiResponseText = responseText;
      }

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText as string,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date()
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 text-center w-full">AI 포트폴리오 비서</h3>
            <button
              onClick={handleToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors absolute right-4"
              aria-label="챗봇 닫기"
            >
              <CloseIcon />
            </button>
          </div>

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
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">프로젝트를 선택하세요:</p>
              <div className="grid grid-cols-1 gap-2">
                {ALL_PROJECTS.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className="text-left p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                  >
                    {project.title}
                  </button>
                ))}
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
    </>
  );
};

export default Chatbot; 