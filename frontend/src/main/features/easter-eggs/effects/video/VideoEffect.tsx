import React, { useEffect, useRef } from 'react';
import type { EasterEggContext } from '../../model/easter-egg.types';
import type { EasterEggResource } from '../../model/easter-egg.types';

interface VideoEffectProps {
  context: EasterEggContext;
  onClose: () => void;
  resources?: EasterEggResource[];
}

export const VideoEffect: React.FC<VideoEffectProps> = ({ context, onClose, resources = [] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoResource = resources.find(r => r.type === 'video');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoResource) return;

    // React의 JSX 속성으로는 `volume`이 올바른 attribute가 아니므로 property로 직접 세팅
    if (typeof videoResource.volume === 'number') {
      video.volume = videoResource.volume;
    } else {
      video.volume = 1;
    }

    const handleEnded = () => {
      onClose();
    };

    const handleError = () => {
      console.error('Video failed to load:', videoResource.path);
      onClose();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // 비디오 재생
    video.play().catch(error => {
      console.error('Video play failed:', error);
      onClose();
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [videoResource, onClose]);

  if (!videoResource) {
    return null;
  }

  return (
    <button
      type="button"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90"
      onClick={onClose}
      aria-label="비디오 닫기"
    >
      <video
        ref={videoRef}
        src={videoResource.path}
        className="max-w-full max-h-full"
        autoPlay
        muted={false}
        loop={videoResource.loop ?? false}
        controls={false}
      />
      <span
        className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
        aria-label="닫기"
        aria-hidden="true"
      >
        ✕
      </span>
    </button>
  );
};

