import { useEffect, useState } from 'react';
import type { ProfileNavigationItem } from '../content/types';

export function useScrollSpy(navigation: readonly ProfileNavigationItem[]) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const updateActiveSection = () => {
      const threshold = window.innerHeight * 0.35;
      let activeId: string | null = null;

      navigation.forEach(({ href }) => {
        const section = document.querySelector<HTMLElement>(href);
        if (section && section.getBoundingClientRect().top <= threshold) {
          activeId = href.slice(1);
        }
      });

      setActiveSection(activeId);
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();

    return () => window.removeEventListener('scroll', updateActiveSection);
  }, [navigation]);

  return activeSection;
}
