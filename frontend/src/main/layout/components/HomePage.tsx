import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { PortfolioSection } from '@/main/features/project-gallery';
import { SpeedDialFab } from '@/shared/ui';
import { checkEasterEggTrigger, useEasterEggStore, triggerEasterEggs } from '@/main/features/easter-eggs';
import { useFeatureAvailability } from '../../shared/lib/hooks/useFeatureAvailability';
import { Button } from '@/design-system';

interface HomePageProps {
  projects: any[];
  experiences: any[];
  educations: any[];
  certifications: any[];
  isLoading: boolean;
  loadingStates: any;
  isHistoryPanelOpen: boolean;
  onHistoryPanelToggle: () => void;
}

// 홈페이지 스크롤 위치 저장 (전역 변수로 변경)
if (typeof window !== 'undefined' && window.__homeScrollPosition === undefined) {
  window.__homeScrollPosition = 0;
}

const HomePage: React.FC<HomePageProps> = ({
  projects,
  experiences,
  educations,
  certifications,
  isLoading,
  loadingStates,
  isHistoryPanelOpen,
  onHistoryPanelToggle
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const { triggerEasterEgg, isEasterEggMode, activeEffects } = useEasterEggStore();
  const { canUseEasterEgg } = useFeatureAvailability();
  const wasPanelOpenRef = useRef<boolean>(false);

  // 마운트 시 스크롤 위치 복원
  useEffect(() => {
    if (location.state?.fromProject) {
      // 프로젝트 상세에서 돌아온 경우 스크롤 위치 복원
      const savedPosition = window.__homeScrollPosition || 0;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      });
    } else {
      // 다른 경로에서 온 경우 최상단으로
      window.__homeScrollPosition = 0;
      window.scrollTo(0, 0);
    }
  }, [location.state]);

  // 언마운트 시 스크롤 위치 저장 (fallback)
  useEffect(() => {
    return () => {
      if (window.__homeScrollPosition === 0 || window.__homeScrollPosition === undefined) {
        window.__homeScrollPosition = window.pageYOffset;
      }
    };
  }, []);

  // ESC 키 매핑: 열린 패널 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 히스토리 패널이 열려있으면 닫기
        if (isHistoryPanelOpen) {
          onHistoryPanelToggle();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isHistoryPanelOpen, onHistoryPanelToggle]);

  // 매트릭스 이스터에그 동작 시 목록 패널 제어
  useEffect(() => {
    const hasMatrixEffect = activeEffects.some(effect => effect.id === 'matrix-effect');

    if (hasMatrixEffect) {
      // 매트릭스 이스터에그가 시작되면 패널이 열려있었는지 저장하고 닫기
      if (isHistoryPanelOpen) {
        wasPanelOpenRef.current = true;
        onHistoryPanelToggle();
      } else {
        wasPanelOpenRef.current = false;
      }
    } else {
      // 매트릭스 이스터에그가 종료되면 이전에 열려있었다면 다시 열기
      if (wasPanelOpenRef.current && !isHistoryPanelOpen) {
        wasPanelOpenRef.current = false;
        // 약간의 지연을 두어 이스터에그 종료 애니메이션이 완료된 후 열기
        const timeoutId = setTimeout(() => {
          onHistoryPanelToggle();
        }, 500);
        
        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [activeEffects, isHistoryPanelOpen, onHistoryPanelToggle]);

  // ChatInputBar 클릭 시 /chat 페이지로 이동
  const handleChatInputClick = () => {
    navigate('/chat');
  };

  // Speed Dial 액션 정의 (이스터에그 모드에 따라 버튼 변경)
  const speedDialActions = [
    {
      icon: isEasterEggMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      label: isEasterEggMode ? '이스터에그 목록' : '프로젝트 히스토리',
      onClick: onHistoryPanelToggle,
      color: isEasterEggMode ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-orange-500 text-white hover:bg-orange-600'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      label: 'AI 챗봇',
      onClick: () => navigate('/chat'),
      color: 'bg-blue-500 text-white hover:bg-blue-600'
    }
  ];

  return (
    <>
      <HeroSection />
      <main className="container mx-auto px-4 py-8 md:py-12 pb-32">
        <PortfolioSection 
          projects={projects}
          experiences={experiences}
          educations={educations}
          certifications={certifications}
          isLoading={isLoading}
          loadingStates={loadingStates}
          isHistoryPanelOpen={isHistoryPanelOpen}
          onHistoryPanelToggle={onHistoryPanelToggle}
        />
      </main>

      {/* 하단 고정 채팅 입력창 with Speed Dial - 클릭 시 /chat으로 이동 */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t z-40 transition-colors cursor-pointer"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        onClick={handleChatInputClick}
      >
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="프로젝트에 대해 궁금한 점을 물어보세요... (클릭하여 채팅 페이지로 이동)"
              readOnly
              className="flex-1 px-4 py-3 border rounded-full bg-surface border-border text-text-primary placeholder:text-text-muted cursor-pointer"
            />
            <div 
              className="flex-shrink-0 transition-transform duration-300 ease-in-out"
            >
              <SpeedDialFab actions={speedDialActions} onOpenChange={setIsFabOpen} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { HomePage };
