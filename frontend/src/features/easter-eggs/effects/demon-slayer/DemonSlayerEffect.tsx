import React, { useEffect, useRef, useState } from 'react';
import type { EasterEggContext, EasterEggResource } from '../../model/easter-egg.types';
import { useTheme } from '@shared/providers/ThemeProvider';
import { AudioPlayer } from './AudioPlayer';
import {
  useMainBounds,
  useHeaderPosition,
  useProjects,
  useFallingCards,
  useHeaderGlow,
} from './hooks';
import {
  EFFECT_DURATION_MS,
  FADE_OUT_DELAY_MS,
  SLIDE_ANIMATION_DURATION_MS,
  SLIDE_ANIMATION_MAX_OFFSET,
  MAIN_FADE_TRANSITION,
  MAIN_CLIP_TRANSITION,
  CLIP_PATH_RESET_DELAY_MS,
} from './constants';

interface DemonSlayerEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  resources?: EasterEggResource[];
}

export const DemonSlayerEffect: React.FC<DemonSlayerEffectProps> = ({
  context: _context,
  onClose,
  resources = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideAnimationRef = useRef<number | undefined>(undefined);
  const previousThemeRef = useRef<'light' | 'dark'>('light');

  const [isVisible, setIsVisible] = useState(true);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0);
  const [backgroundImagePosition, setBackgroundImagePosition] = useState(0);
  const [canStartAudio, setCanStartAudio] = useState(false);

  const { theme, setTheme } = useTheme();
  const mainAreaBounds = useMainBounds();
  const { headerBottom, headerBottomRef } = useHeaderPosition();
  const projects = useProjects();
  const { headerGlow, triggerHeaderGlowRef } = useHeaderGlow();
  const spawnCardRef = useFallingCards(containerRef, projects, headerBottomRef, isVisible);

  const audioResource = resources.find((r) => r.type === 'audio');

  // 테마 관리 및 초기 애니메이션
  useEffect(() => {
    const currentTheme = theme;
    if (currentTheme !== 'demon-slayer') {
      previousThemeRef.current = currentTheme === 'dark' ? 'dark' : 'light';
      setTheme('demon-slayer');
    }

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.transition = MAIN_FADE_TRANSITION;
      mainElement.style.opacity = '0';
      setBackgroundImageOpacity(1);
      setBackgroundImagePosition(0);

      const fadeOutTimer = setTimeout(() => {
        setCanStartAudio(true);
      }, FADE_OUT_DELAY_MS);

      return () => {
        clearTimeout(fadeOutTimer);
        setTheme(previousThemeRef.current);
        setBackgroundImageOpacity(0);
        setBackgroundImagePosition(0);
        if (slideAnimationRef.current) {
          cancelAnimationFrame(slideAnimationRef.current);
        }
        if (mainElement) {
          mainElement.style.opacity = '1';
          mainElement.style.transition = '';
          mainElement.style.pointerEvents = '';
        }
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 배경 이미지 슬라이드 애니메이션
  useEffect(() => {
    if (backgroundImageOpacity === 0) {
      if (slideAnimationRef.current) {
        cancelAnimationFrame(slideAnimationRef.current);
      }
      return;
    }

    const startTime = Date.now();

    const animateSlide = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SLIDE_ANIMATION_DURATION_MS, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const position = easeOut * SLIDE_ANIMATION_MAX_OFFSET;

      setBackgroundImagePosition(position);

      if (progress < 1 && backgroundImageOpacity > 0) {
        slideAnimationRef.current = requestAnimationFrame(animateSlide);
      }
    };

    slideAnimationRef.current = requestAnimationFrame(animateSlide);

    return () => {
      if (slideAnimationRef.current) {
        cancelAnimationFrame(slideAnimationRef.current);
      }
    };
  }, [backgroundImageOpacity]);

  // 오디오 재생 시작 핸들러
  const handlePlayStart = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.opacity = '0';
      mainElement.style.pointerEvents = 'none';
    }
  };

  // 오디오 재생 종료 핸들러
  const handlePlayEnd = () => {
    setBackgroundImageOpacity(0);
    if (slideAnimationRef.current) {
      cancelAnimationFrame(slideAnimationRef.current);
    }

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.transition = MAIN_CLIP_TRANSITION;
      mainElement.style.opacity = '1';
      mainElement.style.pointerEvents = '';
      mainElement.style.clipPath = 'inset(50% 50% 50% 50%)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (mainElement) {
            mainElement.style.clipPath = 'inset(0% 0% 0% 0%)';
          }
        });
      });

      setTimeout(() => {
        if (mainElement) {
          mainElement.style.transition = '';
          mainElement.style.clipPath = '';
        }
      }, CLIP_PATH_RESET_DELAY_MS);
    }
  };

  // 비트 감지 핸들러
  const handleBeatDetected = () => {
    if (spawnCardRef.current) {
      spawnCardRef.current();
    }
    if (triggerHeaderGlowRef.current) {
      triggerHeaderGlowRef.current();
    }
  };

  // 자동 종료 타이머
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, EFFECT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      {/* 배경 이미지 */}
      <div
        className="fixed pointer-events-none z-[30]"
        style={{
          left: `${mainAreaBounds.left}px`,
          top: `${headerBottom}px`,
          width: `${mainAreaBounds.width || window.innerWidth}px`,
          height: `${window.innerHeight - headerBottom}px`,
          backgroundImage: 'url(/easter-eggs/images/demonSlayer.png)',
          backgroundSize: '100% auto',
          backgroundPosition: `center ${backgroundImagePosition === 0 ? 'top' : `${backgroundImagePosition}%`}`,
          backgroundRepeat: 'no-repeat',
          opacity: backgroundImageOpacity,
          transition: 'opacity 1s ease-in-out',
          display: mainAreaBounds.width > 0 && headerBottom > 0 ? 'block' : 'none',
        }}
      />

      {/* 그라데이션 오버레이 */}
      {isVisible && (
        <div
          className="fixed inset-0 pointer-events-none z-[32]"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(255, 179, 102, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(255, 140, 66, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 0%, rgba(255, 107, 53, 0.15) 0%, transparent 60%),
              linear-gradient(180deg, rgba(26, 15, 15, 0.3) 0%, transparent 100%)
            `,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
          }}
        />
      )}

      {/* 헤더 글로우 효과 */}
      {isVisible && (
        <div
          className="fixed pointer-events-none z-[33]"
          style={{
            left: 0,
            right: 0,
            top: headerBottom - 2,
            height: '4px',
            background: headerGlow
              ? 'linear-gradient(90deg, transparent, rgba(255, 179, 102, 0.9), rgba(255, 140, 66, 0.9), rgba(255, 107, 53, 0.9), transparent)'
              : 'transparent',
            boxShadow: headerGlow
              ? '0 0 20px rgba(255, 179, 102, 0.8), 0 0 40px rgba(255, 140, 66, 0.6), 0 0 60px rgba(255, 107, 53, 0.4)'
              : 'none',
            transition: 'background 0.1s ease-out, box-shadow 0.1s ease-out',
          }}
        />
      )}

      {/* 떨어지는 카드 컨테이너 */}
      <div
        ref={containerRef}
        className="fixed pointer-events-none z-[34]"
        style={{
          left: `${mainAreaBounds.left}px`,
          top: `${mainAreaBounds.top}px`,
          width: `${mainAreaBounds.width || window.innerWidth}px`,
          height: `${mainAreaBounds.height || window.innerHeight}px`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
          display: mainAreaBounds.width > 0 ? 'block' : 'none',
        }}
      />

      {/* 오디오 플레이어 */}
      {audioResource && (
        <AudioPlayer
          resource={audioResource}
          onEnded={onClose}
          onPlayStart={handlePlayStart}
          onPlayEnd={handlePlayEnd}
          canStart={canStartAudio}
          onBeatDetected={handleBeatDetected}
        />
      )}
    </>
  );
};
