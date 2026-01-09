import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import { useTheme } from '@/shared/hooks/useTheme';

const THEME_TOGGLE_FIRST_CLICK_KEY = 'portfolio-theme-toggle-first-click';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    // 최초 클릭 여부 확인
    const hasClickedBefore = localStorage.getItem(THEME_TOGGLE_FIRST_CLICK_KEY);
    
    if (!hasClickedBefore) {
      // 최초 클릭 시 이스터에그 버튼 표시 플래그 저장
      localStorage.setItem(THEME_TOGGLE_FIRST_CLICK_KEY, 'true');
      // 이벤트를 발생시켜 다른 컴포넌트에 알림
      window.dispatchEvent(new CustomEvent('easterEggButtonRevealed'));
    }
    
    // 테마 토글 실행
    toggleTheme();
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 섹션으로 스크롤하는 함수
  const scrollToSection = (sectionId: string) => {
    // 홈 페이지가 아닌 경우 홈으로 이동 후 스크롤
    if (location.pathname !== '/') {
      navigate('/');
      // 홈 페이지로 이동 후 스크롤 (약간의 지연 필요)
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'project', label: 'Project' },
    { id: 'experience', label: 'Career' },
    { id: 'education', label: 'Education' },
    { id: 'certification', label: 'Certification' },
  ];

  return (
    <header 
      className="w-full sticky top-0 z-50 border-b transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* 좌측: 포트폴리오 이름 */}
        <a
          href="/"
          className="font-bold text-lg text-text-primary cursor-pointer focus:outline-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          onClick={e => {
            e.preventDefault();
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
        >
          Yamang02's Portfolio Site
        </a>
        
        {/* 우측: 아이콘 버튼들과 햄버거 메뉴 */}
        <div className="flex items-center gap-4">
          {/* 다크모드 토글 버튼 (아이콘만) */}
          <button
            onClick={handleThemeToggle}
            className="transition-colors cursor-pointer p-2 rounded-md hover:bg-surface-elevated text-text-primary"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* 어드민 진입점 (아이콘만) */}
          <a 
            href="/admin/login" 
            className="text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer p-2 rounded-md hover:bg-surface-elevated flex items-center"
            title="관리자 로그인"
          >
            <SettingOutlined className="text-lg" />
          </a>

          {/* 햄버거 메뉴 버튼 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer p-2 rounded-md hover:bg-surface-elevated"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                )}
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* 메뉴 링크들 */}
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full px-4 py-2.5 text-left text-sm text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-elevated transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export { Header };