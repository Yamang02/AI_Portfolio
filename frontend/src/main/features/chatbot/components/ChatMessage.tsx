import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';
import { ChatBubble, Button } from '@/design-system';

interface ChatMessageProps {
  message: ChatMessageType;
}

const openContactModal = () => {
  const event = new CustomEvent('openContactModal');
  globalThis.dispatchEvent(event);
};

const ContactAction: React.FC = () => (
  <div className="mt-3 pt-3 border-t border-border flex flex-col items-center">
    <p className="text-xs text-text-muted mb-2 text-center">개발자에게 직접 메일을 보내보는 건 어떠신가요?</p>
    <Button variant="primary" size="sm" onClick={openContactModal}>
      📧 개발자에게 메일 보내기
    </Button>
  </div>
);

const getMessageAlignmentClass = (isInitialMessage: boolean, isUser: boolean): string => {
  if (isInitialMessage) return 'justify-center';
  return isUser ? 'justify-end' : 'justify-start';
};

const markdownComponents = {
  // 마크다운 스타일링 커스터마이징
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-sm">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  code: ({ children }: { children?: React.ReactNode }) => <code className="bg-surface-elevated dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
  pre: ({ children }: { children?: React.ReactNode }) => <pre className="bg-surface-elevated dark:bg-slate-700 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-4 border-border pl-2 italic mb-2">{children}</blockquote>,
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const timestamp = message.timestamp.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // 초기 안내 메시지는 가운데 정렬, 70% 제한 없음
  const isInitialMessage = message.id === 'initial';
  const alignmentClass = getMessageAlignmentClass(isInitialMessage, message.isUser);

  return (
    <div className={`flex ${alignmentClass} mb-4`}>
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
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
            
            {/* 메일 보내기 버튼 */}
            {message.showEmailButton && <ContactAction />}
          </div>
        )}
      </ChatBubble>
    </div>
  );
};

export { ChatMessage }; 
