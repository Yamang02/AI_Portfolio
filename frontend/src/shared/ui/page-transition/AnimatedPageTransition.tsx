import React, { useEffect, useRef } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPageTransitionProps {
  children: React.ReactNode;
}

/**
 * 페이지 전환 애니메이션 컴포넌트
 * 
 * 페이지 전환 시 좌우 슬라이드 효과를 제공합니다.
 * 기존 페이지는 왼쪽으로 사라지고, 새 페이지는 오른쪽에서 나타납니다.
 */
export const AnimatedPageTransition: React.FC<AnimatedPageTransitionProps> = ({
  children,
}) => {
  const location = useLocation();

  // 페이지 전환 시 스크롤 위치를 상단으로 복원 (애니메이션 완료 후)
  useEffect(() => {
    // 애니메이션 완료 후 스크롤 위치를 상단으로 복원
    // animate transition duration (0.4s) + 약간의 여유 시간
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
    
    return () => {
      clearTimeout(scrollTimer);
    };
  }, [location.pathname]);

  // 애니메이션 variants (좌우 슬라이드 효과만)
  const pageVariants = {
    initial: {
      opacity: 1,
      x: '100%', // 오른쪽에서 시작
      y: 0, // 수직 이동 방지
    },
    animate: {
      opacity: 1,
      x: 0, // 중앙으로 이동
      y: 0, // 수직 이동 방지
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const, // 커스텀 이징 (부드러운 느낌)
      },
    },
    exit: {
      opacity: 1,
      x: '-100%', // 왼쪽으로 사라짐
      y: 0, // 수직 이동 방지
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        style={{
          width: '100%',
          minHeight: '100%',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * AnimatedRoutes 컴포넌트
 * Routes를 감싸서 각 Route에 좌우 슬라이드 애니메이션을 적용합니다.
 * 기존 페이지는 왼쪽으로 사라지고, 새 페이지는 오른쪽에서 나타납니다.
 */
interface AnimatedRoutesProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingStates?: {
    projects?: boolean;
    experiences?: boolean;
    educations?: boolean;
    certifications?: boolean;
  };
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ 
  children,
  isLoading = false,
  loadingStates,
}) => {
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);
  const exitPathnameRef = useRef<string>(location.pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 스크롤 정책 결정: 챗봇 페이지는 내부 스크롤이 필요하므로 overflow: hidden 유지
  const isChatPage = location.pathname === '/chat';

  // 페이지 전환 시 스크롤 위치를 상단으로 복원 및 컨테이너 높이 초기화
  // exit 애니메이션을 위해 이전 경로를 별도로 저장
  useEffect(() => {
    // exit 애니메이션에서 사용할 이전 경로 저장 (업데이트 전 값)
    exitPathnameRef.current = prevPathnameRef.current;
    
    // 챗봇 페이지에서 다른 페이지로 이동할 때 컨테이너 높이 초기화
    const wasChatPage = prevPathnameRef.current === '/chat';
    const isNowChatPage = location.pathname === '/chat';
    
    if (wasChatPage && !isNowChatPage && containerRef.current) {
      // 챗봇 페이지에서 나갈 때 높이를 초기화하여 스크롤 제한 해제
      containerRef.current.style.height = 'auto';
    }
    
    // 애니메이션 완료 후 스크롤 위치를 상단으로 복원
    // animate transition duration (0.5s) + 약간의 여유 시간
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
    
    prevPathnameRef.current = location.pathname;
    
    return () => {
      clearTimeout(scrollTimer);
    };
  }, [location.pathname]);

  // 페이지 높이를 추적하여 부모 컨테이너 높이 설정
  // 챗봇 페이지는 이 로직을 건너뜀 (홈페이지는 이미 조기 리턴으로 건너뜀)
  useEffect(() => {
    // 챗봇 페이지는 높이를 100vh로 고정
    if (isChatPage) {
      if (containerRef.current) {
        containerRef.current.style.height = '100vh';
      }
      return;
    }

    // 다른 페이지: 동적 높이 추적
    const updateContainerHeight = () => {
      if (pageRef.current && containerRef.current) {
        // 로딩 중일 때는 최소 높이만 설정하고 정확한 계산은 지연
        if (isLoading) {
          // 최소 높이를 설정하여 스크롤 가능하도록 보장
          const minHeight = Math.max(
            window.innerHeight,
            pageRef.current.scrollHeight || 0
          );
          containerRef.current.style.height = `${minHeight}px`;
          return;
        }

        // 데이터 로드 완료 후 정확한 높이 계산
        // requestAnimationFrame을 사용하여 렌더링 완료 후 계산
        requestAnimationFrame(() => {
          if (!pageRef.current || !containerRef.current) return;

          // scrollHeight와 offsetHeight 중 더 큰 값을 사용하여 정확한 높이 계산
          const scrollHeight = pageRef.current.scrollHeight;
          const offsetHeight = pageRef.current.offsetHeight;
          const pageHeight = Math.max(scrollHeight, offsetHeight);
          
          // 추가로 실제 렌더링된 콘텐츠의 높이를 확인
          const lastElement = pageRef.current.lastElementChild as HTMLElement;
          const lastElementBottom = lastElement 
            ? lastElement.offsetTop + lastElement.offsetHeight 
            : 0;
          
          // 마지막 요소의 하단 위치와 scrollHeight 중 더 큰 값 사용
          const finalHeight = Math.max(pageHeight, lastElementBottom, window.innerHeight);
          
          containerRef.current.style.height = `${finalHeight}px`;
        });
      }
    };

    // NOTE:
    // 타이밍 기반(setTimeout n ms) 재계산은 환경(성능/네트워크/리소스)에 따라 흔들린다.
    // ResizeObserver / load(캡처) / fonts.ready 같은 이벤트 기반 트리거 + rAF 배치로 통일한다.
    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (isLoading) return;
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateContainerHeight();
      });
    };

    // 로딩 상태가 변경될 때 높이 재계산
    if (!isLoading) {
      // 데이터 로드 완료 직후 1회, 다음 페인트에 1회(프레임 동기화)만 수행
      updateContainerHeight();
      scheduleUpdate();
    } else {
      // 로딩 중일 때는 최소 높이만 설정
      updateContainerHeight();
    }

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', updateContainerHeight);

    // ResizeObserver로 더 정확한 높이 감지
    if (pageRef.current && 'ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        scheduleUpdate();
      });
      resizeObserverRef.current.observe(pageRef.current);
    }

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(() => {
      scheduleUpdate();
    });
    if (pageRef.current) {
      observer.observe(pageRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    // 이미지/iframe 등 리소스 로드(버블 X)도 캡처 단계에서 감지 가능
    const handleResourceLoad = () => scheduleUpdate();
    if (pageRef.current) {
      pageRef.current.addEventListener('load', handleResourceLoad, true);
      pageRef.current.addEventListener('error', handleResourceLoad, true);
    }

    // 폰트 로딩으로 인한 레이아웃 변화 대응
    // (FontFaceSet이 없는 환경에서는 그냥 무시)
    const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
    fontsReady?.then(() => scheduleUpdate()).catch(() => {});

    return () => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', updateContainerHeight);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      observer.disconnect();
      if (pageRef.current) {
        pageRef.current.removeEventListener('load', handleResourceLoad, true);
        pageRef.current.removeEventListener('error', handleResourceLoad, true);
      }
    };
  }, [location.pathname, isChatPage, isLoading, loadingStates]);

  // 다른 페이지: 페이지 전환 애니메이션 적용 (좌우 전환만)
  const pageVariants = {
    initial: {
      opacity: 0,
      x: '100%', // 오른쪽에서 등장
      y: 0, // 수직 이동 방지
    },
    animate: {
      opacity: 1,
      x: 0, // 중앙으로 이동
      y: 0, // 수직 이동 방지
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      x: '-100%', // 왼쪽으로 퇴장
      y: 0, // 수직 이동 방지
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  // 챗봇 페이지는 높이를 100vh로 고정하여 윈도우 스크롤 방지
  const containerStyle: React.CSSProperties = isChatPage 
    ? {
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        height: '100vh',
      }
    : {
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        minHeight: '100%',
      };

  return (
    <div 
      ref={containerRef}
      style={containerStyle}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          ref={pageRef}
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          style={{
            width: '100%',
            position: isChatPage ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: isChatPage ? '100%' : 'auto',
          }}
        >
          <Routes location={location}>
            {children}
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
