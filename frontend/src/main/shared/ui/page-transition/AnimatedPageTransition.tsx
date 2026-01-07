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

  // 페이지 전환 시 스크롤 위치를 상단으로 복원
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // 애니메이션 variants (좌우 슬라이드 효과)
  const pageVariants = {
    initial: {
      opacity: 1,
      x: '100%', // 오른쪽에서 시작
    },
    animate: {
      opacity: 1,
      x: 0, // 중앙으로 이동
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const, // 커스텀 이징 (부드러운 느낌)
      },
    },
    exit: {
      opacity: 1,
      x: '-100%', // 왼쪽으로 사라짐
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
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ children }) => {
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);
  const exitPathnameRef = useRef<string>(location.pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // 페이지 전환 시 스크롤 위치를 상단으로 복원
  // exit 애니메이션을 위해 이전 경로를 별도로 저장
  useEffect(() => {
    // exit 애니메이션에서 사용할 이전 경로 저장 (업데이트 전 값)
    exitPathnameRef.current = prevPathnameRef.current;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // 홈페이지로 이동하는지 확인
  const isNavigatingToHome = location.pathname === '/';
  
  // 스크롤 정책 결정: 홈페이지는 scroll-driven animation을 위해 window 스크롤 필요
  // 챗봇 페이지는 내부 스크롤이 필요하므로 overflow: hidden 유지
  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';

  // 페이지 높이를 추적하여 부모 컨테이너 높이 설정
  // 홈페이지는 이 로직을 건너뛰므로 여기서는 다른 페이지만 처리
  useEffect(() => {
    // 홈페이지는 조기 리턴으로 이 로직을 건너뜀
    if (isHomePage) {
      return;
    }

    const updateContainerHeight = () => {
      if (pageRef.current && containerRef.current) {
        const pageHeight = pageRef.current.scrollHeight;
        containerRef.current.style.height = `${pageHeight}px`;
      }
    };

    // 초기 높이 설정
    const timer = setTimeout(updateContainerHeight, 100);

    // 리사이즈 및 이미지 로드 후 높이 업데이트
    window.addEventListener('resize', updateContainerHeight);
    
    // 이미지 로드 후 높이 재계산
    const images = Array.from(document.images);
    const imageLoadPromises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      setTimeout(updateContainerHeight, 100);
    });

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(updateContainerHeight);
    if (pageRef.current) {
      observer.observe(pageRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateContainerHeight);
      observer.disconnect();
    };
  }, [location.pathname, isHomePage]);
  
  // 홈페이지는 페이지 전환 효과를 완전히 제외하고 자연스러운 문서 플로우 유지
  // scroll-driven animation과 충돌을 방지하기 위함
  if (isHomePage) {
    return (
      <Routes location={location}>
        {children}
      </Routes>
    );
  }

  // 다른 페이지: 페이지 전환 애니메이션 적용
  const pageVariants = {
    initial: {
      opacity: 0,
      x: '30%', // 오른쪽에서 등장
    },
    animate: {
      opacity: 1,
      x: 0, // 중앙으로 이동
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      x: '-30%', // 왼쪽으로 퇴장
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        overflow: 'hidden', 
        width: '100%', 
        position: 'relative',
        minHeight: '100%',
      }}
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
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
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
