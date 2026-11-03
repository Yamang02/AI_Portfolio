import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface UseInViewOptions {
  readonly bottomRootMarginViewportRatio?: number;
  readonly rootMargin?: string;
  readonly threshold?: number;
  readonly once?: boolean;
}

export function useInView(ref: RefObject<Element | null>, options: UseInViewOptions = {}): boolean {
  const [isInView, setIsInView] = useState(false);
  const { bottomRootMarginViewportRatio, rootMargin, threshold = 0.1, once = false } = options;

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      const bottomMargin = bottomRootMarginViewportRatio === undefined
        ? undefined
        : Math.round(window.innerHeight * bottomRootMarginViewportRatio);
      observer = new IntersectionObserver(([entry]) => {
        const isIntersecting = Boolean(entry?.isIntersecting && entry.intersectionRatio >= threshold);

        if (isIntersecting && once) {
          setIsInView(true);
          observer?.disconnect();
          window.removeEventListener('resize', observe);
          return;
        }

        setIsInView(isIntersecting);
      }, {
        rootMargin: bottomMargin === undefined ? rootMargin : '0px 0px -' + bottomMargin + 'px 0px',
        threshold,
      });
      observer.observe(element);
    };

    observe();

    if (bottomRootMarginViewportRatio !== undefined) {
      window.addEventListener('resize', observe);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, [bottomRootMarginViewportRatio, once, ref, rootMargin, threshold]);

  return isInView;
}
