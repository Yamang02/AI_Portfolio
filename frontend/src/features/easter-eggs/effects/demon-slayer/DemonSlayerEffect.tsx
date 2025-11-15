import React, { useEffect, useRef, useState } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';
import type { EasterEggResource } from '../../model/easter-egg.types';

interface DemonSlayerEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  resources?: EasterEggResource[];
}

/**
 * 오디오 재생 및 분석 컴포넌트 (내부 사용)
 * Web Audio API를 사용하여 오디오 분석 및 비트 감지
 */
const AudioPlayer: React.FC<{
  resource: EasterEggResource;
  onEnded: () => void;
  onBeatDetected?: () => void;
}> = ({ resource, onEnded, onBeatDetected }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastBeatTimeRef = useRef<number>(0);
  const energyHistoryRef = useRef<number[]>([]);

  // 콜백을 ref로 저장하여 의존성 변경 시에도 재실행 방지
  const onBeatDetectedRef = useRef(onBeatDetected);
  useEffect(() => {
    onBeatDetectedRef.current = onBeatDetected;
  }, [onBeatDetected]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 이미 초기화된 경우 중복 실행 방지
    if (isInitializedRef.current) {
      console.log('Effect already initialized, skipping...');
      return;
    }

    isMountedRef.current = true;

    // Web Audio API 초기화
    const initAudioAnalysis = () => {
      // 이미 초기화되었으면 중복 초기화 방지
      if (isInitializedRef.current || audioContextRef.current || sourceRef.current) {
        console.log('Audio analysis already initialized, skipping...');
        return;
      }

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

        // 오디오 분석 루프
        const analyzeAudio = () => {
          if (!isMountedRef.current || audio.paused) {
            animationFrameRef.current = requestAnimationFrame(analyzeAudio);
            return;
          }

          const analyser = analyserRef.current;
          if (!analyser) {
            animationFrameRef.current = requestAnimationFrame(analyzeAudio);
            return;
          }

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          // 에너지 계산 (주파수 데이터의 평균)
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const energy = sum / bufferLength;

          // 에너지 히스토리 관리 (최근 10개 샘플)
          energyHistoryRef.current.push(energy);
          if (energyHistoryRef.current.length > 10) {
            energyHistoryRef.current.shift();
          }

          // 비트 감지: 에너지가 평균보다 일정 비율 이상 높으면 비트로 판단
          if (energyHistoryRef.current.length >= 5) {
            const avgEnergy =
              energyHistoryRef.current.reduce((a, b) => a + b, 0) / energyHistoryRef.current.length;
            const threshold = avgEnergy * 1.3; // 평균의 130% 이상

            const currentTime = Date.now();
            const timeSinceLastBeat = currentTime - lastBeatTimeRef.current;

            // 비트 감지 및 최소 간격 체크 (너무 빠른 연속 비트 방지)
            if (energy > threshold && timeSinceLastBeat > 200) {
              lastBeatTimeRef.current = currentTime;
              onBeatDetectedRef.current?.();
            }
          }

          animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();
      } catch (error) {
        console.error('Web Audio API 초기화 실패:', error);
        // 초기화 실패 시 상태 리셋
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
        isInitializedRef.current = false;
      }
    };

    // canplaythrough 이벤트로 초기화 (한 번만 실행)
    const handleCanPlayThrough = () => {
      if (!isMountedRef.current) return;

      // 초기화가 이미 되었으면 재생만 시작
      if (isInitializedRef.current) {
        audio.play().catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Audio play failed:', error);
          }
        });
        return;
      }

      // 초기화가 안 되었을 때만 초기화 + 재생
      audio.volume = resource.volume ?? 0.7;
      initAudioAnalysis();
      audio.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Audio play failed:', error);
        }
      });
    };

    const handleEnded = () => {
      if (isMountedRef.current) {
        onEnded();
      }
    };

    const handleError = () => {
      console.error('Audio failed to load:', resource.path);
    };

    // canplaythrough만 사용하여 중복 호출 방지
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (resource.preload !== false) {
      audio.load();
    }

    return () => {
      isMountedRef.current = false;
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);

      // 애니메이션 프레임 정리
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      // Web Audio API 정리 (순서 중요: source -> analyser -> context)
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          // 이미 연결 해제된 경우 무시
        }
        sourceRef.current = null;
      }

      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {
          // 이미 연결 해제된 경우 무시
        }
        analyserRef.current = null;
      }

      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch((error) => {
            if (error.name !== 'InvalidStateError') {
              console.warn('AudioContext close failed:', error);
            }
          });
        }
        audioContextRef.current = null;
      }

      // 오디오 정지 및 리셋
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;

      // 초기화 플래그 리셋 - 주의: audio 엘리먼트는 이미 source에 연결되어 있음
      isInitializedRef.current = false;
    };
  }, []); // 의존성 제거하여 컴포넌트 생명주기 동안 단 한 번만 실행

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

