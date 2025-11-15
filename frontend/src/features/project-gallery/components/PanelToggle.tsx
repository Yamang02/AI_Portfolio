import React from 'react';
import { useEasterEggStore } from '@features/easter-eggs/store/easterEggStore';

interface PanelToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="12" x2="12" y2="7" /> {/* 시침 */}
    <line x1="12" y1="12" x2="16" y2="12" /> {/* 분침 */}
  </svg>
);

const DocumentListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const PanelToggle: React.FC<PanelToggleProps> = ({ isOpen, onToggle }) => {
  const { isEasterEggMode } = useEasterEggStore();
  
  const getIcon = () => {
    if (isOpen) return <CloseIcon />;
    return isEasterEggMode ? <DocumentListIcon /> : <ClockIcon />;
  };

  const getAriaLabel = () => {
    if (isOpen) {
      return isEasterEggMode ? '이스터에그 목록 패널 닫기' : '히스토리 패널 닫기';
    }
    return isEasterEggMode ? '이스터에그 목록 패널 열기' : '히스토리 패널 열기';
  };

  const getColorClass = () => {
    if (isEasterEggMode) {
      return 'bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 dark:hover:bg-yellow-700';
    }
    return 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600';
  };

  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-24 ${getColorClass()} p-4 rounded-full shadow-lg transition-colors duration-200 z-50`}
      aria-label={getAriaLabel()}
    >
      {getIcon()}
    </button>
  );
};

export { PanelToggle }; 