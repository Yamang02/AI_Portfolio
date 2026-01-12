import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EasterEggContext, EasterEggResource } from '../../model/easter-egg.types';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { AudioPlayer } from './AudioPlayer';
import {
  useMainBounds,
  useHeaderPosition,
  useProjects,
  useFallingCards,
  useHeaderGlow,
} from './hooks';
import {
  MAIN_FADE_TRANSITION,
  CARD_WIDTH,
} from './constants';

interface DemonSlayerEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  resources?: EasterEggResource[];
  config?: Record<string, unknown>;
}

export const DemonSlayerEffect: React.FC<DemonSlayerEffectProps> = ({
  context: _context,
  onClose,
  resources = [],
  config,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideAnimationRef = useRef<number | undefined>(undefined);
  const previousThemeRef = useRef<'light' | 'dark'>('light');

  const [isVisible, setIsVisible] = useState(true);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0);
  const [backgroundImagePosition, setBackgroundImagePosition] = useState(0);
  const [canStartAudio, setCanStartAudio] = useState(false);
  const [backgroundBrightness, setBackgroundBrightness] = useState(0.6); // 초기 밝기 60%
  const [isFadingOut, setIsFadingOut] = useState(false);
  const audioStartTimeRef = useRef<number | null>(null);
  const recoveryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { theme, setTheme } = useTheme();
  const mainAreaBounds = useMainBounds();
  const { headerBottom, headerBottomRef } = useHeaderPosition();
  const projects = useProjects();
  const { headerGlow, glowPosition, triggerHeaderGlowRef } = useHeaderGlow();
  const CARD_REMOVAL_OFFSET = (config?.cardRemovalOffset as number) ?? 200;

  const audioResource = resources.find((r) => r.type === 'audio');
  const backgroundImageResource = resources.find((r) => r.type === 'image');

  // JSON config에서 값 가져오기 (기본값은 constants에서)
  const FADE_OUT_DELAY_MS = (config?.fadeOutDelayMs as number) ?? 1000;
  const SLIDE_ANIMATION_DURATION_MS = (config?.slideAnimationDurationMs as number) ?? 10000;
  const SLIDE_ANIMATION_MAX_OFFSET = (config?.slideAnimationMaxOffset as number) ?? 50;
  const effectTheme = (config?.theme as string) ?? 'demon-slayer';
  
  // 배경 어두워지기 설정
  const darkeningConfig = (config?.darkeningConfig as { startTime?: number; duration?: number; minBrightness?: number }) ?? {};
  const darkeningStartTime = darkeningConfig.startTime ?? 2.0;
  const darkeningDuration = darkeningConfig.duration ?? 3.0;
  const minBrightness = darkeningConfig.minBrightness ?? 0.3;
  
  const backgroundFadeoutDuration = 500;
  
  const beatTimings = (config?.beatTimings as number[]) ?? [];
  const lastBeatTime = beatTimings.length > 0 ? Math.max(...beatTimings) : 0;
  const recoveryStartDelay = 2000;
  
  const startRecoverySequence = useCallback(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.opacity = '1';
      mainElement.style.pointerEvents = '';
    }
    
    setIsFadingOut(true);
    setBackgroundImageOpacity(0);
    
    setTimeout(() => {
      const style = document.createElement('style');
      style.id = 'theme-recovery-transition';
      style.textContent = `
        * {
          transition: background-color 0.8s ease-in-out,
                      color 0.8s ease-in-out,
                      border-color 0.8s ease-in-out,
                      box-shadow 0.8s ease-in-out;
        }
      `;
      document.head.appendChild(style);
      
      setTheme(previousThemeRef.current);
      
      setTimeout(() => {
        const transitionStyle = document.getElementById('theme-recovery-transition');
        if (transitionStyle) {
          transitionStyle.remove();
        }
        
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 500);
      }, 800);
    }, backgroundFadeoutDuration);
  }, [backgroundFadeoutDuration, onClose, setTheme]);
  
  const handleCardSpawn = useCallback((cardX: number) => {
    if (triggerHeaderGlowRef.current) {
      triggerHeaderGlowRef.current(cardX);
    }
  }, [triggerHeaderGlowRef]);
  
  const handleLastCardReachedFooter = useCallback(() => {
  }, []);
  
  const spawnCardRef = useFallingCards(containerRef, projects, headerBottomRef, isVisible, CARD_REMOVAL_OFFSET, handleCardSpawn, handleLastCardReachedFooter);

  // 테마 관리 및 초기 애니메이션
  useEffect(() => {
    const currentTheme = theme;
    if (currentTheme !== effectTheme) {
      previousThemeRef.current = currentTheme === 'dark' ? 'dark' : 'light';
      setTheme(effectTheme as 'demon-slayer');
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
        if (recoveryTimerRef.current) {
          clearTimeout(recoveryTimerRef.current);
          recoveryTimerRef.current = null;
        }
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
  const handlePlayStart = useCallback(() => {
    audioStartTimeRef.current = Date.now();
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.opacity = '0';
      mainElement.style.pointerEvents = 'none';
    }

    // 기존 타이머 정리
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }

    if (lastBeatTime > 0) {
      const totalDelayMs = (lastBeatTime * 1000) + recoveryStartDelay;
      recoveryTimerRef.current = setTimeout(() => {
        recoveryTimerRef.current = null;
        startRecoverySequence();
      }, totalDelayMs);
    }
  }, [lastBeatTime, recoveryStartDelay, startRecoverySequence]);


  // 비트 감지 핸들러
  const handleBeatDetected = () => {
    if (spawnCardRef.current) {
      spawnCardRef.current();
    }
  };

  // 배경 어두워지기 애니메이션
  useEffect(() => {
    if (!audioStartTimeRef.current) return;

    const animateDarkening = () => {
      const currentTime = (Date.now() - audioStartTimeRef.current!) / 1000;
      
      if (currentTime >= darkeningStartTime && currentTime < darkeningStartTime + darkeningDuration) {
        const progress = (currentTime - darkeningStartTime) / darkeningDuration;
        const brightness = 0.6 - (progress * (0.6 - minBrightness));
        setBackgroundBrightness(brightness);
      } else if (currentTime >= darkeningStartTime + darkeningDuration) {
        setBackgroundBrightness(minBrightness);
      }

      if (!isFadingOut && currentTime < darkeningStartTime + darkeningDuration + 10) {
        requestAnimationFrame(animateDarkening);
      }
    };

    const animationFrame = requestAnimationFrame(animateDarkening);
    return () => cancelAnimationFrame(animationFrame);
  }, [darkeningStartTime, darkeningDuration, minBrightness, isFadingOut]);

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
          backgroundImage: backgroundImageResource ? `url(${backgroundImageResource.path})` : 'url(/easter-eggs/images/demonSlayer.png)',
          backgroundSize: '100% auto',
          backgroundPosition: `center ${backgroundImagePosition === 0 ? 'top' : `${backgroundImagePosition}%`}`,
          backgroundRepeat: 'no-repeat',
          filter: `brightness(${backgroundBrightness})`,
          opacity: isFadingOut ? 0 : backgroundImageOpacity,
          transition: isFadingOut ? `opacity ${backgroundFadeoutDuration}ms ease-out, filter ${backgroundFadeoutDuration}ms ease-out` : 'opacity 1s ease-in-out, filter 0.1s linear',
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
            opacity: isFadingOut ? 0 : (isVisible ? 1 : 0),
            transition: isFadingOut ? `opacity ${backgroundFadeoutDuration}ms ease-out` : 'opacity 0.5s ease-out',
          }}
        />
      )}

      {/* 그림자 오버레이 - 헤더 아래 영역, 이스터에그 전체 기간 동안 유지 */}
      {isVisible && (
        <div
          className="fixed pointer-events-none z-[31]"
          style={{
            left: 0,
            right: 0,
            top: `${headerBottom}px`,
            height: `${window.innerHeight - headerBottom}px`,
            background: `linear-gradient(180deg, 
              rgba(0, 0, 0, 0.5) 0%, 
              rgba(0, 0, 0, 0.4) 20%, 
              rgba(0, 0, 0, 0.3) 50%, 
              rgba(0, 0, 0, 0.2) 70%, 
              rgba(0, 0, 0, 0.1) 85%, 
              transparent 100%)`,
            opacity: isFadingOut ? 0 : 1,
            transition: isFadingOut ? `opacity ${backgroundFadeoutDuration}ms ease-out` : 'opacity 0.5s ease-out',
          }}
        />
      )}

      {/* 헤더 글로우 효과 - 전체 헤더에 글로우 */}
      {isVisible && headerGlow && (
        <div
          className="fixed pointer-events-none z-[33]"
          style={{
            left: 0,
            right: 0,
            top: headerBottom - 2,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 179, 102, 0.9), rgba(255, 140, 66, 0.9), rgba(255, 107, 53, 0.9), transparent)',
            boxShadow: '0 0 20px rgba(255, 179, 102, 0.8), 0 0 40px rgba(255, 140, 66, 0.6), 0 0 60px rgba(255, 107, 53, 0.4)',
            transition: 'background 0.1s ease-out, box-shadow 0.1s ease-out',
          }}
        />
      )}

      {/* 광원 확산 효과 - 카드 생성 위치에서 헤더 아래로 빛이 퍼지는 효과 (그림자를 밝게 만드는 효과) */}
      {isVisible && headerGlow && glowPosition !== null && (
        <>
          {/* 그림자를 밝게 만드는 효과 - 카드 생성 위치에서 그림자가 열리는 느낌 */}
          <div
            className="fixed pointer-events-none z-[31]"
            style={{
              left: `${glowPosition - 150}px`,
              top: `${headerBottom}px`,
              width: `${CARD_WIDTH + 300}px`,
              height: `${window.innerHeight - headerBottom}px`,
              background: `radial-gradient(ellipse at center top, 
                rgba(255, 255, 255, 0.3) 0%, 
                rgba(255, 255, 255, 0.2) 10%, 
                rgba(255, 255, 255, 0.1) 25%, 
                rgba(255, 255, 255, 0.05) 40%, 
                transparent 60%)`,
              opacity: 1,
              maskImage: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.2) 5%, 
                rgba(255, 255, 255, 0.8) 10%, 
                rgba(255, 255, 255, 1) 15%, 
                rgba(255, 255, 255, 1) 85%, 
                rgba(255, 255, 255, 0.8) 90%, 
                rgba(255, 255, 255, 0.2) 95%, 
                transparent 100%)`,
              WebkitMaskImage: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.2) 5%, 
                rgba(255, 255, 255, 0.8) 10%, 
                rgba(255, 255, 255, 1) 15%, 
                rgba(255, 255, 255, 1) 85%, 
                rgba(255, 255, 255, 0.8) 90%, 
                rgba(255, 255, 255, 0.2) 95%, 
                transparent 100%)`,
              transition: 'opacity 0.1s ease-out, left 0.1s ease-out',
            }}
          />
          
          {/* 광원 확산 효과 - 헤더 아래로 빛이 퍼지는 효과 (y축 더 길게) */}
          <div
            className="fixed pointer-events-none z-[32]"
            style={{
              left: `${glowPosition - 150}px`,
              top: `${headerBottom}px`,
              width: `${CARD_WIDTH + 300}px`,
              height: '250px',
              background: `radial-gradient(ellipse 100% 60% at center top, 
                rgba(255, 179, 102, 0.8) 0%, 
                rgba(255, 140, 66, 0.7) 12%, 
                rgba(255, 107, 53, 0.6) 25%, 
                rgba(255, 140, 66, 0.4) 40%, 
                rgba(255, 107, 53, 0.2) 60%, 
                transparent 85%)`,
              opacity: 1,
              maskImage: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.3) 5%, 
                rgba(255, 255, 255, 1) 10%, 
                rgba(255, 255, 255, 1) 90%, 
                rgba(255, 255, 255, 0.3) 95%, 
                transparent 100%)`,
              WebkitMaskImage: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.3) 5%, 
                rgba(255, 255, 255, 1) 10%, 
                rgba(255, 255, 255, 1) 90%, 
                rgba(255, 255, 255, 0.3) 95%, 
                transparent 100%)`,
              transition: 'opacity 0.1s ease-out, left 0.1s ease-out',
            }}
          />
          
          {/* 추가 광원 레이어 - 더 강한 빛 (y축 더 길게) */}
          <div
            className="fixed pointer-events-none z-[32]"
            style={{
              left: `${glowPosition + CARD_WIDTH / 2 - 100}px`,
              top: `${headerBottom}px`,
              width: '200px',
              height: '140px',
              background: `radial-gradient(ellipse 100% 70% at center top, 
                rgba(255, 179, 102, 0.9) 0%, 
                rgba(255, 140, 66, 0.7) 25%, 
                rgba(255, 107, 53, 0.5) 50%, 
                transparent 80%)`,
              opacity: 1,
              transition: 'opacity 0.1s ease-out, left 0.1s ease-out',
            }}
          />
          
        </>
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
          opacity: isFadingOut ? 0 : (isVisible ? 1 : 0),
          transition: isFadingOut ? `opacity ${backgroundFadeoutDuration}ms ease-out` : 'opacity 0.5s ease-out',
          display: mainAreaBounds.width > 0 ? 'block' : 'none',
        }}
      />

      {/* 오디오 플레이어 */}
      {audioResource && (
        <AudioPlayer
          resource={audioResource}
          onEnded={onClose}
          onPlayStart={handlePlayStart}
          canStart={canStartAudio}
          onBeatDetected={handleBeatDetected}
          beatTimings={config?.beatTimings as number[] | undefined}
          audioConfig={config?.audioConfig as { beatTimingTolerance?: number; enableBeatLogging?: boolean } | undefined}
        />
      )}
    </>
  );
};
