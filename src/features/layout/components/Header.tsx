import React from 'react';
import { appConfig } from '../../../shared';

const Header: React.FC = () => {
  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* 좌측: 포트폴리오 이름 */}
        <a
          href="#top"
          className="font-bold text-lg text-black cursor-pointer focus:outline-none"
          onClick={e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {appConfig.app.developerName}'s portfolio
        </a>
        {/* 우측: 네비게이션 + Resume 버튼 */}
        <div className="flex items-center gap-6">
          <a href="#project" className="text-sm text-black hover:text-gray-700 transition-colors">Project</a>
          <a href="#experience" className="text-sm text-black hover:text-gray-700 transition-colors">Experience</a>
          <a href="#certification" className="text-sm text-black hover:text-gray-700 transition-colors">Certification</a>
        </div>
      </nav>
    </header>
  );
};

export default Header; 