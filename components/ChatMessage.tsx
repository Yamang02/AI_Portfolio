
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

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
      <div className={`max-w-[80%] p-3 rounded-xl ${bubbleClasses}`}>
        {isLoading ? <TypingIndicator /> : <div className="prose prose-sm prose-p:my-1 prose-a:text-primary-600 hover:prose-a:text-primary-500">{message.text}</div>}
      </div>
    </div>
  );
};

export default ChatMessage;