interface FallingCard {
  id: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  cardType: number; // 0-5: 다양한 카드 타입
  width: number;
  height: number;
}

// 카드 타입별 디자인 설정
const cardDesigns = [
  {
    // 타입 0: 기본 파란색 카드
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
    border: 'rgba(59, 130, 246, 0.4)',
    imageBg: 'rgba(59, 130, 246, 0.25)',
    textBg: 'rgba(59, 130, 246, 0.3)',
    width: 200,
    height: 150,
  },
  {
    // 타입 1: 노란색 카드
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(245, 158, 11, 0.15))',
    border: 'rgba(234, 179, 8, 0.4)',
    imageBg: 'rgba(234, 179, 8, 0.25)',
    textBg: 'rgba(234, 179, 8, 0.3)',
    width: 180,
    height: 135,
  },
  {
    // 타입 2: 빨간색 카드
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
    border: 'rgba(239, 68, 68, 0.4)',
    imageBg: 'rgba(239, 68, 68, 0.25)',
    textBg: 'rgba(239, 68, 68, 0.3)',
    width: 220,
    height: 165,
  },
  {
    // 타입 3: 초록색 카드
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))',
    border: 'rgba(34, 197, 94, 0.4)',
    imageBg: 'rgba(34, 197, 94, 0.25)',
    textBg: 'rgba(34, 197, 94, 0.3)',
    width: 190,
    height: 142,
  },
  {
    // 타입 4: 보라색 카드
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.15))',
    border: 'rgba(168, 85, 247, 0.4)',
    imageBg: 'rgba(168, 85, 247, 0.25)',
    textBg: 'rgba(168, 85, 247, 0.3)',
    width: 210,
    height: 158,
  },
  {
    // 타입 5: 주황색 카드
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.15))',
    border: 'rgba(249, 115, 22, 0.4)',
    imageBg: 'rgba(249, 115, 22, 0.25)',
    textBg: 'rgba(249, 115, 22, 0.3)',
    width: 195,
    height: 146,
  },
];

/**
 * 귀멸의 칼날 무한성편 테마 애니메이션
 * - 헤더로부터 카드 컴포넌트가 아래로 떨어지는 효과
 * - 원작의 무한성편 느낌 구현
 */
