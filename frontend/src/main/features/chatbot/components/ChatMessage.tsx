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
          : 'bg-surface dark:bg-slate-800 text-text-primary rounded-bl-none border border-border'
      }`}>
        {message.isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
            {typeof message.content === 'string' ? (
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
                  code: ({ children }) => <code className="bg-surface-elevated dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono text-text-primary">{children}</code>,
                  pre: ({ children }) => <pre className="bg-surface-elevated dark:bg-slate-700 p-2 rounded text-xs font-mono overflow-x-auto mb-2 text-text-primary">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-primary-500 dark:border-primary-400 pl-2 italic mb-2 text-text-secondary">{children}</blockquote>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
            
            {/* 메일 보내기 버튼 */}
            {message.showEmailButton && (
              <div className="mt-3 pt-3 border-t border-border flex flex-col items-center">
                <p className="text-xs text-text-muted mb-2 text-center">개발자에게 직접 메일을 보내보는 건 어떠신가요?</p>
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
          message.isUser ? 'text-primary-200' : 'text-text-muted'
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

export { ChatMessage }; 