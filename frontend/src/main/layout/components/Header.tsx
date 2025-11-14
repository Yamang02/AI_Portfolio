import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { useTheme } from '@shared/providers/ThemeProvider';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
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
          href="#top"
          className="font-bold text-lg text-text-primary cursor-pointer focus:outline-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          onClick={e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Yamang02's Portfolio Site
        </a>
        {/* 우측: 네비게이션 */}
        <div className="flex items-center gap-6">
          <a 
            href="#project" 
            className="text-sm text-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const projectSection = document.getElementById('project');
              if (projectSection) {
                projectSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Project
          </a>
          <a 
            href="#experience" 
            className="text-sm text-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const experienceSection = document.getElementById('experience');
              if (experienceSection) {
                experienceSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Career
          </a>
          <a 
            href="#education" 
            className="text-sm text-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const educationSection = document.getElementById('education');
              if (educationSection) {
                educationSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Education
          </a>
          <a 
            href="#certification" 
            className="text-sm text-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const certificationSection = document.getElementById('certification');
              if (certificationSection) {
                certificationSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Certification
          </a>
          
          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleTheme}
            className="text-sm text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer flex items-center gap-1 p-2 rounded-md hover:bg-surface-elevated"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
            <span className="hidden sm:inline">{theme === 'dark' ? '라이트' : '다크'}</span>
          </button>

          {/* 어드민 진입점 */}
          <a 
            href="/admin/login" 
            className="text-sm text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer flex items-center gap-1"
            title="관리자 로그인"
          >
            <SettingOutlined className="text-base" />
            <span className="hidden sm:inline">Admin</span>
          </a>
        </div>
      </nav>
    </header>
  );
};

export { Header }; 