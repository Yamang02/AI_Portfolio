import { useState, useEffect, useRef, useCallback } from 'react';
import type { FallingCard, MainAreaBounds } from './types';
import { getMainElementBounds, createFallingCard, selectRandomProject, createCardHTML } from './utils';
import { getDemonSlayerColors, CARD_REMOVAL_OFFSET as DEFAULT_CARD_REMOVAL_OFFSET } from './constants';

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
  isVisible: boolean,
  cardRemovalOffset: number = DEFAULT_CARD_REMOVAL_OFFSET,
  onCardSpawned?: (cardX: number) => void,
  onLastCardReachedFooter?: () => void
) => {
  const cardsRef = useRef<FallingCard[]>([]);
  const usedProjectIdsRef = useRef<Set<string>>(new Set());
  const animationRef = useRef<number | undefined>(undefined);
  const spawnCardRef = useRef<((onSpawned?: (cardX: number) => void) => void) | null>(null);
  const lastCardRef = useRef<FallingCard | null>(null);
  const lastCardReachedFooterRef = useRef<boolean>(false);

  const spawnCard = useCallback((onCardSpawned?: (cardX: number) => void) => {
    const selectedProject = selectRandomProject(projects, usedProjectIdsRef.current);
    if (!selectedProject) return;

    const mainBounds = getMainElementBounds();
    const card = createFallingCard(selectedProject, headerBottomRef.current, mainBounds);

    cardsRef.current.push(card);
    lastCardRef.current = card; // 마지막 카드 추적
    
    // 카드 생성 위치를 콜백으로 전달
    if (onCardSpawned) {
      onCardSpawned(card.x);
    }
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
    const footerTop = window.innerHeight; // footer는 화면 하단

    cardsRef.current = cardsRef.current.filter((card) => {
      card.y += card.speed;
      card.rotation += card.rotationSpeed;

      // 마지막 카드가 footer에 닿았는지 확인
      if (lastCardRef.current && card.id === lastCardRef.current.id && !lastCardReachedFooterRef.current) {
        if (card.y + card.height >= footerTop) {
          lastCardReachedFooterRef.current = true;
          if (onLastCardReachedFooter) {
            onLastCardReachedFooter();
          }
        }
      }

      // 화면 밖으로 나간 카드 제거
      return card.y <= mainBounds.top + mainBounds.height + cardRemovalOffset;
    });

    renderCards();
    animationRef.current = requestAnimationFrame(animate);
  }, [isVisible, renderCards, cardRemovalOffset, onLastCardReachedFooter]);

  useEffect(() => {
    spawnCardRef.current = (onSpawned?: (cardX: number) => void) => {
      spawnCard(onSpawned ?? onCardSpawned);
    };
  }, [spawnCard, onCardSpawned]);

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
  const [glowPosition, setGlowPosition] = useState<number | null>(null); // 카드 생성 위치 (x 좌표)
  const triggerHeaderGlowRef = useRef<((cardX?: number) => void) | null>(null);

  const triggerHeaderGlow = useCallback((cardX?: number) => {
    setGlowPosition(cardX ?? null);
    setHeaderGlow(true);
    setTimeout(() => {
      setHeaderGlow(false);
      setTimeout(() => setGlowPosition(null), 100); // 글로우가 사라진 후 위치 리셋
    }, 300);
  }, []);

  useEffect(() => {
    triggerHeaderGlowRef.current = triggerHeaderGlow;
  }, [triggerHeaderGlow]);

  return { headerGlow, glowPosition, triggerHeaderGlowRef };
};
