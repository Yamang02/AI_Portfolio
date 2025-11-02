import React from 'react';

interface ProjectDetailSidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ProjectDetailSidebarToggle: React.FC<ProjectDetailSidebarToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-24 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-50`}
      aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
};

export { ProjectDetailSidebarToggle };
