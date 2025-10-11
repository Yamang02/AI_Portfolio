import React from 'react';

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
          Yamang02's Portfolio Site
        </a>
        {/* 우측: 네비게이션 */}
        <div className="flex items-center gap-6">
          <a 
            href="#project" 
            className="text-sm text-black hover:text-gray-700 transition-colors cursor-pointer"
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
            className="text-sm text-black hover:text-gray-700 transition-colors cursor-pointer"
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
            className="text-sm text-black hover:text-gray-700 transition-colors cursor-pointer"
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
            className="text-sm text-black hover:text-gray-700 transition-colors cursor-pointer"
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
        </div>
      </nav>
    </header>
  );
};

export default Header; 