import React, { useState } from 'react';

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center gap-3">
          {/* Input Field - shrinks when FAB is open, with smooth transition */}
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
            className={`flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ease-in-out ${
              isFocused ? 'shadow-md scale-[1.02]' : ''
            } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />

          {/* Send Button - moves right when focused, with smooth transition */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            className={`flex-shrink-0 bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 shadow-md ${
              isFocused ? 'translate-x-1' : ''
            }`}
            aria-label="메시지 전송"
          >
            {isLoading ? (
              // Loading Spinner
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon />
            )}
          </button>

          {/* Speed Dial Button - same size as submit, moves right when focused, with smooth transition */}
          {speedDialButton && (
            <div className={`flex-shrink-0 transition-transform duration-300 ease-in-out ${isFocused ? 'translate-x-1' : ''}`}>
              {speedDialButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatInputBar };
