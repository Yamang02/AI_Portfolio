import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export function useInView(ref: RefObject<Element | null>): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(Boolean(entry?.isIntersecting));
    }, { threshold: 0.1 });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}
