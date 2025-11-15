import { useState, useEffect, useRef, useCallback } from 'react';
import type { FallingCard, MainAreaBounds } from './types';
import { getMainElementBounds, createFallingCard, selectRandomProject, createCardHTML } from './utils';
import { getDemonSlayerColors, CARD_REMOVAL_OFFSET } from './constants';

/**
 * main 엘리먼트 경계 추적 훅
 */
export const useMainBounds = () => {
  const [mainAreaBounds, setMainAreaBounds] = useState<MainAreaBounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateMainBounds = () => {
      setMainAreaBounds(getMainElementBounds());
    };

    updateMainBounds();
    const timeoutId = setTimeout(updateMainBounds, 100);
    window.addEventListener('resize', updateMainBounds);
    window.addEventListener('scroll', updateMainBounds);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMainBounds);
      window.removeEventListener('scroll', updateMainBounds);
    };
  }, []);

  return mainAreaBounds;
};

/**
 * 헤더 위치 추적 훅
 */
export const useHeaderPosition = () => {
  const [headerBottom, setHeaderBottom] = useState(0);
  const headerBottomRef = useRef(0);

  useEffect(() => {
    const updateHeaderPosition = () => {
      const header = document.querySelector('header');
      if (header) {
        const rect = header.getBoundingClientRect();
        headerBottomRef.current = rect.bottom;
        setHeaderBottom(rect.bottom);
      }
    };

    updateHeaderPosition();
    window.addEventListener('resize', updateHeaderPosition);
    window.addEventListener('scroll', updateHeaderPosition);

    return () => {
      window.removeEventListener('resize', updateHeaderPosition);
      window.removeEventListener('scroll', updateHeaderPosition);
    };
  }, []);

  return { headerBottom, headerBottomRef };
};

/**
 * 프로젝트 데이터 로드 훅
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { apiClient } = await import('@shared/api/apiClient');
        const projectsData = await apiClient.getProjects({ type: 'project' });
        setProjects(projectsData);
      } catch (error) {
        console.error('프로젝트 데이터 로드 실패:', error);
      }
    };
    loadProjects();
  }, []);

  return projects;
};

/**
 * 떨어지는 카드 애니메이션 훅
 */
export const useFallingCards = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  projects: any[],
  headerBottomRef: React.MutableRefObject<number>,
  isVisible: boolean
) => {
  const cardsRef = useRef<FallingCard[]>([]);
  const usedProjectIdsRef = useRef<Set<string>>(new Set());
  const animationRef = useRef<number | undefined>(undefined);
  const spawnCardRef = useRef<(() => void) | null>(null);

  const spawnCard = useCallback(() => {
    const selectedProject = selectRandomProject(projects, usedProjectIdsRef.current);
    if (!selectedProject) return;

    const mainBounds = getMainElementBounds();
    const card = createFallingCard(selectedProject, headerBottomRef.current, mainBounds);

    cardsRef.current.push(card);
  }, [projects, headerBottomRef]);

  const renderCards = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // 기존 카드 제거
    const existingCards = container.querySelectorAll('.falling-card');
    existingCards.forEach((card) => card.remove());

    const colors = getDemonSlayerColors();

    cardsRef.current.forEach((card) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'falling-card';

      cardElement.style.cssText = `
        position: fixed;
        left: ${card.x}px;
        top: ${card.y}px;
        width: ${card.width}px;
        height: ${card.height}px;
        transform: rotate(${card.rotation}rad);
        opacity: 1;
        pointer-events: none;
        z-index: 34;
      `;

      cardElement.innerHTML = createCardHTML(card.project, colors);
      container.appendChild(cardElement);
    });
  }, [containerRef]);

  const animate = useCallback(() => {
    if (!isVisible) return;

    const mainBounds = getMainElementBounds();

    cardsRef.current = cardsRef.current.filter((card) => {
      card.y += card.speed;
      card.rotation += card.rotationSpeed;

      // 화면 밖으로 나간 카드 제거
      return card.y <= mainBounds.top + mainBounds.height + CARD_REMOVAL_OFFSET;
    });

    renderCards();
    animationRef.current = requestAnimationFrame(animate);
  }, [isVisible, renderCards]);

  useEffect(() => {
    spawnCardRef.current = spawnCard;
  }, [spawnCard]);

  useEffect(() => {
    if (!isVisible) return;

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const container = containerRef.current;
      if (container) {
        const existingCards = container.querySelectorAll('.falling-card');
        existingCards.forEach((card) => card.remove());
      }
    };
  }, [isVisible, animate, containerRef]);

  return spawnCardRef;
};

/**
 * 헤더 글로우 효과 훅
 */
export const useHeaderGlow = () => {
  const [headerGlow, setHeaderGlow] = useState(false);
  const triggerHeaderGlowRef = useRef<(() => void) | null>(null);

  const triggerHeaderGlow = useCallback(() => {
    setHeaderGlow(true);
    setTimeout(() => setHeaderGlow(false), 300);
  }, []);

  useEffect(() => {
    triggerHeaderGlowRef.current = triggerHeaderGlow;
  }, [triggerHeaderGlow]);

  return { headerGlow, triggerHeaderGlowRef };
};
