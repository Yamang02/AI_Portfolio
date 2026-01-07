import React, { useState } from 'react';
import { cn } from '../../lib/utils/cn';
import { colors, transitions, easing, shadows, focusRing } from '../../config/theme';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  onFocus?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  speedDialButton?: React.ReactNode;
  isFabOpen?: boolean;
}

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  onFocus,
  isLoading = false,
  placeholder = '프로젝트에 대해 궁금한 점을 물어보세요...',
  speedDialButton,
  isFabOpen = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // 메시지를 챗봇으로 전송
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 border-t z-40 transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: shadows.lg,
      }}
    >
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center gap-3">
          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className={cn(
              'flex-1 px-4 py-3 border rounded-full',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'transition-all duration-300 ease-in-out',
              isFocused && 'shadow-md scale-[1.02]',
              isLoading ? 'bg-surface-elevated cursor-not-allowed' : 'bg-surface',
              'border-border text-text-primary placeholder:text-text-muted'
            )}
            style={{
              transitionDuration: transitions.normal,
              transitionTimingFunction: easing['ease-in-out'],
              ...(isFocused && {
                boxShadow: shadows.md,
                '--tw-ring-color': focusRing.color,
              }),
            }}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'flex-shrink-0 text-white p-3 rounded-full',
              'disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed',
              'transition-all duration-300 ease-in-out transform',
              'hover:scale-110 active:scale-95 shadow-md',
              isFocused && 'translate-x-1',
              !isLoading && !inputValue.trim() 
                ? 'bg-gray-300 dark:bg-gray-600' 
                : 'bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600'
            )}
            style={{
              backgroundColor: !isLoading && inputValue.trim() ? colors.primary[600] : colors.gray[300],
              transitionDuration: transitions.normal,
              transitionTimingFunction: easing['ease-in-out'],
              boxShadow: shadows.md,
            }}
            aria-label="메시지 전송"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon />
            )}
          </button>

          {/* Speed Dial Button */}
          {speedDialButton && (
            <div 
              className={cn(
                'flex-shrink-0 transition-transform duration-300 ease-in-out',
                isFocused && 'translate-x-1'
              )}
              style={{
                transitionDuration: transitions.normal,
                transitionTimingFunction: easing['ease-in-out'],
              }}
            >
              {speedDialButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatInputBar };

