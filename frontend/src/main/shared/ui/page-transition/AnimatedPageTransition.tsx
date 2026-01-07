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
    
    // 스크롤 위치를 상단으로 복원
    window.scrollTo({ top: 0, behavior: 'smooth' });
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // 스크롤 정책 결정: 홈페이지는 scroll-driven animation을 위해 window 스크롤 필요
  // 챗봇 페이지는 내부 스크롤이 필요하므로 overflow: hidden 유지
  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';

  // 페이지 높이를 추적하여 부모 컨테이너 높이 설정
  // 홈페이지와 챗봇 페이지는 이 로직을 건너뜀
  useEffect(() => {
    // 홈페이지는 조기 리턴으로 이 로직을 건너뜀
    if (isHomePage) {
      // 홈페이지로 이동할 때 높이를 명시적으로 초기화
      if (containerRef.current) {
        containerRef.current.style.height = 'auto';
      }
      return;
    }

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
        const finalHeight = Math.max(pageHeight, lastElementBottom);
        
        containerRef.current.style.height = `${finalHeight}px`;
      }
    };

    // 초기 높이 설정 (여러 번 재계산하여 정확도 향상)
    const timer1 = setTimeout(updateContainerHeight, 50);
    const timer2 = setTimeout(updateContainerHeight, 200);
    const timer3 = setTimeout(updateContainerHeight, 500);

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
      setTimeout(updateContainerHeight, 300);
    });

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(() => {
      // DOM 변경 시 약간의 지연을 두고 재계산
      setTimeout(updateContainerHeight, 50);
    });
    if (pageRef.current) {
      observer.observe(pageRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', updateContainerHeight);
      observer.disconnect();
    };
  }, [location.pathname, isHomePage, isChatPage]);
  
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
