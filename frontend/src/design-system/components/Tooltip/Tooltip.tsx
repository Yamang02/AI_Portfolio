import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  showOnMount?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  delay = 300,
  showOnMount = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [isFirstShow, setIsFirstShow] = useState(showOnMount);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(isVisible);
  const isFirstShowRef = useRef(isFirstShow);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    isFirstShowRef.current = isFirstShow;
  }, [isFirstShow]);

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

  useEffect(() => {
    if (showOnMount) {
      setIsVisible(true);
      setIsFirstShow(true);
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsFirstShow(false);
      }, 5000);

      return () => {
        clearTimers();
      };
    }
  }, [showOnMount, clearTimers]);

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    if (isVisibleRef.current || isFirstShowRef.current) {
      setIsVisible(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  }, [delay, clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    if (!isFirstShowRef.current) {
      setIsVisible(false);
    } else {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsFirstShow(false);
      }, 5000);
    }
  }, [clearTimers]);

  const placementClass = styles[placement];

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`${styles.tooltip} ${placementClass} ${className || ''}`}
          role="tooltip"
        >
          {content}
          <div className={styles.arrow} />
        </div>
      )}
    </div>
  );
};
