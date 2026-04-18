import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Routes } from 'react-router-dom';

import styles from './AnimatedRoutes.module.css';

type TransitionPhase = 'idle' | 'exiting' | 'enterFrom' | 'enterActive';

/**
 * Routes를 감싸 라우트 전환 시 좌우 슬라이드(CSS)를 적용합니다.
 * (기존 framer-motion AnimatePresence + motion.div 대체)
 */
interface AnimatedRoutesProps {
  children: React.ReactNode;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const prevPathnameRef = useRef(location.pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef(location);
  const phaseRef = useRef<TransitionPhase>('idle');

  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState<TransitionPhase>('idle');

  locationRef.current = location;
  phaseRef.current = phase;

  useEffect(() => {
    if (isChatPage && containerRef.current) {
      containerRef.current.style.height = '100vh';
    }
  }, [isChatPage]);

  useEffect(() => {
    const wasChatPage = prevPathnameRef.current === '/chat';
    const isNowChatPage = location.pathname === '/chat';

    if (wasChatPage && !isNowChatPage && containerRef.current) {
      containerRef.current.style.height = 'auto';
    }

    prevPathnameRef.current = location.pathname;

    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);

    return () => clearTimeout(scrollTimer);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      return;
    }
    if (phase !== 'idle') {
      return;
    }
    setPhase('exiting');
  }, [location.pathname, displayLocation.pathname, phase]);

  useEffect(() => {
    if (phase !== 'enterFrom') return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('enterActive'));
    });
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const containerStyle: React.CSSProperties = isChatPage
    ? {
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        height: '100vh',
      }
    : {
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
      };

  const layerClass = [
    styles.layer,
    isChatPage ? styles.layerChat : styles.layerDefault,
    phase === 'idle' && styles.layerIdle,
    phase === 'exiting' && styles.layerExit,
    phase === 'enterFrom' && styles.layerEnterFrom,
    phase === 'enterActive' && styles.layerEnterActive,
  ]
    .filter(Boolean)
    .join(' ');

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'transform') return;

    if (phaseRef.current === 'exiting') {
      setDisplayLocation(locationRef.current);
      setPhase('enterFrom');
      return;
    }

    if (phaseRef.current === 'enterActive') {
      setPhase('idle');
    }
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div className={layerClass} onTransitionEnd={handleTransitionEnd}>
        <Routes location={displayLocation}>{children}</Routes>
      </div>
    </div>
  );
};
