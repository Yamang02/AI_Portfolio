
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { PROJECTS } from '../constants';
import ChatMessage from './ChatMessage';

// The 'projects' prop is no longer needed.
interface ChatbotProps {}

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const Chatbot: React.FC<ChatbotProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
        sender: 'ai',
        text: `안녕하세요! 👋 저는 AI 포트폴리오 비서입니다.\n\n어떤 프로젝트에 대해 궁금하신가요?\n\n**사용 가능한 프로젝트:**\n• 성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)\n• PYQT5 파일 태거 (File Tagger)\n• AI 포트폴리오 챗봇 (AI Portfolio Chatbot)\n\n💡 직접 질문도 가능합니다! "어떤 기술을 사용했어?" 같은 질문을 해보세요.`
      };
      setMessages([initialMessage]);
      setIsInitialized(true);
    }
  };

  // 프로젝트 선택 처리
  const handleProjectSelect = async (project: any) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: `${project.title} 프로젝트에 대해 알려주세요.`
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
      const responseText = await getChatbotResponse(question);
      
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
        sender: 'ai', 
        text: aiResponseText 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('프로젝트 질문 처리 중 오류:', error);
      const errorMessage: ChatMessageType = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: '죄송합니다. 프로젝트 정보를 가져오는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessageType = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // The call to the service is now simpler, without passing props.
      const responseText = await getChatbotResponse(inputValue);
      
      let aiResponseText: React.ReactNode;
      if (responseText.trim() === 'I_CANNOT_ANSWER') {
        aiResponseText = (
          <span>
            그 질문에는 답변하기 어렵네요. 더 궁금한 점이 있다면 아래 버튼으로 개발자에게 직접 연락해주세요.
            <a href="mailto:contact@example.com" className="block text-center mt-3 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              개발자에게 메일 보내기
            </a>
          </span>
        );
      } else {
        aiResponseText = responseText;
      }

      const aiMessage: ChatMessageType = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('챗봇 응답 처리 중 오류:', error);
      const errorMessage: ChatMessageType = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 챗봇이 열릴 때 초기화
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChatbot();
    }
  }, [isOpen, isInitialized]);
  
  return (
    <>
      <div className={`fixed bottom-0 right-0 m-4 sm:m-8 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-90 invisible' : 'opacity-100 scale-100 visible'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75"
          aria-label="채팅 열기"
        >
          <ChatIcon />
        </button>
      </div>

      <div className={`fixed inset-4 sm:inset-8 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-90 invisible'}`}>
        <div className="bg-white rounded-xl shadow-2xl h-full flex flex-col border border-gray-200">
          <header className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <h3 className="text-2xl font-bold">🤖 AI 포트폴리오 비서</h3>
            <button 
              onClick={() => {
                setIsOpen(false);
                // 챗봇을 닫을 때 초기화 상태 리셋 (선택사항)
                // setIsInitialized(false);
                // setMessages([]);
              }} 
              className="text-white hover:text-gray-200" 
              aria-label="채팅 닫기"
            >
              <CloseIcon />
            </button>
          </header>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
              {isLoading && <ChatMessage key="loading" message={{ id: 'loading', sender: 'ai', text: '...' }} />}
            </div>
            
            {/* 프로젝트 선택 버튼들 */}
            {messages.length === 1 && messages[0].id === 'initial' && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-600 font-medium">프로젝트를 선택하세요:</p>
                <div className="grid grid-cols-1 gap-2">
                  {PROJECTS.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className="text-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 font-medium text-gray-900"
                    >
                      {project.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="프로젝트에 대해 질문해보세요..."
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-4 pl-6 pr-16 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                disabled={isLoading}
              />
              <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-primary-500 hover:text-primary-600 disabled:text-gray-400" disabled={isLoading || !inputValue.trim()}>
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;