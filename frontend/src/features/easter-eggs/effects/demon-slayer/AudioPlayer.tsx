import React, { useEffect, useRef } from 'react';
import type { EasterEggResource } from '../../model/easter-egg.types';

interface AudioPlayerProps {
  resource: EasterEggResource;
  onEnded: () => void;
  onBeatDetected?: () => void;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  canStart?: boolean;
}

const ENERGY_HISTORY_SIZE = 20;
const MIN_ENERGY_HISTORY = 10;
const BEAT_COOLDOWN_MS = 350;
const BASE_THRESHOLD_MULTIPLIER = 1.5;
const RELAXED_THRESHOLD_MULTIPLIER = 1.4;
const RELAXED_THRESHOLD_DELAY_MS = 500;

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  resource,
  onEnded,
  onBeatDetected,
  onPlayStart,
  onPlayEnd,
  canStart = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastBeatTimeRef = useRef<number>(0);
  const energyHistoryRef = useRef<number[]>([]);
  const onBeatDetectedRef = useRef(onBeatDetected);
  const onPlayStartRef = useRef(onPlayStart);
  const onPlayEndRef = useRef(onPlayEnd);

  // Callback refs를 최신 상태로 유지
  useEffect(() => {
    onBeatDetectedRef.current = onBeatDetected;
    onPlayStartRef.current = onPlayStart;
    onPlayEndRef.current = onPlayEnd;
  }, [onBeatDetected, onPlayStart, onPlayEnd]);

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

  // 비트 감지 로직 (가중 평균 및 동적 임계값 사용)
  const detectBeat = (energy: number) => {
    if (energyHistoryRef.current.length < MIN_ENERGY_HISTORY) return;

    const historyLength = energyHistoryRef.current.length;
    
    // 가중 평균 계산 (최근 값에 더 높은 가중치)
    let weightedSum = 0;
    let weightSum = 0;
    
    energyHistoryRef.current.forEach((value, index) => {
      // 최근 5개 값은 2배 가중치, 나머지는 1배
      const weight = index >= historyLength - 5 ? 2 : 1;
      weightedSum += value * weight;
      weightSum += weight;
    });
    
    const avgEnergy = weightedSum / weightSum;
    
    const currentTime = Date.now();
    const timeSinceLastBeat = currentTime - lastBeatTimeRef.current;
    
    // 동적 임계값: 마지막 비트 후 시간이 길수록 임계값을 낮춰서 약한 비트도 감지
    // 기본 임계값: 평균의 150%
    // 마지막 비트 후 500ms 이상 경과 시: 평균의 140%로 낮춤 (마지막 비트 놓치지 않기)
    const baseThreshold = avgEnergy * BASE_THRESHOLD_MULTIPLIER;
    const relaxedThreshold = avgEnergy * RELAXED_THRESHOLD_MULTIPLIER;
    const threshold = timeSinceLastBeat > RELAXED_THRESHOLD_DELAY_MS ? relaxedThreshold : baseThreshold;

    // 비트 감지: 최소 간격 350ms 이상 경과 시 감지
    if (energy > threshold && timeSinceLastBeat > BEAT_COOLDOWN_MS) {
      lastBeatTimeRef.current = currentTime;
      onBeatDetectedRef.current?.();
    }
  };

  // 오디오 분석 루프
  const analyzeAudio = () => {
    const audio = audioRef.current;
    if (!audio || !isMountedRef.current || audio.paused || !analyserRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // 평균 에너지 계산
    const energy = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

    // 에너지 히스토리 관리
    energyHistoryRef.current.push(energy);
    if (energyHistoryRef.current.length > ENERGY_HISTORY_SIZE) {
      energyHistoryRef.current.shift();
    }

    detectBeat(energy);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Web Audio API 초기화
  const initAudioAnalysis = () => {
    if (isInitializedRef.current || audioContextRef.current || sourceRef.current) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      isInitializedRef.current = true;

      analyzeAudio();
    } catch (error) {
      console.error('Web Audio API 초기화 실패:', error);
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      isInitializedRef.current = false;
    }
  };

  // 오디오 이벤트 리스너 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;

    isMountedRef.current = true;

    const handleCanPlayThrough = () => {
      if (!isMountedRef.current || isInitializedRef.current) return;
      audio.volume = resource.volume ?? 0.7;
      initAudioAnalysis();
    };

    const handlePlay = () => {
      if (isMountedRef.current) {
        onPlayStartRef.current?.();
      }
    };

    const handleEnded = () => {
      if (isMountedRef.current) {
        onPlayEndRef.current?.();
        onEnded();
      }
    };

    const handleError = () => {
      console.error('Audio failed to load:', resource.path);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (resource.preload !== false) {
      audio.load();
    }

    return () => {
      isMountedRef.current = false;
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          // ignore
        }
        sourceRef.current = null;
      }

      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {
          // ignore
        }
        analyserRef.current = null;
      }

      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch((error) => {
          if (error.name !== 'InvalidStateError') {
            console.warn('AudioContext close failed:', error);
          }
        });
        audioContextRef.current = null;
      }

      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
      isInitializedRef.current = false;
    };
  }, [resource.path, resource.volume, resource.preload, onEnded]);

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
