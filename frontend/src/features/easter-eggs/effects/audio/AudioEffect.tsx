import React, { useEffect, useRef } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';
import type { EasterEggResource } from '../../model/easter-egg.types';

interface AudioEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  resources?: EasterEggResource[];
}

export const AudioEffect: React.FC<AudioEffectProps> = ({ context, onClose, resources = [] }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioResource = resources.find(r => r.type === 'audio');
  const isPlayingRef = useRef(false);
  const hasErrorRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioResource) return;

    isMountedRef.current = true;
    isPlayingRef.current = false;
    hasErrorRef.current = false;

    const handleCanPlay = () => {
      // 오디오가 재생 가능해지면 재생 시작
      if (isMountedRef.current && !isPlayingRef.current && !hasErrorRef.current) {
        audio.volume = audioResource.volume ?? 0.7;
        audio.play()
          .then(() => {
            if (isMountedRef.current) {
              isPlayingRef.current = true;
            }
          })
          .catch(error => {
            // AbortError는 무시 (컴포넌트 언마운트로 인한 정상적인 중단)
            if (error.name !== 'AbortError' && isMountedRef.current) {
              console.error('Audio play failed:', error);
              hasErrorRef.current = true;
              // 네트워크 오류나 파일을 찾을 수 없는 경우에만 onClose 호출
              if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                onClose();
              }
            }
          });
      }
    };

    const handleEnded = () => {
      if (isMountedRef.current && !audioResource.loop) {
        isPlayingRef.current = false;
        onClose();
      }
    };

    const handleError = (e: Event) => {
      if (!isMountedRef.current) return;
      console.error('Audio failed to load:', audioResource.path, e);
      hasErrorRef.current = true;
      // 파일을 찾을 수 없는 경우에만 onClose 호출
      const audioElement = e.target as HTMLAudioElement;
      if (audioElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || 
          audioElement.error?.code === MediaError.MEDIA_ERR_NETWORK) {
        onClose();
      }
    };

    const handleLoadedMetadata = () => {
      // 메타데이터 로드 완료 시 재생 가능 상태 확인
      if (isMountedRef.current && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        handleCanPlay();
      }
    };

    // 이벤트 리스너 등록
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // 오디오 소스 설정
    audio.volume = audioResource.volume ?? 0.7;
    
    // preload가 'none'이 아닌 경우 로드 시작
    if (audioResource.preload !== false) {
      audio.load();
    }

    return () => {
      isMountedRef.current = false;
      // 정리 함수: 이벤트 리스너 제거 및 오디오 정지
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      
      // 재생 중이면 정지
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
    };
  }, [audioResource, onClose]);

  if (!audioResource) {
    return null;
  }

  // 오디오는 보이지 않게 재생 (필요시 UI 추가 가능)
  return (
    <audio
      ref={audioRef}
      src={audioResource.path}
      loop={audioResource.loop ?? false}
      preload={audioResource.preload ? 'auto' : 'metadata'}
    />
  );
};

