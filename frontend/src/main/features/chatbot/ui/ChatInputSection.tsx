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
  placeholder = '작업물에 대해 궁금한 점을 물어보세요.',
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
