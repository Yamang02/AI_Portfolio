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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioResource) return;

    const handleEnded = () => {
      if (!audioResource.loop) {
        onClose();
      }
    };

    const handleError = () => {
      console.error('Audio failed to load:', audioResource.path);
      onClose();
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // 오디오 재생
    audio.volume = audioResource.volume ?? 0.7;
    audio.play().catch(error => {
      console.error('Audio play failed:', error);
      onClose();
    });

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
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
      preload={audioResource.preload ? 'auto' : 'none'}
    />
  );
};

