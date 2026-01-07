import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';
import { ChatBubble } from '@/design-system';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const timestamp = message.timestamp.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // 초기 안내 메시지는 가운데 정렬, 70% 제한 없음
  const isInitialMessage = message.id === 'initial';

  return (
    <div className={`flex ${isInitialMessage ? 'justify-center' : (message.isUser ? 'justify-end' : 'justify-start')} mb-4`}>
      <ChatBubble
        variant={message.isUser ? 'user' : 'assistant'}
        timestamp={timestamp}
        className={isInitialMessage ? 'initialMessage' : ''}
      >
        {message.isUser ? (
          <p style={{ margin: 0 }}>{message.content}</p>
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
                  code: ({ children }) => <code className="bg-surface-elevated dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                  pre: ({ children }) => <pre className="bg-surface-elevated dark:bg-slate-700 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-border pl-2 italic mb-2">{children}</blockquote>,
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
      </ChatBubble>
    </div>
  );
};

export { ChatMessage }; 