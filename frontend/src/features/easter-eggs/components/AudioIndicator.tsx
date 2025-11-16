import React, { useEffect, useRef, useState } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';

/**
 * 오디오 재생 시 표시되는 시각적 인디케이터
 * 화면 우측 하단에 플로팅 위젯으로 표시
 */
export const AudioIndicator: React.FC = () => {
  const { activeEffects } = useEasterEggStore();
  const [isVisible, setIsVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // 활성화된 오디오 이펙트 찾기
  useEffect(() => {
    const audioEffect = activeEffects.find((effect) => effect.id === 'demon-slayer-effect');
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cleanup: (() => void) | null = null;
    
    if (audioEffect) {
      // 오디오 엘리먼트 찾기 (약간의 지연 후)
      const findAudio = (): void => {
        const audioElement = document.querySelector('audio[src*="demon-slayer"]') as HTMLAudioElement;
        
        if (audioElement) {
          audioRef.current = audioElement;
          setIsVisible(true);
          setAudioPlaying(!audioElement.paused);

          const handlePlay = () => setAudioPlaying(true);
          const handlePause = () => setAudioPlaying(false);
          const handleEnded = () => {
            setAudioPlaying(false);
            setIsVisible(false);
          };

          audioElement.addEventListener('play', handlePlay);
          audioElement.addEventListener('pause', handlePause);
          audioElement.addEventListener('ended', handleEnded);

          cleanup = () => {
            audioElement.removeEventListener('play', handlePlay);
            audioElement.removeEventListener('pause', handlePause);
            audioElement.removeEventListener('ended', handleEnded);
          };
        } else {
          // 오디오 엘리먼트가 아직 생성되지 않았으면 잠시 후 다시 시도
          timeoutId = setTimeout(findAudio, 100);
        }
      };

      findAudio();
    } else {
      setIsVisible(false);
      setAudioPlaying(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [activeEffects]);

  // 파형 애니메이션
  useEffect(() => {
    const canvas = waveformRef.current;
    if (!canvas || !isVisible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 60;
    canvas.height = 20;

    const bars = 8;
    const barWidth = canvas.width / bars;
    const maxHeight = canvas.height;

    const animate = () => {
      if (!isVisible || !audioPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';

      for (let i = 0; i < bars; i++) {
        const height = (Math.random() * 0.5 + 0.5) * maxHeight;
        const x = i * barWidth + barWidth / 4;
        const y = (canvas.height - height) / 2;

        ctx.fillRect(x, y, barWidth / 2, height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, audioPlaying]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[10000] bg-surface/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-border/30 p-3 flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in"
      style={{
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      {/* 스피커 아이콘 */}
      <div className="flex-shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-primary-600 dark:text-primary-400 transition-opacity ${
            audioPlaying ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      </div>

      {/* 파형 애니메이션 */}
      <canvas
        ref={waveformRef}
        className="flex-shrink-0"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* 텍스트 */}
      <span className="text-sm text-text-secondary whitespace-nowrap">
        비파 소리
      </span>

      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

