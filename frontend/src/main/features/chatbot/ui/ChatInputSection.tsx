import React from 'react';

import { ChatInputBar } from '@/main/shared/ui/chat';

export interface ChatInputSectionProps {
  onSendMessage: (message: string) => void | Promise<void>;
  isLoading: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ChatInputSection: React.FC<ChatInputSectionProps> = ({
  onSendMessage,
  isLoading,
  inputValue,
  onInputChange,
  placeholder = '?�업물에 ?�??궁금???�을 물어보세??..',
  className,
}) => (
  <div className={className}>
    <ChatInputBar
      onSendMessage={onSendMessage}
      isLoading={isLoading}
      placeholder={placeholder}
      inputValue={inputValue}
      onInputChange={onInputChange}
    />
  </div>
);
