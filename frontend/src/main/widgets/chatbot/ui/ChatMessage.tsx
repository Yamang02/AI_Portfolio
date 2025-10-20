import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../model/chatbot.types';

interface ChatMessageProps {
  message: ChatMessageType;
  onEmailClick?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onEmailClick }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-white text-gray-800 rounded-bl-none border border-gray-300'
      }`}>
        {message.isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
            {typeof message.text === 'string' ? (
              <ReactMarkdown
                components={{
                  // 마크다운 스타일링 커스터마이징
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                  pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-2 italic mb-2">{children}</blockquote>,
                }}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            
            {/* 메일 보내기 버튼 */}
            {message.showEmailButton && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col items-center">
                <p className="text-xs text-gray-500 mb-2 text-center">개발자에게 직접 메일을 보내보는 건 어떠신가요?</p>
                <button
                  onClick={onEmailClick}
                  className="px-4 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  📧 메일 보내기
                </button>
              </div>
            )}

            {/* 응답 타입별 추가 정보 */}
            {message.responseType === 'RATE_LIMITED' && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                ⚠️ 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요.
              </div>
            )}

            {message.responseType === 'CANNOT_ANSWER' && (
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                💡 더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.
              </div>
            )}

            {message.responseType === 'PERSONAL_INFO' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                🔒 개인정보는 공유할 수 없습니다. 포트폴리오 관련 질문을 해주세요.
              </div>
            )}
          </div>
        )}
        
        {/* 타임스탬프 */}
        <div className={`text-xs mt-1 ${
          message.isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
