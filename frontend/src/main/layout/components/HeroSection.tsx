import React, { useState, useEffect } from 'react';
import { ContactModal } from '../../components/common/Modal';
import { CoreTechStackSection } from '@features/introduction';
import { TechStackTetris } from '../../components/common/TechStackTetris';
import { TechStackApi } from '../../services/techStackApi';
import { TechStackMetadata } from '../../entities/techstack';
import { useClickCounter } from '@features/easter-eggs';

const HeroSection: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [techs, setTechs] = useState<TechStackMetadata[]>([]);
  const [giantBlockTrigger, setGiantBlockTrigger] = useState(0);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  // 이스터에그: 이름 5번 클릭
  const { handleClick: handleNameClick } = useClickCounter({
    easterEggId: 'name-click-5',
    targetCount: 5,
    timeWindow: 3000,
  });

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const data = await TechStackApi.getCoreTechStackMetadata();
        setTechs(data);
      } catch (err) {
        console.error('기술 스택 조회 실패:', err);
      }
    };
    fetchTechs();
  }, []);

  // 이스터에그 시스템에서 초거대 블록 생성 요청 수신
  useEffect(() => {
    const handleGiantBlockTrigger = () => {
      setGiantBlockTrigger(prev => prev + 1);
    };

    window.addEventListener('triggerGiantBlock', handleGiantBlockTrigger);
    return () => {
      window.removeEventListener('triggerGiantBlock', handleGiantBlockTrigger);
    };
  }, []);

  // 애니메이션 토글 핸들러
  const handleAnimationToggle = () => {
    setIsAnimationEnabled(prev => !prev);
  };

  return (
    <section className="w-full py-16 bg-background relative overflow-hidden transition-colors">
      {/* 테트리스 애니메이션 배경 - 데이터 로딩 후 표시 */}
      {techs.length > 0 && (
        <TechStackTetris 
          techs={techs} 
          giantBlockTrigger={giantBlockTrigger}
          isAnimationEnabled={isAnimationEnabled}
          onAnimationToggle={handleAnimationToggle}
        />
      )}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* 글라스모피즘 카드 컨테이너 - 버튼까지 포함 */}
        <div className="backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/10 dark:shadow-black/30 mb-8 max-w-lg mx-auto relative overflow-hidden bg-surface/80 dark:bg-surface-elevated/80 border border-border/50">
          {/* 그라데이션 배경 - 중앙은 불투명, 경계는 투명 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 dark:from-surface-elevated/30 via-white/20 dark:via-surface-elevated/20 to-white/5 dark:to-surface-elevated/5 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/25 dark:from-surface-elevated/25 via-transparent to-white/10 dark:to-surface-elevated/10 rounded-2xl"></div>
          {/* 테두리 그라데이션 */}
          <div className="absolute inset-0 rounded-2xl border border-white/20 dark:border-border/50"></div>
          {/* 컨텐츠 영역 */}
          <div className="relative z-10">
          <h2 
            className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3 tracking-wider drop-shadow-lg select-none"
            onClick={handleNameClick}
          >
            이정준
          </h2>
          <div className="text-2xl md:text-3xl font-bold text-text-primary mb-3 drop-shadow-md">Software Engineer</div>
          <p className="text-text-secondary text-base drop-shadow-sm mb-6">
            도전을 두려워하지 않는 개발자 이정준입니다.
          </p>
          <div className="flex justify-center gap-4">
          <a href="https://github.com/Yamang02" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-colors">
            <span className="sr-only">GitHub</span>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.45 24 17.12 24 12.02 24 5.74 18.27.5 12 .5z"/></svg>
          </a>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-colors"
          >
            <span className="sr-only">Email</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="m22 7-8.97 6.48a2 2 0 0 1-2.06 0L2 7"/></svg>
          </button>
          </div>
          </div>
        </div>

        {/* 핵심 기술 스택 섹션 */}
        <div className="mt-12">
          <CoreTechStackSection />
        </div>
      </div>

      {/* 문의 모달 */}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
};

export { HeroSection }; 