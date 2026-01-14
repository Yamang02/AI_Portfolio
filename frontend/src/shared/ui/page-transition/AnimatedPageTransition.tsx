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

  // 챗봇 페이지만 높이를 100vh로 고정
  useEffect(() => {
    if (isChatPage && containerRef.current) {
      containerRef.current.style.height = '100vh';
    }
  }, [isChatPage]);

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
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
      };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          style={{
            width: '100%',
            position: 'relative',
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
