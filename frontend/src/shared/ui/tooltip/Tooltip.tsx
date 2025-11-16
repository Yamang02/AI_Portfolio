import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '../../lib/utils/cn';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  showOnMount?: boolean; // 최초 마운트 시 자동 표시
  delay?: number; // hover 시 표시 지연 시간 (ms)
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  showOnMount = false,
  delay = 300,
  placement = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [isFirstShow, setIsFirstShow] = useState(showOnMount);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(isVisible);
  const isFirstShowRef = useRef(isFirstShow);

  // ref 동기화
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    isFirstShowRef.current = isFirstShow;
  }, [isFirstShow]);

  // 타이머 정리 헬퍼 함수
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // 최초 마운트 시 자동 표시
  useEffect(() => {
    if (showOnMount) {
      setIsVisible(true);
      setIsFirstShow(true);
      // 5초 후 자동으로 숨김
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsFirstShow(false);
      }, 5000);

      return () => {
        clearTimers();
      };
    }
  }, [showOnMount, clearTimers]);

  // hover 이벤트 처리
  const handleMouseEnter = useCallback(() => {
    clearTimers();
    // 즉시 표시 (이미 표시 중이거나 최초 표시 중이면)
    if (isVisibleRef.current || isFirstShowRef.current) {
      setIsVisible(true);
    } else {
      // 그 외의 경우 delay 후 표시
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  }, [delay, clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    // hover를 벗어나면 즉시 숨김 (최초 표시가 아닌 경우)
    if (!isFirstShowRef.current) {
      setIsVisible(false);
    } else {
      // 최초 표시인 경우, 5초 후 숨김
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsFirstShow(false);
      }, 5000);
    }
  }, [clearTimers]);

  // placement에 따른 스타일 (메모이제이션)
  const placementStyles = useMemo(() => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
      pointerEvents: 'none' as const,
    };

    switch (placement) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
        };
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '8px',
        };
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px',
        };
      default:
        return baseStyles;
    }
  }, [placement]);

  // 화살표 스타일 (메모이제이션)
  const arrowStyles = useMemo(() => {
    const baseArrow = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const,
    };

    switch (placement) {
      case 'top':
        return {
          ...baseArrow,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderColor: 'rgba(0, 0, 0, 0.9) transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseArrow,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
          borderColor: 'transparent transparent rgba(0, 0, 0, 0.9) transparent',
        };
      case 'left':
        return {
          ...baseArrow,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
          borderColor: 'transparent transparent transparent rgba(0, 0, 0, 0.9)',
        };
      case 'right':
        return {
          ...baseArrow,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
          borderColor: 'transparent rgba(0, 0, 0, 0.9) transparent transparent',
        };
      default:
        return baseArrow;
    }
  }, [placement]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute whitespace-nowrap px-3 py-2 rounded-lg text-sm text-white',
            'bg-black/90 dark:bg-slate-800/95 shadow-lg',
            'animate-fade-in',
            className
          )}
          style={placementStyles}
        >
          {content}
          <div style={arrowStyles} />
        </div>
      )}
    </div>
  );
};

