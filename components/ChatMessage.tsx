
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

// 간단한 마크다운 렌더링 함수
const renderMarkdown = (text: string) => {
  // **굵은 글씨** 처리
  const boldText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 줄바꿈 처리
  const withLineBreaks = boldText.replace(/\n/g, '<br />');
  
  // 불릿 포인트 처리
  const withBullets = withLineBreaks.replace(/^•\s*(.*)$/gm, '<li>$1</li>');
  
  // **제목** 다음에 오는 불릿 포인트들을 ul로 감싸기
  const withLists = withBullets.replace(
    /(<strong>.*?<\/strong>)\s*<br \/>\s*(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/g,
    '$1<br /><ul class="list-disc ml-4 mt-2 mb-2">$2</ul>'
  );
  
  return { __html: withLists };
};

interface ChatMessageProps {
  message: ChatMessageType;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';
  const isLoading = message.id === 'loading';
  
  const bubbleClasses = isAI
    ? 'bg-gray-100 text-gray-800 rounded-br-none'
    : 'bg-primary-600 text-white rounded-bl-none ml-auto';

  return (
    <div className={`flex items-end gap-2 ${!isAI ? 'justify-end' : ''}`}>
        {isAI && (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                AI
            </div>
        )}
      <div className={`max-w-[85%] p-4 rounded-xl ${bubbleClasses}`}>
        {isLoading ? (
          <TypingIndicator />
        ) : (
          <div 
            className="prose prose-lg prose-p:my-2 prose-a:text-primary-600 hover:prose-a:text-primary-500 prose-strong:text-gray-900 prose-ul:my-2 prose-li:my-1"
            dangerouslySetInnerHTML={typeof message.text === 'string' ? renderMarkdown(message.text) : { __html: '' }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;