import React, { useEffect, useRef } from 'react';
import type { EasterEggResource } from '../../model/easter-egg.types';
import { ManualBeatTimingDetector } from '../../lib/manualBeatTiming';

interface AudioPlayerProps {
  resource: EasterEggResource;
  onEnded: () => void;
  onBeatDetected?: () => void;
  onPlayStart?: () => void;
  canStart?: boolean;
  beatTimings?: number[]; // 비트 타이밍 배열 (초 단위)
  audioConfig?: {
    beatTimingTolerance?: number; // 비트 타이밍 허용 오차 (초 단위, 기본값: 0.1)
    enableBeatLogging?: boolean; // 비트 감지 로그 활성화 여부 (기본값: false)
  };
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  resource,
  onEnded,
  onBeatDetected,
  onPlayStart,
  canStart = false,
  beatTimings = [],
  audioConfig,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMountedRef = useRef(true);
  const beatDetectorRef = useRef<ManualBeatTimingDetector | null>(null);
  const onBeatDetectedRef = useRef(onBeatDetected);
  const onPlayStartRef = useRef(onPlayStart);

  // Callback refs를 최신 상태로 유지
  useEffect(() => {
    onBeatDetectedRef.current = onBeatDetected;
    onPlayStartRef.current = onPlayStart;
  }, [onBeatDetected, onPlayStart]);

  // 오디오 재생 시작
  useEffect(() => {
    if (canStart && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Audio play failed:', error);
        }
      });
    }
  }, [canStart]);

  // 오디오 이벤트 리스너 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    isMountedRef.current = true;

    const handleCanPlayThrough = () => {
      if (!isMountedRef.current) return;
      // volume은 resource에서 가져오거나 기본값 사용
      audio.volume = resource.volume ?? 0.5;
    };

    const handlePlay = () => {
      if (!isMountedRef.current) return;
      
      // 비트 타이밍이 있으면 감지기 시작
      if (beatTimings.length > 0 && audio) {
        // 기존 감지기 정리
        if (beatDetectorRef.current) {
          beatDetectorRef.current.destroy();
        }

        // 새 감지기 생성 및 시작
        const tolerance = audioConfig?.beatTimingTolerance ?? 0.1;
        const enableLogging = audioConfig?.enableBeatLogging ?? false;
        
        beatDetectorRef.current = new ManualBeatTimingDetector(
          {
            beatTimings,
            tolerance,
            onBeatDetected: (beatTime) => {
              if (enableLogging) {
                console.log(`[카드 생성] 타이밍: ${beatTime.toFixed(3)}초`);
              }
              onBeatDetectedRef.current?.();
            },
          },
          () => audio.currentTime
        );
        beatDetectorRef.current.start();
      }

      onPlayStartRef.current?.();
    };

    const handlePause = () => {
      if (beatDetectorRef.current) {
        beatDetectorRef.current.stop();
      }
    };

    const handleEnded = () => {
      if (!isMountedRef.current) return;
      if (beatDetectorRef.current) {
        beatDetectorRef.current.destroy();
        beatDetectorRef.current = null;
      }
      // onPlayEnd 호출하지 않음 (회복 시퀀스는 타이머로 관리)
      // onPlayEndRef.current?.();

      // 오디오가 끝나도 바로 종료하지 않음 (회복 시퀀스 완료 후 종료)
      // onEnded는 회복 시퀀스에서 호출되도록 변경 필요
    };

    const handleError = () => {
      console.error('Audio failed to load:', resource.path);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (resource.preload !== false) {
      audio.load();
    }

    return () => {
      isMountedRef.current = false;
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);

      if (beatDetectorRef.current) {
        beatDetectorRef.current.destroy();
        beatDetectorRef.current = null;
      }

      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
    };
  }, [resource.path, resource.volume, resource.preload, onEnded, beatTimings]);

  return (
    <audio
      ref={audioRef}
      src={resource.path}
      loop={resource.loop ?? false}
      preload={resource.preload ? 'auto' : 'metadata'}
      crossOrigin="anonymous"
    />
  );
};
