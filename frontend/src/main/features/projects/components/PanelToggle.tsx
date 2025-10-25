import React from 'react';

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

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const PanelToggle: React.FC<PanelToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-24 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-50`}
      aria-label={isOpen ? '히스토리 패널 닫기' : '히스토리 패널 열기'}
    >
      {isOpen ? <CloseIcon /> : <ClockIcon />}
    </button>
  );
};

export { PanelToggle }; 