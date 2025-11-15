import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils/cn';
import { colors, transitions, easing, shadows, focusRing } from '../../config/theme';
import { useEasterEggStore, checkEasterEggTrigger, triggerEasterEggs } from '@features/easter-eggs';
import { easterEggRegistry } from '@features/easter-eggs/registry/easterEggRegistry';

const THEME_TOGGLE_FIRST_CLICK_KEY = 'portfolio-theme-toggle-first-click';

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

const EggIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={isActive ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="12" rx="8" ry="10" />
    {isActive && (
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    )}
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
  const [showEasterEggButton, setShowEasterEggButton] = useState(false);
  const { triggerEasterEgg, isEasterEggMode, toggleEasterEggMode, activeEffects } = useEasterEggStore();
  
  // 이스터에그가 동작 중인지 확인
  const isEasterEggActive = activeEffects.length > 0;
  
  // 활성화된 이스터에그의 이름 가져오기 (가장 최근 것)
  const activeEasterEggName = useMemo(() => {
    if (activeEffects.length === 0) return null;
    const latestEffect = activeEffects[activeEffects.length - 1];
    const trigger = easterEggRegistry.getTrigger(latestEffect.id);
    return trigger?.name || null;
  }, [activeEffects]);

  // 이스터에그 버튼 표시 여부 확인
  useEffect(() => {
    // 초기 로드 시 localStorage 확인 (명시적으로 'true'일 때만 표시)
    const checkButtonVisibility = () => {
      const hasThemeToggleClicked = localStorage.getItem(THEME_TOGGLE_FIRST_CLICK_KEY);
      // localStorage에 값이 없거나 'true'가 아닌 경우 버튼 숨김
      const shouldShow = hasThemeToggleClicked === 'true';
      setShowEasterEggButton(shouldShow);
    };

    checkButtonVisibility();

    // 이벤트 리스너: 테마 토글 최초 클릭 시 버튼 표시
    const handleEasterEggButtonRevealed = () => {
      setShowEasterEggButton(true);
    };

    window.addEventListener('easterEggButtonRevealed', handleEasterEggButtonRevealed);
    return () => {
      window.removeEventListener('easterEggButtonRevealed', handleEasterEggButtonRevealed);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // 메시지 전송 전에 이스터에그 트리거 체크
    const { shouldBlock, triggers } = checkEasterEggTrigger(inputValue, isEasterEggMode);
    
    // 이스터에그 트리거 실행
    if (triggers.length > 0) {
      triggerEasterEggs(triggers, inputValue, triggerEasterEgg);
      
      // 이스터에그 전용 문구는 챗봇으로 전송하지 않음
      if (shouldBlock) {
        setInputValue('');
        return;
      }
    }

    // 이스터에그 모드가 활성화되어 있으면 모든 입력 차단
    if (isEasterEggMode) {
      setInputValue('');
      return;
    }

    // 일반 메시지는 챗봇으로 전송
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
          {/* 이스터에그 모드 토글 버튼 - 최초 테마 토글 클릭 후에만 표시 */}
          {showEasterEggButton && (
            <>
              {/* 네온색 줄무늬 애니메이션을 위한 스타일 태그 */}
              {isEasterEggActive && (
                <style>{`
                  @keyframes neonStripeMove {
                    0% {
                      background-position: 50% 0%;
                    }
                    100% {
                      background-position: 50% 200%;
                    }
                  }
                  .easter-egg-active-stripe {
                    background: repeating-linear-gradient(
                      0deg,
                      #ff0080 0%,
                      #ff0080 14.28%,
                      #ff8000 14.28%,
                      #ff8000 28.56%,
                      #ffff00 28.56%,
                      #ffff00 42.84%,
                      #00ff00 42.84%,
                      #00ff00 57.12%,
                      #00ffff 57.12%,
                      #00ffff 71.4%,
                      #0080ff 71.4%,
                      #0080ff 85.68%,
                      #ff0080 85.68%,
                      #ff0080 100%
                    );
                    background-size: 100% 200%;
                    animation: neonStripeMove 2s linear infinite;
                    box-shadow: 0 0 20px rgba(255, 0, 128, 0.6), 
                                0 0 40px rgba(0, 255, 255, 0.4), 
                                0 0 60px rgba(255, 255, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                  }
                  .easter-egg-active-stripe::before {
                    content: '';
                    position: absolute;
                    top: -100%;
                    left: 0;
                    width: 100%;
                    height: 200%;
                    background: linear-gradient(
                      0deg,
                      transparent,
                      rgba(255, 255, 255, 0.3),
                      transparent
                    );
                    animation: shimmer 2s infinite;
                  }
                  @keyframes shimmer {
                    0% {
                      top: -100%;
                    }
                    100% {
                      top: 100%;
                    }
                  }
                `}</style>
              )}
              <button
                type="button"
                onClick={toggleEasterEggMode}
                className={cn(
                  'flex-shrink-0 p-3 rounded-full transition-all duration-300 ease-in-out',
                  'hover:scale-110 active:scale-95 shadow-md relative overflow-hidden',
                  // 이스터에그 동작 중일 때 네온색 줄무늬 애니메이션
                  isEasterEggActive && 'easter-egg-active-stripe',
                  !isEasterEggActive && (
                    isEasterEggMode 
                      ? 'bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 hover:bg-yellow-500 dark:hover:bg-yellow-600' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  )
                )}
                style={{
                  transitionDuration: transitions.normal,
                  transitionTimingFunction: easing['ease-in-out'],
                  ...(!isEasterEggActive && { boxShadow: shadows.md }),
                  ...(isEasterEggActive && { 
                    color: '#000',
                    fontWeight: 'bold',
                    zIndex: 10,
                  }),
                }}
                aria-label={isEasterEggMode ? '이스터에그 모드 끄기' : '이스터에그 모드 켜기'}
                title={
                  isEasterEggActive 
                    ? `이스터에그 동작 중 (${activeEffects.length}개) - ESC로 중단 가능`
                    : isEasterEggMode 
                      ? '이스터에그 모드: 활성화됨 (모든 입력이 챗봇으로 전송되지 않음)' 
                      : '이스터에그 모드: 비활성화됨'
                }
              >
                <EggIcon isActive={isEasterEggMode || isEasterEggActive} />
              </button>
            </>
          )}

          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={
              isEasterEggActive && activeEasterEggName
                ? activeEasterEggName
                : isEasterEggMode
                ? '이스터에그 모드'
                : placeholder
            }
            disabled={isLoading || isEasterEggActive}
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