export const DemonSlayerEffect: React.FC<DemonSlayerEffectProps> = ({
  context,
  onClose,
  resources = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const cardsRef = useRef<FallingCard[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [headerGlow, setHeaderGlow] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const lastSpawnTimeRef = useRef<number>(Date.now());
  const headerBottomRef = useRef<number>(0);
  const audioResource = resources.find((r) => r.type === 'audio');
  const spawnCardRef = useRef<(() => void) | null>(null);
  const triggerHeaderGlowRef = useRef<(() => void) | null>(null);

  // 헤더 위치 찾기 및 카드 떨어뜨리기
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeaderPosition = () => {
      const header = document.querySelector('header');
      if (header) {
        const rect = header.getBoundingClientRect();
        const bottom = rect.bottom;
        headerBottomRef.current = bottom;
        setHeaderBottom(bottom);
      }
    };

    updateHeaderPosition();
    window.addEventListener('resize', updateHeaderPosition);
    window.addEventListener('scroll', updateHeaderPosition);

    // 헤더 빛나는 효과 트리거
    const triggerHeaderGlow = () => {
      setHeaderGlow(true);
      setTimeout(() => {
        setHeaderGlow(false);
      }, 300); // 300ms 동안 빛남
    };

    // 새로운 카드 생성
    const spawnCard = () => {
      const cardType = Math.floor(Math.random() * cardDesigns.length);
      const design = cardDesigns[cardType];
      
      const card: FallingCard = {
        id: `card-${Date.now()}-${Math.random()}`,
        x: Math.random() * (window.innerWidth - design.width),
        y: headerBottomRef.current,
        speed: 2 + Math.random() * 3,
        rotation: (Math.random() - 0.5) * 0.2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        cardType,
        width: design.width,
        height: design.height,
      };
      cardsRef.current.push(card);
      
      // 헤더 빛나는 효과 트리거
      triggerHeaderGlow();
    };

    // spawnCard와 triggerHeaderGlow를 ref에 저장하여 AudioPlayer에서 접근 가능하게 함
    spawnCardRef.current = spawnCard;
    triggerHeaderGlowRef.current = triggerHeaderGlow;

    // 카드 컴포넌트 렌더링
    const renderCards = () => {
      if (!container) return;

      // 기존 카드 제거
      const existingCards = container.querySelectorAll('.falling-card');
      existingCards.forEach((card) => card.remove());

      // 현재 카드들 렌더링
      cardsRef.current.forEach((card) => {
        const design = cardDesigns[card.cardType] || cardDesigns[0];
        
        const cardElement = document.createElement('div');
        cardElement.className = 'falling-card';
        cardElement.style.cssText = `
          position: fixed;
          left: ${card.x}px;
          top: ${card.y}px;
          width: ${card.width}px;
          height: ${card.height}px;
          transform: rotate(${card.rotation}rad);
          opacity: 0.85;
          pointer-events: none;
          z-index: 9999;
        `;

        // 카드 타입별 다양한 디자인
        cardElement.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            background: ${design.gradient};
            border: 2px solid ${design.border};
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 8px ${design.border}40;
            padding: ${card.height * 0.1}px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          ">
            <div style="
              width: 100%;
              height: 60%;
              background: ${design.imageBg};
              border-radius: 8px;
              margin-bottom: 8px;
              position: relative;
              overflow: hidden;
            ">
              ${card.cardType === 1 || card.cardType === 4 ? `
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 60%;
                  height: 60%;
                  border: 2px solid ${design.border};
                  border-radius: 50%;
                "></div>
              ` : ''}
            </div>
            <div style="
              width: ${card.cardType === 2 ? '90%' : '80%'};
              height: ${card.height * 0.08}px;
              background: ${design.textBg};
              border-radius: 4px;
              margin-bottom: 4px;
            "></div>
            <div style="
              width: ${card.cardType === 3 ? '70%' : '60%'};
              height: ${card.height * 0.05}px;
              background: ${design.textBg};
              border-radius: 4px;
            "></div>
          </div>
        `;

        container.appendChild(cardElement);
      });
    };

    // 애니메이션 루프
    const animate = () => {
      if (!isVisible) return;

      // 카드 생성은 오디오 비트에 맞춰서만 발생 (수동 생성 제거)

      // 카드 업데이트
      cardsRef.current = cardsRef.current.filter((card) => {
        card.y += card.speed;
        card.rotation += card.rotationSpeed;

        // 화면 밖으로 나가면 제거
        if (card.y > window.innerHeight + 200) {
          return false;
        }

        return true;
      });

      // 카드 렌더링
      renderCards();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateHeaderPosition);
      window.removeEventListener('scroll', updateHeaderPosition);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // 모든 카드 제거
      const existingCards = container.querySelectorAll('.falling-card');
      existingCards.forEach((card) => card.remove());
    };
  }, [isVisible]);

  // 일정 시간 후 페이드 아웃
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 30000); // 30초 후 종료

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      {/* 헤더 하단 빛나는 효과 */}
      {isVisible && (
        <div
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: 0,
            right: 0,
            top: headerBottom - 2,
            height: '4px',
            background: headerGlow
              ? 'linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.9), rgba(245, 158, 11, 0.9), transparent)'
              : 'transparent',
            boxShadow: headerGlow
              ? '0 0 20px rgba(234, 179, 8, 0.8), 0 0 40px rgba(245, 158, 11, 0.6)'
              : 'none',
            transition: 'background 0.1s ease-out, box-shadow 0.1s ease-out',
          }}
        />
      )}

      {/* 헤더로부터 떨어지는 카드 컴포넌트 */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      />
      {audioResource && (
        <AudioPlayer
          resource={audioResource}
          onEnded={onClose}
          onBeatDetected={() => {
            // 비트 감지 시 카드 생성 및 헤더 빛남
            if (spawnCardRef.current) {
              spawnCardRef.current();
            }
            if (triggerHeaderGlowRef.current) {
              triggerHeaderGlowRef.current();
            }
          }}
        />
      )}
    </>
  );
};

