import React, { useState } from 'react';
import { ContactModal } from '../../../../shared/ui/modal';

const HeroSection: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  // 이스터에그: 이정준 이름 클릭 핸들러
  const handleNameClick = () => {
    const currentTime = Date.now();
    
    // 3초 내에 연속 클릭인지 확인
    if (currentTime - lastClickTime > 3000) {
      setClickCount(0); // 3초 지나면 카운터 리셋
    }
    
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    setLastClickTime(currentTime);
  };

  // 애니메이션 토글 핸들러
  const handleAnimationToggle = () => {
    setIsAnimationEnabled(prev => !prev);
  };

  return (
    <section id="top" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 좌측: 텍스트 영역 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                안녕하세요,{' '}
                <span 
                  className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
                  onClick={handleNameClick}
                  title="클릭해보세요! 🎮"
                >
                  이정준
                </span>
                입니다
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                풀스택 개발자로서 사용자 중심의 웹 애플리케이션을 만들고 있습니다.
                <br />
                <span className="text-blue-600 font-semibold">React, Spring Boot, Python</span>을 주로 사용하며,
                <br />
                끊임없이 학습하고 성장하는 개발자입니다.
              </p>
            </div>

            {/* 핵심 기술 스택 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">핵심 기술 스택</h3>
              <p className="text-gray-600">React, TypeScript, Node.js, Python 등</p>
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                📧 연락하기
              </button>
              <button
                onClick={() => {
                  const projectSection = document.getElementById('project');
                  if (projectSection) {
                    projectSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                🚀 프로젝트 보기
              </button>
            </div>

            {/* 애니메이션 토글 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnimationToggle}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isAnimationEnabled ? '🎮 애니메이션 끄기' : '🎮 애니메이션 켜기'}
              </button>
              <span className="text-xs text-gray-400">
                (클릭 횟수: {clickCount})
              </span>
            </div>
          </div>

          {/* 우측: 테트리스 애니메이션 */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">기술 스택 테트리스</h3>
                <p className="text-gray-600">주요 기술들을 테트리스로 표현해보았습니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 연락 모달 */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
};

export default HeroSection;
