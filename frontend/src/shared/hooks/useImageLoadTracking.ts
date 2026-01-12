import { useState, useEffect, useCallback } from 'react';

/**
 * 이미지 로딩 추적 훅
 * 컨테이너 내의 모든 이미지가 로드되었는지 추적합니다.
 * 
 * @param containerRef 이미지를 포함하는 컨테이너의 ref
 * @returns 이미지 로딩 상태 정보
 */
export function useImageLoadTracking(containerRef: React.RefObject<HTMLElement>) {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) {
      setAllImagesLoaded(true);
      return;
    }

    const container = containerRef.current;
    const images = container.querySelectorAll('img');
    const imageArray = Array.from(images);
    setTotalCount(imageArray.length);

    if (imageArray.length === 0) {
      setAllImagesLoaded(true);
      return;
    }

    let loaded = 0;

    const handleImageLoad = () => {
      loaded++;
      setLoadedCount(loaded);
      if (loaded === imageArray.length) {
        setAllImagesLoaded(true);
      }
    };

    const handleImageError = () => {
      // 에러도 로드 완료로 간주 (레이아웃 시프트 방지)
      handleImageLoad();
    };

    // 각 이미지에 이벤트 리스너 추가
    imageArray.forEach((img) => {
      if (img.complete) {
        // 이미 로드된 이미지는 즉시 카운트
        handleImageLoad();
      } else {
        // 아직 로드 중인 이미지는 이벤트 리스너 추가
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageError);
      }
    });

    return () => {
      // 클린업: 이벤트 리스너 제거
      imageArray.forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageError);
      });
    };
  }, [containerRef]);

  return { allImagesLoaded, loadedCount, totalCount };
}
