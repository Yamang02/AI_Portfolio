import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const updatePosition = useCallback(() => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();

    // position: fixed uses viewport coordinates, not document coordinates
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right;
        break;
    }

    setPosition({ top, left });
  }, [placement]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();

      const handleUpdate = () => {
        updatePosition();
      };

      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isVisible, updatePosition]);

  useEffect(() => {
    if (showOnMount) {
      setIsVisible(true);
      updatePosition();

      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => {
        clearTimers();
      };
    }
  }, [showOnMount, clearTimers, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    clearTimers();

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  }, [delay, clearTimers, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    setIsVisible(false);
  }, [clearTimers]);

  const placementClass = styles[placement];

  const tooltipElement = isVisible ? (
    <div
      className={`${styles.tooltip} ${placementClass} ${className || ''}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="tooltip"
    >
      {content}
      <div className={styles.arrow} />
    </div>
  ) : null;

  return (
    <>
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};
