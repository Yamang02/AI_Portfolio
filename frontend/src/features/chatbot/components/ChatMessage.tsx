import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.isUser 
          ? 'bg-primary-600 text-white rounded-br-none' 
          : 'bg-white text-gray-800 rounded-bl-none border border-gray-300'
      }`}>
        {message.isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
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
              {typeof message.content === 'string' ? message.content : '서버 오류가 발생했습니다.'}
            </ReactMarkdown>
            
            {/* 메일 보내기 버튼 */}
            {message.showEmailButton && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col items-center">
                <p className="text-xs text-gray-500 mb-2 text-center">개발자에게 직접 메일을 보내보는 건 어떠신가요?</p>
                <button
                  onClick={() => {
                    // 모달 열기 이벤트 발생
                    const event = new CustomEvent('openContactModal');
                    window.dispatchEvent(event);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors duration-200"
                >
                  📧 개발자에게 메일 보내기
                </button>
              </div>
            )}
          </div>
        )}
        <p className={`text-xs mt-1 ${
          message.isUser ? 'text-primary-200' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage; 